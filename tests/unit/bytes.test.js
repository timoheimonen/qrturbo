const assert = require('node:assert/strict');
const test = require('node:test');
const zlib = require('node:zlib');

const Bytes = require('../../Public/js/lib/bytes.js');
const { createAppHarness } = require('../helpers/app-vm');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SRGB_CHUNK = '0000000173524742' + '00aece1ce9';

function pngChunk(type, data = Buffer.alloc(0)) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([length, body, crc]);
}

function makePng({ width = 3, height = 2, before = [], after = [] } = {}) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(height * (1 + (width * 4)), 0x7f);
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    ...before,
    pngChunk('IDAT', zlib.deflateSync(raw)),
    ...after,
    pngChunk('IEND')
  ]);
}

function readChunks(png) {
  const buffer = Buffer.from(png);
  assert.deepEqual(buffer.subarray(0, 8), PNG_SIGNATURE);
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    const crc = buffer.readUInt32BE(offset + 8 + length);
    assert.equal(crc, zlib.crc32(buffer.subarray(offset + 4, offset + 8 + length)), `${type} CRC`);
    chunks.push({ type, data, raw: buffer.subarray(offset, offset + 12 + length) });
    offset += 12 + length;
  }
  return chunks;
}

function physData(dpi) {
  const data = Buffer.alloc(9);
  const ppm = Math.round(dpi / 0.0254);
  data.writeUInt32BE(ppm, 0);
  data.writeUInt32BE(ppm, 4);
  data[8] = 1;
  return data;
}

const JFIF_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xff, 0xdb, 0x00, 0x03, 0x00, 0xff, 0xd9
]);

test('crc32 matches the standard check value and zlib', () => {
  assert.equal(Bytes.crc32('123456789'), 0xCBF43926);
  assert.equal(Bytes.crc32(new Uint8Array(0)), 0);

  const data = new Uint8Array(4096);
  for (let i = 0; i < data.length; i++) data[i] = (i * 7919) & 0xff;
  assert.equal(Bytes.crc32(data), zlib.crc32(data));
});

test('utf8 and byteString match the app encoder for every script', () => {
  const app = createAppHarness();
  const samples = ['https://qrturbo.app', 'Grüße ä ö ü ß', 'Cześć Ελληνικά 漢字', 'emoji 😀 ok', '', 'a\r\nb'];

  for (const sample of samples) {
    assert.deepEqual(Buffer.from(Bytes.utf8(sample)), Buffer.from(sample, 'utf8'), sample);
    assert.equal(Bytes.byteString(sample), app.context.encodeTextForQRCode(sample), sample);
  }

  const long = 'é'.repeat(20000);
  assert.equal(Bytes.byteString(long).length, 40000);
});

test('utf8 encodes correctly without TextEncoder', () => {
  const saved = globalThis.TextEncoder;
  try {
    delete globalThis.TextEncoder;
    for (const sample of ['abc', 'Grüße', '漢字', 'emoji 😀', 'lone \ud800 surrogate']) {
      assert.deepEqual(Buffer.from(Bytes.utf8(sample)), Buffer.from(sample, 'utf8'), sample);
    }
  } finally {
    globalThis.TextEncoder = saved;
  }
});

test('concat joins byte arrays in order', () => {
  const joined = Bytes.concat([Uint8Array.of(1, 2), new Uint8Array(0), Uint8Array.of(3)]);
  assert.deepEqual([...joined], [1, 2, 3]);
});

test('latin1 encodes Latin-1 text and rejects anything above U+00FF', () => {
  assert.deepEqual([...Bytes.latin1('Aéÿ')], [0x41, 0xe9, 0xff]);
  assert.throws(() => Bytes.latin1('€'), RangeError);
  assert.throws(() => Bytes.latin1('Č'), RangeError);
});

test('deflate produces zlib data and resolves null without CompressionStream', async () => {
  const input = Bytes.utf8('QRTurbo.app '.repeat(200));
  const compressed = await Bytes.deflate(input);
  assert.ok(compressed instanceof Uint8Array);
  assert.ok(compressed.length < input.length);
  assert.deepEqual(zlib.inflateSync(compressed), Buffer.from(input));

  const saved = globalThis.CompressionStream;
  try {
    delete globalThis.CompressionStream;
    assert.equal(await Bytes.deflate(input), null);
  } finally {
    globalThis.CompressionStream = saved;
  }
});

test('dataUrlToBytes decodes base64 and percent-encoded data URLs', () => {
  const png = Bytes.dataUrlToBytes('data:IMAGE/PNG;base64,iVBORw0KGgo=');
  assert.equal(png.mime, 'image/png');
  assert.deepEqual(Buffer.from(png.bytes), PNG_SIGNATURE);

  const svg = Bytes.dataUrlToBytes('data:image/svg+xml;charset=utf-8,%3Csvg%3E%C3%A4ä');
  assert.equal(svg.mime, 'image/svg+xml');
  assert.equal(Buffer.from(svg.bytes).toString('utf8'), '<svg>ää');

  const plain = Bytes.dataUrlToBytes('data:,hi');
  assert.equal(plain.mime, 'text/plain');
  assert.equal(Buffer.from(plain.bytes).toString(), 'hi');

  assert.throws(() => Bytes.dataUrlToBytes('https://example.com/logo.png'), TypeError);
  assert.throws(() => Bytes.dataUrlToBytes('data:image/png;base64,@@@@'), TypeError);
});

test('sniffImage recognizes every supported and rejected type', () => {
  const ascii = text => Buffer.from(text, 'latin1');
  const cases = [
    [makePng(), 'png'],
    [JFIF_JPEG, 'jpeg'],
    [Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08]), 'jpeg'],
    [ascii('RIFF\x24\x00\x00\x00WEBPVP8L'), 'webp'],
    [ascii('GIF89a\x01\x00'), 'gif'],
    [ascii('GIF87a\x01\x00'), 'gif'],
    [ascii('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'svg'],
    [ascii('\xef\xbb\xbf  <?xml version="1.0"?>\n<!-- logo -->\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x">\n<svg>'), 'svg'],
    [ascii('\x00\x00\x00\x18ftypheic\x00\x00\x00\x00'), 'heic'],
    [ascii('\x00\x00\x00\x18ftypmif1\x00\x00\x00\x00'), 'heic'],
    [ascii('II*\x00\x08\x00\x00\x00'), 'tiff'],
    [ascii('MM\x00*\x00\x00\x00\x08'), 'tiff'],
    [ascii('\x00\x00\x00\x1cftypavif\x00\x00\x00\x00'), null],
    [ascii('<html><svg></svg></html>'), null],
    [ascii('hello'), null],
    [new Uint8Array(0), null]
  ];

  for (const [bytes, expected] of cases) {
    assert.equal(Bytes.sniffImage(new Uint8Array(bytes)), expected, `${Buffer.from(bytes).subarray(0, 12).toString('latin1')}`);
  }
});

test('pngWithMeta writes the exact pHYs chunk before IDAT and keeps IHDR first', () => {
  const expected = {
    150: '0000000970485973000017120000171201679fd252',
    300: '000000097048597300002e2300002e230178a53f76',
    600: '000000097048597300005c4600005c460114944341'
  };

  for (const [dpi, hex] of Object.entries(expected)) {
    const output = Bytes.pngWithMeta(makePng({ width: 591, height: 591 }), { dpi: Number(dpi), srgb: true });
    const chunks = readChunks(output);
    assert.deepEqual(chunks.map(chunk => chunk.type), ['IHDR', 'sRGB', 'pHYs', 'IDAT', 'IEND'], `${dpi} dpi`);
    assert.equal(chunks[2].raw.toString('hex'), hex, `${dpi} dpi pHYs`);
    assert.equal(chunks[1].raw.toString('hex'), SRGB_CHUNK);
    assert.equal(Buffer.from(output).readUInt32BE(16), 591);
    assert.equal(Buffer.from(output).readUInt32BE(20), 591);
    assert.equal(Bytes.readPngDpi(output), Number(dpi));
  }
});

test('pngWithMeta replaces an existing pHYs chunk and drops text chunks', () => {
  const source = makePng({
    before: [pngChunk('pHYs', physData(72)), pngChunk('tEXt', Buffer.from('Comment\0secret payload'))],
    after: [pngChunk('iTXt', Buffer.from('x\0\0\0\0\0y'))]
  });
  assert.equal(Bytes.readPngDpi(source), 72);

  const output = Bytes.pngWithMeta(source, { dpi: 300, srgb: true });
  const chunks = readChunks(output);
  assert.deepEqual(chunks.map(chunk => chunk.type), ['IHDR', 'sRGB', 'pHYs', 'IDAT', 'IEND']);
  assert.equal(Bytes.readPngDpi(output), 300);
  assert.equal(Buffer.from(output).includes('secret payload'), false);
});

test('pngWithMeta adds sRGB only when no color profile is present', () => {
  const withIcc = makePng({ before: [pngChunk('iCCP', Buffer.from('icc\0\0x'))] });
  assert.deepEqual(readChunks(Bytes.pngWithMeta(withIcc, { srgb: true, dpi: 150 })).map(chunk => chunk.type),
    ['IHDR', 'iCCP', 'pHYs', 'IDAT', 'IEND']);

  const withSrgb = makePng({ before: [pngChunk('sRGB', Buffer.from([0]))] });
  assert.deepEqual(readChunks(Bytes.pngWithMeta(withSrgb, { srgb: true })).map(chunk => chunk.type),
    ['IHDR', 'sRGB', 'IDAT', 'IEND']);

  const palette = makePng({ before: [pngChunk('PLTE', Buffer.alloc(6))] });
  assert.deepEqual(readChunks(Bytes.pngWithMeta(palette, { srgb: true, dpi: 300 })).map(chunk => chunk.type),
    ['IHDR', 'sRGB', 'PLTE', 'pHYs', 'IDAT', 'IEND']);

  const plain = makePng();
  assert.deepEqual(Buffer.from(Bytes.pngWithMeta(plain, { srgb: false, dpi: null })), plain);
  assert.deepEqual(readChunks(Bytes.pngWithMeta(plain, { srgb: true })).map(chunk => chunk.type),
    ['IHDR', 'sRGB', 'IDAT', 'IEND']);
  assert.equal(Bytes.readPngDpi(plain), null);
});

test('pngWithMeta rejects files that are not PNG', () => {
  assert.throws(() => Bytes.pngWithMeta(JFIF_JPEG, { dpi: 300 }), TypeError);
  assert.equal(Bytes.readPngDpi(JFIF_JPEG), null);
});

test('jpegWithDpi patches the JFIF density at offsets 13 to 17', () => {
  const output = Buffer.from(Bytes.jpegWithDpi(JFIF_JPEG, 300));
  assert.equal(output.length, JFIF_JPEG.length);
  assert.deepEqual([...output.subarray(13, 18)], [1, 0x01, 0x2c, 0x01, 0x2c]);
  assert.deepEqual(output.subarray(18), JFIF_JPEG.subarray(18));
  assert.deepEqual(output.subarray(0, 13), JFIF_JPEG.subarray(0, 13));
  assert.equal(Bytes.readJpegDpi(output), 300);
  assert.equal(Bytes.readJpegDpi(JFIF_JPEG), null);
  assert.equal(JFIF_JPEG[13], 0, 'the input is not modified');
});

test('jpegWithDpi inserts a JFIF segment after SOI when there is none', () => {
  const exifJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x04, 0x45, 0x78, 0xff, 0xd9]);
  const output = Buffer.from(Bytes.jpegWithDpi(exifJpeg, 600));
  assert.equal(
    output.subarray(0, 20).toString('hex'),
    'ffd8ffe000104a46494600010201025802580000'
  );
  assert.deepEqual(output.subarray(20), exifJpeg.subarray(2));
  assert.equal(Bytes.readJpegDpi(output), 600);
  assert.throws(() => Bytes.jpegWithDpi(makePng(), 300), TypeError);
});

test('byte helpers accept buffers from other realms and typed array views', () => {
  const vm = require('node:vm');
  const foreign = vm.runInNewContext('const b = new ArrayBuffer(9); new Uint8Array(b).set([49, 50, 51, 52, 53, 54, 55, 56, 57]); b');
  assert.equal(foreign instanceof ArrayBuffer, false);
  assert.equal(Bytes.crc32(foreign), 0xCBF43926);

  const png = makePng();
  const foreignView = vm.runInNewContext('new Uint8Array(length)', { length: png.length });
  foreignView.set(png);
  assert.equal(Bytes.sniffImage(foreignView), 'png');
  assert.equal(Bytes.sniffImage(new DataView(png.buffer, png.byteOffset, png.length)), 'png');
  assert.equal(Bytes.readPngDpi(Bytes.pngWithMeta(foreignView.buffer, { dpi: 600 })), 600);
  assert.throws(() => Bytes.crc32({ length: 3 }), TypeError);
});

test('PNG and JPEG readers reject damaged files and convert dots per centimetre', () => {
  const png = makePng();
  const truncated = png.subarray(0, png.length - 20);
  assert.throws(() => Bytes.pngWithMeta(truncated, { dpi: 300 }), TypeError);
  assert.equal(Bytes.readPngDpi(truncated), null);

  const noIdat = Buffer.concat([PNG_SIGNATURE, pngChunk('IHDR', Buffer.alloc(13)), pngChunk('IEND')]);
  assert.throws(() => Bytes.pngWithMeta(noIdat, {}), /no image data/);

  // Data after IEND is dropped.
  const trailing = Buffer.concat([png, Buffer.from('trailing secret')]);
  const cleaned = Buffer.from(Bytes.pngWithMeta(trailing, { srgb: true }));
  assert.equal(cleaned.includes('trailing secret'), false);
  assert.deepEqual(readChunks(cleaned).map(chunk => chunk.type), ['IHDR', 'sRGB', 'IDAT', 'IEND']);

  const perCm = Buffer.from(JFIF_JPEG);
  perCm[13] = 2;
  perCm.writeUInt16BE(118, 14);
  perCm.writeUInt16BE(118, 16);
  assert.equal(Bytes.readJpegDpi(perCm), 300);
  assert.equal(Bytes.readJpegDpi(Buffer.from('not a jpeg')), null);
  assert.equal(Bytes.readJpegDpi(Bytes.jpegWithDpi(JFIF_JPEG, 0)), 72, 'an invalid density falls back to 72 dpi');
});
