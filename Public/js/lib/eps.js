// QRTurbo.app - EPS writer (QRTurboEps)
// Pure, loaded lazily on the first EPS export: writes a Drawing as an
// EPSF-3.0 file in RGB, CMYK or K-only colors. LanguageLevel 2 unless a
// shading, a Flate stream or a masked logo needs LanguageLevel 3. The output
// is 7-bit ASCII (binary data goes through ASCII85) and never uses the
// operators that EPSF 3.0 forbids. Nothing from the QR payload is written.
(function () {
    'use strict';

    const LOGO_MAX_PX = 1024;
    const DATA_LINE = 76;
    const CURVE_STEPS = 8;

    /**
     * @description The shared writer helpers from QRTurboGeometry. The lazy
     * modules load in any order, so they are looked up on each write.
     */
    function writerKit() {
        const geometry = globalThis.QRTurboGeometry;
        if (!geometry || typeof geometry.writerKit !== 'function') {
            throw new Error('QRTurboEps: QRTurboGeometry is not loaded');
        }
        return geometry.writerKit('QRTurboEps');
    }

    function colorOperator(kit, rgb, mode) {
        const values = kit.colorComponents(rgb, mode).map(kit.num).join(' ');
        return mode === 'rgb' ? `${values} setrgbcolor` : `${values} setcmykcolor`;
    }

    function dscDate(date) {
        const d = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
        const p2 = value => String(value).padStart(2, '0');
        return `${String(d.getUTCFullYear()).padStart(4, '0')}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
    }

    /**
     * @description ASCII85 with the ~> end marker, in short lines. A line that
     * would start with % gets a leading space, so DSC readers never mistake
     * data for a comment (ASCII85Decode ignores white space). The ~> marker
     * always ends the last line, so a line break never splits it.
     */
    function ascii85(bytes) {
        const chunks = [];
        const n = bytes.length;
        const full = n - (n % 4);
        const digits = new Array(5);
        for (let i = 0; i < full; i += 4) {
            let value = ((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]) >>> 0;
            if (value === 0) {
                chunks.push('z');
                continue;
            }
            for (let j = 4; j >= 0; j--) {
                digits[j] = String.fromCharCode(33 + (value % 85));
                value = Math.floor(value / 85);
            }
            chunks.push(digits.join(''));
        }
        const rest = n - full;
        if (rest) {
            let value = 0;
            for (let j = 0; j < 4; j++) value = (value * 256) + (j < rest ? bytes[full + j] : 0);
            for (let j = 4; j >= 0; j--) {
                digits[j] = String.fromCharCode(33 + (value % 85));
                value = Math.floor(value / 85);
            }
            chunks.push(digits.slice(0, rest + 1).join(''));
        }
        const text = chunks.join('');
        const lines = [];
        for (let i = 0; i < text.length; i += DATA_LINE) {
            const line = text.slice(i, i + DATA_LINE);
            lines.push(line[0] === '%' ? ' ' + line : line);
        }
        if (lines.length) lines[lines.length - 1] += '~>';
        else lines.push('~>');
        return lines.join('\n');
    }

    /**
     * @description RunLengthDecode-compatible encoding (LanguageLevel 2),
     * ending with the EOD byte 128. A literal block only stops for a run of
     * 3 or more, so the output never exceeds n + ceil(n / 128) + 1 bytes.
     */
    function runLength(bytes) {
        const n = bytes.length;
        const out = new Uint8Array(n + Math.ceil(n / 128) + 2);
        let o = 0;
        let i = 0;
        while (i < n) {
            let run = 1;
            while (i + run < n && run < 128 && bytes[i + run] === bytes[i]) run++;
            if (run >= 2) {
                out[o++] = 257 - run;
                out[o++] = bytes[i];
                i += run;
                continue;
            }
            const start = i;
            let length = 0;
            while (i < n && length < 128 && !(i + 2 < n && bytes[i] === bytes[i + 1] && bytes[i] === bytes[i + 2])) {
                i++;
                length++;
            }
            out[o++] = length - 1;
            out.set(bytes.subarray(start, start + length), o);
            o += length;
        }
        out[o++] = 128;
        return out.subarray(0, o);
    }

    /**
     * @description Box-filters a logo down so its long side is at most max
     * pixels. Colors are weighted by alpha, so edges keep no dark fringe.
     */
    function downscale(pixels, max) {
        const { width, height, rgb, alpha } = pixels;
        const long = Math.max(width, height);
        if (long <= max) return pixels;
        const w = Math.max(1, Math.round(width * max / long));
        const h = Math.max(1, Math.round(height * max / long));
        const outRgb = new Uint8Array(w * h * 3);
        const outAlpha = alpha ? new Uint8Array(w * h) : null;
        for (let y = 0; y < h; y++) {
            const y0 = Math.floor(y * height / h);
            const y1 = Math.max(y0 + 1, Math.floor((y + 1) * height / h));
            for (let x = 0; x < w; x++) {
                const x0 = Math.floor(x * width / w);
                const x1 = Math.max(x0 + 1, Math.floor((x + 1) * width / w));
                let r = 0;
                let g = 0;
                let b = 0;
                let weight = 0;
                let alphaSum = 0;
                let count = 0;
                for (let sy = y0; sy < y1; sy++) {
                    for (let sx = x0; sx < x1; sx++) {
                        const i = (sy * width) + sx;
                        const a = alpha ? alpha[i] : 255;
                        r += rgb[i * 3] * a;
                        g += rgb[(i * 3) + 1] * a;
                        b += rgb[(i * 3) + 2] * a;
                        weight += a;
                        alphaSum += a;
                        count++;
                    }
                }
                const o = (y * w) + x;
                if (weight > 0) {
                    outRgb[o * 3] = Math.round(r / weight);
                    outRgb[(o * 3) + 1] = Math.round(g / weight);
                    outRgb[(o * 3) + 2] = Math.round(b / weight);
                }
                if (outAlpha) outAlpha[o] = Math.round(alphaSum / count);
            }
        }
        return { width: w, height: h, rgb: outRgb, alpha: outAlpha };
    }

    function flattenPolygons(segments) {
        const polygons = [];
        let current = null;
        let x = 0;
        let y = 0;
        let startX = 0;
        let startY = 0;
        for (const seg of segments) {
            const type = seg[0];
            if (type === 'M') {
                current = [[seg[1], seg[2]]];
                polygons.push(current);
                x = startX = seg[1];
                y = startY = seg[2];
            } else if (type === 'Z') {
                current = null;
                x = startX;
                y = startY;
            } else {
                if (!current) {
                    current = [[startX, startY]];
                    polygons.push(current);
                }
                if (type === 'L') {
                    current.push([seg[1], seg[2]]);
                } else {
                    for (let i = 1; i <= CURVE_STEPS; i++) {
                        const t = i / CURVE_STEPS;
                        const u = 1 - t;
                        current.push([
                            (u * u * u * x) + (3 * u * u * t * seg[1]) + (3 * u * t * t * seg[3]) + (t * t * t * seg[5]),
                            (u * u * u * y) + (3 * u * u * t * seg[2]) + (3 * u * t * t * seg[4]) + (t * t * t * seg[6])
                        ]);
                    }
                }
                x = seg[seg.length - 2];
                y = seg[seg.length - 1];
            }
        }
        return polygons;
    }

    function containsPoint(segments, evenOdd, px, py) {
        let winding = 0;
        let crossings = 0;
        for (const polygon of flattenPolygons(segments)) {
            for (let i = 0; i < polygon.length; i++) {
                const [x0, y0] = polygon[i];
                const [x1, y1] = polygon[(i + 1) % polygon.length];
                if ((y0 <= py) === (y1 <= py)) continue;
                const x = x0 + ((py - y0) * (x1 - x0) / (y1 - y0));
                if (x <= px) continue;
                crossings++;
                winding += y1 > y0 ? 1 : -1;
            }
        }
        return evenOdd ? (crossings % 2) === 1 : winding !== 0;
    }

    function gradientColorAt(kit, paint, x, y) {
        const stops = kit.normalizeStops(paint.stops);
        let t;
        if (paint.type === 'linear') {
            const dx = paint.x2 - paint.x1;
            const dy = paint.y2 - paint.y1;
            const len2 = (dx * dx) + (dy * dy);
            t = len2 ? (((x - paint.x1) * dx) + ((y - paint.y1) * dy)) / len2 : 0;
        } else {
            t = paint.r > 0 ? Math.hypot(x - paint.cx, y - paint.cy) / paint.r : 0;
        }
        t = kit.clamp01(t);
        for (let i = 0; i < stops.length - 1; i++) {
            const a = stops[i];
            const b = stops[i + 1];
            if (t <= b.offset) {
                const f = b.offset > a.offset ? (t - a.offset) / (b.offset - a.offset) : 0;
                return [0, 1, 2].map(index => a.color[index] + (f * (b.color[index] - a.color[index])));
            }
        }
        return stops[stops.length - 1].color;
    }

    /**
     * @description The color painted under the given point by the fills
     * that precede the image, or null when nothing opaque is there.
     */
    function backdropColor(kit, fills, x, y) {
        for (let i = fills.length - 1; i >= 0; i--) {
            const item = fills[i];
            if (!containsPoint(item.d, item.fillRule === 'evenodd', x, y)) continue;
            return kit.isGradient(item.paint) ? gradientColorAt(kit, item.paint, x, y) : kit.solidColor(item.paint);
        }
        return null;
    }

    function functionDict(kit, stops, mode) {
        const { num } = kit;
        const components = stops.map(stop => `[${kit.colorComponents(stop.color, mode).map(num).join(' ')}]`);
        const pair = (a, b) => `<< /FunctionType 2 /Domain [0 1] /C0 ${a} /C1 ${b} /N 1 >>`;
        if (stops.length === 2 && stops[0].offset === 0 && stops[1].offset === 1) {
            return [`/Function ${pair(components[0], components[1])}`];
        }
        const lines = ['/Function << /FunctionType 3 /Domain [0 1] /Functions ['];
        for (let i = 0; i < stops.length - 1; i++) lines.push(pair(components[i], components[i + 1]));
        lines.push(`] /Bounds [${stops.slice(1, -1).map(stop => num(stop.offset)).join(' ')}]`);
        lines.push(`/Encode [${stops.slice(0, -1).map(() => '0 1').join(' ')}] >>`);
        return lines;
    }

    function shadingLines(kit, paint, mode) {
        const { num } = kit;
        const stops = kit.normalizeStops(paint.stops);
        const coords = paint.type === 'linear'
            ? [paint.x1, paint.y1, paint.x2, paint.y2]
            : [paint.cx, paint.cy, 0, paint.cx, paint.cy, paint.r];
        return [
            `<< /ShadingType ${paint.type === 'linear' ? 2 : 3} /ColorSpace ${mode === 'rgb' ? '/DeviceRGB' : '/DeviceCMYK'}`,
            `/Coords [${coords.map(num).join(' ')}]`,
            ...functionDict(kit, stops, mode),
            '/Extend [true true] >> shfill'
        ];
    }

    function encodingLines(names) {
        const lines = ['/Encoding ['];
        for (let i = 0; i < 256; i += 8) {
            lines.push(names.slice(i, i + 8).map(name => '/' + (name || '.notdef')).join(' '));
        }
        lines.push('] def');
        return lines;
    }

    function pageSize(drawing, o) {
        const widthPt = Number(o.widthPt);
        if (!(widthPt > 0) || !Number.isFinite(widthPt)) throw new RangeError('QRTurboEps: widthPt must be positive');
        const dw = Number(drawing.width);
        const dh = Number(drawing.height);
        if (!(dw > 0) || !(dh > 0)) throw new RangeError('QRTurboEps: the drawing has no size');
        const s = widthPt / dw;
        return { s, w: widthPt, h: dh * s };
    }

    /**
     * @description Writes the Drawing as an EPSF-3.0 file (one page, y-flip
     * through the page transform). Resolves to the file text.
     */
    async function write(drawing, o) {
        const options = o || {};
        if (!drawing || !Array.isArray(drawing.items)) throw new TypeError('QRTurboEps: invalid drawing');
        const mode = options.colorMode === 'cmyk' || options.colorMode === 'k' ? options.colorMode : 'rgb';
        const deflate = typeof options.deflate === 'function' ? options.deflate : null;
        const kit = writerKit();
        const { num, factor, isGradient, solidColor, pathOperators, hasDrawableSegments, escapeString } = kit;
        const helvetica = globalThis.QRTurboHelvetica;
        const page = pageSize(drawing, options);
        const body = [];
        const fills = [];
        let level3 = false;
        let usesText = false;

        function fillPath(item) {
            if (!hasDrawableSegments(item.d)) return;
            const evenOdd = item.fillRule === 'evenodd';
            if (isGradient(item.paint)) {
                level3 = true;
                body.push('gsave', 'newpath', ...pathOperators(item.d), evenOdd ? 'eoclip' : 'clip', 'newpath',
                    ...shadingLines(kit, item.paint, mode), 'grestore');
            } else {
                body.push('newpath', colorOperator(kit, solidColor(item.paint), mode), ...pathOperators(item.d), evenOdd ? 'eofill' : 'fill');
            }
            fills.push(item);
        }

        function strokePath(item) {
            if (!hasDrawableSegments(item.d)) return;
            const width = Number(item.lineWidth);
            if (!(width > 0)) return;
            body.push('newpath', `${num(width)} setlinewidth`, colorOperator(kit, solidColor(item.paint), mode),
                ...pathOperators(item.d), 'stroke');
        }

        function text(item) {
            const value = String(item.text == null ? '' : item.text);
            if (!value) return;
            if (!helvetica || typeof helvetica.canEncode !== 'function') {
                throw new Error('QRTurboEps: QRTurboHelvetica is not loaded');
            }
            if (!helvetica.canEncode(value)) {
                throw new RangeError('QRTurboEps: text outside WinAnsi must be passed as a mask');
            }
            let size = Number(item.fontSize);
            if (!(size > 0)) return;
            const width = helvetica.measure(value, size);
            const maxWidth = Number(item.maxWidth);
            if (maxWidth > 0 && width > maxWidth) size = size * maxWidth / width;
            usesText = true;
            const shown = `(${escapeString(helvetica.encode(value))})`;
            let show = `${shown} dup stringwidth pop 2 div neg 0 rmoveto show`;
            if (item.anchor === 'start') show = `${shown} show`;
            else if (item.anchor === 'end') show = `${shown} dup stringwidth pop neg 0 rmoveto show`;
            body.push('newpath', colorOperator(kit, solidColor(item.paint), mode),
                `/QRTurboHB findfont [${num(size)} 0 0 ${num(-size)} 0 0] makefont setfont`,
                `${num(item.x)} ${num(item.y)} moveto`, show);
        }

        function placement(item) {
            return `${num(item.x)} ${num(item.y)} translate ${num(item.width)} ${num(item.height)} scale`;
        }

        function dataSource(filterName) {
            return `/DataSource QRTurboData /${filterName} filter`;
        }

        function mask(item) {
            if (!(item.width > 0) || !(item.height > 0)) return;
            const bits = kit.packMask(item);
            const { cols, rows } = item;
            body.push(
                'gsave',
                colorOperator(kit, solidColor(item.paint), mode),
                placement(item),
                '/QRTurboData currentfile /ASCII85Decode filter def',
                `{<< /ImageType 1 /Width ${cols} /Height ${rows} /ImageMatrix [${cols} 0 0 ${rows} 0 0]`,
                `/BitsPerComponent 1 /Decode [1 0] ${dataSource('RunLengthDecode')} >> imagemask QRTurboData flushfile} exec`,
                ascii85(runLength(bits)),
                'grestore'
            );
        }

        async function encodeData(raw) {
            const packed = await kit.compress(deflate, raw);
            if (packed) {
                level3 = true;
                return { filter: 'FlateDecode', data: packed };
            }
            return { filter: 'RunLengthDecode', data: runLength(raw) };
        }

        async function image(item) {
            const source = kit.checkPixels(item.pixels);
            if (!source || !(item.width > 0) || !(item.height > 0)) return;
            const pixels = downscale(source, LOGO_MAX_PX);
            const { width, height } = pixels;
            const count = width * height;
            const gray = mode === 'k';
            const channels = gray ? 1 : 3;
            const translucent = Boolean(pixels.alpha) && pixels.alpha.some(value => value < 255);
            const backdrop = translucent
                ? backdropColor(kit, fills, Number(item.x) + (item.width / 2), Number(item.y) + (item.height / 2))
                : null;
            const rgb = new Uint8Array(pixels.rgb);
            if (translucent && backdrop) {
                const bg = backdrop.map(kit.channel8);
                for (let i = 0; i < count; i++) {
                    const a = pixels.alpha[i] / 255;
                    for (let c = 0; c < 3; c++) {
                        rgb[(i * 3) + c] = Math.round((rgb[(i * 3) + c] * a) + (bg[c] * (1 - a)));
                    }
                }
            }
            // K-only: the perceptual gray of each pixel, as for the paint colors.
            const samples = gray ? kit.graySamples(rgb, count) : rgb;
            const space = gray ? '/DeviceGray' : '/DeviceRGB';
            const decode = gray ? '[0 1]' : '[0 1 0 1 0 1]';
            const matrix = `/ImageMatrix [${width} 0 0 ${height} 0 0]`;
            const masked = translucent && !backdrop;
            let raw = samples;
            if (masked) {
                // InterleaveType 2: each 1-bit mask row (alpha >= 128 paints)
                // is followed by its image row.
                const maskRow = Math.ceil(width / 8);
                const dataRow = width * channels;
                raw = new Uint8Array((maskRow + dataRow) * height);
                for (let y = 0; y < height; y++) {
                    const offset = y * (maskRow + dataRow);
                    for (let x = 0; x < width; x++) {
                        if (pixels.alpha[(y * width) + x] >= 128) raw[offset + (x >> 3)] |= 0x80 >> (x & 7);
                    }
                    raw.set(samples.subarray(y * dataRow, (y + 1) * dataRow), offset + maskRow);
                }
                level3 = true;
            }
            const encoded = await encodeData(raw);
            body.push('gsave', placement(item), `${space} setcolorspace`, '/QRTurboData currentfile /ASCII85Decode filter def');
            if (masked) {
                body.push(
                    '{<< /ImageType 3 /InterleaveType 2',
                    `/DataDict << /ImageType 1 /Width ${width} /Height ${height} ${matrix} /BitsPerComponent 8 /Decode ${decode}`,
                    `${dataSource(encoded.filter)} >>`,
                    `/MaskDict << /ImageType 1 /Width ${width} /Height ${height} ${matrix} /BitsPerComponent 1 /Decode [1 0] >>`,
                    '>> image QRTurboData flushfile} exec'
                );
            } else {
                body.push(
                    `{<< /ImageType 1 /Width ${width} /Height ${height} ${matrix} /BitsPerComponent 8 /Decode ${decode}`,
                    `${dataSource(encoded.filter)} >> image QRTurboData flushfile} exec`
                );
            }
            body.push(ascii85(encoded.data), 'grestore');
        }

        async function items(list) {
            if (!Array.isArray(list)) throw new TypeError('QRTurboEps: items must be a list');
            for (const item of list) {
                if (!item) continue;
                switch (item.kind) {
                    case 'path': fillPath(item); break;
                    case 'stroke': strokePath(item); break;
                    case 'text': text(item); break;
                    case 'image': await image(item); break;
                    case 'mask': mask(item); break;
                    case 'group': await group(item); break;
                    default: throw new TypeError('QRTurboEps: unknown drawing item');
                }
            }
        }

        async function group(item) {
            if (!item.clip) {
                await items(item.items);
                return;
            }
            if (!hasDrawableSegments(item.clip.d)) return;
            body.push('gsave', 'newpath', ...pathOperators(item.clip.d), item.clip.fillRule === 'evenodd' ? 'eoclip' : 'clip', 'newpath');
            await items(item.items);
            body.push('grestore');
        }

        await items(drawing.items);

        const prolog = ['/m {moveto} bind def /l {lineto} bind def /c {curveto} bind def /h {closepath} bind def'];
        if (usesText) {
            prolog.push(
                '/QRTurboHB /Helvetica-Bold findfont dup length dict begin',
                '{1 index /FID ne {def} {pop pop} ifelse} forall',
                ...encodingLines(helvetica.GLYPH_NAMES),
                'currentdict end definefont pop'
            );
        }
        const lines = [
            '%!PS-Adobe-3.0 EPSF-3.0',
            `%%BoundingBox: 0 0 ${Math.ceil(page.w - 1e-6)} ${Math.ceil(page.h - 1e-6)}`,
            `%%HiResBoundingBox: 0 0 ${num(page.w)} ${num(page.h)}`,
            '%%Creator: QRTurbo.app',
            '%%Title: (QR code)',
            `%%CreationDate: (${dscDate(options.date)})`,
            `%%LanguageLevel: ${level3 ? 3 : 2}`,
            '%%DocumentData: Clean7Bit',
            ...(usesText ? ['%%DocumentNeededResources: font Helvetica-Bold'] : []),
            '%%Pages: 1',
            '%%EndComments',
            '%%BeginProlog',
            ...prolog,
            '%%EndProlog',
            '%%Page: 1 1',
            // The scale keeps 8 significant digits, so the artwork spans the
            // HiResBoundingBox exactly.
            `gsave 0 ${num(page.h)} translate ${factor(page.s)} ${factor(-page.s)} scale`,
            ...body,
            'grestore',
            'showpage',
            '%%EOF'
        ];
        return lines.join('\n') + '\n';
    }

    const api = {
        // write(d: Drawing, o: { widthPt, colorMode: 'rgb'|'cmyk'|'k', deflate?, date? }): Promise<string>
        write
    };

    globalThis.QRTurboEps = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
