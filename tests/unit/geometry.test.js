const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const jsQR = require('jsqr');
const QRTurboGeometry = require('../../Public/js/lib/geometry.js');
const QRTurboSvg = require('../../Public/js/lib/svg.js');
const frame = require('../../Public/js/frame.js');

const fixtureDir = path.join(__dirname, '../fixtures/library-svg');
const fixtureNames = fs.readdirSync(fixtureDir).filter(name => name.endsWith('.svg')).sort();
const readFixture = name => fs.readFileSync(path.join(fixtureDir, name), 'utf8');

// What each fixture encodes ('A' unless listed).
const FIXTURE_PAYLOADS = {
  'g-ref.svg': 'https://qrturbo.app/?ref=geom',
  'image.svg': 'https://qrturbo.app'
};
// Their corner centers are light (#00ff00 or a green gradient stop), so jsQR
// cannot find the finder patterns. Chromium's own render of these fixtures
// does not decode either; they are decoded after a binary threshold instead.
const UNDECODABLE_FIXTURES = new Set(['cdot-dot.svg', 'cdot-square.svg', 'grad-corners.svg']);

const close = (actual, expected, tolerance, label) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} is not within ${tolerance} of ${expected}`);
};

function walk(node, visit) {
  visit(node);
  for (const child of node.children) walk(child, visit);
}

function walkItems(items, visit) {
  for (const item of items) {
    visit(item);
    if (item.kind === 'group') walkItems(item.items, visit);
  }
}

function cubicPoint(p0, seg, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * seg[1] + 3 * u * t * t * seg[3] + t * t * t * seg[5],
    u * u * u * p0[1] + 3 * u * u * t * seg[2] + 3 * u * t * t * seg[4] + t * t * t * seg[6]
  ];
}

// ---- a tiny scanline rasterizer for Drawings ------------------------------

/** Splits segments into closed polygons in pixel space (cubics sampled). */
function toPolygons(segs, scale) {
  const polygons = [];
  let current = null;
  let start = [0, 0];
  let point = [0, 0];
  const flush = () => {
    if (current && current.length > 2) polygons.push(current);
  };
  for (const seg of segs) {
    if (seg[0] === 'M') {
      flush();
      point = [seg[1] * scale, seg[2] * scale];
      start = point;
      current = [point];
    } else if (seg[0] === 'L') {
      point = [seg[1] * scale, seg[2] * scale];
      current.push(point);
    } else if (seg[0] === 'C') {
      const scaled = ['C', ...seg.slice(1).map(value => value * scale)];
      for (let i = 1; i <= 12; i += 1) current.push(cubicPoint(point, scaled, i / 12));
      point = [scaled[5], scaled[6]];
    } else {
      flush();
      current = [start];
      point = start;
    }
  }
  flush();
  return polygons;
}

/** Coverage mask sampled at pixel centers with the nonzero or evenodd rule. */
function fillMask(polygons, rule, width, height) {
  const mask = new Uint8Array(width * height);
  const rows = Array.from({ length: height }, () => []);
  for (const polygon of polygons) {
    for (let i = 0; i < polygon.length; i += 1) {
      const a = polygon[i];
      const b = polygon[(i + 1) % polygon.length];
      if (a[1] === b[1]) continue;
      const edge = a[1] < b[1] ? [a[0], a[1], b[0], b[1], 1] : [b[0], b[1], a[0], a[1], -1];
      const first = Math.max(0, Math.ceil(edge[1] - 0.5));
      const last = Math.min(height - 1, Math.ceil(edge[3] - 0.5) - 1);
      for (let row = first; row <= last; row += 1) rows[row].push(edge);
    }
  }
  for (let row = 0; row < height; row += 1) {
    const y = row + 0.5;
    const crossings = rows[row]
      .map(edge => [edge[0] + (y - edge[1]) * (edge[2] - edge[0]) / (edge[3] - edge[1]), edge[4]])
      .sort((a, b) => a[0] - b[0]);
    let winding = 0;
    for (let i = 0; i + 1 < crossings.length; i += 1) {
      winding = rule === 'evenodd' ? winding ^ 1 : winding + crossings[i][1];
      if (!winding) continue;
      const from = Math.max(0, Math.ceil(crossings[i][0] - 0.5));
      const to = Math.min(width - 1, Math.ceil(crossings[i + 1][0] - 0.5) - 1);
      for (let col = from; col <= to; col += 1) mask[row * width + col] = 1;
    }
  }
  return mask;
}

function paintAt(paint, x, y) {
  if (paint.type === 'solid') return paint.color;
  let t;
  if (paint.type === 'linear') {
    const dx = paint.x2 - paint.x1;
    const dy = paint.y2 - paint.y1;
    const length = dx * dx + dy * dy;
    t = length ? ((x - paint.x1) * dx + (y - paint.y1) * dy) / length : 0;
  } else {
    t = Math.hypot(x - paint.cx, y - paint.cy) / paint.r;
  }
  t = Math.max(0, Math.min(1, t));
  const { stops } = paint;
  if (t <= stops[0].offset) return stops[0].color;
  for (let i = 1; i < stops.length; i += 1) {
    if (t <= stops[i].offset) {
      const span = stops[i].offset - stops[i - 1].offset;
      const f = span > 0 ? (t - stops[i - 1].offset) / span : 1;
      return stops[i - 1].color.map((value, k) => value + (stops[i].color[k] - value) * f);
    }
  }
  return stops[stops.length - 1].color;
}

/** Stroke outlines: one quad per sampled line piece (no joins or caps). */
function strokePolygons(segs, lineWidth, scale) {
  const half = lineWidth * scale / 2;
  const quads = [];
  for (const line of toPolygons(segs, scale)) {
    for (let i = 0; i < line.length; i += 1) {
      const [x0, y0] = line[i];
      const [x1, y1] = line[(i + 1) % line.length];
      const length = Math.hypot(x1 - x0, y1 - y0);
      if (!length) continue;
      const nx = -(y1 - y0) / length * half;
      const ny = (x1 - x0) / length * half;
      quads.push([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]);
    }
  }
  return quads;
}

/** Rasterizes a Drawing onto white RGBA at `scale` pixels per unit. Text is skipped. */
function rasterize(drawing, scale) {
  const width = Math.ceil(drawing.width * scale);
  const height = Math.ceil(drawing.height * scale);
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  const paintMask = (mask, clip, paint) => {
    for (let i = 0; i < mask.length; i += 1) {
      if (!mask[i] || (clip && !clip[i])) continue;
      const color = paintAt(paint, ((i % width) + 0.5) / scale, (Math.floor(i / width) + 0.5) / scale);
      for (let k = 0; k < 3; k += 1) data[i * 4 + k] = Math.round(color[k] * 255);
    }
  };
  const draw = (items, clip) => {
    for (const item of items) {
      if (item.kind === 'path') {
        paintMask(fillMask(toPolygons(item.d, scale), item.fillRule, width, height), clip, item.paint);
      } else if (item.kind === 'stroke') {
        paintMask(fillMask(strokePolygons(item.d, item.lineWidth, scale), 'nonzero', width, height), clip, item.paint);
      } else if (item.kind === 'group') {
        let next = clip;
        if (item.clip) {
          const own = fillMask(toPolygons(item.clip.d, scale), item.clip.fillRule, width, height);
          next = clip ? own.map((value, i) => value & clip[i]) : own;
        }
        draw(item.items, next);
      } else if (item.kind === 'image' && item.pixels) {
        const pixels = item.pixels;
        for (let i = 0; i < width * height; i += 1) {
          const x = ((i % width) + 0.5) / scale;
          const y = (Math.floor(i / width) + 0.5) / scale;
          if ((clip && !clip[i]) || x < item.x || y < item.y || x >= item.x + item.width || y >= item.y + item.height) continue;
          const px = Math.min(pixels.width - 1, Math.floor((x - item.x) / item.width * pixels.width));
          const py = Math.min(pixels.height - 1, Math.floor((y - item.y) / item.height * pixels.height));
          const alpha = pixels.alpha ? pixels.alpha[py * pixels.width + px] / 255 : 1;
          for (let k = 0; k < 3; k += 1) {
            data[i * 4 + k] = Math.round(data[i * 4 + k] * (1 - alpha) + pixels.rgb[(py * pixels.width + px) * 3 + k] * alpha);
          }
        }
      }
    }
  };
  draw(drawing.items, null);
  return { width, height, data };
}

function decodeDrawing(drawing, scale, threshold = false) {
  const image = rasterize(drawing, scale);
  if (threshold) {
    // Anything that is not the white background becomes black.
    for (let i = 0; i < image.data.length; i += 4) {
      const white = image.data[i] === 255 && image.data[i + 1] === 255 && image.data[i + 2] === 255;
      image.data.fill(white ? 255 : 0, i, i + 3);
    }
  }
  const result = jsQR(image.data, image.width, image.height);
  return result ? result.data : null;
}

function pixelAt(image, x, y) {
  const i = (y * image.width + x) * 4;
  return [image.data[i], image.data[i + 1], image.data[i + 2]];
}

/** A resolveImage stand-in: a solid gray logo with the PNG's natural size. */
async function fakeResolveImage(href) {
  const bytes = Buffer.from(href.slice(href.indexOf(',') + 1), 'base64');
  const naturalWidth = bytes.readUInt32BE(16);
  const naturalHeight = bytes.readUInt32BE(20);
  const width = Math.ceil(naturalWidth / 4);
  const height = Math.ceil(naturalHeight / 4);
  return { width, height, naturalWidth, naturalHeight, rgb: new Uint8Array(width * height * 3).fill(96), alpha: null };
}

function flattenMarkup(markup, options = {}) {
  return QRTurboGeometry.flatten(QRTurboSvg.parse(markup), options);
}

function signedArea(polygon) {
  let area = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const [x0, y0] = polygon[i];
    const [x1, y1] = polygon[(i + 1) % polygon.length];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
}

function subpathCount(d) {
  return (String(d).match(/[Mm]/g) || []).length;
}

// ---- primitives -------------------------------------------------------------

test('arcToCubics follows the ellipse in pieces of at most 90 degrees and ends exactly at the endpoint', () => {
  const ellipsePoint = (cx, cy, rx, ry, phiDeg, tDeg) => {
    const phi = phiDeg * Math.PI / 180;
    const t = tDeg * Math.PI / 180;
    return [
      cx + rx * Math.cos(t) * Math.cos(phi) - ry * Math.sin(t) * Math.sin(phi),
      cy + rx * Math.cos(t) * Math.sin(phi) + ry * Math.sin(t) * Math.cos(phi)
    ];
  };
  // [center, rx, ry, phi, start angle, end angle]: the arc runs from the
  // start to the end angle in the direction of their difference.
  const cases = [
    [[0, 0], 10, 10, 0, 0, 90, 1],
    [[0, 0], 10, 10, 0, 0, 270, 3],
    [[5, 5], 20, 10, 30, 10, 200, 3],
    [[5, 5], 20, 10, 30, 10, -100, 2],
    [[-3, 7], 4, 9, -45, 170, 10, 2],
    [[35, 35], 35, 35, 0, -90, 269.9, 4]
  ];
  for (const [[cx, cy], rx, ry, phi, from, to, expectedPieces] of cases) {
    const label = `arc around ${cx},${cy} from ${from} to ${to}`;
    const [x1, y1] = ellipsePoint(cx, cy, rx, ry, phi, from);
    const [x2, y2] = ellipsePoint(cx, cy, rx, ry, phi, to);
    const delta = to - from;
    const pieces = QRTurboGeometry.arcToCubics(x1, y1, rx, ry, phi, Math.abs(delta) > 180 ? 1 : 0, delta > 0, x2, y2);
    assert.equal(pieces.length, expectedPieces, label);
    assert.ok(pieces.every(piece => piece[0] === 'C' && piece.length === 7), label);
    const last = pieces[pieces.length - 1];
    assert.equal(last[5], x2, `${label}: exact end x`);
    assert.equal(last[6], y2, `${label}: exact end y`);

    const angle = phi * Math.PI / 180;
    let startPoint = [x1, y1];
    for (const piece of pieces) {
      for (let i = 0; i <= 8; i += 1) {
        const [x, y] = cubicPoint(startPoint, piece, i / 8);
        const u = Math.cos(angle) * (x - cx) + Math.sin(angle) * (y - cy);
        const v = -Math.sin(angle) * (x - cx) + Math.cos(angle) * (y - cy);
        close(Math.hypot(u / rx, v / ry), 1, 1e-3, `${label}: sample on the ellipse`);
      }
      startPoint = [piece[5], piece[6]];
    }
    assert.ok(Math.abs(delta) / pieces.length <= 90 + 1e-9, `${label}: pieces span at most 90 degrees`);
  }
});

test('arcToCubics matches a quarter circle within 1e-3 and handles degenerate arcs', () => {
  const [piece] = QRTurboGeometry.arcToCubics(10, 0, 10, 10, 0, 0, 1, 0, 10);
  const k = 4 / 3 * Math.tan(Math.PI / 8) * 10;
  close(piece[1], 10, 1e-9, 'c1x');
  close(piece[2], k, 1e-9, 'c1y');
  close(piece[3], k, 1e-9, 'c2x');
  close(piece[4], 10, 1e-9, 'c2y');
  for (let i = 0; i <= 10; i += 1) {
    const [x, y] = cubicPoint([10, 0], piece, i / 10);
    close(Math.hypot(x, y), 10, 1e-3 * 10, `quarter sample ${i}`);
  }

  assert.deepEqual(QRTurboGeometry.arcToCubics(1, 1, 5, 5, 0, 0, 0, 1, 1), [], 'equal endpoints draw nothing');
  assert.deepEqual(QRTurboGeometry.arcToCubics(0, 0, 0, 5, 0, 0, 0, 3, 4), [['L', 3, 4]], 'a zero radius is a line');
  assert.deepEqual(QRTurboGeometry.arcToCubics(0, 0, 5, Number.NaN, 0, 0, 0, 3, 4), [['L', 3, 4]]);

  // Radii too small for the endpoints are scaled up to a half ellipse.
  const half = QRTurboGeometry.arcToCubics(0, 0, 1, 1, 0, 0, 1, 10, 0);
  assert.equal(half.length, 2);
  const top = cubicPoint([0, 0], half[0], 1);
  close(top[0], 5, 1e-9, 'half circle apex x');
  close(Math.abs(top[1]), 5, 1e-9, 'half circle apex y');
});

test('circle is 4 cubics with kappa handles, clockwise on screen', () => {
  const segs = QRTurboGeometry.circle(5, 105, 5);
  assert.equal(segs.length, 6);
  assert.deepEqual(segs[0], ['M', 10, 105]);
  assert.deepEqual(segs.map(seg => seg[0]), ['M', 'C', 'C', 'C', 'C', 'Z']);
  assert.deepEqual(segs.slice(1, 5).map(seg => [seg[5], seg[6]]), [[5, 110], [0, 105], [5, 100], [10, 105]]);
  close(segs[1][2], 105 + 0.5522847498 * 5, 1e-12, 'kappa');
  assert.ok(signedArea(toPolygons(segs, 1)[0]) > 0, 'positive area in y-down coordinates is clockwise on screen');
  assert.deepEqual(QRTurboGeometry.circle(0, 0, 0), []);
  assert.deepEqual(QRTurboGeometry.circle(0, 0, -1), []);
});

test('rect builds plain and rounded rectangles', () => {
  assert.deepEqual(QRTurboGeometry.rect(1, 2, 3, 4), [['M', 1, 2], ['L', 4, 2], ['L', 4, 6], ['L', 1, 6], ['Z']]);
  assert.deepEqual(QRTurboGeometry.rect(0, 0, 0, 4), []);
  assert.deepEqual(QRTurboGeometry.rect(0, 0, 4, -1), []);

  const rounded = QRTurboGeometry.rect(0, 0, 210, 210, 52.5);
  assert.deepEqual(rounded.map(seg => seg[0]), ['M', 'L', 'C', 'L', 'C', 'L', 'C', 'L', 'C', 'Z']);
  assert.deepEqual(rounded[0], ['M', 52.5, 0]);
  assert.deepEqual(rounded[2].slice(5), [210, 52.5]);

  // rx and ry (= rx) are clamped to half the width and half the height.
  const clamped = QRTurboGeometry.rect(0, 0, 100, 20, 50);
  assert.deepEqual(clamped.map(seg => seg[0]), ['M', 'C', 'C', 'C', 'C', 'Z']);
  assert.deepEqual(clamped[0], ['M', 50, 0]);
  assert.deepEqual(clamped[1].slice(5), [100, 10]);
  const elliptic = QRTurboGeometry.rect(0, 0, 100, 20, 30, 5);
  assert.deepEqual(elliptic[0], ['M', 30, 0]);
  assert.deepEqual(elliptic[2].slice(5), [100, 5]);
});

test('pathToSegments handles every command, relative coordinates and glued numbers', () => {
  const segs = QRTurboGeometry.pathToSegments('M10-5L.5.5l1e1,0H30h-5V0v2.5C1 2 3 4 5 6c1 1 2 2 3 3S9 9 10 10s1 1 2 2Q20 20 30 10q5 5 10 0T60 10t10 0A5 5 0 0 1 90 10a5 5 0 105 5Z');
  assert.deepEqual(segs.slice(0, 9), [
    ['M', 10, -5],
    ['L', 0.5, 0.5],
    ['L', 10.5, 0.5],
    ['L', 30, 0.5],
    ['L', 25, 0.5],
    ['L', 25, 0],
    ['L', 25, 2.5],
    ['C', 1, 2, 3, 4, 5, 6],
    ['C', 6, 7, 7, 8, 8, 9]
  ]);
  // S reflects the previous second control point (7, 8) about (8, 9).
  assert.deepEqual(segs[9], ['C', 9, 10, 9, 9, 10, 10]);
  assert.deepEqual(segs[10], ['C', 11, 11, 11, 11, 12, 12]);
  // Q becomes an exact cubic: controls at 2/3 toward the quadratic control.
  const q = segs[11];
  close(q[1], 12 + 2 / 3 * 8, 1e-12, 'Q c1x');
  close(q[3], 30 + 2 / 3 * -10, 1e-12, 'Q c2x');
  assert.deepEqual(q.slice(5), [30, 10]);
  assert.deepEqual(segs[12].slice(5), [40, 10]);
  // T reflects the previous quadratic control (35, 15) about (40, 10) to (45, 5).
  close(segs[13][2], 10 + 2 / 3 * -5, 1e-12, 'T c1y');
  assert.deepEqual(segs[13].slice(5), [60, 10]);
  assert.deepEqual(segs[14].slice(5), [70, 10]);
  const last = segs[segs.length - 2];
  assert.deepEqual(last.slice(5), [95, 15], 'glued arc flags "105 5" read as 1, 0, 5, 5');
  assert.deepEqual(segs[segs.length - 1], ['Z']);
});

test('pathToSegments resets the current point after z and starts implicit subpaths', () => {
  assert.deepEqual(
    QRTurboGeometry.pathToSegments('M 0 0v 70h 70v -70zM 10 10h 50v 50h -50z'),
    [['M', 0, 0], ['L', 0, 70], ['L', 70, 70], ['L', 70, 0], ['Z'], ['M', 10, 10], ['L', 60, 10], ['L', 60, 60], ['L', 10, 60], ['Z']]
  );
  const ring = QRTurboGeometry.pathToSegments('M 35 0a 35 35 0 1 0 0.1 0zm 0 10a 25 25 0 1 1 -0.1 0Z');
  const moves = ring.filter(seg => seg[0] === 'M');
  assert.deepEqual(moves, [['M', 35, 0], ['M', 35, 10]], 'm after z is relative to the subpath start');

  assert.deepEqual(
    QRTurboGeometry.pathToSegments('M1 1 2 2 3 3m1 1 1 0Zl1 0'),
    [['M', 1, 1], ['L', 2, 2], ['L', 3, 3], ['M', 4, 4], ['L', 5, 4], ['Z'], ['M', 4, 4], ['L', 5, 4]]
  );
});

test('pathToSegments keeps what precedes an error, like browsers', () => {
  assert.deepEqual(QRTurboGeometry.pathToSegments('M0 0L10 0L10 x 20 20'), [['M', 0, 0], ['L', 10, 0]]);
  assert.deepEqual(QRTurboGeometry.pathToSegments('L 10 10'), [], 'path data must start with a moveto');
  assert.deepEqual(QRTurboGeometry.pathToSegments('M 0 0 Z 5 5'), [['M', 0, 0], ['Z']]);
  assert.deepEqual(QRTurboGeometry.pathToSegments('M0 0 A 5 5 0 2 0 10 10'), [], 'an arc flag must be 0 or 1');
  assert.deepEqual(QRTurboGeometry.pathToSegments('M 0 0 M 5 5'), [], 'lone movetos draw nothing');
  assert.deepEqual(QRTurboGeometry.pathToSegments(''), []);
  assert.deepEqual(QRTurboGeometry.pathToSegments(undefined), []);
});

test('parseTransform composes transform lists in order', () => {
  const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

  const rotate = QRTurboGeometry.parseTransform('rotate(90,175,35)');
  assert.deepEqual(rotate, [0, 1, -1, 0, 210, -140], 'exact for multiples of 90 degrees');
  assert.deepEqual(apply(rotate, 175, 35), [175, 35], 'the center stays');
  assert.deepEqual(apply(rotate, 176, 35), [175, 36], 'x+ turns to y+ (clockwise on screen)');
  assert.deepEqual(apply(QRTurboGeometry.parseTransform('rotate(-90 35 175)'), 36, 175), [35, 174]);
  assert.deepEqual(QRTurboGeometry.parseTransform('rotate(0,5,105)'), [1, 0, 0, 1, 0, 0]);

  assert.deepEqual(QRTurboGeometry.parseTransform('translate(10) scale(2,3)'), [2, 0, 0, 3, 10, 0]);
  assert.deepEqual(QRTurboGeometry.parseTransform('scale(2) translate(10, 5)'), [2, 0, 0, 2, 20, 10]);
  assert.deepEqual(QRTurboGeometry.parseTransform(' matrix(1 2 3 4 5 6) '), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(QRTurboGeometry.parseTransform('scale(.5.5)'), [0.5, 0, 0, 0.5, 0, 0]);
  const skew = QRTurboGeometry.parseTransform('skewX(45)');
  close(skew[2], 1, 1e-12, 'skewX');
  const rotate30 = QRTurboGeometry.parseTransform('rotate(30)');
  close(rotate30[1], 0.5, 1e-12, 'rotate(30) sin');

  for (const invalid of ['foo(1)', 'rotate(1,2)', 'translate()', 'matrix(1 2 3)', 'scale(a)', 'translate(1) x']) {
    assert.deepEqual(QRTurboGeometry.parseTransform(invalid), [1, 0, 0, 1, 0, 0], invalid);
  }
  assert.deepEqual(QRTurboGeometry.parseTransform(''), [1, 0, 0, 1, 0, 0]);
  assert.deepEqual(QRTurboGeometry.parseTransform(null), [1, 0, 0, 1, 0, 0]);
});

test('applyMatrix maps points, rounds to 3 decimals and leaves the input alone', () => {
  const input = [['M', 0, 0], ['L', 1, 0], ['C', 1, 1, 2, 2, 3, 3], ['Z']];
  const frozen = JSON.stringify(input);
  const rotated = QRTurboGeometry.applyMatrix(input, QRTurboGeometry.parseTransform('rotate(30)'));
  assert.deepEqual(rotated[1], ['L', 0.866, 0.5]);
  assert.deepEqual(rotated[3], ['Z']);
  assert.equal(JSON.stringify(input), frozen);

  const noisy = QRTurboGeometry.applyMatrix([['M', 1e-17, -0.0001]], [1, 0, 0, 1, 0, 0]);
  assert.ok(Object.is(noisy[0][1], 0) && Object.is(noisy[0][2], 0), 'no -0 and no float noise');
  assert.deepEqual(QRTurboGeometry.applyMatrix([['L', 1.23456, 2]]), [['L', 1.235, 2]], 'identity by default');
});

test('rotation keeps the opposite winding of evenodd ring subpaths', () => {
  const rings = [
    'M 0 0v 70h 70v -70zM 10 10h 50v 50h -50z',
    'M 35 0a 35 35 0 1 0 0.1 0zm 0 10a 25 25 0 1 1 -0.1 0Z',
    'M 0 25v 20a 25 25, 0, 0, 0, 25 25h 20a 25 25, 0, 0, 0, 25 -25v -20a 25 25, 0, 0, 0, -25 -25h -20a 25 25, 0, 0, 0, -25 25'
      + 'M 25 10h 20a 15 15, 0, 0, 1, 15 15v 20a 15 15, 0, 0, 1, -15 15h -20a 15 15, 0, 0, 1, -15 -15v -20a 15 15, 0, 0, 1, 15 -15'
  ];
  for (const d of rings) {
    for (const transform of ['rotate(0,35,35)', 'rotate(90,35,35)', 'rotate(-90,35,35)', 'rotate(180,35,35)']) {
      const segs = QRTurboGeometry.applyMatrix(QRTurboGeometry.pathToSegments(d), QRTurboGeometry.parseTransform(transform));
      const [outer, inner] = toPolygons(segs, 1).map(signedArea);
      assert.ok(outer * inner < 0, `${transform}: ${outer} and ${inner} wind opposite`);
      assert.ok(Math.abs(outer) > Math.abs(inner), transform);
    }
  }
});

// ---- flatten ----------------------------------------------------------------

test('flatten turns each library color region into one path with its paint', async () => {
  for (const name of fixtureNames) {
    for (const hardened of [false, true]) {
      const source = readFixture(name);
      const markup = hardened ? QRTurboSvg.harden(source, { idPrefix: 'qrt-', width: '50mm', height: '50mm' }) : source;
      const label = `${name}${hardened ? ' (hardened)' : ''}`;
      const tree = QRTurboSvg.parse(markup);
      const drawing = await QRTurboGeometry.flatten(tree, { resolveImage: fakeResolveImage });

      const width = Number(QRTurboSvg.parse(source).attrs.width);
      assert.equal(drawing.width, width, label);
      assert.equal(drawing.height, Number(QRTurboSvg.parse(source).attrs.height), label);
      assert.ok(drawing.items.every(item => item.kind === 'path' || item.kind === 'image'), `${label}: no clip groups needed`);

      // Expected regions: root paint rects with a visible fill, in order.
      const clips = new Map();
      walk(tree, node => {
        if (node.name === 'clipPath') clips.set(node.attrs.id, node);
      });
      const regions = tree.children.filter(node => node.name === 'rect'
        && !/^(?:none|transparent)$/.test(node.attrs.fill || ''));
      const paths = drawing.items.filter(item => item.kind === 'path');
      assert.equal(paths.length, regions.length, `${label}: one path per region`);

      regions.forEach((region, index) => {
        const item = paths[index];
        const clipId = (/#([^'")]+)/.exec(region.attrs['clip-path'] || '') || [])[1];
        const clip = clips.get(clipId);
        const expectedSubpaths = clip
          ? clip.children.reduce((sum, child) => sum + (child.name === 'path' ? subpathCount(child.attrs.d) : 1), 0)
          : 1;
        assert.equal(item.d.filter(seg => seg[0] === 'M').length, expectedSubpaths, `${label}: region ${index} subpaths`);
        const evenodd = clip && clip.children.some(child => child.attrs['clip-rule'] === 'evenodd');
        assert.equal(item.fillRule, evenodd ? 'evenodd' : 'nonzero', `${label}: region ${index} rule`);
        assert.ok(item.d.every(seg => seg.slice(1).every(value => Number.isFinite(value) && Math.round(value * 1000) / 1000 === value)), `${label}: rounded`);
        const fill = region.attrs.fill;
        assert.equal(item.paint.type, fill === undefined || !fill.startsWith('url(') ? 'solid' : item.paint.type, label);
      });
    }
  }
});

test('flatten resolves gradients to absolute coordinates', async () => {
  const linear = await flattenMarkup(readFixture('grad-dots-linear.svg'));
  const linearNode = QRTurboSvg.parse(readFixture('grad-dots-linear.svg')).children[0].children
    .find(node => node.name === 'linearGradient');
  const paint = linear.items[1].paint;
  assert.equal(paint.type, 'linear');
  assert.deepEqual([paint.x1, paint.y1, paint.x2, paint.y2], ['x1', 'y1', 'x2', 'y2'].map(key => Number(linearNode.attrs[key])));
  assert.ok(paint.stops.length >= 2);
  assert.equal(paint.stops[0].offset, 0);
  assert.equal(paint.stops[paint.stops.length - 1].offset, 1);
  for (let i = 1; i < paint.stops.length; i += 1) assert.ok(paint.stops[i].offset >= paint.stops[i - 1].offset);
  assert.ok(paint.stops.every(stop => stop.color.length === 3 && stop.color.every(value => value >= 0 && value <= 1)));

  const radial = (await flattenMarkup(readFixture('grad-dots-radial.svg'))).items[1].paint;
  assert.deepEqual({ ...radial, stops: radial.stops.length }, { type: 'radial', cx: 105, cy: 105, r: 105, stops: 2 });
  assert.deepEqual(radial.stops.map(stop => stop.color), [[1, 0, 0], [0, 0, 1]]);

  const corners = await flattenMarkup(readFixture('grad-corners.svg'));
  const cornerPaints = corners.items.slice(2).map(item => item.paint);
  assert.deepEqual(cornerPaints.map(item => item.type), ['linear', 'radial', 'linear', 'radial', 'linear', 'radial']);
  assert.deepEqual(
    cornerPaints.filter(item => item.type === 'radial').map(item => [item.cx, item.cy, item.r]),
    [[35, 35, 15], [175, 35, 15], [35, 175, 15]]
  );

  // Inside a frame the nested viewBox moves and scales the gradient.
  const layout = frame.getFrameLayout(1024, 'banner-bottom');
  const framed = frame.buildFramedSvg(readFixture('grad-dots-linear.svg'), layout, {
    text: 'SCAN ME', fontSize: 60, colors: { frame: '#000000', text: '#ffffff', card: '#ffffff' }
  });
  const framedDrawing = await flattenMarkup(QRTurboSvg.harden(framed, { idPrefix: 'qrt-' }));
  let framedPaint = null;
  walkItems(framedDrawing.items, item => {
    if (item.kind === 'path' && item.paint.type === 'linear') framedPaint = item.paint;
  });
  const scale = layout.qr.size / 210;
  const expected = ['x1', 'y1', 'x2', 'y2'].map(key => Number(linearNode.attrs[key]) * scale + (key.startsWith('x') ? layout.qr.x : layout.qr.y));
  for (const [index, key] of ['x1', 'y1', 'x2', 'y2'].entries()) close(framedPaint[key], expected[index], 1e-3, `framed ${key}`);
});

test('flatten places logos with xMidYMid meet once resolveImage has the pixels', async () => {
  const calls = [];
  const drawing = await flattenMarkup(readFixture('image.svg'), {
    resolveImage: async (href, box, info) => {
      calls.push({ href: href.slice(0, 22), box, info });
      return fakeResolveImage(href);
    }
  });
  assert.deepEqual(calls, [{ href: 'data:image/png;base64,', box: { w: 126, h: 61 }, info: { drawingWidth: 290, drawingHeight: 290 } }]);
  const image = drawing.items[drawing.items.length - 1];
  assert.equal(image.kind, 'image');
  assert.ok(image.href.startsWith('data:image/png;base64,'));
  // 200 x 100 into 126 x 61: scale 0.61, so 122 x 61, centered horizontally.
  assert.deepEqual([image.x, image.y, image.width, image.height], [84, 114.5, 122, 61]);
  assert.equal(image.pixels.width, 50);

  // Without natural dimensions the pixel size gives the aspect ratio.
  const fromPixels = await flattenMarkup(readFixture('image.svg'), {
    resolveImage: async () => ({ width: 40, height: 20, rgb: new Uint8Array(2400), alpha: null })
  });
  const box = fromPixels.items[fromPixels.items.length - 1];
  assert.deepEqual([box.x, box.y, box.width, box.height], [84, 114.5, 122, 61]);

  // Without a resolver the item keeps its viewport box and has no pixels.
  const unresolved = await flattenMarkup(readFixture('image.svg'));
  const raw = unresolved.items[unresolved.items.length - 1];
  assert.deepEqual([raw.x, raw.y, raw.width, raw.height, raw.pixels], [82, 114.5, 126, 61, undefined]);

  await assert.rejects(
    flattenMarkup(readFixture('image.svg'), { resolveImage: async () => { throw new Error('decode failed'); } }),
    /decode failed/
  );
});

test('flatten handles the framed SVG from buildFramedSvg', async () => {
  for (const style of ['banner-bottom', 'banner-top', 'outline']) {
    const layout = frame.getFrameLayout(1024, style);
    const fontSize = 60;
    const colors = { frame: '#102a43', text: style === 'outline' ? '#102a43' : '#ffffff', card: '#ffffff' };
    const framed = frame.buildFramedSvg(readFixture('g-ref.svg'), layout, { text: '  SCAN   ME ', fontSize, colors });
    const drawing = await flattenMarkup(QRTurboSvg.harden(framed, { idPrefix: 'qrt-', width: '50mm', height: '50mm' }));
    const label = `frame ${style}`;

    assert.equal(drawing.width, 1024, label);
    assert.equal(drawing.height, 1024, label);
    const kinds = drawing.items.map(item => item.kind);
    assert.deepEqual(kinds, style === 'outline' ? ['path', 'stroke', 'group', 'text'] : ['path', 'group', 'text'], label);

    if (style === 'outline') {
      const stroke = drawing.items[1];
      assert.equal(stroke.lineWidth, layout.stroke, label);
      assert.deepEqual(stroke.paint, { type: 'solid', color: [0x10 / 255, 0x2a / 255, 0x43 / 255] }, label);
      assert.equal(drawing.items[0].paint.color.join(), '1,1,1', `${label}: card`);
    } else {
      assert.equal(drawing.items[0].fillRule, 'evenodd', `${label}: banner with a hole`);
      assert.equal(drawing.items[0].d.filter(seg => seg[0] === 'M').length, 2, label);
    }

    const group = drawing.items[kinds.indexOf('group')];
    assert.equal(group.clip.fillRule, 'nonzero', label);
    assert.ok(group.clip.d.some(seg => seg[0] === 'C'), `${label}: rounded clip`);
    assert.equal(group.items.length, 1, label);
    const viewportGroup = group.items[0];
    assert.equal(viewportGroup.kind, 'group', `${label}: the nested svg viewport`);
    assert.deepEqual(viewportGroup.clip.d, QRTurboGeometry.rect(layout.qr.x, layout.qr.y, layout.qr.size, layout.qr.size), label);
    const regions = viewportGroup.items;
    assert.ok(regions.length >= 2 && regions.every(item => item.kind === 'path'), label);
    // The rounded background (rx 102.4 of 512) fills the nested viewport.
    const xs = regions[0].d.filter(seg => seg[0] !== 'Z').flatMap(seg => [seg[seg.length - 2]]);
    const ys = regions[0].d.filter(seg => seg[0] !== 'Z').flatMap(seg => [seg[seg.length - 1]]);
    assert.deepEqual(
      [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
      [layout.qr.x, layout.qr.y, layout.qr.x + layout.qr.size, layout.qr.y + layout.qr.size],
      `${label}: scaled background`
    );
    close(regions[0].d[0][1] - layout.qr.x, 102.4 * layout.qr.size / 512, 1e-3, `${label}: scaled corner radius`);

    const text = drawing.items[kinds.length - 1];
    assert.deepEqual(text, {
      kind: 'text',
      text: 'SCAN ME',
      x: 512,
      y: Math.round(frame.getFrameLabelBaseline(layout, fontSize) * 1000) / 1000,
      fontSize,
      maxWidth: layout.label.maxWidth,
      anchor: 'middle',
      paint: { type: 'solid', color: colors.text === '#ffffff' ? [1, 1, 1] : [0x10 / 255, 0x2a / 255, 0x43 / 255] }
    }, label);
  }
});

test('flattened fixtures rasterize to images that jsQR decodes', async () => {
  for (const name of fixtureNames) {
    for (const hardened of [false, true]) {
      const source = readFixture(name);
      const markup = hardened ? QRTurboSvg.harden(source, { idPrefix: 'qrt-', width: '50mm', height: '50mm' }) : source;
      const drawing = await flattenMarkup(markup, { resolveImage: fakeResolveImage });
      // The library draws 10 units per module, so 0.6 gives 6 px modules.
      const decoded = decodeDrawing(drawing, 0.6, UNDECODABLE_FIXTURES.has(name));
      assert.equal(decoded, FIXTURE_PAYLOADS[name] || 'A', `${name}${hardened ? ' (hardened)' : ''}`);
    }
  }
});

test('flattened framed codes decode in every frame style', async () => {
  for (const style of ['banner-bottom', 'banner-top', 'outline']) {
    const layout = frame.getFrameLayout(1024, style);
    const framed = frame.buildFramedSvg(readFixture('g-ref.svg'), layout, {
      text: 'SCAN ME', fontSize: 60, colors: { frame: '#102a43', text: '#ffffff', card: '#ffffff' }
    });
    const drawing = await flattenMarkup(QRTurboSvg.harden(framed, { idPrefix: 'qrt-' }));
    const image = rasterize(drawing, 0.4);
    assert.deepEqual(pixelAt(image, 4, image.height / 2), [0x10, 0x2a, 0x43], `${style}: frame or outline stroke`);
    assert.deepEqual(pixelAt(image, 12, image.height / 2), style === 'outline' ? [255, 255, 255] : [0x10, 0x2a, 0x43], `${style}: banner or card`);
    const result = jsQR(image.data, image.width, image.height);
    assert.equal(result && result.data, FIXTURE_PAYLOADS['g-ref.svg'], style);
  }
});

test('flatten follows SVG painting rules for other content', async () => {
  const drawing = await flattenMarkup(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 20 100 100" width="1in" height="1in">'
    + '<defs><clipPath id="c"><circle cx="50" cy="50" r="10"/></clipPath><clipPath id="empty"/>'
    + '<linearGradient id="base" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".5" style="stop-color: rgb(255, 0, 0)"/></linearGradient>'
    + '<linearGradient id="g" href="#base"/><linearGradient id="one"><stop offset="1" stop-color="white"/></linearGradient>'
    + '<radialGradient id="none"/><rect id="r" width="5" height="5"/></defs>'
    + '<rect x="10" y="20" width="10" height="10"/>'
    + '<rect x="10" y="20" width="10" height="10" style="fill: #00ff00; stroke: none"/>'
    + '<g fill="#0000ff" transform="translate(5 5)"><rect width="2" height="2"/><g display="none"><rect width="9" height="9"/></g></g>'
    + '<rect width="9" height="9" fill="none" stroke="red" stroke-width="2" transform="scale(2)"/>'
    + '<rect width="9" height="9" clip-path="url(#c)" rx="1"/>'
    + '<g clip-path="url(#missing)"><rect width="3" height="3" fill="#123"/></g>'
    + '<g clip-path="url(#empty)"><rect width="3" height="3"/></g>'
    + '<rect width="10" height="20" x="30" y="30" fill="url(#g)"/>'
    + '<rect width="1" height="1" fill="url(#one)"/><rect width="1" height="1" fill="url(#none)"/>'
    + '<rect width="1" height="1" fill="url(#gone) #ff0000"/><rect width="1" height="1" fill="rgba(0,0,0,0)"/>'
    + '<rect width="1" height="1" fill="bogus"/><rect width="1" height="1" opacity="0"/><rect width="1" height="1" fill-opacity="0"/>'
    + '<use href="#r" x="70" y="80" fill="#ff00ff"/>'
    + '<svg x="50" y="50" width="20" height="10" viewBox="0 0 10 10" preserveAspectRatio="none" overflow="visible"><rect width="10" height="10"/></svg>'
    + '<line x1="0" y1="0" x2="10" y2="0" stroke="#000"/><polygon points="0,0 10,0 10,10" fill="#fff"/>'
    + '</svg>'
  );
  assert.equal(drawing.width, 100);
  assert.equal(drawing.height, 100);
  const items = drawing.items;
  const describe = item => `${item.kind}:${item.kind === 'group' ? item.items.length : item.paint.type}`;
  assert.deepEqual(items.map(describe), [
    'path:solid', 'path:solid', 'path:solid', 'stroke:solid', 'group:1', 'path:solid',
    'path:linear', 'path:solid', 'path:solid', 'path:solid', 'path:solid', 'path:solid', 'stroke:solid', 'path:solid'
  ]);
  // The viewBox origin (10, 20) moves to (0, 0).
  assert.deepEqual(items[0].d[0], ['M', 0, 0]);
  assert.deepEqual(items[0].paint.color, [0, 0, 0], 'default fill is black');
  assert.deepEqual(items[1].paint.color, [0, 1, 0], 'style wins over attributes');
  assert.deepEqual(items[2].paint.color, [0, 0, 1], 'fill inherits from the group');
  assert.deepEqual(items[2].d[0], ['M', -5, -15], 'group transform applies');
  assert.equal(items[3].lineWidth, 4, 'stroke width scales with the matrix');
  assert.deepEqual(items[3].paint.color, [1, 0, 0]);
  assert.equal(items[4].clip.d.filter(seg => seg[0] === 'C').length, 4, 'circle clip');
  assert.equal(items[4].items[0].d.filter(seg => seg[0] === 'C').length, 4, 'rounded rect inside the clip group');
  assert.deepEqual(items[5].paint.color, [0x11 / 255, 0x22 / 255, 0x33 / 255], 'a missing clip-path is ignored');
  const gradient = items[6].paint;
  assert.deepEqual([gradient.x1, gradient.y1, gradient.x2, gradient.y2], [20, 10, 20, 30], 'objectBoundingBox gradient via href template');
  assert.deepEqual(gradient.stops, [{ offset: 0, color: [0, 0, 0] }, { offset: 0.5, color: [1, 0, 0] }]);
  assert.deepEqual(items[7].paint, { type: 'solid', color: [1, 1, 1] }, 'a single stop is a solid paint');
  assert.deepEqual(items[8].paint.color, [1, 0, 0], 'paint server fallback color');
  assert.deepEqual(items[9].paint.color, [0, 0, 0], 'an invalid fill keeps the inherited black');
  assert.deepEqual(items[10].paint.color, [1, 0, 1], 'use with inherited fill');
  assert.deepEqual(items[10].d[0], ['M', 60, 60]);
  assert.deepEqual(items[11].d.slice(0, 3), [['M', 40, 30], ['L', 60, 30], ['L', 60, 40]], 'nested viewBox without aspect ratio');
  assert.equal(items[12].kind, 'stroke', 'lines only stroke');
  assert.deepEqual(items[13].d.map(seg => seg[0]), ['M', 'L', 'L', 'Z']);
});

test('flatten reads text content, anchors and image options', async () => {
  const helvetica = globalThis.QRTurboHelvetica;
  const drawing = await flattenMarkup(
    '<svg viewBox="0 0 200 100"><g transform="scale(2)">'
    + '<text x="50 60" y="40" font-size="10px" text-anchor="middle" data-max-width="30" fill="#f00">\n  Hello\t<tspan>big</tspan>  world  </text>'
    + '<text x="0" y="10" font-size="8" fill="none">hidden</text><text x="0" y="10"> </text>'
    + '</g>'
    + '<image x="0" y="0" width="20" height="10" xlink:href="data:image/png;base64,AA" preserveAspectRatio="xMinYMax slice"/>'
    + '<image x="0" y="0" width="20" height="10" href="data:x" preserveAspectRatio="none"/>'
    + '</svg>',
    { resolveImage: async () => ({ width: 10, height: 10, rgb: new Uint8Array(300), alpha: null }) }
  );
  assert.deepEqual(drawing.items[0], {
    kind: 'text',
    text: 'Hello big world',
    x: 100,
    y: 80,
    fontSize: 20,
    maxWidth: 60,
    anchor: 'middle',
    paint: { type: 'solid', color: [1, 0, 0] }
  });
  assert.equal(drawing.items.length, 3);
  const slice = drawing.items[1];
  assert.equal(slice.kind, 'group', 'slice is clipped to the viewport');
  assert.deepEqual(slice.clip.d, QRTurboGeometry.rect(0, 0, 20, 10));
  assert.deepEqual([slice.items[0].x, slice.items[0].y, slice.items[0].width, slice.items[0].height], [0, -10, 20, 20]);
  const stretched = drawing.items[2];
  assert.deepEqual([stretched.x, stretched.y, stretched.width, stretched.height], [0, 0, 20, 10]);
  assert.equal(helvetica, globalThis.QRTurboHelvetica, 'flatten does not load other modules');
});

test('flatten paints a zero-length linear gradient with its last stop, as SVG does', async () => {
  const drawing = await flattenMarkup(
    '<svg viewBox="0 0 10 10"><defs>'
    + '<linearGradient id="z" gradientUnits="userSpaceOnUse" x1="5" y1="5" x2="5" y2="5"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient>'
    + '<linearGradient id="ok" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="10" y2="5"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient>'
    + '</defs><rect width="10" height="10" fill="url(#z)"/><rect width="10" height="10" fill="url(#ok)"/></svg>'
  );
  assert.deepEqual(drawing.items[0].paint, { type: 'solid', color: [0, 0, 1] });
  assert.equal(drawing.items[1].paint.type, 'linear');
});

test('flatten reads text positions as lengths', async () => {
  const drawing = await flattenMarkup(
    '<svg viewBox="0 0 200 100"><text x="50%" y="0.5in" font-size="10" text-anchor="middle">A</text>'
    + '<text x="12px, 40" y="30 60" font-size="10" text-anchor="middle">B</text></svg>'
  );
  assert.deepEqual(drawing.items.map(item => [item.text, item.x, item.y]), [['A', 100, 48], ['B', 12, 30]]);
});

test('flatten centers start and end anchored text with Helvetica metrics when they are loaded', async () => {
  const markup = '<svg viewBox="0 0 100 100"><text x="10" y="50" font-size="10">Ab</text>'
    + '<text x="90" y="50" font-size="10" text-anchor="end">Ab</text><text x="10" y="70" font-size="10">\u0100</text></svg>';
  const previous = globalThis.QRTurboHelvetica;
  try {
    delete globalThis.QRTurboHelvetica;
    const without = await flattenMarkup(markup);
    assert.deepEqual(without.items.map(item => item.x), [10, 90, 10], 'unchanged without metrics');

    globalThis.QRTurboHelvetica = {
      canEncode: text => /^[ -\u00ff]*$/.test(text),
      measure: (text, fontSize) => text.length * fontSize * 0.6
    };
    const withMetrics = await flattenMarkup(markup);
    assert.deepEqual(withMetrics.items.map(item => [item.x, item.anchor]), [[16, 'middle'], [84, 'middle'], [10, 'middle']]);
  } finally {
    if (previous === undefined) delete globalThis.QRTurboHelvetica;
    else globalThis.QRTurboHelvetica = previous;
  }
});

test('flatten validates its input', async () => {
  await assert.rejects(QRTurboGeometry.flatten(null), TypeError);
  await assert.rejects(QRTurboGeometry.flatten(QRTurboSvg.parse('<g/>')), TypeError);
  await assert.rejects(flattenMarkup('<svg width="100%" height="100%"/>'), /needs a viewBox/);
  assert.deepEqual(await flattenMarkup('<svg width="2in" height="1in"/>'), { width: 192, height: 96, items: [] });
});

test('flatten handles a version 40 sized code', async () => {
  const rects = [];
  for (let row = 0; row < 177; row += 1) {
    for (let col = 0; col < 177; col += 1) {
      if ((row * 7 + col * 3) % 2) rects.push(`<rect x="${40 + col * 10}" y="${40 + row * 10}" width="10" height="10" transform="rotate(0,${45 + col * 10},${45 + row * 10})"/>`);
    }
  }
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="1850" height="1850"><defs><clipPath id="clip-path-dot-color">${rects.join('')}</clipPath></defs>`
    + '<rect x="0" y="0" height="1850" width="1850" clip-path="url(\'#clip-path-background-color\')" fill="#fff"/>'
    + '<rect x="0" y="0" height="1850" width="1850" clip-path="url(\'#clip-path-dot-color\')" fill="#000"/></svg>';
  const drawing = await flattenMarkup(QRTurboSvg.harden(markup, { idPrefix: 'qrt-' }));
  assert.equal(drawing.items.length, 2);
  assert.equal(drawing.items[1].d.length, rects.length * 5);
});

test('writerKit gives each vector writer one frozen set of shared helpers', () => {
  const pdf = QRTurboGeometry.writerKit('QRTurboPdf');
  const eps = QRTurboGeometry.writerKit('QRTurboEps');
  assert.equal(QRTurboGeometry.writerKit('QRTurboPdf'), pdf, 'created once per writer');
  assert.notEqual(pdf, eps);
  assert.ok(Object.isFrozen(pdf));
  assert.deepEqual(Object.keys(pdf), Object.keys(eps));

  // Coordinates: at most 4 decimals, no exponent, no negative zero.
  assert.equal(pdf.num(99.123456789), '99.1235');
  assert.equal(pdf.num(1e-7), '0');
  assert.equal(pdf.num(-0.00001), '0');
  assert.equal(pdf.num(-12.5), '-12.5');
  assert.equal(pdf.num(100), '100');
  // The page scale: 8 significant digits, at least 4 decimals.
  assert.equal(pdf.factor((10 * 72 / 25.4) / 1990), '0.014244451');
  assert.equal(pdf.factor(-(50 * 72 / 25.4) / 100), '-1.4173228');
  assert.equal(pdf.factor(270.123456789), '270.12346');
  assert.equal(pdf.factor(12345.678912), '12345.6789');
  assert.equal(pdf.factor(0.5), '0.5');
  assert.equal(pdf.factor(0), '0');

  // Errors name the writer that asked for the helpers.
  assert.throws(() => pdf.num(Infinity), { name: 'RangeError', message: 'QRTurboPdf: number out of range' });
  assert.throws(() => eps.factor(1e16), { name: 'RangeError', message: 'QRTurboEps: number out of range' });
  assert.throws(() => eps.solidColor(null), { name: 'TypeError', message: 'QRTurboEps: missing paint' });
  assert.throws(() => pdf.normalizeStops([]), { name: 'TypeError', message: 'QRTurboPdf: a gradient needs stops' });
  assert.throws(() => eps.pathOperators([['Q', 1, 2]]), { name: 'TypeError', message: 'QRTurboEps: unknown path segment' });
  assert.throws(() => pdf.packMask({ cols: 9, rows: 2, bits: new Uint8Array(3) }), { name: 'RangeError', message: 'QRTurboPdf: mask bits do not match its size' });
  assert.throws(() => eps.checkPixels({ width: 2, height: 2, rgb: new Uint8Array(5) }), { name: 'RangeError', message: 'QRTurboEps: image RGB data does not match its size' });
});

test('writerKit helpers: paths, stops, masks, strings and colors', async () => {
  const kit = QRTurboGeometry.writerKit('QRTurboPdf');
  assert.deepEqual(kit.pathOperators([['M', 0, 0], ['L', 1, 0], ['Z'], ['L', 2, 2], ['C', 1, 1, 2, 2, 3, 3], ['Z']]),
    ['0 0 m', '1 0 l', 'h', '0 0 m', '2 2 l', '1 1 2 2 3 3 c', 'h']);
  assert.equal(kit.hasDrawableSegments([['M', 0, 0], ['Z']]), false);
  assert.equal(kit.hasDrawableSegments([['M', 0, 0], ['L', 1, 1]]), true);
  assert.deepEqual(kit.normalizeStops([{ offset: 0.6, color: [1, 0, 0] }, { offset: 0.2, color: [0, 0, 1] }]).map(stop => stop.offset), [0, 0.2, 0.6, 1]);
  assert.deepEqual(kit.solidColor({ type: 'linear', stops: [{ offset: 0, color: [0.5, 2, -1] }] }), [0.5, 1, 0]);
  assert.equal(kit.isGradient({ type: 'radial' }), true);
  assert.equal(kit.isGradient({ type: 'solid' }), false);
  assert.deepEqual([...kit.packMask({ cols: 9, rows: 1, bits: Uint8Array.of(1, 0, 0, 0, 0, 0, 0, 0, 1) })], [0x80, 0x80]);
  assert.equal(kit.escapeString(Uint8Array.from([0x28, 0x5c, 0x29, 0x41, 0xe9, 0x0a])), '\\(\\\\\\)A\\351\\012');
  assert.deepEqual([...kit.graySamples(Uint8Array.of(128, 128, 128, 255, 0, 0, 255, 255, 255), 3)], [128, 54, 255]);
  assert.equal(await kit.compress(null, Uint8Array.of(1)), null);
  assert.equal(await kit.compress(async () => { throw new Error('no deflate'); }, Uint8Array.of(1)), null);
  assert.deepEqual(await kit.compress(async bytes => bytes.subarray(1), Uint8Array.of(1, 2)), Uint8Array.of(2));

  // CMYK and K-only come from QRTurboColor, the one place with the conversions.
  const previous = globalThis.QRTurboColor;
  try {
    delete globalThis.QRTurboColor;
    assert.deepEqual(kit.colorComponents([0.2, 0.4, 0.6], 'rgb'), [0.2, 0.4, 0.6]);
    assert.throws(() => kit.colorComponents([0.2, 0.4, 0.6], 'cmyk'), { message: 'QRTurboPdf: QRTurboColor is not loaded' });
    const color = require('../../Public/js/lib/color.js');
    globalThis.QRTurboColor = color;
    assert.deepEqual(kit.colorComponents([0x33 / 255, 0x66 / 255, 0x99 / 255], 'cmyk'), color.toCmyk('#336699'));
    assert.deepEqual(kit.colorComponents([128 / 255, 128 / 255, 128 / 255], 'k'), [0, 0, 0, color.toK('#808080')]);
  } finally {
    if (previous === undefined) delete globalThis.QRTurboColor;
    else globalThis.QRTurboColor = previous;
  }
});
