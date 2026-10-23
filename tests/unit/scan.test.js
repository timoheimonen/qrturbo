const assert = require('node:assert/strict');
const test = require('node:test');

const jsQR = require('jsqr');
const { createFakeClock } = require('../helpers/fake-clock');
const { qrMatrix } = require('../helpers/vector-inspect');

// scan.js reaches these through globalThis at call time.
require('../../Public/js/lib/color.js');
require('../../Public/js/lib/rules.js');

const SCAN_PATH = require.resolve('../../Public/js/scan.js');
const PAYLOAD = 'https://qrturbo.app';
const MARKUP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" width="100%" height="100%"></svg>';

// --- A small fake DOM: just what scan.js touches ---

class FakeElement {
  constructor(tagName, doc) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = doc;
    this.children = [];
    this.parent = null;
    this.attributes = new Map();
    this.dataset = {};
    this.hidden = false;
    this.className = '';
    this.listeners = {};
    this.textWrites = 0;
    this.text = '';
    const classes = new Set();
    this.classList = {
      toggle: (name, force) => {
        const on = force === undefined ? !classes.has(name) : Boolean(force);
        if (on) classes.add(name);
        else classes.delete(name);
        return on;
      },
      contains: name => classes.has(name)
    };
  }

  get textContent() {
    return this.children.length ? this.children.map(child => child.textContent).join('') : this.text;
  }

  set textContent(value) {
    this.textWrites += 1;
    this.children = [];
    this.text = String(value);
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, event = {}) { (this.listeners[type] || []).forEach(fn => fn({ target: this, ...event })); }
  focus() { this.ownerDocument.activeElement = this; }

  appendChild(child) {
    child.detach();
    child.parent = this;
    this.children.push(child);
    return child;
  }

  detach() {
    if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this);
    this.parent = null;
  }

  get parentNode() { return this.parent; }

  get nextElementSibling() {
    if (!this.parent) return null;
    const siblings = this.parent.children;
    return siblings[siblings.indexOf(this) + 1] || null;
  }

  before(node) {
    const parent = this.parent;
    node.detach();
    node.parent = parent;
    parent.children.splice(parent.children.indexOf(this), 0, node);
  }

  after(node) {
    const parent = this.parent;
    node.detach();
    node.parent = parent;
    parent.children.splice(parent.children.indexOf(this) + 1, 0, node);
  }

  replaceChildren(...nodes) {
    this.children = [];
    nodes.forEach(node => this.appendChild(node));
  }

  matches(selector) {
    if (selector.startsWith('.')) return this.className.split(/\s+/).includes(selector.slice(1));
    return this.tagName === selector.toUpperCase();
  }

  closest(selector) {
    for (let node = this; node; node = node.parent) {
      if (node.matches(selector)) return node;
    }
    return null;
  }

  contains(node) {
    for (let current = node; current; current = current.parent) {
      if (current === this) return true;
    }
    return false;
  }

  querySelectorAll(selector) {
    const found = [];
    const walk = node => node.children.forEach(child => {
      if (child.matches(selector)) found.push(child);
      walk(child);
    });
    walk(this);
    return found;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

/**
 * Installs the fake document, Image and canvas. `pixels(size)` returns the
 * RGBA image that the "rasterized" preview has at that canvas size, and
 * images load once `imageGate()` resolves.
 */
function installDom(t, pixels, imageGate = () => Promise.resolve()) {
  const doc = { activeElement: null, rasterSizes: [] };
  doc.createElement = tag => {
    const element = new FakeElement(tag, doc);
    if (tag === 'canvas') {
      element.getContext = () => ({
        fillRect() {},
        drawImage() {},
        getImageData: (x, y, width) => {
          doc.rasterSizes.push(width);
          return pixels(width);
        }
      });
    }
    return element;
  };
  const ids = ['scan-badge', 'scan-badge-label', 'scan-warnings', 'scan-summary', 'scan-issues'];
  const elements = Object.fromEntries(ids.map(id => [id, doc.createElement(id === 'scan-issues' ? 'ul' : 'div')]));
  doc.getElementById = id => elements[id] || null;

  class FakeImage {
    set src(value) {
      this.url = value;
      imageGate().then(() => setTimeout(() => this.onload && this.onload(), 0));
    }

    decode() {
      return Promise.resolve();
    }
  }

  const saved = { document: globalThis.document, Image: globalThis.Image, Element: globalThis.Element, t: globalThis.t };
  globalThis.document = doc;
  globalThis.Image = FakeImage;
  globalThis.Element = FakeElement;
  globalThis.t = (key, vars) => (vars ? `${key} ${JSON.stringify(vars)}` : key);
  t.after(() => {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  });
  return { doc, elements };
}

/**
 * A fresh scan.js instance, so module state (the decoder, the badge) does not
 * leak between tests.
 */
function loadScan(t, { jsqr = true, ui = {} } = {}) {
  const saved = { jsQR: globalThis.jsQR, QRTurboUI: globalThis.QRTurboUI, QRTurboScan: globalThis.QRTurboScan };
  if (jsqr) globalThis.jsQR = jsQR;
  else delete globalThis.jsQR;
  const toasts = [];
  globalThis.QRTurboUI = {
    ASSET_VERSION_QUERY: '?v=test',
    loadScript: () => Promise.reject(new Error('offline')),
    toast(message, o) {
      toasts.push({ message, o });
      return { dismiss() {} };
    },
    ...ui
  };
  delete require.cache[SCAN_PATH];
  const scan = require(SCAN_PATH);
  t.after(() => {
    delete require.cache[SCAN_PATH];
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  });
  return { scan, toasts };
}

const matrices = new Map();
function matrixFor(payload) {
  if (!matrices.has(payload)) matrices.set(payload, qrMatrix(payload, 'M'));
  return matrices.get(payload);
}

/** An RGBA image of the payload's code with a 4-module quiet zone. */
function qrImage(payload, size) {
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  if (payload !== null) {
    const matrix = matrixFor(payload);
    const unit = Math.floor(size / (matrix.size + 8));
    const offset = Math.floor((size - (unit * matrix.size)) / 2);
    for (let row = 0; row < matrix.size; row += 1) {
      for (let col = 0; col < matrix.size; col += 1) {
        if (!matrix.isDark(row, col)) continue;
        for (let y = 0; y < unit; y += 1) {
          for (let x = 0; x < unit; x += 1) {
            const index = (((offset + (row * unit) + y) * size) + offset + (col * unit) + x) * 4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
          }
        }
      }
    }
  }
  return { width: size, height: size, data };
}

function defaultDesign(patch = {}) {
  return {
    fgColor: '#000000', bgColor: '#ffffff', transparentBackground: false, fill: 'solid', fgColor2: '#2563eb',
    gradientType: 'linear', gradientAngle: 45, customCorners: false, cornerOuterColor: '#000000',
    cornerInnerColor: '#000000', errorCorrection: 'auto', dotStyle: 'square', cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot', margin: 4, logo: null, logoSize: 0.4, logoPadding: 0.5, frameStyle: 'none',
    frameText: '', frameColor: '#000000', minVersion: 0, ...patch
  };
}

function snapshotFor(revision, { payload = PAYLOAD, design = defaultDesign(), frame = null } = {}) {
  const moduleCount = matrixFor(payload).size;
  const version = (moduleCount - 17) / 4;
  return Object.freeze({
    revision, tab: 'URLText', payload, design, ecl: 'M', eclAuto: true,
    analysis: { mode: 'byte', length: payload.length, version, modules: moduleCount, fits: true, maxAtLevel: 100 },
    version, moduleCount, quietZone: 4, frame, previewMarkup: MARKUP
  });
}

function fakeApp(snapshot = null) {
  const listeners = {};
  const state = {
    snapshot,
    design: defaultDesign(),
    exportOptions: {
      v: 1, format: 'png', pixelSize: 1024, customPixels: 1024,
      print: { enabled: false, unit: 'mm', width: 50, dpi: 300 }, page: 'fit', colorMode: 'rgb'
    },
    calls: [],
    scans: []
  };
  const app = {
    state,
    on(event, fn) {
      (listeners[event] ||= []).push(fn);
      return () => {};
    },
    emit(event, detail) {
      if (event === 'scan') state.scans.push(detail);
      (listeners[event] || []).forEach(fn => fn(detail));
    },
    getSnapshot: () => state.snapshot,
    getDesign: () => state.design,
    updateDesign(patch, o) {
      state.calls.push(['design', patch, o]);
      state.design = { ...state.design, ...patch };
    },
    getExportOptions: () => state.exportOptions,
    updateExportOptions(patch) {
      state.calls.push(['export', patch]);
      state.exportOptions = { ...state.exportOptions, ...patch, print: { ...state.exportOptions.print, ...(patch.print || {}) } };
      app.emit('export', { options: state.exportOptions });
    },
    /** Emits preview-start and preview-ready for a new ready snapshot. */
    ready(next) {
      app.emit('preview-start', { revision: next.revision });
      state.snapshot = next;
      app.emit('preview-ready', next);
    }
  };
  return app;
}

/**
 * Runs scan.js (its 400 ms delay and timeouts), the fake Image and the
 * decoder's idle wait on a fake clock until the test ends, so no test sleeps.
 */
function installClock(t) {
  const clock = createFakeClock();
  clock.install(t);
  return clock;
}

test('decode compares the decoded bytes with the expected payload', async t => {
  const { scan } = loadScan(t);
  const expected = new TextEncoder().encode(PAYLOAD);
  assert.equal(await scan.decode(qrImage(PAYLOAD, 200), expected), 'match');
  assert.equal(await scan.decode(qrImage('https://example.com', 200), expected), 'mismatch');
  assert.equal(await scan.decode(qrImage(null, 200), expected), 'none');
  assert.equal(await scan.decode(null, expected), 'none');
  assert.equal(await scan.available(), true);

  const unicode = 'Ääkköset 世界 😀';
  assert.equal(await scan.decode(qrImage(unicode, 240), new TextEncoder().encode(unicode)), 'match');
});

test('decode is unavailable when neither the worker nor jsQR can run', async t => {
  const { scan } = loadScan(t, { jsqr: false });
  assert.equal(await scan.decode(qrImage(PAYLOAD, 200), new Uint8Array(0)), 'unavailable');
  assert.equal(await scan.available(), false);
});

test('evaluate runs the rules with the frame share and the snapshot version', t => {
  const { scan } = loadScan(t);
  const layout = { framed: true, width: 1024, height: 1024, qr: { x: 133, y: 51, size: 758 } };
  const framed = snapshotFor(3, { frame: { layout } });
  const pdf = { v: 1, format: 'pdf', print: { enabled: false, unit: 'mm', width: 10, dpi: 300 } };
  const result = scan.evaluate(framed, pdf, 'pass');
  assert.equal(result.revision, 3);
  assert.equal(result.state, 'fail');
  assert.equal(result.verified, true);
  assert.deepEqual(result.issues.map(issue => issue.id), ['printTooSmall']);
  // 10 mm * 758 / 1024 spread over 25 + 8 modules.
  assert.ok(Math.abs(result.issues[0].vars.size - ((10 * 758 / 1024) / 33)) < 1e-12);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.issues) && Object.isFrozen(result.issues[0].fix));
});

test('run decodes at 4 px per module, retries at 8 and honours an AbortSignal', async t => {
  let large = false;
  const { doc } = installDom(t, size => qrImage(large || size >= 264 ? PAYLOAD : null, size));
  const { scan } = loadScan(t);
  const options = fakeApp().state.exportOptions;

  large = true;
  const pass = await scan.run(snapshotFor(1), options);
  assert.deepEqual([pass.decode, pass.state, pass.verified], ['pass', 'ok', true]);
  assert.deepEqual(doc.rasterSizes, [200]);

  // Only the 8 px retry (33 modules * 8 = 264 px) reads it.
  large = false;
  doc.rasterSizes.length = 0;
  const passLarge = await scan.run(snapshotFor(2), options);
  assert.deepEqual(doc.rasterSizes, [200, 264]);
  assert.deepEqual([passLarge.decode, passLarge.state], ['pass-large', 'warn']);
  assert.deepEqual(passLarge.issues.map(issue => issue.id), ['smallScanRisky']);

  // A code that decodes to other bytes is a failed scan.
  large = true;
  const other = await scan.run(snapshotFor(3, { payload: 'https://qrturbo.app/other' }), options);
  assert.deepEqual([other.decode, other.state, other.verified], ['fail', 'fail', false]);
  assert.deepEqual(other.issues.map(issue => issue.id), ['decodeFailed']);

  const controller = new AbortController();
  const pending = scan.run(snapshotFor(4), options, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('a snapshot that cannot be rasterized gives an unverified result', async t => {
  installDom(t, () => { throw new Error('tainted canvas'); });
  const { scan } = loadScan(t);
  const result = await scan.run(snapshotFor(1), fakeApp().state.exportOptions);
  assert.deepEqual([result.decode, result.state, result.verified], [null, 'ok', null]);
});

test('the badge follows the preview and its live label changes only with the state', async t => {
  const clock = installClock(t);
  const { elements } = installDom(t, size => qrImage(PAYLOAD, size));
  const { scan } = loadScan(t);
  const app = fakeApp();
  const badge = elements['scan-badge'];
  const label = elements['scan-badge-label'];
  scan.init(app);
  assert.equal(badge.hidden, true);

  app.ready(snapshotFor(1));
  assert.equal(badge.hidden, false);
  assert.equal(badge.classList.contains('is-checking'), true);
  assert.equal(label.textContent, 'scan.checking');

  await clock.runUntil(() => app.state.scans.length === 1);
  assert.equal(label.textContent, 'scan.ok');
  assert.equal(badge.dataset.state, 'ok');
  assert.equal(badge.classList.contains('is-checking'), false);
  assert.equal(elements['scan-summary'].textContent, 'scan.verified');
  const writes = label.textWrites;

  // The next ok result keeps the label (no live announcement), dimmed meanwhile.
  app.ready(snapshotFor(2));
  assert.equal(badge.classList.contains('is-checking'), true);
  await clock.runUntil(() => app.state.scans.length === 2);
  assert.equal(label.textWrites, writes);

  // The badge toggles the details.
  assert.equal(elements['scan-warnings'].hidden, true);
  badge.dispatch('click');
  assert.equal(badge.getAttribute('aria-expanded'), 'true');
  assert.equal(elements['scan-warnings'].hidden, false);
  // Escape closes the panel and is consumed, so the document handler does
  // not also dismiss the newest toast (the Undo of a fix just applied).
  let prevented = 0;
  const escape = { key: 'Escape', preventDefault: () => { prevented += 1; } };
  elements['scan-warnings'].dispatch('keydown', escape);
  assert.equal(elements['scan-warnings'].hidden, true);
  assert.equal(globalThis.document.activeElement, badge);
  assert.equal(prevented, 1);
  // With the panel closed, Escape is left to the toasts.
  badge.dispatch('keydown', escape);
  assert.equal(prevented, 1);

  app.emit('preview-empty', { reason: 'invalid', fieldId: 'qr-text' });
  assert.equal(badge.hidden, true);
  assert.equal(elements['scan-warnings'].hidden, true);
});

test('a result for a revision that a newer one replaced is dropped', async t => {
  const clock = installClock(t);
  let gate = Promise.resolve();
  let imagesStarted = 0;
  const { doc, elements } = installDom(t, size => qrImage(PAYLOAD, size), () => {
    imagesStarted += 1;
    return gate;
  });
  const { scan } = loadScan(t);
  const app = fakeApp();
  scan.init(app);

  // A newer revision starts before the 400 ms delay: that check never runs.
  app.ready(snapshotFor(1));
  await clock.advance(399);
  app.emit('preview-start', { revision: 2 });
  assert.deepEqual(clock.pending(), [], 'the waiting check is cancelled');
  await clock.advance(1000);
  assert.equal(imagesStarted, 0);
  assert.deepEqual(app.state.scans, []);

  // A check already in flight when a newer revision starts is dropped too.
  let release;
  gate = new Promise(resolve => { release = resolve; });
  const second = snapshotFor(2, { design: defaultDesign({ fgColor: '#ffffff', bgColor: '#102a43' }) });
  app.state.snapshot = second;
  app.emit('preview-ready', second);
  await clock.advance(400);
  assert.equal(imagesStarted, 1, 'the check is waiting for its image');
  app.emit('preview-start', { revision: 3 });
  release();
  await clock.advance(1000);
  assert.deepEqual(doc.rasterSizes, [200], 'the check finished drawing before it was dropped');
  assert.deepEqual(app.state.scans, []);
  assert.equal(elements['scan-badge'].classList.contains('is-checking'), true);

  gate = Promise.resolve();
  app.ready(snapshotFor(4, { design: second.design }));
  await clock.runUntil(() => app.state.scans.length === 1);
  assert.deepEqual(app.state.scans.map(result => result.revision), [4]);
  assert.equal(elements['scan-badge-label'].textContent, 'scan.tips');
  assert.ok(elements['scan-issues'].querySelectorAll('.fix-btn').every(button => button.getAttribute('aria-disabled') === null));

  // While a newer revision is pending, export changes wait for its check
  // and the fixes, computed for the older design, stay disabled.
  app.emit('preview-start', { revision: 5 });
  app.updateExportOptions({ format: 'pdf', print: { width: 10 } });
  assert.equal(app.state.scans.length, 1);
  assert.equal(elements['scan-badge'].classList.contains('is-checking'), true);
  assert.ok(elements['scan-issues'].querySelectorAll('.fix-btn').every(button => button.getAttribute('aria-disabled') === 'true'));
});

test('export changes re-run the rules without decoding again', async t => {
  const clock = installClock(t);
  const { doc, elements } = installDom(t, size => qrImage(PAYLOAD, size));
  const { scan } = loadScan(t);
  const app = fakeApp();
  scan.init(app);
  app.ready(snapshotFor(1));
  await clock.runUntil(() => app.state.scans.length === 1);
  const rasterized = doc.rasterSizes.length;

  app.updateExportOptions({ format: 'pdf', print: { width: 7 } });
  assert.equal(app.state.scans.length, 2);
  assert.equal(doc.rasterSizes.length, rasterized);
  const result = app.state.scans[1];
  assert.deepEqual([result.state, result.verified], ['fail', true]);
  assert.deepEqual(result.issues.map(issue => issue.id), ['printTooSmall']);
  assert.equal(elements['scan-badge-label'].textContent, 'scan.fail');

  // The print fix goes through updateExportOptions and clears the issue.
  const button = elements['scan-issues'].querySelector('.fix-btn');
  elements['scan-issues'].dispatch('click', { target: button });
  // 0.5 mm modules need 16.5 mm, a 2 cm code needs 26.4 mm: 27 mm.
  assert.deepEqual(app.state.calls.at(-1), ['export', { print: { width: 27 } }]);
  assert.equal(app.state.scans.at(-1).state, 'ok');
});

test('a design fix calls updateDesign with source fix and offers Undo', async t => {
  const clock = installClock(t);
  const { elements } = installDom(t, size => qrImage(PAYLOAD, size));
  const { scan, toasts } = loadScan(t);
  const app = fakeApp();
  app.state.design = defaultDesign({ fgColor: '#eeeeee' });
  scan.init(app);
  app.ready(snapshotFor(1, { design: app.state.design }));
  await clock.runUntil(() => app.state.scans.length === 1);
  assert.equal(elements['scan-badge-label'].textContent, 'scan.fail');

  const items = elements['scan-issues'].querySelectorAll('li');
  assert.deepEqual(items.map(item => item.dataset.issue), ['lowContrast']);
  const button = items[0].querySelector('.fix-btn');
  assert.equal(button.textContent, 'scan.fixBlack');

  // While a newer preview is pending the fix is disabled and does nothing.
  app.emit('preview-start', { revision: 2 });
  elements['scan-issues'].dispatch('click', { target: button });
  assert.equal(app.state.calls.length, 0);

  app.ready(snapshotFor(2, { design: app.state.design }));
  await clock.runUntil(() => app.state.scans.length === 2);
  const fresh = elements['scan-issues'].querySelector('.fix-btn');
  elements['scan-issues'].dispatch('click', { target: fresh });
  assert.deepEqual(app.state.calls[0], ['design', {
    fgColor: '#000000', bgColor: '#ffffff', fill: 'solid', customCorners: false, transparentBackground: false
  }, { source: 'fix' }]);

  assert.equal(toasts.length, 1);
  assert.equal(toasts[0].message, 'toast.applied {"what":"scan.fixBlack"}');
  assert.equal(toasts[0].o.actionLabel, 'actions.undo');
  toasts[0].o.onAction();
  assert.deepEqual(app.state.calls[1], ['design', {
    fgColor: '#eeeeee', bgColor: '#ffffff', fill: 'solid', customCorners: false, transparentBackground: false
  }, { source: 'undo' }]);
  // The payload never reaches a toast.
  assert.ok(!toasts.some(toast => toast.message.includes(PAYLOAD)));
});

test('when a rule fails although the test scan read the code, the issues come before the summary', async t => {
  const clock = installClock(t);
  const { elements } = installDom(t, size => qrImage(PAYLOAD, size));
  const panel = elements['scan-warnings'];
  const summary = elements['scan-summary'];
  const list = elements['scan-issues'];
  panel.appendChild(summary);
  panel.appendChild(list);
  const { scan } = loadScan(t);
  const app = fakeApp();
  scan.init(app);

  app.ready(snapshotFor(1));
  await clock.runUntil(() => app.state.scans.length === 1);
  assert.deepEqual(panel.children, [summary, list]);

  // 7 mm in a PDF: modules far below 0.25 mm fail, the decode still passed.
  app.updateExportOptions({ format: 'pdf', print: { width: 7 } });
  const result = app.state.scans.at(-1);
  assert.deepEqual([result.state, result.verified], ['fail', true]);
  assert.equal(elements['scan-badge-label'].textContent, 'scan.fail');
  assert.equal(summary.textContent, 'scan.verified');
  assert.deepEqual(panel.children, [list, summary]);

  // Back to an ok result, the summary opens the panel again.
  app.updateExportOptions({ print: { width: 50 } });
  assert.equal(app.state.scans.at(-1).state, 'ok');
  assert.deepEqual(panel.children, [summary, list]);
});
