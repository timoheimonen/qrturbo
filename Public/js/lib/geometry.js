// QRTurbo.app - SVG geometry flattener (QRTurboGeometry)
// Pure, loaded lazily for PDF and EPS: turns a parsed (QRTurboSvg) SVG tree
// into a Drawing of filled paths, strokes, images and text in absolute SVG
// user units (y down), the input of QRTurboPdf and QRTurboEps. Also holds
// the helpers both writers share (writerKit).
//
// Segment: ['M', x, y] | ['L', x, y] | ['C', x1, y1, x2, y2, x, y] | ['Z']
// Matrix:  [a, b, c, d, e, f], mapping (x, y) to (a*x + c*y + e, b*x + d*y + f)
(function () {
    'use strict';

    const KAPPA = 0.5522847498;
    const DEG = Math.PI / 180;
    const HALF_PI = Math.PI / 2;
    const IDENTITY = Object.freeze([1, 0, 0, 1, 0, 0]);
    const MAX_DEPTH = 64;
    const NUMBER_RE = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
    const SEPARATOR_RE = /[\s]*,?[\s]*/y;
    const SPACE_RE = /\s*/y;
    const TRANSFORM_RE = /\s*,?\s*([A-Za-z]+)\s*\(([^)]*)\)/y;
    const URL_RE = /^url\(\s*(['"]?)#([^'")\s]+)\1\s*\)\s*(.*)$/;
    const LENGTH_RE = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*(px|pt|pc|mm|cm|in|em|ex|%)?\s*$/i;
    const PAR_RE = /^\s*(?:defer\s+)?(none|x(?:Min|Mid|Max)Y(?:Min|Mid|Max))(?:\s+(meet|slice))?\s*$/;
    const PATH_PARAMS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 };
    const UNIT_PX = { px: 1, pt: 96 / 72, pc: 16, mm: 96 / 25.4, cm: 96 / 2.54, in: 96 };
    // Elements that never paint by themselves.
    const NON_RENDERING = new Set([
        'defs', 'clipPath', 'mask', 'pattern', 'marker', 'symbol', 'linearGradient', 'radialGradient',
        'stop', 'filter', 'style', 'script', 'title', 'desc', 'metadata', 'font', 'font-face', 'foreignObject'
    ]);
    const SHAPES = new Set(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path']);
    // Inherited presentation properties the flattener understands.
    const INHERITED = [
        'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'clip-rule',
        'font-size', 'text-anchor', 'color', 'visibility'
    ];
    const PAINT_PROPERTIES = new Set(['fill', 'stroke', 'color']);
    const DEFAULT_STYLE = Object.freeze({
        fill: 'black',
        'fill-rule': 'nonzero',
        'fill-opacity': '1',
        stroke: 'none',
        'stroke-width': '1',
        'stroke-opacity': '1',
        'clip-rule': 'nonzero',
        'font-size': '16',
        'text-anchor': 'start',
        color: 'black',
        visibility: 'visible'
    });
    const NAMED_COLORS = {
        black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], lime: [0, 255, 0], green: [0, 128, 0],
        blue: [0, 0, 255], yellow: [255, 255, 0], cyan: [0, 255, 255], aqua: [0, 255, 255],
        magenta: [255, 0, 255], fuchsia: [255, 0, 255], gray: [128, 128, 128], grey: [128, 128, 128],
        silver: [192, 192, 192], maroon: [128, 0, 0], olive: [128, 128, 0], teal: [0, 128, 128],
        navy: [0, 0, 128], purple: [128, 0, 128], orange: [255, 165, 0]
    };

    // Parsed style attributes, per node, without touching the nodes.
    const STYLE_CACHE = new WeakMap();

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    // Rounds to 3 decimals; never returns -0.
    function round3(value) {
        const rounded = Math.round(value * 1000) / 1000;
        return rounded === 0 ? 0 : rounded;
    }

    function isFlagSet(value) {
        if (typeof value === 'boolean') return value;
        return Number(value) !== 0 && !Number.isNaN(Number(value));
    }

    // ---- matrices --------------------------------------------------------

    function multiply(m, n) {
        return [
            m[0] * n[0] + m[2] * n[1],
            m[1] * n[0] + m[3] * n[1],
            m[0] * n[2] + m[2] * n[3],
            m[1] * n[2] + m[3] * n[3],
            m[0] * n[4] + m[2] * n[5] + m[4],
            m[1] * n[4] + m[3] * n[5] + m[5]
        ];
    }

    function isIdentity(m) {
        return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;
    }

    function translation(x, y) {
        return [1, 0, 0, 1, x, y];
    }

    // Exact values for multiples of 90 degrees, so no 6e-17 noise appears.
    function rotation(degrees) {
        const turn = ((degrees % 360) + 360) % 360;
        if (turn === 0) return [1, 0, 0, 1, 0, 0];
        if (turn === 90) return [0, 1, -1, 0, 0, 0];
        if (turn === 180) return [-1, 0, 0, -1, 0, 0];
        if (turn === 270) return [0, -1, 1, 0, 0, 0];
        const cos = Math.cos(degrees * DEG);
        const sin = Math.sin(degrees * DEG);
        return [cos, sin, -sin, cos, 0, 0];
    }

    // Uniform scale factor of a matrix (for stroke widths, radii, font sizes).
    function matrixScale(m) {
        return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
    }

    function transformX(m, x, y) {
        return m[0] * x + m[2] * y + m[4];
    }

    function transformY(m, x, y) {
        return m[1] * x + m[3] * y + m[5];
    }

    /**
     * @description Parses an SVG transform list (matrix, translate, scale,
     * rotate, skewX, skewY) into one matrix. Invalid lists give the identity,
     * as browsers ignore an invalid transform attribute.
     */
    function parseTransform(s) {
        const source = String(s == null ? '' : s);
        let matrix = [1, 0, 0, 1, 0, 0];
        let pos = 0;
        while (pos < source.length) {
            TRANSFORM_RE.lastIndex = pos;
            const match = TRANSFORM_RE.exec(source);
            if (!match) {
                SPACE_RE.lastIndex = pos;
                SPACE_RE.exec(source);
                if (SPACE_RE.lastIndex === source.length) break;
                return [1, 0, 0, 1, 0, 0];
            }
            pos = TRANSFORM_RE.lastIndex;
            const args = parseNumberList(match[2], true);
            if (!args) return [1, 0, 0, 1, 0, 0];
            let step = null;
            switch (match[1]) {
                case 'matrix':
                    if (args.length === 6) step = args.slice();
                    break;
                case 'translate':
                    if (args.length === 1 || args.length === 2) step = translation(args[0], args[1] || 0);
                    break;
                case 'scale':
                    if (args.length === 1 || args.length === 2) {
                        step = [args[0], 0, 0, args.length === 2 ? args[1] : args[0], 0, 0];
                    }
                    break;
                case 'rotate':
                    if (args.length === 1) step = rotation(args[0]);
                    else if (args.length === 3) {
                        step = multiply(multiply(translation(args[1], args[2]), rotation(args[0])), translation(-args[1], -args[2]));
                    }
                    break;
                case 'skewX':
                    if (args.length === 1) step = [1, 0, Math.tan(args[0] * DEG), 1, 0, 0];
                    break;
                case 'skewY':
                    if (args.length === 1) step = [1, Math.tan(args[0] * DEG), 0, 1, 0, 0];
                    break;
                default:
                    break;
            }
            if (!step) return [1, 0, 0, 1, 0, 0];
            matrix = multiply(matrix, step);
        }
        return matrix;
    }

    /**
     * @description Applies a matrix to every point of a segment list and
     * rounds the results to 3 decimals. Returns new segments.
     */
    function applyMatrix(segs, m) {
        const matrix = m || IDENTITY;
        const [a, b, c, d, e, f] = matrix;
        const out = new Array(segs.length);
        for (let i = 0; i < segs.length; i++) {
            const seg = segs[i];
            const type = seg[0];
            if (type === 'Z') {
                out[i] = ['Z'];
            } else if (type === 'C') {
                out[i] = [
                    'C',
                    round3(a * seg[1] + c * seg[2] + e), round3(b * seg[1] + d * seg[2] + f),
                    round3(a * seg[3] + c * seg[4] + e), round3(b * seg[3] + d * seg[4] + f),
                    round3(a * seg[5] + c * seg[6] + e), round3(b * seg[5] + d * seg[6] + f)
                ];
            } else {
                out[i] = [type, round3(a * seg[1] + c * seg[2] + e), round3(b * seg[1] + d * seg[2] + f)];
            }
        }
        return out;
    }

    function includePoint(bbox, x, y) {
        if (x < bbox.minX) bbox.minX = x;
        if (x > bbox.maxX) bbox.maxX = x;
        if (y < bbox.minY) bbox.minY = y;
        if (y > bbox.maxY) bbox.maxY = y;
    }

    // Parameters t in (0, 1) where one coordinate of a cubic has an extremum.
    function cubicExtrema(p0, p1, p2, p3) {
        const a = -p0 + 3 * p1 - 3 * p2 + p3;
        const b = 2 * (p0 - 2 * p1 + p2);
        const c = p1 - p0;
        const roots = [];
        if (Math.abs(a) < 1e-12) {
            if (Math.abs(b) > 1e-12) roots.push(-c / b);
        } else {
            const discriminant = b * b - 4 * a * c;
            if (discriminant >= 0) {
                const sqrt = Math.sqrt(discriminant);
                roots.push((-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a));
            }
        }
        return roots.filter(t => t > 0 && t < 1);
    }

    function cubicAt(p0, p1, p2, p3, t) {
        const u = 1 - t;
        return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    }

    // Grows bbox {minX, minY, maxX, maxY} by the exact bounds of segs under
    // matrix m (curve extrema included, control points excluded).
    function extendBounds(bbox, segs, m) {
        const matrix = m || IDENTITY;
        let px = 0;
        let py = 0;
        for (const seg of segs) {
            if (seg[0] === 'Z') continue;
            if (seg[0] === 'C') {
                const xs = [px, 0, 0, 0];
                const ys = [py, 0, 0, 0];
                for (let i = 1; i <= 3; i++) {
                    xs[i] = transformX(matrix, seg[2 * i - 1], seg[2 * i]);
                    ys[i] = transformY(matrix, seg[2 * i - 1], seg[2 * i]);
                }
                for (const t of cubicExtrema(xs[0], xs[1], xs[2], xs[3])) {
                    includePoint(bbox, cubicAt(xs[0], xs[1], xs[2], xs[3], t), cubicAt(ys[0], ys[1], ys[2], ys[3], t));
                }
                for (const t of cubicExtrema(ys[0], ys[1], ys[2], ys[3])) {
                    includePoint(bbox, cubicAt(xs[0], xs[1], xs[2], xs[3], t), cubicAt(ys[0], ys[1], ys[2], ys[3], t));
                }
                px = xs[3];
                py = ys[3];
            } else {
                px = transformX(matrix, seg[1], seg[2]);
                py = transformY(matrix, seg[1], seg[2]);
            }
            includePoint(bbox, px, py);
        }
        return bbox;
    }

    function emptyBounds() {
        return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    }

    // ---- primitive shapes ------------------------------------------------

    /**
     * @description Converts one endpoint-parameterized SVG arc to cubic
     * Bezier segments (SVG 1.1 F.6.5 and F.6.6): pieces of at most 90 degrees
     * with handle length k = 4/3 tan(t/4). The last point is exactly (x2, y2).
     */
    function arcToCubics(x1, y1, rx, ry, phiDeg, largeArc, sweep, x2, y2) {
        if (x1 === x2 && y1 === y2) return [];
        let radiusX = Math.abs(rx);
        let radiusY = Math.abs(ry);
        if (!(radiusX > 0) || !(radiusY > 0)) return [['L', x2, y2]];
        const largeFlag = isFlagSet(largeArc);
        const sweepFlag = isFlagSet(sweep);
        const phi = (Number(phiDeg) || 0) % 360 * DEG;
        const cos = Math.cos(phi);
        const sin = Math.sin(phi);
        const dx2 = (x1 - x2) / 2;
        const dy2 = (y1 - y2) / 2;
        const x1p = cos * dx2 + sin * dy2;
        const y1p = -sin * dx2 + cos * dy2;

        // F.6.6: scale radii up when no ellipse fits the endpoints.
        const lambda = (x1p * x1p) / (radiusX * radiusX) + (y1p * y1p) / (radiusY * radiusY);
        if (lambda > 1) {
            const grow = Math.sqrt(lambda);
            radiusX *= grow;
            radiusY *= grow;
        }
        const rx2 = radiusX * radiusX;
        const ry2 = radiusY * radiusY;
        const numerator = rx2 * ry2 - rx2 * y1p * y1p - ry2 * x1p * x1p;
        const denominator = rx2 * y1p * y1p + ry2 * x1p * x1p;
        let coefficient = denominator === 0 ? 0 : Math.sqrt(Math.max(0, numerator / denominator));
        if (largeFlag === sweepFlag) coefficient = -coefficient;
        const cxp = coefficient * radiusX * y1p / radiusY;
        const cyp = -coefficient * radiusY * x1p / radiusX;
        const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
        const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;

        const ux = (x1p - cxp) / radiusX;
        const uy = (y1p - cyp) / radiusY;
        const vx = (-x1p - cxp) / radiusX;
        const vy = (-y1p - cyp) / radiusY;
        const theta1 = Math.atan2(uy, ux);
        let delta = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
        if (!sweepFlag && delta > 0) delta -= 2 * Math.PI;
        else if (sweepFlag && delta < 0) delta += 2 * Math.PI;
        if (delta === 0) return [['L', x2, y2]];

        const pieces = Math.max(1, Math.ceil(Math.abs(delta) / HALF_PI - 1e-9));
        const step = delta / pieces;
        const k = 4 / 3 * Math.tan(step / 4);
        const out = [];
        let theta = theta1;
        let cosT = Math.cos(theta);
        let sinT = Math.sin(theta);
        let startX = x1;
        let startY = y1;
        for (let i = 0; i < pieces; i++) {
            const next = theta + step;
            const cosN = Math.cos(next);
            const sinN = Math.sin(next);
            const last = i === pieces - 1;
            const endX = last ? x2 : cx + radiusX * cosN * cos - radiusY * sinN * sin;
            const endY = last ? y2 : cy + radiusX * cosN * sin + radiusY * sinN * cos;
            // Tangents E'(t) at both ends of the piece.
            const d1x = -radiusX * sinT * cos - radiusY * cosT * sin;
            const d1y = -radiusX * sinT * sin + radiusY * cosT * cos;
            const d2x = -radiusX * sinN * cos - radiusY * cosN * sin;
            const d2y = -radiusX * sinN * sin + radiusY * cosN * cos;
            out.push(['C', startX + k * d1x, startY + k * d1y, endX - k * d2x, endY - k * d2y, endX, endY]);
            theta = next;
            cosT = cosN;
            sinT = sinN;
            startX = endX;
            startY = endY;
        }
        return out;
    }

    function ellipse(cx, cy, rx, ry) {
        if (!(rx > 0) || !(ry > 0)) return [];
        const kx = KAPPA * rx;
        const ky = KAPPA * ry;
        return [
            ['M', cx + rx, cy],
            ['C', cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry],
            ['C', cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy],
            ['C', cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry],
            ['C', cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy],
            ['Z']
        ];
    }

    /**
     * @description A circle as 4 cubic Beziers (kappa 0.5522847498),
     * clockwise on screen from (cx + r, cy). r <= 0 gives no segments.
     */
    function circle(cx, cy, r) {
        return ellipse(cx, cy, r, r);
    }

    /**
     * @description A rectangle, clockwise on screen from (x, y), with
     * optional rounded corners (ry defaults to rx; both clamped to half the
     * side, as SVG does). An empty rectangle gives no segments.
     */
    function rect(x, y, w, h, rx = 0, ry = rx) {
        if (!(w > 0) || !(h > 0)) return [];
        const radiusX = Math.min(Math.max(0, Number(rx) || 0), w / 2);
        const radiusY = Math.min(Math.max(0, Number(ry) || 0), h / 2);
        if (!radiusX || !radiusY) {
            return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
        }
        const kx = KAPPA * radiusX;
        const ky = KAPPA * radiusY;
        const right = x + w;
        const bottom = y + h;
        const out = [['M', x + radiusX, y]];
        if (w > 2 * radiusX) out.push(['L', right - radiusX, y]);
        out.push(['C', right - radiusX + kx, y, right, y + radiusY - ky, right, y + radiusY]);
        if (h > 2 * radiusY) out.push(['L', right, bottom - radiusY]);
        out.push(['C', right, bottom - radiusY + ky, right - radiusX + kx, bottom, right - radiusX, bottom]);
        if (w > 2 * radiusX) out.push(['L', x + radiusX, bottom]);
        out.push(['C', x + radiusX - kx, bottom, x, bottom - radiusY + ky, x, bottom - radiusY]);
        if (h > 2 * radiusY) out.push(['L', x, y + radiusY]);
        out.push(['C', x, y + radiusY - ky, x + radiusX - kx, y, x + radiusX, y]);
        out.push(['Z']);
        return out;
    }

    // ---- path data ---------------------------------------------------------

    /**
     * @description Parses SVG path data (all commands, relative and absolute,
     * glued numbers and arc flags) into absolute M/L/C/Z segments. Smooth
     * curves reflect the previous control point; quadratics become cubics;
     * after Z the current point returns to the subpath start. Like browsers,
     * it keeps everything before the first error.
     */
    function pathToSegments(d) {
        const src = String(d == null ? '' : d);
        const length = src.length;
        const out = [];
        let pos = 0;
        let command = '';
        let x = 0;
        let y = 0;
        let startX = 0;
        let startY = 0;
        let controlX = 0;
        let controlY = 0;
        let previous = '';
        let started = false;
        let subpathOpen = false;

        function skipSpace() {
            SPACE_RE.lastIndex = pos;
            SPACE_RE.exec(src);
            pos = SPACE_RE.lastIndex;
        }

        // Reads one number after optional whitespace and, when allowed, one comma.
        function readNumber(allowComma) {
            const skip = allowComma ? SEPARATOR_RE : SPACE_RE;
            skip.lastIndex = pos;
            skip.exec(src);
            pos = skip.lastIndex;
            NUMBER_RE.lastIndex = pos;
            const match = NUMBER_RE.exec(src);
            if (!match) return NaN;
            pos = NUMBER_RE.lastIndex;
            return Number(match[0]);
        }

        function readFlag() {
            SEPARATOR_RE.lastIndex = pos;
            SEPARATOR_RE.exec(src);
            pos = SEPARATOR_RE.lastIndex;
            const c = src.charCodeAt(pos);
            if (c !== 48 && c !== 49) return NaN;
            pos++;
            return c - 48;
        }

        function moveTo(nx, ny) {
            if (out.length && out[out.length - 1][0] === 'M') out.pop();
            out.push(['M', nx, ny]);
            x = startX = nx;
            y = startY = ny;
            subpathOpen = true;
        }

        // A drawing command right after Z starts a new subpath at the old start.
        function ensureSubpath() {
            if (!subpathOpen) out.push(['M', x, y]);
            subpathOpen = true;
        }

        for (;;) {
            skipSpace();
            if (pos >= length) break;
            const c = src[pos];
            let letter;
            let explicit = false;
            if (/[MmLlHhVvCcSsQqTtAaZz]/.test(c)) {
                letter = c;
                explicit = true;
                pos++;
            } else {
                if (!command || command === 'Z' || command === 'z') break;
                letter = command;
            }
            const upper = letter.toUpperCase();
            const relative = letter !== upper;
            if (!started && upper !== 'M') break;

            if (upper === 'Z') {
                command = letter;
                if (subpathOpen && out.length && out[out.length - 1][0] !== 'Z') out.push(['Z']);
                subpathOpen = false;
                x = startX;
                y = startY;
                previous = 'Z';
                continue;
            }

            const count = PATH_PARAMS[upper];
            const params = new Array(count);
            let ok = true;
            for (let i = 0; i < count; i++) {
                const value = upper === 'A' && (i === 3 || i === 4) ? readFlag() : readNumber(!(i === 0 && explicit));
                if (Number.isNaN(value)) {
                    ok = false;
                    break;
                }
                params[i] = value;
            }
            if (!ok) break;
            command = letter;
            const ox = relative ? x : 0;
            const oy = relative ? y : 0;

            switch (upper) {
                case 'M':
                    moveTo(params[0] + ox, params[1] + oy);
                    started = true;
                    // Further coordinate pairs are implicit linetos.
                    command = relative ? 'l' : 'L';
                    break;
                case 'L':
                    ensureSubpath();
                    x = params[0] + ox;
                    y = params[1] + oy;
                    out.push(['L', x, y]);
                    break;
                case 'H':
                    ensureSubpath();
                    x = params[0] + ox;
                    out.push(['L', x, y]);
                    break;
                case 'V':
                    ensureSubpath();
                    y = params[0] + oy;
                    out.push(['L', x, y]);
                    break;
                case 'C': {
                    ensureSubpath();
                    const x1 = params[0] + ox;
                    const y1 = params[1] + oy;
                    controlX = params[2] + ox;
                    controlY = params[3] + oy;
                    x = params[4] + ox;
                    y = params[5] + oy;
                    out.push(['C', x1, y1, controlX, controlY, x, y]);
                    break;
                }
                case 'S': {
                    ensureSubpath();
                    const smooth = previous === 'C' || previous === 'S';
                    const x1 = smooth ? 2 * x - controlX : x;
                    const y1 = smooth ? 2 * y - controlY : y;
                    controlX = params[0] + ox;
                    controlY = params[1] + oy;
                    x = params[2] + ox;
                    y = params[3] + oy;
                    out.push(['C', x1, y1, controlX, controlY, x, y]);
                    break;
                }
                case 'Q':
                case 'T': {
                    ensureSubpath();
                    let qx;
                    let qy;
                    if (upper === 'Q') {
                        qx = params[0] + ox;
                        qy = params[1] + oy;
                    } else {
                        const smooth = previous === 'Q' || previous === 'T';
                        qx = smooth ? 2 * x - controlX : x;
                        qy = smooth ? 2 * y - controlY : y;
                    }
                    const endX = (upper === 'Q' ? params[2] : params[0]) + ox;
                    const endY = (upper === 'Q' ? params[3] : params[1]) + oy;
                    out.push([
                        'C',
                        x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y),
                        endX + 2 / 3 * (qx - endX), endY + 2 / 3 * (qy - endY),
                        endX, endY
                    ]);
                    controlX = qx;
                    controlY = qy;
                    x = endX;
                    y = endY;
                    break;
                }
                case 'A': {
                    ensureSubpath();
                    const endX = params[5] + ox;
                    const endY = params[6] + oy;
                    const pieces = arcToCubics(x, y, params[0], params[1], params[2], params[3], params[4], endX, endY);
                    for (const piece of pieces) out.push(piece);
                    x = endX;
                    y = endY;
                    break;
                }
                default:
                    break;
            }
            previous = upper;
        }

        if (out.length && out[out.length - 1][0] === 'M') out.pop();
        return out;
    }

    // ---- values ------------------------------------------------------------

    // Parses a length in user units. Percentages use `reference`.
    function parseLength(value, reference, fontSize) {
        if (value === undefined || value === null) return NaN;
        const match = LENGTH_RE.exec(String(value));
        if (!match) return NaN;
        const number = Number(match[1]);
        const unit = (match[2] || '').toLowerCase();
        if (!unit) return number;
        if (unit === '%') return reference === undefined ? NaN : number / 100 * reference;
        if (unit === 'em') return number * (fontSize || 16);
        if (unit === 'ex') return number * (fontSize || 16) / 2;
        return number * UNIT_PX[unit];
    }

    function lengthOr(value, reference, fallback) {
        const parsed = parseLength(value, reference);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    // Reads comma or space separated numbers. With `strict`, anything left
    // over makes the whole list invalid (null).
    function parseNumberList(value, strict) {
        const list = [];
        const src = String(value == null ? '' : value);
        let pos = 0;
        for (;;) {
            SEPARATOR_RE.lastIndex = pos;
            SEPARATOR_RE.exec(src);
            pos = SEPARATOR_RE.lastIndex;
            NUMBER_RE.lastIndex = pos;
            const match = NUMBER_RE.exec(src);
            if (!match) break;
            list.push(Number(match[0]));
            pos = NUMBER_RE.lastIndex;
        }
        if (strict && src.slice(pos).trim()) return null;
        return list;
    }

    function clampByte(value) {
        return Math.max(0, Math.min(255, value));
    }

    /**
     * @description Parses a CSS color (hex, rgb(), rgba(), basic names,
     * transparent) to { rgb: [0..1 x3], alpha }, or null when invalid.
     */
    function parseColor(value) {
        const text = String(value).trim().toLowerCase();
        if (!text) return null;
        if (text === 'transparent') return { rgb: [0, 0, 0], alpha: 0 };
        if (text[0] === '#') {
            const hex = text.slice(1);
            if (!/^[0-9a-f]+$/.test(hex) || ![3, 4, 6, 8].includes(hex.length)) return null;
            const short = hex.length <= 4;
            const channel = i => (short ? parseInt(hex[i] + hex[i], 16) : parseInt(hex.slice(2 * i, 2 * i + 2), 16));
            const alpha = hex.length === 4 || hex.length === 8 ? channel(3) / 255 : 1;
            return { rgb: [channel(0) / 255, channel(1) / 255, channel(2) / 255], alpha };
        }
        const functional = /^rgba?\(([^)]*)\)$/.exec(text);
        if (functional) {
            const parts = functional[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);
            if (parts.length !== 3 && parts.length !== 4) return null;
            const rgb = [];
            for (let i = 0; i < 3; i++) {
                const part = parts[i];
                const number = parseFloat(part);
                if (!Number.isFinite(number)) return null;
                rgb.push(clampByte(part.endsWith('%') ? number * 2.55 : number) / 255);
            }
            let alpha = 1;
            if (parts.length === 4) {
                const number = parseFloat(parts[3]);
                if (!Number.isFinite(number)) return null;
                alpha = Math.max(0, Math.min(1, parts[3].endsWith('%') ? number / 100 : number));
            }
            return { rgb, alpha };
        }
        if (hasOwn(NAMED_COLORS, text)) return { rgb: NAMED_COLORS[text].map(v => v / 255), alpha: 1 };
        return null;
    }

    function isValidPaint(value) {
        const text = String(value).trim();
        if (text === 'none' || text === 'currentColor' || text === 'inherit') return true;
        if (text.startsWith('url(')) return URL_RE.test(text);
        return parseColor(text) !== null;
    }

    function parseStyleAttribute(value) {
        const declarations = {};
        for (const part of String(value).split(';')) {
            const colon = part.indexOf(':');
            if (colon === -1) continue;
            const key = part.slice(0, colon).trim().toLowerCase();
            const declared = part.slice(colon + 1).replace(/!important\s*$/i, '').trim();
            if (key && declared) declarations[key] = declared;
        }
        return declarations;
    }

    function styleDeclarations(node) {
        if (!node.attrs.style) return null;
        let declarations = STYLE_CACHE.get(node);
        if (!declarations) {
            declarations = parseStyleAttribute(node.attrs.style);
            STYLE_CACHE.set(node, declarations);
        }
        return declarations;
    }

    // A presentation property from the style attribute or the attribute.
    function ownProperty(node, name) {
        const declarations = styleDeclarations(node);
        if (declarations && hasOwn(declarations, name)) return declarations[name];
        return node.attrs[name];
    }

    /**
     * @description The inherited presentation properties of a node: its style
     * attribute wins over its attributes, invalid paints keep the parent's
     * value. Returns the parent object itself when nothing changes.
     */
    function computeStyle(node, parent) {
        let style = parent;
        const attrs = node.attrs;
        const declarations = styleDeclarations(node);
        for (const key of INHERITED) {
            const value = declarations && hasOwn(declarations, key) ? declarations[key] : attrs[key];
            if (value === undefined || value === null) continue;
            const text = String(value).trim();
            if (!text || text === 'inherit') continue;
            if (PAINT_PROPERTIES.has(key) && !isValidPaint(text)) continue;
            if (style === parent) style = Object.assign({}, parent);
            style[key] = text;
        }
        return style;
    }

    function opacityOf(value) {
        if (value === undefined || value === null) return 1;
        const text = String(value).trim();
        const number = parseFloat(text);
        if (!Number.isFinite(number)) return 1;
        return text.endsWith('%') ? number / 100 : number;
    }

    function referencedId(value) {
        if (typeof value !== 'string') return null;
        const match = URL_RE.exec(value.trim());
        return match ? match[2] : null;
    }

    function hrefOf(node) {
        const value = node.attrs.href !== undefined ? node.attrs.href : node.attrs['xlink:href'];
        return typeof value === 'string' ? value.trim() : '';
    }

    function parseViewBox(value) {
        const list = parseNumberList(value);
        if (list.length !== 4 || !(list[2] > 0) || !(list[3] > 0)) return null;
        return { x: list[0], y: list[1], width: list[2], height: list[3] };
    }

    function parsePreserveAspectRatio(value) {
        const match = PAR_RE.exec(String(value == null ? '' : value));
        if (!match) return { align: 'xMidYMid', slice: false };
        return { align: match[1], slice: match[2] === 'slice' };
    }

    // Offset fractions (0, 0.5, 1) of an xMinYMid-style alignment.
    function alignFractions(align) {
        const fraction = key => (key === 'Min' ? 0 : key === 'Max' ? 1 : 0.5);
        return { fx: fraction(align.slice(1, 4)), fy: fraction(align.slice(5, 8)) };
    }

    // Fits a content box (cw x ch) into a viewport per preserveAspectRatio.
    function fitBox(viewport, contentWidth, contentHeight, par) {
        if (par.align === 'none') return { x: viewport.x, y: viewport.y, width: viewport.width, height: viewport.height };
        const sx = viewport.width / contentWidth;
        const sy = viewport.height / contentHeight;
        const scale = par.slice ? Math.max(sx, sy) : Math.min(sx, sy);
        const width = contentWidth * scale;
        const height = contentHeight * scale;
        const { fx, fy } = alignFractions(par.align);
        return {
            x: viewport.x + (viewport.width - width) * fx,
            y: viewport.y + (viewport.height - height) * fy,
            width,
            height
        };
    }

    function viewBoxMatrix(viewBox, width, height, parValue) {
        const par = parsePreserveAspectRatio(parValue);
        if (par.align === 'none') {
            const sx = width / viewBox.width;
            const sy = height / viewBox.height;
            return [sx, 0, 0, sy, -viewBox.x * sx, -viewBox.y * sy];
        }
        const box = fitBox({ x: 0, y: 0, width, height }, viewBox.width, viewBox.height, par);
        const scale = box.width / viewBox.width;
        return [scale, 0, 0, scale, box.x - viewBox.x * scale, box.y - viewBox.y * scale];
    }

    // ---- paint -------------------------------------------------------------

    function solidPaint(rgb) {
        return { type: 'solid', color: rgb.slice() };
    }

    // Follows href templates of a gradient (stops and attributes inherit).
    function gradientChain(node, ids) {
        const chain = [node];
        const seen = new Set([node]);
        let current = node;
        while (chain.length < 16) {
            const href = hrefOf(current);
            if (href.charCodeAt(0) !== 35) break;
            const next = ids.get(href.slice(1));
            if (!next || seen.has(next) || (next.name !== 'linearGradient' && next.name !== 'radialGradient')) break;
            chain.push(next);
            seen.add(next);
            current = next;
        }
        return chain;
    }

    function parseOffset(value) {
        const text = String(value == null ? '0' : value).trim();
        const number = parseFloat(text);
        if (!Number.isFinite(number)) return 0;
        const fraction = text.endsWith('%') ? number / 100 : number;
        return Math.max(0, Math.min(1, fraction));
    }

    /**
     * @description Resolves a gradient into an absolute Paint: coordinates go
     * through gradientTransform, objectBoundingBox units and the current
     * matrix. Radial gradients keep the center and a uniformly scaled radius
     * (the focal point is dropped). No stops gives null; one stop is solid.
     */
    function gradientPaint(node, matrix, bounds, context) {
        const chain = gradientChain(node, context.ids);
        const attr = name => {
            for (const item of chain) {
                if (item.attrs[name] !== undefined) return item.attrs[name];
            }
            return undefined;
        };
        const stopOwner = chain.find(item => item.children.some(child => child.name === 'stop'));
        const stops = [];
        let lastOffset = 0;
        if (stopOwner) {
            for (const child of stopOwner.children) {
                if (child.name !== 'stop') continue;
                lastOffset = Math.max(lastOffset, parseOffset(ownProperty(child, 'offset')));
                const colorText = ownProperty(child, 'stop-color');
                const parsed = colorText === undefined ? null : parseColor(colorText);
                stops.push({ offset: lastOffset, color: parsed ? parsed.rgb : [0, 0, 0] });
            }
        }
        if (!stops.length) return null;
        if (stops.length === 1) return solidPaint(stops[0].color);

        const userSpace = attr('gradientUnits') === 'userSpaceOnUse';
        let full = matrix;
        if (!userSpace) {
            if (!bounds || !(bounds.maxX > bounds.minX) || !(bounds.maxY > bounds.minY)) return null;
            full = multiply(full, [bounds.maxX - bounds.minX, 0, 0, bounds.maxY - bounds.minY, bounds.minX, bounds.minY]);
        }
        const gradientTransform = attr('gradientTransform');
        if (gradientTransform) full = multiply(full, parseTransform(gradientTransform));
        const viewport = context.viewport;
        const refX = userSpace ? viewport.width : 1;
        const refY = userSpace ? viewport.height : 1;
        const refR = userSpace ? Math.sqrt((viewport.width * viewport.width + viewport.height * viewport.height) / 2) : 1;
        const length = (name, reference, fallback) => lengthOr(attr(name), reference, fallback);

        if (node.name === 'linearGradient') {
            const x1 = length('x1', refX, 0);
            const y1 = length('y1', refY, 0);
            const x2 = length('x2', refX, refX);
            const y2 = length('y2', refY, 0);
            const paint = {
                type: 'linear',
                x1: round3(transformX(full, x1, y1)),
                y1: round3(transformY(full, x1, y1)),
                x2: round3(transformX(full, x2, y2)),
                y2: round3(transformY(full, x2, y2)),
                stops
            };
            // SVG paints a zero-length gradient vector with the last stop.
            if (paint.x1 === paint.x2 && paint.y1 === paint.y2) return solidPaint(stops[stops.length - 1].color);
            return paint;
        }
        const cx = length('cx', refX, refX / 2);
        const cy = length('cy', refY, refY / 2);
        const r = length('r', refR, refR / 2);
        if (!(r > 0)) return solidPaint(stops[stops.length - 1].color);
        return {
            type: 'radial',
            cx: round3(transformX(full, cx, cy)),
            cy: round3(transformY(full, cx, cy)),
            r: round3(r * matrixScale(full)),
            stops
        };
    }

    /**
     * @description Resolves a fill or stroke value to a Paint, or null for
     * nothing to paint (none, fully transparent, missing paint server).
     * Opacity below 1 is ignored: Drawings are opaque.
     */
    function resolvePaint(value, opacity, style, matrix, boundsOf, context) {
        if (value === undefined || value === null) return null;
        const text = String(value).trim();
        if (!text || text === 'none' || opacity <= 0) return null;
        if (text.startsWith('url(')) {
            const match = URL_RE.exec(text);
            if (!match) return null;
            const target = context.ids.get(match[2]);
            if (target && (target.name === 'linearGradient' || target.name === 'radialGradient')) {
                return gradientPaint(target, matrix, boundsOf ? boundsOf() : null, context);
            }
            return match[3] ? resolvePaint(match[3], opacity, style, matrix, boundsOf, context) : null;
        }
        const color = parseColor(text === 'currentColor' ? style.color : text);
        if (!color || color.alpha <= 0) return null;
        return solidPaint(color.rgb);
    }

    // ---- geometry of elements ----------------------------------------------

    function shapeSegments(node, viewport, fontSize) {
        const attrs = node.attrs;
        const w = viewport.width;
        const h = viewport.height;
        const len = (name, reference) => {
            const value = parseLength(attrs[name], reference, fontSize);
            return Number.isFinite(value) ? value : 0;
        };
        switch (node.name) {
            case 'rect': {
                const width = len('width', w);
                const height = len('height', h);
                const rxValue = parseLength(attrs.rx, w, fontSize);
                const ryValue = parseLength(attrs.ry, h, fontSize);
                const rx = Number.isFinite(rxValue) && rxValue >= 0 ? rxValue : (Number.isFinite(ryValue) && ryValue >= 0 ? ryValue : 0);
                const ry = Number.isFinite(ryValue) && ryValue >= 0 ? ryValue : rx;
                return rect(len('x', w), len('y', h), width, height, rx, ry);
            }
            case 'circle': {
                const diagonal = Math.sqrt((w * w + h * h) / 2);
                return circle(len('cx', w), len('cy', h), len('r', diagonal));
            }
            case 'ellipse':
                return ellipse(len('cx', w), len('cy', h), len('rx', w), len('ry', h));
            case 'line':
                return [['M', len('x1', w), len('y1', h)], ['L', len('x2', w), len('y2', h)]];
            case 'polyline':
            case 'polygon': {
                const list = parseNumberList(attrs.points);
                if (list.length < 4) return [];
                const out = [['M', list[0], list[1]]];
                for (let i = 2; i + 1 < list.length; i += 2) out.push(['L', list[i], list[i + 1]]);
                if (node.name === 'polygon') out.push(['Z']);
                return out;
            }
            case 'path':
                return pathToSegments(attrs.d);
            default:
                return null;
        }
    }

    function textContentOf(node) {
        let text = node.text || '';
        for (const child of node.children) {
            if (child.name === 'tspan' || child.name === 'textPath' || child.name === 'a') text += textContentOf(child);
            text += child.tail || '';
        }
        return text;
    }

    // Default SVG whitespace handling (xml:space="default").
    function normalizeText(text, preserve) {
        if (preserve) return text.replace(/[\r\n\t]/g, ' ');
        return text.replace(/[\r\n]/g, '').replace(/\t/g, ' ').replace(/ {2,}/g, ' ').trim();
    }

    // ---- flattening ----------------------------------------------------------

    function indexIds(root) {
        const ids = new Map();
        const visit = node => {
            const id = node.attrs.id;
            if (typeof id === 'string' && id && !ids.has(id)) ids.set(id, node);
            for (const child of node.children) visit(child);
        };
        visit(root);
        return ids;
    }

    function isHidden(node) {
        return String(ownProperty(node, 'display') || '').trim() === 'none';
    }

    function isInvisible(style) {
        return style.visibility === 'hidden' || style.visibility === 'collapse';
    }

    function elementMatrix(node, parentMatrix) {
        const transform = node.attrs.transform;
        if (!transform) return parentMatrix;
        const own = parseTransform(transform);
        return isIdentity(own) ? parentMatrix : multiply(parentMatrix, own);
    }

    /**
     * @description Collects the clip geometry of a clipPath in the user space
     * of the referencing element: every shape child with its transform (and
     * the clipPath's transform and units). The merged fill rule is evenodd
     * when any child uses clip-rule evenodd, otherwise nonzero. Returns
     * { parts: [{segs, matrix}], fillRule } with matrices relative to that
     * user space; an empty parts list means everything is clipped away.
     */
    function clipGeometry(clipNode, boundsOf, context) {
        let base = [1, 0, 0, 1, 0, 0];
        if (clipNode.attrs.clipPathUnits === 'objectBoundingBox') {
            const bounds = boundsOf ? boundsOf() : null;
            if (!bounds || !(bounds.maxX > bounds.minX) || !(bounds.maxY > bounds.minY)) return { parts: [], fillRule: 'nonzero' };
            base = [bounds.maxX - bounds.minX, 0, 0, bounds.maxY - bounds.minY, bounds.minX, bounds.minY];
        }
        base = elementMatrix(clipNode, base);
        const clipStyle = computeStyle(clipNode, DEFAULT_STYLE);
        const parts = [];
        let evenOdd = false;
        const visit = (node, matrix, style, depth) => {
            if (depth > MAX_DEPTH || isHidden(node)) return;
            if (node.name === 'use') {
                const target = context.ids.get(hrefOf(node).slice(1));
                if (!target || target === node || !SHAPES.has(target.name)) return;
                const useMatrix = multiply(elementMatrix(node, matrix), translation(
                    lengthOr(node.attrs.x, context.viewport.width, 0),
                    lengthOr(node.attrs.y, context.viewport.height, 0)
                ));
                visit(target, useMatrix, computeStyle(node, style), depth + 1);
                return;
            }
            if (!SHAPES.has(node.name)) return;
            const childStyle = computeStyle(node, style);
            if (isInvisible(childStyle)) return;
            const segs = shapeSegments(node, context.viewport, parseLength(childStyle['font-size']));
            if (!segs || !segs.length || node.name === 'line') return;
            if (childStyle['clip-rule'] === 'evenodd') evenOdd = true;
            parts.push({ segs, matrix: elementMatrix(node, matrix) });
        };
        for (const child of clipNode.children) visit(child, base, clipStyle, 0);
        return { parts, fillRule: evenOdd ? 'evenodd' : 'nonzero' };
    }

    function clipToSegments(geometry, matrix) {
        const d = [];
        for (const part of geometry.parts) {
            const segs = applyMatrix(part.segs, multiply(matrix, part.matrix));
            for (const seg of segs) d.push(seg);
        }
        return d;
    }

    function elementBounds(segs) {
        return () => extendBounds(emptyBounds(), segs, null);
    }

    /**
     * @description The library paints each color region as a full-size rect
     * clipped by a clipPath of module shapes. When the clip geometry lies
     * inside that rect, the region is exactly the clip geometry, so it becomes
     * one path with the rect's paint. Returns false when the shortcut does not
     * apply (the caller then emits a clip group).
     */
    function tryPaintRegion(node, clipNode, style, matrix, out, context) {
        if (clipNode.attrs['clip-path'] || ownProperty(clipNode, 'clip-path')) return false;
        if (resolvePaint(style.stroke, opacityOf(style['stroke-opacity']), style, matrix, null, context)) return false;
        const rectSegs = shapeSegments(node, context.viewport);
        if (!rectSegs || !rectSegs.length) return true;
        if (rectSegs.length !== 5) return false;
        const x = rectSegs[0][1];
        const y = rectSegs[0][2];
        const right = rectSegs[2][1];
        const bottom = rectSegs[2][2];
        const boundsOf = elementBounds(rectSegs);
        const geometry = clipGeometry(clipNode, boundsOf, context);
        if (!geometry.parts.length) return true;
        const clipBounds = emptyBounds();
        for (const part of geometry.parts) extendBounds(clipBounds, part.segs, part.matrix);
        // The library's "dot" corner ring is two 359.8 degree arcs, so it
        // overshoots its 7-module box by 0.05 units; 0.1% of the box absorbs
        // that invisible sliver.
        const epsilon = 1e-6 + 0.001 * Math.max(right - x, bottom - y);
        if (clipBounds.minX < x - epsilon || clipBounds.minY < y - epsilon
            || clipBounds.maxX > right + epsilon || clipBounds.maxY > bottom + epsilon) {
            return false;
        }
        if (isInvisible(style)) return true;
        const paint = resolvePaint(style.fill, opacityOf(style['fill-opacity']), style, matrix, boundsOf, context);
        if (paint) out.push({ kind: 'path', d: clipToSegments(geometry, matrix), fillRule: geometry.fillRule, paint });
        return true;
    }

    /**
     * @description Adds a basic shape: a 'path' item for its fill and a
     * 'stroke' item for its stroke (sharing the same absolute segments).
     */
    function renderShape(node, context, out) {
        const { style, matrix } = context;
        if (isInvisible(style)) return;
        const segs = shapeSegments(node, context.viewport, parseLength(style['font-size']));
        if (!segs || !segs.length) return;
        const boundsOf = elementBounds(segs);
        let absolute = null;
        if (node.name !== 'line') {
            const fill = resolvePaint(style.fill, opacityOf(style['fill-opacity']), style, matrix, boundsOf, context);
            if (fill) {
                absolute = applyMatrix(segs, matrix);
                out.push({ kind: 'path', d: absolute, fillRule: style['fill-rule'] === 'evenodd' ? 'evenodd' : 'nonzero', paint: fill });
            }
        }
        const lineWidth = parseLength(style['stroke-width'], Math.sqrt((context.viewport.width ** 2 + context.viewport.height ** 2) / 2));
        if (lineWidth > 0) {
            const stroke = resolvePaint(style.stroke, opacityOf(style['stroke-opacity']), style, matrix, boundsOf, context);
            if (stroke) {
                out.push({
                    kind: 'stroke',
                    d: absolute || applyMatrix(segs, matrix),
                    lineWidth: round3(lineWidth * matrixScale(matrix)),
                    paint: stroke
                });
            }
        }
    }

    // The first length of an x or y list on <text> (later ones place single
    // glyphs, which a Drawing cannot express).
    function firstLength(value, reference) {
        const token = String(value == null ? '' : value).trim().split(/[\s,]+/)[0];
        return lengthOr(token, reference, 0);
    }

    /**
     * @description Adds one 'text' item for a <text> element: its whole
     * character content on one line at the first x/y position, with the
     * font size and data-max-width scaled by the current matrix.
     */
    function renderText(node, context, out) {
        const { style, matrix } = context;
        if (isInvisible(style)) return;
        const preserve = node.attrs['xml:space'] === 'preserve';
        const text = normalizeText(textContentOf(node), preserve);
        if (!text) return;
        const fontSize = lengthOr(style['font-size'], context.viewport.height, 16);
        if (!(fontSize > 0)) return;
        const x = firstLength(node.attrs.x, context.viewport.width);
        const y = firstLength(node.attrs.y, context.viewport.height);
        const scale = matrixScale(matrix);
        const maxWidthValue = parseFloat(node.attrs['data-max-width']);
        const maxWidth = Number.isFinite(maxWidthValue) && maxWidthValue > 0 ? round3(maxWidthValue * scale) : null;
        const size = fontSize * scale;
        let centerX = transformX(matrix, x, y);
        const baseline = transformY(matrix, x, y);
        // Drawings only know centered text; shift start or end anchored text
        // by its Helvetica-Bold width when the metrics module is loaded.
        const anchor = style['text-anchor'];
        if (anchor === 'start' || anchor === 'end') {
            const helvetica = globalThis.QRTurboHelvetica;
            let width = 0;
            try {
                if (helvetica && helvetica.canEncode(text)) width = helvetica.measure(text, size);
            } catch (error) {
                width = 0;
            }
            centerX += anchor === 'start' ? width / 2 : -width / 2;
        }
        const boundsOf = () => {
            const half = (maxWidth || fontSize * text.length * 0.6) / 2;
            return { minX: x - half, minY: y - fontSize, maxX: x + half, maxY: y };
        };
        const paint = resolvePaint(style.fill, opacityOf(style['fill-opacity']), style, matrix, boundsOf, context);
        if (!paint) return;
        out.push({
            kind: 'text',
            text,
            x: round3(centerX),
            y: round3(baseline),
            fontSize: round3(size),
            maxWidth,
            anchor: 'middle',
            paint
        });
    }

    /**
     * @description Adds an 'image' item (inside a clip group for slice) and
     * queues it, so flatten can fit its box once the pixels are known.
     */
    function renderImage(node, context, out) {
        const { style, matrix, viewport } = context;
        if (isInvisible(style)) return;
        const href = hrefOf(node);
        if (!href) return;
        const attrs = node.attrs;
        const x = lengthOr(attrs.x, viewport.width, 0);
        const y = lengthOr(attrs.y, viewport.height, 0);
        const width = parseLength(attrs.width, viewport.width);
        const height = parseLength(attrs.height, viewport.height);
        const autoSize = !Number.isFinite(width) || !Number.isFinite(height);
        if (!autoSize && (!(width > 0) || !(height > 0))) return;
        const item = { kind: 'image', x: 0, y: 0, width: 0, height: 0, href };
        const par = parsePreserveAspectRatio(attrs.preserveAspectRatio);
        const pending = { item, x, y, width, height, autoSize, par, matrix, group: null };
        if (par.slice && !autoSize) {
            const clip = applyMatrix(rect(x, y, width, height), matrix);
            pending.group = { kind: 'group', clip: { d: clip, fillRule: 'nonzero' }, items: [item] };
            out.push(pending.group);
        } else {
            out.push(item);
        }
        placeImage(pending, null);
        context.images.push(pending);
    }

    // Sets the absolute image box: the viewport fitted to the natural size.
    function placeImage(pending, natural) {
        const { item, matrix } = pending;
        let box;
        if (pending.autoSize) {
            const width = natural ? natural.width : 0;
            const height = natural ? natural.height : 0;
            box = { x: pending.x, y: pending.y, width, height };
        } else {
            box = { x: pending.x, y: pending.y, width: pending.width, height: pending.height };
            if (natural && natural.width > 0 && natural.height > 0) box = fitBox(box, natural.width, natural.height, pending.par);
        }
        const x0 = transformX(matrix, box.x, box.y);
        const y0 = transformY(matrix, box.x, box.y);
        const x1 = transformX(matrix, box.x + box.width, box.y + box.height);
        const y1 = transformY(matrix, box.x + box.width, box.y + box.height);
        item.x = round3(Math.min(x0, x1));
        item.y = round3(Math.min(y0, y1));
        item.width = round3(Math.abs(x1 - x0));
        item.height = round3(Math.abs(y1 - y0));
    }

    /**
     * @description A nested <svg>: x, y and the viewBox become a matrix on
     * the points; the viewport clips its content unless overflow is visible.
     */
    function renderNestedSvg(node, context, out) {
        const attrs = node.attrs;
        const parentViewport = context.viewport;
        const x = lengthOr(attrs.x, parentViewport.width, 0);
        const y = lengthOr(attrs.y, parentViewport.height, 0);
        const width = attrs.width === undefined || attrs.width === 'auto' ? parentViewport.width : parseLength(attrs.width, parentViewport.width);
        const height = attrs.height === undefined || attrs.height === 'auto' ? parentViewport.height : parseLength(attrs.height, parentViewport.height);
        if (!(width > 0) || !(height > 0)) return;
        let matrix = multiply(context.matrix, translation(x, y));
        let viewport = { width, height };
        const viewBox = parseViewBox(attrs.viewBox);
        if (viewBox) {
            matrix = multiply(matrix, viewBoxMatrix(viewBox, width, height, attrs.preserveAspectRatio));
            viewport = { width: viewBox.width, height: viewBox.height };
        }
        const overflow = String(ownProperty(node, 'overflow') || '').trim();
        const clipped = overflow !== 'visible' && overflow !== 'auto';
        const items = [];
        renderChildren(node, Object.assign({}, context, { matrix, viewport }), items);
        if (!items.length) return;
        if (clipped) {
            out.push({ kind: 'group', clip: { d: applyMatrix(rect(x, y, width, height), context.matrix), fillRule: 'nonzero' }, items });
        } else {
            for (const item of items) out.push(item);
        }
    }

    function renderUse(node, context, out) {
        const target = context.ids.get(hrefOf(node).slice(1));
        if (!target || context.useStack.has(target) || context.useStack.size > MAX_DEPTH) return;
        const x = lengthOr(node.attrs.x, context.viewport.width, 0);
        const y = lengthOr(node.attrs.y, context.viewport.height, 0);
        const matrix = multiply(context.matrix, translation(x, y));
        context.useStack.add(target);
        try {
            if (target.name === 'symbol') {
                const viewBox = parseViewBox(target.attrs.viewBox);
                const width = lengthOr(node.attrs.width, context.viewport.width, context.viewport.width);
                const height = lengthOr(node.attrs.height, context.viewport.height, context.viewport.height);
                const symbolMatrix = viewBox ? multiply(matrix, viewBoxMatrix(viewBox, width, height, target.attrs.preserveAspectRatio)) : matrix;
                const viewport = viewBox ? { width: viewBox.width, height: viewBox.height } : context.viewport;
                renderChildren(target, Object.assign({}, context, { matrix: symbolMatrix, viewport, style: computeStyle(target, context.style) }), out);
            } else {
                renderNode(target, Object.assign({}, context, { matrix }), out);
            }
        } finally {
            context.useStack.delete(target);
        }
    }

    function renderChildren(node, context, out) {
        if (context.depth > MAX_DEPTH) return;
        const childContext = Object.assign({}, context, { depth: context.depth + 1 });
        if (node.name === 'switch') {
            const first = node.children.find(child => !NON_RENDERING.has(child.name));
            if (first) renderNode(first, childContext, out);
            return;
        }
        for (const child of node.children) renderNode(child, childContext, out);
    }

    /**
     * @description Renders one element (and its subtree) into `out` in
     * painter's order, applying its transform, inherited style and clip-path.
     */
    function renderNode(node, context, out) {
        const name = node.name;
        if (NON_RENDERING.has(name) || isHidden(node)) return;
        if (opacityOf(ownProperty(node, 'opacity')) <= 0) return;
        const style = computeStyle(node, context.style);
        const matrix = name === 'svg' ? context.matrix : elementMatrix(node, context.matrix);
        const local = Object.assign({}, context, { style, matrix });

        let target = out;
        let group = null;
        const clipId = referencedId(ownProperty(node, 'clip-path'));
        const clipNode = clipId ? context.ids.get(clipId) : null;
        if (clipNode && clipNode.name === 'clipPath') {
            if (name === 'rect' && tryPaintRegion(node, clipNode, style, matrix, out, local)) return;
            let boundsOf = null;
            if (SHAPES.has(name)) {
                const segs = shapeSegments(node, context.viewport);
                boundsOf = segs ? elementBounds(segs) : null;
            }
            const geometry = clipGeometry(clipNode, boundsOf, local);
            if (!geometry.parts.length) return;
            group = { kind: 'group', clip: { d: clipToSegments(geometry, matrix), fillRule: geometry.fillRule }, items: [] };
            target = group.items;
        }

        switch (name) {
            case 'svg':
                renderNestedSvg(node, local, target);
                break;
            case 'g':
            case 'a':
            case 'switch':
                renderChildren(node, local, target);
                break;
            case 'use':
                renderUse(node, local, target);
                break;
            case 'text':
                renderText(node, local, target);
                break;
            case 'image':
                renderImage(node, local, target);
                break;
            default:
                if (SHAPES.has(name)) renderShape(node, local, target);
                break;
        }
        if (group && group.items.length) out.push(group);
    }

    // The root viewport: its viewBox (in user units) or its size in px.
    function rootViewport(root) {
        const viewBox = parseViewBox(root.attrs.viewBox);
        if (viewBox) {
            return { width: viewBox.width, height: viewBox.height, matrix: translation(-viewBox.x, -viewBox.y) };
        }
        const width = parseLength(root.attrs.width);
        const height = parseLength(root.attrs.height);
        if (!(width > 0) || !(height > 0)) {
            throw new Error('QRTurboGeometry.flatten: the root <svg> needs a viewBox or an absolute width and height');
        }
        return { width, height, matrix: [1, 0, 0, 1, 0, 0] };
    }

    /**
     * @description Flattens a parsed SVG tree into a Drawing (SPEC C.3) in
     * painter's order. Library color regions (clipPath plus paint rect) become
     * one path each, gradients get absolute coordinates, nested <svg>
     * viewports become clip groups with their matrix applied to the points,
     * <g clip-path> becomes a group clip, strokes become 'stroke' items,
     * <text> becomes 'text' (maxWidth from data-max-width) and <image> boxes
     * are fitted with preserveAspectRatio (default xMidYMid meet) once
     * o.resolveImage(href, {w, h}, {drawingWidth, drawingHeight}) has given
     * the pixels. The box {w, h} is in Drawing units. ImagePixels may carry
     * naturalWidth and naturalHeight for an exact aspect ratio.
     */
    async function flatten(root, o) {
        if (!root || root.name !== 'svg' || !root.attrs || !Array.isArray(root.children)) {
            throw new TypeError('QRTurboGeometry.flatten: expected a parsed <svg> root');
        }
        const options = o || {};
        const viewport = rootViewport(root);
        const context = {
            ids: indexIds(root),
            matrix: viewport.matrix,
            viewport: { width: viewport.width, height: viewport.height },
            style: computeStyle(root, DEFAULT_STYLE),
            depth: 0,
            images: [],
            useStack: new Set()
        };
        const items = [];
        renderChildren(root, context, items);

        const drawing = { width: viewport.width, height: viewport.height, items };
        if (typeof options.resolveImage === 'function') {
            for (const pending of context.images) {
                const box = { w: pending.item.width, h: pending.item.height };
                const pixels = await options.resolveImage(pending.item.href, box, {
                    drawingWidth: drawing.width,
                    drawingHeight: drawing.height
                });
                if (!pixels || !(pixels.width > 0) || !(pixels.height > 0)) continue;
                pending.item.pixels = pixels;
                const natural = pixels.naturalWidth > 0 && pixels.naturalHeight > 0
                    ? { width: pixels.naturalWidth, height: pixels.naturalHeight }
                    : { width: pixels.width, height: pixels.height };
                placeImage(pending, natural);
            }
        }
        return drawing;
    }

    // ---- writer helpers --------------------------------------------------
    // QRTurboPdf and QRTurboEps load together with this module and share
    // these Drawing helpers, so a fix to number formatting, color mapping,
    // gradient stops, path operators or mask packing reaches both formats.

    const WRITER_KITS = new Map();

    /**
     * @description Builds the writer helpers whose error messages start
     * with name ('QRTurboPdf' or 'QRTurboEps').
     */
    function createWriterKit(name) {
        function fixed(value, decimals) {
            const v = Number(value);
            if (!Number.isFinite(v) || Math.abs(v) >= 1e15) {
                throw new RangeError(`${name}: number out of range`);
            }
            let text = v.toFixed(decimals);
            if (text.indexOf('.') !== -1) text = text.replace(/0+$/, '').replace(/\.$/, '');
            return text === '-0' ? '0' : text;
        }

        /**
         * @description PDF and PostScript number for coordinates, sizes and
         * colors: at most 4 decimals, trailing zeros trimmed, never exponent
         * notation, and -0 written as 0.
         */
        function num(value) {
            return fixed(value, 4);
        }

        /**
         * @description The drawing-to-page scale factor with 8 significant
         * digits (at least 4 decimals). With only 4 decimals a small factor
         * such as 0.0142445 loses up to 0.3%, and the artwork no longer
         * fills the MediaBox or BoundingBox.
         */
        function factor(value) {
            const v = Number(value);
            const magnitude = Number.isFinite(v) && v !== 0 ? Math.floor(Math.log10(Math.abs(v))) : 0;
            return fixed(v, Math.min(12, Math.max(4, 7 - magnitude)));
        }

        function clamp01(value) {
            const v = Number(value);
            if (!Number.isFinite(v)) return 0;
            return v < 0 ? 0 : (v > 1 ? 1 : v);
        }

        function channel8(value) {
            return Math.round(clamp01(value) * 255);
        }

        function hexOf(rgb) {
            return '#' + [0, 1, 2].map(index => channel8(rgb[index]).toString(16).padStart(2, '0')).join('');
        }

        function colorModule(method) {
            const color = globalThis.QRTurboColor;
            if (!color || typeof color[method] !== 'function') throw new Error(`${name}: QRTurboColor is not loaded`);
            return color;
        }

        /**
         * @description Paint components for the color mode: RGB as is,
         * CMYK from QRTurboColor.toCmyk, K-only as [0, 0, 0, QRTurboColor.toK].
         */
        function colorComponents(rgb, mode) {
            if (mode === 'cmyk') return colorModule('toCmyk').toCmyk(hexOf(rgb)).map(clamp01);
            if (mode === 'k') return [0, 0, 0, clamp01(colorModule('toK').toK(hexOf(rgb)))];
            return [clamp01(rgb[0]), clamp01(rgb[1]), clamp01(rgb[2])];
        }

        /**
         * @description DeviceGray samples (0..255) for K-only images: the
         * perceptual gray of each stored sRGB pixel, with the Rec. 709
         * weights of QRTurboColor.perceptualGray, so logos print with the
         * same tones as the paint colors.
         */
        function graySamples(rgb, count) {
            const gray = new Uint8Array(count);
            for (let i = 0; i < count; i++) {
                gray[i] = Math.round((0.2126 * rgb[i * 3]) + (0.7152 * rgb[(i * 3) + 1]) + (0.0722 * rgb[(i * 3) + 2]));
            }
            return gray;
        }

        function checkColor(color) {
            if (!Array.isArray(color) && !ArrayBuffer.isView(color)) {
                throw new TypeError(`${name}: a paint color must be [r, g, b]`);
            }
            return [clamp01(color[0]), clamp01(color[1]), clamp01(color[2])];
        }

        function isGradient(paint) {
            return Boolean(paint) && (paint.type === 'linear' || paint.type === 'radial');
        }

        /**
         * @description The single color used where a gradient cannot apply
         * (text, stencil masks and strokes): the first gradient stop.
         */
        function solidColor(paint) {
            if (!paint) throw new TypeError(`${name}: missing paint`);
            if (paint.type === 'solid') return checkColor(paint.color);
            if (isGradient(paint) && Array.isArray(paint.stops) && paint.stops.length) return checkColor(paint.stops[0].color);
            throw new TypeError(`${name}: unknown paint`);
        }

        /**
         * @description Sorted stops covering 0..1, padded with the end colors,
         * so the shading function matches SVG gradient spreading.
         */
        function normalizeStops(stops) {
            const list = (Array.isArray(stops) ? stops : [])
                .map((stop, index) => ({ offset: clamp01(stop && stop.offset), color: checkColor(stop && stop.color), index }))
                .sort((a, b) => (a.offset - b.offset) || (a.index - b.index));
            if (!list.length) throw new TypeError(`${name}: a gradient needs stops`);
            if (list[0].offset > 0) list.unshift({ offset: 0, color: list[0].color });
            if (list[list.length - 1].offset < 1) list.push({ offset: 1, color: list[list.length - 1].color });
            if (list.length === 1) list.push({ offset: 1, color: list[0].color });
            return list;
        }

        // A string literal body: backslash, parentheses and bytes outside
        // printable ASCII are escaped.
        function escapeString(bytes) {
            let out = '';
            for (const byte of bytes) {
                if (byte === 0x5c) out += '\\\\';
                else if (byte === 0x28) out += '\\(';
                else if (byte === 0x29) out += '\\)';
                else if (byte < 0x20 || byte > 0x7e) out += '\\' + byte.toString(8).padStart(3, '0');
                else out += String.fromCharCode(byte);
            }
            return out;
        }

        /**
         * @description Path segments as m l c h operators (PDF operators, or
         * the EPS prolog procedures of the same names). A segment after Z
         * that is not M restarts at the subpath start, as in SVG.
         */
        function pathOperators(segments) {
            if (!Array.isArray(segments)) throw new TypeError(`${name}: path data must be a segment list`);
            const out = [];
            let startX = 0;
            let startY = 0;
            let open = false;
            let closed = false;
            for (const seg of segments) {
                const type = seg && seg[0];
                if (type === 'M') {
                    startX = seg[1];
                    startY = seg[2];
                    out.push(`${num(seg[1])} ${num(seg[2])} m`);
                    open = true;
                    closed = false;
                    continue;
                }
                if (type === 'Z') {
                    if (open && !closed) out.push('h');
                    closed = true;
                    continue;
                }
                if (type !== 'L' && type !== 'C') throw new TypeError(`${name}: unknown path segment`);
                if (!open || closed) {
                    out.push(`${num(startX)} ${num(startY)} m`);
                    open = true;
                    closed = false;
                }
                if (type === 'L') out.push(`${num(seg[1])} ${num(seg[2])} l`);
                else out.push(`${num(seg[1])} ${num(seg[2])} ${num(seg[3])} ${num(seg[4])} ${num(seg[5])} ${num(seg[6])} c`);
            }
            return out;
        }

        function hasDrawableSegments(segments) {
            return Array.isArray(segments) && segments.some(seg => seg && (seg[0] === 'L' || seg[0] === 'C'));
        }

        /**
         * @description Stencil mask bits as packed rows (MSB first, each row
         * padded to a byte). Accepts packed rows or one byte per pixel.
         */
        function packMask(item) {
            const cols = item.cols;
            const rows = item.rows;
            if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1) {
                throw new RangeError(`${name}: invalid mask size`);
            }
            const bits = item.bits;
            if (!(bits instanceof Uint8Array)) throw new TypeError(`${name}: mask bits must be a Uint8Array`);
            const rowBytes = Math.ceil(cols / 8);
            const unpacked = bits.length === cols * rows
                && (bits.length !== rowBytes * rows || bits.every(value => value <= 1));
            if (!unpacked) {
                if (bits.length !== rowBytes * rows) throw new RangeError(`${name}: mask bits do not match its size`);
                return bits;
            }
            const packed = new Uint8Array(rowBytes * rows);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (bits[(y * cols) + x]) packed[(y * rowBytes) + (x >> 3)] |= 0x80 >> (x & 7);
                }
            }
            return packed;
        }

        function checkPixels(pixels) {
            if (!pixels) return null;
            const { width, height, rgb, alpha } = pixels;
            if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
                throw new RangeError(`${name}: invalid image size`);
            }
            if (!(rgb instanceof Uint8Array) || rgb.length !== width * height * 3) {
                throw new RangeError(`${name}: image RGB data does not match its size`);
            }
            if (alpha != null && (!(alpha instanceof Uint8Array) || alpha.length !== width * height)) {
                throw new RangeError(`${name}: image alpha data does not match its size`);
            }
            return pixels;
        }

        // The deflated bytes, or null when there is no deflate or it fails
        // (the writer then keeps the stream uncompressed).
        async function compress(deflate, bytes) {
            if (!deflate) return null;
            try {
                const out = await deflate(bytes);
                return out instanceof Uint8Array ? out : null;
            } catch (error) {
                return null;
            }
        }

        return Object.freeze({
            num,
            factor,
            clamp01,
            channel8,
            colorComponents,
            graySamples,
            checkColor,
            isGradient,
            solidColor,
            normalizeStops,
            escapeString,
            pathOperators,
            hasDrawableSegments,
            packMask,
            checkPixels,
            compress
        });
    }

    /**
     * @description The shared PDF and EPS writer helpers for one writer,
     * created once per name. name starts every error message.
     */
    function writerKit(name) {
        const key = String(name || 'QRTurboGeometry');
        if (!WRITER_KITS.has(key)) WRITER_KITS.set(key, createWriterKit(key));
        return WRITER_KITS.get(key);
    }

    const api = {
        pathToSegments,
        arcToCubics,
        circle,
        rect,
        parseTransform,
        applyMatrix,
        flatten,
        writerKit
    };

    globalThis.QRTurboGeometry = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
