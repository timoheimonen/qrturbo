// The hash suffix fingerprints every entry in PRECACHE_URLS. The PWA integrity
// test intentionally fails when a precached file changes without a new suffix.
const CACHE_VERSION = 'v7-c3ff99adbc37';
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

// Pre-rendered pages for other languages live under /<lang>/. They are cached
// when visited, and a language's home page is the offline fallback for it.
const LANGUAGE_HOMES = new Set(['da', 'de', 'es', 'fi', 'fr', 'it', 'ja', 'ko', 'no', 'sv', 'zh'].map(lang => `/${lang}/`));

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

function isHtmlResponse(response) {
    return /text\/html/i.test(response.headers.get('content-type') || '');
}

function languageHomeFor(pathname) {
    const home = `/${pathname.split('/')[1] || ''}/`;
    return LANGUAGE_HOMES.has(home) ? home : null;
}

async function updateCachedNavigation(pathname, response) {
    if (!PRECACHE_PATHS.has(pathname) && !isHtmlResponse(response)) {
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
        // Prefer the requested document (including privacy and terms), then
        // the home page in the same language, before the English app shell.
        // Queries do not create separate pages.
        const requestedPage = await cachedPath(pathname);
        if (requestedPage) {
            return requestedPage;
        }

        const languageHome = languageHomeFor(pathname);
        const languagePage = languageHome && await cachedPath(languageHome);
        if (languagePage) {
            return languagePage;
        }

        return cachedPath('/index.html');
    }
}

// The first visit happens before the worker controls the page, so the page
// asks the worker to keep a copy of itself (and of its language home page).
async function cachePageForOffline(pathname) {
    const paths = new Set([pathname, languageHomeFor(pathname)].filter(Boolean));

    await Promise.all([...paths].map(async path => {
        try {
            const response = await fetch(requestWithCacheMode(new URL(path, self.location.origin), 'no-cache'));
            if (response.ok && isHtmlResponse(response)) {
                await tryPutInStaticCache(path, response);
            }
        } catch {
            // Offline or unavailable: the page simply is not cached yet.
        }
    }));
}

self.addEventListener('message', event => {
    const data = event.data;
    if (!data || data.type !== 'cache-page' || typeof data.path !== 'string') {
        return;
    }

    const url = new URL(data.path, self.location.origin);
    if (url.origin !== self.location.origin) {
        return;
    }

    event.waitUntil(cachePageForOffline(url.pathname));
});

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
