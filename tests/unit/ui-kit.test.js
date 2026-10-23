const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { repoRoot } = require('../helpers/app-vm');

const kitPath = path.join(repoRoot, 'Public/js/ui/kit.js');
const kitSource = fs.readFileSync(kitPath, 'utf8');

// Runs kit.js in its own context with a minimal fake document, so the DOM
// helpers can be checked without a browser.
function loadKit({ lang = 'en', navigator = {}, withDocument = true, globals = {} } = {}) {
  const appended = [];
  const clicks = [];
  const revoked = [];
  const timers = [];

  const context = {
    console,
    Intl,
    Promise,
    currentLang: lang,
    navigator,
    setTimeout(fn, ms) {
      timers.push({ fn, ms });
      return timers.length;
    },
    clearTimeout() {},
    URL: {
      createObjectURL: () => 'blob:qrturbo-test',
      revokeObjectURL: url => revoked.push(url)
    },
    ...globals
  };

  if (withDocument) {
    context.document = {
      currentScript: { src: 'https://qrturbo.test/js/ui/kit.js?v=2.0.0' },
      documentElement: { getAttribute: () => lang },
      createElement(tag) {
        const element = {
          tagName: tag.toUpperCase(),
          removed: false,
          remove() {
            element.removed = true;
          },
          click() {
            clicks.push(element);
          },
          setAttribute() {}
        };
        return element;
      },
      head: { appendChild: element => appended.push(element) },
      body: { appendChild: element => appended.push(element) },
      getElementById: () => null
    };
  }

  vm.createContext(context);
  vm.runInContext(kitSource, context, { filename: kitPath });
  return { ui: context.QRTurboUI, appended, clicks, revoked, timers };
}

test('kit exposes the documented API as a frozen global', () => {
  const { ui } = loadKit();
  for (const name of ['init', 'toast', 'announce', 'disclosure', 'dropzone', 'loadScript', 'saveBlob',
    'copyText', 'formatNumber', 'formatLength', 'formatDistance']) {
    assert.equal(typeof ui[name], 'function', name);
  }
  assert.ok(Object.isFrozen(ui));
  assert.equal(ui.ASSET_VERSION_QUERY, '?v=2.0.0');
});

test('kit loads in Node without a document and its DOM helpers stay harmless', () => {
  const ui = require(kitPath);
  assert.equal(ui.ASSET_VERSION_QUERY, '');
  assert.doesNotThrow(() => ui.init());
  assert.doesNotThrow(() => ui.announce('Hello'));
  assert.doesNotThrow(() => ui.saveBlob(null, 'x.png'));
  const handle = ui.toast('Hello');
  assert.equal(typeof handle.dismiss, 'function');
  const disclosure = ui.disclosure(null, null);
  assert.equal(disclosure.isOpen(), false);
});

test('loadScript appends the versioned script once and shares the promise', async () => {
  const { ui, appended } = loadKit();
  const first = ui.loadScript('/js/lib/csv.js');
  const second = ui.loadScript('/js/lib/csv.js');
  assert.equal(first, second);
  assert.equal(appended.length, 1);
  assert.equal(appended[0].src, '/js/lib/csv.js?v=2.0.0');
  assert.equal(appended[0].async, true);
  appended[0].onload();
  await first;
});

test('a failed script load rejects, removes the tag and can be retried', async () => {
  const { ui, appended } = loadKit();
  const failing = ui.loadScript('/js/lib/zip.js');
  appended[0].onerror();
  await assert.rejects(failing, /zip\.js/);
  assert.equal(appended[0].removed, true);

  const retry = ui.loadScript('/js/lib/zip.js');
  assert.notEqual(retry, failing);
  assert.equal(appended.length, 2);
  appended[1].onload();
  await retry;
});

test('saveBlob clicks a download link and revokes the URL after 30 seconds', () => {
  const { ui, clicks, revoked, timers } = loadKit();
  ui.saveBlob({ size: 3 }, 'qrcode-url-example-1024px.png');

  assert.equal(clicks.length, 1);
  assert.equal(clicks[0].tagName, 'A');
  assert.equal(clicks[0].download, 'qrcode-url-example-1024px.png');
  assert.equal(clicks[0].href, 'blob:qrturbo-test');
  assert.equal(clicks[0].removed, true);

  const revoke = timers.find(timer => timer.ms === 30000);
  assert.ok(revoke, 'expected a 30 s revoke timer');
  assert.deepEqual(revoked, []);
  revoke.fn();
  assert.deepEqual(revoked, ['blob:qrturbo-test']);
});

test('copyText resolves true when the clipboard accepts the text', async () => {
  const written = [];
  const { ui } = loadKit({
    navigator: { clipboard: { writeText: text => { written.push(text); return Promise.resolve(); } } }
  });
  assert.equal(await ui.copyText('WIFI:S:Cafe;T:WPA;P:secret12;;'), true);
  assert.deepEqual(written, ['WIFI:S:Cafe;T:WPA;P:secret12;;']);
});

test('copyText resolves false when the browser refuses', async () => {
  const { ui } = loadKit({
    navigator: { clipboard: { writeText: () => Promise.reject(new Error('NotAllowedError')) } }
  });
  assert.equal(await ui.copyText('text'), false);

  const { ui: noClipboard } = loadKit({ navigator: {} });
  assert.equal(await noClipboard.copyText('text'), false);
});

test('copyText with a Promise starts the clipboard write at once (Safari user activation)', async () => {
  class FakeClipboardItem {
    constructor(items) {
      this.items = items;
    }
  }
  const writes = [];
  const texts = [];
  const { ui } = loadKit({
    globals: { ClipboardItem: FakeClipboardItem, Blob },
    navigator: {
      clipboard: {
        write: items => { writes.push(items); return items[0].items['text/plain'].then(() => undefined); },
        writeText: text => { texts.push(text); return Promise.resolve(); }
      }
    }
  });
  let resolveText;
  const pending = new Promise(resolve => { resolveText = resolve; });
  const job = ui.copyText(pending);
  // The write happened synchronously, before the text was known.
  assert.equal(writes.length, 1);
  resolveText('WIFI:S:Cafe;T:nopass;;');
  assert.equal(await job, true);
  const blob = await writes[0][0].items['text/plain'];
  assert.equal(await blob.text(), 'WIFI:S:Cafe;T:nopass;;');
  assert.deepEqual(texts, []);
});

test('copyText with a Promise falls back to writeText, and gives false without text', async () => {
  const texts = [];
  const writeText = text => { texts.push(text); return Promise.resolve(); };
  // No ClipboardItem: the text is written once it is known.
  const { ui } = loadKit({ navigator: { clipboard: { writeText } } });
  assert.equal(await ui.copyText(Promise.resolve('hello')), true);
  assert.deepEqual(texts, ['hello']);

  // A refused ClipboardItem write also falls back to writeText.
  class FakeClipboardItem {
    constructor(items) {
      this.items = items;
    }
  }
  const { ui: refusing } = loadKit({
    globals: { ClipboardItem: FakeClipboardItem, Blob },
    navigator: { clipboard: { write: () => Promise.reject(new Error('NotAllowedError')), writeText } }
  });
  assert.equal(await refusing.copyText(Promise.resolve('again')), true);
  assert.deepEqual(texts, ['hello', 'again']);

  // A Promise that gives no text copies nothing.
  assert.equal(await refusing.copyText(Promise.resolve(null)), false);
  assert.deepEqual(texts, ['hello', 'again']);
});

test('formatNumber follows the page language', () => {
  assert.equal(loadKit({ lang: 'en' }).ui.formatNumber(2331), '2,331');
  assert.equal(loadKit({ lang: 'de' }).ui.formatNumber(2331), '2.331');
  assert.equal(loadKit({ lang: 'en' }).ui.formatNumber(1.23456, 2), '1.23');
  assert.equal(loadKit({ lang: 'en' }).ui.formatNumber(Number.NaN), 'NaN');
  // The zh-hant page code maps to a valid Intl locale.
  assert.equal(loadKit({ lang: 'zh-hant' }).ui.formatNumber(1024), '1,024');
});

test('formatLength keeps more decimals for small sizes and never converts mm to m', () => {
  const { ui } = loadKit({ lang: 'en' });
  assert.equal(ui.formatLength(1.2195, 'metric'), '1.22 mm');
  assert.equal(ui.formatLength(12.34, 'metric'), '12.3 mm');
  assert.equal(ui.formatLength(50, 'metric'), '50 mm');
  assert.equal(ui.formatLength(2000, 'metric'), '2,000 mm');
  assert.equal(ui.formatLength(50.8, 'imperial'), '2 in');
  assert.equal(ui.formatLength(1.2195, 'imperial'), '0.048 in');
  assert.equal(ui.formatLength(2032, 'imperial'), '80 in');
});

test('formatDistance switches between cm and m, and inches and feet', () => {
  const { ui } = loadKit({ lang: 'en' });
  assert.equal(ui.formatDistance(60, 'metric'), '6 cm');
  assert.equal(ui.formatDistance(500, 'metric'), '50 cm');
  assert.equal(ui.formatDistance(2500, 'metric'), '2.5 m');
  assert.equal(ui.formatDistance(12195, 'metric'), '12 m');
  assert.equal(ui.formatDistance(500, 'imperial'), '20 in');
  assert.equal(ui.formatDistance(1524, 'imperial'), '5 ft');
});

test('lengths use the decimal separator of the page language', () => {
  const { ui } = loadKit({ lang: 'fi' });
  assert.equal(ui.formatLength(1.2195, 'metric'), '1,22 mm');
  assert.equal(ui.formatDistance(2500, 'metric'), '2,5 m');
});

// A small DOM for the toast, clipboard and drop zone tests: elements with
// attributes, listeners, children and focus, a fake clock and timers.
function createDom() {
  const timers = new Map();
  let nextTimer = 1;
  const clock = { now: 0 };
  const documentListeners = {};

  class FakeElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase();
      this.children = [];
      this.parentNode = null;
      this.attributes = {};
      this.listeners = {};
      this.dataset = {};
      this.style = {};
      this.hidden = false;
      this.hovered = false;
      this.textContent = '';
      this.value = '';
      this.focusOptions = null;
      const classes = new Set();
      this.classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        toggle: (name, force) => {
          const on = force === undefined ? !classes.has(name) : Boolean(force);
          if (on) classes.add(name); else classes.delete(name);
          return on;
        },
        contains: name => classes.has(name)
      };
    }

    set className(value) {
      String(value).split(/\s+/).filter(Boolean).forEach(name => this.classList.add(name));
    }

    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return name in this.attributes ? this.attributes[name] : null; }
    hasAttribute(name) { return name in this.attributes; }
    removeAttribute(name) { delete this.attributes[name]; }

    appendChild(child) {
      child.remove();
      child.parentNode = this;
      this.children.push(child);
      return child;
    }

    remove() {
      if (!this.parentNode) return;
      const siblings = this.parentNode.children;
      siblings.splice(siblings.indexOf(this), 1);
      this.parentNode = null;
    }

    get isConnected() {
      let node = this;
      while (node.parentNode) node = node.parentNode;
      return node === document.documentElement;
    }

    contains(other) {
      for (let node = other; node; node = node.parentNode) {
        if (node === this) return true;
      }
      return false;
    }

    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }

    dispatch(type, init = {}) {
      const event = {
        type,
        target: this,
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() {},
        ...init
      };
      for (let node = this; node; node = node.parentNode) {
        (node.listeners[type] || []).forEach(fn => fn(event));
      }
      (documentListeners[type] || []).forEach(fn => fn(event));
      return event;
    }

    matches(selector) {
      if (selector === ':hover') return this.hovered;
      if (selector === ':modal') return this.tagName === 'DIALOG' && this.hasAttribute('open');
      return false;
    }

    closest() { return null; }
    querySelectorAll() { return []; }

    focus(options) {
      const previous = document.activeElement;
      this.focusOptions = options || null;
      document.activeElement = this;
      if (previous !== this) {
        previous?.dispatch?.('focusout', { relatedTarget: this });
        this.dispatch('focusin', { relatedTarget: previous });
      }
    }

    blur() {
      if (document.activeElement === this) document.activeElement = document.body;
    }

    select() {}
    setSelectionRange() {}
  }

  const document = {
    documentElement: new FakeElement('html'),
    head: new FakeElement('head'),
    body: new FakeElement('body'),
    activeElement: null,
    copied: null,
    currentScript: { src: 'https://qrturbo.test/js/ui/kit.js?v=2.0.0' },
    createElement: tag => new FakeElement(tag),
    createElementNS: (ns, tag) => new FakeElement(tag),
    getElementById(id) {
      const walk = node => {
        if (node.attributes.id === id || node.id === id) return node;
        for (const child of node.children) {
          const found = walk(child);
          if (found) return found;
        }
        return null;
      };
      return walk(document.documentElement);
    },
    querySelectorAll(selector) {
      if (selector !== 'dialog[open]') return [];
      const found = [];
      const walk = node => {
        if (node.tagName === 'DIALOG' && node.hasAttribute('open')) found.push(node);
        node.children.forEach(walk);
      };
      walk(document.documentElement);
      return found;
    },
    addEventListener(type, fn) { (documentListeners[type] ||= []).push(fn); },
    execCommand(command) {
      if (command !== 'copy' || document.activeElement?.tagName !== 'TEXTAREA') return false;
      document.copied = document.activeElement.value;
      return true;
    }
  };
  document.documentElement.appendChild(document.head);
  document.documentElement.appendChild(document.body);
  document.activeElement = document.body;

  const region = new FakeElement('div');
  region.id = 'toast-region';
  document.body.appendChild(region);

  const context = {
    console,
    Intl,
    Promise,
    currentLang: 'en',
    navigator: {},
    document,
    Date: { now: () => clock.now },
    setTimeout(fn, ms) {
      const id = nextTimer++;
      timers.set(id, { fn, ms, at: clock.now + ms });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    matchMedia: () => ({ matches: false }),
    t: key => key
  };
  vm.createContext(context);
  vm.runInContext(kitSource, context, { filename: kitPath });

  // Runs every timer that is due by `ms` from now, in order.
  function advance(ms) {
    const target = clock.now + ms;
    for (;;) {
      const due = [...timers.entries()].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      clock.now = Math.max(clock.now, due[1].at);
      due[1].fn();
    }
    clock.now = target;
  }

  return { ui: context.QRTurboUI, document, region, timers, clock, advance, FakeElement, documentListeners };
}

const liveToasts = region => region.children.filter(child => !child.classList.contains('is-leaving'));

test('toasts close after 6 s, errors after 10 s and toasts with an action after 8 s', () => {
  const { ui, region, advance } = createDom();
  ui.toast('Info');
  ui.toast('Problem', { tone: 'error' });
  ui.toast('Design reset.', { actionLabel: 'Undo', onAction() {} });
  assert.equal(liveToasts(region).length, 3);

  advance(5999);
  assert.equal(liveToasts(region).length, 3);
  advance(1);
  assert.deepEqual(liveToasts(region).map(el => el.children[0].textContent), ['Problem', 'Design reset.']);
  advance(2000);
  assert.deepEqual(liveToasts(region).map(el => el.children[0].textContent), ['Problem']);
  advance(2000);
  assert.equal(liveToasts(region).length, 0);
});

test('a hovered toast pauses and resumes with the time it had left', () => {
  const { ui, region, advance } = createDom();
  ui.toast('Text copied.');
  const element = region.children[0];
  advance(2000);
  element.hovered = true;
  element.dispatch('mouseenter');
  advance(30000);
  assert.equal(liveToasts(region).length, 1);
  element.hovered = false;
  element.dispatch('mouseleave');
  advance(3999);
  assert.equal(liveToasts(region).length, 1);
  advance(1);
  assert.equal(liveToasts(region).length, 0);
});

test('a toast without a timeout stays after a hover until it is dismissed', () => {
  const { ui, region, advance, timers } = createDom();
  const handle = ui.toast('Stays', { timeoutMs: 0 });
  const element = region.children[0];
  element.hovered = true;
  element.dispatch('mouseenter');
  element.hovered = false;
  element.dispatch('mouseleave');
  advance(60000);
  assert.equal(liveToasts(region).length, 1);
  assert.equal(timers.size, 0);
  handle.dismiss();
  assert.equal(liveToasts(region).length, 0);
});

test('at most three toasts are shown and a repeated message replaces the old one', () => {
  const { ui, region } = createDom();
  ui.toast('One');
  ui.toast('Two');
  ui.toast('One');
  assert.deepEqual(liveToasts(region).map(el => el.children[0].textContent), ['Two', 'One']);
  ui.toast('Three');
  ui.toast('Four');
  assert.deepEqual(liveToasts(region).map(el => el.children[0].textContent), ['One', 'Three', 'Four']);
});

test('toasts never take focus, and Esc closes the newest one', () => {
  const { ui, document, region } = createDom();
  ui.init();
  const field = document.createElement('input');
  document.body.appendChild(field);
  field.focus();
  ui.toast('First');
  ui.toast('Second', { actionLabel: 'Undo', onAction() {} });
  assert.equal(document.activeElement, field);

  field.dispatch('keydown', { key: 'Escape' });
  assert.deepEqual(liveToasts(region).map(el => el.children[0].textContent), ['First']);
  assert.equal(document.activeElement, field);
});

test('the Undo action dismisses the toast first and gives focus back', () => {
  const { ui, document, region } = createDom();
  const field = document.createElement('input');
  document.body.appendChild(field);
  field.focus();
  let undone = 0;
  ui.toast('Design reset.', { actionLabel: 'Undo', onAction: () => { undone += 1; } });
  const action = region.children[0].children.find(child => child.classList.contains('toast-action'));
  action.focus();
  action.dispatch('click');
  assert.equal(undone, 1);
  assert.equal(liveToasts(region).length, 0);
  assert.equal(document.activeElement, field);
});

test('the copy fallback selects a fixed, hidden field and never scrolls the page', async () => {
  const { ui, document } = createDom();
  const button = document.createElement('button');
  document.body.appendChild(button);
  button.focus();
  let helper = null;
  const createElement = document.createElement;
  document.createElement = tag => {
    const element = createElement(tag);
    if (tag === 'textarea') helper = element;
    return element;
  };

  assert.equal(await ui.copyText('WIFI:S:Cafe;T:nopass;;'), true);
  assert.equal(document.copied, 'WIFI:S:Cafe;T:nopass;;');
  assert.equal(helper.style.position, 'fixed');
  assert.deepEqual({ ...helper.focusOptions }, { preventScroll: true });
  assert.equal(helper.isConnected, false);
  assert.equal(document.activeElement, button);
});

test('a pasted image reaches one drop zone and never one behind a modal dialog', () => {
  const { ui, document, FakeElement } = createDom();
  const logoZone = new FakeElement('div');
  const otherZone = new FakeElement('div');
  document.body.appendChild(logoZone);
  document.body.appendChild(otherZone);
  const received = [];
  ui.dropzone(logoZone, { paste: true, onFiles: files => received.push(['logo', files.length]) });
  ui.dropzone(otherZone, { paste: true, onFiles: files => received.push(['other', files.length]) });

  const file = { name: 'logo.png', type: 'image/png' };
  const paste = () => document.body.dispatch('paste', {
    clipboardData: { items: [{ kind: 'file', getAsFile: () => file }] }
  });

  const first = paste();
  assert.equal(first.defaultPrevented, true);
  assert.deepEqual(received, [['logo', 1]]);

  const dialog = new FakeElement('dialog');
  dialog.setAttribute('open', '');
  document.body.appendChild(dialog);
  dialog.appendChild(otherZone);
  received.length = 0;
  paste();
  assert.deepEqual(received, [['other', 1]]);

  dialog.removeAttribute('open');
  received.length = 0;
  const field = document.createElement('textarea');
  document.body.appendChild(field);
  field.focus();
  paste();
  assert.deepEqual(received, [], 'a paste into a text field stays in the field');
});
