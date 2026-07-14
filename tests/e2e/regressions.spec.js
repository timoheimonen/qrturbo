const fs = require('node:fs');
const { test, expect } = require('@playwright/test');

test('switching to an untouched empty tab does not announce a validation error', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'vCard' }).click();
  await page.waitForTimeout(600);

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
  await expect(page.locator('#download-btn')).toBeHidden();
  await expect(page.locator('#form-error')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#form-error')).toContainText('enter some text');
});

test('capacity failures are visible and leave no stale downloadable QR', async ({ page }) => {
  await page.goto('/');
  await page.locator('#customize-toggle').click();
  await page.locator('#qr-error-correction').selectOption('H');
  await page.locator('#qr-text').fill('a'.repeat(2000));

  await expect(page.locator('#form-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#form-error')).toContainText('too large');
  await expect(page.locator('#download-btn')).toBeHidden();
  await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toHaveCount(0);
});

test('WiFi password is hidden by default, can be revealed, and is not copied into PDF text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill(' Private:Network ');
  await page.locator('#wifi-password').fill('supersecret');

  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#qr-code-text')).toHaveText('WiFi configuration — password hidden');
  await expect(page.locator('#payload-reveal-btn')).toBeVisible();

  await page.locator('#payload-reveal-btn').click();
  await expect(page.locator('#qr-code-text')).toContainText('P:supersecret;');
  await expect(page.locator('#qr-code-text')).toContainText('S: Private\\:Network ;');

  await page.locator('#payload-reveal-btn').click();
  await expect(page.locator('#qr-code-text')).not.toContainText('supersecret');

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
  await expect(page.locator('#form-error')).toContainText('enter some text');

  await page.locator('#lang-select').selectOption('fi');
  await expect(page.locator('#form-error')).toHaveText('Anna teksti tai URL');

  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill('Private');
  await page.locator('#wifi-password').fill('supersecret');
  await expect(page.locator('#qr-code-text')).toHaveText('WiFi-määritys — salasana piilotettu');

  await page.locator('#lang-select').selectOption('en');
  await expect(page.locator('#qr-code-text')).toHaveText('WiFi configuration — password hidden');
});
