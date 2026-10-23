const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { FRAME_MS, createFakeClock } = require('../helpers/fake-clock');

const repoRoot = path.resolve(__dirname, '../..');
const LIBS = ['lib/bytes.js', 'lib/color.js', 'lib/capacity.js', 'lib/rules.js', 'lib/svg.js'];
const STORAGE_KEY = 'qrturbo_export';

function read(file) {
  return fs.readFileSync(path.join(repoRoot, 'Public/js', file), 'utf8');
}

/**
 * A stand-in for QRTurboEngine.render: resolves after `delay` ms (on `clock`
 * when given) with a small library-like SVG, records every call and the most
 * renders in flight.
 */
function createEngine({ delay = 0, fail = false, clock = null } = {}) {
  const wait = clock ? clock.setTimeout : setTimeout;
  const calls = [];
  let running = 0;
  let maxRunning = 0;
  return {
    calls,
    get maxRunning() { return maxRunning; },
    api: {
      render(design, bytes, o) {
        calls.push({ bytes, o });
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        return new Promise((resolve, reject) => {
          wait(() => {
            running -= 1;
            if (fail) {
              reject(new Error('library failed'));
              return;
            }
            const count = 17 + (4 * o.typeNumber);
            const size = (count + (2 * o.quietZone)) * 10;
            resolve({
              moduleCount: count,
              version: o.typeNumber,
              width: size,
              margin: o.quietZone * 10,
              dot: 10,
              standardized: true,
              svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`
                + '<defs><clipPath id="clip-path-dot-color"><rect width="10" height="10"/></clipPath></defs>'
                + `<rect clip-path="url('#clip-path-dot-color')" fill="#000000" width="${size}" height="${size}"/></svg>`,
              matrix: () => false
            });
          }, delay);
        });
      }
    }
  };
}

/**
 * Loads controller.js with the pure lib modules and stubs for the browser
 * modules. There is no DOM: getElementById returns null, so the stage code
 * runs without touching elements. `content` is what collectContent returns.
 * With a fake `clock`, its timers and animation frames replace the real ones.
 */
function loadController({ language = 'en-GB', saved, storageThrows = false, engine = createEngine().api, elements = {}, t, clock } = {}) {
  const store = new Map();
  if (saved !== undefined) store.set(STORAGE_KEY, typeof saved === 'string' ? saved : JSON.stringify(saved));
  const logs = [];
  const announced = [];
  const content = {
    current: { ok: false, type: 'URLText', empty: true, errorKey: 'alerts.dataEmpty', fieldId: 'qr-text' }
  };
  const noop = () => {};

  const context = {
    console: { log: noop, info: noop, warn: (...args) => logs.push(args), error: (...args) => logs.push(args) },
    setTimeout,
    clearTimeout,
    TextEncoder,
    TextDecoder,
    navigator: { language },
    localStorage: {
      getItem(key) {
        if (storageThrows) throw new Error('blocked');
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        if (storageThrows) throw new Error('blocked');
        store.set(key, String(value));
      }
    },
    document: { readyState: 'loading', hidden: false, addEventListener: noop, getElementById: id => elements[id] || null },
    setupThemeSelector: noop,
    registerServiceWorker: noop,
    initContentForms: noop,
    getActiveTabName: () => content.current.type,
    collectContent: () => content.current,
    QRTurboUI: { init: noop, announce: message => announced.push(message) },
    QRTurboDesignUI: { init: noop },
    QRTurboExportUI: { init: noop },
    QRTurboScan: { init: noop },
    QRTurboEngine: engine
  };
  if (t) context.t = t;
  if (clock) {
    Object.assign(context, {
      setTimeout: clock.setTimeout,
      clearTimeout: clock.clearTimeout,
      requestAnimationFrame: clock.requestAnimationFrame,
      cancelAnimationFrame: clock.cancelAnimationFrame
    });
  }
  vm.createContext(context);
  LIBS.forEach(file => vm.runInContext(read(file), context));
  vm.runInContext(read('controller.js'), context);
  return { app: context.QRTurboApp, store, logs, announced, content };
}

function ok(payload, type = 'URLText') {
  return { ok: true, type, payload, isSensitive: false, filenameHint: '', primaryFieldId: 'qr-text' };
}

function collect(app, event) {
  const seen = [];
  app.on(event, detail => seen.push(detail));
  return seen;
}

test('saved export options are restored through the whitelist', () => {
  const { app } = loadController({
    saved: {
      v: 1,
      format: 'eps',
      pixelSize: 999,
      customPixels: 4000,
      print: { enabled: true, unit: 'in', width: 100, dpi: 600 },
      page: 'letter',
      colorMode: 'cmyk',
      payload: 'never stored'
    }
  });
  app.init();

  assert.deepEqual(JSON.parse(JSON.stringify(app.getExportOptions())), {
    v: 1,
    format: 'eps',
    pixelSize: 1024,
    customPixels: 4000,
    print: { enabled: true, unit: 'in', width: 2, dpi: 600 },
    page: 'letter',
    colorMode: 'cmyk'
  });
  assert.ok(Object.isFrozen(app.getExportOptions()));
  assert.ok(Object.isFrozen(app.getExportOptions().print));
});

test('corrupt, outdated or blocked storage falls back to the defaults', () => {
  const defaults = JSON.stringify(loadController().app.defaultExportOptions());
  for (const options of [{ saved: '{not json' }, { saved: { v: 2, format: 'svg' } }, { storageThrows: true }]) {
    const { app } = loadController(options);
    assert.doesNotThrow(() => app.init());
    assert.equal(JSON.stringify(app.getExportOptions()), defaults);
  }
});

test('the default print width is 2 in for US English and 50 mm elsewhere', () => {
  assert.deepEqual({ ...loadController({ language: 'en-US' }).app.defaultExportOptions().print }, { enabled: false, unit: 'in', width: 2, dpi: 300 });
  assert.deepEqual({ ...loadController({ language: 'fi-FI' }).app.defaultExportOptions().print }, { enabled: false, unit: 'mm', width: 50, dpi: 300 });
});

test('updateExportOptions validates, persists and emits only real changes', () => {
  const { app, store } = loadController();
  app.init();
  const events = collect(app, 'export');

  app.updateExportOptions({ format: 'gif', pixelSize: 2048, print: { dpi: 72, enabled: true }, extra: true });
  assert.equal(events.length, 1);
  assert.equal(app.getExportOptions().format, 'png');
  assert.equal(app.getExportOptions().pixelSize, 2048);
  assert.equal(app.getExportOptions().print.dpi, 300);
  assert.equal(app.getExportOptions().print.enabled, true);
  assert.equal(app.getExportOptions().extra, undefined);
  assert.deepEqual(JSON.parse(store.get(STORAGE_KEY)), JSON.parse(JSON.stringify(app.getExportOptions())));
  assert.equal(events[0].previous.pixelSize, 1024);

  app.updateExportOptions({ pixelSize: 2048 });
  app.updateExportOptions(null);
  assert.equal(events.length, 1);
});

test('a unit change alone keeps the physical width inside the new limits', () => {
  const { app } = loadController();
  app.init();

  app.updateExportOptions({ print: { unit: 'in' } });
  assert.deepEqual([app.getExportOptions().print.unit, app.getExportOptions().print.width], ['in', 1.97]);

  app.updateExportOptions({ print: { unit: 'mm', width: 10 } });
  app.updateExportOptions({ print: { unit: 'in' } });
  assert.deepEqual([app.getExportOptions().print.unit, app.getExportOptions().print.width], ['in', 0.4]);

  app.updateExportOptions({ print: { width: 80 } });
  app.updateExportOptions({ print: { unit: 'mm' } });
  assert.deepEqual([app.getExportOptions().print.unit, app.getExportOptions().print.width], ['mm', 2000]);
});

test('updateDesign keeps only known, valid values and emits the changed keys', () => {
  const { app } = loadController();
  const events = collect(app, 'design');

  app.updateDesign({
    fgColor: '#1E3A8A',
    bgColor: '#fff',
    margin: 4.5,
    logoSize: 0.6,
    dotStyle: 'rounded',
    minVersion: 41,
    unknown: 'x'
  }, { source: 'preset' });

  const design = app.getDesign();
  assert.ok(Object.isFrozen(design));
  assert.equal(design.fgColor, '#1e3a8a');
  assert.equal(design.bgColor, '#ffffff');
  assert.equal(design.margin, 4);
  assert.equal(design.logoSize, 0.4);
  assert.equal(design.dotStyle, 'rounded');
  assert.equal(design.minVersion, 0);
  assert.equal(design.unknown, undefined);
  assert.equal(events.length, 1);
  assert.deepEqual([...events[0].changed].sort(), ['dotStyle', 'fgColor']);
  assert.equal(events[0].source, 'preset');

  app.updateDesign({ dotStyle: 'rounded' });
  assert.equal(events.length, 1);

  app.replaceDesign({ errorCorrection: 'H' }, { source: 'reset' });
  assert.equal(app.getDesign().fgColor, '#000000');
  assert.equal(app.getDesign().dotStyle, 'square');
  assert.equal(app.getDesign().errorCorrection, 'H');
});

test('typing is debounced and whenReady flushes the latest revision at once', async () => {
  const clock = createFakeClock();
  const engine = createEngine({ clock });
  const { app, content } = loadController({ engine: engine.api, clock });

  // Each key restarts the 150 ms typing delay.
  for (const text of ['h', 'he', 'hello']) {
    content.current = ok(text);
    app.schedulePreview({ reason: 'typing' });
    await clock.advance(100);
  }
  assert.equal(engine.calls.length, 0, 'no render while the typing continues');
  assert.deepEqual(clock.pending(), [50]);

  const snapshot = await clock.settle(app.whenReady());

  assert.equal(clock.now(), 300, 'whenReady does not wait for the typing delay');
  assert.deepEqual(clock.pending(), [], 'the typing delay is cancelled');
  assert.equal(snapshot.payload, 'hello');
  assert.equal(engine.calls.length, 1);
  assert.equal(app.getPreviewState(), 'ready');
});

test('typing renders 150 ms after the last key, and 250 ms after it above version 25', async () => {
  const clock = createFakeClock();
  const engine = createEngine({ clock });
  const { app, content } = loadController({ engine: engine.api, clock });

  content.current = ok('hello');
  app.schedulePreview({ reason: 'typing' });
  await clock.advance(149);
  assert.equal(engine.calls.length, 0);
  await clock.advance(1);
  assert.equal(engine.calls.length, 1);

  content.current = ok('y'.repeat(1200));
  app.schedulePreview({ reason: 'typing' });
  await clock.advance(150);
  assert.ok(app.getSnapshot().version > 25, `expected a dense code, got version ${app.getSnapshot().version}`);

  content.current = ok('y'.repeat(1201));
  app.schedulePreview({ reason: 'typing' });
  await clock.advance(249);
  assert.equal(engine.calls.length, 2, 'a dense code waits longer');
  await clock.advance(1);
  assert.equal(engine.calls.length, 3);
  assert.equal(app.getSnapshot().payload, 'y'.repeat(1201));
});

test('a slider drag follows a small code at once but waits for a rest on a dense one', async () => {
  const clock = createFakeClock();
  const engine = createEngine({ clock });
  const { app, content } = loadController({ engine: engine.api, clock });

  content.current = ok('small');
  app.schedulePreview({ reason: 'drag' });
  await clock.advance(FRAME_MS - 1);
  assert.equal(engine.calls.length, 0);
  await clock.advance(1);
  assert.equal(engine.calls.length, 1, 'a small code renders on the next frame');

  // About version 25 at level M.
  content.current = ok('y'.repeat(900));
  app.schedulePreview({ reason: 'discrete' });
  const dense = await clock.settle(app.whenReady());
  assert.ok(dense.version >= 20, `expected a dense code, got version ${dense.version}`);
  const before = engine.calls.length;

  for (let step = 0; step < 4; step += 1) {
    content.current = ok('y'.repeat(899) + step);
    app.schedulePreview({ reason: 'drag' });
    await clock.advance(40);
  }
  assert.equal(engine.calls.length, before, 'no render while the dense drag keeps moving');
  await clock.advance(150 - 40 - 1);
  assert.equal(engine.calls.length, before, 'no render before the pointer rests for 150 ms');
  await clock.advance(1);
  assert.equal(engine.calls.length, before + 1, 'one render once the pointer rests');
  assert.equal(app.getSnapshot().payload, `${'y'.repeat(899)}3`);
});

test('a newer revision drops the stale render, and only one render runs at a time', async () => {
  const clock = createFakeClock();
  const engine = createEngine({ delay: 25, clock });
  const { app, content } = loadController({ engine: engine.api, clock });
  const ready = collect(app, 'preview-ready');

  content.current = ok('first');
  app.schedulePreview({ reason: 'discrete' });
  await clock.advance(5);
  content.current = ok('second');
  app.schedulePreview({ reason: 'discrete' });
  await clock.advance(5);
  content.current = ok('third');
  app.schedulePreview({ reason: 'discrete' });

  const snapshot = await clock.settle(app.whenReady());
  assert.equal(snapshot.payload, 'third');
  assert.equal(clock.now(), 50, 'the queued render starts when the first one ends');
  assert.equal(engine.maxRunning, 1);
  assert.deepEqual(ready.map(s => s.payload), ['third']);
  assert.deepEqual(engine.calls.map(call => call.bytes), ['first', 'third']);
});

test('the ready snapshot is frozen, analysed and hardened with per-revision ids', async () => {
  const { app, content } = loadController();
  content.current = ok('https://qrturbo.app');
  app.schedulePreview({ immediate: true });
  const snapshot = await app.whenReady();

  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.analysis));
  assert.ok(Object.isFrozen(snapshot.design));
  assert.equal(snapshot.version, 2);
  assert.equal(snapshot.analysis.version, 2);
  assert.equal(snapshot.ecl, 'M');
  assert.equal(snapshot.eclAuto, true);
  assert.equal(snapshot.quietZone, 4);
  assert.equal(snapshot.frame, null);
  assert.equal(snapshot.bytes, 'https://qrturbo.app');
  assert.ok(snapshot.revision > 0);
  assert.match(snapshot.previewMarkup, new RegExp(`^<svg[^>]* width="100%" height="100%"[^>]* viewBox="0 0 330 330"`));
  assert.match(snapshot.previewMarkup, new RegExp(`id="qp${snapshot.revision}-clip-path-dot-color"`));
  assert.match(snapshot.previewMarkup, new RegExp(`url\\(#qp${snapshot.revision}-clip-path-dot-color\\)`));
  assert.doesNotMatch(snapshot.previewMarkup, /<\?xml/);
  assert.equal(app.getSnapshot(), snapshot);
});

test('the preview markup keeps only href on a logo image; exports keep xlink:href too', async () => {
  const logo = 'data:image/png;base64,' + 'B'.repeat(2000);
  const engine = {
    render: () => Promise.resolve({
      moduleCount: 21,
      version: 1,
      width: 290,
      margin: 40,
      dot: 10,
      standardized: true,
      svgMarkup: '<svg xmlns="http://www.w3.org/2000/svg" width="290" height="290">'
        + `<rect fill="#000000" width="290" height="290"/><image href="${logo}" x="100" y="100" width="90px" height="90px"/></svg>`,
      matrix: () => false
    })
  };
  const { app, content } = loadController({ engine });
  content.current = ok('https://qrturbo.app');
  app.schedulePreview({ immediate: true });
  const snapshot = await app.whenReady();

  assert.match(snapshot.previewMarkup, new RegExp(`<image href="${logo}" x="100" y="100" width="90" height="90"/>`));
  assert.doesNotMatch(snapshot.previewMarkup, /xlink:href/);
  assert.equal(snapshot.previewMarkup.split(logo).length - 1, 1);
  // The library SVG that exports harden stays untouched.
  assert.match(snapshot.qrSvgMarkup, new RegExp(`<image href="${logo}"`));

  const offscreen = await app.buildSnapshot({ type: 'URLText', payload: 'row', filenameHint: '' });
  assert.doesNotMatch(offscreen.previewMarkup, /xlink:href/);
});

test('the too-long readout passes used, max and level to capacity.tooLong', async () => {
  const usage = { textContent: '', classList: { add() {}, remove() {}, toggle() {} } };
  const info = { hidden: true, dataset: {} };
  const translated = [];
  const t = (key, vars) => {
    translated.push({ key, vars });
    return vars ? `${key}${JSON.stringify(vars)}` : key;
  };
  const noop = () => {};
  const elements = {
    'qr-stage': { dataset: {}, setAttribute: noop },
    'qr-canvas-container': { firstElementChild: null, classList: { toggle: noop }, setAttribute: noop, removeAttribute: noop, replaceChildren: noop },
    'qr-info': info,
    'capacity-usage': usage
  };
  const { app, content } = loadController({ elements, t });
  content.current = ok('a'.repeat(2332));
  app.schedulePreview({ immediate: true });
  assert.equal(await app.whenReady(), null);
  assert.equal(app.getPreviewState(), 'tooLong');

  const call = translated.find(entry => entry.key === 'capacity.tooLong');
  assert.ok(call, 'capacity.tooLong is used');
  assert.deepEqual(Object.keys(call.vars).sort(), ['level', 'max', 'used']);
  assert.equal(call.vars.level, 'M');
  assert.equal(call.vars.used, '2,332');
  assert.match(call.vars.max, /^\d{1,3}(,\d{3})*$/);
  assert.equal(usage.textContent, `capacity.tooLong${JSON.stringify(call.vars)}`);
  assert.equal(info.hidden, false);
});

test('empty, invalid, too long and failed previews settle with null and the right reason', async () => {
  const failing = createEngine({ fail: true });
  const { app, content, announced } = loadController({ engine: failing.api });
  const reasons = collect(app, 'preview-empty');

  app.schedulePreview({ immediate: true });
  assert.equal(await app.whenReady(), null);

  content.current = { ok: false, type: 'Email', empty: false, errorKey: 'alerts.emailInvalid', fieldId: 'email-to' };
  app.schedulePreview({ immediate: true });
  assert.equal(await app.whenReady(), null);

  content.current = ok('a'.repeat(2332));
  app.schedulePreview({ immediate: true });
  assert.equal(await app.whenReady(), null);
  assert.equal(app.getPreviewState(), 'tooLong');

  content.current = ok('fits');
  app.schedulePreview({ immediate: true });
  assert.equal(await app.whenReady(), null);
  app.schedulePreview({ immediate: true });
  await app.whenReady();

  assert.deepEqual(reasons.map(r => r.reason), ['empty', 'invalid', 'tooLong', 'error', 'error']);
  assert.equal(reasons[1].fieldId, 'email-to');
  assert.equal(reasons[2].fieldId, 'qr-text');
  assert.equal(app.getPreviewState(), 'error');
  // The failure is announced once, not on every failed refresh.
  assert.deepEqual(announced, ['empty.error']);
});

test('"QR code ready" is announced when the code becomes ready, not on every refresh', async () => {
  const { app, content, announced } = loadController();
  for (const text of ['one', 'two', 'three']) {
    content.current = ok(text);
    app.schedulePreview({ immediate: true });
    await app.whenReady();
  }
  content.current = { ok: false, type: 'URLText', empty: true, errorKey: 'alerts.dataEmpty', fieldId: 'qr-text' };
  app.schedulePreview({ immediate: true });
  await app.whenReady();
  content.current = ok('four');
  app.schedulePreview({ immediate: true });
  await app.whenReady();

  assert.deepEqual(announced, ['preview.ready', 'preview.ready']);
});

test('buildSnapshot renders off screen with negative revisions and coded errors', async () => {
  const engine = createEngine();
  const { app } = loadController({ engine: engine.api });
  const ready = collect(app, 'preview-ready');

  const snapshot = await app.buildSnapshot(
    { type: 'Payment', payload: 'BCD', isSensitive: false, filenameHint: 'row' },
    { design: { errorCorrection: 'H', fgColor: '#ABCDEF', bogus: 1 }, minVersion: 7 }
  );
  assert.ok(snapshot.revision < 0);
  assert.ok(Object.isFrozen(snapshot));
  assert.equal(snapshot.ecl, 'M');
  assert.equal(snapshot.version, 7);
  assert.equal(engine.calls[0].o.typeNumber, 7);
  assert.equal(snapshot.design.fgColor, '#abcdef');
  assert.equal(snapshot.design.bogus, undefined);
  assert.equal(snapshot.filenameHint, 'row');
  assert.match(snapshot.previewMarkup, new RegExp(`id="qb${-snapshot.revision}-`));
  assert.equal(ready.length, 0);
  assert.equal(app.getSnapshot(), null);

  await assert.rejects(app.buildSnapshot({ type: 'URLText', payload: '' }), error => error.message === 'alerts.dataEmpty' && error.code === 'empty');
  await assert.rejects(app.buildSnapshot({ type: 'URLText', payload: 'a'.repeat(3000) }), error => error.message === 'alerts.dataTooLong' && error.code === 'tooLong');

  const broken = loadController({ engine: createEngine({ fail: true }).api }).app;
  await assert.rejects(broken.buildSnapshot({ type: 'URLText', payload: 'x' }), error => error.message === 'alerts.generationError' && error.code === 'render');
});

test('a payment code never goes above version 13, whatever the minimum version', async () => {
  const engine = createEngine();
  const { app, content } = loadController({ engine: engine.api });
  app.updateDesign({ minVersion: 20 });

  content.current = ok('BCD\n002\n1\nSCT\n\nAsiakas\nFI7944052020036082', 'Payment');
  app.schedulePreview({ immediate: true });
  const payment = await app.whenReady();
  assert.equal(payment.version, 13);
  assert.equal(payment.analysis.version, 13);
  assert.equal(payment.ecl, 'M');
  assert.equal(engine.calls.at(-1).o.typeNumber, 13);

  // Other types keep the design's floor.
  content.current = ok('https://qrturbo.app');
  app.schedulePreview({ immediate: true });
  assert.equal((await app.whenReady()).version, 20);

  // The batch path ("same size" passes its own floor) is capped too.
  const row = await app.buildSnapshot({ type: 'Payment', payload: 'BCD', filenameHint: '' }, { minVersion: 25 });
  assert.equal(row.version, 13);
  const text = await app.buildSnapshot({ type: 'URLText', payload: 'row', filenameHint: '' }, { minVersion: 25 });
  assert.equal(text.version, 25);
});

test('revealErrors reports nothing while the first code after an empty or failed state is on its way', async () => {
  let fail = false;
  const engine = {
    render: (design, bytes, o) => (fail
      ? Promise.reject(new Error('library failed'))
      : createEngine().api.render(design, bytes, o))
  };
  const { app, content } = loadController({ engine });

  app.schedulePreview({ immediate: true });
  await app.whenReady();
  assert.equal(app.getPreviewState(), 'empty');
  assert.equal(app.revealErrors(), true, 'empty content blocks');
  assert.equal(app.getPreviewState(), 'invalid');

  // Pasted content: the stage keeps its state until the code is ready, but
  // nothing blocks, so a click right away can wait for whenReady().
  content.current = ok('https://example.com/hello');
  app.schedulePreview({ reason: 'typing' });
  assert.equal(app.getPreviewState(), 'invalid');
  assert.equal(app.revealErrors({ focus: true }), false);
  assert.equal((await app.whenReady()).payload, 'https://example.com/hello');

  // A failed render blocks once it has settled, not while a retry is pending.
  fail = true;
  content.current = ok('https://example.com/broken');
  app.schedulePreview({ immediate: true });
  assert.equal(await app.whenReady(), null);
  assert.equal(app.getPreviewState(), 'error');
  assert.equal(app.revealErrors(), true);
  fail = false;
  app.schedulePreview({ reason: 'typing' });
  assert.equal(app.getPreviewState(), 'error');
  assert.equal(app.revealErrors(), false);
  assert.equal((await app.whenReady()).payload, 'https://example.com/broken');

  // Too much content blocks at once, before its revision settles.
  content.current = ok('a'.repeat(2332));
  app.schedulePreview({ reason: 'typing' });
  assert.equal(app.revealErrors(), true);
  await app.whenReady();
});
