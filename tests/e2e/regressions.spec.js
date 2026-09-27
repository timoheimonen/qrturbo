const fs = require('node:fs');
const { test, expect } = require('@playwright/test');

test('switching to an untouched empty tab does not announce a validation error', async ({ page }) => {
  await page.goto('/');
  await page.clock.install();

  await page.getByRole('tab', { name: 'vCard' }).click();
  await page.clock.runFor(1_000);

  await expect(page.locator('#form-error')).toBeHidden();
});

test('editing input removes the stale QR immediately and preserves exact URL/Text data', async ({ page }) => {
  await page.goto('/');

  await page.locator('#qr-text').fill('first revision');
  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });

  const exactValue = '  second revision  ';
  await page.locator('#qr-text').fill(exactValue);

  await expect(page.locator('#download-btn')).toBeHidden();
  await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toHaveCount(0);

  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });
  expect(await page.locator('#qr-code-text').textContent()).toBe(exactValue);
});

test('capacity failures are visible and leave no stale downloadable QR', async ({ page }) => {
  await page.goto('/');
  await page.locator('#customize-toggle').click();
  await page.locator('#qr-error-correction').selectOption('H');
  await page.locator('#qr-text').fill('a'.repeat(2000));

  const formError = page.locator('#form-error');
  await expect(formError).toBeVisible({ timeout: 15_000 });
  await expect(formError).not.toHaveText('alerts.dataTooLong');
  await expect(page.locator('#download-btn')).toBeHidden();
  await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toHaveCount(0);
});

test('representative scan risks render translated user-facing warnings', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('a'.repeat(800));
  await page.locator('#customize-toggle').click();
  await page.locator('#qr-fg-color-text').fill('#eeeeee');
  await page.locator('#qr-transparent-bg').check();

  const warnings = page.locator('#scan-warnings');
  await expect(warnings).toBeVisible({ timeout: 10_000 });
  const expectedWarnings = await page.evaluate(() => [
    t('warnings.lowContrast'),
    t('warnings.transparentBackground'),
    t('warnings.denseData')
  ]);
  await expect(warnings.locator('p')).toHaveText(expectedWarnings);
});

test('SVG preview scales to fit the preview area instead of being cropped', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('https://example.com/svg-preview');
  await page.locator('#customize-toggle').click();
  await page.locator('#size-select').selectOption('1024');
  await page.locator('#qr-format').selectOption('svg');

  const svg = page.locator('#qr-canvas-container svg');
  await expect(svg).toBeVisible({ timeout: 10_000 });
  await expect(svg).toHaveAttribute('viewBox', '0 0 1024 1024');

  const fits = await page.evaluate(() => {
    const stage = document.querySelector('.qr-stage').getBoundingClientRect();
    const preview = document.querySelector('#qr-canvas-container svg').getBoundingClientRect();
    return preview.width > 0
      && preview.left >= stage.left && preview.right <= stage.right
      && preview.top >= stage.top && preview.bottom <= stage.bottom;
  });
  expect(fits).toBe(true);
});

test('WiFi password is hidden by default, can be revealed, and never reaches the PDF', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill(' Private:Network ');
  await page.locator('#wifi-password').fill('supersecret');

  const payloadText = page.locator('#qr-code-text');
  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });
  await expect(payloadText).not.toContainText('supersecret');
  await expect(payloadText).not.toContainText('WIFI:');
  await expect(payloadText).not.toHaveText('misc.wifiPayloadHidden');

  await page.locator('#payload-reveal-btn').click();
  await expect(payloadText).toContainText('P:supersecret;');
  await expect(payloadText).toContainText('S: Private\\:Network ;');

  await page.locator('#payload-reveal-btn').click();
  await expect(payloadText).not.toContainText('supersecret');

  await page.locator('#customize-toggle').click();
  await page.locator('#qr-format').selectOption('pdf');
  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  const download = await downloadPromise;
  const pdf = fs.readFileSync(await download.path()).toString('latin1');

  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(pdf.startsWith('%PDF-')).toBe(true);
  expect(pdf).toContain('/Subtype /Image');
  expect(pdf).not.toContain('supersecret');
  expect(pdf).not.toContain('WIFI:');
});
