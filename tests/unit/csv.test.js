const assert = require('node:assert/strict');
const test = require('node:test');

const Csv = require('../../Public/js/lib/csv.js');
const Payloads = require('../../Public/js/lib/payloads.js');

test('parse handles RFC 4180 quotes, doubled quotes and delimiters inside quotes', () => {
  const result = Csv.parse('name,note\r\n"Smith, John","He said ""hi"""\r\nplain,"x"\r\n');
  assert.equal(result.delimiter, ',');
  assert.deepEqual(result.rows, [
    ['name', 'note'],
    ['Smith, John', 'He said "hi"'],
    ['plain', 'x']
  ]);
  assert.deepEqual(result.rowNumbers, [1, 2, 3]);
});

test('parse keeps an embedded CRLF inside a quoted field in one record', () => {
  const result = Csv.parse('text,id\r\n"line one\r\nline two",1\r\nnext,2');
  assert.deepEqual(result.rows, [
    ['text', 'id'],
    ['line one\r\nline two', '1'],
    ['next', '2']
  ]);
  assert.deepEqual(result.rowNumbers, [1, 2, 3]);
});

test('parse removes a BOM and accepts LF and lone CR line ends', () => {
  assert.deepEqual(Csv.parse('\uFEFFurl\nhttps://a.example\n').rows, [['url'], ['https://a.example']]);
  assert.deepEqual(Csv.parse('a,b\rc,d\r').rows, [['a', 'b'], ['c', 'd']]);
  assert.equal(Csv.parse('\uFEFF').rows.length, 0);
  assert.equal(Csv.parse('').rows.length, 0);
});

test('parse skips blank records but keeps the source row numbers', () => {
  const result = Csv.parse('url,name\n\nhttps://a.example,A\n,\n  \nhttps://b.example,B\n');
  assert.deepEqual(result.rows, [['url', 'name'], ['https://a.example', 'A'], ['https://b.example', 'B']]);
  assert.deepEqual(result.rowNumbers, [1, 3, 6]);
});

test('parse keeps trailing empty fields and reads an unterminated quote to the end', () => {
  assert.deepEqual(Csv.parse('a,b,\n1,2,').rows, [['a', 'b', ''], ['1', '2', '']]);
  assert.deepEqual(Csv.parse('a,"open\nstill open', { delimiter: ',' }).rows, [['a', 'open\nstill open']]);
  assert.deepEqual(Csv.parse('"x"y,z', { delimiter: ',' }).rows, [['xy', 'z']]);
});

test('delimiter detection: semicolon files with decimal commas', () => {
  const result = Csv.parse('Name;IBAN;Amount\nMatti;FI7944052020036082;158,24\nLiisa;FI7944052020036082;12,50\n');
  assert.equal(result.delimiter, ';');
  assert.deepEqual(result.rows[1], ['Matti', 'FI7944052020036082', '158,24']);
});

test('delimiter detection: tabs win over commas inside pasted spreadsheet cells', () => {
  const result = Csv.parse('name\tcity\nAnna\tHelsinki, Finland\nBen\tTurku, Finland, EU\n');
  assert.equal(result.delimiter, '\t');
  assert.deepEqual(result.rows[2], ['Ben', 'Turku, Finland, EU']);
});

test('delimiter detection: comma files, quoted delimiters and single-column lists', () => {
  assert.equal(Csv.parse('ssid,password\nCafe,"pa;ss;word"\nHome,secret12\n').delimiter, ',');
  const list = Csv.parse('https://a.example/x,y\nhttps://b.example\nhttps://c.example\n');
  assert.equal(list.delimiter, '');
  assert.deepEqual(list.rows[0], ['https://a.example/x,y']);
  assert.equal(Csv.detectDelimiter('a;b\nc;d'), ';');
});

test('an explicit delimiter overrides detection', () => {
  assert.deepEqual(Csv.parse('a;b,c', { delimiter: ',' }).rows, [['a;b', 'c']]);
  assert.deepEqual(Csv.parse('a;b,c', { delimiter: 'auto' }).rows, [['a', 'b,c']]);
});

test('detectHeader recognises field names, typed columns and plain data', () => {
  const urlFields = Payloads.FIELDS.URLText;
  assert.equal(Csv.detectHeader([['URL'], ['https://a.example'], ['https://b.example']], urlFields), true);
  assert.equal(Csv.detectHeader([['https://a.example'], ['https://b.example']], urlFields), false);
  assert.equal(Csv.detectHeader([['Links'], ['https://a.example'], ['b.example']]), true);
  assert.equal(Csv.detectHeader([['Contact', 'Mail'], ['Anna', 'anna@example.com'], ['Ben', 'ben@example.com']]), true);
  assert.equal(Csv.detectHeader([['Anna', 'anna@example.com'], ['Ben', 'ben@example.com']]), false);
  assert.equal(Csv.detectHeader([]), false);
});

test('detectHeader does not mistake repeated values for column names', () => {
  const smsFields = Payloads.FIELDS.SMSPhone;
  const rows = [['sms', '+358401234567', 'Hello'], ['phone', '+358401234568', ''], ['sms', '+358401234569', 'Hi']];
  assert.equal(Csv.detectHeader(rows, smsFields), false);
  assert.equal(Csv.detectHeader([['type', 'number', 'message'], ...rows], smsFields), true);
});

test('detectHeader uses translated labels and treats a lone row as a header only when it names a field', () => {
  const fields = Payloads.FIELDS.Wifi;
  assert.equal(Csv.detectHeader([['Verkon nimi'], ['Cafe']], fields, { labels: { ssid: 'Verkon nimi' } }), true);
  assert.equal(Csv.detectHeader([['ssid', 'password']], fields), true);
  assert.equal(Csv.detectHeader([['Cafe', 'secret12']], fields), false);
});

test('autoMap matches aliases, keys and labels without case, spaces or punctuation', () => {
  const headers = ['First Name', 'SURNAME', 'E-mail', 'Phone (Work)', 'Phone (Home)', 'Phone', 'Company', 'Postinumero', 'Unknown'];
  const mapping = Csv.autoMap(headers, Payloads.FIELDS.VCard);
  assert.equal(mapping.firstName, 0);
  assert.equal(mapping.lastName, 1);
  assert.equal(mapping.email, 2);
  assert.equal(mapping.phoneWork, 3);
  assert.equal(mapping.phoneHome, 4);
  assert.equal(mapping.phoneMobile, 5);
  assert.equal(mapping.organization, 6);
  assert.equal(mapping.zip, 7);
  assert.equal(mapping.website, -1);
  assert.equal(Object.values(mapping).filter(column => column === 8).length, 0);
});

test('autoMap prefers translated labels and gives each column to one field', () => {
  const fields = Payloads.FIELDS.Payment;
  const mapping = Csv.autoMap(['Saajan nimi', 'Tilinumero', 'Summa (EUR)', 'Viite'], fields, {
    labels: { name: 'Saajan nimi', iban: 'IBAN' }
  });
  assert.deepEqual(
    [mapping.name, mapping.iban, mapping.amount, mapping.reference, mapping.message, mapping.bic],
    [0, 1, 2, 3, -1, -1]
  );
  const twice = Csv.autoMap(['Email', 'Email'], Payloads.FIELDS.Email);
  assert.equal(twice.to, 0);
  assert.notEqual(twice.subject, 0);
});

test('autoMap falls back to the first required field in column 0', () => {
  assert.deepEqual(Csv.autoMap(['', ''], Payloads.FIELDS.Wifi, { hasHeader: false }), {
    ssid: 0, password: -1, security: -1, hidden: -1
  });
  assert.equal(Csv.autoMap(['My links'], Payloads.FIELDS.URLText).text, 0);
  assert.equal(Csv.autoMap(['Foo', 'Bar'], Payloads.FIELDS.URLText).text, -1);
  assert.equal(Csv.autoMap([], Payloads.FIELDS.URLText).text, -1);
});

test('autoMap maps the first alias of every batch field back to that field', () => {
  for (const type of Payloads.BATCH_TYPES) {
    const fields = Payloads.FIELDS[type];
    const headers = fields.map(field => field.aliases[0]);
    const mapping = Csv.autoMap(headers, fields);
    fields.forEach((field, index) => {
      assert.equal(mapping[field.key], index, `${type}.${field.key} should map to "${headers[index]}"`);
    });
  }
});

test('autoMap gives a plain phone column to the mobile phone, never the work phone', () => {
  const fields = Payloads.FIELDS.VCard;
  const english = { phoneWork: 'Phone (Work)', phoneMobile: 'Phone (Mobile)', phoneHome: 'Phone (Home)' };
  const phones = mapping => [mapping.phoneWork, mapping.phoneMobile, mapping.phoneHome];

  for (const labels of [undefined, english]) {
    const both = Csv.autoMap(['First name', 'Last name', 'Phone', 'Work phone', 'Email'], fields, { labels });
    assert.deepEqual(phones(both), [3, 2, -1], 'the "Work phone" column is the work phone');
    assert.deepEqual(phones(Csv.autoMap(['First name', 'Last name', 'Phone'], fields, { labels })), [-1, 2, -1]);
    assert.deepEqual(phones(Csv.autoMap(['Phone (private)', 'Name'], fields, { labels })), [-1, 0, -1]);
  }

  // Translated labels share their base word ("Telefon"); it still means the mobile phone.
  const german = { phoneWork: 'Telefon (Arbeit)', phoneMobile: 'Telefon (mobil)', phoneHome: 'Telefon (privat)' };
  assert.deepEqual(phones(Csv.autoMap(['Vorname', 'Nachname', 'Telefon'], fields, { labels: german })), [-1, 2, -1]);
  assert.deepEqual(
    phones(Csv.autoMap(['Telefon (Arbeit)', 'Telefon', 'Telefon (privat)'], fields, { labels: german })),
    [0, 1, 2]
  );
  assert.equal(Csv.detectHeader([['Vorname', 'Telefon'], ['Anna', '+49301234567']], fields, { labels: german }), true);
});

test('rowValues trims cells except the fields that keep their spaces', () => {
  const cells = [' Cafe ', 'secret 12 ', ' WPA ', '  '];
  const wifi = Csv.rowValues(cells, { ssid: 0, password: 1, security: 2, hidden: 3 }, Payloads.FIELDS.Wifi);
  assert.deepEqual(wifi, { ssid: ' Cafe ', password: 'secret 12 ', security: 'WPA', hidden: '' });
  assert.equal(Payloads.build('Wifi', wifi).payload, 'WIFI:S: Cafe ;T:WPA;P:secret 12 ;;');

  // A cell of only spaces is empty, so a blank password still means an open network.
  const open = Csv.rowValues(['Guest', '   '], { ssid: 0, password: 1, security: -1 }, Payloads.FIELDS.Wifi);
  assert.deepEqual(open, { ssid: 'Guest', password: '' });
  assert.equal(Payloads.build('Wifi', open).payload, 'WIFI:S:Guest;T:nopass;;');

  assert.deepEqual(Csv.rowValues([' https://a.example '], { text: 0 }, Payloads.FIELDS.URLText), { text: 'https://a.example' });
  assert.deepEqual(Csv.rowValues(['a'], { text: 3, other: -1 }, Payloads.FIELDS.URLText), { text: '' });
  assert.deepEqual(Csv.rowValues(null, null), {});
});

test('header detection and mapping stay fast on crafted cells', () => {
  const n = 200000;
  const timed = run => {
    const start = Date.now();
    run();
    return Date.now() - start;
  };
  const cases = {
    digits: () => Csv.detectHeader(Csv.parse(`note\n${'1'.repeat(n)}x\n`).rows, Payloads.FIELDS.URLText),
    parentheses: () => Csv.autoMap(['('.repeat(n), '['.repeat(n)], Payloads.FIELDS.VCard),
    unclosed: () => Csv.detectHeader([['('.repeat(n)], ['x']], Payloads.FIELDS.URLText),
    email: () => Csv.detectHeader([['note'], [`a@${'.'.repeat(n)}@`]], Payloads.FIELDS.URLText)
  };
  for (const [name, run] of Object.entries(cases)) {
    // The old patterns took tens of seconds here.
    assert.ok(timed(run) < 2000, `${name} runs in linear time`);
  }

  // The faster patterns still recognise the same cell kinds.
  assert.equal(Csv.detectHeader([['note'], ['+358 40 123 4567'], ['(09) 123-456']]), true);
  assert.equal(Csv.detectHeader([['note'], ['anna@example.co.uk'], ['ben@example.com']]), true);
  assert.equal(Csv.detectHeader([['12'], ['34'], ['56']]), false);
  assert.equal(Csv.autoMap(['Summa (EUR) [netto]'], Payloads.FIELDS.Payment).amount, 0);
});

test('findColumn finds a file name column', () => {
  assert.equal(Csv.findColumn(['Name', 'File name', 'URL'], ['filename', 'file']), 1);
  assert.equal(Csv.findColumn(['Name', 'URL'], ['filename']), -1);
});

test('filenames sanitizes unsafe characters and keeps letters outside ASCII', () => {
  const names = Csv.filenames([
    'a/b\\c:d*e?f"g<h>i|j',
    '  Jääskeläinen  ',
    '..hidden',
    'trailing. ',
    'tab\there\nnew',
    'evil\u202Egnp.exe',
    'ctrl\u0001\u007Fchars',
    'CON',
    'lpt1.txt',
    '東京 オフィス'
  ]);
  assert.deepEqual(names, [
    'a-b-c-d-e-f-g-h-i-j',
    'Jääskeläinen',
    'hidden',
    'trailing',
    'tab here new',
    'evilgnp.exe',
    'ctrlchars',
    '_CON',
    '_lpt1.txt',
    '東京 オフィス'
  ]);
});

test('filenames de-duplicates without case and falls back to row numbers', () => {
  const names = Csv.filenames(['Anna', 'anna', '', 'ANNA', '///', 'row-2', ''], { numbers: [2, 3, 4, 5, 6, 7, 8] });
  assert.deepEqual(names, ['Anna', 'anna-2', 'row-4', 'ANNA-3', 'row-6', 'row-2', 'row-8']);
  assert.deepEqual(Csv.filenames(['', '']), ['row-1', 'row-2']);
  assert.deepEqual(Csv.filenames(['', 'x'], { fallbackPrefix: 'code' }), ['code-1', 'x']);
  assert.deepEqual(Csv.filenames(['manifest', 'Manifest'], { reserved: ['manifest'] }), ['manifest-2', 'Manifest-3']);
});

test('filenames drops a trailing output extension so names never end in .png.png', () => {
  const extensions = ['jpeg', 'png', 'jpg', 'svg', 'pdf', 'eps', 'webp'];
  assert.deepEqual(
    Csv.filenames(['alpha.png', 'beta.PNG', 'report.pdf', 'photo.jpeg', 'archive.tar.gz', '.png', 'v1.2'], { extensions }),
    ['alpha', 'beta', 'report', 'photo', 'archive.tar.gz', 'row-6', 'v1.2']
  );
  assert.deepEqual(Csv.filenames(['a.png', 'A', 'a.svg'], { extensions }), ['a', 'A-2', 'a-3']);
  assert.deepEqual(Csv.filenames(['logo.png'], { extensions: ['.PNG'] }), ['logo']);
  assert.deepEqual(Csv.filenames(['logo.png']), ['logo.png'], 'nothing is removed without the option');
});

test('filenames caps the length by characters and keeps suffixes inside the cap', () => {
  const long = 'ä'.repeat(120);
  const [first, second] = Csv.filenames([long, long]);
  assert.equal(Array.from(first).length, 80);
  assert.equal(Array.from(second).length, 80);
  assert.ok(second.endsWith('-2'));
  const emoji = Csv.filenames(['😀'.repeat(90)])[0];
  assert.equal(Array.from(emoji).length, 80);
  assert.ok(!/[\uD800-\uDBFF]$/.test(emoji), 'no lone high surrogate at the end');
});

test('stringify writes RFC 4180 CSV with CRLF and an optional BOM', () => {
  const text = Csv.stringify([['file', 'note'], ['a.png', 'x, "y"'], ['b.png', 'two\nlines']]);
  assert.equal(text, 'file,note\r\na.png,"x, ""y"""\r\nb.png,"two\nlines"\r\n');
  assert.equal(Csv.stringify([['a']], { bom: true }), '\uFEFFa\r\n');
  assert.equal(Csv.stringify([[1, null, undefined, 0]]), '1,,,0\r\n');
  assert.equal(Csv.stringify([]), '');
});

test('stringify blocks spreadsheet formula injection', () => {
  const cells = ['=HYPERLINK("http://x")', '+1', '-2', '@SUM(A1)', '\tTab', '\rCR', 'safe=1'];
  const line = Csv.stringify([cells]);
  assert.equal(line, `"'=HYPERLINK(""http://x"")",'+1,'-2,'@SUM(A1),'\tTab,"'\rCR",safe=1\r\n`);
  for (const cell of Csv.parse(line, { delimiter: ',' }).rows[0].slice(0, 6)) {
    assert.ok(cell.startsWith("'"), `${JSON.stringify(cell)} must start with an apostrophe`);
  }
});

test('stringify and parse round-trip safe cells', () => {
  const rows = [['file', 'row', 'error'], ['ä ö.png', '2', 'Row "x", line\r\nbreak'], ['b.svg', '3', '']];
  assert.deepEqual(Csv.parse(Csv.stringify(rows, { bom: true })).rows, rows);
});
