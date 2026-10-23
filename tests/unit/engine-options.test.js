const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const engine = require('../../Public/js/qr-engine.js');
const { createAppHarness } = require('../helpers/app-vm');

const repoRoot = path.resolve(__dirname, '../..');
// The engine rounds a raster quiet zone with app.js, as in the browser.
const { calculateQuietZonePixels } = createAppHarness().context;

function design(overrides = {}) {
  return {
    fgColor: '#000000',
    bgColor: '#ffffff',
    transparentBackground: false,
    fill: 'solid',
    fgColor2: '#2563eb',
    gradientType: 'linear',
    gradientAngle: 45,
    customCorners: false,
    cornerOuterColor: '#000000',
    cornerInnerColor: '#000000',
    errorCorrection: 'auto',
    dotStyle: 'square',
    cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot',
    margin: 4,
    logo: null,
    logoSize: 0.4,
    logoPadding: 0.5,
    frameStyle: 'none',
    frameText: '',
    frameColor: '#000000',
    minVersion: 0,
    ...overrides
  };
}

const SVG_OPTIONS = { type: 'svg', width: 330, margin: 40, typeNumber: 2, ecl: 'M', modulePx: 10 };

test('the preview draws 10 library units per module', () => {
  assert.equal(engine.UNIT, 10);
});

test('size, margin, data, version and level pass through', () => {
  const options = engine.buildOptions(design(), 'https://qrturbo.app', { ...SVG_OPTIONS, typeNumber: 7, ecl: 'Q' });

  assert.equal(options.type, 'svg');
  assert.equal(options.width, 330);
  assert.equal(options.height, 330);
  assert.equal(options.margin, 40);
  assert.equal(options.data, 'https://qrturbo.app');
  assert.deepEqual(options.qrOptions, { typeNumber: 7, errorCorrectionLevel: 'Q' });

  const canvas = engine.buildOptions(design(), 'x', { ...SVG_OPTIONS, type: 'canvas', typeNumber: 0, ecl: 'H' });
  assert.equal(canvas.type, 'canvas');
  assert.deepEqual(canvas.qrOptions, { typeNumber: 0, errorCorrectionLevel: 'H' });
});

test('a solid fill sets the dot color and no gradient', () => {
  const options = engine.buildOptions(design({ fgColor: '#102a43', dotStyle: 'rounded' }), 'x', SVG_OPTIONS);

  assert.deepEqual(options.dotsOptions, { type: 'rounded', color: '#102a43' });
});

test('a gradient fill uses radians and two color stops', () => {
  const linear = engine.buildOptions(design({
    fill: 'gradient',
    fgColor: '#ff0000',
    fgColor2: '#0000ff',
    gradientAngle: 90,
    dotStyle: 'dots'
  }), 'x', SVG_OPTIONS);

  assert.equal(linear.dotsOptions.type, 'dots');
  assert.equal(linear.dotsOptions.color, undefined);
  assert.equal(linear.dotsOptions.gradient.type, 'linear');
  assert.equal(linear.dotsOptions.gradient.rotation, Math.PI / 2);
  assert.deepEqual(linear.dotsOptions.gradient.colorStops, [
    { offset: 0, color: '#ff0000' },
    { offset: 1, color: '#0000ff' }
  ]);

  const radial = engine.buildOptions(design({ fill: 'gradient', gradientType: 'radial', gradientAngle: 345 }), 'x', SVG_OPTIONS);
  assert.equal(radial.dotsOptions.gradient.type, 'radial');
  assert.ok(Math.abs(radial.dotsOptions.gradient.rotation - (345 * Math.PI / 180)) < 1e-12);
  assert.equal(radial.dotsOptions.gradient.colorStops.length, 2);
});

test('corners share the dots paint unless custom corner colors are on', () => {
  const shared = engine.buildOptions(design({ fill: 'gradient', cornerOuterColor: '#ff0000' }), 'x', SVG_OPTIONS);
  assert.deepEqual(shared.cornersSquareOptions, { type: 'extra-rounded' });
  assert.deepEqual(shared.cornersDotOptions, { type: 'dot' });

  const custom = engine.buildOptions(design({
    customCorners: true,
    cornerOuterColor: '#ff0000',
    cornerInnerColor: '#00ff00',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square'
  }), 'x', SVG_OPTIONS);
  assert.deepEqual(custom.cornersSquareOptions, { type: 'square', color: '#ff0000' });
  assert.deepEqual(custom.cornersDotOptions, { type: 'square', color: '#00ff00' });
});

test('a transparent background draws no background rect', () => {
  assert.deepEqual(engine.buildOptions(design({ bgColor: '#fafafa' }), 'x', SVG_OPTIONS).backgroundOptions, { color: '#fafafa' });
  assert.deepEqual(
    engine.buildOptions(design({ bgColor: '#fafafa', transparentBackground: true }), 'x', SVG_OPTIONS).backgroundOptions,
    { color: '' }
  );
});

test('a logo is embedded with its spacing in modules converted to pixels', () => {
  const logo = { dataUrl: 'data:image/png;base64,iVBORw0KGgo=', mime: 'image/png', name: 'logo.png', width: 10, height: 10, bytes: 8, optimized: false };
  const preview = engine.buildOptions(design({ logo, logoSize: 0.3, logoPadding: 0.75 }), 'x', SVG_OPTIONS);

  assert.equal(preview.image, logo.dataUrl);
  assert.deepEqual(preview.imageOptions, {
    hideBackgroundDots: true,
    imageSize: 0.3,
    margin: 7.5,
    crossOrigin: 'anonymous'
  });

  const raster = engine.buildOptions(design({ logo, logoPadding: 2 }), 'x', { ...SVG_OPTIONS, modulePx: 24 });
  assert.equal(raster.imageOptions.margin, 48);

  const none = engine.buildOptions(design(), 'x', SVG_OPTIONS);
  assert.equal(none.image, undefined);
  assert.equal(none.imageOptions, undefined);
});

test('buildOptions does not change the design', () => {
  const input = Object.freeze(design({ fill: 'gradient', customCorners: true }));
  const options = engine.buildOptions(input, 'x', SVG_OPTIONS);
  options.dotsOptions.type = 'dots';
  assert.equal(input.dotStyle, 'square');
});

test('withTimeout resolves in time and rejects late promises with a timeout code', async () => {
  assert.equal(await engine.withTimeout(Promise.resolve(42), 50, 'fast'), 42);
  assert.equal(await engine.withTimeout(7, 50, 'plain value'), 7);

  const never = new Promise(() => {});
  await assert.rejects(engine.withTimeout(never, 10, 'Slow render'), error => {
    assert.equal(error.code, 'timeout');
    assert.match(error.message, /^Slow render timed out after 10 ms$/);
    return true;
  });

  await assert.rejects(engine.withTimeout(Promise.reject(new Error('boom')), 50, 'failing'), /boom/);
});

test('render rejects an unknown error correction level before touching the library', async () => {
  await assert.rejects(engine.render(design(), 'x', { type: 'svg', quietZone: 4, typeNumber: 1, ecl: 'X' }), RangeError);
});

test('selfTest finds the private API of the bundled library', () => {
  const context = { console, setTimeout, clearTimeout };
  context.self = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'Public/js/qr-code-styling.min.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'Public/js/qr-engine.js'), 'utf8'), context);

  assert.equal(typeof context.QRCodeStyling, 'function');
  assert.equal(context.QRTurboEngine.selfTest(), true);
});

test('selfTest fails safely without the library', () => {
  const context = { console, setTimeout, clearTimeout };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'Public/js/qr-engine.js'), 'utf8'), context);

  assert.equal(context.QRTurboEngine.selfTest(), false);
});

/**
 * A stand-in for QRCodeStyling with the same private shape: update() builds
 * _qr (with an asymmetric matrix) and then calls _setupSvg, which records the
 * options it draws with and every dark module at x = i, y = j, the way the
 * real library draws. `hook: false` removes _setupSvg from the prototype.
 */
function createFakeLibrary({ hook = true, neverDraws = false } = {}) {
  const versionFor = data => Math.max(1, Math.ceil(data.length / 10));
  const original = (row, col) => (row * 7 + col * 3) % 5 === 0 || (row === 0 && col < 3);

  function FakeQRCodeStyling(options) {
    this._options = JSON.parse(JSON.stringify(options));
    this.update();
  }

  FakeQRCodeStyling.prototype.update = function (patch) {
    if (patch) {
      this._options = {
        ...this._options,
        ...patch,
        qrOptions: { ...this._options.qrOptions, ...(patch.qrOptions || {}) },
        imageOptions: { ...(this._options.imageOptions || {}), ...(patch.imageOptions || {}) }
      };
    }
    if (!this._options.data) return;
    if (this._options.data === 'explode') throw 'mode:Kanji';
    const needed = versionFor(this._options.data);
    const typeNumber = this._options.qrOptions.typeNumber;
    if (typeNumber > 0 && typeNumber < needed) throw `code length overflow. (${needed}>${typeNumber})`;
    const count = 17 + (4 * (typeNumber > 0 ? typeNumber : needed));
    this._qr = { getModuleCount: () => count, isDark: (row, col) => original(row, col) };
    this.updates = (this.updates || 0) + 1;
    if (typeof this._setupSvg === 'function') this._setupSvg(); else this._draw();
  };

  FakeQRCodeStyling.prototype._draw = function () {
    const count = this._qr.getModuleCount();
    const dark = [];
    for (let i = 0; i < count; i += 1) {
      for (let j = 0; j < count; j += 1) {
        if (this._qr.isDark(i, j)) dark.push(`${i},${j}`);
      }
    }
    this.drawn = { width: this._options.width, margin: this._options.margin, dark: new Set(dark), imageMargin: this._options.imageOptions?.margin };
  };

  if (hook) FakeQRCodeStyling.prototype._setupSvg = FakeQRCodeStyling.prototype._draw;

  FakeQRCodeStyling.prototype.getRawData = function () {
    if (neverDraws) return new Promise(() => {});
    const { width, margin } = this.drawn;
    return Promise.resolve(new Blob([
      `<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" data-margin="${margin}"></svg>`
    ], { type: 'image/svg+xml' }));
  };

  return { FakeQRCodeStyling, original };
}

function loadEngineWith(Library) {
  const warnings = [];
  const context = {
    console: { ...console, warn: message => warnings.push(String(message)) },
    setTimeout,
    clearTimeout,
    Blob,
    calculateQuietZonePixels,
    QRCodeStyling: Library
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, 'Public/js/qr-engine.js'), 'utf8'), context);
  return { engine: context.QRTurboEngine, warnings };
}

test('render swaps isDark before drawing, so modules land in standard orientation', async () => {
  const { FakeQRCodeStyling, original } = createFakeLibrary();
  const { engine: hooked } = loadEngineWith(FakeQRCodeStyling);
  const result = await hooked.render(design(), 'x'.repeat(25), { type: 'svg', quietZone: 4, typeNumber: 3, ecl: 'M' });
  const drawn = result.instance.drawn;

  assert.equal(result.standardized, true);
  assert.equal(result.moduleCount, 29);
  assert.equal(result.version, 3);
  assert.equal(result.width, 370);
  assert.equal(result.margin, 40);
  assert.equal(result.dot, 10);
  assert.equal(drawn.width, 370);
  assert.equal(drawn.margin, 40);
  assert.equal(result.svgMarkup.startsWith('<svg'), true);

  for (let row = 0; row < 29; row += 1) {
    for (let col = 0; col < 29; col += 1) {
      // The library draws isDark(i, j) at x = i, y = j: standard means x = col, y = row.
      assert.equal(drawn.dark.has(`${col},${row}`), original(row, col), `module ${row},${col}`);
      assert.equal(result.matrix(row, col), original(row, col));
    }
  }
});

test('an overflowing prediction retries once with the automatic version and its geometry', async () => {
  const { FakeQRCodeStyling } = createFakeLibrary();
  const { engine: hooked, warnings } = loadEngineWith(FakeQRCodeStyling);
  const logo = { dataUrl: 'data:image/png;base64,AAAA', mime: 'image/png', name: '', width: 1, height: 1, bytes: 3, optimized: false };
  const result = await hooked.render(design({ logo, logoPadding: 1.5 }), 'x'.repeat(45), { type: 'svg', quietZone: 6, typeNumber: 2, ecl: 'H' });

  assert.equal(result.moduleCount, 37);
  assert.equal(result.width, (37 + 12) * 10);
  assert.equal(result.instance.drawn.width, 490);
  assert.equal(result.instance.drawn.margin, 60);
  assert.equal(result.instance.drawn.imageMargin, 15);
  assert.equal(result.instance._options.qrOptions.typeNumber, 0);
  assert.equal(warnings.length, 1);
});

test('with a pixel size the quiet zone is rounded up to whole pixels', async () => {
  const { FakeQRCodeStyling } = createFakeLibrary();
  const { engine: hooked } = loadEngineWith(FakeQRCodeStyling);
  const result = await hooked.render(design(), 'x'.repeat(15), { type: 'svg', size: 1024, quietZone: 4, typeNumber: 2, ecl: 'M' });

  assert.equal(result.width, 1024);
  assert.equal(result.margin, Math.ceil((4 * 1024) / (25 + 8)));
  assert.equal(result.dot, Math.floor((1024 - (2 * result.margin)) / 25));
});

test('without the private hook the engine still renders, mirrored, with corrected geometry', async () => {
  const { FakeQRCodeStyling, original } = createFakeLibrary({ hook: false });
  const { engine: plain } = loadEngineWith(FakeQRCodeStyling);
  assert.equal(plain.selfTest(), false);

  const result = await plain.render(design(), 'x'.repeat(25), { type: 'svg', quietZone: 4, typeNumber: 0, ecl: 'M' });
  assert.equal(result.standardized, false);
  assert.equal(result.moduleCount, 29);
  assert.equal(result.instance.updates, 2);
  assert.equal(result.instance.drawn.width, 370);
  assert.equal(result.matrix(0, 1), original(0, 1));
  assert.equal(result.matrix(1, 0), original(1, 0));
});

test('library errors become Error objects and hung renders time out', async () => {
  const { FakeQRCodeStyling } = createFakeLibrary();
  const { engine: hooked } = loadEngineWith(FakeQRCodeStyling);
  await assert.rejects(
    hooked.render(design(), 'explode', { type: 'svg', quietZone: 4, typeNumber: 1, ecl: 'M' }),
    // The engine runs in its own realm, so its Error is checked by tag.
    error => Object.prototype.toString.call(error) === '[object Error]' && error.message === 'mode:Kanji'
  );

  const { FakeQRCodeStyling: Hanging } = createFakeLibrary({ neverDraws: true });
  const { engine: hanging } = loadEngineWith(Hanging);
  await assert.rejects(
    hanging.render(design(), 'x', { type: 'svg', quietZone: 4, typeNumber: 1, ecl: 'M', timeoutMs: 20 }),
    error => error.code === 'timeout'
  );
});

/**
 * The engine with QRTurboBytes and a stand-in Image that loads any URL
 * without an intrinsic size, as browsers do for an SVG without width and
 * height. blobToDataURL is the app.js helper the engine calls.
 */
function loadLogoEngine() {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    Blob,
    URL,
    TextDecoder,
    TextEncoder,
    Image: class {
      set src(value) {
        this.url = value;
        setTimeout(() => this.onload && this.onload(), 0);
      }

      decode() {
        return Promise.resolve();
      }
    },
    blobToDataURL: async blob => `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`
  };
  vm.createContext(context);
  for (const file of ['lib/bytes.js', 'qr-engine.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, 'Public/js', file), 'utf8'), context);
  }
  return context.QRTurboEngine;
}

function svgFile(text) {
  return new File([text], 'logo.svg', { type: 'image/svg+xml' });
}

test('an SVG logo with only a viewBox gets its width and height from it', async () => {
  const logoEngine = loadLogoEngine();
  const markup = '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 40 20"><rect width="40" height="20"/></svg>';
  const logo = await logoEngine.prepareLogo(svgFile(markup));

  assert.equal(logo.mime, 'image/svg+xml');
  assert.deepEqual([logo.width, logo.height, logo.optimized], [40, 20, false]);
  const text = Buffer.from(logo.dataUrl.split(',')[1], 'base64').toString('utf8');
  assert.equal(text, '<?xml version="1.0"?>\n<svg width="40" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><rect width="40" height="20"/></svg>');
});

test('an SVG logo loses comments and editor metadata that can name the author or their files', async () => {
  const logoEngine = loadLogoEngine();
  const markup = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"'
    + ' xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" viewBox="0 0 10 10"'
    + ' sodipodi:docname="secret.svg" inkscape:export-filename="/Users/anna/logo.png">'
    + '<!-- drawn by Anna Virtanen -->'
    + '<metadata id="m"><rdf:RDF><dc:creator>Anna Virtanen</dc:creator></rdf:RDF></metadata>'
    + '<sodipodi:namedview id="n" inkscape:zoom="2"><inkscape:page/></sodipodi:namedview>'
    + '<path d="M0 0h10v10z" inkscape:label="Layer 1"/></svg>';
  const logo = await logoEngine.prepareLogo(svgFile(markup));
  const text = Buffer.from(logo.dataUrl.split(',')[1], 'base64').toString('utf8');

  assert.equal(logo.mime, 'image/svg+xml');
  assert.doesNotMatch(text, /Anna|secret|\/Users|<!--|metadata|namedview|inkscape:|sodipodi:docname/);
  assert.match(text, /<path d="M0 0h10v10z"\/>/);
  assert.match(text, /xmlns:inkscape=/);
});

test('a crafted SVG logo with many "<svg" and no ">" is rejected at once', async () => {
  const logoEngine = loadLogoEngine();
  // 400 KB: the old root-tag regex took about 12 s on this, blocking the tab.
  const crafted = '<svg '.repeat(80 * 1024);
  const started = Date.now();
  await assert.rejects(logoEngine.prepareLogo(svgFile(crafted)), error => error.message === 'logo.readFailed');
  assert.ok(Date.now() - started < 1000, `took ${Date.now() - started} ms`);
});
