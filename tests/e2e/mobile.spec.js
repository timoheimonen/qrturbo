const {
  test,
  expect,
  decodeFile,
  downloadFile,
  expectPayload,
  fillText,
  openApp,
  selectFormat
} = require('./fixtures');

const PAYLOAD = 'https://example.com/phone?menu=lunch';

function noHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

test('the first screen puts the content field high, with 16 px inputs and the full brand @mobile-smoke', async ({ page, isMobile }) => {
  expect(isMobile).toBe(true);
  await openApp(page);

  // The hero settles with a short transition after load, so poll.
  await expect.poll(() => page.locator('#qr-text').evaluate(node => node.getBoundingClientRect().top))
    .toBeLessThanOrEqual(420);
  await expect(page.locator('.logo-tld')).toBeVisible();
  expect(await noHorizontalScroll(page)).toBe(true);

  // Text-like controls use 16 px so that phones do not zoom on focus.
  const small = await page.evaluate(() => {
    const skip = new Set(['checkbox', 'radio', 'range', 'color', 'file', 'hidden', 'button', 'submit']);
    return [...document.querySelectorAll('#generator input, #generator select, #generator textarea')]
      .filter(node => !(node.tagName === 'INPUT' && skip.has(node.type)))
      .filter(node => node.getClientRects().length > 0)
      .map(node => ({ id: node.id, size: parseFloat(getComputedStyle(node).fontSize) }))
      .filter(entry => entry.size < 16);
  });
  expect(small).toEqual([]);

  // The wordmark stays whole on a 360 px phone.
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(page.locator('.logo-tld')).toBeVisible();
  const header = await page.evaluate(() => {
    const logo = document.querySelector('.logo-mark').getBoundingClientRect();
    const actions = document.querySelector('.header-actions').getBoundingClientRect();
    return { logoRight: logo.right, actionsLeft: actions.left };
  });
  expect(header.logoRight).toBeLessThanOrEqual(header.actionsLeft);
  expect(await noHorizontalScroll(page)).toBe(true);
});

test('the download bar appears after scrolling past the preview and stays on screen @mobile-smoke', async ({ page }) => {
  await openApp(page);
  await fillText(page, PAYLOAD);
  // A focused text field counts as an open keyboard, which hides the bar.
  await page.locator('#qr-text').blur();

  const bar = page.locator('#mobile-bar');
  await page.locator('#qr-container').scrollIntoViewIfNeeded();
  await expect(bar).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(bar).toBeVisible();
  // The bar slides in, so poll until it rests inside the viewport.
  await expect.poll(() => bar.evaluate(node => {
    const box = node.getBoundingClientRect();
    return box.left >= 0 && box.right <= window.innerWidth && box.top >= 0 && box.bottom <= window.innerHeight + 0.5;
  })).toBe(true);
  await expect(page.locator('body')).toHaveClass(/has-mobile-bar/);
  expect(await noHorizontalScroll(page)).toBe(true);

  // The bar downloads the same file as the main button.
  const file = await downloadFile(page, '#mobile-download-btn');
  expect(file.filename).toBe('qrcode-url-example-com-1024px.png');
  expectPayload(await decodeFile(page, file), PAYLOAD);

  // The thumbnail brings the preview back and focuses its heading.
  await page.locator('#mobile-thumb-btn').click();
  await expect(page.locator('#preview-title')).toBeFocused();
  await expect(page.locator('#qr-container')).toBeInViewport();
  await expect(bar).toBeHidden();
});

test('choosing PDF on a phone keeps the page free of sideways scrolling @mobile-smoke', async ({ page }) => {
  await openApp(page);
  await fillText(page, PAYLOAD);
  await selectFormat(page, 'pdf');
  await expect(page.locator('#print-size')).toBeVisible();
  expect(await noHorizontalScroll(page)).toBe(true);
  await selectFormat(page, 'eps');
  await expect(page.locator('#color-mode-group')).toBeVisible();
  expect(await noHorizontalScroll(page)).toBe(true);

  const download = page.locator('#download-btn');
  await download.scrollIntoViewIfNeeded();
  const box = await download.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
});
