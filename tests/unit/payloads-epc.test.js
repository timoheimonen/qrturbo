const assert = require('node:assert/strict');
const test = require('node:test');

const QRTurboPayloads = require('../../Public/js/lib/payloads.js');

const IBAN = 'FI7944052020036082';

function payment(values) {
  return QRTurboPayloads.build('Payment', { name: 'Example Oy', iban: IBAN, ...values });
}

function failure(result) {
  return { ok: result.ok, errorKey: result.errorKey, field: result.field };
}

test('the Finanssiala-style example: BIC, version 001, amount, RF reference and due date', () => {
  const result = QRTurboPayloads.build('Payment', {
    name: 'Asiakas T. Meikäläinen',
    iban: 'FI79 4405 2020 0360 82',
    bic: 'OKOYFIHH',
    amount: '158.24',
    reference: 'RF18539007547034',
    message: '',
    dueDate: '2026-11-05'
  });

  assert.equal(result.ok, true);
  assert.equal(
    result.payload,
    'BCD\n001\n1\nSCT\nOKOYFIHH\nAsiakas T. Meikäläinen\nFI7944052020036082\nEUR158.24\n\nRF18539007547034\n\nReqdExctnDt/2026-11-05'
  );
  assert.equal(result.isSensitive, false);
  // SPEC D.9: "payment " plus the name; the IBAN never names the file.
  assert.equal(result.filenameHint, 'payment Asiakas T. Meikäläinen');
});

test('version 002 without a BIC, and trailing empty lines are trimmed', () => {
  const result = payment({});
  assert.equal(result.payload, `BCD\n002\n1\nSCT\n\nExample Oy\n${IBAN}`);
  assert.ok(!result.payload.endsWith('\n'));

  assert.equal(payment({ amount: '12' }).payload, `BCD\n002\n1\nSCT\n\nExample Oy\n${IBAN}\nEUR12.00`);
  assert.equal(
    payment({ message: 'Invoice 42' }).payload,
    `BCD\n002\n1\nSCT\n\nExample Oy\n${IBAN}\n\n\n\nInvoice 42`
  );
  assert.equal(
    payment({ dueDate: '2026-11-05' }).payload,
    `BCD\n002\n1\nSCT\n\nExample Oy\n${IBAN}\n\n\n\n\nReqdExctnDt/2026-11-05`
  );
});

test('amounts accept a decimal comma and are written with two decimals', () => {
  const amountLine = value => payment({ amount: value }).payload.split('\n')[7];

  assert.equal(amountLine('158,24'), 'EUR158.24');
  assert.equal(amountLine('158.2'), 'EUR158.20');
  assert.equal(amountLine('0.01'), 'EUR0.01');
  assert.equal(amountLine('1 000,50'), 'EUR1000.50');
  assert.equal(amountLine('€ 25'), 'EUR25.00');
  assert.equal(amountLine('999999999.99'), 'EUR999999999.99');
  assert.equal(amountLine('007,5'), 'EUR7.50');

  for (const invalid of ['0', '0,00', '0.001', '1000000000', '1.234,56', '-5', 'abc', '1e3']) {
    assert.deepEqual(failure(payment({ amount: invalid })), {
      ok: false,
      errorKey: 'alerts.amountInvalid',
      field: 'amount'
    }, `${invalid} is not a valid amount`);
  }
});

test('IBAN mod 97 validation, normalization and formatting', () => {
  assert.equal(QRTurboPayloads.iban.validate(IBAN), true);
  assert.equal(QRTurboPayloads.iban.validate('fi79 4405 2020 0360 82'), true);
  assert.equal(QRTurboPayloads.iban.validate('GB82WEST12345698765432'), true);
  assert.equal(QRTurboPayloads.iban.validate('DE89370400440532013000'), true);
  assert.equal(QRTurboPayloads.iban.validate('FI7944052020036083'), false);
  assert.equal(QRTurboPayloads.iban.validate('FI79'), false);
  assert.equal(QRTurboPayloads.iban.validate('XX00 0000'), false);
  assert.equal(QRTurboPayloads.iban.normalize(' fi79 4405 2020 0360 82 '), IBAN);
  assert.equal(QRTurboPayloads.iban.format(IBAN), 'FI79 4405 2020 0360 82');

  assert.deepEqual(failure(payment({ iban: 'FI7944052020036083' })), {
    ok: false,
    errorKey: 'alerts.ibanInvalid',
    field: 'iban'
  });
});

test('BIC validation', () => {
  assert.equal(QRTurboPayloads.bic.validate('OKOYFIHH'), true);
  assert.equal(QRTurboPayloads.bic.validate('NDEAFIHHXXX'), true);
  assert.equal(QRTurboPayloads.bic.validate('okoyfihh'), true);
  assert.equal(QRTurboPayloads.bic.validate('OKOY'), false);
  assert.equal(QRTurboPayloads.bic.validate('OKOY1IHH'), false);
  assert.equal(QRTurboPayloads.bic.validate('OKOYFIHHX'), false);

  assert.equal(payment({ bic: ' okoyfihh ' }).payload.split('\n')[4], 'OKOYFIHH');
  assert.deepEqual(failure(payment({ bic: 'OKOYFI' })), { ok: false, errorKey: 'alerts.bicInvalid', field: 'bic' });
});

test('RF creditor references and Finnish reference numbers', () => {
  assert.equal(QRTurboPayloads.rf.validate('RF18539007547034'), true);
  assert.equal(QRTurboPayloads.rf.validate('RF18 5390 0754 7034'), true);
  assert.equal(QRTurboPayloads.rf.validate('rf18539007547034'), true);
  assert.equal(QRTurboPayloads.rf.validate('RF18539007547035'), false);
  assert.equal(QRTurboPayloads.rf.validate('RF18'), false);

  assert.equal(QRTurboPayloads.finnishReference.checkDigit('123'), 2);
  assert.equal(QRTurboPayloads.finnishReference.validate('1232'), true);
  assert.equal(QRTurboPayloads.finnishReference.validate('1233'), false);
  assert.equal(QRTurboPayloads.finnishReference.validate('123'), false);
  assert.equal(QRTurboPayloads.rf.fromFinnish('1232'), 'RF111232');
  assert.equal(QRTurboPayloads.rf.validate(QRTurboPayloads.rf.fromFinnish('1232')), true);

  // Every generated reference passes both checks.
  for (const base of ['100', '4242', '12345678', '0001234', '1234567890123456789']) {
    const reference = `${base}${QRTurboPayloads.finnishReference.checkDigit(base)}`;
    assert.equal(QRTurboPayloads.finnishReference.validate(reference), true, reference);
    assert.equal(QRTurboPayloads.rf.validate(QRTurboPayloads.rf.fromFinnish(reference)), true, reference);
  }

  const referenceLine = value => payment({ reference: value }).payload.split('\n')[9];
  assert.equal(referenceLine('RF18 5390 0754 7034'), 'RF18539007547034');
  assert.equal(referenceLine('1232'), 'RF111232');
  assert.equal(referenceLine('12 32'), 'RF111232');
  assert.equal(referenceLine('0001232'), 'RF111232');

  // A number of only zeros passes 7-3-1 but is no reference, and never throws.
  for (const zeros of ['0000', '00000000000000000000']) {
    assert.equal(QRTurboPayloads.finnishReference.validate(zeros), false, zeros);
    assert.doesNotThrow(() => QRTurboPayloads.paymentBytes({ name: 'x', iban: IBAN, reference: zeros }));
  }

  for (const invalid of ['1233', 'RF18539007547035', 'ABC123', '12', '0000', '0 0 0 0']) {
    assert.deepEqual(failure(payment({ reference: invalid })), {
      ok: false,
      errorKey: 'alerts.referenceInvalid',
      field: 'reference'
    }, `${invalid} is not a valid reference`);
  }
});

test('a reference together with a message is rejected', () => {
  assert.deepEqual(failure(payment({ reference: 'RF18539007547034', message: 'Thanks' })), {
    ok: false,
    errorKey: 'alerts.referenceAndMessage',
    field: 'message'
  });
});

test('more than 331 bytes gives paymentTooLong', () => {
  // 70 two-byte letters in the name and a message of two-byte letters.
  const name = 'Ä'.repeat(70);
  const fits = payment({ name, message: `${'é'.repeat(76)}a` });
  assert.equal(fits.ok, true);
  assert.equal(Buffer.byteLength(fits.payload, 'utf8'), 331);
  assert.equal(QRTurboPayloads.paymentBytes({ name, iban: IBAN, message: `${'é'.repeat(76)}a` }), 331);

  const tooLong = payment({ name, message: 'é'.repeat(77) });
  assert.equal(QRTurboPayloads.paymentBytes({ name, iban: IBAN, message: 'é'.repeat(77) }), 332);
  assert.deepEqual(failure(tooLong), { ok: false, errorKey: 'alerts.paymentTooLong', field: 'message' });
});

test('required fields, lengths and dates', () => {
  assert.deepEqual(QRTurboPayloads.build('Payment', {}), {
    ok: false,
    errorKey: 'alerts.paymentRequired',
    field: 'name',
    empty: true
  });
  assert.deepEqual(QRTurboPayloads.build('Payment', { name: 'Example Oy', iban: ' ' }), {
    ok: false,
    errorKey: 'alerts.paymentRequired',
    field: 'iban',
    empty: true
  });

  assert.equal(payment({ name: 'N'.repeat(70) }).ok, true);
  assert.deepEqual(failure(payment({ name: 'N'.repeat(71) })), {
    ok: false,
    errorKey: 'alerts.paymentNameTooLong',
    field: 'name'
  });

  assert.equal(payment({ message: 'm'.repeat(140) }).ok, true);
  assert.deepEqual(failure(payment({ message: 'm'.repeat(141) })), {
    ok: false,
    errorKey: 'alerts.paymentMessageTooLong',
    field: 'message'
  });

  for (const invalid of ['2026-02-30', '5.11.2026', '2026-13-01']) {
    assert.deepEqual(failure(payment({ dueDate: invalid })), {
      ok: false,
      errorKey: 'alerts.dateInvalid',
      field: 'dueDate'
    }, `${invalid} is not a valid due date`);
  }
  assert.equal(payment({ dueDate: '2028-02-29' }).ok, true);
});

test('line breaks in the name or message never add EPC lines', () => {
  const result = payment({ name: 'Example\nOy', message: 'Line 1\r\nLine 2' });
  const lines = result.payload.split('\n');
  assert.equal(lines.length, 11);
  assert.equal(lines[5], 'Example Oy');
  assert.equal(lines[10], 'Line 1 Line 2');
});

test('the byte counter matches the payload and counts unfinished input', () => {
  const values = { name: 'Example Oy', iban: IBAN, bic: 'OKOYFIHH', amount: '10,5', reference: '1232' };
  const result = QRTurboPayloads.build('Payment', values);
  assert.equal(QRTurboPayloads.paymentBytes(values), Buffer.byteLength(result.payload, 'utf8'));

  assert.equal(QRTurboPayloads.paymentBytes({}), Buffer.byteLength('BCD\n002\n1\nSCT', 'utf8'));
  assert.equal(
    QRTurboPayloads.paymentBytes({ name: 'Example Oy', iban: 'FI79 44' }),
    Buffer.byteLength('BCD\n002\n1\nSCT\n\nExample Oy\nFI7944', 'utf8')
  );
});
