const { parsePdf } = require('../helpers/vector-inspect');
const {
  test,
  expect,
  decodeFile,
  downloadFile,
  expectPayload,
  fillText,
  jfifDensity,
  openApp,
  pngChunks,
  pngSize,
  selectFormat,
  setPrintSize,
  translate
} = require('./fixtures');

const PAYLOAD = 'https://example.com/print-size?item=42';
// 300 dpi in pixels per metre, as PNG pHYs stores it (SPEC E.1).
const PPM_300_DPI = Math.round(300 / 0.0254);

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await fillText(page, PAYLOAD);
});

test('PNG at 50 mm and 300 dpi is 591 px with a 300 dpi pHYs chunk @webkit-core', async ({ page }) => {
  await setPrintSize(page, { width: 50, unit: 'mm', dpi: 300 });
  await expect(page.locator('#size-select')).toBeDisabled();
  await expect(page.locator('#download-summary')).toHaveText(
    await translate(page, 'output.summaryPrint', { size: '50 mm', dpi: '300' })
  );

  const file = await downloadFile(page);
  expect(file.filename).toBe('qrcode-url-example-com-50mm-300dpi.png');
  expect(pngSize(file.buffer)).toEqual({ width: 591, height: 591 });

  const chunks = pngChunks(file.buffer);
  const types = chunks.map(chunk => chunk.type);
  expect(types[0]).toBe('IHDR');
  expect(types.filter(type => type === 'pHYs')).toHaveLength(1);
  expect(types.indexOf('pHYs')).toBeLessThan(types.indexOf('IDAT'));
  expect(types.some(type => type === 'tEXt' || type === 'iTXt' || type === 'zTXt')).toBe(false);

  const phys = chunks.find(chunk => chunk.type === 'pHYs').data;
  expect(PPM_300_DPI).toBe(11811);
  expect(phys.readUInt32BE(0)).toBe(PPM_300_DPI);
  expect(phys.readUInt32BE(4)).toBe(PPM_300_DPI);
  expect(phys[8]).toBe(1);

  expectPayload(await decodeFile(page, file), PAYLOAD);
});

test('JPG at 300 dpi stores a JFIF density of 300', async ({ page }) => {
  await selectFormat(page, 'jpg');
  await setPrintSize(page, { width: 50, unit: 'mm', dpi: 300 });

  const file = await downloadFile(page);
  expect(file.filename).toBe('qrcode-url-example-com-50mm-300dpi.jpg');
  expect(jfifDensity(file.buffer)).toEqual({ units: 1, x: 300, y: 300 });
  expectPayload(await decodeFile(page, file), PAYLOAD);
});

test('SVG with a print size is 50 mm wide @webkit-core', async ({ page }) => {
  await selectFormat(page, 'svg');
  await expect(page.locator('#vector-size-note')).toBeVisible();
  await setPrintSize(page, { width: 50, unit: 'mm' });
  await expect(page.locator('#print-dpi-group')).toBeHidden();

  const file = await downloadFile(page);
  expect(file.filename).toBe('qrcode-url-example-com-50mm.svg');
  const root = /<svg\b[^>]*>/.exec(file.buffer.toString('utf8'))[0];
  expect(root).toContain('width="50mm"');
  expect(root).toContain('height="50mm"');
  expectPayload(await decodeFile(page, file), PAYLOAD);
});

test('PDF fit page matches the 50 mm width and A4 uses the A4 MediaBox @webkit-core', async ({ page }) => {
  await selectFormat(page, 'pdf');
  await expect(page.locator('#print-size')).toBeVisible();
  await expect(page.locator('#print-width')).toHaveValue('50');
  await expect(page.locator('#pdf-page')).toHaveValue('fit');

  const fit = await downloadFile(page);
  expect(fit.filename).toBe('qrcode-url-example-com-50mm.pdf');
  const fitBox = parsePdf(fit.buffer).mediaBox;
  expect(fitBox[0]).toBe(0);
  expect(fitBox[1]).toBe(0);
  expect(fitBox[2]).toBeCloseTo(141.7323, 3);
  expect(fitBox[3]).toBeCloseTo(141.7323, 3);
  expectPayload(await decodeFile(page, fit), PAYLOAD);

  await page.locator('#pdf-page').selectOption('a4');
  const a4 = await downloadFile(page);
  const a4Box = parsePdf(a4.buffer).mediaBox;
  expect(a4Box[2]).toBeCloseTo(595.28, 1);
  expect(a4Box[3]).toBeCloseTo(841.89, 1);

  // 300 mm does not fit on A4: the code is scaled down, the note says so
  // and the file name gives the width the code really gets.
  await setPrintSize(page, { width: 300, unit: 'mm' });
  await expect(page.locator('#export-notes')).toContainText(await translate(page, 'output.pageTooSmall'));
  const scaled = await downloadFile(page);
  const width = Number(/-(\d+(?:\.\d+)?)mm\.pdf$/.exec(scaled.filename)[1]);
  expect(width).toBeGreaterThan(150);
  expect(width).toBeLessThan(210);
  expectPayload(await decodeFile(page, scaled, { pxPerPt: 1.5 }), PAYLOAD);
});

test('#print-info follows the width and unit', async ({ page }) => {
  const info = page.locator('#print-info');
  await expect(info).toBeHidden();

  await setPrintSize(page, { width: 50, unit: 'mm', dpi: 300 });
  await expect(info).toBeVisible();
  await expect(info).toContainText(/\d mm/);
  const at50 = await info.textContent();

  await page.locator('#print-width').fill('100');
  await expect(info).not.toHaveText(at50);
  await expect(info).toContainText(/\d mm/);

  await page.locator('label[for="print-unit-in"]').click();
  await expect.poll(() => page.evaluate(() => globalThis.QRTurboApp.getExportOptions().print.unit)).toBe('in');
  await expect(info).toContainText(/\d(\.\d+)?\s?in/);

  await page.locator('#print-toggle').uncheck();
  await expect(info).toBeHidden();
});

test('400 mm at 600 dpi is capped at 4096 px with a note', async ({ page }) => {
  await setPrintSize(page, { width: 400, unit: 'mm', dpi: 600 });
  const capped = await translate(page, 'output.sizeCapped');
  await expect(page.locator('#export-notes')).toContainText(capped);

  const file = await downloadFile(page);
  expect(file.filename).toBe('qrcode-url-example-com-400mm-600dpi.png');
  expect(pngSize(file.buffer)).toEqual({ width: 4096, height: 4096 });
  // The density is recomputed so that 4096 px still print 400 mm wide.
  const phys = pngChunks(file.buffer).find(chunk => chunk.type === 'pHYs').data;
  expect(phys.readUInt32BE(0)).toBe(Math.round(4096 / 0.4));
});
