const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');

const Export = require('../../Public/js/exporter.js');
const Bytes = require('../../Public/js/lib/bytes.js');
const Svg = require('../../Public/js/lib/svg.js');

const LIBRARY_SVG = fs.readFileSync(path.join(__dirname, '../fixtures/library-svg/dots-square.svg'), 'utf8');
const JFIF_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xff, 0xdb, 0x00, 0x03, 0x00, 0xff, 0xd9
]);

function options(patch = {}) {
  return {
    v: 1,
    format: 'png',
    pixelSize: 1024,
    customPixels: 1024,
    page: 'fit',
    colorMode: 'rgb',
    ...patch,
    print: { enabled: false, unit: 'mm', width: 50, dpi: 300, ...(patch.print || {}) }
  };
}

function snapshot(patch = {}) {
  return {
    revision: 1,
    tab: 'URLText',
    payload: 'https://example.com/private?token=secret',
    bytes: 'https://example.com/private?token=secret',
    filenameHint: 'example.com',
    design: { transparentBackground: false, bgColor: '#ffffff' },
    ecl: 'M',
    version: 4,
    moduleCount: 33,
    quietZone: 4,
    qrSvgMarkup: LIBRARY_SVG,
    frame: null,
    ...patch
  };
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([length, body, crc]);
}

// A PNG whose IHDR claims the canvas size; the image data stays tiny.
function fakePng(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(Buffer.alloc(8))),
    pngChunk('IEND')
  ]);
}

function chunkTypes(png) {
  const types = [];
  for (let offset = 8; offset < png.length; offset += 12 + png.readUInt32BE(offset)) {
    types.push(png.toString('latin1', offset + 4, offset + 8));
  }
  return types;
}

// QRTurboEngine stand-in: records each rasterCanvas call and returns a
// canvas whose toBlob behaves like Safari (no WebP: PNG instead).
function fakeEngine() {
  const calls = [];
  const canvases = [];
  return {
    calls,
    canvases,
    rasterCanvas(design, bytes, o) {
      calls.push({ design, bytes, o });
      const ops = [];
      const context = {
        globalCompositeOperation: 'source-over',
        fillStyle: '#000000',
        save() {},
        restore() {},
        fillRect(x, y, width, height) {
          ops.push({ op: this.globalCompositeOperation, fill: this.fillStyle, width, height });
        }
      };
      const canvas = {
        width: o.size,
        height: o.size,
        ops,
        getContext: () => context,
        toBlob(callback, type) {
          const jpeg = type === 'image/jpeg';
          const body = jpeg ? JFIF_JPEG : fakePng(canvas.width);
          setTimeout(() => callback(new Blob([body], { type: jpeg ? 'image/jpeg' : 'image/png' })));
        }
      };
      canvases.push(canvas);
      return Promise.resolve(canvas);
    }
  };
}

async function blobBuffer(blob) {
  return Buffer.from(await blob.arrayBuffer());
}

// Defines the globals for the duration of fn (sync or async) and restores
// the previous ones, including Node's own accessors such as navigator.
function withGlobals(globals, fn) {
  const saved = Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true, enumerable: false });
  }
  const restore = () => {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  };
  let result;
  try {
    result = fn();
  } catch (error) {
    restore();
    throw error;
  }
  if (result && typeof result.then === 'function') return result.finally(restore);
  restore();
  return result;
}

test('resolveSize uses the pixel size, the print size or vector output per format', () => {
  assert.deepEqual(Export.resolveSize(options()), { kind: 'pixels', px: 1024, capped: false });
  assert.deepEqual(Export.resolveSize(options({ pixelSize: 4096 })), { kind: 'pixels', px: 4096, capped: false });
  assert.deepEqual(Export.resolveSize(options({ pixelSize: 'custom', customPixels: 64 })), { kind: 'pixels', px: 128, capped: false });
  assert.deepEqual(Export.resolveSize(options({ pixelSize: 'custom', customPixels: 5000 })), { kind: 'pixels', px: 4096, capped: true });

  const print = Export.resolveSize(options({ print: { enabled: true } }));
  assert.equal(print.kind, 'print');
  assert.equal(print.px, 591);
  assert.equal(print.widthMm, 50);
  assert.equal(print.dpi, 300);
  assert.equal(print.capped, false);

  const poster = Export.resolveSize(options({ print: { enabled: true, width: 400, dpi: 600 } }));
  assert.equal(poster.px, 4096);
  assert.equal(poster.capped, true);

  const inches = Export.resolveSize(options({ format: 'jpg', print: { enabled: true, unit: 'in', width: 2, dpi: 150 } }));
  assert.equal(inches.widthMm, 50.8);
  assert.equal(inches.px, 300);

  assert.deepEqual(Export.resolveSize(options({ format: 'webp', print: { enabled: true } })), { kind: 'pixels', px: 1024, capped: false });
  assert.deepEqual(Export.resolveSize(options({ format: 'svg' })), { kind: 'vector', px: 1024, capped: false });
  assert.equal(Export.resolveSize(options({ format: 'svg', print: { enabled: true } })).kind, 'vector-print');

  for (const format of ['pdf', 'eps']) {
    const size = Export.resolveSize(options({ format, print: { enabled: false, width: 80 } }));
    assert.equal(size.kind, 'vector-print', format);
    assert.equal(size.widthMm, 80, format);
  }
});

test('invalid export options fall back to safe values', () => {
  const normalized = Export.normalizeOptions({ format: 'gif', pixelSize: 3000, print: { width: -5, unit: 'cm', dpi: 72 }, page: 'a3', colorMode: 'lab' });
  assert.deepEqual(normalized, {
    v: 1,
    format: 'png',
    pixelSize: 1024,
    customPixels: 1024,
    print: { enabled: false, unit: 'mm', width: 50, dpi: 300 },
    page: 'fit',
    colorMode: 'rgb'
  });

  assert.equal(Export.normalizeOptions({ pixelSize: '2048' }).pixelSize, 2048);
  assert.equal(Export.normalizeOptions({ print: { unit: 'mm', width: 5000 } }).print.width, 2000);
  assert.equal(Export.normalizeOptions({ print: { unit: 'in', width: 0.1 } }).print.width, 0.4);
  assert.deepEqual(Export.resolveSize(null), { kind: 'pixels', px: 1024, capped: false });
});

test('file names follow qrcode-<type>-<slug>-<variant>.<ext> without the payload', () => {
  const shot = snapshot();
  assert.equal(Export.buildFilename(shot, options()), 'qrcode-url-example-com-1024px.png');
  assert.equal(Export.buildFilename(shot, options({ format: 'jpg', print: { enabled: true } })), 'qrcode-url-example-com-50mm-300dpi.jpg');
  assert.equal(Export.buildFilename(shot, options({ format: 'svg' })), 'qrcode-url-example-com-vector.svg');
  assert.equal(Export.buildFilename(shot, options({ format: 'svg', print: { enabled: true, unit: 'in', width: 2.5 } })), 'qrcode-url-example-com-2.5in.svg');
  assert.equal(Export.buildFilename(shot, options({ format: 'pdf' })), 'qrcode-url-example-com-50mm.pdf');
  assert.equal(Export.buildFilename(shot, options({ format: 'eps', print: { width: 120 } })), 'qrcode-url-example-com-120mm.eps');
  assert.equal(Export.buildFilename(shot, options({ format: 'webp', pixelSize: 512 })), 'qrcode-url-example-com-512px.webp');

  for (const format of ['png', 'jpg', 'webp', 'svg', 'pdf', 'eps']) {
    assert.doesNotMatch(Export.buildFilename(shot, options({ format })), /secret|token|private/);
  }

  assert.equal(Export.buildFilename(snapshot({ payload: 'Hello there', filenameHint: 'Hello there' }), options()), 'qrcode-text-hello-there-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'Wifi', payload: 'WIFI:S:x;T:WPA;P:pw;;', filenameHint: 'Café Ålborg 5G' }), options()), 'qrcode-wifi-cafe-alborg-5g-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'Wifi', payload: 'WIFI:', filenameHint: '' }), options()), 'qrcode-wifi-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'SMSPhone', payload: 'tel:+358401234567', filenameHint: '+358401234567' }), options()), 'qrcode-phone-358401234567-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'SMSPhone', payload: 'SMSTO:+358401234567', filenameHint: '+358401234567' }), options()), 'qrcode-sms-358401234567-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'Payment', payload: 'BCD', filenameHint: 'payment Matti Meikäläinen' }), options()), 'qrcode-payment-matti-meikalainen-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'CalendarEvent', filenameHint: '漢字' }), options()), 'qrcode-event-1024px.png');

  const long = Export.buildFilename(snapshot({ filenameHint: 'a'.repeat(30) + ' ' + 'b'.repeat(30) }), options());
  assert.equal(long, `qrcode-url-${'a'.repeat(30)}-${'b'.repeat(9)}-1024px.png`);
  assert.match(long, /^[a-z0-9.-]+$/);
});

test('only the "payment " prefix of a Payment hint is dropped from the slug', () => {
  const name = hint => Export.buildFilename(snapshot({ filenameHint: hint }), options());
  // A hint that starts with a type word keeps it for every other type.
  assert.equal(name('url-shortener.com'), 'qrcode-url-url-shortener-com-1024px.png');
  assert.equal(name('url'), 'qrcode-url-url-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'Wifi', filenameHint: 'wifi guests' }), options()), 'qrcode-wifi-wifi-guests-1024px.png');
  assert.equal(Export.buildFilename(snapshot({ tab: 'CalendarEvent', filenameHint: 'Event night' }), options()), 'qrcode-event-event-night-1024px.png');

  const payment = hint => Export.buildFilename(snapshot({ tab: 'Payment', payload: 'BCD', filenameHint: hint }), options());
  assert.equal(payment('payment Payment Services Oy'), 'qrcode-payment-payment-services-oy-1024px.png');
  assert.equal(payment('payment '), 'qrcode-payment-1024px.png');
  assert.equal(payment('payment'), 'qrcode-payment-1024px.png');
  assert.equal(payment('Paymentti Oy'), 'qrcode-payment-paymentti-oy-1024px.png');
});

test('a PDF page that is too small names and describes the scaled size', () => {
  const t = (key, vars) => (vars ? `${key}${JSON.stringify(vars)}` : key);
  const calls = [];
  const QRTurboRules = {
    physical(exportOptions, qrFraction, moduleCount) {
      calls.push(exportOptions.print);
      const widthMm = exportOptions.print.unit === 'in' ? exportOptions.print.width * 25.4 : exportOptions.print.width;
      const moduleMm = widthMm / (moduleCount + 8);
      return { widthMm, codeMm: moduleMm * moduleCount, moduleMm, scanDistanceMm: moduleMm * moduleCount * 10 };
    },
    pixels: () => null
  };
  const QRTurboUI = {
    formatLength: mm => `${mm.toFixed(3)} mm`,
    formatDistance: mm => `${mm.toFixed(1)} mm away`
  };
  // A4: 595.276 pt wide, 28.35 pt margins: 538.576 pt is 190.0 mm.
  const a4Mm = (595.276 - (2 * 28.35)) * 25.4 / 72;
  // Letter: 612 pt wide: 555.3 pt is 7.7125 in.
  const letterIn = (612 - (2 * 28.35)) / 72;

  withGlobals({ QRTurboRules, QRTurboUI, t }, () => {
    const a4 = Export.describe(options({ format: 'pdf', page: 'a4', print: { width: 300 } }), snapshot());
    assert.deepEqual(a4.notes, ['output.pageTooSmall']);
    assert.match(a4.summary, /^output\.summaryVectorPrint\{"size":"190.*mm"\}$/);
    assert.ok(Math.abs(calls[0].width - a4Mm) < 1e-9, 'the rules get the scaled width');
    assert.equal(calls[0].unit, 'mm');
    assert.equal(calls[0].enabled, true);
    const moduleMm = a4Mm / 41;
    assert.equal(a4.printInfo, `output.moduleSize{"size":"${moduleMm.toFixed(3)} mm"} output.scanDistance{"distance":"${(moduleMm * 33 * 10).toFixed(1)} mm away"}`);

    const letter = Export.describe(options({ format: 'pdf', page: 'letter', print: { unit: 'in', width: 20 } }), snapshot());
    assert.match(letter.summary, /^output\.summaryVectorPrint\{"size":"7\.71.*in"\}$/);
    assert.ok(Math.abs(calls[1].width - letterIn) < 1e-9);
    assert.equal(calls[1].unit, 'in');

    // A page that is large enough, Fit and EPS keep the entered width.
    Export.describe(options({ format: 'pdf', page: 'a4', print: { width: 150 } }), snapshot());
    Export.describe(options({ format: 'pdf', page: 'fit', print: { width: 300 } }), snapshot());
    Export.describe(options({ format: 'eps', page: 'a4', print: { width: 300 } }), snapshot());
    assert.deepEqual(calls.slice(2).map(print => print.width), [150, 300, 300]);
  });

  assert.equal(Export.buildFilename(snapshot(), options({ format: 'pdf', page: 'a4', print: { width: 300 } })), 'qrcode-url-example-com-190mm.pdf');
  assert.equal(Export.buildFilename(snapshot(), options({ format: 'pdf', page: 'letter', print: { width: 300 } })), 'qrcode-url-example-com-195.9mm.pdf');
  assert.equal(Export.buildFilename(snapshot(), options({ format: 'pdf', page: 'letter', print: { unit: 'in', width: 20 } })), 'qrcode-url-example-com-7.71in.pdf');
  assert.equal(Export.buildFilename(snapshot(), options({ format: 'pdf', page: 'a4', print: { width: 150 } })), 'qrcode-url-example-com-150mm.pdf');
  assert.equal(Export.buildFilename(snapshot(), options({ format: 'pdf', page: 'fit', print: { width: 300 } })), 'qrcode-url-example-com-300mm.pdf');
  assert.equal(Export.buildFilename(snapshot(), options({ format: 'eps', page: 'a4', print: { width: 300 } })), 'qrcode-url-example-com-300mm.eps');
});

test('describe gives the label, summary and notes for each format', () => {
  const t = (key, vars) => (vars ? `${key}${JSON.stringify(vars)}` : key);

  withGlobals({ t }, () => {
    const png = Export.describe(options(), null);
    assert.equal(png.label, 'actions.downloadFormat{"format":"options.formatPng"}');
    assert.equal(png.summary, 'output.summaryPixels{"width":"1024","height":"1024"}');
    assert.deepEqual(png.notes, []);
    assert.equal(png.printInfo, null);

    const print = Export.describe(options({ print: { enabled: true } }), null);
    assert.match(print.summary, /^output\.summaryPrint\{"size":"50.*mm","dpi":"300"\}$/);

    assert.equal(Export.describe(options({ format: 'svg' }), null).summary, 'output.summaryVector');
    assert.match(Export.describe(options({ format: 'pdf' }), null).summary, /^output\.summaryVectorPrint\{"size":"50.*mm"\}$/);

    const capped = Export.describe(options({ print: { enabled: true, width: 400, dpi: 600 } }), null);
    assert.deepEqual(capped.notes, ['output.sizeCapped']);

    const jpg = Export.describe(options({ format: 'jpg' }), snapshot({ design: { transparentBackground: true } }));
    assert.deepEqual(jpg.notes, ['output.transparentJpg']);
    assert.equal(jpg.label, 'actions.downloadFormat{"format":"options.formatJpg"}');

    assert.deepEqual(Export.describe(options({ format: 'pdf', page: 'a4', print: { width: 200 } }), null).notes, ['output.pageTooSmall']);
    assert.deepEqual(Export.describe(options({ format: 'pdf', page: 'a4', print: { width: 150 } }), null).notes, []);
    assert.deepEqual(Export.describe(options({ format: 'pdf', page: 'fit', print: { width: 500 } }), null).notes, []);
    assert.deepEqual(Export.describe(options({ format: 'eps' }), null).notes, ['output.epsOffice']);
  });
});

test('describe asks the rules for the physical size with print sizing per format', () => {
  const calls = [];
  const QRTurboRules = {
    physical(exportOptions, qrFraction, moduleCount, quietZone) {
      calls.push({ enabled: exportOptions.print.enabled, format: exportOptions.format, qrFraction, moduleCount, quietZone });
      if (!exportOptions.print.enabled) return null;
      return { widthMm: 50, codeMm: 50, moduleMm: 50 / 41, scanDistanceMm: 500 };
    },
    pixels() {
      return { px: 1024, pxPerModule: 24.97, capped: false };
    }
  };
  const QRTurboUI = {
    formatLength: (mm, system) => `${mm.toFixed(2)} ${system}`,
    formatDistance: (mm, system) => `${mm} ${system} away`
  };
  const t = (key, vars) => (vars ? `${key}:${Object.values(vars).join(',')}` : key);

  withGlobals({ QRTurboRules, QRTurboUI, t }, () => {
    const pdf = Export.describe(options({ format: 'pdf' }), snapshot());
    assert.equal(pdf.printInfo, 'output.moduleSize:1.22 metric output.scanDistance:500 metric away');
    assert.deepEqual(pdf.pixels, { px: 1024, pxPerModule: 24.97, capped: false });

    const inch = Export.describe(options({ format: 'eps', print: { unit: 'in', width: 2 } }), snapshot());
    assert.match(inch.printInfo, /imperial/);

    const png = Export.describe(options({ format: 'png' }), snapshot());
    assert.equal(png.printInfo, null);

    const webp = Export.describe(options({ format: 'webp', print: { enabled: true } }), snapshot());
    assert.equal(webp.printInfo, null);

    const layout = { style: 'banner-bottom', framed: true, width: 1024, qr: { x: 0, y: 0, size: 758 } };
    Export.describe(options({ format: 'pdf' }), snapshot({ frame: { layout, text: 'SCAN ME', fontSize: 75, colors: {} } }));
  });

  assert.deepEqual(calls.map(call => `${call.format}:${call.enabled}`), ['pdf:true', 'eps:true', 'png:false', 'webp:false', 'pdf:true']);
  assert.equal(calls[0].moduleCount, 33);
  assert.equal(calls[0].quietZone, 4);
  assert.equal(calls[0].qrFraction, 1);
  assert.equal(calls[4].qrFraction, 758 / 1024);
});

test('exportFile rejects without a snapshot and when the signal is already aborted', async () => {
  await assert.rejects(Export.exportFile(null, options()), /no QR code/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(Export.exportFile(snapshot(), options(), { signal: controller.signal }), { name: 'AbortError' });
});

test('share and copy report missing browser support without throwing synchronously', async () => {
  assert.equal(await Export.share(), 'unsupported');
  assert.doesNotThrow(() => Export.prepareShare(snapshot(), options()));
  await assert.rejects(Export.copy(null, options()));
  assert.equal(Export.FORMATS.jpg.mime, 'image/jpeg');
  assert.equal(Export.FORMATS.eps.kind, 'vector');
});

test('PNG exports carry sRGB, the print density and the exact size, and release the canvas', async () => {
  const engine = fakeEngine();
  await withGlobals({ QRTurboEngine: engine, QRTurboBytes: Bytes }, async () => {
    const pixel = await Export.exportFile(snapshot(), options());
    const pixelPng = await blobBuffer(pixel.blob);
    assert.deepEqual(engine.calls[0].o, { size: 1024, quietZone: 4, typeNumber: 4, ecl: 'M', frame: null });
    assert.equal(engine.calls[0].bytes, snapshot().bytes);
    assert.deepEqual(chunkTypes(pixelPng), ['IHDR', 'sRGB', 'IDAT', 'IEND']);
    assert.equal(pixelPng.readUInt32BE(16), 1024);
    assert.equal(Bytes.readPngDpi(pixelPng), null);
    assert.equal(pixel.mime, 'image/png');
    assert.equal(pixel.blob.type, 'image/png');
    assert.equal(pixel.filename, 'qrcode-url-example-com-1024px.png');
    assert.deepEqual(pixel.notes, []);
    assert.equal(engine.canvases[0].width, 0, 'the canvas is released');

    const print = await Export.exportFile(snapshot(), options({ print: { enabled: true } }));
    const printPng = await blobBuffer(print.blob);
    assert.equal(engine.calls[1].o.size, 591);
    assert.deepEqual(chunkTypes(printPng), ['IHDR', 'sRGB', 'pHYs', 'IDAT', 'IEND']);
    assert.equal(Bytes.readPngDpi(printPng), 300);
    assert.equal(print.filename, 'qrcode-url-example-com-50mm-300dpi.png');

    // Capped at 4096 px: the density follows, so the print keeps 400 mm.
    const poster = await Export.exportFile(snapshot(), options({ print: { enabled: true, width: 400, dpi: 600 } }));
    assert.equal(engine.calls[2].o.size, 4096);
    assert.equal(Bytes.readPngDpi(await blobBuffer(poster.blob)), 260);
    assert.deepEqual(poster.notes, ['output.sizeCapped']);

    // A version 40 code at 10 mm and 150 dpi gets one pixel per module.
    const tiny = await Export.exportFile(snapshot({ version: 40, moduleCount: 177 }), options({ print: { enabled: true, width: 10, dpi: 150 } }));
    assert.equal(engine.calls[3].o.size, 185);
    assert.equal(Bytes.readPngDpi(await blobBuffer(tiny.blob)), 470);
  });
});

test('JPG exports are opaque: transparent designs and frame corners become white', async () => {
  const engine = fakeEngine();
  await withGlobals({ QRTurboEngine: engine, QRTurboBytes: Bytes }, async () => {
    const transparent = await Export.exportFile(
      snapshot({ design: { transparentBackground: true, bgColor: '#123456' } }),
      options({ format: 'jpg', print: { enabled: true } })
    );
    assert.equal(engine.calls[0].design.transparentBackground, false);
    assert.equal(engine.calls[0].design.bgColor, '#ffffff');
    assert.deepEqual(transparent.notes, ['output.transparentJpg']);
    assert.equal(transparent.mime, 'image/jpeg');
    assert.equal(Bytes.readJpegDpi(await blobBuffer(transparent.blob)), 300);
    assert.deepEqual(engine.canvases[0].ops, [{ op: 'destination-over', fill: '#ffffff', width: 591, height: 591 }]);

    const tinted = await Export.exportFile(snapshot({ design: { transparentBackground: false, bgColor: '#fef3c7' } }), options({ format: 'jpg' }));
    assert.equal(engine.calls[1].design.bgColor, '#fef3c7');
    assert.equal(engine.canvases[1].ops[0].fill, '#ffffff');
    assert.deepEqual(tinted.notes, []);
    assert.equal(Bytes.readJpegDpi(await blobBuffer(tinted.blob)), null, 'pixel mode keeps the encoder density');
  });
});

test('WebP export fails when the browser encodes another format', async () => {
  await withGlobals({ QRTurboEngine: fakeEngine(), QRTurboBytes: Bytes }, async () => {
    await assert.rejects(Export.exportFile(snapshot(), options({ format: 'webp' })), /WebP/);
  });
});

test('SVG export is the hardened library SVG at the pixel or print size', async () => {
  await withGlobals({ QRTurboSvg: Svg }, async () => {
    const pixel = await Export.exportFile(snapshot(), options({ format: 'svg', pixelSize: 512 }));
    const pixelSvg = await pixel.blob.text();
    assert.equal(pixel.blob.type, 'image/svg+xml');
    assert.match(pixelSvg, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<svg /);
    assert.match(pixelSvg, /<svg [^>]*width="512"[^>]*>/);
    assert.match(pixelSvg, /<svg [^>]*viewBox="0 0 210 210"/);
    assert.doesNotMatch(pixelSvg, /secret/);

    const print = await (await Export.exportFile(snapshot(), options({ format: 'svg', print: { enabled: true, unit: 'in', width: 2 } }))).blob.text();
    assert.match(print, /<svg [^>]*width="2in"[^>]*height="2in"/);
  });
});

// Every id of an exported SVG and every local url(#...) and href="#..."
// reference in it.
function svgIds(markup) {
  return {
    ids: [...markup.matchAll(/ id="([^"]+)"/g)].map(match => match[1]),
    refs: [...markup.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)].map(match => match[1] || match[2])
  };
}

test('every exported SVG document gets its own id prefix, and the same export the same one', async () => {
  const frame = require('../../Public/js/frame.js');
  const other = fs.readFileSync(path.join(__dirname, '../fixtures/library-svg/grad-dots-radial.svg'), 'utf8');
  const layout = frame.getFrameLayout(1024, 'banner-bottom');
  const framed = snapshot({ frame: { layout, text: 'SCAN ME', fontSize: 60, colors: { frame: '#000000', text: '#ffffff', card: '#ffffff' } } });

  await withGlobals({ QRTurboSvg: Svg, buildFramedSvg: frame.buildFramedSvg }, async () => {
    const svgOf = async (shot, patch) => (await Export.exportFile(shot, options({ format: 'svg', ...patch }))).blob.text();
    const first = await svgOf(snapshot(), { pixelSize: 512 });
    const second = await svgOf(snapshot({ qrSvgMarkup: other }), { pixelSize: 512 });
    const larger = await svgOf(snapshot(), { pixelSize: 1024 });
    const boxed = await svgOf(framed, { print: { enabled: true, width: 40 } });

    const prefixes = [first, second, larger, boxed].map(markup => {
      const { ids, refs } = svgIds(markup);
      assert.ok(ids.length > 0);
      const prefix = /^qrt-[0-9a-z]{7}-/.exec(ids[0])[0];
      for (const id of ids) assert.ok(id.startsWith(prefix), id);
      for (const ref of refs) assert.ok(ids.includes(ref), `${ref} resolves`);
      return prefix;
    });
    assert.equal(new Set(prefixes).size, 4, 'no two documents share a prefix');
    assert.ok(svgIds(first).ids.includes(`${prefixes[0]}clip-path-dot-color`));
    assert.ok(svgIds(boxed).ids.includes(`${prefixes[3]}qrturbo-frame-clip`));

    assert.equal(await svgOf(snapshot(), { pixelSize: 512 }), first, 'exports stay reproducible');
  });
});

test('copy writes SVG code for SVG and when the browser cannot copy PNG images', async () => {
  const written = [];
  class ClipboardItem {
    static supports(type) {
      return type !== 'image/png';
    }
  }
  const navigator = { clipboard: { writeText: async text => { written.push(text); }, write: async () => assert.fail('no image write') } };

  await withGlobals({ navigator, ClipboardItem, QRTurboSvg: Svg }, async () => {
    assert.equal(await Export.copy(snapshot(), options({ format: 'png' })), 'svg');
    assert.equal(await Export.copy(snapshot(), options({ format: 'svg', print: { enabled: true } })), 'svg');
  });
  assert.match(written[0], /<svg [^>]*width="1024"/);
  assert.match(written[1], /<svg [^>]*width="50mm"/);

  await withGlobals({ navigator: { clipboard: {} }, ClipboardItem: undefined }, async () => {
    await assert.rejects(Export.copy(snapshot(), options()), /clipboard/);
  });

  // A clipboard that throws synchronously still gives a rejected Promise.
  const throwing = { clipboard: { writeText: () => { throw new Error('denied'); } } };
  await withGlobals({ navigator: throwing, ClipboardItem: undefined, QRTurboSvg: Svg }, async () => {
    let result;
    assert.doesNotThrow(() => { result = Export.copy(snapshot(), options({ format: 'svg' })); });
    await assert.rejects(result, /denied/);
  });
});

test('copy starts the image clipboard write inside the click, with the PNG as a Promise', async () => {
  const engine = fakeEngine();
  const items = [];
  const writes = [];
  class ClipboardItem {
    constructor(data) {
      this.data = data;
      items.push(this);
    }
  }
  const navigator = {
    clipboard: {
      writeText: async () => assert.fail('no text write'),
      write: list => {
        writes.push(list);
        return list[0].data['image/png'].then(() => undefined);
      }
    }
  };

  await withGlobals({ navigator, ClipboardItem, QRTurboEngine: engine, QRTurboBytes: Bytes }, async () => {
    const pending = Export.copy(snapshot(), options({ pixelSize: 4096 }));
    assert.equal(writes.length, 1, 'clipboard.write runs synchronously');
    assert.ok(items[0].data['image/png'] instanceof Promise);
    assert.equal(await pending, 'image');
    const blob = await items[0].data['image/png'];
    assert.equal(blob.type, 'image/png');
    assert.equal(engine.calls[0].o.size, 2048, 'raster copies are capped at 2048 px');

    await Export.copy(snapshot(), options({ format: 'pdf' }));
    assert.equal(engine.calls[1].o.size, 1024, 'vector formats copy a 1024 px PNG');
  });
});

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test('copy takes a Promise of the snapshot and still writes the image inside the click', async () => {
  const engine = fakeEngine();
  const items = [];
  const writes = [];
  class ClipboardItem {
    constructor(data) {
      this.data = data;
      items.push(this);
    }
  }
  const navigator = {
    clipboard: {
      writeText: async () => assert.fail('no text write'),
      write: list => {
        writes.push(list);
        return list[0].data['image/png'].then(() => undefined);
      }
    }
  };

  await withGlobals({ navigator, ClipboardItem, QRTurboEngine: engine, QRTurboBytes: Bytes }, async () => {
    const ready = deferred();
    const result = Export.copy(ready.promise, options({ pixelSize: 512 }));
    assert.equal(writes.length, 1, 'clipboard.write runs before the snapshot exists');
    assert.ok(items[0].data['image/png'] instanceof Promise);
    assert.equal(engine.calls.length, 0, 'nothing renders before the snapshot exists');

    ready.resolve(snapshot());
    assert.equal(await result, 'image');
    assert.equal((await items[0].data['image/png']).type, 'image/png');
    assert.equal(engine.calls[0].o.size, 512);

    // A preview that ends without a code rejects with the snapshot error.
    const empty = deferred();
    const failed = Export.copy(empty.promise, options());
    assert.equal(writes.length, 2);
    empty.resolve(null);
    await assert.rejects(failed, /no QR code/);
    assert.equal(engine.calls.length, 1);
  });
});

test('copy of pending SVG code uses a text/plain ClipboardItem, or writes the text once it exists', async () => {
  const items = [];
  const written = [];
  class ClipboardItem {
    constructor(data) {
      this.data = data;
      items.push(this);
    }

    static supports(type) {
      return type === 'text/plain';
    }
  }
  const itemClipboard = {
    writeText: async () => assert.fail('the ClipboardItem write is enough'),
    write: list => list[0].data['text/plain'].then(async blob => { written.push(await blob.text()); })
  };

  await withGlobals({ navigator: { clipboard: itemClipboard }, ClipboardItem, QRTurboSvg: Svg }, async () => {
    const ready = deferred();
    const result = Export.copy(ready.promise, options({ format: 'svg' }));
    assert.equal(items.length, 1, 'the write starts inside the click');
    ready.resolve(snapshot());
    assert.equal(await result, 'svg');
    assert.match(written[0], /^<\?xml[^>]*\?>\n<svg [^>]*width="1024"/);

    // A ready snapshot still goes through writeText at once.
    const direct = [];
    itemClipboard.writeText = async text => { direct.push(text); };
    assert.equal(await Export.copy(snapshot(), options({ format: 'svg' })), 'svg');
    assert.equal(items.length, 1);
    assert.equal(direct.length, 1);
  });

  // Without ClipboardItem the text is written after the snapshot arrives.
  const later = [];
  const textOnly = { clipboard: { writeText: async text => { later.push(text); } } };
  await withGlobals({ navigator: textOnly, ClipboardItem: undefined, QRTurboSvg: Svg }, async () => {
    const ready = deferred();
    const result = Export.copy(ready.promise, options({ format: 'png' }));
    assert.equal(later.length, 0);
    ready.resolve(snapshot());
    assert.equal(await result, 'svg');
    assert.equal(later.length, 1);

    const empty = deferred();
    const failed = Export.copy(empty.promise, options({ format: 'svg' }));
    empty.resolve(null);
    await assert.rejects(failed, /no QR code/);
    assert.equal(later.length, 1);
  });

  // A ClipboardItem write that fails falls back to writeText.
  const fallback = [];
  const failing = {
    clipboard: {
      write: async () => { throw new Error('promises not supported'); },
      writeText: async text => { fallback.push(text); }
    }
  };
  await withGlobals({ navigator: failing, ClipboardItem, QRTurboSvg: Svg }, async () => {
    assert.equal(await Export.copy(Promise.resolve(snapshot()), options({ format: 'svg' })), 'svg');
    assert.equal(fallback.length, 1);
  });
});

test('share sends only the prepared file and reports a cancelled share', async () => {
  const engine = fakeEngine();
  const shared = [];
  let failWith = null;
  const navigator = {
    canShare: data => Boolean(data && data.files && data.files.every(file => file.type !== 'image/svg+xml')),
    share: async data => {
      if (failWith) throw failWith;
      shared.push(data);
    }
  };

  await withGlobals({ navigator, QRTurboEngine: engine, QRTurboBytes: Bytes, QRTurboSvg: Svg }, async () => {
    const shot = snapshot();
    // SVG cannot be shared here, so the prepared file is a 1024 px PNG.
    Export.prepareShare(shot, options({ format: 'svg' }));
    assert.equal(await Export.share(shot, options({ format: 'svg' })), 'shared');
    assert.deepEqual(Object.keys(shared[0]), ['files']);
    assert.equal(shared[0].files.length, 1);
    assert.equal(shared[0].files[0].type, 'image/png');
    assert.equal(shared[0].files[0].name, 'qrcode-url-example-com-1024px.png');
    assert.equal(engine.calls.length, 1, 'the file is generated once');

    failWith = new DOMException('Share cancelled', 'AbortError');
    assert.equal(await Export.share(shot, options({ format: 'svg' })), 'cancelled');
    failWith = new DOMException('Not allowed', 'NotAllowedError');
    await assert.rejects(Export.share(shot, options({ format: 'svg' })), { name: 'NotAllowedError' });
    assert.equal(engine.calls.length, 1);

    // New options give a new file in the chosen format.
    failWith = null;
    assert.equal(await Export.share(shot, options({ format: 'jpg' })), 'shared');
    assert.equal(shared[1].files[0].type, 'image/jpeg');
    assert.equal(shared[1].files[0].name, 'qrcode-url-example-com-1024px.jpg');
  });
});

test('describe warms the lazy vector modules once per vector format', async () => {
  const loaded = [];
  let fail = true;
  const QRTurboUI = {
    loadScript(path) {
      loaded.push(path);
      return fail && path.endsWith('eps.js') ? Promise.reject(new Error('offline')) : Promise.resolve();
    }
  };
  const idle = [];
  const requestIdleCallback = callback => idle.push(callback);
  const flush = async () => {
    while (idle.length) idle.shift()();
    await new Promise(resolve => setTimeout(resolve));
  };

  await withGlobals({ QRTurboUI, requestIdleCallback, document: {} }, async () => {
    Export.describe(options({ format: 'png' }), null);
    Export.describe(options({ format: 'svg' }), null);
    await flush();
    assert.deepEqual(loaded, []);

    Export.describe(options({ format: 'pdf' }), null);
    Export.describe(options({ format: 'pdf', page: 'a4' }), null);
    await flush();
    assert.deepEqual(loaded, ['/js/lib/geometry.js', '/js/lib/helvetica.js', '/js/lib/pdf.js']);

    // A failed prefetch is tried again on the next describe.
    Export.prefetch('eps');
    await flush();
    fail = false;
    Export.prefetch('eps');
    await flush();
    Export.prefetch('eps');
    await flush();
    assert.equal(loaded.filter(path => path === '/js/lib/eps.js').length, 2);
  });
});

test('prepareText turns labels Helvetica-Bold cannot encode into stencil masks', async () => {
  const frame = require('../../Public/js/frame.js');
  const canvases = [];
  // Canvas stand-in: alpha 128 in the first 9 columns, 127 elsewhere, so
  // the 128 threshold and the MSB-first packing are visible in the bits.
  const document = {
    createElement() {
      const canvas = { width: 0, height: 0, drawn: null };
      canvas.getContext = () => ({
        font: '',
        measureText: () => ({ width: 5 }),
        fillText(text, x, y) {
          canvas.drawn = { text, x, y, font: this.font, align: this.textAlign, fill: this.fillStyle };
        },
        getImageData(x, y, width, height) {
          const data = new Uint8ClampedArray(width * height * 4);
          for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) data[(((row * width) + col) * 4) + 3] = col < 9 ? 128 : 127;
          }
          return { data };
        }
      });
      canvases.push(canvas);
      return canvas;
    }
  };
  const QRTurboHelvetica = { canEncode: text => /^[\x20-\x7e\xa0-\xff]*$/.test(text) };
  const paint = { type: 'solid', color: [1, 0, 0] };
  const latin = { kind: 'text', text: 'Scan för menü', x: 512, y: 950, fontSize: 60, maxWidth: 758, anchor: 'middle', paint };
  const greek = { kind: 'text', text: 'Σαρώστε', x: 512, y: 100, fontSize: 50, maxWidth: 10, anchor: 'middle', paint };
  const drawing = { width: 1024, height: 1024, items: [latin, { kind: 'group', clip: null, items: [greek] }] };

  await withGlobals({ document, QRTurboHelvetica, getFrameFont: frame.getFrameFont }, async () => {
    const out = await Export.prepareText(drawing, { pxPerUnit: 2 });
    assert.equal(out.items[0], latin, 'Latin-1 labels stay text');
    const mask = out.items[1].items[0];
    assert.equal(mask.kind, 'mask');
    assert.equal(mask.paint, paint, 'painted in the label color');
    assert.deepEqual([mask.cols, mask.rows], [20, 140]);
    assert.deepEqual([mask.x, mask.y, mask.width, mask.height], [507, 50, 10, 70]);
    assert.equal(mask.bits.length, 3 * 140);
    assert.deepEqual([...mask.bits.subarray(0, 3)], [0xff, 0x80, 0x00]);
    assert.deepEqual(canvases[0].drawn, { text: 'Σαρώστε', x: 10, y: 100, font: frame.getFrameFont(100), align: 'center', fill: '#000000' });
    assert.equal(canvases[0].width, 0, 'the canvas is released');
    assert.equal(drawing.items[1].items[0], greek, 'the input drawing is not changed');

    // Very large prints cap the mask at 8000 columns.
    const poster = await Export.prepareText({ width: 1024, height: 1024, items: [{ ...greek, maxWidth: 758 }] }, { pxPerUnit: 100 });
    assert.equal(poster.items[0].cols, 8000);
    assert.ok(Math.abs(poster.items[0].width - 758) < 0.2);
  });
});

test('printSize uses the print size the panel shows, otherwise the default, and fits the page', () => {
  const at = patch => {
    const { width, unit, widthMm, scaledToFit } = Export.printSize(options(patch));
    return [Math.round(width * 1000) / 1000, unit, Math.round(widthMm * 1000) / 1000, scaledToFit];
  };
  // A width the current format hides is never used.
  assert.deepEqual(at({ format: 'png', print: { enabled: false, width: 400 } }), [50, 'mm', 50, false]);
  assert.deepEqual(at({ format: 'svg', print: { enabled: false, width: 120 } }), [50, 'mm', 50, false]);
  assert.deepEqual(at({ format: 'webp', print: { enabled: true, width: 120 } }), [50, 'mm', 50, false]);
  assert.deepEqual(at({ format: 'png', print: { enabled: false, unit: 'in', width: 9 } }), [2, 'in', 50.8, false]);
  // Print-sized formats print at their width.
  assert.deepEqual(at({ format: 'pdf', print: { width: 40 } }), [40, 'mm', 40, false]);
  assert.deepEqual(at({ format: 'eps', print: { unit: 'in', width: 3 } }), [3, 'in', 76.2, false]);
  assert.deepEqual(at({ format: 'jpg', print: { enabled: true, width: 120 } }), [120, 'mm', 120, false]);
  assert.deepEqual(at({ format: 'svg', print: { enabled: true, width: 70 } }), [70, 'mm', 70, false]);
  // Wider than A4 inside the 12 mm print margins: scaled down to 186 mm.
  assert.deepEqual(at({ format: 'pdf', print: { width: 400 } }), [186, 'mm', 186, true]);
  assert.deepEqual(at({ format: 'png', print: { enabled: true, unit: 'in', width: 10 } }), [7.323, 'in', 186, true]);
  assert.deepEqual(at({ format: 'pdf', page: 'a4', print: { width: 190 } }), [186, 'mm', 186, true]);
});

test('printSheet prints the shown or default size and names it in the tip', async () => {
  const toasts = [];
  const printed = [];
  const listeners = [];
  const sheet = {
    children: [],
    replaceChildren(...children) {
      this.children = children;
    }
  };
  const document = {
    getElementById: id => (id === 'print-sheet' ? sheet : null),
    createElement: () => ({ style: {} })
  };
  const window = {
    print: () => printed.push(sheet.children[0]),
    addEventListener: (type, listener, o) => listeners.push([type, o])
  };
  const QRTurboUI = { toast: (message, o) => toasts.push([message, o.tone]) };

  await withGlobals({ document, window, QRTurboUI, QRTurboSvg: Svg }, async () => {
    // The PNG panel hides the 400 mm left over from a PDF export.
    const hidden = await Export.printSheet(snapshot(), options({ format: 'png', print: { enabled: false, width: 400 } }));
    assert.deepEqual([hidden.width, hidden.unit, hidden.scaledToFit], [50, 'mm', false]);
    assert.deepEqual([printed[0].style.width, printed[0].style.height], ['50mm', '50mm']);
    assert.match(printed[0].src, /^blob:/);
    assert.deepEqual(toasts[0], ['output.summaryVectorPrint · output.printTip', 'info']);
    assert.deepEqual(listeners[0], ['afterprint', { once: true }]);

    const wide = await Export.printSheet(snapshot(), options({ format: 'pdf', print: { width: 400 } }));
    assert.equal(wide.scaledToFit, true);
    assert.deepEqual([printed[1].style.width, printed[1].style.height], ['186mm', '186mm']);
    assert.deepEqual(toasts[1], ['output.summaryVectorPrint · output.pageTooSmall · output.printTip', 'info']);
  });
});
