const {
  test,
  expect,
  fillText,
  openApp,
  translate,
  waitForReady
} = require('./fixtures');

// The fixture fails every test here on any dialog event, so these flows also
// prove that none of them falls back to alert() or confirm().

const EMPTY_KEYS = {
  URLText: 'urlText',
  VCard: 'vcard',
  SMSPhone: 'smsPhone',
  Wifi: 'wifi',
  Email: 'email',
  CalendarEvent: 'calendarEvent',
  Location: 'location',
  SocialMedia: 'socialMedia',
  WhatsApp: 'whatsapp',
  Payment: 'payment',
  MeCard: 'mecard',
  AppLink: 'appLink'
};

/**
 * Records every #qr-stage state and whether a preview svg was attached at
 * that moment.
 */
async function recordStage(page) {
  await page.evaluate(() => {
    const stage = document.getElementById('qr-stage');
    window.__stageLog = [];
    const record = () => {
      const svg = stage.querySelector('#qr-canvas-container svg');
      window.__stageLog.push({ state: stage.dataset.state, svg: Boolean(svg && svg.isConnected) });
    };
    new MutationObserver(record).observe(stage, { attributes: true, childList: true, subtree: true });
  });
}

test('the preview stays attached while editing and goes pending, then ready @webkit-core', async ({ page }) => {
  await openApp(page);
  await fillText(page, 'https://example.com/first');
  await recordStage(page);

  const next = 'https://example.com/first-and-then-a-longer-second-revision';
  await page.locator('#qr-text').fill(next);
  await expect(page.locator('#qr-stage')).toHaveAttribute('data-state', 'pending');
  await expect(page.locator('#download-btn')).not.toHaveAttribute('aria-disabled', 'true');
  await waitForReady(page, next);

  const log = await page.evaluate(() => window.__stageLog);
  const states = log.map(entry => entry.state);
  expect(states).toContain('pending');
  expect(states.indexOf('pending')).toBeLessThan(states.lastIndexOf('ready'));
  expect(states[states.length - 1]).toBe('ready');
  expect(log.every(entry => entry.svg), 'an svg is attached at every stage mutation').toBe(true);
  await expect(page.locator('#qr-canvas-container svg')).toHaveCount(1);
  await expect(page.locator('#qr-canvas-container svg')).toHaveAttribute('viewBox', /^0 0 \d+ \d+$/);
});

test('invalid content keeps the dimmed artwork, disables Download and Go to field focuses the field', async ({ page }) => {
  await openApp(page);
  await page.locator('#tab-SMSPhone').click();
  await page.locator('#sms-phone-number').fill('+358401234567');
  await waitForReady(page, 'SMSTO:+358401234567');

  await page.locator('#sms-phone-number').fill('+358401234567x');
  const stage = page.locator('#qr-stage');
  await expect(stage).toHaveAttribute('data-state', 'invalid');
  await expect(page.locator('#qr-canvas-container svg')).toHaveCount(1);
  await expect(page.locator('#qr-canvas-container')).toHaveCSS('opacity', '0.35');
  await expect(page.locator('#download-btn')).toHaveAttribute('aria-disabled', 'true');

  // The error appears after the idle delay, never as a dialog.
  await expect(stage).toHaveAttribute('data-revealed', 'true');
  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#form-error')).toHaveText(await translate(page, 'alerts.phoneInvalid'));
  await expect(page.locator('#sms-phone-number')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#qr-placeholder-text')).toHaveText(await translate(page, 'empty.invalid'));

  const fix = page.locator('#stage-fix-btn');
  await expect(fix).toHaveText(await translate(page, 'actions.goToField'));
  await page.locator('#tab-SMSPhone').focus();
  await fix.click();
  await expect(page.locator('#sms-phone-number')).toBeFocused();

  // A click on the disabled Download moves focus to the field instead.
  await page.locator('#tab-SMSPhone').focus();
  let downloaded = false;
  page.on('download', () => {
    downloaded = true;
  });
  await page.locator('#download-btn').click({ force: true });
  await expect(page.locator('#sms-phone-number')).toBeFocused();

  await page.locator('#sms-phone-number').fill('+358401234568');
  await waitForReady(page, 'SMSTO:+358401234568');
  await expect(page.locator('#form-error')).toBeHidden();
  await expect(page.locator('#sms-phone-number')).not.toHaveAttribute('aria-invalid', 'true');
  expect(downloaded).toBe(false);
});

test('every untouched tab shows its own empty text and no error', async ({ page }) => {
  await openApp(page);
  const stage = page.locator('#qr-stage');
  const placeholder = page.locator('#qr-placeholder-text');

  for (const [tab, key] of Object.entries(EMPTY_KEYS)) {
    await page.locator(`#tab-${tab}`).click();
    await expect(page.locator(`#tab-${tab}`)).toHaveAttribute('aria-selected', 'true');
    await expect(stage).toHaveAttribute('data-state', 'empty');
    await expect(placeholder).toHaveText(await translate(page, `empty.${key}`));
    await expect(page.locator('#download-btn')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#form-error')).toBeHidden();
    await expect(page.locator('#scan-badge')).toBeHidden();
  }

  // Download on an empty tab focuses its first field.
  await page.locator('#tab-Wifi').click();
  await expect(placeholder).toHaveText(await translate(page, 'empty.wifi'));
  await page.locator('#download-btn').click({ force: true });
  await expect(page.locator('#wifi-ssid')).toBeFocused();
});

test('"Add https://" turns a bare domain into a link and keeps focus in the field', async ({ page }) => {
  await openApp(page);
  const hint = page.locator('#url-https-hint');
  await expect(hint).toBeHidden();

  await page.locator('#qr-text').fill('www.example.com/menu?table=4');
  await expect(hint).toBeVisible();
  await expect(hint).toContainText(await translate(page, 'helpers.httpsSuggestion'));
  await expect(page.locator('#url-https-btn')).toHaveText(await translate(page, 'actions.addHttps'));

  await page.locator('#url-https-btn').click();
  await expect(page.locator('#qr-text')).toHaveValue('https://www.example.com/menu?table=4');
  await expect(page.locator('#qr-text')).toBeFocused();
  await expect(hint).toBeHidden();
  await waitForReady(page, 'https://www.example.com/menu?table=4');

  // Text that is not a bare domain gets no hint.
  for (const value of ['hello world', 'name@example.com', 'mailto:a@example.com', 'just-text']) {
    await page.locator('#qr-text').fill(value);
    await waitForReady(page, value);
    await expect(hint).toBeHidden();
  }
});

test('too much content shows the stage message and "Use level L" makes it fit', async ({ page }) => {
  await openApp(page);
  // 1200 two-byte letters are 2400 bytes: over the 2331-byte limit of level
  // M, under 2953 at level L, and within the 2000-character field limit.
  const payload = 'ä'.repeat(1200);
  await page.locator('#qr-text').fill(payload);

  const stage = page.locator('#qr-stage');
  await expect(stage).toHaveAttribute('data-state', 'tooLong', { timeout: 10_000 });
  await expect(page.locator('#qr-placeholder-text')).toHaveText(await translate(page, 'empty.tooLong'));
  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page.locator('#form-error')).toHaveText(await translate(page, 'alerts.dataTooLong'));
  await expect(page.locator('#download-btn')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#qr-canvas-container svg')).toHaveCount(0);

  const useL = page.locator('#capacity-fix-btn');
  await expect(useL).toHaveText(await translate(page, 'actions.useLevelL'));
  await useL.click();
  await waitForReady(page, payload);
  expect(await page.evaluate(() => globalThis.QRTurboApp.getSnapshot().ecl)).toBe('L');
  await expect(page.locator('#form-error')).toBeHidden();
  await expect(page.locator('#toast-region')).toContainText(
    await translate(page, 'toast.applied', { what: await translate(page, 'actions.useLevelL') })
  );
});

test('App Link shows the one link the code holds and when store links are left out', async ({ page }) => {
  await openApp(page);
  await page.locator('#tab-AppLink').click();
  const target = page.locator('#app-preview-url');
  const note = page.locator('#app-link-note');
  const ios = 'https://apps.apple.com/app/example';
  const android = 'https://play.google.com/store/apps/details?id=example';
  const web = 'https://example.com/app';

  await expect(page.locator('#app-web-url-help')).toHaveText(await translate(page, 'helpers.appWebUrl'));
  await expect(target).toHaveText('-');
  await expect(note).toBeHidden();

  // Both stores without a web page: only the chosen one goes into the code.
  await page.locator('#app-ios-url').fill(ios);
  await page.locator('#app-android-url').fill(android);
  await expect(target).toHaveText(ios);
  await expect(note).toHaveText(await translate(page, 'helpers.appOneStore'));
  await waitForReady(page, ios);

  await page.locator('#app-link-target').selectOption('android');
  await expect(target).toHaveText(android);
  await waitForReady(page, android);

  // A web page replaces both store links.
  await page.locator('#app-web-url').fill(web);
  await expect(target).toHaveText(web);
  await expect(note).toHaveText(await translate(page, 'helpers.appStoresUnused'));
  await waitForReady(page, web);

  // A single link needs no note.
  await page.locator('#app-ios-url').fill('');
  await page.locator('#app-android-url').fill('');
  await expect(target).toHaveText(web);
  await expect(note).toBeHidden();
});
