// QRTurbo.app - Color math (QRTurboColor)
// Pure: hex parsing, WCAG luminance and contrast, the symbol contrast used by
// the scan check, and the CMYK and K-only conversions used by PDF and EPS.
(function () {
    'use strict';

    const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
    // sRGB to linear light, as in IEC 61966-2-1 (the WCAG 2.x formula).
    const LINEAR_THRESHOLD = 0.04045;
    const LUMA_WEIGHTS = [0.2126, 0.7152, 0.0722];

    /**
     * @description Normalizes '#rgb' or '#rrggbb' (the '#' is optional) to
     * lowercase '#rrggbb'. Returns null for anything else.
     */
    function normalizeHex(s) {
        if (typeof s !== 'string') return null;
        const match = s.trim().match(HEX_PATTERN);
        if (!match) return null;

        const digits = match[1].toLowerCase();
        if (digits.length === 6) return `#${digits}`;
        return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
    }

    /**
     * @description Splits a hex color into 0..255 channels, or null.
     */
    function parseHex(hex) {
        const normalized = normalizeHex(hex);
        if (!normalized) return null;

        const value = parseInt(normalized.slice(1), 16);
        return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
    }

    function toLinear(channel) {
        const c = channel / 255;
        return c <= LINEAR_THRESHOLD ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    /**
     * @description WCAG relative luminance (linearized sRGB), 0..1. NaN when
     * the color cannot be parsed.
     */
    function relativeLuminance(hex) {
        const rgb = parseHex(hex);
        if (!rgb) return NaN;
        return (LUMA_WEIGHTS[0] * toLinear(rgb.r))
            + (LUMA_WEIGHTS[1] * toLinear(rgb.g))
            + (LUMA_WEIGHTS[2] * toLinear(rgb.b));
    }

    /**
     * @description WCAG contrast ratio of two colors, 1..21.
     */
    function contrastRatio(a, b) {
        const la = relativeLuminance(a);
        const lb = relativeLuminance(b);
        const lighter = Math.max(la, lb);
        const darker = Math.min(la, lb);
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * @description Symbol contrast proxy for scanners: Y(bg) - Y(fg). About 1
     * for black on white, near 0 for similar colors, and negative when the
     * code is lighter than its background (inverted).
     */
    function symbolContrast(fg, bg) {
        return relativeLuminance(bg) - relativeLuminance(fg);
    }

    /**
     * @description Every color used to draw modules: the code color, the
     * second gradient stop when the fill is a gradient, and the corner colors
     * when custom corners are on. Normalized and without duplicates.
     */
    function foregroundColors(design) {
        const d = design || {};
        const colors = [d.fgColor];
        if (d.fill === 'gradient') colors.push(d.fgColor2);
        if (d.customCorners) colors.push(d.cornerOuterColor, d.cornerInnerColor);

        const unique = [];
        colors.forEach(color => {
            const hex = normalizeHex(color);
            if (hex && !unique.includes(hex)) unique.push(hex);
        });
        return unique;
    }

    /**
     * @description The foreground color closest to the background, measured
     * as the smallest absolute symbol contrast. Falls back to black when the
     * design has no valid foreground color.
     */
    function worstForeground(design, bg) {
        let worst = null;
        let worstContrast = Infinity;

        foregroundColors(design).forEach(color => {
            const contrast = Math.abs(symbolContrast(color, bg));
            if (Number.isFinite(contrast) && contrast < worstContrast) {
                worst = color;
                worstContrast = contrast;
            }
        });

        return worst || '#000000';
    }

    function round6(value) {
        // `|| 0` also turns -0 into 0.
        return Math.round(value * 1e6) / 1e6 || 0;
    }

    /**
     * @description Basic device-independent RGB to CMYK conversion, each
     * component 0..1. Black is pure K: '#000000' gives [0, 0, 0, 1].
     */
    function toCmyk(hex) {
        const rgb = parseHex(hex);
        if (!rgb) return [0, 0, 0, 1];

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const k = 1 - Math.max(r, g, b);
        if (k >= 1) return [0, 0, 0, 1];

        const scale = 1 - k;
        return [
            round6((1 - r - k) / scale),
            round6((1 - g - k) / scale),
            round6((1 - b - k) / scale),
            round6(k)
        ];
    }

    /**
     * @description Perceptual gray of a gamma-encoded sRGB color, 0..1: the
     * Rec. 709 weights applied to the stored channel values, without
     * linearization, so #808080 is about 0.5. Used for K-only print output;
     * contrast checks use relativeLuminance. NaN when the color cannot be
     * parsed.
     */
    function perceptualGray(hex) {
        const rgb = parseHex(hex);
        if (!rgb) return NaN;
        return ((LUMA_WEIGHTS[0] * rgb.r) + (LUMA_WEIGHTS[1] * rgb.g) + (LUMA_WEIGHTS[2] * rgb.b)) / 255;
    }

    /**
     * @description Black-only tint for K output: 1 - the perceptual gray, so
     * a mid-gray prints as about 50% K. Black is 1, white 0.
     */
    function toK(hex) {
        const gray = perceptualGray(hex);
        return Number.isFinite(gray) ? round6(Math.min(1, Math.max(0, 1 - gray))) : 1;
    }

    const api = {
        normalizeHex,
        parseHex,
        relativeLuminance,
        contrastRatio,
        symbolContrast,
        foregroundColors,
        worstForeground,
        toCmyk,
        perceptualGray,
        toK
    };

    globalThis.QRTurboColor = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
