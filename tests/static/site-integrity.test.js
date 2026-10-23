const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { listFirstPartyScripts, repoRoot } = require('../helpers/app-vm');
const { LANGUAGES, PAGE_TYPES, buildSite, pagePath } = require('../../scripts/build-site');

// Paths use lowercase codes; <html lang> and hreflang use the BCP 47 spelling.
const HTML_LANGS = { 'zh-hant': 'zh-Hant' };
const htmlLang = lang => HTML_LANGS[lang] || lang;

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

test('every element ID that first-party scripts look up exists in index.html', () => {
  const html = readPublicFile('index.html');
  const htmlIds = new Set(extractAttributeValues(html, '\\sid'));
  const lookupPatterns = [
    /getElementById\(\s*'([^']+)'\s*\)/g,
    /getFieldValue\(\s*'([^']+)'\s*\)/g,
    /querySelector(?:All)?\(\s*'#([A-Za-z][\w-]*)'\s*\)/g,
    /notifyValidation\('[^']+',\s*\w+,\s*'([^']+)'\)/g,
    /contentFailure\('[^']+',\s*'([^']+)'/g,
    /setupColorSync\('([^']+)',\s*'([^']+)'/g
  ];

  const missing = [];
  let lookups = 0;
  for (const script of listFirstPartyScripts()) {
    const source = readPublicFile(`js/${script}`);
    const usedIds = new Set(lookupPatterns.flatMap(pattern => (
      [...source.matchAll(pattern)].flatMap(match => match.slice(1))
    )));
    lookups += usedIds.size;
    for (const id of usedIds) {
      if (!htmlIds.has(id)) missing.push(`Public/js/${script} looks up #${id}`);
    }
  }

  assert.ok(lookups > 50, 'Expected to find the element lookups in the first-party scripts');
  assert.deepEqual(missing, [], 'Every looked-up element must exist in index.html');
});

function readPrecacheUrls() {
  const sw = readPublicFile('sw.js');
  const precacheMatch = sw.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);
  assert.ok(precacheMatch, 'Could not find PRECACHE_URLS in sw.js');
  return [...precacheMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
}

test('service worker precache list points to existing public assets', () => {
  const precacheUrls = readPrecacheUrls();
  assert.ok(precacheUrls.includes('/'));
  assert.ok(precacheUrls.includes('/index.html'));

  for (const url of precacheUrls) {
    if (url === '/') continue;
    assertPublicAssetExists(url);
  }
});

test('every script, stylesheet, lazy script and worker is precached for offline use', () => {
  const precacheUrls = new Set(readPrecacheUrls());
  const toPath = url => new URL(url, 'https://qrturbo.test/').pathname;
  const required = new Map();
  const add = (url, source) => {
    if (/^(?:https?:)?\/\//.test(url)) return;
    required.set(toPath(url), source);
  };

  for (const page of ['site/template.html', 'Public/index.html']) {
    const html = fs.readFileSync(path.join(repoRoot, page), 'utf8');
    for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) add(match[1], page);
    for (const match of html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)) {
      const href = match[0].match(/\bhref="([^"]+)"/);
      if (href) add(href[1], page);
    }
  }

  const loaderPatterns = [
    /\bloadScript\(\s*'([^']+)'/g,
    /\bnew Worker\(\s*'([^']+)'/g,
    /\bimportScripts\(\s*'([^']+)'/g
  ];
  for (const script of listFirstPartyScripts()) {
    const source = readPublicFile(`js/${script}`);
    for (const pattern of loaderPatterns) {
      for (const match of source.matchAll(pattern)) add(match[1], `Public/js/${script}`);
    }
  }

  assert.ok(required.has('/js/app.js') && required.has('/css/styles.css'), 'Expected to find the page assets');
  const missing = [...required]
    .filter(([assetPath]) => !precacheUrls.has(assetPath))
    .map(([assetPath, source]) => `${assetPath} (from ${source})`);
  assert.deepEqual(missing, [], 'Add these paths to PRECACHE_URLS in sw.js');
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
  const supported = [
    'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'hu', 'id', 'it',
    'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ro', 'sv', 'tr', 'zh', 'zh-hant'
  ];
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(match => match[1]).sort();

  assert.deepEqual(hreflangs, [...supported.map(htmlLang), 'x-default'].sort());
  assert.ok(hreflangs.includes('zh-Hant'));
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

      assert.match(html, new RegExp(`<html lang="${htmlLang(lang)}">`), label);
      assert.match(html, new RegExp(`<link rel="canonical" href="https://qrturbo\\.app${pathname}">`), label);
      assert.doesNotMatch(html, /\{\{|data-i18n="[^"]+">\s*</, label);

      const alternates = Object.fromEntries(
        [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
          .map(match => [match[1], match[2]])
      );
      for (const code of LANGUAGES) {
        assert.equal(alternates[htmlLang(code)], `https://qrturbo.app${pagePath(code, page)}`, `${label} -> ${code}`);
      }
      assert.equal(alternates['x-default'], alternates.en, label);

      // The page opens on its own QR code type.
      assert.match(html, new RegExp(`id="tab-${page.tab}" class="tab-link active"[^>]*aria-selected="true"`), label);
      assert.match(html, new RegExp(`<div id="${page.tab}" class="tab-content"[^>]*style="display: block;"`), label);
      assert.equal((html.match(/class="tab-link active"/g) || []).length, 1, label);
      assert.match(html, new RegExp(`<option\\b[^>]*\\bvalue="${lang}"[^>]*\\sselected\\b[^>]*>`), label);

      const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(match => JSON.parse(match[1]));
      assert.deepEqual(jsonLd.map(entry => entry['@type']), ['WebApplication', 'FAQPage'], label);
      assert.equal(jsonLd[0].url, `https://qrturbo.app${pathname}`, label);
      assert.equal(jsonLd[0].inLanguage, htmlLang(lang), label);
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

test('English pages redirect each browser language to the matching language page', () => {
  const html = readPublicFile('index.html');
  const script = html.match(/<script>\s*(\/\/ English pages open[\s\S]*?)<\/script>/);
  assert.ok(script, 'Could not find the language redirect script in index.html');

  const alternates = Object.fromEntries(
    [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(match => [match[1], match[2]])
  );

  function redirectFor(languages, saved = null) {
    let target = null;
    const context = {
      URL,
      document: {
        documentElement: { lang: 'en' },
        querySelector(selector) {
          const hreflang = selector.match(/hreflang="([^"]+)"/)[1];
          const href = alternates[hreflang];
          return href ? { getAttribute: () => href } : null;
        }
      },
      localStorage: { getItem: () => saved },
      navigator: { languages },
      location: {
        href: 'https://qrturbo.app/',
        pathname: '/',
        search: '',
        hash: '',
        replace(url) {
          target = url;
        }
      }
    };
    vm.runInNewContext(script[1], context);
    return target;
  }

  const cases = {
    'zh-TW': '/zh-hant/',
    'zh-HK': '/zh-hant/',
    'zh-MO': '/zh-hant/',
    'zh-Hant': '/zh-hant/',
    'zh-Hant-TW': '/zh-hant/',
    zh: '/zh/',
    'zh-CN': '/zh/',
    'zh-SG': '/zh/',
    'zh-Hans': '/zh/',
    'zh-Hans-HK': '/zh/',
    'pt-BR': '/pt/',
    'pt-PT': '/pt/',
    'nl-BE': '/nl/',
    'pl-PL': '/pl/',
    'tr-TR': '/tr/',
    id: '/id/',
    nb: '/no/',
    'nn-NO': '/no/',
    'cs-CZ': '/cs/',
    'ro-RO': '/ro/',
    'ro-MD': '/ro/',
    'hu-HU': '/hu/',
    'el-GR': '/el/',
    'el-CY': '/el/',
    'en-US': null,
    'xx-YY': null
  };
  for (const [language, expected] of Object.entries(cases)) {
    assert.equal(redirectFor([language]), expected, language);
  }

  assert.equal(redirectFor(['xx', 'zh-TW', 'fi']), '/zh-hant/');
  assert.equal(redirectFor(['zh-TW'], 'zh-hant'), '/zh-hant/');
  assert.equal(redirectFor(['zh-TW'], 'en'), null);
});
