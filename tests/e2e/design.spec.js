const {
  test,
  expect,
  decodeFile,
  downloadFile,
  expectPayload,
  fillText,
  openApp,
  openCustomize,
  selectFormat,
  translate,
  waitForReady
} = require('./fixtures');

const PAYLOAD = 'https://example.com/design?theme=ocean';

function design(page) {
  return page.evaluate(() => globalThis.QRTurboApp.getDesign());
}

function snapshotDesign(page) {
  return page.evaluate(() => globalThis.QRTurboApp.getSnapshot().design);
}

async function setHex(page, id, value) {
  await page.locator(`#${id}-text`).fill(value);
  await page.locator(`#${id}-text`).blur();
}

async function previewStats(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('#qr-canvas-container svg');
    const fills = {};
    svg.querySelectorAll('[fill]').forEach(node => {
      const fill = node.getAttribute('fill').toLowerCase();
      fills[fill] = (fills[fill] || 0) + 1;
    });
    return { clipPaths: svg.querySelectorAll('clipPath').length, fills };
  });
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await fillText(page, PAYLOAD);
});

test('a gradient reaches the SVG as linearGradient and the PDF as an axial shading @webkit-core', async ({ page }) => {
  await page.locator('label[for="fill-gradient"]').click();
  await expect(page.locator('#gradient-options')).toBeVisible();
  await expect(page.locator('#gradient-angle-group')).toBeVisible();
  await expect.poll(async () => (await snapshotDesign(page)).fill).toBe('gradient');
  await waitForReady(page, PAYLOAD);
  await expect(page.locator('#qr-canvas-container svg linearGradient')).toHaveCount(1);

  await selectFormat(page, 'svg');
  const svgFile = await downloadFile(page);
  const svg = svgFile.buffer.toString('utf8');
  expect(svg).toContain('<linearGradient');
  expect(svg).toContain('gradientUnits="userSpaceOnUse"');
  expect(svg.toLowerCase()).toContain('#2563eb');
  expectPayload(await decodeFile(page, svgFile), PAYLOAD);

  await selectFormat(page, 'pdf');
  const pdfFile = await downloadFile(page);
  expect(pdfFile.buffer.toString('latin1')).toMatch(/\/ShadingType 2\b/);
  expectPayload(await decodeFile(page, pdfFile), PAYLOAD);

  // Radial hides the angle and switches the SVG paint.
  await page.locator('label[for="gradient-radial"]').click();
  await expect(page.locator('#gradient-angle-group')).toBeHidden();
  await expect.poll(async () => (await snapshotDesign(page)).gradientType).toBe('radial');
  await waitForReady(page, PAYLOAD);
  await expect(page.locator('#qr-canvas-container svg radialGradient')).toHaveCount(1);
});

test('custom corner colors add their own regions', async ({ page }) => {
  const before = await previewStats(page);

  await page.locator('#custom-corners').check();
  await expect(page.locator('#corner-colors')).toBeVisible();
  // The first time they are shown, both start from the code color.
  await expect(page.locator('#corner-outer-color-text')).toHaveValue('#000000');
  await expect(page.locator('#corner-inner-color-text')).toHaveValue('#000000');

  await setHex(page, 'corner-outer-color', '#e11d48');
  await setHex(page, 'corner-inner-color', '#2563eb');
  await expect.poll(async () => {
    const current = await snapshotDesign(page);
    return [current.customCorners, current.cornerOuterColor, current.cornerInnerColor].join(' ');
  }).toBe('true #e11d48 #2563eb');
  await waitForReady(page, PAYLOAD);

  const after = await previewStats(page);
  // Three corner frames and three corner centers, each clipped and filled.
  expect(after.clipPaths).toBe(before.clipPaths + 6);
  expect(after.fills['#e11d48']).toBe(3);
  expect(after.fills['#2563eb']).toBe(3);

  const file = await downloadFile(page);
  expectPayload(await decodeFile(page, file), PAYLOAD);
});

test('a preset followed by a shape change shows Custom, and presets keep colors', async ({ page }) => {
  await setHex(page, 'qr-fg-color', '#102a43');
  await expect.poll(async () => (await design(page)).fgColor).toBe('#102a43');
  await expect(page.locator('#preset-standard')).toBeChecked();
  await expect(page.locator('#preset-custom-tag')).toBeHidden();

  await page.locator('label[for="preset-rounded"]').click();
  await expect(page.locator('#preset-rounded')).toBeChecked();
  await expect.poll(async () => {
    const current = await design(page);
    return [current.dotStyle, current.cornerSquareStyle, current.cornerDotStyle, current.fgColor].join(' ');
  }).toBe('rounded extra-rounded dot #102a43');

  await openCustomize(page);
  await expect(page.locator('#dot-rounded')).toBeChecked();
  await page.locator('label[for="dot-classy"]').click();
  await expect(page.locator('#preset-custom-tag')).toBeVisible();
  await expect(page.locator('#preset-custom-tag')).toHaveText(await translate(page, 'design.custom'));
  await expect(page.locator('input[name="preset"]:checked')).toHaveCount(0);

  await page.locator('label[for="preset-scanme"]').click();
  await expect(page.locator('#preset-scanme')).toBeChecked();
  await expect(page.locator('#preset-custom-tag')).toBeHidden();
  await expect(page.locator('#frame-banner-bottom')).toBeChecked();
  await expect(page.locator('#frame-options')).toBeVisible();
  await expect.poll(async () => (await design(page)).fgColor).toBe('#102a43');
});

test('Reset design restores the defaults only, and Undo brings the design back', async ({ page }) => {
  await selectFormat(page, 'svg');
  await setHex(page, 'qr-fg-color', '#102A43');
  await openCustomize(page);
  await page.locator('label[for="dot-classy"]').click();
  await page.locator('label[for="frame-banner-bottom"]').click();
  await page.locator('#qr-error-correction').selectOption('H');
  await expect.poll(async () => {
    const current = await design(page);
    return [current.fgColor, current.dotStyle, current.frameStyle, current.errorCorrection].join(' ');
  }).toBe('#102a43 classy banner-bottom H');

  await page.locator('#reset-customization').click();
  const toast = page.locator('#toast-region .toast').filter({ hasText: await translate(page, 'toast.designReset') });
  await expect(toast).toBeVisible();
  const undo = toast.getByRole('button', { name: await translate(page, 'actions.undo') });
  await expect(undo).toBeVisible();

  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#000000');
  await expect(page.locator('#qr-bg-color-text')).toHaveValue('#ffffff');
  await expect(page.locator('#dot-square')).toBeChecked();
  await expect(page.locator('#corner-square-extra-rounded')).toBeChecked();
  await expect(page.locator('#corner-dot-dot')).toBeChecked();
  await expect(page.locator('#frame-none')).toBeChecked();
  await expect(page.locator('#preset-standard')).toBeChecked();
  await expect(page.locator('#qr-error-correction')).toHaveValue('auto');
  // Content and export options are not part of the design.
  await expect(page.locator('#qr-text')).toHaveValue(PAYLOAD);
  await expect(page.locator('#format-svg')).toBeChecked();

  await undo.click();
  await expect(page.locator('#qr-fg-color-text')).toHaveValue(/^#102a43$/i);
  await expect(page.locator('#dot-classy')).toBeChecked();
  await expect(page.locator('#frame-banner-bottom')).toBeChecked();
  await expect(page.locator('#qr-error-correction')).toHaveValue('H');
  await waitForReady(page, PAYLOAD);
  expect((await snapshotDesign(page)).fgColor).toBe('#102a43');
});

test('Swap colors exchanges code and background, and is disabled while transparent', async ({ page }) => {
  await setHex(page, 'qr-fg-color', '#102a43');
  await setHex(page, 'qr-bg-color', '#f0f4f8');
  await expect.poll(async () => {
    const current = await design(page);
    return `${current.fgColor} ${current.bgColor}`;
  }).toBe('#102a43 #f0f4f8');

  const swap = page.locator('#swap-colors-btn');
  await expect(swap).toHaveText(await translate(page, 'actions.swapColors'));
  await swap.click();
  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#f0f4f8');
  await expect(page.locator('#qr-bg-color-text')).toHaveValue('#102a43');
  await waitForReady(page, PAYLOAD);
  const swapped = await snapshotDesign(page);
  expect(`${swapped.fgColor} ${swapped.bgColor}`).toBe('#f0f4f8 #102a43');

  await page.locator('#qr-transparent-bg').check();
  await expect(swap).toBeDisabled();
  await page.locator('#qr-transparent-bg').uncheck();
  await expect(swap).toBeEnabled();
});
