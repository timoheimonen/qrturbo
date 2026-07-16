const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { repoRoot } = require('../helpers/app-vm');

const publicDir = path.join(repoRoot, 'Public');
const workerPath = path.join(publicDir, 'sw.js');
const workerSource = fs.readFileSync(workerPath, 'utf8');
const origin = 'https://qrturbo.test';

function extractWorkerMetadata() {
  const version = workerSource.match(/const CACHE_VERSION = '([^']+)'/);
  const urls = workerSource.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);

  assert.ok(version, 'Could not find CACHE_VERSION in sw.js');
  assert.ok(urls, 'Could not find PRECACHE_URLS in sw.js');

  return {
    version: version[1],
    cacheName: `qrturbo-static-${version[1]}`,
    urls: [...urls[1].matchAll(/'([^']+)'/g)].map(match => match[1])
  };
}

function precacheFingerprint(urls) {
  const digest = crypto.createHash('sha256');

  for (const url of [...urls].sort()) {
    const relativePath = url === '/' ? 'index.html' : url.replace(/^\//, '');
    digest.update(url);
    digest.update('\0');
    digest.update(fs.readFileSync(path.join(publicDir, relativePath)));
    digest.update('\0');
  }

  return digest.digest('hex').slice(0, 12);
}

function normalizedKey(input, ignoreSearch = false) {
  const rawUrl = typeof input === 'string' || input instanceof URL
    ? input.toString()
    : input.url;
  const url = new URL(rawUrl, origin);
  if (ignoreSearch) {
    url.search = '';
  }
  return url.href;
}

function cloned(response) {
  return typeof response.clone === 'function' ? response.clone() : response;
}

function makeHarness({ cacheNames = [], fetchImpl, cachePutError = false } = {}) {
  const listeners = new Map();
  const stores = new Map();
  const deletedCaches = [];
  const networkRequests = [];
  let skipWaitingCalled = false;
  let clientsClaimed = false;

  function makeStore() {
    const entries = new Map();
    const addAllCalls = [];

    return {
      entries,
      addAllCalls,
      async addAll(requests) {
        addAllCalls.push([...requests]);
        for (const request of requests) {
          entries.set(normalizedKey(request), new Response(`precache:${new URL(request.url).pathname}`));
        }
      },
      async put(key, response) {
        if (cachePutError) {
          throw new Error('Cache quota exceeded');
        }
        entries.set(normalizedKey(key), cloned(response));
      },
      async match(key, options = {}) {
        const expected = normalizedKey(key, options.ignoreSearch);
        for (const [storedKey, response] of entries) {
          if (normalizedKey(storedKey, options.ignoreSearch) === expected) {
            return cloned(response);
          }
        }
        return undefined;
      }
    };
  }

  for (const name of cacheNames) {
    stores.set(name, makeStore());
  }

  const caches = {
    async open(name) {
      if (!stores.has(name)) {
        stores.set(name, makeStore());
      }
      return stores.get(name);
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      deletedCaches.push(name);
      return stores.delete(name);
    },
    async match(key, options = {}) {
      for (const store of stores.values()) {
        const response = await store.match(key, options);
        if (response) return response;
      }
      return undefined;
    }
  };

  const self = {
    location: { origin },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    async skipWaiting() {
      skipWaitingCalled = true;
    },
    clients: {
      async claim() {
        clientsClaimed = true;
      }
    }
  };

  const context = vm.createContext({
    caches,
    console,
    fetch: async request => {
      networkRequests.push(request);
      if (!fetchImpl) throw new TypeError('offline');
      return fetchImpl(request);
    },
    Request,
    Response,
    self,
    Set,
    URL
  });
  vm.runInContext(workerSource, context, { filename: workerPath });

  async function dispatchLifecycle(type) {
    let work;
    listeners.get(type)({
      waitUntil(promise) {
        work = promise;
      }
    });
    await work;
  }

  async function dispatchFetch(request) {
    let response;
    listeners.get('fetch')({
      request,
      respondWith(promise) {
        response = promise;
      }
    });
    return response;
  }

  return {
    caches,
    deletedCaches,
    dispatchFetch,
    dispatchLifecycle,
    get clientsClaimed() { return clientsClaimed; },
    get skipWaitingCalled() { return skipWaitingCalled; },
    networkRequests,
    stores
  };
}

function navigationRequest(pathname) {
  const request = new Request(`${origin}${pathname}`);
  Object.defineProperty(request, 'mode', { value: 'navigate' });
  return request;
}

test('precache content fingerprint is part of the cache version', () => {
  const { version, urls } = extractWorkerMetadata();
  const versionMatch = version.match(/^v(\d+)-([a-f0-9]{12})$/);

  assert.ok(versionMatch, 'CACHE_VERSION must contain a release number and 12-character content fingerprint');
  assert.ok(Number(versionMatch[1]) > 4, 'CACHE_VERSION must migrate clients beyond v4');
  const expectedFingerprint = precacheFingerprint(urls);
  assert.equal(
    versionMatch[2],
    expectedFingerprint,
    `Precached content changed; update CACHE_VERSION to v${versionMatch[1]}-${expectedFingerprint}`
  );
});

test('install bypasses the HTTP cache and immediately activates the new worker', async () => {
  const { cacheName, urls } = extractWorkerMetadata();
  const harness = makeHarness();

  await harness.dispatchLifecycle('install');

  const calls = harness.stores.get(cacheName).addAllCalls;
  assert.equal(calls.length, 1);
  assert.equal(calls[0].length, urls.length);
  assert.ok(calls[0].every(request => request.cache === 'reload'));
  assert.equal(harness.skipWaitingCalled, true);
});

test('activation migrates v4 clients and preserves only the current QRTurbo cache', async () => {
  const { cacheName } = extractWorkerMetadata();
  const harness = makeHarness({
    cacheNames: ['qrturbo-static-v4', 'qrturbo-runtime-v3', cacheName, 'another-app-v1']
  });

  await harness.dispatchLifecycle('activate');

  assert.deepEqual(harness.deletedCaches.sort(), ['qrturbo-runtime-v3', 'qrturbo-static-v4']);
  assert.deepEqual((await harness.caches.keys()).sort(), ['another-app-v1', cacheName].sort());
  assert.equal(harness.clientsClaimed, true);
});

test('offline navigation serves the requested cached document before index fallback', async () => {
  const { cacheName } = extractWorkerMetadata();
  const harness = makeHarness({ cacheNames: [cacheName] });
  const cache = await harness.caches.open(cacheName);
  await cache.put('/index.html', new Response('INDEX'));
  await cache.put('/privacy.html', new Response('PRIVACY'));
  await cache.put('/terms.html', new Response('TERMS'));

  assert.equal(
    await (await harness.dispatchFetch(navigationRequest('/privacy.html?language=fi'))).text(),
    'PRIVACY'
  );
  assert.equal(
    await (await harness.dispatchFetch(navigationRequest('/terms.html'))).text(),
    'TERMS'
  );
  assert.equal(
    await (await harness.dispatchFetch(navigationRequest('/not-precached'))).text(),
    'INDEX'
  );
});

test('online navigation refreshes the exact offline document', async () => {
  const { cacheName } = extractWorkerMetadata();
  const harness = makeHarness({
    cacheNames: [cacheName],
    fetchImpl: async () => new Response('NEW PRIVACY', { status: 200 })
  });
  const cache = await harness.caches.open(cacheName);
  await cache.put('/privacy.html', new Response('OLD PRIVACY'));

  const response = await harness.dispatchFetch(navigationRequest('/privacy.html'));

  assert.equal(await response.text(), 'NEW PRIVACY');
  assert.equal(await (await cache.match('/privacy.html')).text(), 'NEW PRIVACY');
  assert.equal(harness.networkRequests[0].cache, 'no-cache');
});

test('precache assets revalidate online and use the refreshed response offline', async () => {
  const { cacheName } = extractWorkerMetadata();
  let online = true;
  const harness = makeHarness({
    cacheNames: [cacheName],
    fetchImpl: async () => {
      if (!online) throw new TypeError('offline');
      return new Response('NEW APP', { status: 200 });
    }
  });
  const cache = await harness.caches.open(cacheName);
  await cache.put('/js/app.js', new Response('OLD APP'));
  const request = new Request(`${origin}/js/app.js`);

  assert.equal(await (await harness.dispatchFetch(request)).text(), 'NEW APP');
  assert.equal(await (await cache.match('/js/app.js')).text(), 'NEW APP');
  assert.equal(harness.networkRequests[0].cache, 'no-cache');

  online = false;
  assert.equal(await (await harness.dispatchFetch(request)).text(), 'NEW APP');
});

test('cache write failures do not discard successful network responses', async () => {
  const harness = makeHarness({
    cachePutError: true,
    fetchImpl: async request => new Response(`NETWORK:${new URL(request.url).pathname}`, { status: 200 })
  });

  const asset = await harness.dispatchFetch(new Request(`${origin}/js/app.js`));
  assert.equal(await asset.text(), 'NETWORK:/js/app.js');

  const navigation = await harness.dispatchFetch(navigationRequest('/privacy.html'));
  assert.equal(await navigation.text(), 'NETWORK:/privacy.html');
});
