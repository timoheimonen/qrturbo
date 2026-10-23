const {
  test,
  expect,
  fillText,
  openApp,
  openScanDetails,
  selectFormat,
  setPrintSize,
  translate,
  waitForReady,
  waitForScan
} = require('./fixtures');

const PAYLOAD = 'https://example.com/scan-check';

async function setHex(page, id, value) {
  await page.locator(`#${id}-text`).fill(value);
  await page.locator(`#${id}-text`).blur();
  await expect.poll(() => page.evaluate(key => globalThis.QRTurboApp.getDesign()[key], id === 'qr-fg-color' ? 'fgColor' : 'bgColor'))
    .toBe(value);
}

async function expectBadge(page, state, labelKey) {
  const badge = page.locator('#scan-badge');
  await expect(badge).toHaveAttribute('data-state', state);
  await expect(page.locator('#scan-badge-label')).toHaveText(await translate(page, labelKey));
}

function issueIds(page) {
  return page.locator('#scan-issues li').evaluateAll(items => items.map(item => item.dataset.issue));
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await fillText(page, PAYLOAD);
});

test('the default design is verified by a test scan and shows "Scans well" @webkit-core', async ({ page }) => {
  const result = await waitForScan(page);
  expect(result.state).toBe('ok');
  expect(result.verified).toBe(true);
  expect(result.issues).toEqual([]);
  await expectBadge(page, 'ok', 'scan.ok');

  await openScanDetails(page);
  await expect(page.locator('#scan-badge')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#scan-summary')).toHaveText(await translate(page, 'scan.verified'));
  await expect(page.locator('#scan-issues li')).toHaveCount(0);
});

test('a very light code fails, and "Use black on white" fixes it with Undo', async ({ page }) => {
  await setHex(page, 'qr-fg-color', '#eeeeee');
  await waitForReady(page, PAYLOAD);
  const failed = await waitForScan(page);
  expect(failed.state).toBe('fail');
  expect(failed.issues[0]).toMatchObject({ id: 'lowContrast', severity: 'fail' });
  await expectBadge(page, 'fail', 'scan.fail');

  await openScanDetails(page);
  const issue = page.locator('#scan-issues li[data-issue="lowContrast"]');
  await expect(issue.locator('p')).toHaveText(await translate(page, 'warnings.lowContrast'));
  const fix = issue.locator('.fix-btn');
  await expect(fix).toHaveText(await translate(page, 'scan.fixBlack'));
  await fix.click();

  const toast = page.locator('#toast-region .toast').filter({
    hasText: await translate(page, 'toast.applied', { what: await translate(page, 'scan.fixBlack') })
  });
  await expect(toast).toBeVisible();
  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#000000');
  await waitForReady(page, PAYLOAD);
  const fixed = await waitForScan(page);
  expect(fixed.state).toBe('ok');
  await expectBadge(page, 'ok', 'scan.ok');

  await toast.getByRole('button', { name: await translate(page, 'actions.undo') }).click();
  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#eeeeee');
  await waitForReady(page, PAYLOAD);
  expect((await waitForScan(page)).state).toBe('fail');
});

test('inverted colors scan with tips and offer "Swap colors"', async ({ page }) => {
  await setHex(page, 'qr-fg-color', '#ffffff');
  await setHex(page, 'qr-bg-color', '#000000');
  await waitForReady(page, PAYLOAD);
  const result = await waitForScan(page);
  expect(result.state).toBe('warn');
  expect(result.issues.map(issue => issue.id)).toEqual(['inverted']);
  await expectBadge(page, 'warn', 'scan.tips');

  await openScanDetails(page);
  const issue = page.locator('#scan-issues li[data-issue="inverted"]');
  await expect(issue.locator('p')).toHaveText(await translate(page, 'warnings.inverted'));
  await issue.locator('.fix-btn').click();
  await expect(page.locator('#qr-fg-color-text')).toHaveValue('#000000');
  await expect(page.locator('#qr-bg-color-text')).toHaveValue('#ffffff');
  await waitForReady(page, PAYLOAD);
  expect((await waitForScan(page)).state).toBe('ok');
});

test('a dense code printed at 10 mm gets printTooSmall with a print size fix', async ({ page }) => {
  const longUrl = `https://example.com/catalogue/item?${Array.from({ length: 12 }, (_, index) => `param${index}=value-${index}-abcdef`).join('&')}`;
  await fillText(page, longUrl);
  await selectFormat(page, 'pdf');
  await setPrintSize(page, { width: 10, unit: 'mm' });

  await expect.poll(() => issueIds(page)).toContain('printTooSmall');
  await expectBadge(page, 'fail', 'scan.fail');
  await openScanDetails(page);
  const issue = page.locator('#scan-issues li[data-issue="printTooSmall"]');
  await expect(issue.locator('p')).toContainText(/\d mm/);
  const fix = issue.locator('.fix-btn');
  await expect(fix).toHaveText(/\d+ mm/);
  const fixLabel = await fix.textContent();
  const fixedWidth = Number(/(\d+)\s?mm/.exec(fixLabel)[1]);
  expect(fixedWidth).toBeGreaterThan(10);

  await fix.click();
  await expect.poll(() => page.evaluate(() => globalThis.QRTurboApp.getExportOptions().print.width)).toBe(fixedWidth);
  await expect(page.locator('#print-width')).toHaveValue(String(fixedWidth));
  await expect.poll(() => issueIds(page)).not.toContain('printTooSmall');
  await expect(page.locator('#scan-badge')).not.toHaveAttribute('data-state', 'fail');
});
