const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppHarness } = require('../helpers/app-vm');

// A horizontally scrolling tab row, 375 px wide, with the phone padding
// (--panel-pad: 18px) that is also the width of its edge fades.
function tabRow({ padding = '18px', scrollPadding = padding, computedStyle = true } = {}) {
  const scrolls = [];
  const row = {
    scrollWidth: 900,
    clientWidth: 375,
    scrollLeft: 0,
    getBoundingClientRect: () => ({ left: 0, right: 375, width: 375 }),
    scrollBy(options) {
      // Copied into this realm: app.js runs in its own VM context.
      scrolls.push({ ...options });
    }
  };
  const style = { paddingLeft: padding, paddingRight: padding, scrollPaddingLeft: scrollPadding, scrollPaddingRight: scrollPadding };
  return { row, scrolls, getComputedStyle: computedStyle ? () => style : undefined };
}

function chip(row, left, width = 110) {
  return { parentElement: row, getBoundingClientRect: () => ({ left, right: left + width, width }) };
}

function harnessWithRow(options) {
  const app = createAppHarness();
  const setup = tabRow(options);
  app.context.window.getComputedStyle = setup.getComputedStyle;
  app.context.window.matchMedia = () => ({ matches: false });
  return { app, ...setup };
}

test('the active tab chip is scrolled clear of the edge fade, not to 8 px from the edge', () => {
  const { app, row, scrolls } = harnessWithRow();
  const scroll = app.context.scrollTabChipIntoView;

  // Partly inside the right fade: the chip ends 18 px from the right edge.
  scroll(chip(row, 260), true);
  assert.deepEqual(scrolls.pop(), { left: 260 + 110 - (375 - 18), behavior: 'smooth' });

  // Off the left edge: the chip starts 18 px from the left edge.
  scroll(chip(row, -60), true);
  assert.deepEqual(scrolls.pop(), { left: -60 - 18, behavior: 'smooth' });

  // Visible but inside the left fade (8 px from the edge) still scrolls.
  scroll(chip(row, 8), false);
  assert.deepEqual(scrolls.pop(), { left: -10, behavior: 'auto' });

  // A chip that already has the clearance stays put.
  scroll(chip(row, 18), true);
  scroll(chip(row, 375 - 18 - 110), true);
  assert.equal(scrolls.length, 0);
});

test('the chip scroll ends on a chip start, where the row snaps', () => {
  const { app, row, scrolls } = harnessWithRow();
  row.children = [-200, -80, 40, 160, 280].map(left => chip(row, left));
  const scroll = app.context.scrollTabChipIntoView;

  // The last chip ends 15 px past the right fade: the first chip start
  // that shows it all is the chip at 160 (offset 142 from the padding).
  scroll(row.children[4], true);
  assert.deepEqual(scrolls.pop(), { left: 160 - 18, behavior: 'smooth' });

  // A chip off the left edge goes to its own start.
  scroll(row.children[1], true);
  assert.deepEqual(scrolls.pop(), { left: -80 - 18, behavior: 'smooth' });

  // When no earlier chip start shows it, the chip's own start is used.
  const last = chip(row, 300, 70);
  row.children = [chip(row, -50), chip(row, 5), last];
  scroll(last, false);
  assert.deepEqual(scrolls.pop(), { left: 300 - 18, behavior: 'auto' });
});

test('the chip clearance follows the row padding or scroll padding, with a 16 px fallback', () => {
  const desktopPad = harnessWithRow({ padding: '24px' });
  desktopPad.app.context.scrollTabChipIntoView(chip(desktopPad.row, 300), true);
  assert.equal(desktopPad.scrolls[0].left, 300 + 110 - (375 - 24));

  const scrollPad = harnessWithRow({ padding: '0px', scrollPadding: '20px' });
  scrollPad.app.context.scrollTabChipIntoView(chip(scrollPad.row, 0), true);
  assert.equal(scrollPad.scrolls[0].left, -20);

  const noStyle = harnessWithRow({ computedStyle: false });
  noStyle.app.context.scrollTabChipIntoView(chip(noStyle.row, 0), true);
  assert.equal(noStyle.scrolls[0].left, -16);
});

test('the chip scroll is instant with reduced motion and skipped for a row that does not scroll', () => {
  const { app, row, scrolls } = harnessWithRow();
  app.context.window.matchMedia = query => ({ matches: query === '(prefers-reduced-motion: reduce)' });
  app.context.scrollTabChipIntoView(chip(row, 300), true);
  assert.equal(scrolls[0].behavior, 'auto');

  row.scrollWidth = 375;
  app.context.scrollTabChipIntoView(chip(row, 300), true);
  assert.equal(scrolls.length, 1);
  assert.doesNotThrow(() => app.context.scrollTabChipIntoView(null, true));
});

test('getOpaqueImageDataFromBlob releases its canvas after reading the pixels', async () => {
  const app = createAppHarness();
  const pixels = { width: 3, height: 2, data: new Uint8ClampedArray(24) };
  const ops = [];
  const canvas = {
    width: 300,
    height: 150,
    getContext: () => ({
      set fillStyle(value) { ops.push(['fillStyle', value]); },
      fillRect: (...args) => ops.push(['fillRect', ...args]),
      drawImage: (image, ...args) => ops.push(['drawImage', ...args]),
      getImageData: (...args) => {
        ops.push(['getImageData', ...args, canvas.width, canvas.height]);
        return pixels;
      }
    })
  };
  app.context.document.createElement = () => canvas;
  app.context.blobToDataURL = async () => 'data:image/png;base64,AAAA';
  app.context.loadImageFromDataURL = async () => ({ naturalWidth: 3, naturalHeight: 2 });

  const result = await app.context.getOpaqueImageDataFromBlob(new Blob([]));
  assert.equal(result, pixels);
  assert.deepEqual(ops.at(-1), ['getImageData', 0, 0, 3, 2, 3, 2]);
  assert.deepEqual(ops[0], ['fillStyle', '#ffffff']);
  assert.equal(canvas.width, 0);
  assert.equal(canvas.height, 0);

  // A canvas that fails to draw is released too.
  const broken = { width: 300, height: 150, getContext: () => ({ fillRect() { throw new Error('lost'); } }) };
  app.context.document.createElement = () => broken;
  await assert.rejects(app.context.getOpaqueImageDataFromBlob(new Blob([])), /lost/);
  assert.equal(broken.width, 0);
});

test('a batch mode that fails to open shows the batchLoadFailed toast', async () => {
  const app = createAppHarness();
  const button = app.getElement('batch-open-btn');
  let onClick = null;
  button.addEventListener = (type, handler) => {
    if (type === 'click') onClick = handler;
  };
  const toasts = [];
  const errors = [];
  app.context.QRTurboUI = { toast: (message, options) => toasts.push({ message, options: { ...options } }) };
  app.context.console = { ...console, error: (...args) => errors.push(args) };

  app.context.initBatchButton({ openBatch: () => Promise.reject(new Error('csv.js failed to load')) });
  assert.equal(typeof onClick, 'function');
  onClick();
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.deepEqual(toasts, [{ message: 'toast.batchLoadFailed', options: { tone: 'error' } }]);
  assert.equal(errors.length, 1);
  assert.match(String(errors[0][1] && errors[0][1].message), /csv\.js/);

  // A batch mode that opens shows nothing.
  app.context.initBatchButton({ openBatch: () => Promise.resolve() });
  onClick();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(toasts.length, 1);
});

/**
 * A page with a registered service worker: `posted` lists every message as
 * [worker name, message], and `fire(type)` dispatches a container event.
 */
function serviceWorkerHarness({ controller = null, active = 'release-a', pathname = '/de/wifi-qr-code/' } = {}) {
  const app = createAppHarness();
  const posted = [];
  const listeners = {};
  let onLoad = null;
  const worker = name => ({ name, postMessage: message => posted.push([name, { ...message }]) });
  const container = {
    controller: controller && worker(controller),
    ready: Promise.resolve({ active: worker(active) }),
    register: () => Promise.resolve(),
    addEventListener(type, handler) {
      listeners[type] = handler;
    }
  };
  app.context.navigator.serviceWorker = container;
  app.context.window.location = { pathname };
  app.context.window.addEventListener = (type, handler) => {
    if (type === 'load') onLoad = handler;
  };
  app.context.registerServiceWorker();

  return {
    posted,
    worker,
    container,
    async load() {
      onLoad();
      await new Promise(resolve => setImmediate(resolve));
    },
    fire(type) {
      listeners[type]();
    }
  };
}

test('a page asks the active worker to keep it offline, and a new worker after an update', async () => {
  const page = serviceWorkerHarness({ controller: 'release-a' });
  await page.load();
  assert.deepEqual(page.posted, [['release-a', { type: 'cache-page', path: '/de/wifi-qr-code/' }]]);

  // The update's worker takes over with an empty cache for this page.
  page.container.controller = page.worker('release-b');
  page.fire('controllerchange');
  assert.deepEqual(page.posted.at(-1), ['release-b', { type: 'cache-page', path: '/de/wifi-qr-code/' }]);
  assert.equal(page.posted.length, 2);
});

test('the first visit asks the worker once, not again when it takes control', async () => {
  const page = serviceWorkerHarness();
  await page.load();
  page.container.controller = page.worker('release-a');
  page.fire('controllerchange');
  assert.deepEqual(page.posted, [['release-a', { type: 'cache-page', path: '/de/wifi-qr-code/' }]]);
});
