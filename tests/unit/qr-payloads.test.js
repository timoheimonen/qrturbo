const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppHarness } = require('../helpers/app-vm');

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
  assert.match(payload, /ADR;TYPE=HOME:;;Main\\nStreet;London;;;/);
  assert.match(payload, /END:VCARD$/);
});

test('vCard requires at least one identity or contact field', () => {
  const app = createAppHarness();

  app.setActiveTab('VCard');

  assert.equal(app.collect(true), null);
  assert.deepEqual(app.alerts, ['alerts.vcardRequired']);
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
    'WIFI:S: Cafe\\:\\;Net\\,Main ;T:WPA;P:pass\\"word\\\\123;H:true;'
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

  assert.equal(app.collect(), 'WIFI:S:Guest;T:nopass;');
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

test('Calendar payload creates VCALENDAR and rejects an end before start', () => {
  const app = createAppHarness();

  app.setActiveTab('CalendarEvent');
  app.setValue('event-title', 'Team, sync; planning');
  app.setValue('event-start', '2026-05-03T10:30');
  app.setValue('event-end', '2026-05-03T11:00');
  app.setValue('event-location', 'Room\\A');
  app.setValue('event-description', 'Line 1\nLine 2');

  const payload = app.collect();

  assert.match(payload, /^BEGIN:VCALENDAR\r\nVERSION:2\.0/);
  assert.match(payload, /DTSTART:20260503T103000/);
  assert.match(payload, /DTEND:20260503T110000/);
  assert.match(payload, /SUMMARY:Team\\, sync\\; planning/);
  assert.match(payload, /LOCATION:Room\\\\A/);
  assert.match(payload, /DESCRIPTION:Line 1\\nLine 2/);
  assert.match(payload, /END:VCALENDAR$/);

  app.setValue('event-end', '2026-05-03T09:00');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.eventEndInvalid');
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
  assert.equal(app.collect(), 'geo:37.422,-122.084?q=1600%20Amphitheatre%20Parkway');

  app.setValue('location-lat', '91');
  assert.equal(app.collect(true), null);
  assert.equal(app.alerts.at(-1), 'alerts.locationCoordinatesInvalid');
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
