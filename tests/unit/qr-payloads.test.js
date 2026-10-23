const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const { createAppHarness, repoRoot } = require('../helpers/app-vm');
const QRTurboPayloads = require('../../Public/js/lib/payloads.js');

// The iCalendar UTC form of a datetime-local value, as the device reads it.
function utcStamp(localValue) {
  return new Date(localValue).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

test('URL/Text returns the exact entered value and validates empty input', () => {
  const app = createAppHarness();

  app.setActiveTab('URLText');
  app.setValue('qr-text', 'https://example.com/path?q=1');
  assert.equal(app.collect(), 'https://example.com/path?q=1');

  app.setValue('qr-text', '  exact surrounding whitespace  ');
  assert.equal(app.collect(), '  exact surrounding whitespace  ');

  app.setValue('qr-text', ' \n\t ');
  assert.equal(app.collect(true), null);
  assert.deepEqual(app.alerts, ['alerts.enterText']);
});

test('vCard payload includes required fields and escapes reserved characters', () => {
  const app = createAppHarness();

  app.setActiveTab('VCard');
  app.setValue('vcard-fn', 'Ada');
  app.setValue('vcard-ln', 'Love;lace');
  app.setValue('vcard-org', 'Math, Inc.');
  app.setValue('vcard-title', 'Engineer\\Researcher');
  app.setValue('vcard-tel-work', '+1-555-0000');
  app.setValue('vcard-email', 'ada@example.com');
  app.setValue('vcard-street', 'Main\nStreet');
  app.setValue('vcard-city', 'London');

  const payload = app.collect();

  assert.match(payload, /^BEGIN:VCARD\r\nVERSION:3\.0/);
  assert.match(payload, /N:Love\\;lace;Ada;;;/);
  assert.match(payload, /FN:Ada Love\\;lace/);
  assert.match(payload, /ORG:Math\\, Inc\./);
  assert.match(payload, /TITLE:Engineer\\\\Researcher/);
  // ORG is set, so the address is a work address.
  assert.match(payload, /ADR;TYPE=WORK:;;Main\\nStreet;London;;;/);
  assert.match(payload, /END:VCARD$/);
});

test('vCard requires at least one identity or contact field', () => {
  const app = createAppHarness();

  app.setActiveTab('VCard');

  assert.equal(app.collect(true), null);
  assert.deepEqual(app.alerts, ['alerts.vcardRequired']);
});

test('vCard URL and EMAIL stay raw, and the address type follows the rule', () => {
  const app = createAppHarness();

  app.setActiveTab('VCard');
  app.setValue('vcard-fn', 'Ada');
  app.setValue('vcard-email', 'ada@example.com');
  app.setValue('vcard-url', 'https://example.com/a,b');
  app.setValue('vcard-city', 'London');

  let payload = app.collect();
  assert.match(payload, /\r\nURL:https:\/\/example\.com\/a,b\r\n/);
  assert.match(payload, /\r\nEMAIL:ada@example\.com\r\n/);
  // No organization or title: a home address.
  assert.match(payload, /\r\nADR;TYPE=HOME:;;;London;;;\r\n/);

  app.setValue('vcard-title', 'Engineer');
  assert.match(app.collect(), /\r\nADR;TYPE=WORK:/);

  // An explicit address type wins.
  app.setValue('vcard-adr-type', 'home');
  payload = app.collect();
  assert.match(payload, /\r\nADR;TYPE=HOME:/);
  assert.doesNotMatch(payload, /PHOTO/);
});

test('vCard P1 fields: home phone, department, birthday and note', () => {
  const app = createAppHarness();

  app.setActiveTab('VCard');
  app.setValue('vcard-fn', 'Ada');
  app.setValue('vcard-org', 'Math');
  app.setValue('vcard-department', 'R&D; Labs');
  app.setValue('vcard-tel-work', '+1 555 0000');
  app.setValue('vcard-tel-mobile', '+1 555 0001');
  app.setValue('vcard-tel-home', '+1 555 0002');
  app.setValue('vcard-bday', '1815-12-10');
  app.setValue('vcard-note', 'Line 1\nLine, 2');

  assert.equal(
    app.collect(),
    [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:;Ada;;;',
      'FN:Ada',
      'ORG:Math;R&D\\; Labs',
      'TEL;TYPE=WORK,VOICE:+1 555 0000',
      'TEL;TYPE=CELL,VOICE:+1 555 0001',
      'TEL;TYPE=HOME,VOICE:+1 555 0002',
      'BDAY:1815-12-10',
      'NOTE:Line 1\\nLine\\, 2',
      'END:VCARD'
    ].join('\r\n')
  );

  app.setValue('vcard-fn', '');
  app.setValue('vcard-tel-work', '');
  app.setValue('vcard-tel-mobile', '');
  // A home phone alone is enough for a contact.
  assert.match(app.collect(), /\r\nFN:\+1 555 0002\r\n/);
});

test('WiFi payload preserves SSID exactly and validates/escapes QR WiFi data', () => {
  const app = createAppHarness();

  app.setActiveTab('Wifi');
  app.setValue('wifi-ssid', ' Cafe:;Net,Main ');
  app.setValue('wifi-password', 'pass"word\\123');
  app.setValue('wifi-auth', 'WPA');
  app.setChecked('wifi-hidden', true);

  assert.equal(
    app.collect(),
    'WIFI:S: Cafe\\:\\;Net\\,Main ;T:WPA;P:pass\\"word\\\\123;H:true;;'
  );

  app.setValue('wifi-password', 'short');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.wifiWpaPasswordInvalid');

  app.setValue('wifi-auth', 'WEP');
  app.setValue('wifi-password', 'abcde');
  assert.match(app.collect(), /^WIFI:S:/);

  app.setValue('wifi-password', 'abcdef');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.wifiWepPasswordInvalid');

  app.setValue('wifi-ssid', '界'.repeat(11));
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.wifiSsidLengthInvalid');
});

test('WiFi nopass omits the password field', () => {
  const app = createAppHarness();

  app.setActiveTab('Wifi');
  app.setValue('wifi-ssid', 'Guest');
  app.setValue('wifi-password', 'ignored-password');
  app.setValue('wifi-auth', 'nopass');

  assert.equal(app.collect(), 'WIFI:S:Guest;T:nopass;;');
  assert.equal(app.content().isSensitive, false);
});

test('WiFi WPA3 only writes T:WPA with R:1 and is sensitive', () => {
  const app = createAppHarness();

  app.setActiveTab('Wifi');
  app.setValue('wifi-ssid', 'Cafe');
  app.setValue('wifi-password', 'secret12');
  app.setValue('wifi-auth', 'WPA3');
  app.setChecked('wifi-hidden', true);

  assert.equal(app.collect(), 'WIFI:S:Cafe;T:WPA;R:1;P:secret12;H:true;;');

  const result = app.content();
  assert.equal(result.isSensitive, true);
  // The SSID names the file; the password never does.
  assert.equal(result.filenameHint, 'Cafe');

  app.setValue('wifi-auth', 'WPA');
  app.setChecked('wifi-hidden', false);
  assert.equal(app.collect(), 'WIFI:S:Cafe;T:WPA;P:secret12;;');

  app.setValue('wifi-auth', 'WPA3');
  app.setValue('wifi-password', 'short');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.wifiWpaPasswordInvalid');
});

test('SMS/Phone payload switches between SMSTO and tel schemes', () => {
  const app = createAppHarness();

  app.setActiveTab('SMSPhone');
  app.setValue('sms-phone-number', '+15551234567');
  app.setValue('sms-message', 'Hello QR');

  assert.equal(app.collect(), 'SMSTO:+15551234567:Hello QR');

  app.setChecked('sms-type-phone', true);
  assert.equal(app.collect(), 'tel:+15551234567');
});

test('SMS without a message has no trailing colon', () => {
  const app = createAppHarness();

  app.setActiveTab('SMSPhone');
  app.setValue('sms-phone-number', '+15551234567');
  app.setValue('sms-message', '');

  assert.equal(app.collect(), 'SMSTO:+15551234567');
});

test('Phone numbers are normalized and invalid ones are rejected', () => {
  const app = createAppHarness();

  app.setActiveTab('SMSPhone');
  app.setChecked('sms-type-phone', true);

  app.setValue('sms-phone-number', '+1 (555) 123-4567');
  assert.equal(app.collect(), 'tel:+15551234567');

  app.setValue('sms-phone-number', '040 123\u00a04567');
  assert.equal(app.collect(), 'tel:0401234567');

  app.setValue('sms-phone-number', '+358.40.123.4567');
  assert.equal(app.collect(), 'tel:+358401234567');

  for (const invalid of ['call me', '+', '1', '12345678901234567890123', '+1 555 CALL NOW']) {
    app.setValue('sms-phone-number', invalid);
    assert.equal(app.collect(true), null, `${invalid} must not become a phone payload`);
    assert.equal(app.alerts.at(-1), 'alerts.phoneInvalid');
  }

  app.setValue('sms-phone-number', '   ');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.phoneRequired');
});

test('Email payload validates recipient and URL-encodes subject and body', () => {
  const app = createAppHarness();

  app.setActiveTab('Email');
  app.setValue('email-to', 'hello@example.com');
  app.setValue('email-subject', 'Hello QR');
  app.setValue('email-body', 'Line 1\nLine 2');

  const payload = app.collect();

  assert.equal(payload, 'mailto:hello@example.com?subject=Hello%20QR&body=Line%201%0D%0ALine%202');

  app.setValue('email-to', 'not-an-email');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.emailInvalid');
});

test('mailto encodes the address but keeps the @', () => {
  const app = createAppHarness();

  app.setActiveTab('Email');
  app.setValue('email-to', 'a+b@example.com');
  assert.equal(app.collect(), 'mailto:a%2Bb@example.com');

  app.setValue('email-subject', 'Q&A?');
  assert.equal(app.collect(), 'mailto:a%2Bb@example.com?subject=Q%26A%3F');
});

test('Calendar payload creates VCALENDAR in UTC and rejects an end before start', () => {
  const app = createAppHarness();

  app.setActiveTab('CalendarEvent');
  app.setValue('event-title', 'Team, sync; planning');
  app.setValue('event-start', '2026-05-03T10:30');
  app.setValue('event-end', '2026-05-03T11:00');
  app.setValue('event-location', 'Room\\A');
  app.setValue('event-description', 'Line 1\nLine 2');

  const payload = app.collect();

  assert.match(payload, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:-\/\/QRTurbo\.app\/\/QR Event\/\/EN\r\nBEGIN:VEVENT\r\n/);
  assert.ok(payload.includes(`\r\nDTSTART:${utcStamp('2026-05-03T10:30')}\r\n`));
  assert.ok(payload.includes(`\r\nDTEND:${utcStamp('2026-05-03T11:00')}\r\n`));
  assert.match(payload, /\r\nUID:[0-9a-z-]+@qrturbo\.app\r\n/);
  assert.match(payload, /\r\nDTSTAMP:\d{8}T\d{6}Z\r\n/);
  assert.match(payload, /SUMMARY:Team\\, sync\\; planning/);
  assert.match(payload, /LOCATION:Room\\\\A/);
  assert.match(payload, /DESCRIPTION:Line 1\\nLine 2/);
  assert.match(payload, /END:VCALENDAR$/);
  assert.doesNotMatch(payload, /TZID|VTIMEZONE|RRULE|VALARM/);

  // The same event keeps its UID and DTSTAMP, so a redraw keeps the code.
  assert.equal(app.collect(), payload);

  app.setValue('event-end', '2026-05-03T09:00');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.eventEndInvalid');
});

test('Calendar UID uses the fallback without crypto and changes with the event', () => {
  const app = createAppHarness();

  app.setActiveTab('CalendarEvent');
  app.setValue('event-title', 'Launch');
  app.setValue('event-start', '2026-05-03T10:30');
  const first = app.collect().match(/UID:([^\r]+)@qrturbo\.app/)[1];
  assert.match(first, /^[0-9a-z]{10,}$/);

  app.setValue('event-title', 'Launch party');
  const second = app.collect().match(/UID:([^\r]+)@qrturbo\.app/)[1];
  assert.notEqual(second, first);
});

test('Calendar all-day events use VALUE=DATE with an exclusive end', () => {
  const app = createAppHarness();

  app.setActiveTab('CalendarEvent');
  app.setValue('event-title', 'Conference');
  app.setChecked('event-all-day', true);
  app.setValue('event-start', '2026-12-30');
  app.setValue('event-end', '2026-12-31');

  let payload = app.collect();
  assert.match(payload, /\r\nDTSTART;VALUE=DATE:20261230\r\nDTEND;VALUE=DATE:20270101\r\n/);
  assert.doesNotMatch(payload, /DTSTART:/);

  // Without an end date the event lasts one day.
  app.setValue('event-end', '');
  payload = app.collect();
  assert.match(payload, /\r\nDTSTART;VALUE=DATE:20261230\r\nDTEND;VALUE=DATE:20261231\r\n/);

  app.setValue('event-end', '2026-12-29');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.eventEndInvalid');
});

test('Calendar times in an explicit time zone are converted to UTC', () => {
  const app = createAppHarness();

  app.setActiveTab('CalendarEvent');
  app.setValue('event-title', 'Call');
  app.setValue('event-time-zone', 'America/New_York');
  app.setValue('event-start', '2026-01-15T09:00');
  app.setValue('event-end', '2026-07-15T09:00');

  const payload = app.collect();
  // EST is UTC-5 in January, EDT is UTC-4 in July.
  assert.match(payload, /\r\nDTSTART:20260115T140000Z\r\n/);
  assert.match(payload, /\r\nDTEND:20260715T130000Z\r\n/);

  app.setValue('event-time-zone', 'Asia/Tokyo');
  app.setValue('event-end', '');
  assert.match(app.collect(), /\r\nDTSTART:20260115T000000Z\r\n/);
});

test('Location payload supports address and coordinate modes', () => {
  const app = createAppHarness();

  app.setActiveTab('Location');
  app.setValue('location-address', '1600 Amphitheatre Parkway');
  assert.equal(
    app.collect(),
    'https://www.google.com/maps/search/?api=1&query=1600%20Amphitheatre%20Parkway'
  );

  app.setValue('location-lat', '37.422');
  app.setValue('location-lng', '-122.084');
  assert.equal(app.collect(), 'geo:37.422,-122.084?q=37.422,-122.084(1600%20Amphitheatre%20Parkway)');

  app.setValue('location-lat', '91');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.locationCoordinatesInvalid');
});

test('Location accepts a decimal comma and never writes an exponent', () => {
  const app = createAppHarness();

  app.setActiveTab('Location');
  app.setValue('location-lat', '60,1699');
  app.setValue('location-lng', '24,9384');
  assert.equal(app.collect(), 'geo:60.1699,24.9384');

  app.setValue('location-lat', '0.0000001');
  app.setValue('location-lng', '-0,00000004');
  assert.equal(app.collect(), 'geo:0,0');

  app.setValue('location-lat', '12.12345678');
  app.setValue('location-lng', '-1e-7');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.locationCoordinatesInvalid');
  assert.equal(app.content().fieldId, 'location-lng');

  app.setValue('location-lng', '100.5');
  assert.equal(app.collect(), 'geo:12.123457,100.5');

  app.setValue('location-address', 'Cafe (north door)');
  assert.equal(app.collect(), 'geo:12.123457,100.5?q=12.123457,100.5(Cafe%20%28north%20door%29)');
});

test('Social Media payload builds single-platform profile URLs', () => {
  const app = createAppHarness();

  app.setActiveTab('SocialMedia');
  app.setValue('social-platform', 'instagram');
  app.setValue('social-handle', '@qr.turbo');
  assert.equal(app.collect(), 'https://www.instagram.com/qr.turbo/');

  app.setValue('social-platform', 'tiktok');
  app.setValue('social-handle', 'qrturbo_app');
  assert.equal(app.collect(), 'https://www.tiktok.com/@qrturbo_app');

  app.setValue('social-platform', 'linkedin');
  app.setValue('social-profile-type', 'company');
  app.setValue('social-handle', 'qr-turbo');
  assert.equal(app.collect(), 'https://www.linkedin.com/company/qr-turbo');

  app.setValue('social-platform', 'reddit');
  app.setValue('social-profile-type', 'subreddit');
  app.setValue('social-handle', 'r/qrcode');
  assert.equal(app.collect(), 'https://www.reddit.com/r/qrcode');

  app.setValue('social-platform', 'bluesky');
  app.setValue('social-profile-type', 'person');
  app.setValue('social-handle', 'qrturbo.bsky.social');
  assert.equal(app.collect(), 'https://bsky.app/profile/qrturbo.bsky.social');
});

test('Social Media payload accepts full URLs and validates URL-only or invalid handles', () => {
  const app = createAppHarness();

  app.setActiveTab('SocialMedia');
  app.setValue('social-platform', 'youtube');
  app.setValue('social-handle', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(app.collect(), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  app.setValue('social-platform', 'other');
  app.setValue('social-handle', 'qrturbo');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.socialUrlInvalid');

  app.setValue('social-platform', 'instagram');
  app.setValue('social-handle', 'bad handle!');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.socialHandleInvalid');
});

test('WhatsApp payload normalizes number and encodes message', () => {
  const app = createAppHarness();

  app.setActiveTab('WhatsApp');
  app.setValue('whatsapp-phone', '+1 (555) 123-4567');
  app.setValue('whatsapp-message', 'Hello there!');

  assert.equal(app.collect(), 'https://wa.me/15551234567?text=Hello%20there!');

  app.setValue('whatsapp-phone', '123');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.whatsappPhoneRequired');

  app.setValue('whatsapp-phone', '1234567abc');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.whatsappPhoneRequired');
});

test('WhatsApp payload accepts usernames and encodes message', () => {
  const app = createAppHarness();

  app.setActiveTab('WhatsApp');
  app.setValue('whatsapp-phone', '@qr.turbo');
  app.setValue('whatsapp-message', 'Hello username!');

  assert.equal(app.collect(), 'https://wa.me/qr.turbo?text=Hello%20username!');

  app.setValue('whatsapp-phone', '@bad handle!');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.whatsappPhoneRequired');

  for (const invalidUsername of ['@1234567', '@UPPER', '@@qr.turbo', 'qr.turbo']) {
    app.setValue('whatsapp-phone', invalidUsername);
    assert.equal(app.collect(true), null, `${invalidUsername} must not become a WhatsApp URL`);
    assert.equal(app.alerts.at(-1), 'alerts.whatsappPhoneRequired');
  }
});

test('MeCard payload validates email and URL and escapes reserved characters', () => {
  const app = createAppHarness();

  app.setActiveTab('MeCard');
  app.setValue('mecard-name', 'Ada; Lovelace');
  app.setValue('mecard-phone', '+15551234567');
  app.setValue('mecard-email', 'ada@example.com');
  app.setValue('mecard-url', 'https://example.com');
  app.setValue('mecard-address', '1 Main, London');

  assert.equal(
    app.collect(),
    'MECARD:N:Ada\\; Lovelace;TEL:+15551234567;EMAIL:ada@example.com;URL:https\\://example.com;ADR:1 Main\\, London;;'
  );

  app.setValue('mecard-email', 'bad');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.emailInvalid');

  app.setValue('mecard-email', 'ada@example.com');
  app.setValue('mecard-url', 'ftp://example.com');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.urlInvalid');
});

test('App Link prefers web URL and falls back to selected store URL', () => {
  const app = createAppHarness();

  app.setActiveTab('AppLink');
  app.setValue('app-web-url', 'https://example.com/app');
  app.setValue('app-ios-url', 'https://apps.apple.com/app/example');
  app.setValue('app-android-url', 'https://play.google.com/store/apps/details?id=app');
  app.setValue('app-link-target', 'android');

  assert.equal(app.collect(), 'https://example.com/app');

  app.setValue('app-web-url', '');
  assert.equal(app.collect(), 'https://play.google.com/store/apps/details?id=app');

  app.setValue('app-android-url', 'ftp://invalid.example');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.urlInvalid');
});

test('Payment form builds the EPC payload and maps errors to its fields', () => {
  const app = createAppHarness();

  app.setActiveTab('Payment');
  let result = app.content();
  assert.deepEqual(
    { ok: result.ok, empty: result.empty, errorKey: result.errorKey, fieldId: result.fieldId },
    { ok: false, empty: true, errorKey: 'alerts.paymentRequired', fieldId: 'payment-name' }
  );

  app.setValue('payment-name', 'Asiakas T. Meikäläinen');
  app.setValue('payment-iban', 'FI79 4405 2020 0360 82');
  app.setValue('payment-bic', 'okoyfihh');
  app.setValue('payment-amount', '158,24');
  app.setValue('payment-reference', 'RF18 5390 0754 7034');
  app.setValue('payment-due-date', '2026-11-05');

  assert.equal(
    app.collect(),
    'BCD\n001\n1\nSCT\nOKOYFIHH\nAsiakas T. Meikäläinen\nFI7944052020036082\nEUR158.24\n\nRF18539007547034\n\nReqdExctnDt/2026-11-05'
  );

  result = app.content();
  assert.equal(result.isSensitive, false);
  assert.equal(result.primaryFieldId, 'payment-name');
  assert.ok(!result.filenameHint.includes('FI79'), 'The IBAN never names the file');

  app.setValue('payment-iban', 'FI7944052020036083');
  result = app.content(true);
  assert.equal(result.errorKey, 'alerts.ibanInvalid');
  assert.equal(result.fieldId, 'payment-iban');
  assert.equal(app.alerts.at(-1), 'alerts.ibanInvalid');

  app.setValue('payment-iban', 'FI7944052020036082');
  app.setValue('payment-message', 'Invoice 42');
  result = app.content();
  assert.equal(result.errorKey, 'alerts.referenceAndMessage');
  assert.equal(result.fieldId, 'payment-message');
});

test('collectContent returns the ContentResult shape with field ids', () => {
  const app = createAppHarness();

  app.setActiveTab('URLText');
  app.setValue('qr-text', 'https://www.example.com/page');
  assert.deepEqual({ ...app.content() }, {
    ok: true,
    type: 'URLText',
    payload: 'https://www.example.com/page',
    isSensitive: false,
    filenameHint: 'example.com',
    primaryFieldId: 'qr-text'
  });

  app.setActiveTab('Wifi');
  app.setValue('wifi-ssid', 'Home');
  app.setValue('wifi-auth', 'WPA');
  app.setValue('wifi-password', 'short');
  assert.deepEqual({ ...app.content() }, {
    ok: false,
    type: 'Wifi',
    empty: false,
    errorKey: 'alerts.wifiWpaPasswordInvalid',
    fieldId: 'wifi-password'
  });

  app.setActiveTab('CalendarEvent');
  app.setValue('event-title', 'Meeting');
  assert.equal(app.content().fieldId, 'event-start');
  assert.equal(app.content().empty, true);
});

test('every content field id exists in the page and matches a payload field', () => {
  const app = createAppHarness();
  const fieldIds = vm.runInContext('CONTENT_FIELD_IDS', app.context);
  const primaryIds = vm.runInContext('CONTENT_PRIMARY_FIELDS', app.context);
  const html = fs.readFileSync(path.join(repoRoot, 'Public/index.html'), 'utf8');
  const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));

  assert.deepEqual(Object.keys(fieldIds).sort(), [...QRTurboPayloads.TYPES].sort());
  assert.deepEqual(Object.keys(primaryIds).sort(), [...QRTurboPayloads.TYPES].sort());

  for (const type of QRTurboPayloads.TYPES) {
    const payloadKeys = QRTurboPayloads.FIELDS[type].map(field => field.key).sort();
    assert.deepEqual(Object.keys(fieldIds[type]).sort(), payloadKeys, `${type} maps every payload field`);
    for (const id of [...Object.values(fieldIds[type]), primaryIds[type]]) {
      assert.ok(htmlIds.has(id), `#${id} (${type}) exists in index.html`);
    }
    assert.ok(htmlIds.has(type), `#${type} panel exists`);
  }
});

// A minimal element for the #form-error placement tests.
function fakeElement(id, attributes = {}) {
  const attrs = new Map(Object.entries(attributes));
  return {
    id,
    hidden: true,
    textContent: '',
    dataset: {},
    parentNode: null,
    nextSibling: null,
    nextElementSibling: null,
    group: null,
    getAttribute: name => (attrs.has(name) ? attrs.get(name) : null),
    setAttribute: (name, value) => attrs.set(name, String(value)),
    removeAttribute: name => attrs.delete(name),
    closest(selector) {
      return selector === '.input-group' ? this.group : null;
    }
  };
}

function fakeGroup() {
  const parent = { name: 'grid' };
  return {
    parentNode: parent,
    nextElementSibling: null,
    lastElementChild: null,
    after(node) {
      this.nextElementSibling = node;
      node.parentNode = parent;
    },
    append(node) {
      this.lastElementChild = node;
      node.parentNode = this;
    }
  };
}

test('showFormError moves the message into the field group and manages the aria links', () => {
  const app = createAppHarness();
  const home = {
    insertBefore(node) {
      node.parentNode = home;
    }
  };
  const error = fakeElement('form-error');
  error.parentNode = home;
  const zone = fakeElement('event-time-zone', { 'aria-describedby': 'event-time-zone-help' });
  zone.group = fakeGroup();
  const iban = fakeElement('payment-iban');
  iban.group = fakeGroup();
  // Another module's own invalid field must stay invalid.
  const hex = fakeElement('qr-fg-color-text', { 'aria-invalid': 'true' });
  const elements = { 'form-error': error, 'event-time-zone': zone, 'payment-iban': iban, 'qr-fg-color-text': hex };
  const all = Object.values(elements);

  app.context.document.getElementById = id => elements[id] || null;
  app.context.document.querySelectorAll = selector => {
    assert.equal(selector, '[aria-errormessage="form-error"]');
    return all.filter(element => element.getAttribute('aria-errormessage') === 'form-error');
  };

  assert.equal(app.context.showFormError('Zone message', 'event-time-zone', 'alerts.dateInvalid'), true);
  assert.equal(error.hidden, false);
  assert.equal(error.textContent, 'Zone message');
  assert.equal(error.dataset.i18nKey, 'alerts.dateInvalid');
  // Inside the group, the message never becomes a grid item of its own that
  // would push the neighbouring field of a two-column form to another row.
  assert.equal(zone.group.lastElementChild, error);
  assert.equal(error.parentNode, zone.group);
  assert.equal(zone.group.nextElementSibling, null);
  assert.equal(zone.getAttribute('aria-invalid'), 'true');
  assert.equal(zone.getAttribute('aria-errormessage'), 'form-error');
  assert.equal(zone.getAttribute('aria-describedby'), 'event-time-zone-help form-error');

  // A new field takes over; the old one keeps only its own description.
  app.context.showFormError('IBAN message', 'payment-iban', 'alerts.ibanInvalid');
  assert.equal(iban.group.lastElementChild, error);
  assert.equal(error.parentNode, iban.group);
  assert.equal(error.textContent, 'IBAN message');
  assert.equal(zone.getAttribute('aria-describedby'), 'event-time-zone-help');
  assert.equal(zone.getAttribute('aria-invalid'), null);
  assert.equal(iban.getAttribute('aria-describedby'), 'form-error');

  // Without a field the message goes back to its home in the preview card.
  app.context.showFormError('General message', null, null);
  assert.equal(error.parentNode, home);
  assert.equal(error.dataset.i18nKey, undefined);
  assert.equal(iban.getAttribute('aria-invalid'), null);

  app.context.showFormError('IBAN message', 'payment-iban', 'alerts.ibanInvalid');
  app.context.clearFormError();
  assert.equal(error.hidden, true);
  assert.equal(error.textContent, '');
  assert.equal(error.dataset.i18nKey, undefined);
  assert.equal(iban.getAttribute('aria-invalid'), null);
  assert.equal(iban.getAttribute('aria-errormessage'), null);
  assert.equal(iban.getAttribute('aria-describedby'), null);
  assert.equal(hex.getAttribute('aria-invalid'), 'true');
});

test('showFormError puts the message after a field that has no input group', () => {
  const app = createAppHarness();
  const error = fakeElement('form-error');
  error.parentNode = { insertBefore() {} };
  const field = fakeElement('sms-type-sms');
  field.parentNode = { name: 'fieldset' };
  field.after = node => {
    field.nextElementSibling = node;
    node.parentNode = field.parentNode;
  };
  const elements = { 'form-error': error, 'sms-type-sms': field };
  app.context.document.getElementById = id => elements[id] || null;
  app.context.document.querySelectorAll = () => [];

  app.context.showFormError('Message', 'sms-type-sms', null);
  assert.equal(field.nextElementSibling, error);
  assert.equal(error.parentNode, field.parentNode);
});

test('the event end prefill adds one hour of wall-clock time', () => {
  const app = createAppHarness();
  const addOneHour = value => vm.runInContext(`addOneHour(${JSON.stringify(value)})`, app.context);

  assert.equal(addOneHour('2026-05-03T10:30'), '2026-05-03T11:30');
  assert.equal(addOneHour('2026-12-31T23:30'), '2027-01-01T00:30');
  assert.equal(addOneHour('2028-02-28T23:00'), '2028-02-29T00:00');
  assert.equal(addOneHour('2026-05-03'), '');
  assert.equal(addOneHour(''), '');
});
