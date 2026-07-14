const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppHarness } = require('../helpers/app-vm');

test('PDF export creates a valid single-page PDF without embedding a payload caption', async () => {
  const app = createAppHarness();
  const imageData = {
    width: 2,
    height: 2,
    data: new Uint8ClampedArray([
      0, 0, 0, 255,
      255, 255, 255, 255,
      255, 255, 255, 255,
      0, 0, 0, 255
    ])
  };

  const sensitivePayload = 'WIFI:S:Secret;T:WPA;P:do-not-leak-this;';
  const blob = app.context.createQRCodePdfBlob(imageData, sensitivePayload);
  const buffer = Buffer.from(await blob.arrayBuffer());
  const pdfText = buffer.toString('latin1');

  assert.equal(blob.type, 'application/pdf');
  assert.equal(buffer.subarray(0, 5).toString('latin1'), '%PDF-');
  assert.match(pdfText, /\/Type \/Page/);
  assert.match(pdfText, /\/Subtype \/Image/);
  assert.match(pdfText, /\/Width 2/);
  assert.match(pdfText, /\/Height 2/);
  assert.doesNotMatch(pdfText, /do-not-leak-this|WIFI:/);
  assert.doesNotMatch(pdfText, /\) Tj/);
  assert.match(pdfText, /%%EOF\s*$/);
});
