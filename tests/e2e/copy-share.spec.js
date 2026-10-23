const { decodeQrBuffer } = require('../helpers/qr-decoder');
const {
  test,
  expect,
  fillText,
  openApp,
  selectFormat,
  translate
} = require('./fixtures');

const PAYLOAD = 'https://example.com/copy-share?ref=e2e';

function toastWith(page, text) {
  return page.locator('#toast-region .toast').filter({ hasText: text });
}

// navigator.share and canShare are replaced before the app starts, so the
// share button is offered and every call is recorded with its files.
function stubShare(page) {
  return page.addInitScript(() => {
    window.__shareCalls = [];
    Object.defineProperty(Navigator.prototype, 'canShare', {
      configurable: true,
      value(data) {
        return Boolean(data && Array.isArray(data.files) && data.files.length > 0);
      }
    });
    Object.defineProperty(Navigator.prototype, 'share', {
      configurable: true,
      async value(data) {
        window.__shareCalls.push({ keys: Object.keys(data), files: [...data.files] });
      }
    });
  });
}

async function lastShare(page) {
  return page.evaluate(async () => {
    const call = window.__shareCalls[window.__shareCalls.length - 1];
    const file = call.files[0];
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return {
      keys: call.keys,
      count: call.files.length,
      isFile: file instanceof File,
      name: file.name,
      type: file.type,
      base64: btoa(binary)
    };
  });
}

test('Copy image puts a decodable PNG on the clipboard, and Copy text the payload', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are a Chromium feature');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openApp(page);
  await fillText(page, PAYLOAD);

  const copy = page.locator('#copy-btn');
  await expect(copy).toBeVisible();
  await expect(page.locator('#copy-btn-label')).toHaveText(await translate(page, 'actions.copyImage'));
  await copy.click();
  await expect(toastWith(page, await translate(page, 'toast.imageCopied'))).toBeVisible();

  const clipboard = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    const blob = await item.getType('image/png');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return { types: item.types, base64: btoa(binary) };
  });
  expect(clipboard.types).toContain('image/png');
  const png = Buffer.from(clipboard.base64, 'base64');
  expect(png.subarray(1, 4).toString('latin1')).toBe('PNG');
  expect((await decodeQrBuffer(page, png, 'image/png')).data).toBe(PAYLOAD);

  // SVG format copies the SVG code as text.
  await selectFormat(page, 'svg');
  await expect(page.locator('#copy-btn-label')).toHaveText(await translate(page, 'actions.copySvg'));
  await copy.click();
  await expect(toastWith(page, await translate(page, 'toast.svgCopied'))).toBeVisible();
  const svg = await page.evaluate(() => navigator.clipboard.readText());
  expect(svg).toMatch(/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/);
  expect((await decodeQrBuffer(page, Buffer.from(svg), 'image/svg+xml')).data).toBe(PAYLOAD);

  // Copy text sits in the encoded data panel; the toast never shows the payload.
  await page.locator('#payload-toggle').click();
  await expect(page.locator('#payload-panel')).toBeVisible();
  await page.locator('#copy-text-btn').click();
  const textToast = toastWith(page, await translate(page, 'toast.textCopied'));
  await expect(textToast).toBeVisible();
  await expect(textToast).not.toContainText('example.com');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(PAYLOAD);
});

test('Share passes only a File of the chosen format @webkit-core', async ({ page }) => {
  await stubShare(page);
  await openApp(page);
  await fillText(page, PAYLOAD);

  const share = page.locator('#share-btn');
  await expect(share).toBeVisible();
  await share.click();
  await expect.poll(() => page.evaluate(() => window.__shareCalls.length)).toBe(1);
  const png = await lastShare(page);
  expect(png).toMatchObject({ keys: ['files'], count: 1, isFile: true, type: 'image/png' });
  expect(png.name).toBe('qrcode-url-example-com-1024px.png');
  expect((await decodeQrBuffer(page, Buffer.from(png.base64, 'base64'), 'image/png')).data).toBe(PAYLOAD);

  await selectFormat(page, 'svg');
  await share.click();
  await expect.poll(() => page.evaluate(() => window.__shareCalls.length)).toBe(2);
  const svg = await lastShare(page);
  expect(svg).toMatchObject({ keys: ['files'], count: 1, isFile: true, type: 'image/svg+xml' });
  expect(svg.name).toMatch(/\.svg$/);

  await selectFormat(page, 'pdf');
  await share.click();
  await expect.poll(() => page.evaluate(() => window.__shareCalls.length)).toBe(3);
  const pdf = await lastShare(page);
  expect(pdf).toMatchObject({ keys: ['files'], count: 1, isFile: true, type: 'application/pdf' });
  expect(Buffer.from(pdf.base64, 'base64').toString('latin1', 0, 5)).toBe('%PDF-');
});

test('Share is hidden when the browser cannot share files', async ({ page }) => {
  await page.addInitScript(() => {
    delete Navigator.prototype.share;
    delete Navigator.prototype.canShare;
  });
  await openApp(page);
  await fillText(page, PAYLOAD);
  await expect(page.locator('#download-btn')).toBeVisible();
  await expect(page.locator('#share-btn')).toBeHidden();
  await expect(page.locator('#mobile-share-btn')).toBeHidden();
});

test('Print fills the print sheet at the physical width and opens the print dialog', async ({ page }) => {
  await page.addInitScript(() => {
    window.__printCalls = 0;
    window.print = () => {
      window.__printCalls += 1;
    };
  });
  await openApp(page);
  await fillText(page, PAYLOAD);

  await page.locator('#print-btn').click();
  await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(1);
  const image = page.locator('#print-sheet img');
  await expect(image).toHaveCount(1);
  expect(await image.evaluate(node => [node.style.width, node.style.height])).toEqual(['50mm', '50mm']);
  await expect(toastWith(page, await translate(page, 'output.printTip'))).toBeVisible();

  const svg = await image.evaluate(async node => (await fetch(node.src)).text());
  expect(svg).toContain('width="50mm"');
  expect((await decodeQrBuffer(page, Buffer.from(svg), 'image/svg+xml')).data).toBe(PAYLOAD);

  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await expect(image).toHaveCount(0);
});
