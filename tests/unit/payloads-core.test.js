const assert = require('node:assert/strict');
const test = require('node:test');

const { getNestedValue, loadTranslations } = require('../helpers/app-vm');
const QRTurboPayloads = require('../../Public/js/lib/payloads.js');

const { build } = QRTurboPayloads;

test('types, batch types and the module shape', () => {
  assert.deepEqual([...QRTurboPayloads.TYPES], [
    'URLText', 'VCard', 'Wifi', 'SMSPhone', 'Email', 'CalendarEvent', 'Location',
    'SocialMedia', 'WhatsApp', 'MeCard', 'AppLink', 'Payment'
  ]);
  assert.deepEqual([...QRTurboPayloads.BATCH_TYPES], [
    'URLText', 'VCard', 'Wifi', 'SMSPhone', 'Email', 'Location', 'WhatsApp', 'MeCard', 'Payment'
  ]);
  assert.ok(QRTurboPayloads.BATCH_TYPES.every(type => QRTurboPayloads.TYPES.includes(type)));
  assert.ok(Object.isFrozen(QRTurboPayloads.FIELDS));
  assert.ok(Object.isFrozen(QRTurboPayloads.FIELDS.Payment[0].aliases));
  assert.equal(globalThis.QRTurboPayloads, QRTurboPayloads);
  assert.ok(Object.isFrozen(QRTurboPayloads));
});

test('FIELDS describe every type with existing labels and lowercase aliases', () => {
  const english = loadTranslations().en;

  for (const type of QRTurboPayloads.TYPES) {
    const fields = QRTurboPayloads.FIELDS[type];
    assert.ok(Array.isArray(fields) && fields.length > 0, `${type} has fields`);

    const keys = fields.map(field => field.key);
    assert.equal(new Set(keys).size, keys.length, `${type} keys are unique`);

    for (const field of fields) {
      assert.equal(typeof getNestedValue(english, field.labelKey), 'string', `${field.labelKey} exists in English`);
      assert.ok(field.aliases.length > 0, `${type}.${field.key} has aliases`);
      for (const alias of field.aliases) {
        assert.equal(alias, alias.toLowerCase().trim(), `${type}.${field.key} alias "${alias}" is lowercase`);
      }
    }
  }

  // Batch mapping relies on these required markers.
  assert.deepEqual(
    QRTurboPayloads.FIELDS.Payment.filter(field => field.required).map(field => field.key),
    ['name', 'iban']
  );
  assert.deepEqual(
    QRTurboPayloads.FIELDS.Wifi.filter(field => field.required).map(field => field.key),
    ['ssid']
  );
});

test('every error key that build returns exists in English', () => {
  const english = loadTranslations().en;
  const cases = [
    ['URLText', {}],
    ['VCard', {}],
    ['VCard', { firstName: 'A', birthday: '1999-02-30' }],
    ['Wifi', {}],
    ['SMSPhone', { number: 'x' }],
    ['Email', {}],
    ['CalendarEvent', { title: 'x', start: 'not a date' }],
    ['Location', { latitude: '100', longitude: '0' }],
    ['SocialMedia', {}],
    ['WhatsApp', {}],
    ['MeCard', {}],
    ['AppLink', {}],
    ['Payment', {}],
    ['Payment', { name: 'x', iban: 'FI7944052020036082', message: 'm'.repeat(141) }],
    ['Unknown', {}]
  ];

  for (const [type, values] of cases) {
    const result = build(type, values);
    assert.equal(result.ok, false, `${type} fails`);
    assert.equal(typeof getNestedValue(english, result.errorKey), 'string', `${result.errorKey} exists`);
  }

  assert.deepEqual(build('Unknown', { text: 'x' }), {
    ok: false,
    errorKey: 'alerts.noData',
    field: null,
    empty: true
  });
  assert.equal(build('URLText', null).errorKey, 'alerts.enterText');
});

test('normalizePhone removes separators and checks the digits', () => {
  assert.equal(QRTurboPayloads.normalizePhone('+1 (555) 123-4567'), '+15551234567');
  assert.equal(QRTurboPayloads.normalizePhone('040\t123 4567'), '0401234567');
  assert.equal(QRTurboPayloads.normalizePhone('+358.40.123.4567'), '+358401234567');
  assert.equal(QRTurboPayloads.normalizePhone('112'), '112');
  assert.equal(QRTurboPayloads.normalizePhone('12'), '12');
  assert.equal(QRTurboPayloads.normalizePhone('1'), null);
  assert.equal(QRTurboPayloads.normalizePhone('++358401234567'), null);
  assert.equal(QRTurboPayloads.normalizePhone('358+401234567'), null);
  assert.equal(QRTurboPayloads.normalizePhone('1'.repeat(21)), null);
  assert.equal(QRTurboPayloads.normalizePhone('0800 FLOWERS'), null);
  assert.equal(QRTurboPayloads.normalizePhone(''), null);
});

test('parseDecimal accepts a comma or a point, nothing else', () => {
  assert.equal(QRTurboPayloads.parseDecimal('60,1699'), 60.1699);
  assert.equal(QRTurboPayloads.parseDecimal(' -122.084 '), -122.084);
  assert.equal(QRTurboPayloads.parseDecimal('+7'), 7);
  assert.equal(QRTurboPayloads.parseDecimal('.5'), 0.5);
  assert.equal(QRTurboPayloads.parseDecimal('−45,5'), -45.5);
  for (const invalid of ['', ' ', '1e5', '1,234.5', '12,3,4', 'abc', '0x10', 'Infinity', '--1']) {
    assert.ok(Number.isNaN(QRTurboPayloads.parseDecimal(invalid)), `${invalid} is not a decimal`);
  }
});

test('formatGeoNumber uses at most six decimals and never an exponent', () => {
  assert.equal(QRTurboPayloads.formatGeoNumber(37.422), '37.422');
  assert.equal(QRTurboPayloads.formatGeoNumber(-122.084), '-122.084');
  assert.equal(QRTurboPayloads.formatGeoNumber(60), '60');
  assert.equal(QRTurboPayloads.formatGeoNumber(1e-7), '0');
  assert.equal(QRTurboPayloads.formatGeoNumber(-1e-7), '0');
  assert.equal(QRTurboPayloads.formatGeoNumber(-0), '0');
  assert.equal(QRTurboPayloads.formatGeoNumber(0.0000015), '0.000002');
  assert.equal(QRTurboPayloads.formatGeoNumber(12.123456789), '12.123457');
  assert.equal(QRTurboPayloads.formatGeoNumber(-180), '-180');
  assert.throws(() => QRTurboPayloads.formatGeoNumber(Number.NaN), RangeError);
});

test('toICalUtc converts device time, or an IANA zone with DST edges', () => {
  const deviceStamp = value => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  assert.equal(QRTurboPayloads.toICalUtc('2026-05-03T10:30'), deviceStamp('2026-05-03T10:30'));
  assert.equal(QRTurboPayloads.toICalUtc('2026-12-24T18:00:30'), deviceStamp('2026-12-24T18:00:30'));
  assert.equal(QRTurboPayloads.toICalUtc('2026-05-03T10:30', ''), deviceStamp('2026-05-03T10:30'));

  assert.equal(QRTurboPayloads.toICalUtc('2026-07-01T12:00', 'Europe/Helsinki'), '20260701T090000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-01-15T12:00', 'Europe/Helsinki'), '20260115T100000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-01-15T09:00', 'America/New_York'), '20260115T140000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-06-01T00:30', 'Asia/Kolkata'), '20260531T190000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-06-01T08:00', 'UTC'), '20260601T080000Z');

  // Helsinki skips 03:00-04:00 on 2026-03-29: a time in the gap moves forward.
  assert.equal(QRTurboPayloads.toICalUtc('2026-03-29T03:30', 'Europe/Helsinki'), '20260329T013000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-03-29T02:59', 'Europe/Helsinki'), '20260329T005900Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-03-29T04:00', 'Europe/Helsinki'), '20260329T010000Z');
  // 03:30 happens twice on 2026-10-25; like new Date(), the earlier instant wins.
  assert.equal(QRTurboPayloads.toICalUtc('2026-10-25T03:30', 'Europe/Helsinki'), '20261025T003000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-10-25T02:59', 'Europe/Helsinki'), '20261024T235900Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-10-25T04:00', 'Europe/Helsinki'), '20261025T020000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-10-25T05:00', 'Europe/Helsinki'), '20261025T030000Z');
  // Zones west of UTC follow the same rules: a skipped time moves forward,
  // a repeated time takes the earlier instant.
  assert.equal(QRTurboPayloads.toICalUtc('2026-03-08T02:30', 'America/New_York'), '20260308T073000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-03-08T01:59', 'America/New_York'), '20260308T065900Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-03-08T03:00', 'America/New_York'), '20260308T070000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-11-01T01:30', 'America/New_York'), '20261101T053000Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-11-01T02:00', 'America/New_York'), '20261101T070000Z');
  // Half-hour DST (Lord Howe) and a zone without DST.
  assert.equal(QRTurboPayloads.toICalUtc('2026-10-04T02:15', 'Australia/Lord_Howe'), '20261003T154500Z');
  assert.equal(QRTurboPayloads.toICalUtc('2026-07-01T12:00', 'Asia/Kathmandu'), '20260701T061500Z');

  // An unknown zone falls back to device time.
  assert.equal(QRTurboPayloads.toICalUtc('2026-05-03T10:30', 'Not/AZone'), deviceStamp('2026-05-03T10:30'));

  for (const invalid of ['', 'tomorrow', '2026-02-30T10:00', '2026-05-03T24:00']) {
    assert.throws(() => QRTurboPayloads.toICalUtc(invalid), RangeError, invalid);
  }
});

test('toICalDate formats dates and adds days across month and year ends', () => {
  assert.equal(QRTurboPayloads.toICalDate('2026-05-03'), '20260503');
  assert.equal(QRTurboPayloads.toICalDate('2026-12-31', 1), '20270101');
  assert.equal(QRTurboPayloads.toICalDate('2028-02-28', 1), '20280229');
  assert.equal(QRTurboPayloads.toICalDate('2026-02-28', 1), '20260301');
  assert.equal(QRTurboPayloads.toICalDate('2026-05-03T10:30', 1), '20260504');
  assert.throws(() => QRTurboPayloads.toICalDate('2026-02-29'), RangeError);
});

test('encodeMailtoAddress percent-encodes the address and keeps @', () => {
  assert.equal(QRTurboPayloads.encodeMailtoAddress('a+b@example.com'), 'a%2Bb@example.com');
  assert.equal(QRTurboPayloads.encodeMailtoAddress('hello@example.com'), 'hello@example.com');
  assert.equal(QRTurboPayloads.encodeMailtoAddress('a&b=c?d#e%f@x.fi'), 'a%26b%3Dc%3Fd%23e%25f@x.fi');
});

test('slugify gives lowercase ASCII file name parts', () => {
  assert.equal(QRTurboPayloads.slugify('Café Straße'), 'cafe-strasse');
  assert.equal(QRTurboPayloads.slugify('  Hello, World!  '), 'hello-world');
  assert.equal(QRTurboPayloads.slugify('Łódź Ærø'), 'lodz-aero');
  assert.equal(QRTurboPayloads.slugify('Ελληνικά 東京'), '');
  assert.equal(QRTurboPayloads.slugify('example.com/path?q=1'), 'example-com-path-q-1');
  assert.equal(QRTurboPayloads.slugify('a'.repeat(50)), 'a'.repeat(40));
  assert.equal(QRTurboPayloads.slugify('abc def ghi', 8), 'abc-def');
  assert.equal(QRTurboPayloads.slugify(''), '');
  assert.equal(QRTurboPayloads.slugify(null), '');
});

test('looksLikeBareDomain finds bare domains only', () => {
  for (const value of ['example.com', ' www.example.com ', 'EXAMPLE.CO.UK', 'shop.example.fi/sale?x=1', 'example.com:8080', 'example.com#top']) {
    assert.equal(QRTurboPayloads.looksLikeBareDomain(value), true, value);
  }
  for (const value of ['', 'https://example.com', 'http://example.com', 'ftp://example.com', 'hello world.com', 'john@example.com',
    'example', 'just text', 'example.c', 'example.com/a b', 'mailto:x@example.com', '-bad.com']) {
    assert.equal(QRTurboPayloads.looksLikeBareDomain(value), false, value);
  }
});

test('createUid returns a non-empty unique token', () => {
  const first = QRTurboPayloads.createUid();
  const second = QRTurboPayloads.createUid();
  assert.match(first, /^[0-9a-z-]{10,}$/);
  assert.notEqual(first, second);
});

test('WiFi security names from CSV rows', () => {
  const wifi = values => build('Wifi', { ssid: 'Net', password: 'secret12', ...values }).payload;

  assert.equal(wifi({ security: 'wpa2' }), 'WIFI:S:Net;T:WPA;P:secret12;;');
  assert.equal(wifi({ security: 'SAE' }), 'WIFI:S:Net;T:WPA;R:1;P:secret12;;');
  assert.equal(wifi({ security: 'none' }), 'WIFI:S:Net;T:nopass;;');
  assert.equal(wifi({ security: 'WPA', hidden: 'yes' }), 'WIFI:S:Net;T:WPA;P:secret12;H:true;;');
  assert.equal(wifi({ security: 'WPA', hidden: 'no' }), 'WIFI:S:Net;T:WPA;P:secret12;;');
  // Without a security column, a password means WPA and no password an open network.
  assert.equal(wifi({}), 'WIFI:S:Net;T:WPA;P:secret12;;');
  assert.equal(build('Wifi', { ssid: 'Open' }).payload, 'WIFI:S:Open;T:nopass;;');
  assert.equal(build('Wifi', { ssid: 'Open' }).isSensitive, false);
});

test('WiFi security text from CSV rows is read by its words', () => {
  const wifi = (security, password = 'secret12') => {
    const result = build('Wifi', { ssid: 'Guest', password, security });
    return result.ok ? result.payload : result.errorKey;
  };

  // The form's own option labels.
  assert.equal(wifi('None (open network)', ''), 'WIFI:S:Guest;T:nopass;;');
  assert.equal(wifi('WPA3 only'), 'WIFI:S:Guest;T:WPA;R:1;P:secret12;;');
  assert.equal(wifi('WPA/WPA2/WPA3 (recommended)'), 'WIFI:S:Guest;T:WPA;P:secret12;;');
  assert.equal(wifi('WEP (outdated)', '12345'), 'WIFI:S:Guest;T:WEP;P:12345;;');

  for (const open of ['Open network', 'No password', 'nopass', 'OPEN']) {
    assert.equal(wifi(open, ''), 'WIFI:S:Guest;T:nopass;;', open);
  }
  for (const wpa3 of ['WPA3-SAE', 'WPA3 Personal', 'Nur WPA3']) {
    assert.equal(wifi(wpa3), 'WIFI:S:Guest;T:WPA;R:1;P:secret12;;', wpa3);
  }
  for (const wpa of ['WPA2-PSK', 'WPA2/WPA3', 'WPA2 Enterprise', 'psk']) {
    assert.equal(wifi(wpa), 'WIFI:S:Guest;T:WPA;P:secret12;;', wpa);
  }

  // Unknown text: WPA with a password, an open network without one.
  assert.equal(wifi('Avoin verkko', ''), 'WIFI:S:Guest;T:nopass;;');
  assert.equal(wifi('Salattu'), 'WIFI:S:Guest;T:WPA;P:secret12;;');
  assert.equal(wifi('Salattu', '123'), 'alerts.wifiWpaPasswordInvalid');
});

test('email and amount checks stay fast on crafted input', () => {
  const longEmail = `a@${'.'.repeat(200000)}@`;
  const start = Date.now();
  assert.equal(build('Email', { to: longEmail }).errorKey, 'alerts.emailInvalid');
  assert.equal(build('VCard', { email: longEmail }).errorKey, 'alerts.emailInvalid');
  assert.equal(build('MeCard', { email: longEmail }).errorKey, 'alerts.emailInvalid');
  assert.equal(build('Payment', {
    name: 'Example Oy',
    iban: 'FI7944052020036082',
    amount: `1${' '.repeat(200000)}x`
  }).errorKey, 'alerts.amountInvalid');
  assert.ok(Date.now() - start < 2000, 'the checks run in linear time');

  // RFC 5321: 254 characters at most.
  const address = length => `${'a'.repeat(length - '@example.com'.length)}@example.com`;
  assert.equal(build('Email', { to: address(254) }).ok, true);
  assert.equal(build('Email', { to: address(255) }).errorKey, 'alerts.emailInvalid');
});

test('vCard name fallbacks, ORG with department, and invalid birthday', () => {
  const vcard = values => build('VCard', values);

  assert.match(vcard({ email: 'ada@example.com' }).payload, /\r\nFN:ada@example\.com\r\n/);
  assert.equal(vcard({ email: 'ada@example.com' }).filenameHint, 'ada');
  assert.match(vcard({ phoneWork: '+1 555', organization: 'Math' }).payload, /\r\nFN:\+1 555\r\n/);
  assert.match(vcard({ phoneWork: '1', department: 'Labs' }).payload, /\r\nORG:;Labs\r\n/);
  assert.match(vcard({ firstName: 'A', website: 'https://example.com/a\nb' }).payload, /\r\nURL:https:\/\/example\.com\/ab\r\n/);
  assert.match(vcard({ firstName: 'A', city: 'Oulu', addressType: 'WORK' }).payload, /\r\nADR;TYPE=WORK:;;;Oulu;;;\r\n/);
  assert.deepEqual(vcard({ firstName: 'A', birthday: '31.1.1990' }), {
    ok: false,
    errorKey: 'alerts.dateInvalid',
    field: 'birthday',
    empty: false
  });
});

test('calendar options: uid, now, all-day values from datetime fields', () => {
  const now = new Date(Date.UTC(2026, 9, 22, 10, 15, 30, 999));
  const result = build('CalendarEvent', {
    title: 'Day out',
    start: '2026-06-01T09:00',
    end: '2026-06-02T17:00',
    allDay: true
  }, { now, uid: 'fixed-uid' });

  assert.equal(result.payload, [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QRTurbo.app//QR Event//EN',
    'BEGIN:VEVENT',
    'UID:fixed-uid@qrturbo.app',
    'DTSTAMP:20261022T101530Z',
    'DTSTART;VALUE=DATE:20260601',
    'DTEND;VALUE=DATE:20260603',
    'SUMMARY:Day out',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n'));

  assert.deepEqual(build('CalendarEvent', { title: 'x', start: '2026-06-01T09:00', end: 'later' }), {
    ok: false,
    errorKey: 'alerts.dateInvalid',
    field: 'end',
    empty: false
  });
  // An end equal to the start is allowed.
  assert.equal(build('CalendarEvent', { title: 'x', start: '2026-06-01T09:00', end: '2026-06-01T09:00' }).ok, true);
});

test('Email without parameters, and broken text never throws', () => {
  assert.equal(build('Email', { to: 'a@example.com' }).payload, 'mailto:a@example.com');
  assert.equal(build('Email', { subject: 'Hi' }).payload, 'mailto:?subject=Hi');
  assert.equal(build('Email', { to: 'a@example.com', body: 'x\uD800y' }).payload, 'mailto:a@example.com?body=x%EF%BF%BDy');
  assert.equal(
    build('WhatsApp', { phone: '+358401234567', message: '\uDC00' }).payload,
    'https://wa.me/358401234567?text=%EF%BF%BD'
  );
});

test('file name hints never include secrets', () => {
  assert.equal(build('Wifi', { ssid: 'Home', password: 'supersecret', security: 'WPA' }).filenameHint, 'Home');
  assert.equal(build('URLText', { text: 'https://www.example.com/x' }).filenameHint, 'example.com');
  assert.equal(build('URLText', { text: 'Just some text that is longer than thirty characters' }).filenameHint, 'Just some text that is longer ');
  assert.equal(build('SMSPhone', { mode: 'phone', number: '+1 555 0100' }).filenameHint, '+15550100');
  assert.equal(build('Location', { latitude: '60,17', longitude: '24,94' }).filenameHint, '60.17,24.94');
});
