const { test, expect } = require('@playwright/test');

const { decodeQrDownload } = require('../helpers/qr-decoder');

async function waitForControlledServiceWorker(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;

    await new Promise(resolve => {
      navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
    });
  });
}

async function getAppStaticCacheName(page) {
  return page.evaluate(async () => {
    const appCacheNames = [];

    for (const name of await caches.keys()) {
      if (!name.startsWith('qrturbo-static-')) continue;
      const cache = await caches.open(name);
      if (await cache.match('/js/app.js')) appCacheNames.push(name);
    }

    return appCacheNames.length === 1 ? appCacheNames[0] : null;
  });
}

// Cache migration and navigation fallback rules are covered by the service
// worker unit tests; this proves the advertised offline promise in a real browser.
test('offline app reload generates and downloads a decodable PNG', async ({ page, context }) => {
  const payload = 'https://example.com/offline-qr';

  await page.goto('/');
  await waitForControlledServiceWorker(page);
  await expect.poll(() => getAppStaticCacheName(page)).not.toBeNull();

  await context.setOffline(true);
  try {
    const response = await page.reload({ waitUntil: 'domcontentloaded' });
    expect(response.fromServiceWorker()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.locator('#qr-text').fill(payload);
    await expect(page.locator('#qr-code-text')).toHaveText(payload, { timeout: 10_000 });
    await expect(page.locator('#qr-canvas-container canvas')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#download-btn').click();
    const decoded = await decodeQrDownload(page, await downloadPromise);

    expect(decoded.filename).toMatch(/\.png$/i);
    expect(decoded.data).toBe(payload);
  } finally {
    await context.setOffline(false);
  }
});
