const assert = require('node:assert/strict');
const test = require('node:test');

const { getNestedValue, loadTranslations } = require('../helpers/app-vm');

// export.js reaches t(), QRTurboUI, QRTurboRules and QRTurboExport through
// globalThis, as it does in the browser.
const english = loadTranslations().en;
globalThis.t = (key, vars = {}) => {
  const value = getNestedValue(english, key);
  if (typeof value !== 'string') return key;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => (vars[name] ?? ''));
};
require('../../Public/js/ui/kit.js');
require('../../Public/js/lib/color.js');
require('../../Public/js/lib/rules.js');
const ExportUI = require('../../Public/js/ui/export.js');

const EXPORT_UI_PATH = require.resolve('../../Public/js/ui/export.js');
const { fieldLayout, checkWidth, checkPixels, localizeNote } = ExportUI.helpers;

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

test('the module exposes init and the pure helpers, and init is safe without a page', () => {
  assert.equal(typeof ExportUI.init, 'function');
  assert.ok(Object.isFrozen(ExportUI));
  assert.ok(Object.isFrozen(ExportUI.helpers));
  assert.doesNotThrow(() => ExportUI.init(null));
  assert.doesNotThrow(() => ExportUI.init({ on() {} }));
});

test('PNG in pixel mode shows the size select and the print toggle', () => {
  assert.deepEqual(fieldLayout(options()), {
    pixelSize: true,
    sizeLocked: false,
    customSize: false,
    vectorNote: false,
    printToggle: true,
    printSize: false,
    dpi: false,
    page: false,
    colorMode: false,
    printMode: false,
    moreFormats: false
  });
});

test('PNG and JPG in print mode lock the pixel size and show width, unit and dpi', () => {
  for (const format of ['png', 'jpg']) {
    const layout = fieldLayout(options({ format, pixelSize: 'custom', print: { enabled: true } }));
    assert.equal(layout.sizeLocked, true, format);
    assert.equal(layout.customSize, false, format);
    assert.equal(layout.printSize, true, format);
    assert.equal(layout.dpi, true, format);
    assert.equal(layout.printMode, true, format);
  }
  assert.equal(fieldLayout(options({ format: 'jpg' })).moreFormats, true);
});

test('WebP has no print size, even when print sizing is remembered', () => {
  const layout = fieldLayout(options({ format: 'webp', pixelSize: 'custom', print: { enabled: true } }));
  assert.equal(layout.printToggle, false);
  assert.equal(layout.printSize, false);
  assert.equal(layout.sizeLocked, false);
  assert.equal(layout.customSize, true);
  assert.equal(layout.moreFormats, true);
});

test('SVG is vector: no pixel size, an optional print width without dpi', () => {
  const plain = fieldLayout(options({ format: 'svg' }));
  assert.equal(plain.pixelSize, false);
  assert.equal(plain.vectorNote, true);
  assert.equal(plain.printToggle, true);
  assert.equal(plain.printSize, false);

  const printed = fieldLayout(options({ format: 'svg', print: { enabled: true } }));
  assert.equal(printed.printSize, true);
  assert.equal(printed.dpi, false);
});

test('PDF and EPS are always print-sized; only PDF has a page choice', () => {
  const pdf = fieldLayout(options({ format: 'pdf' }));
  assert.equal(pdf.printToggle, false);
  assert.equal(pdf.printSize, true);
  assert.equal(pdf.page, true);
  assert.equal(pdf.colorMode, true);
  assert.equal(pdf.dpi, false);

  const eps = fieldLayout(options({ format: 'eps' }));
  assert.equal(eps.printSize, true);
  assert.equal(eps.page, false);
  assert.equal(eps.colorMode, true);
  assert.equal(eps.moreFormats, true);
});

test('print widths are limited to 10-2000 mm or 0.4-80 in', () => {
  assert.equal(checkWidth(50, 'mm'), 50);
  assert.equal(checkWidth(10, 'mm'), 10);
  assert.equal(checkWidth(2000, 'mm'), 2000);
  assert.equal(checkWidth(9.9, 'mm'), null);
  assert.equal(checkWidth(2000.1, 'mm'), null);
  assert.equal(checkWidth(0.4, 'in'), 0.4);
  assert.equal(checkWidth(80, 'in'), 80);
  assert.equal(checkWidth(81, 'in'), null);
  assert.equal(checkWidth(Number.NaN, 'mm'), null);
  assert.equal(checkWidth('', 'mm'), null);
  assert.equal(checkWidth(50, 'cm'), null);
});

test('custom pixel sizes are whole numbers from 128 to 4096', () => {
  assert.equal(checkPixels(128), 128);
  assert.equal(checkPixels(4096), 4096);
  assert.equal(checkPixels(127), null);
  assert.equal(checkPixels(4097), null);
  assert.equal(checkPixels(800.5), null);
  assert.equal(checkPixels(Number.NaN), null);
});

test('notes from the exporter may be text, i18n keys or { key, vars }', () => {
  assert.equal(localizeNote('output.pageTooSmall'), english.output.pageTooSmall);
  assert.equal(localizeNote({ key: 'toast.saved', vars: { filename: 'a.png' } }), 'Saved a.png');
  assert.equal(localizeNote('Already translated.'), 'Already translated.');
  assert.equal(localizeNote(''), '');
  assert.equal(localizeNote(null), '');
});

// --- The panel itself, on a small fake DOM: just what export.js touches ---

const FORMATS = ['png', 'svg', 'pdf', 'jpg', 'webp', 'eps'];

class FakeNode {
  constructor(doc, id = '', tagName = 'div') {
    this.ownerDocument = doc;
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.listeners = {};
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.checked = false;
    this.value = '';
    this.textContent = '';
    this.children = [];
    const classes = new Set();
    this.classList = {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      toggle: (name, force) => {
        const on = force === undefined ? !classes.has(name) : Boolean(force);
        if (on) classes.add(name);
        else classes.delete(name);
        return on;
      },
      contains: name => classes.has(name)
    };
  }

  get valueAsNumber() { return Number.parseFloat(this.value); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  focus() { this.ownerDocument.activeElement = this; }
  scrollIntoView() {}
  closest() { return null; }
  contains(node) { return node === this; }
  replaceChildren(...nodes) { this.children = nodes; }

  /** Runs the listeners like a user event and waits for async handlers. */
  fire(type) {
    return Promise.all((this.listeners[type] || []).map(fn => fn({ type, target: this, currentTarget: this })));
  }
}

/**
 * Installs the fake document and a fresh export.js. `exporter` replaces
 * parts of the QRTurboExport stand-in; files, copies and toasts are recorded.
 */
function loadPanel(t, exporter = {}) {
  const doc = { activeElement: null };
  const nodes = new Map();
  doc.getElementById = id => {
    if (!nodes.has(id)) nodes.set(id, new FakeNode(doc, id));
    return nodes.get(id);
  };
  doc.createElement = tag => new FakeNode(doc, '', tag);
  doc.addEventListener = () => {};
  doc.body = new FakeNode(doc, 'body');
  const groups = {
    'qr-format': FORMATS.map(format => Object.assign(doc.getElementById(`format-${format}`), { value: format })),
    'print-unit': ['mm', 'in'].map(unit => Object.assign(doc.getElementById(`print-unit-${unit}`), { value: unit }))
  };
  doc.querySelectorAll = selector => {
    const match = /^input\[name="([\w-]+)"\]$/.exec(selector);
    return match && groups[match[1]] ? groups[match[1]] : [];
  };

  const record = { files: [], exported: [], copies: [], toasts: [] };
  const kit = globalThis.QRTurboUI;
  const saved = { document: globalThis.document, window: globalThis.window, QRTurboUI: kit, QRTurboExport: globalThis.QRTurboExport };
  globalThis.document = doc;
  globalThis.window = { print() {} };
  globalThis.QRTurboUI = {
    ...kit,
    saveBlob: (blob, filename) => record.files.push(filename),
    announce() {},
    toast: message => {
      record.toasts.push(message);
      return { dismiss() {} };
    }
  };
  globalThis.QRTurboExport = {
    describe: options => ({ label: `Download ${options.format}`, summary: '', notes: [], printInfo: null }),
    capabilities: async () => ({ webp: true, clipboardImage: true, clipboardText: true, shareFiles: false }),
    exportFile: async (snapshot, options) => {
      record.exported.push({ snapshot, format: options.format });
      return { blob: new Blob(['file']), filename: `qrcode.${options.format}`, notes: [] };
    },
    copy: source => {
      record.copies.push(source);
      return Promise.resolve(source).then(value => (value ? 'image' : Promise.reject(new Error('no code'))));
    },
    prepareShare() {},
    ...exporter
  };
  delete require.cache[EXPORT_UI_PATH];
  const panel = require(EXPORT_UI_PATH);
  t.after(() => {
    delete require.cache[EXPORT_UI_PATH];
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  });
  return { panel, doc, record };
}

/**
 * An app stand-in. The stage starts in `stage`; whenReady() makes the code
 * ready, as the controller does once the pending revision is rendered.
 * revealErrors() says whether a problem was shown.
 */
function panelApp(doc, { stage = 'ready', format = 'png', problem = false } = {}) {
  const listeners = {};
  const snapshot = Object.freeze({ revision: 2, payload: 'https://example.com/hello', isSensitive: false, design: {} });
  const stageNode = doc.getElementById('qr-stage');
  stageNode.dataset.state = stage;
  const state = {
    options: options({ format }),
    snapshot: stage === 'ready' ? snapshot : null,
    updates: [],
    reveals: 0,
    waits: 0
  };
  const app = {
    state,
    snapshot,
    on(event, fn) {
      (listeners[event] ||= []).push(fn);
      return () => {};
    },
    emit(event, detail) {
      (listeners[event] || []).forEach(fn => fn(detail));
    },
    getExportOptions: () => state.options,
    updateExportOptions(patch) {
      state.updates.push(patch);
      const print = { ...state.options.print, ...(patch.print || {}) };
      // The controller converts a bare unit change, rounded to 0.01 in or 0.1 mm.
      if (patch.print && patch.print.unit && patch.print.width === undefined) {
        print.width = patch.print.unit === 'in'
          ? Math.round((state.options.print.width / 25.4) * 100) / 100
          : Math.round(state.options.print.width * 25.4 * 10) / 10;
      }
      state.options = { ...state.options, ...patch, print };
      app.emit('export', { options: state.options });
    },
    getSnapshot: () => state.snapshot,
    whenReady: async () => {
      state.waits += 1;
      if (!problem) {
        stageNode.dataset.state = 'ready';
        state.snapshot = snapshot;
      }
      return state.snapshot;
    },
    revealErrors: () => {
      state.reveals += 1;
      return problem;
    }
  };
  return app;
}

test('init restores nothing on its own: the controller owns the saved options and their locale default', async t => {
  const { panel, doc } = loadPanel(t);
  const app = panelApp(doc);
  panel.init(app);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(app.state.updates, []);
});

test('a download clicked before the first code is ready waits for it instead of being dropped', async t => {
  for (const stage of ['empty', 'invalid', 'tooLong', 'error']) {
    const { panel, doc, record } = loadPanel(t);
    const app = panelApp(doc, { stage });
    panel.init(app);

    await doc.getElementById('download-btn').fire('click');
    assert.equal(app.state.reveals, 1, stage);
    assert.equal(app.state.waits, 1, stage);
    assert.deepEqual(record.exported, [{ snapshot: app.snapshot, format: 'png' }], stage);
    assert.deepEqual(record.files, ['qrcode.png'], stage);
  }
});

test('a download with a real problem shows it and builds no file', async t => {
  const { panel, doc, record } = loadPanel(t);
  const app = panelApp(doc, { stage: 'invalid', problem: true });
  panel.init(app);

  await doc.getElementById('download-btn').fire('click');
  await doc.getElementById('print-btn').fire('click');
  assert.equal(app.state.reveals, 2);
  assert.equal(app.state.waits, 0);
  assert.deepEqual(record.exported, []);
  assert.deepEqual(record.files, []);
});

test('copy before the first code is ready hands the exporter the coming snapshot, inside the click', async t => {
  const { panel, doc, record } = loadPanel(t);
  const app = panelApp(doc, { stage: 'empty' });
  panel.init(app);

  doc.getElementById('copy-btn').fire('click');
  assert.equal(record.copies.length, 1, 'the clipboard write starts at once');
  assert.equal(await record.copies[0], app.snapshot);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(record.toasts, [english.toast.imageCopied]);
});

test('a chosen JPG, WebP or EPS keeps "More formats" open and its toggle disabled', async t => {
  const { panel, doc } = loadPanel(t);
  const app = panelApp(doc);
  panel.init(app);
  const toggle = doc.getElementById('more-formats-toggle');
  const more = doc.getElementById('more-formats');
  assert.equal(toggle.disabled, false);
  assert.equal(more.hidden, true);

  for (const format of ['jpg', 'webp', 'eps']) {
    app.updateExportOptions({ format });
    assert.equal(toggle.getAttribute('aria-expanded'), 'true', format);
    assert.equal(more.hidden, false, format);
    assert.equal(toggle.disabled, true, format);
    assert.equal(doc.getElementById(`format-${format}`).checked, true, format);
  }

  // Back on PNG the row may be collapsed again; it stays open until then.
  app.updateExportOptions({ format: 'png' });
  assert.equal(toggle.disabled, false);
  assert.equal(more.hidden, false);
  await toggle.fire('click');
  assert.equal(more.hidden, true);
});

test('a restored EPS opens "More formats" with the toggle disabled', t => {
  const { panel, doc } = loadPanel(t);
  panel.init(panelApp(doc, { format: 'eps' }));
  assert.equal(doc.getElementById('more-formats').hidden, false);
  assert.equal(doc.getElementById('more-formats-toggle').disabled, true);
});

test('a unit switch lets the controller convert, and switching back unedited restores the exact width', t => {
  const { panel, doc } = loadPanel(t);
  const app = panelApp(doc, { format: 'pdf' });
  app.state.options = options({ format: 'pdf', print: { width: 60 } });
  panel.init(app);
  const select = unit => {
    doc.getElementById(`print-unit-${unit}`).checked = true;
    doc.getElementById(`print-unit-${unit === 'mm' ? 'in' : 'mm'}`).checked = false;
    doc.getElementById(`print-unit-${unit}`).fire('change');
  };

  select('in');
  assert.deepEqual(app.state.updates.at(-1), { print: { unit: 'in' } });
  assert.equal(app.state.options.print.width, 2.36);

  select('mm');
  assert.deepEqual(app.state.updates.at(-1), { print: { unit: 'mm', width: 60 } });
  assert.equal(app.state.options.print.width, 60);
});
