// QRTurbo.app - Style presets (QRTurboPresets)
// Pure: presets change only the dot, corner and frame styles. They never
// touch colors, the logo, error correction or the quiet zone.
(function () {
    'use strict';

    // The Design keys a preset sets, and the only keys match() compares.
    const SHAPE_KEYS = Object.freeze(['dotStyle', 'cornerSquareStyle', 'cornerDotStyle', 'frameStyle']);

    /**
     * @description One frozen preset entry with its shape patch.
     */
    function preset(id, labelKey, dotStyle, cornerSquareStyle, cornerDotStyle, frameStyle) {
        return Object.freeze({
            id,
            labelKey,
            patch: Object.freeze({ dotStyle, cornerSquareStyle, cornerDotStyle, frameStyle })
        });
    }

    // SPEC B.4. Every preset has a distinct combination of the four shape
    // keys, so match() is unambiguous.
    const LIST = Object.freeze([
        preset('standard', 'design.presetStandard', 'square', 'extra-rounded', 'dot', 'none'),
        preset('classic', 'design.presetClassic', 'square', 'square', 'square', 'none'),
        preset('rounded', 'design.presetRounded', 'rounded', 'extra-rounded', 'dot', 'none'),
        preset('dots', 'design.presetDots', 'dots', 'dot', 'dot', 'none'),
        preset('soft', 'design.presetSoft', 'classy-rounded', 'extra-rounded', 'dot', 'none'),
        preset('scanme', 'design.presetScanMe', 'square', 'extra-rounded', 'dot', 'banner-bottom')
    ]);

    function find(id) {
        return LIST.find(entry => entry.id === id) || null;
    }

    /**
     * @description Returns a new Design with the preset's shapes applied. All
     * other keys are copied unchanged. An unknown id returns an unchanged copy.
     */
    function apply(design, id) {
        const base = design && typeof design === 'object' ? design : {};
        const entry = find(id);
        return entry ? { ...base, ...entry.patch } : { ...base };
    }

    /**
     * @description The id of the preset whose shapes equal the design's, or
     * null for a custom combination. Colors and other settings are ignored.
     */
    function match(design) {
        if (!design || typeof design !== 'object') return null;
        const entry = LIST.find(item => SHAPE_KEYS.every(key => item.patch[key] === design[key]));
        return entry ? entry.id : null;
    }

    const api = {
        LIST,
        apply,
        match
    };

    globalThis.QRTurboPresets = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
