const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { repoRoot } = require('../helpers/app-vm');

const i18nDir = path.join(repoRoot, 'Public/js/i18n');

// Runs core.js (and the page language's locale file) as the given page
// language, with a minimal fake document, and returns its t() function.
function loadI18n(lang = 'en') {
  const context = {
    window: {},
    document: {
      documentElement: {
        getAttribute: () => lang
      },
      addEventListener() {},
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({}),
      head: {
        appendChild() {}
      }
    },
    localStorage: {
      getItem: () => null,
      setItem() {}
    },
    console
  };
  context.window.window = context.window;
  vm.createContext(context);

  const files = [path.join(i18nDir, 'core.js')];
  if (lang !== 'en') files.push(path.join(i18nDir, 'locales', `${lang}.js`));
  for (const file of files) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  }
  return context.t;
}

test('a value that ends in a period absorbs the sentence period after it', () => {
  const tEl = loadI18n('el');
  assert.equal(tEl('output.moduleSize', { size: '1,52 χλστ.' }), 'Κάθε μονάδα έχει μέγεθος 1,52 χλστ.');
  assert.equal(tEl('output.widthInvalid', { min: '10 χλστ.', max: '2.000 χλστ.' }),
    'Εισαγάγετε πλάτος από 10 χλστ. έως 2.000 χλστ.');

  const tPt = loadI18n('pt');
  assert.equal(tPt('output.moduleSize', { size: '0,06 pol.' }), 'Cada módulo tem 0,06 pol.');
  assert.equal(tPt('output.moduleSize', { size: '1,5 mm' }), 'Cada módulo tem 1,5 mm.');
});

test('variables keep their text and the template keeps its other periods', () => {
  const t = loadI18n('en');
  assert.equal(t('output.moduleSize', { size: '0.06 in' }), 'Each module is 0.06 in.');
  assert.equal(t('output.moduleSize', { size: 0 }), 'Each module is 0.');
  assert.equal(t('warnings.printTooSmall', { size: '0.3 mm.' }),
    'At this print size each module is only 0.3 mm. Print it larger so phones can read it.');
  assert.equal(t('capacity.version', { version: 3, modules: 29 }), 'Version 3 · 29 × 29 modules');
});

test('counted strings use the singular variant for exactly one', () => {
  const t = loadI18n('en');
  assert.equal(t('units.modules', { count: '1' }), '1 module');
  assert.equal(t('units.modules', { count: 1 }), '1 module');
  assert.equal(t('units.modules', { count: '0' }), '0 modules');
  assert.equal(t('units.modules', { count: '0.25' }), '0.25 modules');
  assert.equal(t('units.modules', { count: '4' }), '4 modules');
  // Keys without a singular variant are unchanged.
  assert.equal(t('batch.rowsFound', { count: 1 }), 'Rows found: 1');

  const tDe = loadI18n('de');
  assert.equal(tDe('units.modules', { count: '1' }), '1 Modul');
  assert.equal(tDe('units.modules', { count: '0,5' }), '0,5 Module');

  const tFi = loadI18n('fi');
  assert.equal(tFi('units.modules', { count: '1' }), '1 moduuli');
  assert.equal(tFi('units.modules', { count: '4' }), '4 moduulia');
});
