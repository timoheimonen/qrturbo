// Shared fixtures and helpers for the 2.0 end-to-end specs.
// - Every test runs with an en-GB locale, so the page stays English in every
//   browser (WebKit follows the system language otherwise) and print sizes
//   default to millimetres.
// - An automatic guard fails the test on any dialog (alert, confirm, prompt,
//   beforeunload) and on any uncaught page error.
// - Helpers wait for real state (#qr-stage[data-state], scan results,
//   download events) instead of fixed sleeps.
const fs = require('node:fs/promises');
const path = require('node:path');
const zlib = require('node:zlib');

const base = require('@playwright/test');
const jsQR = require('jsqr');

const { decodeQrBuffer } = require('../helpers/qr-decoder');
const { rasterizeEps, rasterizePdf } = require('../helpers/vector-inspect');

const { expect } = base;

const MORE_FORMATS = new Set(['jpg', 'webp', 'eps']);
const RASTER_MIME = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const test = base.test.extend({
  locale: ['en-GB', { option: true }],

  pageGuard: [async ({ page }, use) => {
    const problems = [];
    page.on('dialog', dialog => {
      problems.push(`dialog (${dialog.type()}): ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    page.on('pageerror', error => problems.push(`page error: ${error.message}`));
    await use(problems);
    expect(problems, 'the page opened no dialog and threw no error').toEqual([]);
  }, { auto: true }]
});

// --- Page state ---

/**
 * Opens the generator and starts recording 'scan' results, so tests can
 * wait for the check of the current revision.
 */
async function openApp(page, urlPath = '/') {
  await page.goto(urlPath);
  await page.waitForFunction(() => globalThis.QRTurboApp
    && document.getElementById('qr-stage')
    && document.getElementById('qr-stage').dataset.state);
  await page.evaluate(() => {
    if (window.__qrtScans) return;
    window.__qrtScans = [];
    globalThis.QRTurboApp.on('scan', result => window.__qrtScans.push(result));
  });
}

/**
 * Waits until the stage shows the current revision. With a payload, the
 * ready snapshot must also hold exactly that payload.
 */
async function waitForReady(page, payload = null, timeout = 15_000) {
  await page.waitForFunction(expected => {
    const stage = document.getElementById('qr-stage');
    const snapshot = globalThis.QRTurboApp.getSnapshot();
    return stage.dataset.state === 'ready'
      && Boolean(snapshot)
      && (expected === null || snapshot.payload === expected);
  }, payload, { timeout });
}

async function fillText(page, text) {
  await page.locator('#qr-text').fill(text);
  await waitForReady(page, text);
}

/**
 * Waits for the scan check of the current revision and returns its result
 * ({ state, verified, issues }).
 */
async function waitForScan(page, timeout = 15_000) {
  await page.waitForFunction(() => {
    const snapshot = globalThis.QRTurboApp.getSnapshot();
    const badge = document.getElementById('scan-badge');
    const last = (window.__qrtScans || [])[window.__qrtScans.length - 1];
    return document.getElementById('qr-stage').dataset.state === 'ready'
      && snapshot && last && last.revision === snapshot.revision
      && !badge.hidden && !badge.classList.contains('is-checking');
  }, null, { timeout });
  return page.evaluate(() => {
    const last = window.__qrtScans[window.__qrtScans.length - 1];
    return JSON.parse(JSON.stringify(last));
  });
}

async function translate(page, key, vars = {}) {
  return page.evaluate(([name, values]) => t(name, values), [key, vars]);
}

async function openCustomize(page) {
  const toggle = page.locator('#customize-toggle');
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
  await expect(page.locator('#customize-panel')).toBeVisible();
}

async function openScanDetails(page) {
  const badge = page.locator('#scan-badge');
  if (await badge.getAttribute('aria-expanded') !== 'true') await badge.click();
  await expect(page.locator('#scan-warnings')).toBeVisible();
}

/**
 * Chooses a logo through the file input and waits until the design holds it.
 */
async function chooseLogo(page, { name = 'logo.png', mimeType = 'image/png', buffer = makeLogoPng() } = {}) {
  await page.locator('#qr-logo').setInputFiles({ name, mimeType, buffer });
  await expect(page.locator('#logo-filename')).toHaveText(name);
  await expect.poll(() => page.evaluate(() => {
    const logo = globalThis.QRTurboApp.getDesign().logo;
    return logo ? logo.name : null;
  })).toBe(name);
}

// --- Export controls ---

async function selectFormat(page, format) {
  if (MORE_FORMATS.has(format)) {
    const toggle = page.locator('#more-formats-toggle');
    if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
  }
  await page.locator(`label[for="format-${format}"]`).click();
  await expect(page.locator(`#format-${format}`)).toBeChecked();
}

/**
 * Turns on print sizing (raster and SVG) and sets the width, unit and dpi.
 * PDF and EPS always show the width, so the toggle is skipped there.
 */
async function setPrintSize(page, { width, unit = 'mm', dpi = null }) {
  const toggle = page.locator('#print-toggle');
  if (await toggle.isVisible() && !(await toggle.isChecked())) await toggle.check();
  await expect(page.locator('#print-size')).toBeVisible();
  await page.locator(`label[for="print-unit-${unit}"]`).click();
  await page.locator('#print-width').fill(String(width));
  if (dpi !== null) await page.locator('#print-dpi').selectOption(String(dpi));
  await expect.poll(() => page.evaluate(() => globalThis.QRTurboApp.getExportOptions().print))
    .toMatchObject({ width: Number(width), unit, ...(dpi === null ? {} : { dpi: Number(dpi) }) });
}

/**
 * Clicks a download control and returns the saved file name and bytes.
 */
async function downloadFile(page, trigger = '#download-btn') {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.locator(trigger).click()
  ]);
  const filePath = await download.path();
  return { filename: download.suggestedFilename(), buffer: await fs.readFile(filePath) };
}

// --- Decoding ---

function decodeRaster(raster) {
  const result = jsQR(new Uint8ClampedArray(raster.data), raster.width, raster.height, {
    inversionAttempts: 'attemptBoth'
  });
  return result ? { text: result.data, bytes: Buffer.from(result.binaryData) } : null;
}

/**
 * Decodes an exported file with jsQR: raster images and SVG are drawn in the
 * page, PDF and EPS go through tests/helpers/vector-inspect.js. Returns
 * { text, bytes } (bytes are the raw QR data bytes) or null.
 */
async function decodeFile(page, { filename, buffer }, { pxPerPt = 3 } = {}) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === '.pdf') return decodeRaster(rasterizePdf(buffer, { pxPerPt }));
  if (extension === '.eps') return decodeRaster(rasterizeEps(buffer, { pxPerPt }));

  const mimeType = RASTER_MIME[extension];
  if (!mimeType) throw new Error(`No decoder for ${filename}`);
  const decoded = await decodeQrBuffer(page, buffer, mimeType);
  return decoded.data === null ? null : { text: decoded.data, bytes: Buffer.from(decoded.binaryData) };
}

/**
 * The decoded bytes must be exactly the UTF-8 bytes of the payload.
 */
function expectPayload(decoded, payload) {
  expect(decoded, 'jsQR found a code').not.toBeNull();
  expect(decoded.bytes.toString('hex')).toBe(Buffer.from(payload, 'utf8').toString('hex'));
  expect(decoded.text).toBe(payload);
}

// --- File formats ---

function pngChunks(buffer) {
  const chunks = [];
  let offset = 8;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    chunks.push({ type, data: buffer.subarray(offset + 8, offset + 8 + length) });
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  return chunks;
}

function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/**
 * The JFIF density of a JPEG: { units, x, y }, or null without APP0 JFIF.
 */
function jfifDensity(buffer) {
  let offset = 2;
  while (offset + 4 <= buffer.length && buffer[offset] === 0xff) {
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker === 0xe0 && buffer.toString('latin1', offset + 4, offset + 9) === 'JFIF\0') {
      return {
        units: buffer[offset + 11],
        x: buffer.readUInt16BE(offset + 12),
        y: buffer.readUInt16BE(offset + 14)
      };
    }
    if (marker === 0xda) break;
    offset += 2 + length;
  }
  return null;
}

function pngChunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

/**
 * Encodes an RGBA PNG. paint(x, y) returns [r, g, b, a].
 */
function makePng(width, height, paint) {
  const stride = (width * 4) + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = paint(x, y);
      const at = (y * stride) + 1 + (x * 4);
      raw[at] = r;
      raw[at + 1] = g;
      raw[at + 2] = b;
      raw[at + 3] = a;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

/**
 * A large single-color opaque PNG, built from one repeated row so that even
 * 3000 px stays fast to make.
 */
function makeSolidPng(width, height, [red, green, blue]) {
  const row = Buffer.alloc((width * 4) + 1);
  for (let x = 0; x < width; x += 1) {
    row[1 + (x * 4)] = red;
    row[2 + (x * 4)] = green;
    row[3 + (x * 4)] = blue;
    row[4 + (x * 4)] = 255;
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(Buffer.concat(Array.from({ length: height }, () => row)))),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

const LOGO_COLOR = { red: 255, green: 0, blue: 255 };

/**
 * A plain test logo: a magenta disc on a transparent square. It does not
 * look like a QR code, so the scan check can still read the result.
 */
function makeLogoPng(size = 96) {
  const center = (size - 1) / 2;
  const radius = size * 0.45;
  return makePng(size, size, (x, y) => (
    Math.hypot(x - center, y - center) <= radius ? [255, 0, 255, 255] : [0, 0, 0, 0]
  ));
}

// --- ZIP ---

/**
 * Reads a STORE-only ZIP through its central directory and checks every
 * entry's CRC. Returns [{ name, data, flags }].
 */
function readZip(buffer) {
  let end = -1;
  for (let at = buffer.length - 22; at >= 0; at -= 1) {
    if (buffer.readUInt32LE(at) === 0x06054b50) {
      end = at;
      break;
    }
  }
  if (end < 0) throw new Error('ZIP: no end of central directory record');
  const count = buffer.readUInt16LE(end + 10);
  let at = buffer.readUInt32LE(end + 16);
  const entries = [];
  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(at) !== 0x02014b50) throw new Error('ZIP: bad central directory header');
    const flags = buffer.readUInt16LE(at + 8);
    const crc = buffer.readUInt32LE(at + 16);
    const size = buffer.readUInt32LE(at + 24);
    const nameLength = buffer.readUInt16LE(at + 28);
    const extraLength = buffer.readUInt16LE(at + 30);
    const commentLength = buffer.readUInt16LE(at + 32);
    const offset = buffer.readUInt32LE(at + 42);
    const name = buffer.toString(flags & 0x800 ? 'utf8' : 'latin1', at + 46, at + 46 + nameLength);
    if (buffer.readUInt32LE(offset) !== 0x04034b50) throw new Error(`ZIP: bad local header for ${name}`);
    const start = offset + 30 + buffer.readUInt16LE(offset + 26) + buffer.readUInt16LE(offset + 28);
    const data = buffer.subarray(start, start + size);
    if ((zlib.crc32(data) >>> 0) !== crc) throw new Error(`ZIP: CRC mismatch in ${name}`);
    entries.push({ name, data, flags });
    at += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

module.exports = {
  test,
  expect,
  LOGO_COLOR,
  chooseLogo,
  decodeFile,
  decodeRaster,
  downloadFile,
  expectPayload,
  fillText,
  jfifDensity,
  makeLogoPng,
  makePng,
  makeSolidPng,
  openApp,
  openCustomize,
  openScanDetails,
  pngChunks,
  pngSize,
  readZip,
  selectFormat,
  setPrintSize,
  translate,
  waitForReady,
  waitForScan
};
