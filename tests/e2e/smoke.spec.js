const { test, expect } = require('@playwright/test');

async function expectGeneratedQr(page) {
  await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toBeVisible({
    timeout: 10_000
  });
  await expect(page.locator('#download-btn')).toBeVisible();
  await expect(page.locator('#download-btn')).toBeEnabled();
}

test('home page generates a QR code without any external requests @webkit-core', async ({ page }) => {
  const requestedUrls = [];
  page.on('request', request => {
    requestedUrls.push(request.url());
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/QRTurbo\.app/);
  await expect(page.getByRole('heading', { level: 1, name: /QRTurbo\.app/i })).toBeVisible();

  await page.locator('#qr-text').fill('https://example.com');
  await expect(page.locator('#qr-code-text')).toHaveText('https://example.com', { timeout: 10_000 });
  await expectGeneratedQr(page);

  const appOrigin = new URL(page.url()).origin;
  expect(requestedUrls.filter(url => new URL(url).origin !== appOrigin)).toEqual([]);
});

test('language and theme choices persist across reloads', async ({ page }) => {
  await page.goto('/');
  const fieldLabel = page.locator('[data-i18n="fields.textOrUrl"]');
  const englishLabel = await fieldLabel.innerText();

  await page.locator('#lang-select').selectOption('fi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(fieldLabel).not.toHaveText(englishLabel);
  const finnishLabel = await fieldLabel.innerText();

  await page.locator('[data-theme-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(fieldLabel).toHaveText(finnishLabel);
});

test('mobile layout keeps the preview and download within the viewport @mobile-smoke', async ({ page, isMobile }) => {
  expect(isMobile).toBe(true);
  await page.goto('/');

  await page.locator('#qr-text').fill('https://example.com/mobile-smoke');
  await expectGeneratedQr(page);

  const layoutFitsViewport = await page.evaluate(() => {
    const preview = document.querySelector('#qr-canvas-container canvas, #qr-canvas-container svg');
    const download = document.getElementById('download-btn');
    const elementsFit = [preview, download].every(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= window.innerWidth;
    });

    return elementsFit && document.documentElement.scrollWidth <= window.innerWidth;
  });

  expect(layoutFitsViewport).toBe(true);
});
