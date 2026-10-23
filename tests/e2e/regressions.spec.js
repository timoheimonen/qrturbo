const fs = require('node:fs');
const { test, expect } = require('@playwright/test');

const { decodeQrBuffer, decodeQrDownload } = require('../helpers/qr-decoder');
const { parsePdf } = require('../helpers/vector-inspect');

/**
 * Records every #qr-stage data-state value from now on, so a test can prove
 * that a short-lived state such as "pending" was entered.
 */
async function recordStageStates(page) {
  await page.evaluate(() => {
    const stage = document.getElementById('qr-stage');
    window.__stageStates = [stage.dataset.state];
    new MutationObserver(() => window.__stageStates.push(stage.dataset.state))
      .observe(stage, { attributes: true, attributeFilter: ['data-state'] });
  });
}

async function selectFormat(page, format) {
  await page.locator(`label[for="format-${format}"]`).click();
  await expect(page.locator(`#format-${format}`)).toBeChecked();
}

test('switching to an untouched empty tab does not announce a validation error', async ({ page }) => {
  await page.goto('/');
  await page.clock.install();

  await page.getByRole('tab', { name: 'vCard' }).click();
  // Errors are revealed after 1.2 s of idle time, so run well past it.
  await page.clock.runFor(2_000);

  await expect(page.locator('#form-error')).toBeHidden();
});

test('download right after editing exports the latest input and preserves exact URL/Text data', async ({ page }) => {
  await page.goto('/');

  await page.locator('#qr-text').fill('first revision');
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(page.locator('#download-btn')).toBeEnabled();
  await recordStageStates(page);

  // Download at once: the click must wait for the new revision instead of
  // saving the stale code, and the old artwork stays on screen meanwhile.
  const exactValue = '  second revision  ';
  await page.locator('#qr-text').fill(exactValue);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  await expect(page.locator('#qr-canvas-container svg')).toHaveCount(1);

  const decoded = await decodeQrDownload(page, await downloadPromise);
  expect(decoded.data).toBe(exactValue);

  await expect(page.locator('#qr-canvas-container svg')).toBeAttached();
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  expect(await page.evaluate(() => window.__stageStates)).toContain('pending');
  expect(await page.locator('#qr-code-text').textContent()).toBe(exactValue);
});

test('capacity failures are visible and leave no stale downloadable QR', async ({ page }) => {
  await page.goto('/');
  await page.locator('#customize-toggle').click();
  await page.locator('#qr-error-correction').selectOption('H');
  await page.locator('#qr-text').fill('a'.repeat(2000));

  const formError = page.locator('#form-error');
  await expect(formError).toBeVisible({ timeout: 15_000 });
  await expect(formError).not.toHaveText('alerts.dataTooLong');
  await expect(formError).toHaveText(await page.evaluate(() => t('alerts.dataTooLong')));
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'tooLong');
  await expect(page.locator('#download-btn')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#qr-canvas-container svg')).toHaveCount(0);
});

test('representative scan risks render translated user-facing warnings', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('a'.repeat(800));
  await page.locator('#qr-fg-color-text').fill('#eeeeee');
  await page.locator('#qr-transparent-bg').check();

  const badge = page.locator('#scan-badge');
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(badge).toBeVisible();
  await expect(badge).not.toHaveClass(/\bis-checking\b/, { timeout: 10_000 });
  await badge.click();
  await expect(badge).toHaveAttribute('aria-expanded', 'true');

  const warnings = page.locator('#scan-warnings');
  await expect(warnings).toBeVisible();
  const expectedWarnings = await page.evaluate(() => [
    t('warnings.lowContrast'),
    t('warnings.transparentBackground'),
    t('warnings.denseData')
  ]);
  await expect(page.locator('#scan-issues p')).toHaveText(expectedWarnings);
});

test('SVG preview scales to fit the preview area instead of being cropped', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('https://example.com/svg-preview');
  await page.locator('#size-select').selectOption('1024');
  await selectFormat(page, 'svg');

  const svg = page.locator('#qr-canvas-container svg');
  await expect(svg).toBeVisible({ timeout: 10_000 });
  await expect(svg).toHaveAttribute('viewBox', /^0 0 \d+(\.\d+)? \d+(\.\d+)?$/);

  const fits = await page.evaluate(() => {
    const stage = document.querySelector('.qr-stage').getBoundingClientRect();
    const preview = document.querySelector('#qr-canvas-container svg').getBoundingClientRect();
    return preview.width > 0
      && preview.left >= stage.left && preview.right <= stage.right
      && preview.top >= stage.top && preview.bottom <= stage.bottom;
  });
  expect(fits).toBe(true);
});

test('WiFi password is hidden by default, can be revealed, and never reaches the PDF', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill(' Private:Network ');
  await page.locator('#wifi-password').fill('supersecret');

  const payloadText = page.locator('#qr-code-text');
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(page.locator('#download-btn')).toBeEnabled();
  await expect(payloadText).not.toContainText('supersecret');
  await expect(payloadText).not.toContainText('WIFI:');
  await expect(payloadText).not.toHaveText('misc.wifiPayloadHidden');

  await page.locator('#payload-toggle').click();
  await expect(page.locator('#payload-panel')).toBeVisible();
  await page.locator('#payload-reveal-btn').click();
  await expect(payloadText).toContainText('P:supersecret;');
  await expect(payloadText).toContainText('S: Private\\:Network ;');

  await page.locator('#payload-reveal-btn').click();
  await expect(payloadText).not.toContainText('supersecret');

  await selectFormat(page, 'pdf');
  await expect(page.locator('#download-btn')).toBeEnabled({ timeout: 10_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  const download = await downloadPromise;
  const bytes = fs.readFileSync(await download.path());
  const pdf = bytes.toString('latin1');

  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(pdf.startsWith('%PDF-')).toBe(true);
  expect(pdf).not.toContain('supersecret');
  expect(pdf).not.toContain('WIFI:');

  // A vector PDF: the modules are paths, and without a logo there is no image.
  const parsed = parsePdf(bytes);
  expect(pdf).not.toMatch(/\/Subtype\s*\/Image/);
  expect(parsed.content).toMatch(/\s(re|c|l)\s/);
  expect(parsed.content).toMatch(/\s(f\*?)\s/);
  expect(parsed.content).not.toContain('supersecret');
  expect(parsed.content).not.toContain('WIFI:');

  const decoded = await decodeQrBuffer(page, bytes, 'application/pdf');
  expect(decoded.data).toBe('WIFI:S: Private\\:Network ;T:WPA;P:supersecret;;');
});
