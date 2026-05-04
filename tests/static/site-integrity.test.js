const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { repoRoot } = require('../helpers/app-vm');

const publicDir = path.join(repoRoot, 'Public');

function readPublicFile(filePath) {
  return fs.readFileSync(path.join(publicDir, filePath), 'utf8');
}

function extractAttributeValues(html, attribute) {
  const values = [];
  const regex = new RegExp(`${attribute}=["']([^"']+)["']`, 'g');
  for (const match of html.matchAll(regex)) {
    values.push(match[1]);
  }
  return values;
}

function assertPublicAssetExists(assetPath) {
  if (!assetPath.startsWith('/') && !assetPath.startsWith('css/') && !assetPath.startsWith('js/')) {
    return;
  }

  const normalized = assetPath.replace(/^\//, '');
  assert.ok(
    fs.existsSync(path.join(publicDir, normalized)),
    `Expected public asset to exist: ${assetPath}`
  );
}

test('HTML references only existing local scripts, styles, icons and manifest assets', () => {
  const html = readPublicFile('index.html');
  const manifest = JSON.parse(readPublicFile('manifest.json'));

  for (const src of extractAttributeValues(html, 'src')) {
    assertPublicAssetExists(src);
  }

  for (const href of extractAttributeValues(html, 'href')) {
    assertPublicAssetExists(href);
  }

  for (const icon of manifest.icons) {
    assertPublicAssetExists(icon.src);
  }
});

test('service worker precache list points to existing public assets', () => {
  const sw = readPublicFile('sw.js');
  const precacheMatch = sw.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);
  assert.ok(precacheMatch, 'Could not find PRECACHE_URLS in sw.js');

  const precacheUrls = [...precacheMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
  assert.ok(precacheUrls.includes('/'));
  assert.ok(precacheUrls.includes('/index.html'));

  for (const url of precacheUrls) {
    if (url === '/') continue;
    assertPublicAssetExists(url);
  }
});

test('SEO metadata and structured data are present and parseable', () => {
  const html = readPublicFile('index.html');

  assert.match(html, /<title>Free QR Code Generator with Logos & Colors \| QRTurbo\.app<\/title>/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/qrturbo\.app\/">/);
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /<meta name="twitter:card"/);

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLdMatch, 'Missing JSON-LD script');

  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.equal(jsonLd['@type'], 'WebApplication');
  assert.equal(jsonLd.name, 'QRTurbo.app');
  assert.equal(jsonLd.url, 'https://qrturbo.app/');
});

test('hreflang alternates match supported languages', () => {
  const html = readPublicFile('index.html');
  const supported = ['da', 'de', 'en', 'es', 'fi', 'fr', 'it', 'ja', 'ko', 'no', 'sv', 'zh'];
  const hreflangs = [...html.matchAll(/hreflang="([^"]+)"/g)].map(match => match[1]).sort();

  assert.deepEqual(hreflangs, [...supported, 'x-default'].sort());
});

test('privacy and terms pages are linked and present', () => {
  const html = readPublicFile('index.html');

  assert.match(html, /href="\/privacy\.html"/);
  assert.match(html, /href="\/terms\.html"/);
  assert.match(readPublicFile('privacy.html'), /privacy/i);
  assert.match(readPublicFile('terms.html'), /terms/i);
});

test('robots and sitemap point to the production domain', () => {
  const robots = readPublicFile('robots.txt');
  const sitemap = readPublicFile('sitemap.xml');

  assert.match(robots, /Sitemap: https:\/\/qrturbo\.app\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/qrturbo\.app\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/qrturbo\.app\/privacy\.html<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/qrturbo\.app\/terms\.html<\/loc>/);
});
