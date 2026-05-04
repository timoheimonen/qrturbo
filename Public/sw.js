const CACHE_VERSION = 'v2';
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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
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

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response.clone());
    }
    return response;
}

async function navigationFallback(request) {
    try {
        return await fetch(request);
    } catch {
        return caches.match('/index.html');
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
        event.respondWith(cacheFirst(request));
    }
});
