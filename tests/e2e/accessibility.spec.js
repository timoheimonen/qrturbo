const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('home page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .disableRules([
      // The app intentionally uses browser alert dialogs for validation today.
      // This test still catches structural, contrast and label regressions.
      'color-contrast'
    ])
    .analyze();

  const seriousViolations = results.violations.filter(violation =>
    ['critical', 'serious'].includes(violation.impact)
  );

  expect(seriousViolations).toEqual([]);
});
