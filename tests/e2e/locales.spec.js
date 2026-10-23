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

// The language menu opens from its toggle and links to the same page in
// every language; the page's own language is marked aria-current.
async function chooseLanguage(page, lang) {
  await page.locator('.lang-toggle').click();
  await page.locator(`.lang-list a[data-lang="${lang}"]`).click();
}

async function expectMenuLanguage(page, lang) {
  await expect(page.locator('.lang-list a[aria-current="true"]')).toHaveAttribute('data-lang', lang);
}

async function expectTranslated(locator, rawTranslationKey) {
  await expect(locator).toHaveText(/\S/);
  await expect(locator).not.toContainText(rawTranslationKey);
}

for (const lang of LANGUAGES) {
  test(`the ${lang} page is pre-rendered and translates dynamic UI text`, async ({ page }) => {
    await page.goto(homePath(lang));
    await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANGS[lang] || lang);
    await expectMenuLanguage(page, lang);

    // A visible validation error is created at runtime in the page language.
    await page.locator('#qr-text').fill('   ');
    await expect(page.locator('#form-error')).toBeVisible();
    await expectTranslated(page.locator('#form-error'), 'alerts.enterText');
    await expectTranslated(page.locator('#char-count'), 'counters.characters');
    await expectTranslated(page.locator('#qr-margin-value'), 'units.modules');

    // The hidden WiFi payload notice is translated without revealing the
    // password. The encoded data sits in a collapsed panel.
    await page.locator('#tab-Wifi').click();
    await page.locator('#wifi-ssid').fill('Private');
    await page.locator('#wifi-password').fill('supersecret');
    await page.locator('#payload-toggle').click();
    await expect(page.locator('#payload-toggle')).toHaveAttribute('aria-expanded', 'true');
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

  await chooseLanguage(page, 'fi');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/fi/wifi-qr-code/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fi');
  await expect(page.locator('#tab-Wifi')).toHaveAttribute('aria-selected', 'true');

  // English pages now open in the remembered language.
  await page.goto('/vcard-qr-code/');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/fi/vcard-qr-code/');

  // Choosing English is remembered as well.
  await chooseLanguage(page, 'en');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/vcard-qr-code/');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).pathname).toBe('/');
});

test('the language menu works with the keyboard, closes on its own and keeps the query', async ({ page }) => {
  await page.goto('/wifi-qr-code/?ref=menu');
  const menu = page.locator('[data-lang-menu]');
  const toggle = page.locator('.lang-toggle');

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveJSProperty('open', true);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lang-list a[data-lang="en"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lang-list a[data-lang="es"]')).toBeFocused();
  // Two columns: the right arrow jumps to the language beside it.
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.lang-list a').nth(12)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveJSProperty('open', false);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await expect(page.locator('.lang-list')).toBeVisible();
  await page.locator('.hero .display').click();
  await expect(menu).toHaveJSProperty('open', false);

  await toggle.click();
  await page.locator('.lang-list a[data-lang="de"]').click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/de/wifi-qr-code/');
  expect(new URL(page.url()).search).toBe('?ref=menu');
});

test('the open language menu fits a 320 px phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/hu/');
  await page.locator('.lang-toggle').click();

  const box = await page.locator('.lang-list').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await expect(page.locator('.lang-list a[data-lang="id"]')).toBeVisible();
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
    await expectMenuLanguage(page, 'zh-hant');
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

  await chooseLanguage(page, 'zh-hant');
  await expect.poll(() => new URL(page.url()).pathname).toBe('/zh-hant/sms-qr-code/');
  await expect(page.locator('#tab-SMSPhone')).toHaveAttribute('aria-selected', 'true');

  await chooseLanguage(page, 'tr');
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
