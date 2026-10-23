const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Opens a disclosure button (aria-expanded) unless it is already open, so
 * axe also checks the content behind it.
 */
async function expand(page, selector) {
  const button = page.locator(selector);
  await expect(button).toBeVisible();
  if (await button.getAttribute('aria-expanded') !== 'true') await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
}

test('home page has no serious accessibility violations in either theme', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
  await page.locator('#qr-text').fill('https://example.com/accessibility-check');
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'ready', { timeout: 10_000 });
  await expect(page.locator('#download-btn')).toBeEnabled();
  await expect(page.locator('#scan-badge')).not.toHaveClass(/\bis-checking\b/, { timeout: 10_000 });

  await expand(page, '#customize-toggle');
  await expect(page.locator('#customize-panel')).toBeVisible();
  await expand(page, '#more-formats-toggle');
  await expect(page.locator('#more-formats')).toBeVisible();
  await expand(page, '#payload-toggle');
  await expect(page.locator('#payload-panel')).toBeVisible();
  await expand(page, '#scan-badge');
  await expect(page.locator('#scan-warnings')).toBeVisible();

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
  await page.locator('label[for="frame-banner-bottom"]').click();
  await expect(page.locator('#frame-banner-bottom')).toBeChecked();
  await expect(page.locator('#frame-options')).toBeVisible();

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

test('type tabs follow the ARIA tabs pattern with keyboard navigation', async ({ page }) => {
  await page.goto('/');

  // Eleven types plus Payment; App Link stays the last tab.
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(12);
  await expect(tabs.last()).toHaveAttribute('id', 'tab-AppLink');
  await expect(page.locator('#tab-Payment')).toHaveAttribute('role', 'tab');

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

  // Errors are revealed after a short idle time, never on the keystroke.
  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#form-error')).toHaveAttribute('role', 'alert');
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-errormessage', 'form-error');
  await expect(page.locator('#qr-text')).toHaveAttribute('aria-describedby', /(^|\s)form-error(\s|$)/);

  // A valid value clears the error and its description link.
  await page.locator('#qr-text').fill('https://example.com/valid');
  await expect(page.locator('#form-error')).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('#qr-text')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#qr-text')).not.toHaveAttribute('aria-describedby', /(^|\s)form-error(\s|$)/);
});
