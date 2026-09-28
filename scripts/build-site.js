#!/usr/bin/env node
// Pre-renders every language and QR code type page into Public/ from
// site/template.html, the runtime translations and site/content/<lang>.js.
//
//   npm run build            write the pages and sitemap.xml
//   npm run build -- --check fail if the committed pages are out of date
//
// Search engines and visitors without JavaScript get complete pages in the
// right language, and every page has its own URL for hreflang alternates.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'Public');
const siteDir = path.join(repoRoot, 'site');
const ORIGIN = 'https://qrturbo.app';

// English stays at the root; the order matches the language selector.
const LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'fi', 'sv', 'no', 'da', 'zh', 'ja', 'ko',
  'pt', 'nl', 'pl', 'tr', 'id', 'zh-hant', 'cs', 'ro', 'hu', 'el'
];

// Paths and file names use lowercase codes; <html lang>, hreflang and
// inLanguage use the BCP 47 spelling where it differs.
const HTML_LANGS = {
  'zh-hant': 'zh-Hant'
};

const OG_LOCALES = {
  en: 'en_US',
  cs: 'cs_CZ',
  da: 'da_DK',
  de: 'de_DE',
  el: 'el_GR',
  es: 'es_ES',
  fi: 'fi_FI',
  fr: 'fr_FR',
  hu: 'hu_HU',
  id: 'id_ID',
  it: 'it_IT',
  ja: 'ja_JP',
  ko: 'ko_KR',
  nl: 'nl_NL',
  no: 'nb_NO',
  pl: 'pl_PL',
  pt: 'pt_BR',
  ro: 'ro_RO',
  sv: 'sv_SE',
  tr: 'tr_TR',
  zh: 'zh_CN',
  'zh-hant': 'zh_TW'
};

// Slugs stay in English in every language so each page has one stable path.
const PAGE_TYPES = [
  { key: 'home', slug: '', tab: 'URLText' },
  { key: 'wifi', slug: 'wifi-qr-code', tab: 'Wifi' },
  { key: 'vcard', slug: 'vcard-qr-code', tab: 'VCard' },
  { key: 'whatsapp', slug: 'whatsapp-qr-code', tab: 'WhatsApp' },
  { key: 'email', slug: 'email-qr-code', tab: 'Email' },
  { key: 'sms', slug: 'sms-qr-code', tab: 'SMSPhone' },
  { key: 'event', slug: 'event-qr-code', tab: 'CalendarEvent' },
  { key: 'location', slug: 'location-qr-code', tab: 'Location' },
  { key: 'social', slug: 'social-media-qr-code', tab: 'SocialMedia' },
  { key: 'app', slug: 'app-store-qr-code', tab: 'AppLink' }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(data) {
  return JSON.stringify(data, null, 4)
    .replace(/</g, '\\u003c')
    .split('\n')
    .map(line => `        ${line}`)
    .join('\n');
}

function htmlLang(lang) {
  return HTML_LANGS[lang] || lang;
}

function pagePath(lang, page) {
  const langPrefix = lang === 'en' ? '/' : `/${lang}/`;
  return page.slug ? `${langPrefix}${page.slug}/` : langPrefix;
}

function pageUrl(lang, page) {
  return `${ORIGIN}${pagePath(lang, page)}`;
}

function outputFile(lang, page) {
  return path.join(publicDir, pagePath(lang, page), 'index.html');
}

function loadRuntimeTranslations() {
  const noop = () => {};
  const context = {
    window: {},
    document: {
      readyState: 'loading',
      currentScript: null,
      addEventListener: noop,
      documentElement: { getAttribute: () => 'en' }
    },
    console
  };
  context.window.window = context.window;
  vm.createContext(context);

  const i18nDir = path.join(publicDir, 'js/i18n');
  vm.runInContext(fs.readFileSync(path.join(i18nDir, 'core.js'), 'utf8'), context, { filename: 'core.js' });
  for (const lang of LANGUAGES.filter(code => code !== 'en')) {
    const file = path.join(i18nDir, 'locales', `${lang}.js`);
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: `${lang}.js` });
  }
  return context.window.translations;
}

function loadContent(lang) {
  const file = path.join(siteDir, 'content', `${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
}

function lookup(object, key) {
  return key.split('.').reduce((value, part) => value?.[part], object);
}

function createTranslator(translations, lang) {
  return key => {
    const value = lookup(translations[lang], key);
    if (typeof value !== 'string') {
      throw new Error(`Missing ${lang} translation for ${key}`);
    }
    return value;
  };
}

// Replaces the English text of every data-i18n element and attribute in the
// template. The template only puts data-i18n on elements that contain plain
// text, so a missed element means the template changed shape.
function translateTemplate(html, translate) {
  const expected = {
    text: (html.match(/\sdata-i18n="/g) || []).length,
    option: (html.match(/\sdata-i18n-option="/g) || []).length,
    placeholder: (html.match(/\sdata-i18n-placeholder="/g) || []).length,
    aria: (html.match(/\sdata-i18n-aria-label="/g) || []).length
  };
  const seen = { text: 0, option: 0, placeholder: 0, aria: 0 };

  let result = html.replace(
    /(<(\w+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g,
    (match, open, tag, key, text, close) => {
      seen.text += 1;
      return `${open}${escapeHtml(translate(key))}${close}`;
    }
  );

  result = result.replace(
    /(<option\b[^>]*\sdata-i18n-option="([^"]+)"[^>]*>)([^<]*)(<\/option>)/g,
    (match, open, key, text, close) => {
      seen.option += 1;
      return `${open}${escapeHtml(translate(key))}${close}`;
    }
  );

  result = result.replace(/<[^>]*\sdata-i18n-placeholder="([^"]+)"[^>]*>/g, (tag, key) => {
    seen.placeholder += 1;
    return tag.replace(/\splaceholder="[^"]*"/, ` placeholder="${escapeHtml(translate(key))}"`);
  });

  result = result.replace(/<[^>]*\sdata-i18n-aria-label="([^"]+)"[^>]*>/g, (tag, key) => {
    seen.aria += 1;
    return tag.replace(/\saria-label="[^"]*"/, ` aria-label="${escapeHtml(translate(key))}"`);
  });

  for (const kind of Object.keys(expected)) {
    if (expected[kind] !== seen[kind]) {
      throw new Error(`Translated ${seen[kind]} of ${expected[kind]} data-i18n ${kind} entries; check site/template.html`);
    }
  }

  return result;
}

function renderHead(lang, page, pageContent, content) {
  const canonical = pageUrl(lang, page);
  const alternates = LANGUAGES
    .map(code => `    <link rel="alternate" hreflang="${htmlLang(code)}" href="${pageUrl(code, page)}" />`)
    .concat(`    <link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}" />`)
    .join('\n');
  const title = escapeHtml(pageContent.title);
  const description = escapeHtml(pageContent.description);

  const application = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QRTurbo.app',
    url: canonical,
    description: pageContent.description,
    inLanguage: htmlLang(lang),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: 'QRTurbo.app'
    }
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: htmlLang(lang),
    mainEntity: content.faq.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  return `    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">

    <!-- Language Alternates (hreflang) -->
${alternates}

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ORIGIN}/android-chrome-512x512.png" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="QRTurbo.app" />
    <meta property="og:locale" content="${OG_LOCALES[lang]}" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ORIGIN}/android-chrome-512x512.png" />

    <!-- Structured Data Schema Markup -->
    <script type="application/ld+json">
${jsonLd(application)}
    </script>
    <script type="application/ld+json">
${jsonLd(faq)}
    </script>`;
}

function renderAbout(pageContent) {
  if (!pageContent.about) return '';

  const paragraphs = pageContent.about.map(text => `            <p>${escapeHtml(text)}</p>`).join('\n');
  return `
    <section class="info info-about" id="about" aria-labelledby="about-title">
        <h2 id="about-title" class="display display-small">${escapeHtml(pageContent.aboutTitle)}</h2>
        <div class="about-text">
${paragraphs}
        </div>
    </section>
`;
}

function renderComparison(comparison) {
  const { headers } = comparison;
  const rows = comparison.rows.map(row => `                    <tr>
                        <th scope="row">${escapeHtml(row.feature)}</th>
                        <td data-label="${escapeHtml(headers.dynamic)}">${escapeHtml(row.dynamic)}</td>
                        <td class="is-ours" data-label="${escapeHtml(headers.qrturbo)}">${escapeHtml(row.qrturbo)}</td>
                    </tr>`).join('\n');

  return `
    <section class="info info-compare" id="never-expires" aria-labelledby="compare-title">
        <div class="info-intro">
            <h2 id="compare-title" class="display display-small">${escapeHtml(comparison.title)}</h2>
            <p class="muted">${escapeHtml(comparison.intro)}</p>
        </div>
        <div class="compare">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th scope="col">${escapeHtml(headers.feature)}</th>
                        <th scope="col">${escapeHtml(headers.dynamic)}</th>
                        <th scope="col" class="is-ours">${escapeHtml(headers.qrturbo)}</th>
                    </tr>
                </thead>
                <tbody>
${rows}
                </tbody>
            </table>
            <p class="compare-note">${escapeHtml(comparison.note)}</p>
        </div>
    </section>
`;
}

function renderFaq(faq) {
  const items = faq.items.map(item => `            <details class="faq-item">
                <summary>${escapeHtml(item.q)}</summary>
                <p>${escapeHtml(item.a)}</p>
            </details>`).join('\n');

  return `
    <section class="info info-faq" id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" class="display display-small">${escapeHtml(faq.title)}</h2>
        <div class="faq-list">
${items}
        </div>
    </section>`;
}

function renderTypeLinks(lang, currentPage, content) {
  const links = PAGE_TYPES.map(page => {
    const name = page.key === 'home' ? content.home.name : content.types[page.key].name;
    const current = page === currentPage ? ' aria-current="page"' : '';
    return `            <li><a href="${pagePath(lang, page)}"${current}>${escapeHtml(name)}</a></li>`;
  }).join('\n');

  return `
    <nav class="info type-links" aria-labelledby="type-links-title">
        <h2 id="type-links-title" class="info-title">${escapeHtml(content.typeLinks.title)}</h2>
        <ul>
${links}
        </ul>
    </nav>
`;
}

function renderPage(template, lang, page, translate, content) {
  const pageContent = page.key === 'home' ? content.home : content.types[page.key];
  const tabs = new Set(PAGE_TYPES.map(entry => entry.tab));
  let html = translateTemplate(template, translate);

  html = html.replace(/\{\{(tabClass|tabSelected|tabIndex|tabPanel):(\w+)\}\}/g, (match, kind, tab) => {
    if (!tabs.has(tab) && tab !== 'MeCard') {
      throw new Error(`Unknown tab ${tab} in template`);
    }
    const active = tab === page.tab;
    if (kind === 'tabClass') return active ? ' active' : '';
    if (kind === 'tabSelected') return String(active);
    if (kind === 'tabIndex') return active ? '0' : '-1';
    return active ? 'style="display: block;"' : 'hidden';
  });

  html = html.replace(/<option value="([\w-]+)">/g, (match, value) => (
    LANGUAGES.includes(value) && value === lang ? `<option value="${value}" selected>` : match
  ));

  const values = {
    lang: htmlLang(lang),
    homeHref: pagePath(lang, PAGE_TYPES[0]),
    head: renderHead(lang, page, pageContent, content),
    heroEyebrow: escapeHtml(pageContent.eyebrow),
    heroDisplay: escapeHtml(pageContent.display),
    heroLead: escapeHtml(pageContent.lead),
    typeAbout: renderAbout(pageContent),
    comparison: renderComparison(content.comparison),
    faq: renderFaq(content.faq),
    typeLinks: renderTypeLinks(lang, page, content)
  };

  html = html.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    if (!(name in values)) {
      throw new Error(`Unknown template placeholder ${match}`);
    }
    return values[name];
  });

  return html;
}

function renderSitemap() {
  const pages = PAGE_TYPES.flatMap(page => LANGUAGES.map(lang => {
    const alternates = LANGUAGES
      .map(code => `    <xhtml:link rel="alternate" hreflang="${htmlLang(code)}" href="${pageUrl(code, page)}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}"/>`)
      .join('\n');
    return `  <url>
    <loc>${pageUrl(lang, page)}</loc>
${alternates}
  </url>`;
  }));

  const documents = ['privacy.html', 'terms.html'].map(file => `  <url>
    <loc>${ORIGIN}/${file}</loc>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...pages, ...documents].join('\n')}
</urlset>
`;
}

// Returns every generated file as an absolute path mapped to its contents.
function buildSite({ languages = LANGUAGES } = {}) {
  const template = fs.readFileSync(path.join(siteDir, 'template.html'), 'utf8');
  const translations = loadRuntimeTranslations();
  const files = new Map();

  for (const lang of languages) {
    const translate = createTranslator(translations, lang);
    const content = loadContent(lang);
    for (const page of PAGE_TYPES) {
      files.set(outputFile(lang, page), renderPage(template, lang, page, translate, content));
    }
  }

  files.set(path.join(publicDir, 'sitemap.xml'), renderSitemap());
  return files;
}

function main() {
  const check = process.argv.includes('--check');
  const files = buildSite();
  const stale = [];

  for (const [file, contents] of files) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current === contents) continue;

    if (check) {
      stale.push(path.relative(repoRoot, file));
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, contents);
    }
  }

  if (check && stale.length) {
    console.error(`Generated pages are out of date. Run "npm run build".\n${stale.join('\n')}`);
    process.exit(1);
  }

  console.log(check ? `${files.size} generated files are up to date.` : `Generated ${files.size} files.`);
}

if (require.main === module) {
  main();
}

module.exports = { LANGUAGES, PAGE_TYPES, buildSite, htmlLang, pagePath };
