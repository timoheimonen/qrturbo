const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('home page has no serious accessibility violations in either theme', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
  await page.locator('#qr-text').fill('https://example.com/accessibility-check');
  await expect(page.locator('#download-btn')).toBeVisible();
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

test('tabs expose complete accessible relationships and one tab stop', async ({ page }) => {
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
    expect(tab.id).toBeTruthy();
    expect(tab.panelId).toBeTruthy();
    const panel = page.locator(`#${tab.panelId}`);
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  }

  const customizeToggle = page.locator('#customize-toggle');
  await expect(customizeToggle).toHaveAttribute('aria-controls', 'customize-panel');
  await expect(customizeToggle).toHaveAttribute('aria-expanded', 'false');
});

test('tab keyboard navigation wraps and supports Home and End', async ({ page }) => {
  await page.goto('/');

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
  await expect(lastTab).toHaveAttribute('aria-selected', 'true');

  await lastTab.press('ArrowRight');
  await expect(firstTab).toBeFocused();
  await expect(firstTab).toHaveAttribute('aria-selected', 'true');

  await firstTab.press('End');
  await expect(lastTab).toBeFocused();
  await lastTab.press('Home');
  await expect(firstTab).toBeFocused();
});

test('validation errors identify their invalid field', async ({ page }) => {
  await page.goto('/');

  await page.locator('#qr-text').fill('   ');

  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-errormessage', 'form-error');
});
