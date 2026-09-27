const { test, expect } = require('@playwright/test');

async function expectTranslated(locator, rawTranslationKey) {
  await expect(locator).toHaveText(/\S/);
  await expect(locator).not.toContainText(rawTranslationKey);
}

test('every selectable locale translates dynamic UI text', async ({ page }) => {
  await page.goto('/');
  const localeOptions = await page.locator('#lang-select option').evaluateAll(options => (
    options.map(option => option.value)
  ));
  expect(localeOptions).toHaveLength(12);

  // A visible validation error must be re-translated when the language changes.
  await page.locator('#qr-text').fill('   ');
  await expect(page.locator('#form-error')).toBeVisible();

  for (const locale of localeOptions) {
    await page.locator('#lang-select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expectTranslated(page.locator('#char-count'), 'counters.characters');
    await expectTranslated(page.locator('#qr-margin-value'), 'units.modules');
    await expectTranslated(page.locator('#form-error'), 'alerts.enterText');
  }

  // The hidden WiFi payload notice must be re-translated without revealing the password.
  await page.locator('#lang-select').selectOption('en');
  await page.getByRole('tab', { name: 'WiFi' }).click();
  await page.locator('#wifi-ssid').fill('Private');
  await page.locator('#wifi-password').fill('supersecret');
  const payloadText = page.locator('#qr-code-text');
  await expect(payloadText).toBeVisible({ timeout: 10_000 });

  for (const locale of localeOptions) {
    await page.locator('#lang-select').selectOption(locale);
    await expectTranslated(payloadText, 'misc.wifiPayloadHidden');
    await expect(payloadText).not.toContainText('supersecret');
  }
});
