const { countPixelsNearColor, decodeQrBuffer } = require('../helpers/qr-decoder');
const {
  test,
  expect,
  LOGO_COLOR,
  chooseLogo,
  downloadFile,
  fillText,
  makeLogoPng,
  makeSolidPng,
  openApp,
  translate,
  waitForReady,
  waitForScan
} = require('./fixtures');

const PAYLOAD = 'https://example.com/logo?campaign=autumn';

function logoName(page) {
  return page.evaluate(() => {
    const logo = globalThis.QRTurboApp.getDesign().logo;
    return logo ? logo.name : null;
  });
}

/**
 * Builds a DataTransfer that holds one file, inside the page.
 */
function fileTransfer(page, { name, mimeType, buffer }) {
  return page.evaluateHandle(({ base64, fileName, type }) => {
    const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], fileName, { type }));
    return transfer;
  }, { base64: buffer.toString('base64'), fileName: name, type: mimeType });
}

async function expectLogoShown(page, name) {
  await expect(page.locator('#logo-filename')).toHaveText(name);
  await expect(page.locator('#logo-preview')).toBeVisible();
  await expect(page.locator('#logo-controls')).toBeVisible();
  await expect(page.locator('#logo-remove-btn')).toBeVisible();
  await expect(page.locator('#logo-error')).toBeHidden();
  await expect.poll(() => logoName(page)).toBe(name);
}

async function removeLogo(page) {
  await page.locator('#logo-remove-btn').click();
  await expect(page.locator('#logo-select-btn')).toBeFocused();
  await expect(page.locator('#logo-preview')).toBeHidden();
  await expect(page.locator('#logo-filename')).toBeEmpty();
  await expect.poll(() => logoName(page)).toBeNull();
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await fillText(page, PAYLOAD);
});

test('a chosen logo is exported, switches auto to level H and still scans @webkit-core', async ({ page }) => {
  await chooseLogo(page, { name: 'brand-mark.png' });
  await expectLogoShown(page, 'brand-mark.png');
  await expect(page.locator('#qr-logo-size-value')).toHaveText('40%');
  await expect(page.locator('#qr-logo-margin')).toHaveValue('0.5');
  await expect(page.locator('#qr-logo-margin-value')).toHaveText(await translate(page, 'units.modules', { count: '0.5' }));

  await waitForReady(page, PAYLOAD);
  const snapshot = await page.evaluate(() => {
    const current = globalThis.QRTurboApp.getSnapshot();
    return { ecl: current.ecl, eclAuto: current.eclAuto, hasLogo: Boolean(current.design.logo) };
  });
  expect(snapshot).toEqual({ ecl: 'H', eclAuto: true, hasLogo: true });
  await expect(page.locator('#qr-canvas-container svg image')).toHaveCount(1);

  const scan = await waitForScan(page);
  expect(scan.state).toBe('ok');

  const file = await downloadFile(page);
  const decoded = await decodeQrBuffer(page, file.buffer, 'image/png');
  expect(decoded.data).toBe(PAYLOAD);
  expect(countPixelsNearColor(decoded.pixels, LOGO_COLOR, 8)).toBeGreaterThan(1000);

  await removeLogo(page);
  await waitForReady(page, PAYLOAD);
  expect(await page.evaluate(() => globalThis.QRTurboApp.getSnapshot().ecl)).toBe('M');
});

test('dropping and pasting an image both set the logo', async ({ page }) => {
  const dropped = { name: 'dropped.png', mimeType: 'image/png', buffer: makeLogoPng(80) };
  const transfer = await fileTransfer(page, dropped);
  const zone = page.locator('#logo-dropzone');
  await zone.dispatchEvent('dragenter', { dataTransfer: transfer });
  await zone.dispatchEvent('dragover', { dataTransfer: transfer });
  await zone.dispatchEvent('drop', { dataTransfer: transfer });
  await expectLogoShown(page, 'dropped.png');
  await removeLogo(page);

  // Paste is taken from the document while focus is not in a text field.
  await page.locator('#logo-select-btn').blur();
  const pasted = await fileTransfer(page, { name: 'pasted.png', mimeType: 'image/png', buffer: makeLogoPng(72) });
  const pasteHandled = await page.evaluate(clipboardData => !document.dispatchEvent(
    new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
  ), pasted);
  expect(pasteHandled).toBe(true);
  await expectLogoShown(page, 'pasted.png');

  // Pasting into the content field is text editing, not a logo change.
  await removeLogo(page);
  await page.locator('#qr-text').focus();
  const ignored = await fileTransfer(page, { name: 'ignored.png', mimeType: 'image/png', buffer: makeLogoPng(64) });
  // The logo handler cancels a paste it takes; this one must pass through.
  const ignoredHandled = await page.evaluate(clipboardData => !document.activeElement.dispatchEvent(
    new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
  ), ignored);
  expect(ignoredHandled).toBe(false);
  await expect(page.locator('#qr-text')).toHaveValue(PAYLOAD);
  expect(await logoName(page)).toBeNull();
});

test('a text file and a corrupt PNG show #logo-error instead of hanging', async ({ page }) => {
  const readFailed = await translate(page, 'logo.readFailed');

  await page.locator('#qr-logo').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('This is not an image.\n')
  });
  await expect(page.locator('#logo-error')).toBeVisible();
  await expect(page.locator('#logo-error')).toHaveText(readFailed);
  expect(await logoName(page)).toBeNull();

  const started = Date.now();
  const corrupt = Buffer.concat([makeLogoPng(64).subarray(0, 40), Buffer.from('broken image data '.repeat(20))]);
  await page.locator('#qr-logo').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: corrupt });
  await expect(page.locator('#logo-error')).toHaveText(readFailed, { timeout: 10_000 });
  expect(Date.now() - started).toBeLessThan(10_000);
  expect(await logoName(page)).toBeNull();

  // The code itself is untouched and stays ready.
  await waitForReady(page, PAYLOAD);
  await expect(page.locator('#download-btn')).not.toHaveAttribute('aria-disabled', 'true');

  // A good file afterwards clears the error.
  await chooseLogo(page, { name: 'good.png' });
  await expect(page.locator('#logo-error')).toBeHidden();
});

test('a 3000 px image is resized and #logo-note says so', async ({ page }) => {
  const big = makeSolidPng(3000, 3000, [37, 99, 235]);
  await page.locator('#qr-logo').setInputFiles({ name: 'huge.png', mimeType: 'image/png', buffer: big });
  await expectLogoShown(page, 'huge.png');

  const note = page.locator('#logo-note');
  await expect(note).toBeVisible();
  await expect(note).toHaveText(/1[,.   ]?024/);
  const expected = await page.evaluate(() => t('logo.optimized', {
    size: new Intl.NumberFormat(document.documentElement.lang || 'en').format(1024)
  }));
  await expect(note).toHaveText(expected);

  const logo = await page.evaluate(() => {
    const current = globalThis.QRTurboApp.getDesign().logo;
    return { width: current.width, height: current.height, optimized: current.optimized };
  });
  expect(logo).toEqual({ width: 1024, height: 1024, optimized: true });

  await removeLogo(page);
  await expect(note).toBeHidden();
});
