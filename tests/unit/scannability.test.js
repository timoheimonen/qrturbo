const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppHarness } = require('../helpers/app-vm');

test('QR complexity estimation uses byte length, including UTF-8 content', () => {
  const { context } = createAppHarness();

  assert.equal(context.estimateQrComplexity('short text'), 'low');
  assert.equal(context.estimateQrComplexity('a'.repeat(351)), 'medium');
  assert.equal(context.estimateQrComplexity('a'.repeat(701)), 'high');
  assert.equal(context.estimateQrComplexity('a'.repeat(1201)), 'veryHigh');
  assert.equal(context.estimateQrComplexity('å'.repeat(176)), 'medium');
});

test('QR payload adapter preserves complete UTF-8 bytes', () => {
  const { context } = createAppHarness();
  const value = 'Ääkköset 世界 😀';
  const byteString = context.encodeTextForQRCode(value);
  const actualBytes = Buffer.from(Array.from(byteString, character => character.charCodeAt(0)));

  assert.deepEqual(actualBytes, Buffer.from(value, 'utf8'));
  assert.equal(new TextDecoder().decode(actualBytes), value);
});

test('quiet zone pixel calculation guarantees at least four QR modules', () => {
  const { context } = createAppHarness();

  for (const size of [256, 512, 1024]) {
    for (const moduleCount of [21, 57, 177]) {
      const margin = context.calculateQuietZonePixels(size, moduleCount, 4);
      const modulePixels = (size - (2 * margin)) / moduleCount;
      assert.ok(margin / modulePixels >= 4, `${size}px / ${moduleCount} modules`);
    }
  }
});

test('scannability warnings cover low contrast, transparent background and dense data', () => {
  const { context } = createAppHarness();

  context.__qrCustomization.fgColor = '#eeeeee';
  context.__qrCustomization.bgColor = '#777777';
  context.__qrCustomization.transparentBackground = true;
  context.__qrCustomization.margin = 3;

  const warnings = context.getScannabilityWarnings('a'.repeat(800), 256);

  assert.ok(warnings.includes('warnings.lowContrast'));
  assert.ok(warnings.includes('warnings.transparentBackground'));
  assert.ok(warnings.includes('warnings.quietZoneSmall'));
  assert.ok(warnings.includes('warnings.denseData'));
});

test('large logo warnings depend on size and error correction', () => {
  const { context } = createAppHarness();

  context.__qrCustomization.logoImage = 'data:image/png;base64,abc';
  context.__qrCustomization.logoSize = 0.45;
  context.__qrCustomization.errorCorrection = 'M';

  const warnings = context.getScannabilityWarnings('https://example.com', 512);

  assert.ok(warnings.includes('warnings.logoErrorCorrection'));
  assert.ok(warnings.includes('warnings.logoLarge'));

  context.__qrCustomization.errorCorrection = 'H';
  const highCorrectionWarnings = context.getScannabilityWarnings('https://example.com', 512);

  assert.ok(!highCorrectionWarnings.includes('warnings.logoErrorCorrection'));
  assert.ok(highCorrectionWarnings.includes('warnings.logoLarge'));
});
