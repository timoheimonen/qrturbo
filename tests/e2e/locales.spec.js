const { test, expect } = require('@playwright/test');

const LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'fi', 'sv', 'no', 'da', 'zh', 'ja', 'ko',
  'pt', 'nl', 'pl', 'tr', 'id', 'zh-hant', 'cs', 'ro', 'hu', 'el'
];

// The zh-hant pages declare the BCP 47 spelling in <html lang>.
const HTML_LANGS = { 'zh-hant': 'zh-Hant' };

function homePath(lang) {
  return lang === 'en' ? '/' : `/${lang}/`;
}

async function expectTranslated(locator, rawTranslationKey) {
  await expect(locator).toHaveText(/\S/);
  await expect(locator).not.toContainText(rawTranslationKey);
}

for (const lang of LANGUAGES) {
  test(`the ${lang} page is pre-rendered and translates dynamic UI text`, async ({ page }) => {
    await page.goto(homePath(lang));
    await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANGS[lang] || lang);
    await expect(page.locator('#lang-select')).toHaveValue(lang);

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
  });
}

test('every language has its own hero text', async ({ page }) => {
  // Danish and Norwegian share some short phrases, so compare the lead paragraph.
  const leads = new Set();
  for (const lang of LANGUAGES) {
    await page.goto(homePath(lang));
    leads.add(await page.locator('.hero .lead').innerText());
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

test.describe('with a Traditional Chinese (Taiwan) browser', () => {
  test.use({ locale: 'zh-TW' });

  test('the first visit opens the Traditional Chinese pages', async ({ page }) => {
    await page.goto('/wifi-qr-code/');

    await expect.poll(() => new URL(page.url()).pathname).toBe('/zh-hant/wifi-qr-code/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
    await expect(page.locator('#lang-select')).toHaveValue('zh-hant');
  });
});

test.describe('with a Simplified Chinese browser', () => {
  test.use({ locale: 'zh-CN' });

  test('the first visit opens the Simplified Chinese pages', async ({ page }) => {
    await page.goto('/');

    await expect.poll(() => new URL(page.url()).pathname).toBe('/zh/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  });
});

test('the language selector opens the Traditional Chinese page and back', async ({ page }) => {
  await page.goto('/pl/sms-qr-code/');

  await page.locator('#lang-select').selectOption('zh-hant');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/zh-hant/sms-qr-code/');
  await expect(page.locator('#tab-SMSPhone')).toHaveAttribute('aria-selected', 'true');

  await page.locator('#lang-select').selectOption('tr');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/tr/sms-qr-code/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
});

test('uppercase Greek labels drop the accents', async ({ page }) => {
  await page.goto('/el/');

  // The eyebrow is written in sentence case and uppercased by CSS; with
  // lang="el" the rendered capitals must not carry tonos.
  const eyebrow = await page.locator('.hero .eyebrow').innerText();
  expect(eyebrow).toMatch(/[Α-Ω]/);
  expect(eyebrow).not.toMatch(/[ΆΈΉΊΌΎΏάέήίόύώ]/);
});
