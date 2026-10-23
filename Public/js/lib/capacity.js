// QRTurbo.app - QR capacity model (QRTurboCapacity)
// Pure: encoding mode detection and the version that a payload needs at an
// error correction level, matching the bundled renderer's automatic version.
//
// The error correction block table is copied from qrcode-generator (MIT,
// Kazuhiko Arase), the encoder inside the vendored qr-code-styling.min.js. The
// bit counting replicates its automatic version loop: a version fits when
// 4 mode bits + the character count indicator + the data bits are at most
// 8 times its data codewords. Like the library, only one segment is used.
(function () {
    'use strict';

    const LEVELS = ['L', 'M', 'Q', 'H'];
    const MODES = ['numeric', 'alphanumeric', 'byte'];
    const MIN_VERSION = 1;
    const MAX_VERSION = 40;
    const MODE_BITS = 4;

    // qrcode-generator RS_BLOCK_TABLE: four rows per version (L, M, Q, H).
    // Each row lists [blocks, total codewords, data codewords], repeated for a
    // second block group when the version has one.
    const RS_BLOCK_TABLE = [
        [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
        [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
        [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
        [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
        [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
        [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
        [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
        [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
        [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
        [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],
        [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],
        [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],
        [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],
        [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13],
        [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],
        [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],
        [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],
        [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],
        [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],
        [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],
        [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],
        [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],
        [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],
        [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],
        [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],
        [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],
        [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],
        [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],
        [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],
        [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],
        [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],
        [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],
        [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],
        [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],
        [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],
        [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],
        [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],
        [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],
        [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]
    ];

    // The same patterns the library uses to pick the mode of its one segment.
    const NUMERIC_PATTERN = /^[0-9]*$/;
    const ALPHANUMERIC_PATTERN = /^[0-9A-Z $%*+\-./:]*$/;

    // Character count indicator widths for versions 1-9, 10-26 and 27-40.
    const COUNT_BITS = {
        numeric: [10, 12, 14],
        alphanumeric: [9, 11, 13],
        byte: [8, 16, 16]
    };

    function checkVersion(version) {
        if (!Number.isInteger(version) || version < MIN_VERSION || version > MAX_VERSION) {
            throw new RangeError(`QR version must be an integer from 1 to 40, got ${version}`);
        }
    }

    function checkLevel(ecl) {
        if (!LEVELS.includes(ecl)) {
            throw new RangeError(`Error correction level must be L, M, Q or H, got ${ecl}`);
        }
    }

    function checkMode(mode) {
        if (!MODES.includes(mode)) {
            throw new RangeError(`Mode must be numeric, alphanumeric or byte, got ${mode}`);
        }
    }

    /**
     * @description The mode the library picks for a byte string: numeric,
     * alphanumeric (digits, A-Z, space and $%*+-./:), otherwise byte.
     */
    function detectMode(byteString) {
        const text = String(byteString);
        if (NUMERIC_PATTERN.test(text)) return 'numeric';
        if (ALPHANUMERIC_PATTERN.test(text)) return 'alphanumeric';
        return 'byte';
    }

    function modules(version) {
        checkVersion(version);
        return 17 + (4 * version);
    }

    function countBits(mode, version) {
        checkMode(mode);
        checkVersion(version);
        const band = version < 10 ? 0 : (version < 27 ? 1 : 2);
        return COUNT_BITS[mode][band];
    }

    /**
     * @description Bits needed for `length` characters of data, without the
     * mode indicator and the character count.
     */
    function dataBits(mode, length) {
        checkMode(mode);
        const n = Math.max(0, Math.floor(Number(length) || 0));
        if (mode === 'numeric') {
            const rest = n % 3;
            return (10 * Math.floor(n / 3)) + (rest === 2 ? 7 : (rest === 1 ? 4 : 0));
        }
        if (mode === 'alphanumeric') {
            return (11 * Math.floor(n / 2)) + (6 * (n % 2));
        }
        return 8 * n;
    }

    /**
     * @description Data codewords of a version and level, summed over its
     * error correction blocks.
     */
    function dataCodewords(version, ecl) {
        checkVersion(version);
        checkLevel(ecl);
        const row = RS_BLOCK_TABLE[(4 * (version - 1)) + LEVELS.indexOf(ecl)];
        let total = 0;
        for (let i = 0; i < row.length; i += 3) {
            total += row[i] * row[i + 2];
        }
        return total;
    }

    /**
     * @description The most characters of one mode that fit in a version at a
     * level.
     */
    function capacity(version, ecl, mode = 'byte') {
        const available = (8 * dataCodewords(version, ecl)) - MODE_BITS - countBits(mode, version);
        if (available <= 0) return 0;
        if (mode === 'numeric') {
            const rest = available % 10;
            return (3 * Math.floor(available / 10)) + (rest >= 7 ? 2 : (rest >= 4 ? 1 : 0));
        }
        if (mode === 'alphanumeric') {
            return (2 * Math.floor(available / 11)) + (available % 11 >= 6 ? 1 : 0);
        }
        return Math.floor(available / 8);
    }

    function usedBits(mode, length, version) {
        return MODE_BITS + countBits(mode, version) + dataBits(mode, length);
    }

    /**
     * @description The smallest version at or above minVersion that holds the
     * byte string at the level, as the library's automatic version picks it.
     * Returns an Analysis; `fits` is false when not even version 40 holds it.
     */
    function analyze(byteString, ecl, minVersion = 1) {
        checkLevel(ecl);
        const text = String(byteString);
        const mode = detectMode(text);
        const length = text.length;
        const floor = Math.min(MAX_VERSION, Math.max(MIN_VERSION, Math.floor(Number(minVersion) || MIN_VERSION)));
        const maxAtLevel = capacity(MAX_VERSION, ecl, mode);

        for (let version = floor; version <= MAX_VERSION; version += 1) {
            const bits = usedBits(mode, length, version);
            if (bits <= 8 * dataCodewords(version, ecl)) {
                return {
                    mode,
                    length,
                    version,
                    modules: modules(version),
                    usedBits: bits,
                    fits: true,
                    maxAtLevel,
                    roomInVersion: capacity(version, ecl, mode) - length
                };
            }
        }

        return {
            mode,
            length,
            version: null,
            modules: null,
            usedBits: usedBits(mode, length, MAX_VERSION),
            fits: false,
            maxAtLevel,
            roomInVersion: 0
        };
    }

    const api = {
        detectMode,
        modules,
        countBits,
        dataBits,
        dataCodewords,
        capacity,
        analyze
    };

    globalThis.QRTurboCapacity = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
