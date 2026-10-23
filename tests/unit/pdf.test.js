const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const helvetica = require('../../Public/js/lib/helvetica.js');
const QRTurboPdf = require('../../Public/js/lib/pdf.js');
// The writer takes its shared helpers from QRTurboGeometry.writerKit and the
// CMYK and K conversions from QRTurboColor, as in the browser.
require('../../Public/js/lib/geometry.js');
require('../../Public/js/lib/color.js');
const {
  parsePdf,
  rasterizePdf,
  decodeQr,
  qrTestDrawing,
  testLogoPixels,
  rectSegments,
  sampleColor,
  ghostscriptVersion,
  rasterizeWithGhostscript
} = require('../helpers/vector-inspect');

const repoRoot = path.resolve(__dirname, '..', '..');
const DATE = new Date(Date.UTC(2026, 9, 22, 8, 5, 9));
const MM50 = (50 * 72) / 25.4;
const PAYLOAD = 'https://qrturbo.app/?ref=pdf-test';
const deflate = async bytes => new Uint8Array(zlib.deflateSync(bytes));
const UNDECODABLE_FIXTURES = new Set(['cdot-dot.svg', 'cdot-square.svg', 'dots-dots.svg', 'grad-corners.svg', 'grad-dots-linear.svg']);
const solid = color => ({ type: 'solid', color });

async function writePdf(drawing, options = {}) {
  return QRTurboPdf.write(drawing, { widthPt: MM50, page: 'fit', colorMode: 'rgb', date: DATE, ...options });
}

function textOf(result) {
  return Buffer.from(result.bytes).toString('latin1');
}

function square(items, size = 100) {
  return { width: size, height: size, items };
}

function cmNumbers(content) {
  const match = /^q\n(\S+) 0 0 (\S+) (\S+) (\S+) cm\n/.exec(content);
  assert.ok(match, 'content starts with q and the page transform');
  return match.slice(1).map(Number);
}

function objectsWhere(doc, predicate) {
  return [...doc.objects.values()].filter(object => object.value && typeof object.value === 'object' && predicate(object.value));
}

test('QRTurboHelvetica maps WinAnsi codes to glyph names and Core14 Helvetica-Bold widths', () => {
  assert.equal(helvetica.GLYPH_NAMES.length, 256);
  assert.ok(Object.isFrozen(helvetica.GLYPH_NAMES));
  assert.equal(helvetica.WIDTHS.length, 256);
  for (let code = 0; code < 256; code++) {
    const encodable = (code >= 0x20 && code <= 0x7e) || code >= 0xa0;
    assert.equal(helvetica.GLYPH_NAMES[code] !== null, encodable, `name for ${code}`);
    assert.equal(helvetica.WIDTHS[code] > 0, encodable, `width for ${code}`);
  }
  const expected = {
    0x20: ['space', 278], 0x27: ['quotesingle', 238], 0x41: ['A', 722], 0x57: ['W', 944], 0x60: ['grave', 333],
    0x6d: ['m', 889], 0x7e: ['asciitilde', 584], 0xa0: ['space', 278], 0xad: ['hyphen', 333], 0xb5: ['mu', 611],
    0xc6: ['AE', 1000], 0xd7: ['multiply', 584], 0xdf: ['germandbls', 611], 0xe9: ['eacute', 556], 0xff: ['ydieresis', 556]
  };
  for (const [code, [name, width]] of Object.entries(expected)) {
    assert.equal(helvetica.GLYPH_NAMES[code], name);
    assert.equal(helvetica.WIDTHS[code], width);
  }
});

test('QRTurboHelvetica encodes Latin-1 text and measures it with the AFM widths', () => {
  assert.equal(helvetica.canEncode('SCAN ME'), true);
  assert.equal(helvetica.canEncode('Skanna mig, Åäö ß ÿ'), true);
  assert.equal(helvetica.canEncode(''), true);
  for (const text of ['5 €', 'Zeskanuj ż', 'Σάρωση', 'Naskenujte ő', 'スキャン', 'tab\there', '\u0080']) {
    assert.equal(helvetica.canEncode(text), false, text);
  }
  assert.deepEqual([...helvetica.encode('Aé ÿ')], [0x41, 0xe9, 0x20, 0xff]);
  assert.throws(() => helvetica.encode('€'), RangeError);
  assert.equal(helvetica.measure('SCAN ME', 1000), 667 + 722 + 722 + 722 + 278 + 833 + 667);
  assert.equal(helvetica.measure('SCAN ME', 10), 46.11);
  assert.equal(helvetica.measure('', 10), 0);
});

test('QRTurboPdf writes a PDF 1.4 header with a binary comment and ends with %%EOF', async () => {
  const result = await writePdf(qrTestDrawing(PAYLOAD));
  const bytes = Buffer.from(result.bytes);
  assert.ok(result.bytes instanceof Uint8Array);
  assert.equal(bytes.subarray(0, 9).toString('latin1'), '%PDF-1.4\n');
  assert.deepEqual([...bytes.subarray(9, 15)], [0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]);
  assert.ok(textOf(result).endsWith('\n%%EOF\n'));
  assert.equal(parsePdf(bytes).version, '1.4');
});

test('QRTurboPdf xref entries are exactly 20 bytes and point at their objects', async () => {
  const result = await writePdf(qrTestDrawing(PAYLOAD, { logo: { pixels: testLogoPixels(16) }, ecl: 'H' }), { deflate });
  const text = textOf(result);
  const doc = parsePdf(result.bytes);
  const xrefText = text.slice(doc.xref.offset, text.indexOf('trailer', doc.xref.offset));
  const lines = xrefText.split('\n').slice(2, -1).map(line => `${line}\n`);
  assert.equal(lines.length, doc.xref.size);
  for (const line of lines) assert.equal(Buffer.byteLength(line, 'latin1'), 20);
  assert.equal(lines[0], '0000000000 65535 f \n');
  doc.xref.entries.forEach((entry, num) => {
    if (num === 0) return;
    assert.ok(text.startsWith(`${num} 0 obj\n`, entry.offset), `entry ${num} points at its object`);
  });
  assert.match(text, new RegExp(`startxref\\n${doc.xref.offset}\\n%%EOF\\n$`));
  assert.match(text, new RegExp(`trailer\\n<< /Size ${doc.xref.size} /Root 1 0 R /Info 5 0 R >>`));
});

test('QRTurboPdf stream /Length values are exact', async () => {
  for (const options of [{}, { deflate }]) {
    const result = await writePdf(qrTestDrawing(PAYLOAD, { logo: { pixels: testLogoPixels(16) }, ecl: 'H' }), options);
    const text = textOf(result);
    const doc = parsePdf(result.bytes);
    const streams = [...doc.objects.values()].filter(object => object.stream);
    assert.ok(streams.length >= 3);
    for (const object of streams) {
      const start = text.indexOf('stream\n', object.offset) + 'stream\n'.length;
      assert.equal(text.slice(start + object.value.Length, start + object.value.Length + 11), '\nendstream\n');
    }
  }
});

test('QRTurboPdf numbers have at most 4 decimals (the page scale 8 digits), no exponent and no negative zero', async () => {
  const drawing = square([
    {
      kind: 'path',
      fillRule: 'nonzero',
      d: [['M', 1e-7, -1e-9], ['L', 99.123456789, -0], ['L', 50.00004, 99.99996], ['C', 1e-12, 2, 3.14159265, 4, 5, 6], ['Z']],
      paint: solid([0.123456, 1e-8, 1])
    }
  ]);
  const result = await writePdf(drawing);
  const doc = parsePdf(result.bytes);
  // Only the page scale keeps more digits (8 significant ones).
  const [, pageScale, content] = /^q\n(\S+) 0 0 \S+ \S+ \S+ cm\n([\s\S]*)$/.exec(doc.content);
  assert.equal(pageScale, '1.4173228');
  const text = textOf(result);
  for (const source of [text, content]) {
    assert.doesNotMatch(source, /\d(?:\.\d*)?[eE][+-]?\d/);
    assert.doesNotMatch(source, /(^|[\s[])-0(?=[\s\]])/m);
  }
  assert.doesNotMatch(text.replace(doc.content, ''), /\d\.\d{5,}/);
  assert.doesNotMatch(content, /\d\.\d{5,}/);
  assert.match(doc.content, /\n0 0 m\n99\.1235 0 l\n50 100 l\n0 2 3\.1416 4 5 6 c\nh\n/);
  assert.match(doc.content, /\n0\.1235 0 1 rg\n/);
});

test('QRTurboPdf Info dictionary holds only the brand, a generic title and the date', async () => {
  const result = await writePdf(qrTestDrawing(PAYLOAD));
  const doc = parsePdf(result.bytes);
  assert.match(textOf(result), /<< \/Producer \(QRTurbo\.app\) \/Creator \(QRTurbo\.app\) \/Title \(QR code\) \/CreationDate \(D:20261022080509Z\) >>/);
  assert.deepEqual(Object.keys(doc.info).sort(), ['CreationDate', 'Creator', 'Producer', 'Title']);
  assert.equal(doc.info.Title.bytes.toString('latin1'), 'QR code');
});

test('QRTurboPdf Fit page at 50 mm is a 141.7323 pt square with a y-flip transform', async () => {
  const drawing = qrTestDrawing(PAYLOAD);
  const result = await writePdf(drawing);
  const doc = parsePdf(result.bytes);
  assert.equal(result.scaledToFit, false);
  assert.deepEqual(doc.mediaBox, [0, 0, 141.7323, 141.7323]);
  assert.match(textOf(result), /\/MediaBox \[0 0 141\.7323 141\.7323\]/);
  const [s, negS, tx, ty] = cmNumbers(doc.content);
  assert.ok(Math.abs((s * drawing.width) - MM50) < 1e-5, 'the artwork spans the MediaBox exactly');
  assert.equal(negS, -s);
  assert.equal(tx, 0);
  assert.equal(ty, 141.7323);
  assert.ok(doc.content.endsWith('Q\n'));
});

test('QRTurboPdf page scale keeps small prints of large codes at the exact page size', async () => {
  // A version 40 code with an 11-module quiet zone is 1990 units wide. At
  // 10 mm the factor is 0.0142445: with 4 decimals the artwork was 0.3%
  // narrower than the MediaBox and left unpainted strips.
  const widthPt = (10 * 72) / 25.4;
  const drawing = square([{ kind: 'path', d: rectSegments(0, 0, 1990, 1990), fillRule: 'nonzero', paint: solid([1, 0.8, 0]) }], 1990);
  for (const page of ['fit', 'a4']) {
    const doc = parsePdf((await writePdf(drawing, { widthPt, page })).bytes);
    const [s, negS] = cmNumbers(doc.content);
    assert.equal(negS, -s);
    assert.ok(Math.abs((s * drawing.width) - widthPt) < 1e-5, `${page}: ${s * drawing.width} pt`);
  }
  const raster = rasterizePdf((await writePdf(drawing, { widthPt })).bytes, { pxPerPt: 40 });
  assert.equal(raster.width, 1134);
  assert.deepEqual(sampleColor(raster, raster.width - 1, 500), [255, 204, 0], 'the right edge is painted');
  assert.deepEqual(sampleColor(raster, 500, raster.height - 1), [255, 204, 0], 'the bottom edge is painted');
});

test('QRTurboPdf framed artwork keeps a square Fit page', async () => {
  const result = await writePdf(qrTestDrawing(PAYLOAD, { frame: { style: 'banner' } }), { widthPt: 72 });
  assert.deepEqual(parsePdf(result.bytes).mediaBox, [0, 0, 72, 72]);
});

test('QRTurboPdf A4 and Letter pages center the artwork at its exact size', async () => {
  const drawing = qrTestDrawing(PAYLOAD);
  const a4 = await writePdf(drawing, { page: 'a4' });
  const a4Doc = parsePdf(a4.bytes);
  assert.deepEqual(a4Doc.mediaBox, [0, 0, 595.276, 841.89]);
  assert.equal(a4.scaledToFit, false);
  const [s, , tx, ty] = cmNumbers(a4Doc.content);
  const width = s * drawing.width;
  assert.ok(Math.abs(width - MM50) < 0.05);
  assert.ok(Math.abs(tx - ((595.276 - MM50) / 2)) < 1e-3);
  assert.ok(Math.abs(ty - (((841.89 - MM50) / 2) + MM50)) < 1e-3);

  const letter = await writePdf(drawing, { page: 'letter' });
  const letterDoc = parsePdf(letter.bytes);
  assert.deepEqual(letterDoc.mediaBox, [0, 0, 612, 792]);
  const [, , ltx, lty] = cmNumbers(letterDoc.content);
  assert.ok(Math.abs(ltx - ((612 - MM50) / 2)) < 1e-3);
  assert.ok(Math.abs(lty - (((792 - MM50) / 2) + MM50)) < 1e-3);
});

test('QRTurboPdf scales artwork that is larger than the page minus margins', async () => {
  const drawing = qrTestDrawing(PAYLOAD);
  const result = await writePdf(drawing, { page: 'a4', widthPt: (300 * 72) / 25.4 });
  assert.equal(result.scaledToFit, true);
  const doc = parsePdf(result.bytes);
  const [s, , tx, ty] = cmNumbers(doc.content);
  const width = s * drawing.width;
  assert.ok(Math.abs(width - (595.276 - (2 * 28.35))) < 0.05);
  assert.ok(Math.abs(tx - 28.35) < 0.05);
  assert.ok(Math.abs(ty - ((841.89 + width) / 2)) < 0.05);

  const custom = await writePdf(drawing, { page: 'letter', widthPt: 700, marginPt: 36 });
  assert.equal(custom.scaledToFit, true);
  const [cs] = cmNumbers(parsePdf(custom.bytes).content);
  assert.ok(Math.abs((cs * drawing.width) - (612 - 72)) < 0.05);
});

test('QRTurboPdf compresses streams with FlateDecode and they inflate to the plain content', async () => {
  const drawing = qrTestDrawing(PAYLOAD, { logo: { pixels: testLogoPixels(16) }, ecl: 'H' });
  const packed = await writePdf(drawing, { deflate });
  const plain = await writePdf(drawing);
  const packedDoc = parsePdf(packed.bytes);
  const plainDoc = parsePdf(plain.bytes);
  const content = packedDoc.objects.get(4);
  assert.equal(content.value.Filter, '/FlateDecode');
  assert.equal(zlib.inflateSync(content.stream).toString('latin1'), plainDoc.content);
  assert.equal(packedDoc.content, plainDoc.content);
  for (const object of packedDoc.objects.values()) {
    if (object.stream) assert.equal(object.value.Filter, '/FlateDecode');
  }
  for (const object of plainDoc.objects.values()) {
    if (object.stream) assert.equal(object.value.Filter, undefined);
  }
  assert.ok(packed.bytes.length < plain.bytes.length);
});

test('QRTurboPdf falls back to uncompressed streams when deflate gives nothing', async () => {
  const drawing = qrTestDrawing(PAYLOAD);
  for (const fallback of [async () => null, async () => { throw new Error('no CompressionStream'); }]) {
    const result = await writePdf(drawing, { deflate: fallback });
    const doc = parsePdf(result.bytes);
    assert.equal(doc.objects.get(4).value.Filter, undefined);
    assert.match(doc.content, / cm\n/);
  }
});

test('QRTurboPdf writes a WinAnsi label as centered Helvetica-Bold text', async () => {
  const label = 'Scan me (é) \\ 100%';
  const drawing = square([
    { kind: 'text', text: label, x: 50, y: 90, fontSize: 8, maxWidth: null, anchor: 'middle', paint: solid([0, 0, 0]) }
  ]);
  const result = await writePdf(drawing);
  const doc = parsePdf(result.bytes);
  const width = helvetica.measure(label, 8);
  const expectedX = Math.round((50 - (width / 2)) * 10000) / 10000;
  assert.ok(doc.content.includes(`BT /F1 8 Tf 1 0 0 -1 ${expectedX} 90 Tm (Scan me \\(\\351\\) \\\\ 100%) Tj ET`));
  assert.match(textOf(result), /<< \/Type \/Font \/Subtype \/Type1 \/BaseFont \/Helvetica-Bold \/Encoding \/WinAnsiEncoding >>/);
  assert.match(textOf(result), /\/Resources << \/Font << \/F1 6 0 R >> >>/);
  assert.doesNotMatch(textOf(result), /\/FontFile|\/Subtype \/Image/);
});

test('QRTurboPdf honors start and end text anchors', async () => {
  const width = helvetica.measure('Hi', 10);
  const drawing = square([
    { kind: 'text', text: 'Hi', x: 50, y: 20, fontSize: 10, maxWidth: null, anchor: 'start', paint: solid([0, 0, 0]) },
    { kind: 'text', text: 'Hi', x: 50, y: 40, fontSize: 10, maxWidth: null, anchor: 'end', paint: solid([0, 0, 0]) }
  ]);
  const doc = parsePdf((await writePdf(drawing)).bytes);
  assert.ok(doc.content.includes('1 0 0 -1 50 20 Tm (Hi) Tj'));
  assert.ok(doc.content.includes(`1 0 0 -1 ${Math.round((50 - width) * 10000) / 10000} 40 Tm (Hi) Tj`));
  assert.equal((doc.content.match(/ rg\n/g) || []).length, 1, 'an unchanged fill color is not repeated');
});

test('QRTurboPdf shrinks a label to maxWidth with the AFM widths', async () => {
  const label = 'SCAN THIS CODE FOR THE MENU';
  const drawing = square([
    { kind: 'text', text: label, x: 512, y: 950, fontSize: 75, maxWidth: 700, anchor: 'middle', paint: solid([1, 1, 1]) }
  ], 1024);
  const doc = parsePdf((await writePdf(drawing)).bytes);
  const match = /BT \/F1 (\S+) Tf 1 0 0 -1 (\S+) 950 Tm/.exec(doc.content);
  assert.ok(match);
  const size = Number(match[1]);
  assert.ok(size < 75);
  assert.ok(Math.abs(helvetica.measure(label, size) - 700) < 0.1);
  assert.ok(Math.abs(Number(match[2]) - (512 - 350)) < 0.1);
});

test('QRTurboPdf paints a non-Latin label as a 1-bit stencil mask, not as text', async () => {
  const cols = 20;
  const rows = 4;
  const bits = new Uint8Array(cols * rows).map((_, i) => (i % 3 === 0 ? 1 : 0));
  const drawing = qrTestDrawing(PAYLOAD, {
    frame: { style: 'banner', mask: { x: 112, y: 900, width: 800, height: 100, cols, rows, bits }, textColor: [1, 0, 0] }
  });
  const result = await writePdf(drawing, { deflate });
  const text = textOf(result);
  const doc = parsePdf(result.bytes);
  assert.doesNotMatch(doc.content, /Tj|BT/);
  assert.doesNotMatch(text, /\/Font/);
  const masks = objectsWhere(doc, value => value.ImageMask === true);
  assert.equal(masks.length, 1);
  const mask = masks[0];
  assert.equal(mask.value.BitsPerComponent, 1);
  assert.deepEqual(mask.value.Decode, [1, 0]);
  assert.equal(mask.value.Width, cols);
  assert.equal(mask.value.Height, rows);
  assert.equal(mask.data.length, Math.ceil(cols / 8) * rows);
  assert.match(doc.content, /1 0 0 rg\nq\n800 0 0 -100 112 1000 cm\n\/Mk1 Do\nQ/);
});

test('QRTurboPdf accepts mask bits packed by row or one byte per pixel', async () => {
  const cols = 10;
  const rows = 3;
  const unpacked = new Uint8Array(cols * rows);
  [0, 3, 9, 10, 11, 25, 29].forEach(i => { unpacked[i] = 1; });
  const rowBytes = Math.ceil(cols / 8);
  const packed = new Uint8Array(rowBytes * rows);
  unpacked.forEach((bit, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    if (bit) packed[(y * rowBytes) + (x >> 3)] |= 0x80 >> (x & 7);
  });
  const make = bits => square([{ kind: 'mask', x: 0, y: 0, width: 50, height: 15, cols, rows, bits, paint: solid([0, 0, 0]) }]);
  const a = parsePdf((await writePdf(make(unpacked))).bytes);
  const b = parsePdf((await writePdf(make(packed))).bytes);
  const dataA = objectsWhere(a, value => value.ImageMask === true)[0].data;
  const dataB = objectsWhere(b, value => value.ImageMask === true)[0].data;
  assert.deepEqual([...dataA], [...packed]);
  assert.deepEqual([...dataB], [...packed]);
  await assert.rejects(writePdf(make(new Uint8Array(7))), RangeError);
});

test('QRTurboPdf rejects text that WinAnsi cannot encode', async () => {
  const drawing = square([{ kind: 'text', text: 'Σάρωσέ με', x: 50, y: 50, fontSize: 10, maxWidth: null, anchor: 'middle', paint: solid([0, 0, 0]) }]);
  await assert.rejects(writePdf(drawing), RangeError);
  const euro = square([{ kind: 'text', text: 'Pay 5 €', x: 50, y: 50, fontSize: 10, maxWidth: null, anchor: 'middle', paint: solid([0, 0, 0]) }]);
  await assert.rejects(writePdf(euro), RangeError);
});

test('QRTurboPdf writes a linear gradient as an axial shading with a Type 2 function', async () => {
  const paint = { type: 'linear', x1: 0, y1: 0, x2: 330, y2: 330, stops: [{ offset: 0, color: [1, 0, 0] }, { offset: 1, color: [0, 0, 1] }] };
  const drawing = qrTestDrawing(PAYLOAD, { paint });
  drawing.items.push({ kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'evenodd', paint: { ...paint } });
  const result = await writePdf(drawing);
  const doc = parsePdf(result.bytes);
  const shadings = objectsWhere(doc, value => value.ShadingType !== undefined);
  assert.equal(shadings.length, 1, 'identical paints share one shading');
  const shading = shadings[0].value;
  assert.equal(shading.ShadingType, 2);
  assert.equal(shading.ColorSpace, '/DeviceRGB');
  assert.deepEqual(shading.Coords, [0, 0, 330, 330]);
  assert.deepEqual(shading.Extend, [true, true]);
  const fn = doc.resolve(shading.Function);
  assert.deepEqual(fn, { FunctionType: 2, Domain: [0, 1], C0: [1, 0, 0], C1: [0, 0, 1], N: 1 });
  assert.match(doc.content, /\nW n\n\/Sh1 sh\nQ\n/);
  assert.match(doc.content, /\nW\* n\n\/Sh1 sh\nQ\n/);
  assert.match(textOf(result), /\/Shading << \/Sh1 \d+ 0 R >>/);
});

test('QRTurboPdf writes a radial gradient as a Type 3 shading and extra stops as a stitching function', async () => {
  const paint = {
    type: 'radial',
    cx: 165,
    cy: 165,
    r: 200,
    stops: [{ offset: 0.2, color: [1, 0, 0] }, { offset: 0.5, color: [0, 1, 0] }, { offset: 1, color: [0, 0, 1] }]
  };
  const doc = parsePdf((await writePdf(qrTestDrawing(PAYLOAD, { paint }))).bytes);
  const shading = objectsWhere(doc, value => value.ShadingType !== undefined)[0].value;
  assert.equal(shading.ShadingType, 3);
  assert.deepEqual(shading.Coords, [165, 165, 0, 165, 165, 200]);
  const fn = doc.resolve(shading.Function);
  assert.equal(fn.FunctionType, 3);
  assert.deepEqual(fn.Bounds, [0.2, 0.5]);
  assert.deepEqual(fn.Encode, [0, 1, 0, 1, 0, 1]);
  assert.deepEqual(fn.Functions.map(part => [part.C0, part.C1]), [
    [[1, 0, 0], [1, 0, 0]],
    [[1, 0, 0], [0, 1, 0]],
    [[0, 1, 0], [0, 0, 1]]
  ]);
});

test('QRTurboPdf embeds a logo with alpha as one image plus one soft mask', async () => {
  const pixels = testLogoPixels(16);
  const drawing = qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels, size: 0.2 } });
  const logo = drawing.items.find(item => item.kind === 'image');
  const result = await writePdf(drawing, { deflate });
  const doc = parsePdf(result.bytes);
  const images = objectsWhere(doc, value => value.Subtype === '/Image');
  assert.equal(images.length, 2);
  const main = images.find(object => object.value.SMask);
  const smask = doc.objects.get(main.value.SMask.ref);
  assert.equal(main.value.ColorSpace, '/DeviceRGB');
  assert.equal(main.value.BitsPerComponent, 8);
  assert.equal(main.value.Filter, '/FlateDecode');
  assert.deepEqual([...main.data], [...pixels.rgb]);
  assert.equal(smask.value.ColorSpace, '/DeviceGray');
  assert.equal(smask.value.SMask, undefined);
  assert.deepEqual([...smask.data], [...pixels.alpha]);
  assert.equal((textOf(result).match(/\/SMask/g) || []).length, 1);
  const placement = `${logo.width} 0 0 -${logo.height} ${logo.x} ${logo.y + logo.height} cm`;
  assert.ok(doc.content.includes(`\nq\n${placement}\n/Im1 Do\nQ\n`));
});

test('QRTurboPdf adds no soft mask for an opaque logo and no image without a logo', async () => {
  const opaque = await writePdf(qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(16, { opaque: true }) } }));
  const opaqueDoc = parsePdf(opaque.bytes);
  assert.equal(objectsWhere(opaqueDoc, value => value.Subtype === '/Image').length, 1);
  assert.doesNotMatch(textOf(opaque), /\/SMask/);

  const noAlpha = await writePdf(qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(16, { noAlpha: true }) } }));
  assert.doesNotMatch(textOf(noAlpha), /\/SMask/);

  const none = await writePdf(qrTestDrawing(PAYLOAD));
  assert.doesNotMatch(textOf(none), /\/Subtype \/Image|\/XObject/);
});

test('QRTurboPdf CMYK mode writes k and K operators and DeviceCMYK shadings', async () => {
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([0, 0, 0]) },
    { kind: 'path', d: rectSegments(10, 0, 10, 10), fillRule: 'nonzero', paint: solid([1, 0, 0]) },
    { kind: 'stroke', d: rectSegments(20, 20, 10, 10), lineWidth: 2, paint: solid([0, 0, 1]) },
    {
      kind: 'path',
      d: rectSegments(40, 40, 10, 10),
      fillRule: 'nonzero',
      paint: { type: 'linear', x1: 0, y1: 0, x2: 1, y2: 0, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [1, 1, 1] }] }
    }
  ]);
  const doc = parsePdf((await writePdf(drawing, { colorMode: 'cmyk' })).bytes);
  assert.match(doc.content, /\n0 0 0 1 k\n/);
  assert.match(doc.content, /\n0 1 1 0 k\n/);
  assert.match(doc.content, /\n2 w\n1 1 0 0 K\n/);
  assert.doesNotMatch(doc.content, /\brg\b|\bRG\b/);
  const shading = objectsWhere(doc, value => value.ShadingType !== undefined)[0].value;
  assert.equal(shading.ColorSpace, '/DeviceCMYK');
  assert.deepEqual(doc.resolve(shading.Function).C0, [0, 0, 0, 1]);
  assert.deepEqual(doc.resolve(shading.Function).C1, [0, 0, 0, 0]);
});

test('QRTurboPdf K-only mode uses black ink only, including shadings and logos', async () => {
  const paint = { type: 'linear', x1: 0, y1: 0, x2: 1, y2: 0, stops: [{ offset: 0, color: [1, 0, 0] }, { offset: 1, color: [0, 0, 0] }] };
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([1, 0, 0]) },
    { kind: 'path', d: rectSegments(10, 0, 10, 10), fillRule: 'nonzero', paint: solid([1, 1, 1]) },
    { kind: 'path', d: rectSegments(40, 40, 10, 10), fillRule: 'nonzero', paint },
    { kind: 'image', x: 20, y: 20, width: 10, height: 10, href: '', pixels: testLogoPixels(4) }
  ]);
  const doc = parsePdf((await writePdf(drawing, { colorMode: 'k' })).bytes);
  assert.match(doc.content, /\n0 0 0 0\.7874 k\n/);
  assert.match(doc.content, /\n0 0 0 0 k\n/);
  const fills = doc.content.match(/^[\d. ]+ k$/gm);
  for (const fill of fills) assert.match(fill, /^0 0 0 [\d.]+ k$/);
  const shading = objectsWhere(doc, value => value.ShadingType !== undefined)[0].value;
  assert.equal(shading.ColorSpace, '/DeviceCMYK');
  assert.deepEqual(doc.resolve(shading.Function).C0, [0, 0, 0, 0.7874]);
  assert.deepEqual(doc.resolve(shading.Function).C1, [0, 0, 0, 1]);
  const image = objectsWhere(doc, value => value.Subtype === '/Image' && value.SMask)[0];
  assert.equal(image.value.ColorSpace, '/DeviceGray');
  assert.equal(image.data.length, 16);
});

test('QRTurboPdf K-only mode prints mid-gray at about 50% K, also in logos', async () => {
  const mid = 128 / 255;
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([mid, mid, mid]) },
    { kind: 'path', d: rectSegments(10, 0, 10, 10), fillRule: 'nonzero', paint: solid([0, 0, 0]) },
    { kind: 'image', x: 20, y: 20, width: 10, height: 10, href: '', pixels: { width: 3, height: 1, rgb: new Uint8Array([128, 128, 128, 255, 0, 0, 255, 255, 255]) } }
  ]);
  const check = async label => {
    const doc = parsePdf((await writePdf(drawing, { colorMode: 'k' })).bytes);
    assert.match(doc.content, /\n0 0 0 0\.498 k\n/, `${label}: #808080 is 49.8% K, not 78%`);
    assert.match(doc.content, /\n0 0 0 1 k\n/, `${label}: black is 100% K`);
    const image = objectsWhere(doc, value => value.Subtype === '/Image')[0];
    assert.equal(image.value.ColorSpace, '/DeviceGray');
    // DeviceGray samples: the same perceptual gray (128 stays 128).
    assert.deepEqual([...image.data], [128, 54, 255], label);
  };
  await check('QRTurboColor.toK');
});

test('QRTurboPdf never writes the payload into the file', async () => {
  const secret = 'WIFI:S:Home;T:WPA;P:supersecret-password;;';
  const drawing = qrTestDrawing(secret, { frame: { style: 'banner', text: 'Guest WiFi' }, logo: { pixels: testLogoPixels(16) }, ecl: 'H' });
  for (const options of [{}, { deflate }, { colorMode: 'cmyk', page: 'a4' }]) {
    const result = await writePdf(drawing, options);
    const doc = parsePdf(result.bytes);
    const sources = [Buffer.from(result.bytes).toString('latin1'), Buffer.from(result.bytes).toString('utf8')];
    for (const object of doc.objects.values()) if (object.data) sources.push(object.data.toString('latin1'));
    for (const source of sources) {
      assert.doesNotMatch(source, /supersecret|WIFI:|Home;T/);
    }
    assert.equal(decodeQr(rasterizePdf(result.bytes, { pxPerPt: 3 })), secret);
  }
});

test('QRTurboPdf output decodes with jsQR after rasterizing', async () => {
  const linear = { type: 'linear', x1: 0, y1: 0, x2: 330, y2: 330, stops: [{ offset: 0, color: [0, 0, 0] }, { offset: 1, color: [0.1, 0.2, 0.6] }] };
  const radial = { type: 'radial', cx: 165, cy: 165, r: 220, stops: [{ offset: 0, color: [0.4, 0, 0] }, { offset: 1, color: [0, 0, 0.3] }] };
  const cases = [
    ['square', qrTestDrawing(PAYLOAD), {}],
    ['dots', qrTestDrawing(PAYLOAD, { dots: 'circle' }), { deflate }],
    ['linear gradient', qrTestDrawing(PAYLOAD, { paint: linear }), { deflate }],
    ['radial gradient', qrTestDrawing(PAYLOAD, { paint: radial, dots: 'circle' }), {}],
    ['banner frame', qrTestDrawing(PAYLOAD, { frame: { style: 'banner' } }), { deflate }],
    ['outline frame', qrTestDrawing(PAYLOAD, { frame: { style: 'outline', color: [0.1, 0.1, 0.5], textColor: [0.1, 0.1, 0.5] } }), {}],
    ['logo', qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(32), size: 0.22 } }), { deflate }],
    ['transparent background', qrTestDrawing(PAYLOAD, { background: null, ecl: 'H', logo: { pixels: testLogoPixels(32) } }), {}],
    ['cmyk', qrTestDrawing(PAYLOAD, { paint: linear }), { colorMode: 'cmyk' }],
    ['k only', qrTestDrawing(PAYLOAD, { paint: { type: 'solid', color: [0.2, 0.3, 0.6] } }), { colorMode: 'k' }],
    ['a4', qrTestDrawing(PAYLOAD), { page: 'a4' }],
    ['letter scaled', qrTestDrawing(PAYLOAD), { page: 'letter', widthPt: 900 }]
  ];
  for (const [name, drawing, options] of cases) {
    const result = await writePdf(drawing, options);
    const raster = rasterizePdf(result.bytes, { pxPerPt: options.page ? 1.5 : 3 });
    assert.equal(decodeQr(raster), PAYLOAD, name);
  }
});

test('QRTurboPdf rasterized colors match the paints', async () => {
  const drawing = square([
    { kind: 'path', d: rectSegments(0, 0, 100, 100), fillRule: 'nonzero', paint: solid([1, 1, 1]) },
    { kind: 'path', d: rectSegments(0, 0, 50, 50), fillRule: 'nonzero', paint: solid([1, 0, 0]) },
    { kind: 'group', clip: { d: rectSegments(50, 50, 50, 50), fillRule: 'nonzero' }, items: [
      { kind: 'path', d: rectSegments(0, 0, 100, 100), fillRule: 'nonzero', paint: solid([0, 0, 1]) }
    ] }
  ]);
  const raster = rasterizePdf((await writePdf(drawing, { widthPt: 100 })).bytes, { pxPerPt: 1 });
  assert.deepEqual(sampleColor(raster, 10, 10, 20, 20), [255, 0, 0]);
  assert.deepEqual(sampleColor(raster, 70, 70, 20, 20), [0, 0, 255]);
  assert.deepEqual(sampleColor(raster, 70, 10, 20, 20), [255, 255, 255]);
  const cmyk = rasterizePdf((await writePdf(drawing, { widthPt: 100, colorMode: 'cmyk' })).bytes, { pxPerPt: 1 });
  assert.deepEqual(sampleColor(cmyk, 10, 10, 20, 20), [255, 0, 0]);
});

// A green band under a stencil mask whose left half paints blue, and a
// transparent-cornered logo on the bare page below it.
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
  assert.deepEqual(sampleColor(raster, 26, 56, 3, 3), [255, 255, 255], `${name}: transparent logo pixels show the page`);
  assert.deepEqual(sampleColor(raster, 43, 73, 4, 4), [220, 30, 60], `${name}: opaque logo pixels keep their color`);
}

test('QRTurboPdf masks paint only their 1 bits and logos keep their transparency', async () => {
  const result = await writePdf(polarityDrawing(), { widthPt: 100, deflate });
  assertPolarity(rasterizePdf(result.bytes, { pxPerPt: 1 }), 'vector-inspect');
});

test('QRTurboPdf uses QRTurboColor conversions when that module is available', async t => {
  const color = require('../../Public/js/lib/color.js');
  let expected;
  try {
    expected = color.toCmyk('#336699');
  } catch (error) {
    t.skip('QRTurboColor is still a stub');
    return;
  }
  const drawing = square([{ kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([0x33 / 255, 0x66 / 255, 0x99 / 255]) }]);
  const doc = parsePdf((await writePdf(drawing, { colorMode: 'cmyk' })).bytes);
  const format = value => String(Math.round(value * 10000) / 10000);
  assert.match(doc.content, new RegExp(`\\n${expected.map(format).join(' ').replace(/\./g, '\\.')} k\\n`));
});

test('QRTurboPdf needs QRTurboGeometry, and QRTurboColor for CMYK and K-only', async () => {
  const drawing = square([{ kind: 'path', d: rectSegments(0, 0, 10, 10), fillRule: 'nonzero', paint: solid([0.2, 0.4, 0.6]) }]);
  const color = globalThis.QRTurboColor;
  delete globalThis.QRTurboColor;
  try {
    await assert.rejects(writePdf(drawing, { colorMode: 'cmyk' }), { message: 'QRTurboPdf: QRTurboColor is not loaded' });
    await assert.rejects(writePdf(drawing, { colorMode: 'k' }), { message: 'QRTurboPdf: QRTurboColor is not loaded' });
    assert.match(parsePdf((await writePdf(drawing)).bytes).content, /\n0\.2 0\.4 0\.6 rg\n/, 'RGB needs no conversion');
  } finally {
    globalThis.QRTurboColor = color;
  }
  const geometry = globalThis.QRTurboGeometry;
  delete globalThis.QRTurboGeometry;
  try {
    await assert.rejects(writePdf(drawing), { message: 'QRTurboPdf: QRTurboGeometry is not loaded' });
  } finally {
    globalThis.QRTurboGeometry = geometry;
  }
  // The shared helpers report errors under the writer's own name.
  await assert.rejects(writePdf(square([{ kind: 'path', d: rectSegments(0, 0, 1, Infinity), fillRule: 'nonzero', paint: solid([0, 0, 0]) }])),
    { name: 'RangeError', message: 'QRTurboPdf: number out of range' });
  await assert.rejects(writePdf(square([{ kind: 'path', d: rectSegments(0, 0, 1, 1), fillRule: 'nonzero', paint: { type: 'pattern' } }])),
    { name: 'TypeError', message: 'QRTurboPdf: unknown paint' });
});

test('QRTurboPdf strokes and clip groups use w, RG, S and W n', async () => {
  const doc = parsePdf((await writePdf(qrTestDrawing(PAYLOAD, { frame: { style: 'outline', color: [1, 0, 0], textColor: [1, 0, 0] } }))).bytes);
  assert.match(doc.content, /\n20 w\n1 0 0 RG\n[\s\S]*?\nS\n/);
  assert.match(doc.content, /\nq\n[\s\S]*?\nW n\n/);
  let depth = 0;
  for (const line of doc.content.split('\n')) {
    if (line === 'q') depth += 1;
    if (line === 'Q') depth -= 1;
    assert.ok(depth >= 0);
  }
  assert.equal(depth, 0);
});

test('QRTurboPdf writes a valid empty page for a drawing without items', async () => {
  const result = await writePdf({ width: 200, height: 100, items: [] }, { widthPt: 100 });
  const doc = parsePdf(result.bytes);
  assert.deepEqual(doc.mediaBox, [0, 0, 100, 50]);
  assert.equal(doc.content, 'q\n0.5 0 0 -0.5 0 50 cm\nQ\n');
  assert.match(textOf(result), /\/Resources << >> \/Contents 4 0 R/);
  assert.equal(rasterizePdf(result.bytes, { pxPerPt: 1 }).width, 100);
});

test('QRTurboPdf rejects invalid input', async () => {
  const drawing = qrTestDrawing(PAYLOAD);
  await assert.rejects(writePdf(drawing, { widthPt: 0 }), RangeError);
  await assert.rejects(writePdf({ width: 0, height: 10, items: [] }), RangeError);
  await assert.rejects(writePdf(null), TypeError);
  await assert.rejects(writePdf(square([{ kind: 'polygon' }])), TypeError);
  await assert.rejects(writePdf(square([{ kind: 'path', d: [['M', 0, 0], ['L', 1, 1], ['Q', 1, 2]], fillRule: 'nonzero', paint: solid([0, 0, 0]) }])), TypeError);
  await assert.rejects(writePdf(square([{ kind: 'path', d: rectSegments(0, 0, 1, Infinity), fillRule: 'nonzero', paint: solid([0, 0, 0]) }])), RangeError);
  await assert.rejects(
    writePdf(square([{ kind: 'image', x: 0, y: 0, width: 5, height: 5, pixels: { width: 2, height: 2, rgb: new Uint8Array(5), alpha: null } }])),
    RangeError
  );
});

test('QRTurboPdf writes valid files for the flattened library fixtures', async t => {
  const svg = require('../../Public/js/lib/svg.js');
  const geometry = require('../../Public/js/lib/geometry.js');
  const fixtureDir = path.join(repoRoot, 'tests/fixtures/library-svg');
  const resolveImage = async (href, box) => testLogoPixels(Math.max(1, Math.min(64, Math.round(box.w || 32))));
  const names = fs.readdirSync(fixtureDir).filter(name => name.endsWith('.svg')).sort();
  let drawing;
  try {
    drawing = await geometry.flatten(svg.parse(fs.readFileSync(path.join(fixtureDir, names[0]), 'utf8')), { resolveImage });
  } catch (error) {
    if (/not implemented/.test(String(error && error.message))) {
      t.skip('QRTurboSvg.parse or QRTurboGeometry.flatten is still a stub');
      return;
    }
    throw error;
  }
  assert.ok(drawing && Array.isArray(drawing.items));
  for (const name of names) {
    const markup = fs.readFileSync(path.join(fixtureDir, name), 'utf8');
    const flat = await geometry.flatten(svg.parse(markup), { resolveImage });
    const result = await QRTurboPdf.write(flat, { widthPt: MM50, page: 'a4', colorMode: 'rgb', deflate, date: DATE });
    const doc = parsePdf(result.bytes);
    assert.match(doc.content, /\n(f|f\*|\/Sh\d+ sh)\n/, name);
    const raster = rasterizePdf(result.bytes, { pxPerPt: 2 });
    // jsQR cannot read the fixtures with dot-shaped finders or bright green
    // corners, even from a browser render, so those only get the checks above.
    if (!UNDECODABLE_FIXTURES.has(name)) {
      const expected = { 'image.svg': 'https://qrturbo.app', 'g-ref.svg': 'https://qrturbo.app/?ref=geom' }[name] || 'A';
      assert.equal(decodeQr(raster), expected, name);
    }
  }
});

test('QRTurboPdf output renders and decodes in Ghostscript when it is installed', async t => {
  if (!ghostscriptVersion()) {
    t.skip('Ghostscript is not installed');
    return;
  }
  const drawing = qrTestDrawing(PAYLOAD, { ecl: 'H', logo: { pixels: testLogoPixels(32) }, frame: { style: 'banner' } });
  for (const colorMode of ['rgb', 'cmyk', 'k']) {
    const result = await writePdf(drawing, { deflate, colorMode });
    assert.equal(decodeQr(rasterizeWithGhostscript(result.bytes, { kind: 'pdf', dpi: 150 })), PAYLOAD, colorMode);
  }
  const polarity = await writePdf(polarityDrawing(), { widthPt: 100, deflate });
  assertPolarity(rasterizeWithGhostscript(polarity.bytes, { kind: 'pdf', dpi: 72 }), 'Ghostscript');
});
