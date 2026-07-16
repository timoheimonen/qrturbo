const { test, expect } = require('@playwright/test');

const CALENDAR_NOW = new Date('2026-05-03T08:00:00.000Z');

const happyPathCases = [
  {
    name: 'vCard',
    tab: 'vCard',
    expected: [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Lovelace;Ada;;;',
      'FN:Ada Lovelace',
      'EMAIL:ada@example.com',
      'URL:https://example.com/ada',
      'END:VCARD'
    ].join('\r\n'),
    fill: async page => {
      await page.locator('#vcard-fn').fill('Ada');
      await page.locator('#vcard-ln').fill('Lovelace');
      await page.locator('#vcard-email').fill('ada@example.com');
      await page.locator('#vcard-url').fill('https://example.com/ada');
    }
  },
  {
    name: 'SMS/Phone',
    tab: 'SMS/Phone',
    expected: 'SMSTO:+358401234567:Meet at 10?',
    fill: async page => {
      await page.locator('#sms-phone-number').fill('+358401234567');
      await page.locator('#sms-message').fill('Meet at 10?');
    }
  },
  {
    name: 'Email',
    tab: 'Email',
    expected: 'mailto:hello@example.com?subject=Hello%20QR&body=Line%201%0D%0ALine%202',
    fill: async page => {
      await page.locator('#email-to').fill('hello@example.com');
      await page.locator('#email-subject').fill('Hello QR');
      await page.locator('#email-body').fill('Line 1\nLine 2');
    }
  },
  {
    name: 'Calendar',
    tab: 'Event',
    fixedTime: CALENDAR_NOW,
    expected: [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//QRTurbo.app//QR Event//EN',
      'BEGIN:VEVENT',
      `UID:${CALENDAR_NOW.valueOf()}@qrturbo.app`,
      'DTSTAMP:20260503T080000Z',
      'DTSTART:20260503T103000',
      'DTEND:20260503T110000',
      'SUMMARY:Team\\, sync\\; planning',
      'LOCATION:Room A',
      'DESCRIPTION:Review\\nDecisions',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n'),
    fill: async page => {
      await page.locator('#event-title').fill('Team, sync; planning');
      await page.locator('#event-start').fill('2026-05-03T10:30');
      await page.locator('#event-end').fill('2026-05-03T11:00');
      await page.locator('#event-location').fill('Room A');
      await page.locator('#event-description').fill('Review\nDecisions');
    }
  },
  {
    name: 'Location',
    tab: 'Location',
    expected: 'geo:60.1719,24.9414?q=Helsinki%20Central%20Station',
    fill: async page => {
      await page.locator('#location-address').fill('Helsinki Central Station');
      await page.locator('#location-lat').fill('60.1719');
      await page.locator('#location-lng').fill('24.9414');
    }
  },
  {
    name: 'MeCard',
    tab: 'MeCard',
    expected: 'MECARD:N:Ada Lovelace;TEL:+358401234567;EMAIL:ada@example.com;URL:https\\://example.com/ada;ADR:1 Main St\\, London;;',
    fill: async page => {
      await page.locator('#mecard-name').fill('Ada Lovelace');
      await page.locator('#mecard-phone').fill('+358401234567');
      await page.locator('#mecard-email').fill('ada@example.com');
      await page.locator('#mecard-url').fill('https://example.com/ada');
      await page.locator('#mecard-address').fill('1 Main St, London');
    }
  },
  {
    name: 'App Link',
    tab: 'App Link',
    expected: 'https://example.com/app',
    fill: async page => {
      await page.locator('#app-web-url').fill('https://example.com/app');
      await page.locator('#app-ios-url').fill('https://apps.apple.com/app/example');
      await page.locator('#app-android-url').fill('https://play.google.com/store/apps/details?id=example');
      await page.locator('#app-link-target').selectOption('android');
    }
  }
];

for (const happyPath of happyPathCases) {
  test(`${happyPath.name} browser happy path builds the final payload and QR`, async ({ page }) => {
    await page.goto('/');
    if (happyPath.fixedTime) {
      await page.clock.setFixedTime(happyPath.fixedTime);
    }

    await page.getByRole('tab', { name: happyPath.tab, exact: true }).click();
    await happyPath.fill(page);

    const payload = page.locator('#qr-code-text');
    await expect.poll(() => payload.textContent(), { timeout: 10_000 }).toBe(happyPath.expected);
    await expect(page.locator('#qr-canvas-container canvas, #qr-canvas-container svg')).toBeVisible();
    await expect(page.locator('#download-btn')).toBeVisible();
    await expect(page.locator('#download-btn')).toBeEnabled();
  });
}

async function expectFieldValidation(page, fieldId, rawTranslationKey) {
  const formError = page.locator('#form-error');
  const field = page.locator(`#${fieldId}`);

  await expect(formError).toBeVisible();
  await expect(formError).toHaveText(/\S/);
  await expect(formError).not.toHaveText(rawTranslationKey);
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAttribute('aria-errormessage', 'form-error');
}

test('invalid email validation identifies the recipient field', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Email', exact: true }).click();
  await page.locator('#email-to').fill('not-an-email');

  await expectFieldValidation(page, 'email-to', 'alerts.emailInvalid');
});

test('cross-field calendar validation identifies an end before start', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Event', exact: true }).click();
  await page.locator('#event-title').fill('Planning');
  await page.locator('#event-start').fill('2026-05-03T11:00');
  await page.locator('#event-end').fill('2026-05-03T10:30');

  await expectFieldValidation(page, 'event-end', 'alerts.eventEndInvalid');
});
