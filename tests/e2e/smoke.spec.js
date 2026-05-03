const { test, expect } = require('@playwright/test');

test('home page loads, generates a URL QR code and does not make external requests', async ({ page }) => {
  const externalRequests = [];

  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') {
      externalRequests.push(request.url());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/QRTurbo/);
  await expect(page.getByRole('heading', { name: /QRTurbo/i })).toBeVisible();

  await page.locator('#qr-text').fill('https://example.com');
  await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toBeVisible({
    timeout: 10_000
  });
  await expect(page.locator('#download-btn')).toBeVisible();
  await expect(page.locator('#qr-code-text')).toContainText('https://example.com');

  expect(externalRequests).toEqual([]);
});

test('tabs switch correctly and WiFi QR generation validates the main controls', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'WiFi' }).click();
  await expect(page.locator('#Wifi')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'WiFi' })).toHaveAttribute('aria-selected', 'true');

  await page.locator('#wifi-ssid').fill('Guest');
  await page.locator('#wifi-auth').selectOption('nopass');
  await expect(page.locator('#wifi-password')).toBeDisabled();
  await expect(page.locator('#qr-code-text')).toContainText('WIFI:S:Guest;T:nopass;', {
    timeout: 10_000
  });
});

test('customization panel updates controls and transparent background state', async ({ page }) => {
  await page.goto('/');

  await page.locator('#customize-toggle').click();
  await expect(page.locator('#customize-toggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#customize-panel')).toBeVisible();

  await page.locator('#qr-transparent-bg').check();
  await expect(page.locator('#qr-bg-color')).toBeDisabled();
  await expect(page.locator('#qr-bg-color-text')).toBeDisabled();

  await page.locator('#qr-margin').fill('4');
  await expect(page.locator('#qr-margin-value')).toHaveText('4px');
});

test('language and theme selectors persist browser state', async ({ page }) => {
  await page.goto('/');

  await page.locator('#lang-select').selectOption('fi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('[data-i18n="fields.textOrUrl"]')).toHaveText('Teksti tai URL');

  await page.getByLabel('Dark theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
