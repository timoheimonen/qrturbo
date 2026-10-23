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

// En dash (U+2013) and em dash (U+2014). Shipped text uses '-', ':' or a new
// sentence instead.
const LONG_DASH = /[\u2013\u2014]/;
// The brand is always "QRTurbo.app". Identifiers such as qrturbo_theme do not
// match, because "_" continues the word.
const BARE_BRAND = /\bqrturbo\b(?!\.app)/i;

const locales = listLocales();
const firstPartyScripts = [
  ...listFirstPartyScripts().map(script => `Public/js/${script}`),
  'Public/sw.js'
];

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function findLines(relativePaths, pattern) {
  return relativePaths.flatMap(relativePath => readRepoFile(relativePath)
    .split('\n')
    .map((line, index) => (pattern.test(line) ? `${relativePath}:${index + 1}` : null))
    .filter(Boolean));
}

function contentFiles() {
  return fs.readdirSync(path.join(repoRoot, 'site/content'))
    .filter(fileName => fileName.endsWith('.js'))
    .map(fileName => `site/content/${fileName}`)
    .sort();
}

test('first-party JavaScript has no en or em dashes', () => {
  assert.deepEqual(findLines(firstPartyScripts, LONG_DASH), []);
});

test('locale files have no en or em dashes', () => {
  const localeFiles = locales.map(lang => `Public/js/i18n/locales/${lang}.js`);
  assert.deepEqual(findLines(localeFiles, LONG_DASH), []);
});

test('the site template and page content have no en or em dashes', () => {
  assert.deepEqual(findLines(['site/template.html', ...contentFiles()], LONG_DASH), []);
});

test('the privacy and terms pages have no en or em dashes', () => {
  assert.deepEqual(findLines(['Public/privacy.html', 'Public/terms.html'], LONG_DASH), []);
});

test('first-party JavaScript never opens alert() dialogs', () => {
  assert.deepEqual(findLines(firstPartyScripts, /\balert\(/), []);
});

test('runtime translations and page content always write the brand as QRTurbo.app', () => {
  const translations = loadTranslations();
  const bare = [];

  for (const lang of ['en', ...locales]) {
    for (const key of flattenKeys(translations[lang])) {
      if (BARE_BRAND.test(String(getNestedValue(translations[lang], key)))) bare.push(`${lang} ${key}`);
    }
  }

  for (const file of contentFiles()) {
    const content = require(path.join(repoRoot, file));
    for (const key of flattenKeys(content)) {
      if (BARE_BRAND.test(String(getNestedValue(content, key)))) bare.push(`${file} ${key}`);
    }
  }

  assert.deepEqual(bare, []);
});

const jsqrSource = path.join(repoRoot, 'node_modules/jsqr/dist/jsQR.js');

test(
  'vendored jsQR is an unmodified copy of the jsqr package',
  { skip: !fs.existsSync(jsqrSource) && 'node_modules/jsqr is not installed' },
  () => {
    const vendored = fs.readFileSync(path.join(repoRoot, 'Public/js/vendor/jsqr.js'));
    assert.ok(
      vendored.equals(fs.readFileSync(jsqrSource)),
      'Public/js/vendor/jsqr.js must equal jsQR.js byte for byte'
    );

    const license = readRepoFile('Public/js/vendor/jsqr.LICENSE.txt');
    assert.match(license, /Apache License\s+Version 2\.0/);
  }
);

// Keys added in 2.0.0. A trailing ".*" covers a whole new namespace.
const NEW_KEYS = [
  'aria.skipToGenerator', 'aria.qrImage', 'aria.qrImageStale', 'aria.removeLogo', 'aria.formatGroup',
  'aria.presetGroup', 'aria.mobileBar', 'aria.notifications', 'aria.hexValue',
  'actions.downloadFormat', 'actions.copyImage', 'actions.copySvg', 'actions.copyText', 'actions.share',
  'actions.undo', 'actions.goToField', 'actions.addHttps', 'actions.moreFormats', 'actions.swapColors',
  'actions.dismiss', 'actions.retry', 'actions.useLevelL', 'actions.print', 'actions.cancel', 'actions.close',
  'actions.createMany', 'actions.batchStart', 'actions.chooseCsv',
  'fields.smsPhoneType', 'fields.fill', 'fields.gradientColor2', 'fields.gradientType', 'fields.gradientAngle',
  'fields.customCorners', 'fields.cornerOuterColor', 'fields.cornerInnerColor', 'fields.customPixels',
  'fields.setPrintSize', 'fields.printWidth', 'fields.unit', 'fields.dpi', 'fields.pdfPage', 'fields.colorMode',
  'fields.minVersion', 'fields.paymentName', 'fields.iban', 'fields.bic', 'fields.amount',
  'fields.paymentReference', 'fields.paymentMessage', 'fields.dueDate', 'fields.allDay', 'fields.timeZone',
  'fields.phoneHome', 'fields.department', 'fields.birthday', 'fields.note', 'fields.addressType',
  'fields.batchSource', 'fields.batchHasHeader', 'fields.batchType', 'fields.batchFilename', 'fields.batchFormat',
  'fields.batchSameSize', 'fields.batchManifest', 'fields.batchVerify',
  'options.errorAuto', 'options.sizeCustom', 'options.formatJpg', 'options.formatWebp', 'options.unitMm',
  'options.unitIn', 'options.dpi150', 'options.dpi300', 'options.dpi600', 'options.pageFit', 'options.pageA4',
  'options.pageLetter', 'options.fillSolid', 'options.fillGradient', 'options.gradientLinear',
  'options.gradientRadial', 'options.formatEps', 'options.colorRgb', 'options.colorCmyk', 'options.colorK',
  'options.authWpa3', 'options.versionAuto', 'options.addressAuto', 'options.addressWork', 'options.addressHome',
  'options.filenameRowNumber', 'options.notUsed',
  'warnings.inverted', 'warnings.gradientContrast', 'warnings.printTooSmall', 'warnings.codeTooSmall',
  'warnings.sizeTooSmall', 'warnings.smallScanRisky', 'warnings.decodeFailed', 'warnings.paymentLogo',
  'alerts.phoneInvalid', 'alerts.paymentRequired', 'alerts.paymentNameTooLong', 'alerts.ibanInvalid',
  'alerts.bicInvalid', 'alerts.amountInvalid', 'alerts.referenceInvalid', 'alerts.referenceAndMessage',
  'alerts.paymentTooLong',
  'helpers.httpsSuggestion', 'helpers.ecHelper', 'helpers.wifiWpa3', 'helpers.wifiHiddenIos',
  'helpers.paymentReference', 'helpers.paymentDueDate', 'helpers.eventTimeZone',
  'preview.encodedData', 'preview.ready', 'tabs.payment',
  'output.*', 'capacity.*', 'scan.*', 'empty.*', 'design.*', 'logo.*', 'toast.*', 'mobile.*', 'batch.*'
];

// Format names, units, banking terms and the brand read the same in every
// language. A value made only of these, numbers, symbols and {{variables}}
// may equal English.
const NEUTRAL_TOKENS = /\b(?:PNG|JPG|JPEG|WebP|SVG|PDF|EPS|RGB|CMYK|IBAN|BIC|A4|mm|in|px|dpi|QRTurbo\.app)\b/g;

// Words that are correctly identical to English in a language, by key.
const ALLOWED_IDENTICAL = {
  fr: ['aria.notifications'],
  id: ['options.gradientLinear', 'options.gradientRadial'],
  ro: ['design.presetStandard']
};

function isNewKey(key) {
  return NEW_KEYS.some(entry => (entry.endsWith('.*') ? key.startsWith(entry.slice(0, -1)) : key === entry));
}

function isLanguageNeutral(value) {
  return !/\p{L}/u.test(String(value).replace(/\{\{\w+\}\}/g, '').replace(NEUTRAL_TOKENS, ''));
}

test('translations: new keys are translated', () => {
  const translations = loadTranslations();
  const newKeys = flattenKeys(translations.en).filter(isNewKey);
  const untranslated = [];

  for (const lang of locales) {
    for (const key of newKeys) {
      const english = getNestedValue(translations.en, key);
      if (getNestedValue(translations[lang], key) !== english) continue;
      if (isLanguageNeutral(english) || ALLOWED_IDENTICAL[lang]?.includes(key)) continue;
      untranslated.push(`${lang} ${key}`);
    }
  }

  assert.deepEqual(untranslated, [], 'These locale values still equal English');
});
