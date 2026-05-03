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

test('scannability warnings cover low contrast, transparent background and dense data', () => {
  const { context } = createAppHarness();

  context.__qrCustomization.fgColor = '#eeeeee';
  context.__qrCustomization.bgColor = '#777777';
  context.__qrCustomization.transparentBackground = true;
  context.__qrCustomization.margin = 4;

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
