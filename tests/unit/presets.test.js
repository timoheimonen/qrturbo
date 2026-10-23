const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { getNestedValue, loadTranslations, repoRoot } = require('../helpers/app-vm');

const Presets = require(path.join(repoRoot, 'Public/js/lib/presets.js'));

const SHAPE_KEYS = ['dotStyle', 'cornerSquareStyle', 'cornerDotStyle', 'frameStyle'];

// SPEC C.3 default Design, with a logo and non-default colors so the tests
// can prove that presets leave everything except the shapes alone.
function sampleDesign(overrides = {}) {
  return {
    fgColor: '#102a43',
    bgColor: '#fefcbf',
    transparentBackground: false,
    fill: 'gradient',
    fgColor2: '#2563eb',
    gradientType: 'radial',
    gradientAngle: 90,
    customCorners: true,
    cornerOuterColor: '#ff0000',
    cornerInnerColor: '#00ff00',
    errorCorrection: 'Q',
    dotStyle: 'square',
    cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot',
    margin: 6,
    logo: Object.freeze({
      dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
      mime: 'image/png',
      name: 'logo.png',
      width: 64,
      height: 64,
      bytes: 100,
      optimized: false
    }),
    logoSize: 0.3,
    logoPadding: 1.25,
    frameStyle: 'none',
    frameText: 'Hello',
    frameColor: '#333333',
    minVersion: 5,
    ...overrides
  };
}

test('presets: the list matches the SPEC B.4 table', () => {
  const table = Presets.LIST.map(entry => [entry.id, entry.labelKey, ...SHAPE_KEYS.map(key => entry.patch[key])]);
  assert.deepEqual(table, [
    ['standard', 'design.presetStandard', 'square', 'extra-rounded', 'dot', 'none'],
    ['classic', 'design.presetClassic', 'square', 'square', 'square', 'none'],
    ['rounded', 'design.presetRounded', 'rounded', 'extra-rounded', 'dot', 'none'],
    ['dots', 'design.presetDots', 'dots', 'dot', 'dot', 'none'],
    ['soft', 'design.presetSoft', 'classy-rounded', 'extra-rounded', 'dot', 'none'],
    ['scanme', 'design.presetScanMe', 'square', 'extra-rounded', 'dot', 'banner-bottom']
  ]);
});

test('presets: every patch sets only the four shape keys', () => {
  for (const entry of Presets.LIST) {
    assert.deepEqual(Object.keys(entry.patch).sort(), [...SHAPE_KEYS].sort(), entry.id);
  }
});

test('presets: the list and its entries are frozen', () => {
  assert.ok(Object.isFrozen(Presets.LIST));
  for (const entry of Presets.LIST) {
    assert.ok(Object.isFrozen(entry), entry.id);
    assert.ok(Object.isFrozen(entry.patch), entry.id);
  }
  assert.ok(Object.isFrozen(Presets));
});

test('presets: every label key exists in English', () => {
  const english = loadTranslations().en;
  for (const entry of Presets.LIST) {
    const value = getNestedValue(english, entry.labelKey);
    assert.equal(typeof value, 'string', entry.labelKey);
    assert.ok(value.trim(), entry.labelKey);
  }
});

test('presets: apply keeps colors, the logo and every other setting', () => {
  const design = sampleDesign();
  for (const entry of Presets.LIST) {
    const result = Presets.apply(design, entry.id);
    for (const key of Object.keys(design)) {
      if (SHAPE_KEYS.includes(key)) {
        assert.equal(result[key], entry.patch[key], `${entry.id}.${key}`);
      } else {
        assert.equal(result[key], design[key], `${entry.id}.${key}`);
      }
    }
    assert.equal(result.logo, design.logo, `${entry.id} keeps the same logo object`);
    assert.deepEqual(Object.keys(result).sort(), Object.keys(design).sort(), entry.id);
  }
});

test('presets: apply returns a new object and never mutates its input', () => {
  const design = Object.freeze(sampleDesign());
  const result = Presets.apply(design, 'dots');
  assert.notEqual(result, design);
  assert.equal(design.dotStyle, 'square');
  assert.equal(result.dotStyle, 'dots');
  assert.ok(!Object.isFrozen(result));
});

test('presets: apply with an unknown id returns an unchanged copy', () => {
  const design = sampleDesign();
  const result = Presets.apply(design, 'nope');
  assert.notEqual(result, design);
  assert.deepEqual(result, design);
});

test('presets: match(apply(design, id)) returns id for every preset', () => {
  for (const frameStyle of ['none', 'banner-top', 'outline']) {
    const design = sampleDesign({ dotStyle: 'classy', cornerSquareStyle: 'dot', cornerDotStyle: 'square', frameStyle });
    for (const entry of Presets.LIST) {
      assert.equal(Presets.match(Presets.apply(design, entry.id)), entry.id, `${entry.id} from frame ${frameStyle}`);
    }
  }
});

test('presets: the default shapes match the standard preset', () => {
  assert.equal(Presets.match(sampleDesign()), 'standard');
  assert.equal(Presets.match(sampleDesign({ frameStyle: 'banner-bottom' })), 'scanme');
});

test('presets: changing any shape after a preset gives null', () => {
  const changes = {
    dotStyle: ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'],
    cornerSquareStyle: ['square', 'extra-rounded', 'dot'],
    cornerDotStyle: ['square', 'dot'],
    frameStyle: ['none', 'banner-bottom', 'banner-top', 'outline']
  };

  for (const entry of Presets.LIST) {
    const applied = Presets.apply(sampleDesign(), entry.id);
    for (const [key, values] of Object.entries(changes)) {
      for (const value of values) {
        if (value === applied[key]) continue;
        const changed = { ...applied, [key]: value };
        const expected = Presets.LIST.find(other => SHAPE_KEYS.every(shape => other.patch[shape] === changed[shape]));
        assert.equal(Presets.match(changed), expected ? expected.id : null, `${entry.id} with ${key}=${value}`);
      }
    }
  }

  const standard = Presets.apply(sampleDesign(), 'standard');
  assert.equal(Presets.match({ ...standard, dotStyle: 'classy' }), null);
  assert.equal(Presets.match({ ...standard, cornerSquareStyle: 'dot' }), null);
  assert.equal(Presets.match({ ...standard, cornerDotStyle: 'square' }), null);
  assert.equal(Presets.match({ ...standard, frameStyle: 'outline' }), null);
});

test('presets: colors and other settings never affect match', () => {
  const base = Presets.apply(sampleDesign(), 'rounded');
  const variants = [
    { fgColor: '#ffffff', bgColor: '#000000' },
    { fill: 'solid', customCorners: false },
    { logo: null, logoSize: 0.5 },
    { errorCorrection: 'auto', margin: 12, minVersion: 0 },
    { frameText: '', frameColor: '#ff00ff' }
  ];
  for (const variant of variants) {
    assert.equal(Presets.match({ ...base, ...variant }), 'rounded', JSON.stringify(variant));
  }
});

test('presets: the template has one labelled radio card per preset, in list order', () => {
  const template = fs.readFileSync(path.join(repoRoot, 'site/template.html'), 'utf8');
  const radios = [...template.matchAll(/<input type="radio" id="preset-([a-z]+)" name="preset" value="([a-z]+)"/g)];
  assert.deepEqual(radios.map(match => match[1]), Presets.LIST.map(entry => entry.id));
  for (const [, id, value] of radios) {
    assert.equal(value, id, id);
    const entry = Presets.LIST.find(item => item.id === id);
    const label = new RegExp(`<label for="preset-${id}"[^>]*>\\s*<img class="preset-thumb" alt=""[^>]*>\\s*<span data-i18n="${entry.labelKey.replace('.', '\\.')}">`);
    assert.match(template, label, id);
  }
  // The default design is the standard preset, which starts checked.
  assert.match(template, /id="preset-standard" name="preset" value="standard" checked/);
});

test('presets: every patch value is an option of its picker in the template', () => {
  const template = fs.readFileSync(path.join(repoRoot, 'site/template.html'), 'utf8');
  const radioNames = {
    dotStyle: 'dot-style',
    cornerSquareStyle: 'corner-square-style',
    cornerDotStyle: 'corner-dot-style',
    frameStyle: 'frame-style'
  };
  for (const entry of Presets.LIST) {
    for (const [key, name] of Object.entries(radioNames)) {
      const option = `name="${name}" value="${entry.patch[key]}"`;
      assert.ok(template.includes(option), `${entry.id}.${key}: ${option}`);
    }
  }
});

test('design ui: loads without a DOM and exposes only a frozen init', () => {
  const DesignUI = require(path.join(repoRoot, 'Public/js/ui/design.js'));
  assert.deepEqual(Object.keys(DesignUI), ['init']);
  assert.ok(Object.isFrozen(DesignUI));
  assert.doesNotThrow(() => DesignUI.init());
  assert.doesNotThrow(() => DesignUI.init({ on() {}, getDesign() { return {}; } }));
});

test('presets: match handles missing or invalid designs', () => {
  assert.equal(Presets.match(null), null);
  assert.equal(Presets.match(undefined), null);
  assert.equal(Presets.match('standard'), null);
  assert.equal(Presets.match({}), null);
  assert.deepEqual(Presets.apply(null, 'classic'), Presets.LIST[1].patch);
});
