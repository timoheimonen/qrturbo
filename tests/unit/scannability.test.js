const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppHarness } = require('../helpers/app-vm');

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
