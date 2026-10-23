const {
  test,
  expect,
  decodeFile,
  downloadFile,
  expectPayload,
  fillText,
  openApp,
  selectFormat,
  translate
} = require('./fixtures');

// Unicode text is the hardest case for the byte-mode adapter: Latin-1
// letters, CJK and an emoji outside the BMP must survive every format.
const PAYLOAD = 'Ääkköset äöå · 漢字と世界 · emoji 🚀';
// SPEC D.10: qrcode-<type>[-<slug>]-<variant>.<ext>; the slug comes from the
// filenameHint (the first 30 characters of the text).
const SLUG = 'qrcode-text-aakkoset-aoa-emoji';

const FORMATS = {
  png: {
    filename: `${SLUG}-1024px.png`,
    magic: buffer => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  },
  svg: {
    filename: `${SLUG}-vector.svg`,
    magic: buffer => /^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/.test(buffer.toString('utf8'))
  },
  jpg: {
    filename: `${SLUG}-1024px.jpg`,
    magic: buffer => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  },
  pdf: {
    filename: `${SLUG}-50mm.pdf`,
    magic: buffer => buffer.toString('latin1', 0, 9) === '%PDF-1.4\n'
  },
  webp: {
    filename: `${SLUG}-1024px.webp`,
    magic: buffer => buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP'
  },
  eps: {
    filename: `${SLUG}-50mm.eps`,
    magic: buffer => buffer.toString('latin1', 0, 23) === '%!PS-Adobe-3.0 EPSF-3.0'
  }
};

async function exportAndDecode(page, format) {
  await openApp(page);
  await fillText(page, PAYLOAD);
  if (format === 'webp') await expect(page.locator('#more-formats-toggle')).toBeVisible();
  await selectFormat(page, format);
  const formatName = await translate(page, `options.format${format[0].toUpperCase()}${format.slice(1)}`);
  await expect(page.locator('#download-label')).toHaveText(
    await translate(page, 'actions.downloadFormat', { format: formatName })
  );

  const file = await downloadFile(page);
  expect(file.filename).toBe(FORMATS[format].filename);
  expect(FORMATS[format].magic(file.buffer), `${format} magic bytes`).toBe(true);
  expectPayload(await decodeFile(page, file), PAYLOAD);
  return file;
}

for (const format of ['png', 'svg', 'jpg', 'pdf']) {
  test(`${format.toUpperCase()} export decodes to the exact UTF-8 payload @webkit-core`, async ({ page }) => {
    const file = await exportAndDecode(page, format);
    if (format === 'svg') {
      const svg = file.buffer.toString('utf8');
      expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
      expect(svg).toContain('width="1024"');
    }
    if (format === 'pdf') {
      // The payload never leaks into the file as text.
      expect(file.buffer.toString('latin1')).not.toContain('emoji');
      expect(file.buffer.toString('latin1')).toContain('/Producer (QRTurbo.app)');
    }
  });
}

test('WebP export decodes to the exact UTF-8 payload', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('label[for="format-webp"]')).toBeAttached();
  await expect.poll(() => page.locator('#format-webp').evaluate(input => !input.closest('.format-option').hidden))
    .toBe(true);
  await exportAndDecode(page, 'webp');
});

test('EPS export decodes to the exact UTF-8 payload', async ({ page }) => {
  const file = await exportAndDecode(page, 'eps');
  const eps = file.buffer.toString('latin1');
  expect(eps).toMatch(/^%%BoundingBox: 0 0 142 142$/m);
  expect(eps.trimEnd().endsWith('%%EOF')).toBe(true);
  await expect(page.locator('#export-notes')).toContainText(await translate(page, 'output.epsOffice'));
});

test('WebP is offered only where the browser can write it @webkit-core', async ({ page, browserName }) => {
  await openApp(page);
  await page.locator('#more-formats-toggle').click();
  await expect(page.locator('#more-formats')).toBeVisible();
  await expect(page.locator('label[for="format-jpg"]')).toBeVisible();
  await expect(page.locator('label[for="format-eps"]')).toBeVisible();

  const webp = page.locator('label[for="format-webp"]');
  if (browserName === 'webkit') {
    // Safari's toBlob('image/webp') returns a PNG, so the option stays hidden.
    await expect.poll(() => page.evaluate(() => globalThis.QRTurboExport.capabilities().then(caps => caps.webp)))
      .toBe(false);
    await expect(webp).toBeHidden();
  } else {
    await expect(webp).toBeVisible();
  }
});

test('a transparent design exported as JPG gets a white background', async ({ page }) => {
  await openApp(page);
  await fillText(page, 'https://example.com/transparent-jpg');
  await page.locator('#qr-transparent-bg').check();
  await expect.poll(() => page.evaluate(() => globalThis.QRTurboApp.getDesign().transparentBackground)).toBe(true);
  await selectFormat(page, 'jpg');
  await expect(page.locator('#export-notes')).toContainText(await translate(page, 'output.transparentJpg'));

  const file = await downloadFile(page);
  const decoded = await decodeFile(page, file);
  expectPayload(decoded, 'https://example.com/transparent-jpg');

  // Read the pixels without compositing: JPG has no alpha, so the quiet
  // zone and corners must already be white, not black.
  const corners = await page.evaluate(async base64 => {
    const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'image/jpeg' });
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    const last = bitmap.width - 3;
    return [[2, 2], [last, 2], [2, last], [last, last]]
      .map(([x, y]) => Array.from(context.getImageData(x, y, 1, 1).data));
  }, file.buffer.toString('base64'));
  for (const [red, green, blue, alpha] of corners) {
    expect(alpha).toBe(255);
    expect(Math.min(red, green, blue)).toBeGreaterThanOrEqual(245);
  }
});
