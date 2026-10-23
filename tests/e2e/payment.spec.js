const {
  test,
  expect,
  chooseLogo,
  decodeFile,
  downloadFile,
  expectPayload,
  openApp,
  openCustomize,
  openScanDetails,
  selectFormat,
  translate,
  waitForReady,
  waitForScan
} = require('./fixtures');

// The Finanssiala-style example from SPEC D.9: BIC given (version 001), a
// decimal comma amount, an RF creditor reference and a due date.
const FIELDS = {
  'payment-name': 'Asiakas T. Meikäläinen',
  'payment-iban': 'FI79 4405 2020 0360 82',
  'payment-bic': 'OKOYFIHH',
  'payment-amount': '158,24',
  'payment-reference': 'RF18539007547034',
  'payment-due-date': '2026-11-05'
};
const EPC = [
  'BCD',
  '001',
  '1',
  'SCT',
  'OKOYFIHH',
  'Asiakas T. Meikäläinen',
  'FI7944052020036082',
  'EUR158.24',
  '',
  'RF18539007547034',
  '',
  'ReqdExctnDt/2026-11-05'
].join('\n');

async function fillPayment(page) {
  await page.locator('#tab-Payment').click();
  await expect(page.locator('#Payment')).toBeVisible();
  for (const [id, value] of Object.entries(FIELDS)) {
    await page.locator(`#${id}`).fill(value);
  }
  await waitForReady(page, EPC);
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test('the EPC payment code decodes to the exact SEPA payload @webkit-core', async ({ page }) => {
  await fillPayment(page);
  await expect(page.locator('#payment-bytes')).toContainText(String(Buffer.byteLength(EPC, 'utf8')));

  const png = await downloadFile(page);
  expect(png.filename).toBe('qrcode-payment-asiakas-t-meikalainen-1024px.png');
  expect(png.filename).not.toMatch(/fi79|4405/i);
  expectPayload(await decodeFile(page, png), EPC);

  await selectFormat(page, 'pdf');
  const pdf = await downloadFile(page);
  expect(pdf.filename).toBe('qrcode-payment-asiakas-t-meikalainen-50mm.pdf');
  expect(pdf.buffer.toString('latin1')).not.toContain('FI7944052020036082');
  expectPayload(await decodeFile(page, pdf), EPC);
});

test('payment codes lock error correction at M', async ({ page }) => {
  await fillPayment(page);
  await openCustomize(page);

  const level = page.locator('#qr-error-correction');
  await expect(level).toBeDisabled();
  await expect(level).toHaveValue('M');
  await expect(page.locator('#ecl-locked-help')).toBeVisible();
  await expect(page.locator('#ecl-locked-help')).toHaveText(await translate(page, 'design.eclLockedPayment'));
  await expect(page.locator('#capacity-text')).toContainText(/\bM\b/);
  expect(await page.evaluate(() => globalThis.QRTurboApp.getSnapshot().ecl)).toBe('M');

  // Leaving the tab gives the select back.
  await page.locator('#tab-URLText').click();
  await expect(level).toBeEnabled();
  await expect(level).toHaveValue('auto');
});

test('a logo on a payment code gives the paymentLogo tip, and its fix removes the logo', async ({ page }) => {
  await fillPayment(page);
  await chooseLogo(page, { name: 'bank.png' });
  await waitForReady(page, EPC);
  expect(await page.evaluate(() => globalThis.QRTurboApp.getSnapshot().ecl)).toBe('M');

  const result = await waitForScan(page);
  const ids = result.issues.map(issue => issue.id);
  expect(ids).toContain('paymentLogo');
  expect(ids).not.toContain('logoErrorCorrection');
  expect(result.issues.find(issue => issue.id === 'paymentLogo').severity).toBe('warn');

  await openScanDetails(page);
  const issue = page.locator('#scan-issues li[data-issue="paymentLogo"]');
  await expect(issue.locator('p')).toHaveText(await translate(page, 'warnings.paymentLogo'));
  await expect(issue.locator('.fix-btn')).toHaveText(await translate(page, 'scan.fixRemoveLogo'));
  await issue.locator('.fix-btn').click();
  await expect.poll(() => page.evaluate(() => globalThis.QRTurboApp.getDesign().logo)).toBeNull();
  await waitForReady(page, EPC);
  const cleared = await waitForScan(page);
  expect(cleared.issues.map(entry => entry.id)).not.toContain('paymentLogo');
});

test('an IBAN that fails the checksum is reported at the field', async ({ page }) => {
  await fillPayment(page);
  const iban = page.locator('#payment-iban');
  await iban.fill('FI79 4405 2020 0360 83');
  await iban.blur();

  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'invalid');
  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#form-error')).toHaveText(await translate(page, 'alerts.ibanInvalid'));
  await expect(iban).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#download-btn')).toHaveAttribute('aria-disabled', 'true');
});
