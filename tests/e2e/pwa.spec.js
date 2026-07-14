const { test, expect } = require('@playwright/test');

async function waitForControlledServiceWorker(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;

    await new Promise(resolve => {
      navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
    });
  });
}

test('service worker removes a legacy v4 cache during activation', async ({ page }) => {
  // The policy page does not register a worker, so it can seed the state an
  // existing v4 client would leave behind before the app loads the new worker.
  await page.goto('/privacy.html');
  await page.evaluate(async () => {
    const legacyCache = await caches.open('qrturbo-static-v4');
    await legacyCache.put('/js/app.js', new Response('legacy app'));
  });

  await page.goto('/');
  await waitForControlledServiceWorker(page);

  await expect.poll(async () => page.evaluate(async () => caches.keys())).not.toContain('qrturbo-static-v4');
  const cacheNames = await page.evaluate(async () => caches.keys());
  expect(cacheNames.some(name => /^qrturbo-static-v5-[a-f0-9]{12}$/.test(name))).toBe(true);
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

  const cacheName = await page.evaluate(async () => (
    (await caches.keys()).find(name => /^qrturbo-static-v5-[a-f0-9]{12}$/.test(name))
  ));
  expect(cacheName).toBeTruthy();

  await page.evaluate(async name => {
    const cache = await caches.open(name);
    await cache.put('/js/app.js', new Response('window.__staleAppLoaded = true;'));
  }, cacheName);

  await page.reload();
  await expect(page.getByRole('heading', { name: /QRTurbo\.app/i })).toBeVisible();
  expect(await page.evaluate(() => window.__staleAppLoaded === true)).toBe(false);

  const refreshedSource = await page.evaluate(async name => {
    const response = await (await caches.open(name)).match('/js/app.js');
    return response.text();
  }, cacheName);
  expect(refreshedSource).toContain('registerServiceWorker');
  expect(refreshedSource).not.toContain('__staleAppLoaded');
});
