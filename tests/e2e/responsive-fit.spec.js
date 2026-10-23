// Layout fit in long languages, on small and short screens, and the print
// sheet in engines without :has().
const {
  test,
  expect,
  fillText,
  openApp,
  selectFormat,
  waitForReady,
  waitForScan
} = require('./fixtures');

const PAYLOAD = 'https://example.com/fit';

/**
 * Text widths that do not fit in a control: the selected option of each
 * select, measured in the select's own font.
 */
function cutSelects(page, ids) {
  return page.evaluate(selectIds => {
    const context = document.createElement('canvas').getContext('2d');
    return selectIds.filter(id => {
      const select = document.getElementById(id);
      const style = getComputedStyle(select);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const room = select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      return Array.from(select.options).some(option => context.measureText(option.text).width > room + 0.5);
    });
  }, ids);
}

for (const [lang, width] of [['hu', 375], ['el', 320], ['hu', 1366], ['el', 1366]]) {
  test(`the PDF size fields keep room for their values in ${lang} at ${width} px @webkit-core`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openApp(page, `/${lang}/`);
    await fillText(page, PAYLOAD);
    await selectFormat(page, 'pdf');
    await page.locator('#print-width').fill('1250.5');

    const fit = await page.evaluate(() => {
      const input = document.getElementById('print-width');
      const style = getComputedStyle(input);
      const block = document.getElementById('size-block').getBoundingClientRect();
      const unit = document.getElementById('print-unit').getBoundingClientRect();
      return {
        content: input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        unitInside: unit.left >= block.left - 0.5 && unit.right <= block.right + 0.5,
        noSideScroll: document.documentElement.scrollWidth <= window.innerWidth
      };
    });
    // "1250.5" needs about 50 px.
    expect(fit.content).toBeGreaterThanOrEqual(60);
    expect(fit).toMatchObject({ unitInside: true, noSideScroll: true });
    expect(await cutSelects(page, ['pdf-page', 'color-mode'])).toEqual([]);
  });
}

test('a long scan verdict wraps below the heading and stays inside the card @webkit-core', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await openApp(page, '/ro/');
  await fillText(page, PAYLOAD);
  await page.locator('#qr-fg-color-text').fill('#dddddd');
  await page.locator('#qr-fg-color-text').blur();
  await waitForReady(page, PAYLOAD);
  expect((await waitForScan(page)).state).toBe('fail');

  const badge = await page.evaluate(() => {
    const card = document.getElementById('qr-container');
    const inner = card.getBoundingClientRect().right - parseFloat(getComputedStyle(card).paddingRight);
    const box = document.getElementById('scan-badge').getBoundingClientRect();
    const label = document.getElementById('scan-badge-label');
    return { overflow: box.right - inner, cut: label.scrollWidth > label.clientWidth + 1 };
  });
  expect(badge.overflow).toBeLessThanOrEqual(0);
  expect(badge.cut).toBe(false);
});

test('header controls and the print size toggle are 44 px tall on a phone @webkit-core', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openApp(page);
  await fillText(page, PAYLOAD);

  const sizes = await page.evaluate(() => {
    const pill = document.querySelector('.theme-selector').getBoundingClientRect();
    const option = document.querySelector('.theme-option');
    const box = option.getBoundingClientRect();
    const x = box.left + box.width / 2;
    return {
      language: document.querySelector('.lang-toggle').getBoundingClientRect().height,
      themeTop: document.elementFromPoint(x, pill.top + 1)?.closest('.theme-option') === option,
      themeBottom: document.elementFromPoint(x, pill.bottom - 1)?.closest('.theme-option') === option,
      themeHeight: pill.height,
      toggleLabel: document.querySelector('label[for="print-toggle"]').getBoundingClientRect().height,
      noSideScroll: document.documentElement.scrollWidth <= window.innerWidth
    };
  });
  expect(sizes.language).toBeGreaterThanOrEqual(44);
  expect(sizes.themeHeight).toBeGreaterThanOrEqual(44);
  expect(sizes.toggleLabel).toBeGreaterThanOrEqual(44);
  expect(sizes).toMatchObject({ themeTop: true, themeBottom: true, noSideScroll: true });
});

test('on a phone held sideways the header scrolls away and the quick bar stays hidden @webkit-core', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await openApp(page);
  await fillText(page, PAYLOAD);
  await page.locator('#qr-text').blur();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  await expect(page.locator('#mobile-bar')).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.getElementById('menu-bar').getBoundingClientRect().bottom))
    .toBeLessThanOrEqual(0);

  // A portrait phone still gets the sticky header and the bar.
  await page.setViewportSize({ width: 375, height: 667 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('#mobile-bar')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.getElementById('menu-bar').getBoundingClientRect().top))
    .toBe(0);
});

test('Print shows only the code sheet, also in engines without :has() @webkit-core', async ({ page }) => {
  // Without :has() support the browser drops the whole :has() rule.
  await page.route('**/css/styles.css*', async route => {
    const response = await route.fetch();
    const css = (await response.text()).replace(/body:has\(#print-sheet[^{]*\{[^}]*\}/g, '');
    await route.fulfill({ response, body: css });
  });
  await page.addInitScript(() => {
    window.__printCalls = 0;
    window.print = () => {
      window.__printCalls += 1;
    };
  });
  await openApp(page);
  await fillText(page, PAYLOAD);
  expect(await page.evaluate(() => [...document.styleSheets].some(sheet => {
    try {
      return [...sheet.cssRules].some(rule => rule.cssText.includes('body:has(#print-sheet'));
    } catch {
      return false;
    }
  }))).toBe(false);

  const visible = () => page.evaluate(() => [...document.body.children]
    .filter(node => getComputedStyle(node).display !== 'none')
    .map(node => node.id || node.className || node.tagName));

  await page.emulateMedia({ media: 'print' });
  expect(await visible()).toContain('generator');

  await page.emulateMedia({ media: 'screen' });
  await page.locator('#print-btn').click();
  await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(1);
  await page.emulateMedia({ media: 'print' });
  expect(await visible()).toEqual(['print-sheet']);
  await expect(page.locator('#print-sheet img')).toBeVisible();
});
