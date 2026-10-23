const { decodeQrBuffer } = require('../helpers/qr-decoder');
const {
  test,
  expect,
  downloadFile,
  fillText,
  openApp
} = require('./fixtures');

// The library draws isDark(i, j) at x = i, y = j, the transpose of a
// standard symbol; the engine swaps it back. This spec proves the exported
// pixels follow the standard orientation: module (row, col) at x = col,
// y = row. The payload is long enough for alignment patterns, so the
// transposed reading cannot match by accident.
const PAYLOAD = 'https://example.com/orientation?row=7&col=3&check=ASYMMETRIC';

function isDarkPixel(pixels, width, x, y) {
  const at = ((y * width) + x) * 4;
  const luminance = (0.299 * pixels[at]) + (0.587 * pixels[at + 1]) + (0.114 * pixels[at + 2]);
  return luminance < 128;
}

test('exported modules match the snapshot matrix at x = col, y = row @webkit-core', async ({ page }) => {
  await openApp(page);
  await page.locator('label[for="preset-classic"]').click();
  await expect(page.locator('#preset-classic')).toBeChecked();
  await fillText(page, PAYLOAD);
  await expect.poll(() => page.evaluate(() => {
    const design = globalThis.QRTurboApp.getSnapshot().design;
    return [design.dotStyle, design.cornerSquareStyle, design.cornerDotStyle, design.frameStyle].join(' ');
  })).toBe('square square square none');

  const snapshot = await page.evaluate(() => {
    const current = globalThis.QRTurboApp.getSnapshot();
    const rows = [];
    for (let row = 0; row < current.moduleCount; row += 1) {
      let line = '';
      for (let col = 0; col < current.moduleCount; col += 1) line += current.matrix(row, col) ? '1' : '0';
      rows.push(line);
    }
    return { rows, moduleCount: current.moduleCount, standardized: current.standardized };
  });
  expect(snapshot.standardized).toBe(true);
  expect(snapshot.moduleCount).toBeGreaterThanOrEqual(29);

  const file = await downloadFile(page);
  expect(file.filename).toMatch(/\.png$/);
  const { pixels, width, height, data } = await decodeQrBuffer(page, file.buffer, 'image/png');
  expect(data).toBe(PAYLOAD);
  expect(width).toBe(1024);

  // The code area is the bounding box of the dark pixels: the finder
  // patterns fill three of its corners.
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!isDarkPixel(pixels, width, x, y)) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  const count = snapshot.moduleCount;
  const moduleWidth = (right - left + 1) / count;
  const moduleHeight = (bottom - top + 1) / count;
  expect(Math.abs(moduleWidth - moduleHeight)).toBeLessThan(0.5);

  let direct = 0;
  let transposed = 0;
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      const x = Math.floor(left + ((col + 0.5) * moduleWidth));
      const y = Math.floor(top + ((row + 0.5) * moduleHeight));
      const dark = isDarkPixel(pixels, width, x, y);
      if (dark !== (snapshot.rows[row][col] === '1')) direct += 1;
      if (dark !== (snapshot.rows[col][row] === '1')) transposed += 1;
    }
  }

  expect(direct, 'modules that differ from matrix(row, col)').toBe(0);
  expect(transposed, 'modules that differ from the transposed matrix').toBeGreaterThan(count * 2);
});
