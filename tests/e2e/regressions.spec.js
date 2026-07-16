const fs = require('node:fs');
const { test, expect } = require('@playwright/test');

test('switching to an untouched empty tab does not announce a validation error', async ({ page }) => {
  await page.goto('/');
  await page.clock.install();

  await page.getByRole('tab', { name: 'vCard' }).click();
  await page.clock.runFor(1_000);

  await expect(page.locator('#form-error')).toBeHidden();
});

test('editing input invalidates the old QR immediately and preserves exact URL/Text data', async ({ page }) => {
  await page.goto('/');

  await page.locator('#qr-text').fill('first revision');
  await expect(page.locator('#download-btn')).toBeVisible();

  const exactValue = '  second revision  ';
  await page.locator('#qr-text').fill(exactValue);

  await expect(page.locator('#download-btn')).toBeHidden();
  await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toHaveCount(0);

  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });
  expect(await page.locator('#qr-code-text').textContent()).toBe(exactValue);

  await page.locator('#qr-text').fill('   ');
  const formError = page.locator('#form-error');
  await expect(page.locator('#download-btn')).toBeHidden();
  await expect(formError).toBeVisible({ timeout: 10_000 });
  await expect(formError).toHaveText(/\S/);
  await expect(formError).not.toHaveText('alerts.enterText');
});

test('capacity failures are visible and leave no stale downloadable QR', async ({ page }) => {
  await page.goto('/');
  await page.locator('#customize-toggle').click();
  await page.locator('#qr-error-correction').selectOption('H');
  await page.locator('#qr-text').fill('a'.repeat(2000));

  const formError = page.locator('#form-error');
  await expect(formError).toBeVisible({ timeout: 15_000 });
  await expect(formError).toHaveText(/\S/);
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
  await expect(warnings).not.toContainText('warnings.');
});

test('WiFi password is hidden by default, can be revealed, and is not copied into PDF text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill(' Private:Network ');
  await page.locator('#wifi-password').fill('supersecret');

  const payloadText = page.locator('#qr-code-text');
  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });
  await expect(payloadText).toHaveText(/\S/);
  await expect(payloadText).not.toContainText('supersecret');
  await expect(payloadText).not.toContainText('WIFI:');
  await expect(payloadText).not.toHaveText('misc.wifiPayloadHidden');
  await expect(page.locator('#payload-reveal-btn')).toBeVisible();

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

  expect(pdf).not.toContain('supersecret');
  expect(pdf).not.toContain('WIFI:');
});

test('language changes update an active validation error and hidden WiFi payload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('   ');
  const formError = page.locator('#form-error');
  await expect(formError).toBeVisible();
  const englishValidationError = await formError.innerText();

  await page.locator('#lang-select').selectOption('fi');
  await expect(formError).toBeVisible();
  await expect(formError).toHaveText(/\S/);
  await expect(formError).not.toHaveText(englishValidationError);
  await expect(formError).not.toHaveText('alerts.enterText');

  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill('Private');
  await page.locator('#wifi-password').fill('supersecret');
  const payloadText = page.locator('#qr-code-text');
  await expect(payloadText).toBeVisible();
  await expect(payloadText).toHaveText(/\S/);
  await expect(payloadText).not.toContainText('supersecret');
  const finnishHiddenPayload = await payloadText.innerText();

  await page.locator('#lang-select').selectOption('en');
  await expect(payloadText).toBeVisible();
  await expect(payloadText).toHaveText(/\S/);
  await expect(payloadText).not.toHaveText(finnishHiddenPayload);
  await expect(payloadText).not.toHaveText('misc.wifiPayloadHidden');
  await expect(payloadText).not.toContainText('supersecret');
});
