const { test, expect } = require('@playwright/test');

// The preview is always an inline SVG. Download is never hidden: it is
// aria-disabled until the stage shows a code for the current input.
async function expectGeneratedQr(page) {
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(page.locator('#qr-canvas-container svg')).toBeVisible();
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
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

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
  await expect.poll(() => new URL(page.url()).pathname).toBe('/fi/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(fieldLabel).not.toHaveText(englishLabel);
  const finnishLabel = await fieldLabel.innerText();

  await page.locator('[data-theme-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goto('/');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/fi/');
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
    const preview = document.querySelector('#qr-canvas-container svg');
    const download = document.getElementById('download-btn');
    const elementsFit = [preview, download].every(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.width > 0 && bounds.left >= 0 && bounds.right <= window.innerWidth;
    });

    // The logo and the header controls must not overlap.
    const logo = document.querySelector('.logo-mark');
    const logoRight = logo.getBoundingClientRect().left + logo.scrollWidth;
    const headerClear = logoRight <= document.querySelector('.header-actions').getBoundingClientRect().left;

    return elementsFit && headerClear && document.documentElement.scrollWidth <= window.innerWidth;
  });

  expect(layoutFitsViewport).toBe(true);

  // The ".app" of the wordmark stays visible on narrow phones.
  await page.setViewportSize({ width: 360, height: 780 });
  const tld = page.locator('.logo-tld');
  await expect(tld).toBeVisible();
  const tldFits = await tld.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const actions = document.querySelector('.header-actions').getBoundingClientRect();
    return bounds.width > 0 && bounds.left >= 0 && bounds.right <= actions.left
      && document.documentElement.scrollWidth <= window.innerWidth;
  });
  expect(tldFits).toBe(true);
});
