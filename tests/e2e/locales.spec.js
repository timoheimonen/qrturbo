const { test, expect } = require('@playwright/test');

test('every selectable locale updates document language and dynamic UI text', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('   ');
  await expect(page.locator('#form-error')).toBeVisible();

  const localeOptions = await page.locator('#lang-select option').evaluateAll(options => (
    options.map(option => option.value)
  ));
  expect(localeOptions).toHaveLength(12);

  for (const locale of localeOptions) {
    await page.locator('#lang-select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);

    const dynamicTexts = [
      ['#char-count', 'counters.characters'],
      ['#qr-margin-value', 'units.modules'],
      ['#form-error', 'alerts.enterText']
    ];

    for (const [selector, rawTranslationKey] of dynamicTexts) {
      const dynamicText = page.locator(selector);
      await expect(dynamicText).toHaveText(/\S/);
      await expect(dynamicText).not.toContainText(rawTranslationKey);
    }
  }
});
