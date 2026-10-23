// QRTurbo.app - Helvetica-Bold metrics (QRTurboHelvetica)
// Pure, loaded lazily with the geometry module: WinAnsi glyph names and AFM
// widths, so frame labels can stay live text in PDF and EPS exports.
// Widths come from the Adobe Core14 AFM for Helvetica-Bold (Version 002.000,
// UniqueID 43052), reduced to the advance widths of the WinAnsi codes below.
// AFM data: Copyright (c) 1985, 1987, 1989, 1990, 1997 Adobe Systems
// Incorporated. All Rights Reserved. Helvetica is a trademark of
// Linotype-Hell AG and/or its subsidiaries.
// Only U+0020-U+007E and U+00A0-U+00FF are encodable: in that range the
// Latin-1 code point equals the WinAnsiEncoding code.
(function () {
    'use strict';

    // WinAnsi glyph names for 0x20-0x7E.
    const LOW_NAMES = (
        'space exclam quotedbl numbersign dollar percent ampersand quotesingle parenleft parenright asterisk plus '
        + 'comma hyphen period slash zero one two three four five six seven eight nine colon semicolon less equal '
        + 'greater question at A B C D E F G H I J K L M N O P Q R S T U V W X Y Z bracketleft backslash '
        + 'bracketright asciicircum underscore grave a b c d e f g h i j k l m n o p q r s t u v w x y z braceleft '
        + 'bar braceright asciitilde'
    ).split(' ');

    // WinAnsi glyph names for 0xA0-0xFF. 0xA0 maps to space and 0xAD to
    // hyphen, as in ISO 32000-1 Annex D.
    const HIGH_NAMES = (
        'space exclamdown cent sterling currency yen brokenbar section dieresis copyright ordfeminine guillemotleft '
        + 'logicalnot hyphen registered macron degree plusminus twosuperior threesuperior acute mu paragraph '
        + 'periodcentered cedilla onesuperior ordmasculine guillemotright onequarter onehalf threequarters '
        + 'questiondown Agrave Aacute Acircumflex Atilde Adieresis Aring AE Ccedilla Egrave Eacute Ecircumflex '
        + 'Edieresis Igrave Iacute Icircumflex Idieresis Eth Ntilde Ograve Oacute Ocircumflex Otilde Odieresis '
        + 'multiply Oslash Ugrave Uacute Ucircumflex Udieresis Yacute Thorn germandbls agrave aacute acircumflex '
        + 'atilde adieresis aring ae ccedilla egrave eacute ecircumflex edieresis igrave iacute icircumflex '
        + 'idieresis eth ntilde ograve oacute ocircumflex otilde odieresis divide oslash ugrave uacute ucircumflex '
        + 'udieresis yacute thorn ydieresis'
    ).split(' ');

    // Helvetica-Bold advance widths (1/1000 em) for 0x20-0x7E.
    const LOW_WIDTHS = [
        278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
        556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
        975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
        667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
        333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
        611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584
    ];

    // Helvetica-Bold advance widths (1/1000 em) for 0xA0-0xFF.
    const HIGH_WIDTHS = [
        278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333,
        400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611,
        722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
        722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
        556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278,
        611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556
    ];

    // Width used by measure() for a character outside WinAnsi (the digit width).
    const FALLBACK_WIDTH = 556;

    const GLYPH_NAMES = new Array(256).fill(null);
    const WIDTHS = new Uint16Array(256);
    LOW_NAMES.forEach((name, index) => {
        GLYPH_NAMES[0x20 + index] = name;
        WIDTHS[0x20 + index] = LOW_WIDTHS[index];
    });
    HIGH_NAMES.forEach((name, index) => {
        GLYPH_NAMES[0xa0 + index] = name;
        WIDTHS[0xa0 + index] = HIGH_WIDTHS[index];
    });

    function isEncodableCode(code) {
        return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff);
    }

    /**
     * @description True when every character of the text has a WinAnsi code
     * and a Helvetica-Bold glyph, so it can be written as live PDF/EPS text.
     */
    function canEncode(text) {
        const value = String(text);
        for (let i = 0; i < value.length; i++) {
            if (!isEncodableCode(value.charCodeAt(i))) return false;
        }
        return true;
    }

    /**
     * @description The WinAnsi (Latin-1) bytes of the text. Throws a
     * RangeError for any character that canEncode rejects.
     */
    function encode(text) {
        const value = String(text);
        const bytes = new Uint8Array(value.length);
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            if (!isEncodableCode(code)) {
                throw new RangeError(`QRTurboHelvetica.encode: no WinAnsi glyph for U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
            }
            bytes[i] = code;
        }
        return bytes;
    }

    /**
     * @description Advance width of the text in Helvetica-Bold at the given
     * font size, in the same units as the size. No kerning, as in a PDF Tj.
     */
    function measure(text, fontSize) {
        const value = String(text);
        let units = 0;
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            units += isEncodableCode(code) ? WIDTHS[code] : FALLBACK_WIDTH;
        }
        return units * (Number(fontSize) || 0) / 1000;
    }

    const api = {
        GLYPH_NAMES: Object.freeze(GLYPH_NAMES),
        WIDTHS,
        canEncode,
        encode,
        measure
    };

    globalThis.QRTurboHelvetica = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
