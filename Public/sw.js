// The hash suffix fingerprints every entry in PRECACHE_URLS. The PWA integrity
// test intentionally fails when a precached file changes without a new suffix.
const CACHE_VERSION = 'v5-1d33ad336fe8';
const STATIC_CACHE = `qrturbo-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/privacy.html',
    '/terms.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/qr-code-styling.min.js',
    '/js/i18n/core.js',
    '/js/i18n/locales/da.js',
    '/js/i18n/locales/de.js',
    '/js/i18n/locales/es.js',
    '/js/i18n/locales/fi.js',
    '/js/i18n/locales/fr.js',
    '/js/i18n/locales/it.js',
    '/js/i18n/locales/ja.js',
    '/js/i18n/locales/ko.js',
    '/js/i18n/locales/no.js',
    '/js/i18n/locales/sv.js',
    '/js/i18n/locales/zh.js',
    '/manifest.json',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png'
];

const PRECACHE_PATHS = new Set(PRECACHE_URLS);

function requestWithCacheMode(request, cacheMode) {
    return new Request(request, { cache: cacheMode });
}

async function putInStaticCache(cacheKey, response) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(cacheKey, response.clone());
}

async function tryPutInStaticCache(cacheKey, response) {
    try {
        await putInStaticCache(cacheKey, response);
    } catch {
        // A full or unavailable Cache API must not discard a valid response
        // that has already arrived from the network.
    }
}

self.addEventListener('install', event => {
    const freshPrecacheRequests = PRECACHE_URLS.map(url => (
        requestWithCacheMode(new URL(url, self.location.origin), 'reload')
    ));

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(freshPrecacheRequests))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(cacheName => cacheName.startsWith('qrturbo-') && cacheName !== STATIC_CACHE)
                    .map(cacheName => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

async function cachedPath(pathname) {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match(pathname, { ignoreSearch: true });
}

async function freshAsset(request) {
    const { pathname } = new URL(request.url);

    try {
        // Revalidate even when the service worker itself has not changed. This
        // prevents a long-lived cache from pinning an old app.js or locale file.
        const response = await fetch(requestWithCacheMode(request, 'no-cache'));
        if (response.ok) {
            await tryPutInStaticCache(pathname, response);
            return response;
        }

        return (await cachedPath(pathname)) || response;
    } catch {
        return cachedPath(pathname);
    }
}

async function updateCachedNavigation(pathname, response) {
    if (!PRECACHE_PATHS.has(pathname)) {
        return;
    }

    await tryPutInStaticCache(pathname, response);

    // The origin root and index.html are aliases. Keep both copies current so
    // the generic offline fallback cannot lag behind the most recent page load.
    if (pathname === '/') {
        await tryPutInStaticCache('/index.html', response);
    } else if (pathname === '/index.html') {
        await tryPutInStaticCache('/', response);
    }
}

async function navigationFallback(request) {
    const { pathname } = new URL(request.url);

    try {
        const response = await fetch(requestWithCacheMode(request, 'no-cache'));
        if (response.ok) {
            await updateCachedNavigation(pathname, response);
        }
        return response;
    } catch {
        // Prefer the requested document (including privacy and terms) before
        // falling back to the app shell. Queries do not create separate pages.
        const requestedPage = await cachedPath(pathname);
        if (requestedPage) {
            return requestedPage;
        }

        return cachedPath('/index.html');
    }
}

self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(navigationFallback(request));
        return;
    }

    if (PRECACHE_PATHS.has(url.pathname)) {
        event.respondWith(freshAsset(request));
    }
});
