// QRTurbo.app - Design panel (QRTurboDesignUI)
// Owns the step 3 design controls: presets, colors, fill, corner colors,
// logo, frame, shapes, error correction, quiet zone, minimum version and
// reset. It talks to the rest of the page only through the app (QRTurboApp):
// every control change calls app.updateDesign(), and every 'design' event
// (user edits, undo, scan fixes) is reflected back into the controls.
(function () {
    'use strict';

    // Preset thumbnails: a fixed sample payload, rendered at version 2 and
    // level M (19 bytes fit in 26), with a small quiet zone.
    const THUMB_TEXT = 'https://qrturbo.app';
    const THUMB_VERSION = 2;
    const THUMB_ECL = 'M';
    const THUMB_QUIET_ZONE = 2;
    const THUMB_TIMEOUT = 4000;
    const THUMB_DELAY = 500;
    // Design keys that change how the preset thumbnails look.
    const THUMB_KEYS = [
        'fgColor', 'bgColor', 'transparentBackground', 'fill', 'fgColor2', 'gradientType', 'gradientAngle',
        'customCorners', 'cornerOuterColor', 'cornerInnerColor', 'frameColor', 'frameText'
    ];

    const UNDO_TIMEOUT = 8000;
    const PAYMENT_TAB = 'Payment';
    const HEX_VALUE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
    // A value that can still become valid while the user types.
    const HEX_PARTIAL = /^#?[0-9a-f]{0,5}$/i;
    const LOGO_ERROR_KEYS = {
        'logo.readFailed': 'logo.readFailed',
        'logo.tooLarge': 'logo.tooLarge'
    };

    const state = {
        app: null,
        els: null,
        colors: [],
        sliders: [],
        radios: [],
        tab: null,
        cornersSeeded: false,
        logoToken: 0,
        logoNote: null,
        logoErrorKey: null,
        resetToast: null,
        // The design before the last Reset, while nothing else has changed
        // the design since. A second Reset keeps offering this Undo.
        resetUndo: null,
        disclosure: null,
        thumbTimer: null,
        thumbIdle: null,
        thumbRun: 0,
        thumbSignature: '',
        thumbPending: '',
        thumbWarned: false,
        thumbUrls: new Map()
    };

    // --- Small helpers ---

    /**
     * @description '#abc', 'abc', '#aabbcc' or 'AABBCC' to lowercase '#aabbcc';
     * null for anything else.
     */
    function normalizeHex(value) {
        const match = HEX_VALUE.exec(String(value == null ? '' : value).trim());
        if (!match) return null;
        const digits = match[1].toLowerCase();
        return `#${digits.length === 3 ? digits.split('').map(c => c + c).join('') : digits}`;
    }

    // Live regions re-announce rewritten text, so unchanged text is kept.
    function setText(element, text) {
        if (element.textContent !== text) element.textContent = text;
    }

    function setInvalid(input, invalid) {
        if (invalid) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.removeAttribute('aria-invalid');
        }
    }

    function formatNumber(value, maxFractionDigits) {
        const ui = globalThis.QRTurboUI;
        if (ui && typeof ui.formatNumber === 'function') {
            try {
                return ui.formatNumber(value, maxFractionDigits);
            } catch (error) {
                // Fall back to plain digits below.
            }
        }
        return String(value);
    }

    function formatPercent(fraction) {
        try {
            const lang = document.documentElement.lang || 'en';
            return new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
        } catch (error) {
            return `${Math.round(fraction * 100)}%`;
        }
    }

    function requestIdle(callback) {
        if (typeof requestIdleCallback === 'function') {
            return { idle: requestIdleCallback(callback, { timeout: 2000 }) };
        }
        return { timer: setTimeout(callback, 1) };
    }

    function cancelIdle(handle) {
        if (!handle) return;
        if (handle.idle !== undefined && typeof cancelIdleCallback === 'function') cancelIdleCallback(handle.idle);
        if (handle.timer !== undefined) clearTimeout(handle.timer);
    }

    function nextIdle() {
        return new Promise(resolve => requestIdle(resolve));
    }

    function activeTabName() {
        return typeof getActiveTabName === 'function' ? getActiveTabName() : null;
    }

    // A modal dialog (batch mode) makes the design panel inert, so files
    // pasted there are not logos.
    function modalDialogOpen() {
        try {
            return Boolean(document.querySelector('dialog[open]:modal'));
        } catch (error) {
            return Boolean(document.querySelector('dialog[open]'));
        }
    }

    /**
     * @description Sends a user change to the app. Slider and color picker
     * drags use 'drag', typed values 'typing', everything else 'discrete'.
     */
    function update(patch, reason) {
        state.app.updateDesign(patch, { source: 'user', reason: reason || 'discrete' });
    }

    // --- Elements ---

    function colorField(key, picker, text, label) {
        return { key, picker, text, label, synced: null };
    }

    function slider(key, input, output, format) {
        return { key, input, output, format };
    }

    /**
     * @description Looks up every element of the design panel once. Returns
     * null when the page has no design panel.
     */
    function queryElements() {
        const presetPicker = document.getElementById('preset-picker');
        const colorsGroup = document.getElementById('colors-group');
        if (!presetPicker || !colorsGroup) return null;

        const els = {
            panel: presetPicker.closest('.panel-style') || document.body,
            presetPicker,
            presetCustomTag: document.getElementById('preset-custom-tag'),
            presetRadios: Array.from(presetPicker.querySelectorAll('input[type="radio"][name="preset"]')),
            gradientOptions: document.getElementById('gradient-options'),
            gradientAngleGroup: document.getElementById('gradient-angle-group'),
            transparent: document.getElementById('qr-transparent-bg'),
            swap: document.getElementById('swap-colors-btn'),
            customCorners: document.getElementById('custom-corners'),
            cornerColors: document.getElementById('corner-colors'),
            logoDropzone: document.getElementById('logo-dropzone'),
            logoInput: document.getElementById('qr-logo'),
            logoSelectBtn: document.getElementById('logo-select-btn'),
            logoPreview: document.getElementById('logo-preview'),
            logoPreviewImg: document.getElementById('logo-preview-img'),
            logoFilename: document.getElementById('logo-filename'),
            logoRemoveBtn: document.getElementById('logo-remove-btn'),
            logoError: document.getElementById('logo-error'),
            logoNote: document.getElementById('logo-note'),
            logoControls: document.getElementById('logo-controls'),
            frameOptions: document.getElementById('frame-options'),
            frameText: document.getElementById('frame-text'),
            customizeToggle: document.getElementById('customize-toggle'),
            customizePanel: document.getElementById('customize-panel'),
            ecl: document.getElementById('qr-error-correction'),
            eclAutoHelp: document.getElementById('ecl-auto-help'),
            eclLockedHelp: document.getElementById('ecl-locked-help'),
            minVersion: document.getElementById('min-version'),
            reset: document.getElementById('reset-customization'),
            presetThumbs: new Map()
        };

        els.presetRadios.forEach(radio => {
            const label = presetPicker.querySelector(`label[for="${radio.id}"]`);
            const img = label ? label.querySelector('img.preset-thumb') : null;
            if (img) els.presetThumbs.set(radio.value, img);
        });

        state.colors = [
            colorField('fgColor', document.getElementById('qr-fg-color'),
                document.getElementById('qr-fg-color-text'), document.getElementById('qr-fg-color-label')),
            colorField('fgColor2', document.getElementById('qr-fg-color2'),
                document.getElementById('qr-fg-color2-text'), document.getElementById('qr-fg-color2-label')),
            colorField('bgColor', document.getElementById('qr-bg-color'),
                document.getElementById('qr-bg-color-text'), document.getElementById('qr-bg-color-label')),
            colorField('cornerOuterColor', document.getElementById('corner-outer-color'),
                document.getElementById('corner-outer-color-text'), document.getElementById('corner-outer-color-label')),
            colorField('cornerInnerColor', document.getElementById('corner-inner-color'),
                document.getElementById('corner-inner-color-text'), document.getElementById('corner-inner-color-label')),
            colorField('frameColor', document.getElementById('frame-color'),
                document.getElementById('frame-color-text'), document.getElementById('frame-color-label'))
        ].filter(field => field.picker && field.text);

        state.sliders = [
            slider('gradientAngle', document.getElementById('gradient-angle'),
                document.getElementById('gradient-angle-value'), value => `${formatNumber(value, 0)}°`),
            slider('logoSize', document.getElementById('qr-logo-size'),
                document.getElementById('qr-logo-size-value'), value => formatPercent(value)),
            slider('logoPadding', document.getElementById('qr-logo-margin'),
                document.getElementById('qr-logo-margin-value'),
                value => t('units.modules', { count: formatNumber(value, 2) })),
            slider('margin', document.getElementById('qr-margin'),
                document.getElementById('qr-margin-value'),
                value => t('units.modules', { count: formatNumber(value, 0) }))
        ].filter(item => item.input);

        state.radios = [
            ['fill', 'fill'],
            ['gradient-type', 'gradientType'],
            ['frame-style', 'frameStyle'],
            ['dot-style', 'dotStyle'],
            ['corner-square-style', 'cornerSquareStyle'],
            ['corner-dot-style', 'cornerDotStyle']
        ].map(([name, key]) => ({
            key,
            inputs: Array.from(els.panel.querySelectorAll(`input[type="radio"][name="${name}"]`))
        })).filter(group => group.inputs.length);

        return els;
    }

    // --- Reflecting the design into the controls ---

    /**
     * @description Writes a design color into its picker and hex field. With
     * force (reset, undo, fixes) a rejected hex value left in the field is
     * replaced even when the color itself did not change.
     */
    function syncColor(field, value, force) {
        if (!force && field.synced === value) return;
        field.synced = value;
        if (field.picker.value !== value) field.picker.value = value;
        const typing = document.activeElement === field.text && normalizeHex(field.text.value) === value;
        if (!typing) {
            field.text.value = value;
            setInvalid(field.text, false);
        }
    }

    /**
     * @description Writes the slider's value text (visible and aria-valuetext)
     * and the --fill percentage that design.css uses for the filled track.
     */
    function renderSliderText(item, value) {
        const text = item.format(value);
        item.input.setAttribute('aria-valuetext', text);
        if (item.output) item.output.textContent = text;

        const min = Number(item.input.min) || 0;
        const max = Number(item.input.max) || 100;
        const fill = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
        item.input.style.setProperty('--fill', `${Math.round(fill * 10) / 10}%`);
    }

    function syncSlider(item, value) {
        if (typeof value !== 'number') return;
        if (Number(item.input.value) !== value) item.input.value = String(value);
        renderSliderText(item, value);
    }

    function syncPresets(design) {
        const presets = globalThis.QRTurboPresets;
        const id = presets ? presets.match(design) : null;
        state.els.presetRadios.forEach(radio => {
            radio.checked = radio.value === id;
        });
        if (state.els.presetCustomTag) state.els.presetCustomTag.hidden = id !== null;
        state.els.presetPicker.classList.toggle('is-transparent', Boolean(design.transparentBackground));
    }

    /**
     * @description Error correction follows the design, except on the Payment
     * tab, where the select is disabled at M and the locked help is shown.
     */
    function renderEcl(design) {
        const els = state.els;
        if (!els.ecl) return;
        const locked = state.tab === PAYMENT_TAB;
        const value = locked ? 'M' : design.errorCorrection;
        els.ecl.disabled = locked;
        if (els.ecl.value !== value) els.ecl.value = value;
        if (els.eclAutoHelp) els.eclAutoHelp.hidden = locked;
        if (els.eclLockedHelp) els.eclLockedHelp.hidden = !locked;
    }

    /**
     * @description The minimum version follows the design, except on the
     * Payment tab: payment codes stop at version 13 (EPC069-12), so higher
     * versions are disabled there and a higher saved floor shows as 13, the
     * version the controller uses. The design keeps its value for the other
     * tabs.
     */
    function renderMinVersion(design) {
        const select = state.els.minVersion;
        if (!select) return;
        const rules = globalThis.QRTurboRules;
        const cap = state.tab === PAYMENT_TAB && rules ? rules.PAYMENT_MAX_VERSION : null;
        Array.from(select.options || []).forEach(option => {
            const disabled = cap !== null && Number(option.value) > cap;
            if (option.disabled !== disabled) option.disabled = disabled;
        });
        const value = String(cap !== null ? Math.min(design.minVersion, cap) : design.minVersion);
        if (select.value !== value) select.value = value;
    }

    function renderLogo(logo) {
        const els = state.els;
        const hasLogo = Boolean(logo);
        if (els.logoPreview) els.logoPreview.hidden = !hasLogo;
        if (els.logoRemoveBtn) els.logoRemoveBtn.hidden = !hasLogo;
        if (els.logoControls) els.logoControls.hidden = !hasLogo;
        if (els.logoFilename) els.logoFilename.textContent = hasLogo ? String(logo.name || '') : '';
        if (els.logoPreviewImg) {
            if (hasLogo) {
                if (els.logoPreviewImg.getAttribute('src') !== logo.dataUrl) els.logoPreviewImg.src = logo.dataUrl;
            } else {
                els.logoPreviewImg.removeAttribute('src');
            }
        }
        if (els.logoDropzone) els.logoDropzone.classList.toggle('has-logo', hasLogo);
        if (!hasLogo && state.logoNote) {
            state.logoNote = null;
            renderLogoMessages();
        }
    }

    /**
     * @description Puts every control into the state of the given design.
     * Hex fields the user is typing in are left alone.
     */
    function syncControls(design, force) {
        const els = state.els;

        syncPresets(design);
        state.colors.forEach(field => syncColor(field, design[field.key], force));
        state.radios.forEach(group => {
            group.inputs.forEach(input => {
                input.checked = input.value === design[group.key];
            });
        });
        state.sliders.forEach(item => syncSlider(item, design[item.key]));

        if (els.gradientOptions) els.gradientOptions.hidden = design.fill !== 'gradient';
        if (els.gradientAngleGroup) els.gradientAngleGroup.hidden = design.gradientType === 'radial';
        // A transparent code has no background color to edit or swap.
        const transparent = Boolean(design.transparentBackground);
        if (els.transparent) els.transparent.checked = transparent;
        if (els.swap) els.swap.disabled = transparent;
        state.colors.filter(field => field.key === 'bgColor').forEach(field => {
            field.picker.disabled = transparent;
            field.text.disabled = transparent;
        });
        if (els.customCorners) els.customCorners.checked = Boolean(design.customCorners);
        if (els.cornerColors) els.cornerColors.hidden = !design.customCorners;
        if (els.frameOptions) els.frameOptions.hidden = design.frameStyle === 'none';
        if (els.frameText && els.frameText.value !== design.frameText && document.activeElement !== els.frameText) {
            els.frameText.value = design.frameText;
        }
        renderLogo(design.logo);
        renderEcl(design);
        renderMinVersion(design);
    }

    function onDesign(detail) {
        const design = (detail && detail.design) || state.app.getDesign();
        const source = detail && detail.source;
        const changed = detail && Array.isArray(detail.changed) ? detail.changed : THUMB_KEYS;
        if (design.customCorners) state.cornersSeeded = true;
        if (source !== 'reset') state.resetUndo = null;
        // A logo from Undo or a fix replaces any earlier upload error.
        if (changed.includes('logo') && state.logoErrorKey) {
            state.logoErrorKey = null;
            renderLogoMessages();
        }
        syncControls(design, source !== 'user');

        if (changed.some(key => THUMB_KEYS.includes(key))) scheduleThumbnails(THUMB_DELAY);
    }

    // --- Runtime text ---

    /**
     * @description Hex inputs get "<label>, hex value" as their name. The
     * markup keeps aria-labelledby as the fallback before this runs.
     */
    function applyHexLabels() {
        state.colors.forEach(field => {
            const name = field.label ? field.label.textContent.trim() : '';
            field.text.removeAttribute('aria-labelledby');
            field.text.setAttribute('aria-label', t('aria.hexValue', { name }));
        });
    }

    function renderLogoMessages() {
        const els = state.els;
        const note = state.logoNote;
        if (els.logoNote) {
            els.logoNote.hidden = !note;
            setText(els.logoNote, note ? t(note.key, { size: formatNumber(note.size, 0) }) : '');
        }
        if (els.logoError) {
            // role="alert": the text is only rewritten when it changes, so a
            // language event does not read the error out again.
            els.logoError.hidden = !state.logoErrorKey;
            setText(els.logoError, state.logoErrorKey ? t(state.logoErrorKey) : '');
        }
        if (els.logoSelectBtn) {
            const describedBy = state.logoErrorKey ? 'logo-error logo-drop-hint' : 'logo-drop-hint';
            els.logoSelectBtn.setAttribute('aria-describedby', describedBy);
        }
    }

    function applyRuntimeText() {
        if (!state.els) return;
        applyHexLabels();
        const design = state.app.getDesign();
        state.sliders.forEach(item => renderSliderText(item, design[item.key]));
        renderLogoMessages();
        renderEcl(design);
        // The default frame label is localized; this is a no-op when the
        // thumbnails already show the current text.
        scheduleThumbnails(THUMB_DELAY);
    }

    // --- Presets and thumbnails ---

    function bindPresets() {
        const presets = globalThis.QRTurboPresets;
        state.els.presetRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (!radio.checked || !presets) return;
                const entry = presets.LIST.find(item => item.id === radio.value);
                if (!entry) return;
                state.app.updateDesign({ ...entry.patch }, { source: 'preset', reason: 'discrete' });
            });
        });
    }

    function thumbnailSignature(design) {
        const frameText = typeof getFrameText === 'function' ? getFrameText(design) : design.frameText;
        return JSON.stringify([...THUMB_KEYS.map(key => design[key]), frameText]);
    }

    /**
     * @description The root <svg> needs a viewBox to scale inside an <img>.
     * The library writes only width and height.
     */
    function scalableSvg(markup) {
        return String(markup).replace(/<svg\b([^>]*)>/i, (match, attributes) => {
            let attrs = attributes;
            if (!/\sxmlns="/.test(attrs)) attrs = ` xmlns="http://www.w3.org/2000/svg"${attrs}`;
            if (!/\sviewBox="/.test(attrs)) {
                const width = /\swidth="([0-9.]+)/.exec(attrs);
                const height = /\sheight="([0-9.]+)/.exec(attrs);
                if (width && height) attrs += ` viewBox="0 0 ${width[1]} ${height[1]}"`;
            }
            return `<svg${attrs}>`;
        });
    }

    async function renderThumbnailMarkup(engine, design) {
        const result = await engine.render(design, THUMB_TEXT, {
            type: 'svg',
            quietZone: THUMB_QUIET_ZONE,
            typeNumber: THUMB_VERSION,
            ecl: THUMB_ECL,
            timeoutMs: THUMB_TIMEOUT
        });
        let markup = result && result.svgMarkup;
        if (!markup) throw new Error('No SVG markup');

        if (design.frameStyle !== 'none' && typeof buildFramedSvg === 'function') {
            const layout = getFrameLayout(1024, design.frameStyle);
            const text = getFrameText(design);
            const fontSize = fitFrameFontSize(text, layout.label.fontSize, layout.label.maxWidth, measureFrameText);
            markup = buildFramedSvg(markup, layout, { text, fontSize, colors: getFrameColors(layout, design) });
        }
        return scalableSvg(markup);
    }

    function setThumbnail(id, img, markup) {
        if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
        const previous = state.thumbUrls.get(id);
        img.src = url;
        state.thumbUrls.set(id, url);
        if (previous) URL.revokeObjectURL(previous);
    }

    /**
     * @description Renders the six preset thumbnails in the current colors,
     * one per idle slice, as blob: SVG images so their SVG ids stay isolated.
     * A newer run cancels an older one.
     */
    async function renderThumbnails() {
        state.thumbIdle = null;
        const engine = globalThis.QRTurboEngine;
        const presets = globalThis.QRTurboPresets;
        if (!state.app || !engine || typeof engine.render !== 'function' || !presets) return;

        const design = state.app.getDesign();
        const signature = thumbnailSignature(design);
        if (signature === state.thumbSignature || signature === state.thumbPending) return;

        const run = ++state.thumbRun;
        state.thumbPending = signature;
        // The run replaces the images one by one, so they no longer show the
        // last finished design. Going back to that design starts a new run,
        // which cancels this one, instead of being skipped.
        state.thumbSignature = '';
        const base = { ...design, logo: null, margin: THUMB_QUIET_ZONE, minVersion: 0 };

        for (const entry of presets.LIST) {
            const img = state.els.presetThumbs.get(entry.id);
            if (!img) continue;
            let markup;
            try {
                markup = await renderThumbnailMarkup(engine, presets.apply(base, entry.id));
            } catch (error) {
                if (run === state.thumbRun) {
                    state.thumbPending = '';
                    if (!state.thumbWarned) {
                        state.thumbWarned = true;
                        console.warn('Preset thumbnails could not be rendered:', error);
                    }
                }
                return;
            }
            if (run !== state.thumbRun) return;
            setThumbnail(entry.id, img, markup);
            await nextIdle();
            if (run !== state.thumbRun) return;
        }

        state.thumbSignature = signature;
        state.thumbPending = '';
    }

    function scheduleThumbnails(delay) {
        clearTimeout(state.thumbTimer);
        cancelIdle(state.thumbIdle);
        state.thumbIdle = null;
        state.thumbTimer = setTimeout(() => {
            state.thumbTimer = null;
            state.thumbIdle = requestIdle(() => {
                renderThumbnails().catch(error => console.warn('Preset thumbnails failed:', error));
            });
        }, delay);
    }

    // --- Colors ---

    function onPicker(field, reason) {
        const hex = normalizeHex(field.picker.value);
        if (!hex) return;
        field.text.value = hex;
        setInvalid(field.text, false);
        update({ [field.key]: hex }, reason);
    }

    function onHexInput(field) {
        const raw = field.text.value.trim();
        const hex = normalizeHex(raw);
        if (hex) {
            setInvalid(field.text, false);
            if (field.picker.value !== hex) field.picker.value = hex;
            update({ [field.key]: hex }, 'typing');
            return;
        }
        // Calm while the value can still become valid ('#1a' on the way to '#1a2b3c').
        setInvalid(field.text, raw !== '' && !HEX_PARTIAL.test(raw));
    }

    function onHexCommit(field) {
        const hex = normalizeHex(field.text.value);
        if (!hex) {
            setInvalid(field.text, true);
            return;
        }
        field.text.value = hex;
        setInvalid(field.text, false);
        update({ [field.key]: hex }, 'discrete');
    }

    function bindColors() {
        const els = state.els;

        state.colors.forEach(field => {
            field.picker.addEventListener('input', () => onPicker(field, 'drag'));
            field.picker.addEventListener('change', () => onPicker(field, 'discrete'));
            field.text.addEventListener('input', () => onHexInput(field));
            field.text.addEventListener('change', () => onHexCommit(field));
        });

        els.transparent?.addEventListener('change', () => {
            update({ transparentBackground: els.transparent.checked });
        });

        els.swap?.addEventListener('click', () => {
            const design = state.app.getDesign();
            if (design.transparentBackground) return;
            update({ fgColor: design.bgColor, bgColor: design.fgColor });
        });

        // Corner colors start from the current code color the first time
        // they are shown.
        els.customCorners?.addEventListener('change', () => {
            const enabled = els.customCorners.checked;
            const patch = { customCorners: enabled };
            if (enabled && !state.cornersSeeded) {
                const fgColor = state.app.getDesign().fgColor;
                patch.cornerOuterColor = fgColor;
                patch.cornerInnerColor = fgColor;
            }
            if (enabled) state.cornersSeeded = true;
            update(patch);
        });
    }

    // --- Radios, sliders and selects ---

    function bindChoices() {
        const els = state.els;

        state.radios.forEach(group => {
            group.inputs.forEach(input => {
                input.addEventListener('change', () => {
                    if (input.checked) update({ [group.key]: input.value });
                });
            });
        });

        state.sliders.forEach(item => {
            const onChange = reason => {
                const value = Number(item.input.value);
                if (!Number.isFinite(value)) return;
                renderSliderText(item, value);
                update({ [item.key]: value }, reason);
            };
            item.input.addEventListener('input', () => onChange('drag'));
            item.input.addEventListener('change', () => onChange('discrete'));
        });

        els.frameText?.addEventListener('input', () => {
            update({ frameText: els.frameText.value }, 'typing');
        });

        els.ecl?.addEventListener('change', () => {
            if (state.tab === PAYMENT_TAB) return;
            update({ errorCorrection: els.ecl.value });
        });

        els.minVersion?.addEventListener('change', () => {
            const value = Number(els.minVersion.value);
            if (Number.isInteger(value)) update({ minVersion: value });
        });
    }

    /**
     * @description WebKit drops :focus-visible when the arrow keys move the
     * choice in a radio group. QRTurboUI marks such a group with
     * .is-keyboard (one document listener for the whole page), so
     * design.css keeps the focus ring on the focused option.
     */
    function bindKeyboardFocus() {
        const ui = globalThis.QRTurboUI;
        if (ui && typeof ui.trackKeyboardRadios === 'function') ui.trackKeyboardRadios();
    }

    // --- Logo ---

    function isLogoCandidate(file) {
        // An empty type is left to prepareLogo(), which sniffs the bytes.
        return Boolean(file) && (!file.type || /^image\//i.test(file.type));
    }

    function clearLogoMessages() {
        state.logoNote = null;
        state.logoErrorKey = null;
        renderLogoMessages();
    }

    function showLogoError(key) {
        state.logoNote = null;
        state.logoErrorKey = LOGO_ERROR_KEYS[key] || 'logo.readFailed';
        renderLogoMessages();
    }

    function setLogoBusy(busy) {
        const zone = state.els.logoDropzone;
        if (!zone) return;
        zone.classList.toggle('is-busy', busy);
        if (busy) {
            zone.setAttribute('aria-busy', 'true');
        } else {
            zone.removeAttribute('aria-busy');
        }
    }

    /**
     * @description Validates and prepares a logo file (QRTurboEngine.prepareLogo)
     * and puts it into the design. A newer file or a removal wins over an
     * older file that is still being read.
     */
    async function useLogoFile(file) {
        const token = ++state.logoToken;
        clearLogoMessages();
        if (!isLogoCandidate(file)) {
            showLogoError('logo.readFailed');
            return;
        }

        const engine = globalThis.QRTurboEngine;
        setLogoBusy(true);
        let logo;
        try {
            logo = await engine.prepareLogo(file);
        } catch (error) {
            if (token !== state.logoToken) return;
            setLogoBusy(false);
            showLogoError(error && error.message);
            return;
        }
        if (token !== state.logoToken) return;
        setLogoBusy(false);

        state.app.updateDesign({ logo }, { source: 'user', reason: 'discrete' });
        if (logo && logo.optimized) {
            state.logoNote = { key: 'logo.optimized', size: Math.max(logo.width || 0, logo.height || 0) };
            renderLogoMessages();
            const ui = globalThis.QRTurboUI;
            if (ui && typeof ui.announce === 'function' && state.els.logoNote) {
                ui.announce(state.els.logoNote.textContent);
            }
        }
    }

    function removeLogo() {
        state.logoToken += 1;
        setLogoBusy(false);
        clearLogoMessages();
        update({ logo: null });
        state.els.logoSelectBtn?.focus();
    }

    function bindLogo() {
        const els = state.els;

        els.logoSelectBtn?.addEventListener('click', () => els.logoInput?.click());
        els.logoInput?.addEventListener('change', () => {
            const file = els.logoInput.files && els.logoInput.files[0];
            // Clearing the input lets the same file be chosen again later.
            els.logoInput.value = '';
            if (file) useLogoFile(file);
        });
        els.logoRemoveBtn?.addEventListener('click', removeLogo);

        if (!els.logoDropzone) return;
        els.logoDropzone.addEventListener('click', event => {
            if (event.target.closest('button, input, a, img')) return;
            els.logoInput?.click();
        });

        // The kit handles the drag overlay, the drop and document paste.
        // Several files are allowed so that the first image among them wins.
        const ui = globalThis.QRTurboUI;
        if (ui && typeof ui.dropzone === 'function') {
            ui.dropzone(els.logoDropzone, {
                accept: isLogoCandidate,
                multiple: true,
                onFiles: files => {
                    if (modalDialogOpen()) return;
                    if (files && files[0]) useLogoFile(files[0]);
                },
                onReject: () => {
                    if (modalDialogOpen()) return;
                    state.logoToken += 1;
                    setLogoBusy(false);
                    showLogoError('logo.readFailed');
                },
                paste: true
            });
        }
    }

    // --- Disclosure, tabs and reset ---

    function bindDisclosure() {
        const els = state.els;
        const ui = globalThis.QRTurboUI;
        if (els.customizeToggle && els.customizePanel && ui && typeof ui.disclosure === 'function') {
            state.disclosure = ui.disclosure(els.customizeToggle, els.customizePanel);
        }
    }

    function isDefaultDesign(design) {
        const defaults = state.app.defaultDesign();
        return Object.keys(defaults).every(key => Object.is(design[key], defaults[key]));
    }

    /**
     * @description Restores the default design (not the content and not the
     * export options) and offers Undo in a toast for 8 seconds.
     */
    function resetDesign() {
        const app = state.app;
        const current = app.getDesign();
        // A second Reset (the design is already the default) keeps the Undo
        // of the first one instead of replacing it with a toast without Undo.
        const previous = isDefaultDesign(current) ? state.resetUndo : current;

        state.logoToken += 1;
        state.cornersSeeded = false;
        setLogoBusy(false);
        clearLogoMessages();
        app.replaceDesign(app.defaultDesign(), { source: 'reset', reason: 'discrete' });
        state.resetUndo = previous;

        const ui = globalThis.QRTurboUI;
        if (!ui || typeof ui.toast !== 'function') return;
        if (state.resetToast) state.resetToast.dismiss();
        state.resetToast = ui.toast(t('toast.designReset'), previous
            ? {
                tone: 'info',
                actionLabel: t('actions.undo'),
                onAction: () => app.replaceDesign(previous, { source: 'undo', reason: 'discrete' }),
                timeoutMs: UNDO_TIMEOUT
            }
            : { tone: 'info' });
    }

    function onTab(detail) {
        state.tab = (detail && detail.tab) || activeTabName();
        renderEcl(state.app.getDesign());
        renderMinVersion(state.app.getDesign());
    }

    // --- Startup ---

    /**
     * @description Wires the design panel to the app. Safe to call once; does
     * nothing on pages without the panel.
     */
    function init(app) {
        if (state.app || !app || typeof document === 'undefined') return;
        const els = queryElements();
        if (!els) return;

        state.app = app;
        state.els = els;
        state.tab = activeTabName();

        bindPresets();
        bindColors();
        bindChoices();
        bindKeyboardFocus();
        bindLogo();
        bindDisclosure();
        els.reset?.addEventListener('click', resetDesign);

        app.on('design', onDesign);
        app.on('tab', onTab);
        app.on('i18n', applyRuntimeText);

        const design = app.getDesign();
        if (design.customCorners) state.cornersSeeded = true;
        syncControls(design, true);
        applyHexLabels();
        renderLogoMessages();
        scheduleThumbnails(0);
    }

    const api = {
        init
    };

    globalThis.QRTurboDesignUI = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
