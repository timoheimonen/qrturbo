const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('home page has no serious accessibility violations in either theme', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
  await page.locator('#qr-text').fill('https://example.com/accessibility-check');
  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });
  await page.locator('#customize-toggle').click();
  await expect(page.locator('#customize-panel')).toBeVisible();

  for (const theme of ['light', 'dark']) {
    await page.locator(`[data-theme-choice="${theme}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter(violation =>
      ['critical', 'serious'].includes(violation.impact)
    );

    expect(seriousViolations, `${theme} theme`).toEqual([]);
  }
});

test('a translated type page with an open FAQ has no serious accessibility violations', async ({ page }) => {
  await page.goto('/fi/wifi-qr-code/');
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
  await page.locator('.faq-item summary').first().click();
  await page.locator('#frame-style').selectOption('banner-bottom');

  for (const theme of ['light', 'dark']) {
    await page.locator(`[data-theme-choice="${theme}"]`).click();
    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter(violation =>
      ['critical', 'serious'].includes(violation.impact)
    );

    expect(seriousViolations, `${theme} theme`).toEqual([]);
  }
});

test('type tabs follow the ARIA tabs pattern with keyboard navigation', async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(11);

  const tabState = await tabs.evaluateAll(elements => elements.map(tab => ({
    id: tab.id,
    panelId: tab.getAttribute('aria-controls'),
    selected: tab.getAttribute('aria-selected'),
    tabIndex: tab.tabIndex
  })));
  expect(tabState.filter(tab => tab.tabIndex === 0)).toHaveLength(1);
  expect(tabState.filter(tab => tab.selected === 'true')).toHaveLength(1);
  for (const tab of tabState) {
    const panel = page.locator(`#${tab.panelId}`);
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  }

  const firstTab = page.getByRole('tab', { name: 'URL/Text' });
  const secondTab = page.getByRole('tab', { name: 'vCard' });
  const lastTab = page.getByRole('tab', { name: 'App Link' });

  await firstTab.focus();
  await firstTab.press('ArrowRight');
  await expect(secondTab).toBeFocused();
  await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#VCard')).toBeVisible();
  await expect(page.locator('#URLText')).toBeHidden();

  await secondTab.press('End');
  await expect(lastTab).toBeFocused();
  await lastTab.press('ArrowRight');
  await expect(firstTab).toBeFocused();
  await firstTab.press('ArrowLeft');
  await expect(lastTab).toBeFocused();
  await lastTab.press('Home');
  await expect(firstTab).toBeFocused();
});

test('validation errors are announced and linked to the invalid field', async ({ page }) => {
  await page.goto('/');

  await page.locator('#qr-text').fill('   ');

  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#form-error')).toHaveAttribute('role', 'alert');
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-errormessage', 'form-error');
});
