const { test, expect, openApp } = require('./fixtures');

// QRTurboCapacity predicts the version the bundled library picks. These
// checks run the real library in the browser: a wrong prediction would make
// the readout lie and the engine retry, so they must agree exactly.

test('analyze() predicts the library version for 200 seeded payloads in every mode and level @webkit-core', async ({ page }) => {
  await openApp(page);

  const result = await page.evaluate(() => {
    const LEVELS = ['L', 'M', 'Q', 'H'];
    const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
    const BYTE_EXTRA = ['a', 'z', '#', '?', 'ä', 'ö', '€', '漢', '🚀', '\n'];
    let seed = 20261022;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    const pick = list => list[Math.floor(random() * list.length)];

    function libraryVersion(data, ecl) {
      const instance = new QRCodeStyling({ type: 'svg', data: '' });
      instance._setupSvg = () => {};
      try {
        instance.update({ data, qrOptions: { typeNumber: 0, errorCorrectionLevel: ecl } });
      } catch (error) {
        if (/overflow/.test(String(error))) return null;
        throw error;
      }
      return (instance._qr.getModuleCount() - 17) / 4;
    }

    function makePayload(mode, ecl) {
      // Lengths are spread over the whole range, plus a few just past the
      // version 40 limit, so every count indicator band is covered.
      const max = QRTurboCapacity.capacity(40, ecl, mode);
      const length = random() < 0.05
        ? max + 1 + Math.floor(random() * 4)
        : Math.max(1, Math.round(Math.pow(max, random())));
      if (mode === 'numeric') return Array.from({ length }, () => pick('0123456789'.split(''))).join('');
      // A leading letter keeps short alphanumeric samples out of numeric mode.
      if (mode === 'alphanumeric') {
        return `Q${Array.from({ length: length - 1 }, () => pick(ALPHANUMERIC.split(''))).join('')}`;
      }
      // Byte mode: the UTF-8 byte string the engine hands the library, with
      // whole multi-byte characters, padded with 'a' to the exact length.
      let bytes = 'x';
      while (bytes.length < length) {
        const next = QRTurboBytes.byteString(pick(BYTE_EXTRA));
        bytes += bytes.length + next.length <= length ? next : 'a';
      }
      return bytes;
    }

    const modes = ['numeric', 'alphanumeric', 'byte'];
    const mismatches = [];
    const covered = new Set();
    let overflows = 0;
    for (let index = 0; index < 200; index += 1) {
      const mode = modes[index % 3];
      const ecl = LEVELS[Math.floor(index / 3) % 4];
      const data = makePayload(mode, ecl);
      const analysis = QRTurboCapacity.analyze(data, ecl);
      const expected = libraryVersion(data, ecl);
      covered.add(`${analysis.mode}-${ecl}`);
      if (expected === null) overflows += 1;
      const predicted = analysis.fits ? analysis.version : null;
      if (analysis.mode !== mode || predicted !== expected) {
        mismatches.push({ mode, detected: analysis.mode, ecl, length: data.length, predicted, expected });
      }
    }
    return { mismatches, covered: [...covered].sort(), overflows };
  });

  expect(result.mismatches).toEqual([]);
  expect(result.covered).toHaveLength(12);
  expect(result.overflows).toBeGreaterThan(0);
});

test('the library accepts capacity bytes and overflows at capacity + 1 for every version and level @webkit-core', async ({ page }) => {
  await openApp(page);

  const failures = await page.evaluate(() => {
    const problems = [];
    const encode = (data, ecl, typeNumber) => {
      const instance = new QRCodeStyling({ type: 'svg', data: '' });
      instance._setupSvg = () => {};
      instance.update({ data, qrOptions: { typeNumber, errorCorrectionLevel: ecl } });
      return instance._qr.getModuleCount();
    };

    for (const ecl of ['L', 'M', 'Q', 'H']) {
      for (let version = 1; version <= 40; version += 1) {
        const capacity = QRTurboCapacity.capacity(version, ecl, 'byte');
        try {
          const modules = encode('a'.repeat(capacity), ecl, version);
          if (modules !== 17 + (4 * version)) problems.push(`v${version}-${ecl}: ${modules} modules`);
        } catch (error) {
          problems.push(`v${version}-${ecl} rejected ${capacity} bytes: ${error}`);
        }
        try {
          encode('a'.repeat(capacity + 1), ecl, version);
          problems.push(`v${version}-${ecl} accepted ${capacity + 1} bytes`);
        } catch (error) {
          if (!/overflow/.test(String(error))) problems.push(`v${version}-${ecl}: ${error}`);
        }
      }
    }
    return problems;
  });

  expect(failures).toEqual([]);
});
