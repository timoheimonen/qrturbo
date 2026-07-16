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

test('service worker removes an obsolete app cache during activation', async ({ page }) => {
  // The policy page does not register a worker, so it can seed the state an
  // existing client would leave behind before the app loads the new worker.
  await page.goto('/privacy.html');
  await page.evaluate(async () => {
    const legacyCache = await caches.open('qrturbo-static-obsolete-e2e');
    await legacyCache.put('/js/app.js', new Response('legacy app'));
  });

  await page.goto('/');
  await waitForControlledServiceWorker(page);

  await expect.poll(async () => page.evaluate(async () => caches.keys()))
    .not.toContain('qrturbo-static-obsolete-e2e');
  await expect.poll(() => getAppStaticCacheName(page)).not.toBeNull();
});

test('offline navigation preserves privacy and terms instead of replacing them with the app shell', async ({ page, context }) => {
  await page.goto('/');
  await waitForControlledServiceWorker(page);

  await context.setOffline(true);
  try {
    const privacyResponse = await page.goto('/privacy.html?language=fi');
    expect(privacyResponse.fromServiceWorker()).toBe(true);
    await expect(page).toHaveTitle(/Privacy Policy/);
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

    const termsResponse = await page.goto('/terms.html');
    expect(termsResponse.fromServiceWorker()).toBe(true);
    await expect(page).toHaveTitle(/Terms of Use/);
    await expect(page.getByRole('heading', { name: 'Terms of Use' })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

test('an online load replaces a stale precached app asset', async ({ page }) => {
  await page.goto('/');
  await waitForControlledServiceWorker(page);

  const cacheName = await getAppStaticCacheName(page);
  expect(cacheName).toBeTruthy();

  await page.evaluate(async name => {
    const cache = await caches.open(name);
    await cache.put('/js/app.js', new Response('window.__staleAppLoaded = true;'));
  }, cacheName);

  await page.reload();
  await expect(page.getByRole('heading', { name: /QRTurbo\.app/i })).toBeVisible();
  expect(await page.evaluate(() => window.__staleAppLoaded === true)).toBe(false);

  await page.locator('#qr-text').fill('https://example.com/fresh-cache');
  await expect(page.locator('#qr-code-text')).toHaveText('https://example.com/fresh-cache');
  await expect(page.locator('#download-btn')).toBeVisible();

  const refreshedSource = await page.evaluate(async name => {
    const response = await (await caches.open(name)).match('/js/app.js');
    return response.text();
  }, cacheName);
  expect(refreshedSource).not.toContain('__staleAppLoaded');
});

test('offline app reload generates and downloads a decodable PNG', async ({ page, context }) => {
  const payload = 'https://example.com/offline-qr';

  await page.goto('/');
  await waitForControlledServiceWorker(page);
  await expect.poll(() => getAppStaticCacheName(page)).not.toBeNull();

  await context.setOffline(true);
  try {
    const response = await page.reload({ waitUntil: 'domcontentloaded' });
    expect(response.fromServiceWorker()).toBe(true);
    await expect(page.getByRole('heading', { name: /QRTurbo\.app/i })).toBeVisible();

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
