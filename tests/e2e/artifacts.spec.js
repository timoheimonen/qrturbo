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

const payloadCases = [
  {
    name: 'ASCII URL',
    payload: 'https://example.com/artifact-test?source=qrturbo.app',
    fill: async page => {
      await page.locator('#qr-text').fill('https://example.com/artifact-test?source=qrturbo.app');
    }
  },
  {
    name: 'UTF-8 text with Nordic, CJK and emoji characters',
    payload: 'Ääkköset äöå — 漢字と世界 — emoji 🚀',
    fill: async page => {
      await page.locator('#qr-text').fill('Ääkköset äöå — 漢字と世界 — emoji 🚀');
    }
  },
  {
    name: 'structured WiFi payload',
    payload: 'WIFI:S:Guest\\;Lab;T:WPA;P:test-password;H:true;',
    fill: async page => {
      await page.getByRole('tab', { name: 'WiFi' }).click();
      await page.locator('#wifi-ssid').fill('Guest;Lab');
      await page.locator('#wifi-auth').selectOption('WPA');
      await page.locator('#wifi-password').fill('test-password');
      await page.locator('#wifi-hidden').check();
    }
  }
];

async function selectArtifactFormat(page, format) {
  await page.locator('#customize-toggle').click();
  await expect(page.locator('#customize-panel')).toBeVisible();
  await page.locator('#qr-format').selectOption(format);

  const renderedArtifact = format === 'svg'
    ? page.locator('#qr-canvas-container svg')
    : page.locator('#qr-canvas-container canvas');
  await expect(renderedArtifact).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#download-btn')).toBeVisible();
  await expect(page.locator('#download-btn')).toBeEnabled();
}

async function downloadArtifact(page) {
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  return downloadPromise;
}

for (const format of ['png', 'svg']) {
  for (const payloadCase of payloadCases) {
    test(`downloaded ${format.toUpperCase()} decodes exact ${payloadCase.name}`, async ({ page }) => {
      await page.goto('/');
      await payloadCase.fill(page);
      await selectArtifactFormat(page, format);

      const decoded = await decodeQrDownload(page, await downloadArtifact(page));

      expect(decoded.filename).toMatch(new RegExp(`\\.${format}$`, 'i'));
      if (format === 'png') {
        expect(decoded.artifact.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE);
      } else {
        expect(decoded.artifact.toString('utf8')).toContain('<svg');
      }
      expect(decoded.data).toBe(payloadCase.payload);
    });
  }
}

test('customized QR changes the artifact, remains decodable and resets the UI', async ({ page }) => {
  const payload = 'https://example.com/customized-qr';
  const downloadButton = page.locator('#download-btn');

  await page.goto('/');
  await page.locator('#qr-text').fill(payload);
  await expect(page.locator('#qr-code-text')).toHaveText(payload, { timeout: 10_000 });
  await expect(downloadButton).toBeVisible();
  await expect(downloadButton).toBeEnabled();

  const baseline = await decodeQrDownload(page, await downloadArtifact(page));
  expect(baseline.data).toBe(payload);

  await page.locator('#customize-toggle').click();
  await expect(page.locator('#customize-toggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#customize-panel')).toBeVisible();
  await page.locator('#qr-transparent-bg').check();
  await expect(page.locator('#qr-bg-color')).toBeDisabled();
  await expect(page.locator('#qr-bg-color-text')).toBeDisabled();
  await page.locator('#qr-transparent-bg').uncheck();
  await expect(page.locator('#qr-bg-color')).toBeEnabled();
  await expect(page.locator('#qr-bg-color-text')).toBeEnabled();
  await page.locator('#qr-fg-color-text').fill('#102A43');
  await page.locator('#qr-bg-color-text').fill('#F0F4F8');
  await page.locator('#qr-error-correction').selectOption('H');
  await page.locator('#qr-dot-style').selectOption('rounded');
  await page.locator('#qr-corner-square-style').selectOption('square');
  await page.locator('#qr-corner-dot-style').selectOption('square');
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
  await expect(downloadButton).toBeVisible({ timeout: 10_000 });
  await expect(downloadButton).toBeEnabled();

  const customized = await decodeQrDownload(page, await downloadArtifact(page));
  expect(customized.artifact.equals(baseline.artifact)).toBe(false);
  expect(countPixelsNearColor(customized.pixels, TEST_LOGO_COLOR, 8)).toBeGreaterThan(100);
  expect(customized.data).toBe(payload);

  const dialogPromise = page.waitForEvent('dialog');
  const resetPromise = page.locator('#reset-customization').click();
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe('alert');
  expect(dialog.message()).not.toBe('alerts.resetSuccess');
  await dialog.accept();
  await resetPromise;

  await expect(page.locator('#qr-fg-color')).toHaveValue('#000000');
  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#000000');
  await expect(page.locator('#qr-bg-color')).toHaveValue('#ffffff');
  await expect(page.locator('#qr-bg-color-text')).toHaveValue('#ffffff');
  await expect(page.locator('#qr-bg-color')).toBeEnabled();
  await expect(page.locator('#qr-bg-color-text')).toBeEnabled();
  await expect(page.locator('#qr-transparent-bg')).not.toBeChecked();
  await expect(page.locator('#qr-error-correction')).toHaveValue('M');
  await expect(page.locator('#qr-format')).toHaveValue('png');
  await expect(page.locator('#qr-dot-style')).toHaveValue('square');
  await expect(page.locator('#qr-corner-square-style')).toHaveValue('extra-rounded');
  await expect(page.locator('#qr-corner-dot-style')).toHaveValue('dot');
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
  await expect(page.locator('#qr-logo-margin')).toHaveValue('4');
  await expect(page.locator('#qr-logo-margin-value')).toHaveText('4px');
  await expect(downloadButton).toBeVisible({ timeout: 10_000 });
  await expect(downloadButton).toBeEnabled();
});
