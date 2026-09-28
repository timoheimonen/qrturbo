const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { repoRoot } = require('../helpers/app-vm');
const { LANGUAGES, PAGE_TYPES, buildSite, pagePath } = require('../../scripts/build-site');

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

  const normalized = assetPath.replace(/^\//, '').split(/[?#]/, 1)[0];
  assert.ok(
    fs.existsSync(path.join(publicDir, normalized)),
    `Expected public asset to exist: ${assetPath}`
  );
}

test('index asset URLs use the package version as their cache key', () => {
  const html = readPublicFile('index.html');
  const { version } = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const localAssets = [
    ...extractAttributeValues(html, 'src'),
    ...extractAttributeValues(html, 'href')
  ].filter(assetPath => /^(?:\/|css\/|js\/).+\.(?:css|ico|js|json|png)(?:\?|$)/.test(assetPath));

  assert.ok(localAssets.length > 0, 'Expected index.html to reference local assets');
  for (const assetPath of localAssets) {
    assert.equal(
      new URL(assetPath, 'https://qrturbo.test').searchParams.get('v'),
      version,
      `Asset URL must use package version ${version}: ${assetPath}`
    );
  }
});

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

test('every element ID that app.js looks up exists in index.html', () => {
  const html = readPublicFile('index.html');
  const appJs = readPublicFile('js/app.js');
  const htmlIds = new Set(extractAttributeValues(html, '\\sid'));
  const lookupPatterns = [
    /getElementById\('([^']+)'\)/g,
    /getFieldValue\('([^']+)'\)/g,
    /notifyValidation\('[^']+',\s*\w+,\s*'([^']+)'\)/g,
    /setupColorSync\('([^']+)',\s*'([^']+)'/g
  ];
  const usedIds = new Set(lookupPatterns.flatMap(pattern => (
    [...appJs.matchAll(pattern)].flatMap(match => match.slice(1))
  )));

  assert.ok(usedIds.size > 50, 'Expected to find the element lookups in app.js');
  for (const id of usedIds) {
    assert.ok(htmlIds.has(id), `app.js looks up #${id}, which is missing from index.html`);
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

  assert.match(html, /<title>Free QR Code Generator That Never Expires \| QRTurbo\.app<\/title>/);
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
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(match => match[1]).sort();

  assert.deepEqual(hreflangs, [...supported, 'x-default'].sort());
  assert.deepEqual([...LANGUAGES].sort(), supported);
});

test('generated pages are up to date with the template and content', () => {
  const stale = [];
  for (const [file, contents] of buildSite()) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== contents) {
      stale.push(path.relative(repoRoot, file));
    }
  }

  assert.deepEqual(stale, [], 'Run "npm run build" to regenerate the pages');
});

test('every language and type page has its own URL, language and alternates', () => {
  for (const lang of LANGUAGES) {
    for (const page of PAGE_TYPES) {
      const pathname = pagePath(lang, page);
      const html = readPublicFile(`${pathname.slice(1)}index.html`);
      const label = `${lang} ${page.key}`;

      assert.match(html, new RegExp(`<html lang="${lang}">`), label);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://qrturbo\\.app${pathname}">`), label);
      assert.doesNotMatch(html, /\{\{|data-i18n="[^"]+">\s*</, label);

      const alternates = Object.fromEntries(
        [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
          .map(match => [match[1], match[2]])
      );
      for (const code of LANGUAGES) {
        assert.equal(alternates[code], `https://qrturbo.app${pagePath(code, page)}`, `${label} -> ${code}`);
      }
      assert.equal(alternates['x-default'], alternates.en, label);

      // The page opens on its own QR code type.
      assert.match(html, new RegExp(`id="tab-${page.tab}" class="tab-link active"[^>]*aria-selected="true"`), label);
      assert.match(html, new RegExp(`<div id="${page.tab}" class="tab-content"[^>]*style="display: block;"`), label);
      assert.equal((html.match(/class="tab-link active"/g) || []).length, 1, label);
      assert.match(html, new RegExp(`<option value="${lang}" selected>`), label);

      const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(match => JSON.parse(match[1]));
      assert.deepEqual(jsonLd.map(entry => entry['@type']), ['WebApplication', 'FAQPage'], label);
      assert.equal(jsonLd[0].url, `https://qrturbo.app${pathname}`, label);
      const faqItems = (html.match(/<details class="faq-item">/g) || []).length;
      assert.ok(faqItems > 0, label);
      assert.equal(jsonLd[1].mainEntity.length, faqItems, label);
    }
  }
});

test('robots and sitemap point to the production domain', () => {
  const robots = readPublicFile('robots.txt');
  const sitemap = readPublicFile('sitemap.xml');

  assert.match(robots, /Sitemap: https:\/\/qrturbo\.app\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/qrturbo\.app\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/qrturbo\.app\/privacy\.html<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/qrturbo\.app\/terms\.html<\/loc>/);

  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  for (const lang of LANGUAGES) {
    for (const page of PAGE_TYPES) {
      assert.ok(locations.includes(`https://qrturbo.app${pagePath(lang, page)}`), `${lang} ${page.key} in sitemap`);
    }
  }
});
