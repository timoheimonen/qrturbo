const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { repoRoot } = require('../helpers/app-vm');

const publicDir = path.join(repoRoot, 'Public');
const corePath = path.join(publicDir, 'js/i18n/core.js');
const localeDir = path.join(publicDir, 'js/i18n/locales');
const supportedLanguages = ['da', 'de', 'es', 'fi', 'fr', 'it', 'ja', 'ko', 'no', 'sv', 'zh'];

function loadTranslations() {
  const context = {
    window: {},
    document: {
      addEventListener() {},
      getElementById() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      querySelector() {
        return null;
      },
      documentElement: {
        setAttribute() {}
      },
      head: {
        appendChild() {}
      },
      createElement() {
        return {};
      }
    },
    navigator: {
      languages: ['en-US'],
      language: 'en-US'
    },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {}
    },
    console,
    setTimeout,
    clearTimeout
  };

  context.window.window = context.window;
  context.window.document = context.document;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(corePath, 'utf8'), context, { filename: 'core.js' });

  for (const lang of supportedLanguages) {
    vm.runInContext(
      fs.readFileSync(path.join(localeDir, `${lang}.js`), 'utf8'),
      context,
      { filename: `${lang}.js` }
    );
  }

  return context.window.translations;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(nested, nextPrefix);
  });
}

test('locale files do not contain unknown translation keys', () => {
  const translations = loadTranslations();
  const englishKeys = new Set(flattenKeys(translations.en));

  for (const lang of supportedLanguages) {
    assert.ok(translations[lang], `Missing translations for ${lang}`);
    for (const key of flattenKeys(translations[lang])) {
      assert.ok(englishKeys.has(key), `${lang} defines unknown translation key ${key}`);
    }
  }
});

test('all translation keys used by HTML and JavaScript exist in English translations', () => {
  const translations = loadTranslations();
  const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(publicDir, 'js/app.js'), 'utf8');
  const coreJs = fs.readFileSync(corePath, 'utf8');
  const usedKeys = [
    ...html.matchAll(/data-i18n(?:-placeholder|-option)?="([^"]+)"/g),
    ...appJs.matchAll(/\bt\(['"]([^'"]+)['"]/g),
    ...coreJs.matchAll(/\bt\(['"]([^'"]+)['"]/g)
  ].map(match => match[1]);
  const englishKeys = new Set(flattenKeys(translations.en));

  for (const key of usedKeys) {
    assert.ok(englishKeys.has(key), `Missing English translation for ${key}`);
  }
});

test('supported language list matches locale files and selector options', () => {
  const core = fs.readFileSync(corePath, 'utf8');
  const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

  for (const lang of ['en', ...supportedLanguages]) {
    assert.match(core, new RegExp(`['"]${lang}['"]`), `core.js missing language ${lang}`);
    assert.match(html, new RegExp(`<option value="${lang}"`), `selector missing ${lang}`);
  }

  for (const lang of supportedLanguages) {
    assert.ok(fs.existsSync(path.join(localeDir, `${lang}.js`)), `Missing locale file ${lang}.js`);
  }
});
