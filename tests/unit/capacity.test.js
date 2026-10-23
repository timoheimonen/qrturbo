const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const capacity = require('../../Public/js/lib/capacity.js');

const repoRoot = path.resolve(__dirname, '../..');
const LEVELS = ['L', 'M', 'Q', 'H'];
const MODE_CHARACTERS = { byte: 'a', alphanumeric: 'A', numeric: '1' };

// Byte mode capacities from ISO/IEC 18004 (versions 1-40).
const ISO_BYTE_CAPACITY = {
  L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
    929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953],
  M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
    711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331],
  Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482,
    509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663],
  H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382,
    403, 439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273]
};

/**
 * The vendored qr-code-styling build runs in a sandbox. Its _setupSvg is
 * replaced on each instance, so update() builds and checks the code with the
 * library's own encoder but never needs a DOM to draw it.
 */
function loadLibrary() {
  const source = fs.readFileSync(path.join(repoRoot, 'Public/js/qr-code-styling.min.js'), 'utf8');
  const context = { self: {} };
  vm.createContext(context);
  vm.runInContext(`${source}\n;this.QRCodeStyling = self.QRCodeStyling;`, context);
  return context.QRCodeStyling;
}

const QRCodeStyling = loadLibrary();

function libraryModuleCount(data, ecl, typeNumber = 0) {
  const instance = new QRCodeStyling({ type: 'svg', data: '' });
  instance._setupSvg = () => {};
  instance.update({ data, qrOptions: { typeNumber, errorCorrectionLevel: ecl } });
  return instance._qr.getModuleCount();
}

function libraryOverflows(data, ecl, typeNumber) {
  try {
    libraryModuleCount(data, ecl, typeNumber);
    return false;
  } catch (error) {
    if (/code length overflow/.test(String(error))) return true;
    throw error;
  }
}

// A small deterministic generator, so the cross-check payloads are stable.
function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

test('byte capacity matches the specification table for every version and level', () => {
  for (const ecl of LEVELS) {
    const actual = Array.from({ length: 40 }, (_, index) => capacity.capacity(index + 1, ecl, 'byte'));
    assert.deepEqual(actual, ISO_BYTE_CAPACITY[ecl], `byte capacity at level ${ecl}`);
  }
});

test('capacity covers the well-known limits in each mode', () => {
  assert.equal(capacity.capacity(1, 'M', 'byte'), 14);
  assert.equal(capacity.capacity(13, 'M', 'byte'), 331);
  assert.equal(capacity.capacity(40, 'L', 'byte'), 2953);
  assert.equal(capacity.capacity(40, 'H', 'byte'), 1273);
  assert.equal(capacity.capacity(40, 'L', 'alphanumeric'), 4296);
  assert.equal(capacity.capacity(40, 'L', 'numeric'), 7089);
  assert.equal(capacity.capacity(1, 'L', 'numeric'), 41);
  assert.equal(capacity.capacity(1, 'L', 'alphanumeric'), 25);
  assert.equal(capacity.capacity(1, 'H', 'numeric'), 17);
  assert.equal(capacity.capacity(1, 'H', 'alphanumeric'), 10);
});

test('the bundled encoder overflows at capacity + 1 for every version, level and mode', () => {
  for (const ecl of LEVELS) {
    for (let version = 1; version <= 40; version += 1) {
      for (const [mode, character] of Object.entries(MODE_CHARACTERS)) {
        const limit = capacity.capacity(version, ecl, mode);
        assert.ok(
          libraryOverflows(character.repeat(limit + 1), ecl, version),
          `${mode} v${version}-${ecl} must overflow at ${limit + 1}`
        );
      }
    }
  }
});

test('the bundled encoder accepts exactly capacity characters', () => {
  // Every count indicator band edge in every mode and level, plus version 40.
  // Full encodes are slow at high versions, so the rest is left to the
  // overflow check above and the specification table.
  const cases = [];
  for (const ecl of LEVELS) {
    for (const version of [1, 9, 10, 26, 27]) {
      for (const mode of Object.keys(MODE_CHARACTERS)) cases.push([version, ecl, mode]);
    }
  }
  cases.push([40, 'L', 'byte'], [40, 'H', 'alphanumeric']);

  for (const [version, ecl, mode] of cases) {
    const data = MODE_CHARACTERS[mode].repeat(capacity.capacity(version, ecl, mode));
    assert.equal(libraryModuleCount(data, ecl, 0), 17 + (4 * version), `${mode} v${version}-${ecl}`);
  }
});

test('detectMode follows the patterns the library uses', () => {
  assert.equal(capacity.detectMode(''), 'numeric');
  assert.equal(capacity.detectMode('0123456789'), 'numeric');
  assert.equal(capacity.detectMode('HTTPS://QRTURBO.APP'), 'alphanumeric');
  assert.equal(capacity.detectMode('AB $%*+-./:9'), 'alphanumeric');
  assert.equal(capacity.detectMode('https://qrturbo.app'), 'byte');
  assert.equal(capacity.detectMode('ABC#'), 'byte');
  assert.equal(capacity.detectMode('Ã¤'), 'byte');
});

test('upper-case URLs fit version 1 at M, lower-case ones need version 2', () => {
  const upper = capacity.analyze('HTTPS://QRTURBO.APP', 'M');
  assert.equal(upper.mode, 'alphanumeric');
  assert.equal(upper.version, 1);
  assert.equal(upper.modules, 21);
  assert.equal(upper.fits, true);

  const lower = capacity.analyze('https://qrturbo.app', 'M');
  assert.equal(lower.mode, 'byte');
  assert.equal(lower.version, 2);
  assert.equal(lower.modules, 25);
  assert.equal(lower.length, 19);
  assert.equal(lower.usedBits, 4 + 8 + (19 * 8));
  assert.equal(lower.maxAtLevel, 2331);
  assert.equal(lower.roomInVersion, 26 - 19);
});

test('countBits, dataBits, modules and dataCodewords follow the specification', () => {
  assert.deepEqual(['numeric', 'alphanumeric', 'byte'].map(mode => capacity.countBits(mode, 9)), [10, 9, 8]);
  assert.deepEqual(['numeric', 'alphanumeric', 'byte'].map(mode => capacity.countBits(mode, 10)), [12, 11, 16]);
  assert.deepEqual(['numeric', 'alphanumeric', 'byte'].map(mode => capacity.countBits(mode, 26)), [12, 11, 16]);
  assert.deepEqual(['numeric', 'alphanumeric', 'byte'].map(mode => capacity.countBits(mode, 27)), [14, 13, 16]);

  assert.equal(capacity.dataBits('numeric', 3), 10);
  assert.equal(capacity.dataBits('numeric', 4), 14);
  assert.equal(capacity.dataBits('numeric', 5), 17);
  assert.equal(capacity.dataBits('alphanumeric', 2), 11);
  assert.equal(capacity.dataBits('alphanumeric', 3), 17);
  assert.equal(capacity.dataBits('byte', 7), 56);

  assert.equal(capacity.modules(1), 21);
  assert.equal(capacity.modules(40), 177);
  assert.equal(capacity.dataCodewords(1, 'L'), 19);
  assert.equal(capacity.dataCodewords(5, 'Q'), 62);
  assert.equal(capacity.dataCodewords(40, 'H'), 1276);

  assert.throws(() => capacity.modules(0), RangeError);
  assert.throws(() => capacity.dataCodewords(41, 'M'), RangeError);
  assert.throws(() => capacity.dataCodewords(1, 'X'), RangeError);
  assert.throws(() => capacity.countBits('kanji', 1), RangeError);
});

test('analyze switches version exactly at the capacity boundary', () => {
  const cases = [
    [1, 'M', 'byte'], [9, 'L', 'byte'], [10, 'H', 'byte'], [26, 'Q', 'byte'], [27, 'M', 'byte'],
    [1, 'L', 'alphanumeric'], [9, 'Q', 'alphanumeric'], [26, 'H', 'alphanumeric'],
    [1, 'H', 'numeric'], [9, 'M', 'numeric'], [10, 'L', 'numeric'], [27, 'Q', 'numeric']
  ];

  for (const [version, ecl, mode] of cases) {
    const limit = capacity.capacity(version, ecl, mode);
    const character = MODE_CHARACTERS[mode];
    const atLimit = capacity.analyze(character.repeat(limit), ecl);
    const overLimit = capacity.analyze(character.repeat(limit + 1), ecl);
    assert.equal(atLimit.mode, mode);
    assert.equal(atLimit.version, version, `${mode} at capacity of v${version}-${ecl}`);
    assert.equal(atLimit.roomInVersion, 0);
    assert.equal(overLimit.version, version + 1, `${mode} one over capacity of v${version}-${ecl}`);
  }
});

test('analyze reports content that does not fit version 40', () => {
  const fits = capacity.analyze('a'.repeat(2331), 'M');
  assert.equal(fits.fits, true);
  assert.equal(fits.version, 40);

  const tooLong = capacity.analyze('a'.repeat(2332), 'M');
  assert.equal(tooLong.fits, false);
  assert.equal(tooLong.version, null);
  assert.equal(tooLong.modules, null);
  assert.equal(tooLong.maxAtLevel, 2331);
  assert.equal(tooLong.length, 2332);
  assert.ok(tooLong.usedBits > 8 * capacity.dataCodewords(40, 'M'));

  assert.equal(capacity.analyze('1'.repeat(7090), 'L').fits, false);
  assert.equal(capacity.analyze('1'.repeat(7089), 'L').fits, true);
});

test('analyze keeps the minimum version floor', () => {
  assert.equal(capacity.analyze('hello', 'M').version, 1);
  assert.equal(capacity.analyze('hello', 'M', 7).version, 7);
  assert.equal(capacity.analyze('hello', 'M', 7).modules, 45);
  assert.equal(capacity.analyze('a'.repeat(100), 'M', 3).version, 6);
  assert.equal(capacity.analyze('a'.repeat(100), 'M', 8).version, 8);
  assert.equal(capacity.analyze('hello', 'M', 0).version, 1);
  assert.equal(capacity.analyze('hello', 'M', 99).version, 40);
  assert.equal(capacity.analyze('hello', 'H', 40).roomInVersion, 1273 - 5);
});

test('analyze picks the same version as the library for seeded payloads', () => {
  const random = seededRandom(20261022);
  const alphabets = {
    numeric: '0123456789',
    alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:',
    byte: 'abcdefghijklmnopqrstuvwxyz0123456789-_.~:/?#[]@!$&()*+,;=äö'
  };

  for (let index = 0; index < 60; index += 1) {
    const mode = Object.keys(alphabets)[index % 3];
    const ecl = LEVELS[Math.floor(random() * 4)];
    const length = 1 + Math.floor(random() * 300);
    const alphabet = alphabets[mode];
    let text = '';
    for (let i = 0; i < length; i += 1) text += alphabet[Math.floor(random() * alphabet.length)];

    const analysis = capacity.analyze(text, ecl);
    assert.equal(analysis.modules, libraryModuleCount(text, ecl, 0), `payload ${index} (${mode}, ${ecl}, ${length})`);
  }
});
