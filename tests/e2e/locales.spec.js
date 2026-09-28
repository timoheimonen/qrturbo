const { test, expect } = require('@playwright/test');

const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'fi', 'sv', 'no', 'da', 'zh', 'ja', 'ko'];

function homePath(lang) {
  return lang === 'en' ? '/' : `/${lang}/`;
}

async function expectTranslated(locator, rawTranslationKey) {
  await expect(locator).toHaveText(/\S/);
  await expect(locator).not.toContainText(rawTranslationKey);
}

test('every language page is pre-rendered and translates dynamic UI text', async ({ page }) => {
  // Danish and Norwegian share some short phrases, so compare the lead paragraph.
  const leads = new Set();

  for (const lang of LANGUAGES) {
    await page.goto(homePath(lang));
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('#lang-select')).toHaveValue(lang);
    leads.add(await page.locator('.hero .lead').innerText());

    // A visible validation error is created at runtime in the page language.
    await page.locator('#qr-text').fill('   ');
    await expect(page.locator('#form-error')).toBeVisible();
    await expectTranslated(page.locator('#form-error'), 'alerts.enterText');
    await expectTranslated(page.locator('#char-count'), 'counters.characters');
    await expectTranslated(page.locator('#qr-margin-value'), 'units.modules');

    // The hidden WiFi payload notice is translated without revealing the password.
    await page.locator('#tab-Wifi').click();
    await page.locator('#wifi-ssid').fill('Private');
    await page.locator('#wifi-password').fill('supersecret');
    const payloadText = page.locator('#qr-code-text');
    await expect(payloadText).toBeVisible({ timeout: 10_000 });
    await expectTranslated(payloadText, 'misc.wifiPayloadHidden');
    await expect(payloadText).not.toContainText('supersecret');
  }

  expect(leads.size).toBe(LANGUAGES.length);
});

test('the language selector opens the same page in the chosen language and remembers it', async ({ page }) => {
  await page.goto('/wifi-qr-code/');

  await page.locator('#lang-select').selectOption('fi');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/fi/wifi-qr-code/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('#tab-Wifi')).toHaveAttribute('aria-selected', 'true');

  // English pages now open in the remembered language.
  await page.goto('/vcard-qr-code/');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/fi/vcard-qr-code/');

  // Choosing English is remembered as well.
  await page.locator('#lang-select').selectOption('en');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/vcard-qr-code/');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).pathname).toBe('/');
});

test.describe('with a Swedish browser', () => {
  test.use({ locale: 'sv-SE' });

  test('the first visit to an English page opens the browser language', async ({ page }) => {
    await page.goto('/email-qr-code/?ref=test');

    await expect.poll(() => new URL(page.url()).pathname).toBe('/sv/email-qr-code/');
    expect(new URL(page.url()).search).toBe('?ref=test');
    await expect(page.locator('html')).toHaveAttribute('lang', 'sv');
  });

  test('language pages are never redirected', async ({ page }) => {
    await page.goto('/de/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    expect(new URL(page.url()).pathname).toBe('/de/');
  });
});
