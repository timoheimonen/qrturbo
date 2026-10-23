const assert = require('node:assert/strict');
const test = require('node:test');

const Color = require('../../Public/js/lib/color.js');

const DEFAULT_DESIGN = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  transparentBackground: false,
  fill: 'solid',
  fgColor2: '#2563eb',
  gradientType: 'linear',
  gradientAngle: 45,
  customCorners: false,
  cornerOuterColor: '#000000',
  cornerInnerColor: '#000000'
};

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('normalizeHex accepts #rgb and #rrggbb and lowercases them', () => {
  assert.equal(Color.normalizeHex('#abc'), '#aabbcc');
  assert.equal(Color.normalizeHex('#A1B2C3'), '#a1b2c3');
  assert.equal(Color.normalizeHex('  #FFF '), '#ffffff');
  assert.equal(Color.normalizeHex('102a43'), '#102a43');
  for (const invalid of ['', '#ab', '#abcd', '#gggggg', 'red', null, undefined, 42]) {
    assert.equal(Color.normalizeHex(invalid), null, String(invalid));
  }
});

test('parseHex returns 0..255 channels or null', () => {
  assert.deepEqual(Color.parseHex('#102a43'), { r: 16, g: 42, b: 67 });
  assert.deepEqual(Color.parseHex('#f00'), { r: 255, g: 0, b: 0 });
  assert.equal(Color.parseHex('nope'), null);
});

test('relative luminance follows the WCAG formula', () => {
  assert.equal(Color.relativeLuminance('#000000'), 0);
  close(Color.relativeLuminance('#ffffff'), 1);
  close(Color.relativeLuminance('#ff0000'), 0.2126);
  close(Color.relativeLuminance('#00ff00'), 0.7152);
  close(Color.relativeLuminance('#0000ff'), 0.0722);
  close(Color.relativeLuminance('#808080'), 0.2158605, 1e-6);
  assert.ok(Number.isNaN(Color.relativeLuminance('invalid')));
});

test('black on white has a contrast ratio of 21', () => {
  close(Color.contrastRatio('#000000', '#ffffff'), 21);
  close(Color.contrastRatio('#ffffff', '#000000'), 21);
  close(Color.contrastRatio('#777777', '#777777'), 1);
});

test('symbol contrast is near 1 for black on white and small for light grey', () => {
  close(Color.symbolContrast('#000000', '#ffffff'), 1);
  const lightGrey = Color.symbolContrast('#eeeeee', '#ffffff');
  assert.ok(lightGrey > 0 && lightGrey < 0.25, `#eeeeee on white gave ${lightGrey}`);
});

test('inverted colors give a negative symbol contrast', () => {
  close(Color.symbolContrast('#ffffff', '#000000'), -1);
  assert.ok(Color.symbolContrast('#fde68a', '#1e3a8a') < 0);
});

test('foregroundColors lists the code color, gradient stop and corner colors', () => {
  assert.deepEqual(Color.foregroundColors(DEFAULT_DESIGN), ['#000000']);
  assert.deepEqual(
    Color.foregroundColors({ ...DEFAULT_DESIGN, fill: 'gradient', fgColor2: '#2563EB' }),
    ['#000000', '#2563eb']
  );
  assert.deepEqual(
    Color.foregroundColors({
      ...DEFAULT_DESIGN,
      customCorners: true,
      cornerOuterColor: '#ff0000',
      cornerInnerColor: '#000000'
    }),
    ['#000000', '#ff0000']
  );
});

test('worstForeground picks the gradient stop closest to the background', () => {
  const design = { ...DEFAULT_DESIGN, fill: 'gradient', fgColor: '#000000', fgColor2: '#cccccc' };
  assert.equal(Color.worstForeground(design, '#ffffff'), '#cccccc');
  assert.equal(Color.worstForeground(DEFAULT_DESIGN, '#ffffff'), '#000000');

  const corners = { ...DEFAULT_DESIGN, customCorners: true, cornerOuterColor: '#000000', cornerInnerColor: '#fafafa' };
  assert.equal(Color.worstForeground(corners, '#ffffff'), '#fafafa');
});

test('toCmyk maps black to pure K and white to no ink', () => {
  assert.deepEqual(Color.toCmyk('#000000'), [0, 0, 0, 1]);
  assert.deepEqual(Color.toCmyk('#ffffff'), [0, 0, 0, 0]);
  assert.deepEqual(Color.toCmyk('#ff0000'), [0, 1, 1, 0]);
  assert.deepEqual(Color.toCmyk('#808080'), [0, 0, 0, 0.498039]);
  for (const value of Color.toCmyk('#102a43')) {
    assert.ok(value >= 0 && value <= 1 && !Object.is(value, -0));
  }
});

test('toK is one minus the perceptual gray of the stored sRGB values', () => {
  assert.equal(Color.toK('#000000'), 1);
  assert.equal(Color.toK('#ffffff'), 0);
  // Mid-gray prints as about 50% K, not the 78% that 1 - linear luminance gives.
  close(Color.toK('#808080'), 1 - (128 / 255), 1e-6);
  close(Color.toK('#ff0000'), 0.7874, 1e-6);
  close(Color.toK('#00ff00'), 0.2848, 1e-6);
  close(Color.toK('#0000ff'), 0.9278, 1e-6);
  assert.equal(Color.toK('not a color'), 1);
  close(Color.perceptualGray('#808080'), 128 / 255, 1e-9);
  assert.ok(Number.isNaN(Color.perceptualGray('nope')));
  // The WCAG luminance for contrast checks stays linear.
  close(Color.relativeLuminance('#808080'), 0.2158605, 1e-6);
});

test('the module sets one frozen global', () => {
  assert.equal(globalThis.QRTurboColor, Color);
  assert.ok(Object.isFrozen(globalThis.QRTurboColor));
});
