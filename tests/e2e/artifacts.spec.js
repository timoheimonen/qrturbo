const { test, expect } = require('@playwright/test');

const { countPixelsNearColor, decodeQrDownload } = require('../helpers/qr-decoder');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TEST_LOGO_COLOR = { red: 255, green: 0, blue: 255 };
const TEST_LOGO = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#ff00ff"/>
    <path fill="#ffffff" d="M9 9h14v11h-3l3 3h-5l-3-3H9zm4 4v3h6v-3z"/>
  </svg>
`);

// UTF-8 is the hardest payload for the byte-mode adapter, so it is the one
// exercised end to end in every export format and in WebKit.
const UTF8_PAYLOAD = 'Ääkköset äöå · 漢字と世界 · emoji 🚀';

// JPG, WebP and EPS sit behind "More formats".
const MORE_FORMATS = ['jpg', 'webp', 'eps'];

async function selectArtifactFormat(page, format) {
  const toggle = page.locator('#more-formats-toggle');
  if (MORE_FORMATS.includes(format) && await toggle.getAttribute('aria-expanded') !== 'true') {
    await toggle.click();
    await expect(page.locator('#more-formats')).toBeVisible();
  }
  await page.locator(`label[for="format-${format}"]`).click();
  await expect(page.locator(`#format-${format}`)).toBeChecked();

  // The preview is always an inline SVG, whatever the export format.
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(page.locator('#qr-canvas-container svg')).toBeVisible();
  await expect(page.locator('#download-btn')).toBeVisible();
  await expect(page.locator('#download-btn')).toBeEnabled();
}

async function downloadArtifact(page) {
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  return downloadPromise;
}

async function chooseShape(page, id) {
  await page.locator(`label[for="${id}"]`).click();
  await expect(page.locator(`#${id}`)).toBeChecked();
}

for (const format of ['png', 'svg']) {
  test(`downloaded ${format.toUpperCase()} decodes to the exact UTF-8 payload @webkit-core`, async ({ page }) => {
    await page.goto('/');
    await page.locator('#qr-text').fill(UTF8_PAYLOAD);
    await selectArtifactFormat(page, format);

    const decoded = await decodeQrDownload(page, await downloadArtifact(page));

    expect(decoded.filename).toMatch(new RegExp(`\\.${format}$`, 'i'));
    if (format === 'png') {
      expect(decoded.artifact.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE);
    } else {
      expect(decoded.artifact.toString('utf8')).toContain('<svg');
    }
    expect(decoded.data).toBe(UTF8_PAYLOAD);
  });
}

test('customized QR changes the artifact, remains decodable and resets the UI @webkit-core', async ({ page }) => {
  const payload = 'https://example.com/customized-qr';
  const downloadButton = page.locator('#download-btn');

  await page.goto('/');
  await page.locator('#qr-text').fill(payload);
  await expect(page.locator('#qr-code-text')).toHaveText(payload, { timeout: 10_000 });
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(downloadButton).toBeVisible();
  await expect(downloadButton).toBeEnabled();

  const baseline = await decodeQrDownload(page, await downloadArtifact(page));
  expect(baseline.data).toBe(payload);

  // Colors are always visible; shapes and error correction are behind the toggle.
  await expect(page.locator('#qr-fg-color-text')).toBeVisible();
  await page.locator('#qr-transparent-bg').check();
  await expect(page.locator('#qr-bg-color')).toBeDisabled();
  await expect(page.locator('#qr-bg-color-text')).toBeDisabled();
  await page.locator('#qr-transparent-bg').uncheck();
  await expect(page.locator('#qr-bg-color')).toBeEnabled();
  await expect(page.locator('#qr-bg-color-text')).toBeEnabled();
  await page.locator('#qr-fg-color-text').fill('#102A43');
  await page.locator('#qr-bg-color-text').fill('#F0F4F8');

  await page.locator('#customize-toggle').click();
  await expect(page.locator('#customize-toggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#customize-panel')).toBeVisible();
  await page.locator('#qr-error-correction').selectOption('H');
  await chooseShape(page, 'dot-rounded');
  await chooseShape(page, 'corner-square-square');
  await chooseShape(page, 'corner-dot-square');
  await page.locator('#qr-logo').setInputFiles({
    name: 'test-logo.svg',
    mimeType: 'image/svg+xml',
    buffer: TEST_LOGO
  });

  await expect(page.locator('#logo-filename')).toHaveText('test-logo.svg');
  await expect(page.locator('#logo-preview')).toBeVisible();
  await expect(page.locator('#logo-controls')).toBeVisible();
  await expect(page.locator('#logo-remove-btn')).toBeVisible();
  await page.locator('#qr-logo-size').fill('0.2');
  await expect(page.locator('#qr-logo-size-value')).toHaveText('20%');
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(downloadButton).toBeVisible();
  await expect(downloadButton).toBeEnabled();

  const customized = await decodeQrDownload(page, await downloadArtifact(page));
  expect(customized.artifact.equals(baseline.artifact)).toBe(false);
  expect(countPixelsNearColor(customized.pixels, TEST_LOGO_COLOR, 8)).toBeGreaterThan(100);
  expect(customized.data).toBe(payload);

  // The export format is not part of the design, so Reset keeps it.
  await selectArtifactFormat(page, 'svg');

  // Reset opens no dialog: it shows a toast that offers Undo.
  const dialogs = [];
  page.on('dialog', dialog => {
    dialogs.push(dialog.type());
    dialog.dismiss().catch(() => {});
  });
  await page.locator('#reset-customization').click();
  const resetToast = page.locator('#toast-region .toast').filter({
    hasText: await page.evaluate(() => t('toast.designReset'))
  });
  await expect(resetToast).toBeVisible();
  const undoButton = resetToast.locator('.toast-action');
  await expect(undoButton).toHaveText(await page.evaluate(() => t('actions.undo')));

  await expect(page.locator('#qr-fg-color')).toHaveValue('#000000');
  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#000000');
  await expect(page.locator('#qr-bg-color')).toHaveValue('#ffffff');
  await expect(page.locator('#qr-bg-color-text')).toHaveValue('#ffffff');
  await expect(page.locator('#qr-bg-color')).toBeEnabled();
  await expect(page.locator('#qr-bg-color-text')).toBeEnabled();
  await expect(page.locator('#qr-transparent-bg')).not.toBeChecked();
  await expect(page.locator('#qr-error-correction')).toHaveValue('auto');
  await expect(page.locator('#format-svg')).toBeChecked();
  await expect(page.locator('#dot-square')).toBeChecked();
  await expect(page.locator('#corner-square-extra-rounded')).toBeChecked();
  await expect(page.locator('#corner-dot-dot')).toBeChecked();
  await expect(page.locator('#frame-none')).toBeChecked();
  await expect(page.locator('#qr-margin')).toHaveValue('4');
  await expect(page.locator('#qr-margin-value')).toHaveText(/4/);
  await expect(page.locator('#qr-margin-value')).not.toHaveText('units.modules');
  await expect(page.locator('#qr-logo')).toHaveValue('');
  await expect(page.locator('#logo-filename')).toBeEmpty();
  await expect(page.locator('#logo-preview')).toBeHidden();
  await expect(page.locator('#logo-controls')).toBeHidden();
  await expect(page.locator('#logo-remove-btn')).toBeHidden();
  await expect(page.locator('#qr-logo-size')).toHaveValue('0.4');
  await expect(page.locator('#qr-logo-size-value')).toHaveText('40%');
  await expect(page.locator('#qr-logo-margin')).toHaveValue('0.5');
  await expect(page.locator('#qr-logo-margin-value')).toHaveText(
    await page.evaluate(() => t('units.modules', { count: (0.5).toLocaleString(document.documentElement.lang) }))
  );
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(downloadButton).toBeVisible();
  await expect(downloadButton).toBeEnabled();

  // Undo brings the customized design back (colors are stored in lowercase).
  await undoButton.click();
  await expect(page.locator('#qr-fg-color-text')).toHaveValue(/^#102a43$/i);
  await expect(page.locator('#qr-bg-color-text')).toHaveValue(/^#f0f4f8$/i);
  await expect(page.locator('#dot-rounded')).toBeChecked();
  await expect(page.locator('#format-svg')).toBeChecked();
  expect(dialogs).toEqual([]);
});
