const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const helvetica = require('../../Public/js/lib/helvetica.js');
const QRTurboEps = require('../../Public/js/lib/eps.js');
// The writer takes its shared helpers from QRTurboGeometry.writerKit and the
// CMYK and K conversions from QRTurboColor, as in the browser.
require('../../Public/js/lib/geometry.js');
require('../../Public/js/lib/color.js');
const {
  rasterizeEps,
  decodeQr,
  qrTestDrawing,
  testLogoPixels,
  rectSegments,
  circleSegments,
  sampleColor,
  ascii85Decode,
  runLengthDecode,
  ghostscriptVersion,
  rasterizeWithGhostscript
} = require('../helpers/vector-inspect');

const repoRoot = path.resolve(__dirname, '..', '..');
const DATE = new Date(Date.UTC(2026, 9, 22, 23, 59, 59));
const MM50 = (50 * 72) / 25.4;
const PAYLOAD = 'https://qrturbo.app/?ref=eps-test';
const FORBIDDEN = ['initgraphics', 'initclip', 'initmatrix', 'erasepage', 'copypage', 'setpagedevice', 'grestoreall', 'exitserver', 'quit'];
const UNDECODABLE_FIXTURES = new Set(['cdot-dot.svg', 'cdot-square.svg', 'dots-dots.svg', 'grad-corners.svg', 'grad-dots-linear.svg']);
const deflate = async bytes => new Uint8Array(zlib.deflateSync(bytes));
const solid = color => ({ type: 'solid', color });

async function writeEps(drawing, options = {}) {
  return QRTurboEps.write(drawing, { widthPt: MM50, colorMode: 'rgb', date: DATE, ...options });
}

function square(items, size = 100) {
  return { width: size, height: size, items };
}

// The PostScript program without ASCII85 data blocks and string literals,
// so operator checks only see code.
function codeOf(eps) {
  return eps
    .replace(/\} exec\n[\s\S]*?~>\n/g, '} exec\n')
    .replace(/\((?:\\.|[^\\)])*\)/g, '()')
    .split('\n')
    .filter(line => !line.startsWith('%'))
    .join('\n');
}

function tokens(eps) {
  return codeOf(eps).split(/[\s[\]{}()<>/]+/).filter(Boolean);
}

function dataBlocks(eps) {
  return [...eps.matchAll(/\} exec\n([\s\S]*?~>)\n/g)].map(match => match[1]);
}

function decodeBlock(block, filter) {
  const raw = ascii85Decode(block.slice(0, -2));
  return filter === 'FlateDecode' ? zlib.inflateSync(raw) : runLengthDecode(raw);
}

test('QRTurboEps writes the EPSF-3.0 DSC header, prolog and trailer', async () => {
  const drawing = qrTestDrawing(PAYLOAD);
  // The page scale keeps 8 significant digits.
  const scale = String(Number((MM50 / drawing.width).toPrecision(8)));
  const eps = await writeEps(drawing);
  const lines = eps.split('\n');
  assert.deepEqual(lines.slice(0, 15), [
    '%!PS-Adobe-3.0 EPSF-3.0',
    '%%BoundingBox: 0 0 142 142',
    '%%HiResBoundingBox: 0 0 141.7323 141.7323',
    '%%Creator: QRTurbo.app',
    '%%Title: (QR code)',
    '%%CreationDate: (2026-10-22)',
    '%%LanguageLevel: 2',
    '%%DocumentData: Clean7Bit',
    '%%Pages: 1',
    '%%EndComments',
    '%%BeginProlog',
    '/m {moveto} bind def /l {lineto} bind def /c {curveto} bind def /h {closepath} bind def',
    '%%EndProlog',
    '%%Page: 1 1',
    `gsave 0 141.7323 translate ${scale} -${scale} scale`
  ]);
  assert.ok(eps.endsWith('grestore\nshowpage\n%%EOF\n'));
});

test('QRTurboEps BoundingBox is the integer ceiling of the exact size', async () => {
  const eps = await writeEps(qrTestDrawing(PAYLOAD), { widthPt: 72 });
  assert.match(eps, /^%%BoundingBox: 0 0 72 72$/m);
  assert.match(eps, /^%%HiResBoundingBox: 0 0 72 72$/m);
  const wide = await writeEps({ width: 200, height: 100, items: [] }, { widthPt: 100.2 });
  assert.match(wide, /^%%BoundingBox: 0 0 101 51$/m);
  assert.match(wide, /^%%HiResBoundingBox: 0 0 100\.2 50\.1$/m);
});

test('QRTurboEps output is clean 7-bit ASCII with short lines', async () => {
  const drawing = qrTestDrawing(PAYLOAD, {
    ecl: 'H',
    background: null,
    logo: { pixels: testLogoPixels(48) },
    frame: { style: 'banner', text: 'Café crème' }
  });
  for (const options of [{}, { deflate }]) {
    const eps = await writeEps(drawing, options);
    for (let i = 0; i < eps.length; i++) {
      const code = eps.charCodeAt(i);
      assert.ok(code === 10 || (code >= 32 && code <= 126), `byte ${code} at ${i}`);
    }
    for (const line of eps.split('\n')) assert.ok(line.length <= 255, 'DSC lines are at most 255 characters');
    for (const block of dataBlocks(eps)) {
      for (const line of block.split('\n')) assert.ok(!line.startsWith('%'), 'no data line looks like a comment');
    }
  }
});

test('QRTurboEps never emits forbidden operators and keeps gsave and grestore balanced', async () => {
  const drawing = qrTestDrawing(PAYLOAD, {
    ecl: 'H',
    background: null,
    paint: { type: 'linear', x1: 0, y1: 0, x2: 410, y2: 410, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [0, 0, 0.5] }] },
    logo: { pixels: testLogoPixels(32) },
    frame: { style: 'outline', text: 'SCAN ME', color: [0, 0, 0], textColor: [0, 0, 0] }
  });
  for (const options of [{}, { deflate }, { colorMode: 'cmyk' }, { colorMode: 'k' }]) {
    const eps = await writeEps(drawing, options);
    const words = tokens(eps);
    for (const word of FORBIDDEN) assert.ok(!words.includes(word), `${word} is never used`);
    const saves = words.filter(word => word === 'gsave').length;
    assert.ok(saves > 2);
    assert.equal(saves, words.filter(word => word === 'grestore').length);
    assert.equal(words.filter(word => word === 'begin').length, words.filter(word => word === 'end').length);
    assert.equal(words.filter(word => word === 'showpage').length, 1);
  }
});

test('QRTurboEps uses LanguageLevel 2 unless shadings, Flate data or masked images need 3', async () => {
  const level = eps => Number(/^%%LanguageLevel: (\d)$/m.exec(eps)[1]);
  const gradient = { type: 'radial', cx: 205, cy: 205, r: 250, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [0, 0, 0.5] }] };
  const label = { cols: 16, rows: 2, bits: new Uint8Array(32).fill(1), x: 112, y: 900, width: 800, height: 100 };
  assert.equal(level(await writeEps(qrTestDrawing(PAYLOAD), { deflate })), 2);
  assert.equal(level(await writeEps(qrTestDrawing(PAYLOAD, { frame: { style: 'banner' } }), { deflate })), 2);
  assert.equal(level(await writeEps(qrTestDrawing(PAYLOAD, { frame: { style: 'banner', mask: label } }), { deflate })), 2);
  assert.equal(level(await writeEps(qrTestDrawing(PAYLOAD, { logo: { pixels: testLogoPixels(16) } }))), 2);
  assert.equal(level(await writeEps(qrTestDrawing(PAYLOAD, { paint: gradient }))), 3);
  assert.equal(level(await writeEps(qrTestDrawing(PAYLOAD, { logo: { pixels: testLogoPixels(16) } }), { deflate })), 3);
  const logoOnly = square([{ kind: 'image', x: 40, y: 40, width: 20, height: 20, href: '', pixels: testLogoPixels(16) }]);
  assert.equal(level(await writeEps(logoOnly)), 3);
  assert.match(await writeEps(logoOnly), /\/ImageType 3/);
});

test('QRTurboEps RunLength image data round-trips for hard byte patterns', async () => {
  const width = 37;
  const height = 11;
  const count = width * height;
  const patterns = [
    i => [0, 1, 1][i % 3],
    i => (i % 2 ? 7 : 9),
    i => (i * 7919) % 251,
    i => (i < 200 ? 5 : i % 4),
    () => 42
  ];
  for (const pattern of patterns) {
    const rgb = new Uint8Array(count * 3).map((_, i) => pattern(i));
    const eps = await writeEps(square([{ kind: 'image', x: 0, y: 0, width: 10, height: 10, href: '', pixels: { width, height, rgb, alpha: null } }]));
    const [block] = dataBlocks(eps);
    const raw = ascii85Decode(block.slice(0, -2));
    assert.ok(raw.length <= rgb.length + Math.ceil(rgb.length / 128) + 1);
    assert.deepEqual([...runLengthDecode(raw)], [...rgb]);
  }
});

test('QRTurboEps keeps the ASCII85 end marker on one line for every data length', async () => {
  let seed = 7;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % 256;
  };
  const tails = new Set();
  for (let width = 1; width <= 160; width++) {
    const rgb = new Uint8Array(width * 3).map(random);
    const eps = await writeEps(square([{ kind: 'image', x: 0, y: 0, width: 10, height: 1, href: '', pixels: { width, height: 1, rgb, alpha: null } }]));
    const blocks = dataBlocks(eps);
    assert.equal(blocks.length, 1, `one data block for width ${width}`);
    const block = blocks[0];
    const lines = block.split('\n');
    const last = lines[lines.length - 1];
    assert.ok(last.endsWith('~>'), `the last data line ends with ~> for width ${width}`);
    assert.equal(block.indexOf('~'), block.length - 2, `~ only starts the end marker for width ${width}`);
    for (const line of lines) {
      assert.ok(!line.startsWith('%') && line.length <= 255, `data line ${JSON.stringify(line)}`);
    }
    tails.add(last.length);
    assert.deepEqual([...runLengthDecode(ascii85Decode(block.slice(0, -2)))], [...rgb]);
  }
  assert.ok(tails.has(77), 'a marker that would be split by a line break stays on one line');
  assert.ok(tails.has(78), 'a marker can follow a full data line');
});

test('QRTurboEps writes fills with setrgbcolor and fill or eofill', async () => {
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([1, 0, 0]) },
    { kind: 'path', d: rectSegments(10, 10, 10, 10).concat(rectSegments(12, 12, 4, 4)), fillRule: 'evenodd', paint: solid([0, 0, 0]) },
    { kind: 'path', d: [['M', 50, 50], ['C', 60, 50, 60, 60, 50, 60], ['Z'], ['L', 40, 40], ['L', 40, 50], ['Z']], fillRule: 'nonzero', paint: solid([0, 0, 1]) }
  ]);
  const eps = await writeEps(drawing);
  assert.match(eps, /\nnewpath\n1 0 0 setrgbcolor\n0 0 m\n10 0 l\n10 10 l\n0 10 l\nh\nfill\n/);
  assert.match(eps, /\nh\neofill\n/);
  assert.match(eps, /\n50 50 m\n60 50 60 60 50 60 c\nh\n50 50 m\n40 40 l\n40 50 l\nh\nfill\n/);
});

test('QRTurboEps writes gradients as clipped shfill shadings', async () => {
  const paint = { type: 'linear', x1: 0, y1: 0, x2: 330, y2: 330, stops: [{ offset: 0, color: [1, 0, 0] }, { offset: 0.5, color: [0, 1, 0] }, { offset: 1, color: [0, 0, 1] }] };
  const eps = await writeEps(qrTestDrawing(PAYLOAD, { paint }));
  assert.match(eps, /\ngsave\nnewpath\n[\d. ]+ m\n[\s\S]*?\nclip\nnewpath\n<< \/ShadingType 2 \/ColorSpace \/DeviceRGB\n\/Coords \[0 0 330 330\]\n/);
  assert.match(eps, /\/Function << \/FunctionType 3 \/Domain \[0 1\] \/Functions \[\n<< \/FunctionType 2 \/Domain \[0 1\] \/C0 \[1 0 0\] \/C1 \[0 1 0\] \/N 1 >>\n/);
  assert.match(eps, /\] \/Bounds \[0\.5\]\n\/Encode \[0 1 0 1\] >>\n\/Extend \[true true\] >> shfill\ngrestore\n/);
  const radial = await writeEps(qrTestDrawing(PAYLOAD, {
    paint: { type: 'radial', cx: 1, cy: 2, r: 3, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [1, 1, 1] }] }
  }), { colorMode: 'cmyk' });
  assert.match(radial, /<< \/ShadingType 3 \/ColorSpace \/DeviceCMYK\n\/Coords \[1 2 0 1 2 3\]\n\/Function << \/FunctionType 2 \/Domain \[0 1\] \/C0 \[0 0 0 1\] \/C1 \[0 0 0 0\] \/N 1 >>\n/);
});

test('QRTurboEps re-encodes Helvetica-Bold with the WinAnsi names and centers text with stringwidth', async () => {
  const label = 'Café (2)';
  const eps = await writeEps(square([
    { kind: 'text', text: label, x: 50, y: 90, fontSize: 8, maxWidth: null, anchor: 'middle', paint: solid([1, 1, 1]) }
  ]));
  assert.match(eps, /^%%DocumentNeededResources: font Helvetica-Bold$/m);
  assert.match(eps, /\n\/QRTurboHB \/Helvetica-Bold findfont dup length dict begin\n\{1 index \/FID ne \{def\} \{pop pop\} ifelse\} forall\n\/Encoding \[\n/);
  const encoding = /\/Encoding \[\n([\s\S]*?)\n\] def\ncurrentdict end definefont pop\n%%EndProlog/.exec(eps);
  assert.ok(encoding);
  const names = encoding[1].split(/\s+/).filter(Boolean);
  assert.equal(names.length, 256);
  assert.equal(names[0x20], '/space');
  assert.equal(names[0x41], '/A');
  assert.equal(names[0x60], '/grave');
  assert.equal(names[0xe9], '/eacute');
  assert.equal(names[0x80], '/.notdef');
  assert.match(eps, /\nnewpath\n1 1 1 setrgbcolor\n\/QRTurboHB findfont \[8 0 0 -8 0 0\] makefont setfont\n50 90 moveto\n\(Caf\\351 \\\(2\\\)\) dup stringwidth pop 2 div neg 0 rmoveto show\n/);
});

test('QRTurboEps shrinks a label to maxWidth with the AFM widths', async () => {
  const label = 'SCAN THIS CODE FOR THE MENU';
  const eps = await writeEps(square([
    { kind: 'text', text: label, x: 512, y: 950, fontSize: 75, maxWidth: 700, anchor: 'middle', paint: solid([0, 0, 0]) }
  ], 1024));
  const size = Number(/\[(\S+) 0 0 -\S+ 0 0\] makefont/.exec(eps)[1]);
  assert.ok(size < 75);
  assert.ok(Math.abs(helvetica.measure(label, size) - 700) < 0.1);
});

test('QRTurboEps rejects text that WinAnsi cannot encode', async () => {
  await assert.rejects(writeEps(square([
    { kind: 'text', text: 'Zeskanuj mnie ż', x: 50, y: 50, fontSize: 8, maxWidth: null, anchor: 'middle', paint: solid([0, 0, 0]) }
  ])), RangeError);
});

test('QRTurboEps paints stencil masks with imagemask in the fill color', async () => {
  const cols = 12;
  const rows = 3;
  const bits = new Uint8Array(cols * rows).map((_, i) => (i % 5 === 0 ? 1 : 0));
  const eps = await writeEps(square([{ kind: 'mask', x: 10, y: 80, width: 80, height: 20, cols, rows, bits, paint: solid([0, 0, 1]) }]), { deflate });
  assert.match(eps, /\ngsave\n0 0 1 setrgbcolor\n10 80 translate 80 20 scale\n\/QRTurboData currentfile \/ASCII85Decode filter def\n/);
  assert.match(eps, /\{<< \/ImageType 1 \/Width 12 \/Height 3 \/ImageMatrix \[12 0 0 3 0 0\]\n\/BitsPerComponent 1 \/Decode \[1 0\] \/DataSource QRTurboData \/RunLengthDecode filter >> imagemask QRTurboData flushfile\} exec\n/);
  const [block] = dataBlocks(eps);
  const packed = decodeBlock(block, 'RunLengthDecode');
  assert.equal(packed.length, 2 * rows);
  for (let i = 0; i < cols * rows; i++) {
    const bit = (packed[Math.floor(i / cols) * 2 + ((i % cols) >> 3)] >> (7 - ((i % cols) & 7))) & 1;
    assert.equal(bit, bits[i]);
  }
  const raster = rasterizeEps(eps, { pxPerPt: 1 });
  assert.ok(raster.operators.get('imagemask') === 1);
});

test('QRTurboEps composites a translucent logo onto an opaque background', async () => {
  const pixels = testLogoPixels(16);
  const drawing = qrTestDrawing(PAYLOAD, { ecl: 'H', background: [1, 1, 0.5], logo: { pixels } });
  drawing.items = drawing.items.filter(item => item.kind !== 'path' || item.paint.color[2] === 0.5);
  const eps = await writeEps(drawing);
  assert.doesNotMatch(eps, /ImageType 3/);
  assert.match(eps, /\/DeviceRGB setcolorspace\n\/QRTurboData currentfile \/ASCII85Decode filter def\n\{<< \/ImageType 1 \/Width 16 \/Height 16 \/ImageMatrix \[16 0 0 16 0 0\] \/BitsPerComponent 8 \/Decode \[0 1 0 1 0 1\]\n\/DataSource QRTurboData \/RunLengthDecode filter >> image QRTurboData flushfile\} exec\n/);
  const rgb = decodeBlock(dataBlocks(eps)[0], 'RunLengthDecode');
  assert.equal(rgb.length, 16 * 16 * 3);
  assert.deepEqual([...rgb.subarray(0, 3)], [255, 255, 128], 'a transparent corner takes the background color');
  const center = (8 * 16 + 8) * 3;
  assert.deepEqual([...rgb.subarray(center, center + 3)], [220, 30, 60]);
});

test('QRTurboEps finds the backdrop under a logo in curved, gradient and ring fills', async () => {
  const pixels = testLogoPixels(16);
  const logo = { kind: 'image', x: 40, y: 40, width: 20, height: 20, href: '', pixels };
  const corner = async items => {
    const eps = await writeEps(square([...items, logo]));
    if (/\/ImageType 3/.test(eps)) return null;
    return [...decodeBlock(dataBlocks(eps)[0], 'RunLengthDecode').subarray(0, 3)];
  };
  const disc = circleSegments(50, 50, 30);
  assert.deepEqual(await corner([{ kind: 'path', d: disc, fillRule: 'nonzero', paint: solid([1, 1, 0.5]) }]), [255, 255, 128]);
  const linear = { type: 'linear', x1: 0, y1: 0, x2: 100, y2: 0, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [1, 1, 1] }] };
  assert.deepEqual(await corner([{ kind: 'path', d: disc, fillRule: 'nonzero', paint: linear }]), [128, 128, 128]);
  const radial = { type: 'radial', cx: 50, cy: 50, r: 100, stops: [{ offset: 0, color: [1, 0, 0] }, { offset: 1, color: [0, 0, 1] }] };
  assert.deepEqual(await corner([{ kind: 'path', d: rectSegments(0, 0, 100, 100), fillRule: 'nonzero', paint: radial }]), [255, 0, 0]);
  const ring = rectSegments(0, 0, 100, 100).concat(circleSegments(50, 50, 30));
  assert.equal(await corner([{ kind: 'path', d: ring, fillRule: 'evenodd', paint: solid([0, 0, 0]) }]), null, 'a hole is no backdrop');
  assert.deepEqual(await corner([
    { kind: 'path', d: rectSegments(0, 0, 100, 100), fillRule: 'nonzero', paint: solid([0, 0, 1]) },
    { kind: 'path', d: ring, fillRule: 'evenodd', paint: solid([0, 0, 0]) }
  ]), [0, 0, 255], 'the latest fill under the center wins');
});

test('QRTurboEps writes a logo on a transparent background as an ImageType 3 masked image', async () => {
  const pixels = testLogoPixels(16);
  const eps = await writeEps(qrTestDrawing(PAYLOAD, { ecl: 'H', background: null, logo: { pixels } }).items
    .filter(item => item.kind === 'image')
    .reduce((drawing, item) => ({ ...drawing, items: [item] }), { width: 410, height: 410, items: [] }), { deflate });
  assert.match(eps, /\{<< \/ImageType 3 \/InterleaveType 2\n\/DataDict << \/ImageType 1 \/Width 16 \/Height 16 \/ImageMatrix \[16 0 0 16 0 0\] \/BitsPerComponent 8 \/Decode \[0 1 0 1 0 1\]\n\/DataSource QRTurboData \/FlateDecode filter >>\n\/MaskDict << \/ImageType 1 \/Width 16 \/Height 16 \/ImageMatrix \[16 0 0 16 0 0\] \/BitsPerComponent 1 \/Decode \[1 0\] >>\n>> image QRTurboData flushfile\} exec\n/);
  const data = decodeBlock(dataBlocks(eps)[0], 'FlateDecode');
  assert.equal(data.length, 16 * (2 + 48));
  for (let row = 0; row < 16; row++) {
    const offset = row * 50;
    for (let col = 0; col < 16; col++) {
      const bit = (data[offset + (col >> 3)] >> (7 - (col & 7))) & 1;
      assert.equal(bit, pixels.alpha[row * 16 + col] >= 128 ? 1 : 0);
    }
    assert.deepEqual([...data.subarray(offset + 2, offset + 50)], [...pixels.rgb.subarray(row * 48, (row + 1) * 48)]);
  }
});

test('QRTurboEps caps logo rasters at 1024 px on the long side', async () => {
  const pixels = testLogoPixels(2048, { opaque: true });
  const eps = await writeEps(square([{ kind: 'image', x: 40, y: 40, width: 20, height: 20, href: '', pixels }]));
  assert.match(eps, /\/ImageType 1 \/Width 1024 \/Height 1024 \/ImageMatrix \[1024 0 0 1024 0 0\]/);
  const rgb = decodeBlock(dataBlocks(eps)[0], 'RunLengthDecode');
  assert.equal(rgb.length, 1024 * 1024 * 3);
});

test('QRTurboEps CMYK and K-only modes use setcmykcolor and a gray logo', async () => {
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([0, 0, 0]) },
    { kind: 'path', d: rectSegments(10, 0, 10, 10), fillRule: 'nonzero', paint: solid([1, 0, 0]) },
    { kind: 'stroke', d: rectSegments(20, 20, 10, 10), lineWidth: 2, paint: solid([0, 0, 1]) },
    { kind: 'image', x: 40, y: 40, width: 10, height: 10, href: '', pixels: testLogoPixels(4, { opaque: true }) }
  ]);
  const cmyk = await writeEps(drawing, { colorMode: 'cmyk' });
  assert.match(cmyk, /\n0 0 0 1 setcmykcolor\n/);
  assert.match(cmyk, /\n0 1 1 0 setcmykcolor\n/);
  assert.match(cmyk, /\n2 setlinewidth\n1 1 0 0 setcmykcolor\n[\s\S]*?\nstroke\n/);
  assert.doesNotMatch(cmyk, /setrgbcolor/);
  assert.match(cmyk, /\/DeviceRGB setcolorspace/);
  const k = await writeEps(drawing, { colorMode: 'k' });
  assert.match(k, /\n0 0 0 0\.7874 setcmykcolor\n/);
  for (const line of k.match(/^.* setcmykcolor$/gm)) assert.match(line, /^0 0 0 [\d.]+ setcmykcolor$/);
  assert.match(k, /\/DeviceGray setcolorspace\n[\s\S]*?\/Decode \[0 1\]\n/);
});

test('QRTurboEps K-only mode prints mid-gray at about 50% K, also in logos', async () => {
  const mid = 128 / 255;
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([mid, mid, mid]) },
    { kind: 'path', d: rectSegments(10, 0, 10, 10), fillRule: 'nonzero', paint: solid([1, 1, 1]) },
    { kind: 'image', x: 20, y: 20, width: 10, height: 10, href: '', pixels: { width: 3, height: 1, rgb: new Uint8Array([128, 128, 128, 255, 0, 0, 0, 0, 0]) } }
  ]);
  const check = async label => {
    const eps = await writeEps(drawing, { colorMode: 'k' });
    assert.match(eps, /\n0 0 0 0\.498 setcmykcolor\n/, `${label}: #808080 is 49.8% K, not 78%`);
    assert.match(eps, /\n0 0 0 0 setcmykcolor\n/, `${label}: white is 0% K`);
    assert.deepEqual([...decodeBlock(dataBlocks(eps)[0], 'RunLengthDecode')], [128, 54, 0], label);
  };
  await check('QRTurboColor.toK');
});

test('QRTurboEps page scale keeps small prints of large codes at the exact BoundingBox size', async () => {
  // A version 40 code with an 11-module quiet zone is 1990 units wide. At
  // 10 mm the factor is 0.0142445: with 4 decimals the artwork was 0.3%
  // smaller than the HiResBoundingBox and left unpainted strips.
  const widthPt = (10 * 72) / 25.4;
  const drawing = square([{ kind: 'path', d: rectSegments(0, 0, 1990, 1990), fillRule: 'nonzero', paint: solid([1, 0.8, 0]) }], 1990);
  const eps = await writeEps(drawing, { widthPt });
  assert.match(eps, /^%%HiResBoundingBox: 0 0 28\.3465 28\.3465$/m);
  const [, s, negS] = /^gsave 0 28\.3465 translate (\S+) (\S+) scale$/m.exec(eps).map(Number);
  assert.equal(negS, -s);
  assert.ok(Math.abs((s * drawing.width) - widthPt) < 1e-5, `${s * drawing.width} pt`);
  // The integer BoundingBox is 29 pt; the artwork ends at 28.3465 pt.
  const raster = rasterizeEps(eps, { pxPerPt: 40 });
  assert.deepEqual(sampleColor(raster, 1133, 600), [255, 204, 0], 'the right edge is painted');
  assert.deepEqual(sampleColor(raster, 600, raster.height - 1), [255, 204, 0], 'the bottom edge is painted');
});

test('QRTurboEps needs QRTurboGeometry, and QRTurboColor for CMYK and K-only', async () => {
  const drawing = square([{ kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([0.2, 0.4, 0.6]) }]);
  const color = globalThis.QRTurboColor;
  delete globalThis.QRTurboColor;
  try {
    await assert.rejects(writeEps(drawing, { colorMode: 'cmyk' }), { message: 'QRTurboEps: QRTurboColor is not loaded' });
    await assert.rejects(writeEps(drawing, { colorMode: 'k' }), { message: 'QRTurboEps: QRTurboColor is not loaded' });
    assert.match(await writeEps(drawing), /\n0\.2 0\.4 0\.6 setrgbcolor\n/, 'RGB needs no conversion');
  } finally {
    globalThis.QRTurboColor = color;
  }
  const geometry = globalThis.QRTurboGeometry;
  delete globalThis.QRTurboGeometry;
  try {
    await assert.rejects(writeEps(drawing), { message: 'QRTurboEps: QRTurboGeometry is not loaded' });
  } finally {
    globalThis.QRTurboGeometry = geometry;
  }
  // The shared helpers report errors under the writer's own name.
  await assert.rejects(writeEps(square([{ kind: 'path', d: rectSegments(0, 0, 1, Infinity), fillRule: 'nonzero', paint: solid([0, 0, 0]) }])),
    { name: 'RangeError', message: 'QRTurboEps: number out of range' });
  await assert.rejects(writeEps(square([{ kind: 'path', d: rectSegments(0, 0, 1, 1), fillRule: 'nonzero', paint: { type: 'pattern' } }])),
    { name: 'TypeError', message: 'QRTurboEps: unknown paint' });
});

test('QRTurboEps never writes the payload into the file', async () => {
  const secret = 'WIFI:S:Home;T:WPA;P:supersecret-password;;';
  const drawing = qrTestDrawing(secret, { ecl: 'H', frame: { style: 'banner', text: 'Guest WiFi' }, logo: { pixels: testLogoPixels(16) } });
  for (const options of [{}, { deflate }, { colorMode: 'k' }]) {
    const eps = await writeEps(drawing, options);
    assert.doesNotMatch(eps, /supersecret|WIFI:|Home;T/);
    for (const block of dataBlocks(eps)) {
      const raw = ascii85Decode(block.slice(0, -2));
      for (const bytes of [raw, options.deflate ? zlib.inflateSync(raw) : runLengthDecode(raw)]) {
        assert.doesNotMatch(Buffer.from(bytes).toString('latin1'), /supersecret|WIFI:/);
      }
    }
    assert.equal(decodeQr(rasterizeEps(eps, { pxPerPt: 3 })), secret);
  }
});

test('QRTurboEps output decodes with jsQR after rasterizing', async () => {
  const linear = { type: 'linear', x1: 0, y1: 0, x2: 330, y2: 330, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [0.1, 0.2, 0.6] }] };
  const label = { cols: 64, rows: 8, bits: new Uint8Array(64 * 8).map((_, i) => ((i % 64) % 9 < 5 ? 1 : 0)), x: 112, y: 900, width: 800, height: 100 };
  const cases = [
    ['square', qrTestDrawing(PAYLOAD), {}],
    ['dots', qrTestDrawing(PAYLOAD, { dots: 'circle' }), { deflate }],
    ['linear gradient', qrTestDrawing(PAYLOAD, { paint: linear }), {}],
    ['banner text', qrTestDrawing(PAYLOAD, { frame: { style: 'banner' } }), {}],
    ['banner mask', qrTestDrawing(PAYLOAD, { frame: { style: 'banner', mask: label } }), { deflate }],
    ['outline', qrTestDrawing(PAYLOAD, { frame: { style: 'outline', color: [0.1, 0.1, 0.5], textColor: [0.1, 0.1, 0.5] } }), {}],
    ['logo on background', qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(32) } }), { deflate }],
    ['logo, transparent', qrTestDrawing(PAYLOAD, { ecl: 'H', background: null, logo: { pixels: testLogoPixels(32) } }), {}],
    ['cmyk', qrTestDrawing(PAYLOAD, { paint: linear }), { colorMode: 'cmyk' }],
    ['k only', qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(32) } }), { colorMode: 'k', deflate }]
  ];
  for (const [name, drawing, options] of cases) {
    const eps = await writeEps(drawing, options);
    assert.equal(decodeQr(rasterizeEps(eps, { pxPerPt: 3 })), PAYLOAD, name);
  }
});

test('QRTurboEps rasterized logo shows through a transparent mask and keeps its colors', async () => {
  const pixels = testLogoPixels(20);
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 50, 100), fillRule: 'nonzero', paint: solid([0, 0, 1]) },
    { kind: 'image', x: 25, y: 25, width: 50, height: 50, href: '', pixels }
  ]);
  const raster = rasterizeEps(await writeEps(drawing, { widthPt: 100 }), { pxPerPt: 1 });
  assert.deepEqual(sampleColor(raster, 48, 48, 4, 4), [220, 30, 60]);
  assert.deepEqual(sampleColor(raster, 10, 10, 10, 10), [0, 0, 255]);
  assert.deepEqual(sampleColor(raster, 80, 10, 10, 10), [255, 255, 255]);
});

// A green band under a stencil mask whose left half paints blue, and a
// transparent-cornered logo (ImageType 3) on the bare page below it.
function polarityDrawing() {
  const cols = 16;
  const rows = 4;
  const bits = new Uint8Array(cols * rows).map((_, i) => ((i % cols) < 8 ? 1 : 0));
  return square([
    { kind: 'path', d: rectSegments(0, 0, 100, 50), fillRule: 'nonzero', paint: solid([0, 1, 0]) },
    { kind: 'mask', x: 0, y: 0, width: 100, height: 50, cols, rows, bits, paint: solid([0, 0, 1]) },
    { kind: 'image', x: 25, y: 55, width: 40, height: 40, href: '', pixels: testLogoPixels(20) }
  ]);
}

function assertPolarity(raster, name) {
  assert.deepEqual(sampleColor(raster, 10, 10, 20, 20), [0, 0, 255], `${name}: mask bits of 1 paint the fill color`);
  assert.deepEqual(sampleColor(raster, 70, 10, 20, 20), [0, 255, 0], `${name}: mask bits of 0 leave the backdrop`);
  assert.deepEqual(sampleColor(raster, 26, 56, 3, 3), [255, 255, 255], `${name}: masked-out logo pixels show the page`);
  assert.deepEqual(sampleColor(raster, 43, 73, 4, 4), [220, 30, 60], `${name}: opaque logo pixels keep their color`);
}

test('QRTurboEps masks paint only their 1 bits and ImageType 3 logos keep their transparency', async () => {
  for (const options of [{}, { deflate }]) {
    const eps = await writeEps(polarityDrawing(), { widthPt: 100, ...options });
    assert.match(eps, /\/ImageType 3/);
    assertPolarity(rasterizeEps(eps, { pxPerPt: 1 }), 'vector-inspect');
  }
});

test('QRTurboEps rejects invalid input', async () => {
  await assert.rejects(writeEps(qrTestDrawing(PAYLOAD), { widthPt: -1 }), RangeError);
  await assert.rejects(writeEps(null), TypeError);
  await assert.rejects(writeEps(square([{ kind: 'polygon' }])), TypeError);
  await assert.rejects(writeEps(square([{ kind: 'mask', x: 0, y: 0, width: 1, height: 1, cols: 9, rows: 2, bits: new Uint8Array(3), paint: solid([0, 0, 0]) }])), RangeError);
});

test('QRTurboEps writes decodable files for the flattened library fixtures', async t => {
  const svg = require('../../Public/js/lib/svg.js');
  const geometry = require('../../Public/js/lib/geometry.js');
  const fixtureDir = path.join(repoRoot, 'tests/fixtures/library-svg');
  const resolveImage = async (href, box) => testLogoPixels(Math.max(1, Math.min(64, Math.round(box.w || 32))));
  const names = fs.readdirSync(fixtureDir).filter(name => name.endsWith('.svg')).sort();
  try {
    await geometry.flatten(svg.parse(fs.readFileSync(path.join(fixtureDir, names[0]), 'utf8')), { resolveImage });
  } catch (error) {
    if (/not implemented/.test(String(error && error.message))) {
      t.skip('QRTurboSvg.parse or QRTurboGeometry.flatten is still a stub');
      return;
    }
    throw error;
  }
  for (const name of names) {
    const flat = await geometry.flatten(svg.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8')), { resolveImage });
    const eps = await QRTurboEps.write(flat, { widthPt: MM50, colorMode: 'rgb', deflate, date: DATE });
    const raster = rasterizeEps(eps, { pxPerPt: 3 });
    if (!UNDECODABLE_FIXTURES.has(name)) {
      const expected = { 'image.svg': 'https://qrturbo.app', 'g-ref.svg': 'https://qrturbo.app/?ref=geom' }[name] || 'A';
      assert.equal(decodeQr(raster), expected, name);
    }
  }
});

test('QRTurboEps output renders and decodes in Ghostscript when it is installed', async t => {
  if (!ghostscriptVersion()) {
    t.skip('Ghostscript is not installed');
    return;
  }
  const label = { cols: 64, rows: 8, bits: new Uint8Array(64 * 8).fill(1), x: 112, y: 900, width: 800, height: 100 };
  const cases = [
    qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(32) }, frame: { style: 'banner' } }),
    qrTestDrawing(PAYLOAD, { ecl: 'H', background: null, logo: { pixels: testLogoPixels(32) }, frame: { style: 'banner', mask: label } })
  ];
  for (const drawing of cases) {
    for (const options of [{}, { deflate }, { colorMode: 'cmyk' }]) {
      const eps = await writeEps(drawing, options);
      assert.equal(decodeQr(rasterizeWithGhostscript(Buffer.from(eps, 'latin1'), { kind: 'eps', dpi: 200 })), PAYLOAD);
    }
  }
  for (const options of [{}, { deflate }]) {
    const eps = await writeEps(polarityDrawing(), { widthPt: 100, ...options });
    assertPolarity(rasterizeWithGhostscript(Buffer.from(eps, 'latin1'), { kind: 'eps', dpi: 72 }), 'Ghostscript');
  }
});
