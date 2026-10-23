const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  flattenKeys,
  getNestedValue,
  listFirstPartyScripts,
  listLocales,
  loadTranslations,
  repoRoot
} = require('../helpers/app-vm');

const publicDir = path.join(repoRoot, 'Public');
const corePath = path.join(publicDir, 'js/i18n/core.js');
const localeDir = path.join(publicDir, 'js/i18n/locales');
const supportedLanguages = listLocales();

function templateVariables(value) {
  return [...new Set([...String(value).matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]))].sort();
}

/**
 * Every translation key that a first-party script names: t('...') calls,
 * validation and issue keys, and any string literal that is a complete key
 * in one of the English namespaces (for lookup maps such as empty.<tab>).
 */
function collectScriptKeys(source, namespaces) {
  const literalKey = new RegExp(`(['"])((?:${namespaces.join('|')})\\.[A-Za-z0-9_.]+)\\1`, 'g');
  const patterns = [
    /\bt\(\s*['"]([^'"]+)['"]/g,
    /\bnotifyValidation\(\s*['"]([^'"]+)['"]/g,
    /\b(?:messageKey|labelKey|errorKey):\s*['"]([^'"]+)['"]/g
  ];

  return [
    ...patterns.flatMap(pattern => [...source.matchAll(pattern)].map(match => match[1])),
    ...[...source.matchAll(literalKey)].map(match => match[2])
  ];
}

test('every locale has exactly the same translation keys as English', () => {
  const translations = loadTranslations();
  const englishKeys = flattenKeys(translations.en).sort();
  const englishKeySet = new Set(englishKeys);

  for (const lang of supportedLanguages) {
    assert.ok(translations[lang], `Missing translations for ${lang}`);
    const localeKeys = flattenKeys(translations[lang]).sort();
    const localeKeySet = new Set(localeKeys);
    const missing = englishKeys.filter(key => !localeKeySet.has(key));
    const unexpected = localeKeys.filter(key => !englishKeySet.has(key));

    assert.deepEqual(
      { missing, unexpected },
      { missing: [], unexpected: [] },
      `${lang} translation keys must match English`
    );
  }
});

test('every runtime translation value is a non-empty string', () => {
  const translations = loadTranslations();

  for (const lang of ['en', ...supportedLanguages]) {
    const invalid = flattenKeys(translations[lang]).filter(key => {
      const value = getNestedValue(translations[lang], key);
      return typeof value !== 'string' || !value.trim();
    });
    assert.deepEqual(invalid, [], `${lang} translations must be non-empty strings`);
  }
});

test('every locale uses the same {{variables}} as English', () => {
  const translations = loadTranslations();
  const englishKeys = flattenKeys(translations.en);

  for (const lang of supportedLanguages) {
    const mismatches = englishKeys
      .filter(key => typeof getNestedValue(translations[lang], key) === 'string')
      .map(key => ({
        key,
        en: templateVariables(getNestedValue(translations.en, key)),
        [lang]: templateVariables(getNestedValue(translations[lang], key))
      }))
      .filter(entry => entry.en.join(',') !== entry[lang].join(','));

    assert.deepEqual(mismatches, [], `${lang} must keep the English {{variables}}`);
  }
});

test('every locale has the same page content keys as English', () => {
  const english = require(path.join(repoRoot, 'site/content/en.js'));
  const englishKeys = flattenKeys(english).sort();

  for (const lang of ['en', ...supportedLanguages]) {
    const content = require(path.join(repoRoot, `site/content/${lang}.js`));
    assert.deepEqual(flattenKeys(content).sort(), englishKeys, `site/content/${lang}.js keys must match English`);
    for (const key of flattenKeys(content)) {
      const value = key.split('.').reduce((object, part) => object[part], content);
      assert.ok(typeof value === 'string' && value.trim(), `site/content/${lang}.js ${key} must be text`);
    }
  }
});

test('all translation keys used by HTML and JavaScript exist in English translations', () => {
  const translations = loadTranslations();
  const englishKeys = new Set(flattenKeys(translations.en));
  const namespaces = Object.keys(translations.en);
  const html = fs.readFileSync(path.join(repoRoot, 'site/template.html'), 'utf8');
  const scripts = listFirstPartyScripts();

  assert.ok(scripts.includes('app.js') && scripts.includes('i18n/core.js'), 'Expected to scan app.js and core.js');

  const missing = [];
  for (const match of html.matchAll(/data-i18n(?:-placeholder|-option|-aria-label)?="([^"]+)"/g)) {
    if (!englishKeys.has(match[1])) missing.push(`site/template.html: ${match[1]}`);
  }

  for (const script of scripts) {
    const source = fs.readFileSync(path.join(publicDir, 'js', script), 'utf8');
    for (const key of collectScriptKeys(source, namespaces)) {
      if (!englishKeys.has(key)) missing.push(`Public/js/${script}: ${key}`);
    }
  }

  assert.deepEqual([...new Set(missing)], [], 'Every used key needs an English translation');
});

test('every English translation key is used by the template, a script or the build', () => {
  const translations = loadTranslations();
  const withoutBlockComments = source => source.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutLineComments = source => source.replace(/^\s*\/\/.*$/gm, '');
  const scriptSource = file => {
    const source = fs.readFileSync(path.join(publicDir, 'js', file), 'utf8');
    // core.js holds the English table itself; only its code after the table counts.
    const code = file === 'i18n/core.js' ? source.slice(source.indexOf('window.translations = translations')) : source;
    return withoutLineComments(withoutBlockComments(code));
  };

  const corpus = [
    fs.readFileSync(path.join(repoRoot, 'site/template.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, ''),
    withoutLineComments(withoutBlockComments(fs.readFileSync(path.join(repoRoot, 'scripts/build-site.js'), 'utf8'))),
    ...listFirstPartyScripts().map(scriptSource)
  ].join('\n');

  // "<key>_one" is the singular variant that t() picks for a count of 1.
  const unused = flattenKeys(translations.en)
    .filter(key => {
      const base = key.replace(/_one$/, '');
      const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return !new RegExp(`(?<![\\w.])${escaped}(?![\\w])`).test(corpus);
    });

  assert.deepEqual(unused, [], 'Remove translation keys that nothing uses, from core.js and every locale');
});

test('supported language list matches locale files and the language menu', () => {
  const core = fs.readFileSync(corePath, 'utf8');
  const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

  for (const lang of ['en', ...supportedLanguages]) {
    assert.match(core, new RegExp(`['"]${lang}['"]`), `core.js missing language ${lang}`);
    assert.match(html, new RegExp(`<a\\b[^>]*\\bdata-lang="${lang}"`), `language menu missing ${lang}`);
  }

  for (const lang of supportedLanguages) {
    assert.ok(fs.existsSync(path.join(localeDir, `${lang}.js`)), `Missing locale file ${lang}.js`);
  }
});
