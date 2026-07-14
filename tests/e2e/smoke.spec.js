const fs = require('node:fs');
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
  await expect(page).toHaveTitle(/QRTurbo\.app/);
  await expect(page.getByRole('heading', { name: /QRTurbo\.app/i })).toBeVisible();
  await expect(page.locator('#char-count')).toHaveText('0 / 2000 characters');

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

test('Social Media QR generation supports single-platform profile links', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'Social Media' }).click();
  await expect(page.locator('#SocialMedia')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Social Media' })).toHaveAttribute('aria-selected', 'true');

  await page.locator('#social-platform').selectOption('instagram');
  await page.locator('#social-handle').fill('@qr.turbo');

  await expect(page.locator('#social-preview-url')).toHaveText('https://www.instagram.com/qr.turbo/');
  await expect(page.locator('#qr-code-text')).toContainText('https://www.instagram.com/qr.turbo/', {
    timeout: 10_000
  });
  await expect(page.locator('#download-btn')).toBeVisible();

  await page.locator('#social-platform').selectOption('linkedin');
  await expect(page.locator('#social-profile-type-group')).toBeVisible();
  await page.locator('#social-profile-type').selectOption('company');
  await page.locator('#social-handle').fill('qr-turbo');
  await expect(page.locator('#qr-code-text')).toContainText('https://www.linkedin.com/company/qr-turbo', {
    timeout: 10_000
  });
});

test('WhatsApp username QR omits the at sign and keeps the encoded message', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'WhatsApp' }).click();
  await page.locator('#whatsapp-phone').fill('@qr.turbo');
  await page.locator('#whatsapp-message').fill('Hello username!');

  await expect(page.locator('#qr-code-text')).toHaveText(
    'https://wa.me/qr.turbo?text=Hello%20username!',
    { timeout: 10_000 }
  );
  await expect(page.locator('#download-btn')).toBeVisible();
});

test('PDF export downloads a valid PDF file in the browser', async ({ page }) => {
  await page.goto('/');

  await page.locator('#qr-text').fill('https://example.com/pdf-export');
  await page.locator('#customize-toggle').click();
  await expect(page.locator('#customize-panel')).toBeVisible();
  await page.locator('#qr-format').selectOption('pdf');
  await expect(page.locator('#qr-canvas-container canvas')).toBeVisible({
    timeout: 10_000
  });

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const buffer = fs.readFileSync(downloadPath);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(buffer.toString('latin1')).toContain('/Subtype /Image');
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
  await expect(page.locator('#qr-margin-value')).toHaveText('4 modules');
});

test('language and theme selectors persist browser state', async ({ page }) => {
  await page.goto('/');

  await page.locator('#lang-select').selectOption('fi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('[data-i18n="fields.textOrUrl"]')).toHaveText('Teksti tai URL');

  await page.locator('[data-theme-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
