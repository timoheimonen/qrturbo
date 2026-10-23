// QRTurbo.app - Application controller (QRTurboApp)
//
// Startup: controller.js is the last deferred script and the only file that
// listens for DOMContentLoaded. app.js, frame.js and the modules only declare
// functions; QRTurboApp.init() starts everything in this order:
//   1. setupThemeSelector(), registerServiceWorker(), QRTurboUI.init()
//   2. the saved export options (localStorage 'qrturbo_export')
//   3. the preview stage and calm validation (this file)
//   4. initContentForms(app) from app.js
//   5. QRTurboDesignUI.init(app), QRTurboExportUI.init(app), QRTurboScan.init(app)
//   6. the 'qrturbo:i18n' DOM event from core.js, re-emitted as 'i18n'
//   7. the first preview
// Each step is guarded, so one failing module never stops the others.
//
// core.js can finish its first English pass before init() runs. Modules
// therefore read t() while they initialize and listen for 'i18n' afterwards.
//
// Events: 'tab', 'design', 'export', 'preview-start' ({revision}),
// 'preview-ready' (Snapshot), 'preview-empty' ({reason: 'empty'|'invalid'|
// 'tooLong'|'error', fieldId}), 'stage' ({state, previous}), 'scan'
// (ScanResult), 'i18n'.
//
// Preview pipeline, per revision: debounce, collectContent(false), byte
// string, effective level and capacity analysis, one library render at the
// predicted version, frame, hardened SVG, then one atomic swap into
// #qr-canvas-container. Stale revisions are dropped, and only one render runs
// at a time. #qr-stage[data-state] is one of empty, pending, ready, invalid,
// tooLong and error (SPEC B.5).
(function () {
    'use strict';

    const EXPORT_STORAGE_KEY = 'qrturbo_export';
    const TYPING_DELAY = 150;
    const TYPING_DELAY_DENSE = 250;
    const DENSE_VERSION = 25;
    const DRAG_FALLBACK_DELAY = 16;
    // A dense preview takes WebKit over 100 ms to swap in, so following a
    // slider every frame stalls the drag. From this version on, a drag
    // updates the preview once the pointer rests instead.
    const DRAG_DENSE_VERSION = 20;
    const DRAG_DENSE_DELAY = TYPING_DELAY;
    const REVEAL_IDLE_DELAY = 1200;
    const FRAME_LAYOUT_SIZE = 1024;

    const HEX_PATTERN = /^#[0-9a-f]{6}$/i;
    const DESIGN_CHOICES = {
        fill: ['solid', 'gradient'],
        gradientType: ['linear', 'radial'],
        errorCorrection: ['auto', 'L', 'M', 'Q', 'H'],
        dotStyle: ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'],
        cornerSquareStyle: ['square', 'extra-rounded', 'dot'],
        cornerDotStyle: ['square', 'dot'],
        frameStyle: ['none', 'banner-bottom', 'banner-top', 'outline']
    };
    const DESIGN_RANGES = {
        gradientAngle: [0, 345],
        margin: [4, 12],
        logoSize: [0.2, 0.5],
        logoPadding: [0, 2],
        minVersion: [0, 40]
    };
    const DESIGN_INTEGERS = ['margin', 'minVersion'];
    const DESIGN_COLORS = ['fgColor', 'bgColor', 'fgColor2', 'cornerOuterColor', 'cornerInnerColor', 'frameColor'];

    // The numeric limits live in QRTurboRules.EXPORT_LIMITS (rules.js loads
    // first), shared with the export panel and the exporter.
    const EXPORT_LIMITS = globalThis.QRTurboRules.EXPORT_LIMITS;
    const EXPORT_FORMATS = ['png', 'jpg', 'webp', 'svg', 'pdf', 'eps'];
    const PIXEL_SIZES = [...EXPORT_LIMITS.pixels.presets, 'custom'];
    const PRINT_UNITS = EXPORT_LIMITS.print;
    const PRINT_DPIS = EXPORT_LIMITS.dpis;
    const PAGES = ['fit', 'a4', 'letter'];
    const COLOR_MODES = ['rgb', 'cmyk', 'k'];

    // Runtime keys are complete literals, so the i18n coverage test sees them.
    const EMPTY_TEXT_KEYS = {
        URLText: 'empty.urlText',
        VCard: 'empty.vcard',
        SMSPhone: 'empty.smsPhone',
        Wifi: 'empty.wifi',
        Email: 'empty.email',
        CalendarEvent: 'empty.calendarEvent',
        Location: 'empty.location',
        SocialMedia: 'empty.socialMedia',
        WhatsApp: 'empty.whatsapp',
        Payment: 'empty.payment',
        MeCard: 'empty.mecard',
        AppLink: 'empty.appLink'
    };
    const TAB_LABEL_KEYS = {
        URLText: 'tabs.urlText',
        VCard: 'tabs.vcard',
        SMSPhone: 'tabs.smsPhone',
        Wifi: 'tabs.wifi',
        Email: 'tabs.email',
        CalendarEvent: 'tabs.calendarEvent',
        Location: 'tabs.location',
        SocialMedia: 'tabs.socialMedia',
        WhatsApp: 'tabs.whatsapp',
        Payment: 'tabs.payment',
        MeCard: 'tabs.mecard',
        AppLink: 'tabs.appLink'
    };
    const USAGE_KEYS = {
        byte: 'capacity.usageBytes',
        alphanumeric: 'capacity.usageChars',
        numeric: 'capacity.usageDigits'
    };

    const listeners = new Map();
    const state = {
        initialized: false,
        design: Object.freeze(defaultDesign()),
        exportOptions: freezeExportOptions(defaultExportOptions()),
        // Preview revisions. settledRevision is the last one that finished.
        revision: 0,
        settledRevision: 0,
        timer: null,
        frame: null,
        running: false,
        queued: false,
        waiters: [],
        // The ready Snapshot (kept while the next revision is pending), and
        // the Snapshot whose artwork is in #qr-canvas-container.
        snapshot: null,
        artwork: null,
        stage: 'empty',
        settledStage: 'empty',
        retrying: false,
        failure: null,
        tooLong: null,
        lastVersion: 0,
        offscreen: 0,
        // Calm validation: edited field ids, the idle timer, and the error
        // that is currently shown in #form-error ({ fieldId, errorKey }).
        dirty: new Set(),
        idleTimer: null,
        revealed: null,
        numberFormat: null
    };

    /**
     * @description The default Design (SPEC C.3). Returns a new object.
     */
    function defaultDesign() {
        return {
            fgColor: '#000000',
            bgColor: '#ffffff',
            transparentBackground: false,
            fill: 'solid',
            fgColor2: '#2563eb',
            gradientType: 'linear',
            gradientAngle: 45,
            customCorners: false,
            cornerOuterColor: '#000000',
            cornerInnerColor: '#000000',
            errorCorrection: 'auto',
            dotStyle: 'square',
            cornerSquareStyle: 'extra-rounded',
            cornerDotStyle: 'dot',
            margin: 4,
            logo: null,
            logoSize: 0.4,
            logoPadding: 0.5,
            frameStyle: 'none',
            frameText: '',
            frameColor: '#000000',
            minVersion: 0
        };
    }

    /**
     * @description The default print width: 2 in for US English browsers,
     * 50 mm everywhere else (SPEC B.8).
     */
    function defaultPrintSize() {
        const language = typeof navigator !== 'undefined' ? String(navigator.language || '') : '';
        return language.toLowerCase() === 'en-us'
            ? { unit: 'in', width: PRINT_UNITS.in.fallback }
            : { unit: 'mm', width: PRINT_UNITS.mm.fallback };
    }

    /**
     * @description The default ExportOptions (SPEC C.3). Returns a new object.
     */
    function defaultExportOptions() {
        const print = defaultPrintSize();
        return {
            v: 1,
            format: 'png',
            pixelSize: 1024,
            customPixels: 1024,
            print: { enabled: false, unit: print.unit, width: print.width, dpi: 300 },
            page: 'fit',
            colorMode: 'rgb'
        };
    }

    // --- Event bus ---

    function on(event, fn) {
        if (typeof fn !== 'function') return () => {};
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(fn);
        return () => listeners.get(event)?.delete(fn);
    }

    function emit(event, detail) {
        const handlers = listeners.get(event);
        if (!handlers) return;
        [...handlers].forEach(handler => {
            try {
                handler(detail);
            } catch (error) {
                console.error(`QRTurboApp "${event}" listener failed:`, error);
            }
        });
    }

    // --- Small helpers ---

    function el(id) {
        return typeof document !== 'undefined' ? document.getElementById(id) : null;
    }

    function translate(key, vars) {
        return typeof t === 'function' ? t(key, vars) : key;
    }

    // Writes only real changes, so a refresh on every keystroke does not
    // replace unchanged text nodes.
    function setText(node, text) {
        if (node && node.textContent !== text) node.textContent = text;
    }

    function currentLanguage() {
        return typeof currentLang === 'string' && currentLang ? currentLang : 'en';
    }

    /**
     * @description Formats a whole number for the page language with
     * Intl.NumberFormat, for example 2,331 in English and 2 331 in Finnish.
     */
    function formatInteger(value) {
        const language = currentLanguage();
        try {
            if (!state.numberFormat || state.numberFormat.language !== language) {
                state.numberFormat = { language, format: new Intl.NumberFormat(language) };
            }
            return state.numberFormat.format.format(value);
        } catch (error) {
            return String(value);
        }
    }

    // On a non-English page, t() falls back to English until core.js has
    // loaded the locale; the 'qrturbo:i18n' event follows once it has.
    function languageReady() {
        const language = currentLanguage();
        try {
            return language === 'en' || Boolean(typeof translations !== 'undefined' && translations[language]);
        } catch (error) {
            return true;
        }
    }

    function activeTab() {
        try {
            return typeof getActiveTabName === 'function' ? getActiveTabName() : null;
        } catch (error) {
            return null;
        }
    }

    function prefersReducedMotion() {
        return typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function deepFreeze(value) {
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            Object.values(value).forEach(deepFreeze);
            Object.freeze(value);
        }
        return value;
    }

    function codedError(messageKey, code, cause) {
        const error = new Error(messageKey);
        error.code = code;
        if (cause) error.cause = cause;
        return error;
    }

    // --- Design ---

    /**
     * @description Keeps the known Design keys whose values are valid. Colors
     * are normalized to lowercase '#rrggbb'.
     */
    function sanitizeDesign(patch) {
        const defaults = defaultDesign();
        const clean = {};
        if (!patch || typeof patch !== 'object') return clean;

        Object.keys(patch).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(defaults, key)) return;
            const value = patch[key];

            if (key === 'logo') {
                if (value === null || (typeof value === 'object' && typeof value.dataUrl === 'string')) {
                    clean.logo = value === null ? null : Object.freeze({ ...value });
                }
            } else if (DESIGN_COLORS.includes(key)) {
                if (typeof value === 'string' && HEX_PATTERN.test(value)) clean[key] = value.toLowerCase();
            } else if (DESIGN_CHOICES[key]) {
                if (DESIGN_CHOICES[key].includes(value)) clean[key] = value;
            } else if (DESIGN_RANGES[key]) {
                const [min, max] = DESIGN_RANGES[key];
                const isNumber = typeof value === 'number' && value >= min && value <= max;
                if (isNumber && (!DESIGN_INTEGERS.includes(key) || Number.isInteger(value))) clean[key] = value;
            } else if (typeof value === typeof defaults[key]) {
                clean[key] = value;
            }
        });

        return clean;
    }

    function getDesign() {
        return state.design;
    }

    function commitDesign(next, o) {
        const previous = state.design;
        const changed = Object.keys(next).filter(key => !Object.is(next[key], previous[key]));
        if (!changed.length) return;

        state.design = Object.freeze(next);
        emit('design', { design: state.design, previous, changed, source: o?.source || 'user' });
        schedulePreview({ reason: o?.reason || 'discrete' });
    }

    /**
     * @description Applies a partial Design. Unknown keys and invalid values
     * are ignored. Emits 'design' with { design, previous, changed, source }.
     */
    function updateDesign(patch, o = {}) {
        commitDesign({ ...state.design, ...sanitizeDesign(patch) }, o);
    }

    function replaceDesign(design, o = {}) {
        commitDesign({ ...defaultDesign(), ...sanitizeDesign(design) }, o);
    }

    // --- Export options ---

    function freezeExportOptions(options) {
        return Object.freeze({ ...options, print: Object.freeze({ ...options.print }) });
    }

    /**
     * @description Validates every field against a whitelist. Invalid fields
     * keep the fallback value.
     */
    function sanitizeExportOptions(candidate, fallback) {
        const source = candidate && typeof candidate === 'object' ? candidate : {};
        const print = source.print && typeof source.print === 'object' ? source.print : {};
        const pick = (value, allowed, current) => (allowed.includes(value) ? value : current);

        const unit = pick(print.unit, Object.keys(PRINT_UNITS), fallback.print.unit);
        const limits = PRINT_UNITS[unit];
        const isWidth = value => typeof value === 'number' && Number.isFinite(value)
            && value >= limits.min && value <= limits.max;
        const width = isWidth(print.width)
            ? print.width
            : (unit === fallback.print.unit && isWidth(fallback.print.width) ? fallback.print.width : limits.fallback);
        const isPixels = value => Number.isInteger(value)
            && value >= EXPORT_LIMITS.pixels.min && value <= EXPORT_LIMITS.pixels.max;
        const customPixels = isPixels(source.customPixels) ? source.customPixels : fallback.customPixels;

        return {
            v: 1,
            format: pick(source.format, EXPORT_FORMATS, fallback.format),
            pixelSize: pick(source.pixelSize, PIXEL_SIZES, fallback.pixelSize),
            customPixels,
            print: {
                enabled: typeof print.enabled === 'boolean' ? print.enabled : fallback.print.enabled,
                unit,
                width,
                dpi: pick(print.dpi, PRINT_DPIS, fallback.print.dpi)
            },
            page: pick(source.page, PAGES, fallback.page),
            colorMode: pick(source.colorMode, COLOR_MODES, fallback.colorMode)
        };
    }

    function restoreExportOptions() {
        try {
            const saved = JSON.parse(localStorage.getItem(EXPORT_STORAGE_KEY) || 'null');
            if (saved && saved.v === 1) {
                return freezeExportOptions(sanitizeExportOptions(saved, defaultExportOptions()));
            }
        } catch (error) {
            console.warn('Saved download settings are unavailable:', error);
        }
        return freezeExportOptions(defaultExportOptions());
    }

    function persistExportOptions(options) {
        try {
            localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(options));
        } catch (error) {
            console.warn('localStorage unavailable:', error);
        }
    }

    function getExportOptions() {
        return state.exportOptions;
    }

    /**
     * @description Merges a partial ExportOptions (print is merged too),
     * persists the result and emits 'export' with { options, previous }.
     * Export options never re-render the preview.
     */
    function updateExportOptions(patch) {
        const current = state.exportOptions;
        const source = patch && typeof patch === 'object' ? patch : {};
        const printPatch = source.print && typeof source.print === 'object' ? { ...source.print } : {};
        // A unit change without a new width keeps the same physical size,
        // kept inside the limits of the new unit (10 mm is 0.39 in).
        if (printPatch.unit !== current.print.unit && printPatch.width === undefined
            && Object.prototype.hasOwnProperty.call(PRINT_UNITS, printPatch.unit)) {
            const { min, max } = PRINT_UNITS[printPatch.unit];
            const converted = printPatch.unit === 'in'
                ? Math.round((current.print.width / 25.4) * 100) / 100
                : Math.round(current.print.width * 25.4 * 10) / 10;
            printPatch.width = Math.min(max, Math.max(min, converted));
        }
        const merged = { ...current, ...source, print: { ...current.print, ...printPatch } };
        const next = sanitizeExportOptions(merged, current);
        if (JSON.stringify(next) === JSON.stringify(current)) return;

        state.exportOptions = freezeExportOptions(next);
        persistExportOptions(state.exportOptions);
        emit('export', { options: state.exportOptions, previous: current });
    }

    // --- Content analysis and snapshots (shared by the preview and buildSnapshot) ---

    /**
     * @description The minimum version for a content type (SPEC C.5):
     * an explicit floor or the design's, capped at 13 for Payment.
     */
    function minVersionOf(design, type, override) {
        return globalThis.QRTurboRules.versionFloor(design, type, override);
    }

    /**
     * @description Byte string, effective level (SPEC C.4: Payment is locked
     * to M) and capacity analysis of a successful ContentResult.
     */
    function prepareContent(content, design, minVersion) {
        const bytes = globalThis.QRTurboBytes.byteString(content.payload);
        const { ecl, auto } = globalThis.QRTurboRules.effectiveEcl(design, content.type);
        const analysis = Object.freeze(globalThis.QRTurboCapacity.analyze(bytes, ecl, minVersion));
        return { bytes, ecl, eclAuto: Boolean(auto), analysis };
    }

    function frameSpecFor(design) {
        if (!design.frameStyle || design.frameStyle === 'none') return null;
        const layout = getFrameLayout(FRAME_LAYOUT_SIZE, design.frameStyle);
        if (!layout.framed) return null;
        const text = getFrameText(design);
        const fontSize = fitFrameFontSize(text, layout.label.fontSize, layout.label.maxWidth, measureFrameText);
        return { layout, text, fontSize, colors: getFrameColors(layout, design) };
    }

    /**
     * @description Renders the code, adds the frame, hardens the SVG and
     * returns a frozen Snapshot. Never touches the stage.
     */
    async function composeSnapshot(content, prepared, design, revision, idPrefix) {
        const rendered = await globalThis.QRTurboEngine.render(design, prepared.bytes, {
            type: 'svg',
            quietZone: design.margin,
            typeNumber: prepared.analysis.version,
            ecl: prepared.ecl
        });

        const frame = frameSpecFor(design);
        const markup = frame
            ? buildFramedSvg(rendered.svgMarkup, frame.layout, { text: frame.text, fontSize: frame.fontSize, colors: frame.colors })
            : rendered.svgMarkup;
        // The preview keeps only href on a logo <image>: every engine reads
        // it, and the data: URL is not doubled. Exports keep xlink:href too.
        const previewMarkup = globalThis.QRTurboSvg.harden(markup, {
            idPrefix,
            width: '100%',
            height: '100%',
            xmlDeclaration: false,
            xlinkHref: false
        });

        return Object.freeze({
            revision,
            tab: content.type,
            payload: content.payload,
            bytes: prepared.bytes,
            isSensitive: Boolean(content.isSensitive),
            filenameHint: String(content.filenameHint || ''),
            design,
            ecl: prepared.ecl,
            eclAuto: prepared.eclAuto,
            analysis: prepared.analysis,
            version: rendered.version,
            moduleCount: rendered.moduleCount,
            quietZone: design.margin,
            standardized: rendered.standardized,
            qrSvgMarkup: rendered.svgMarkup,
            frame: deepFreeze(frame),
            previewMarkup,
            matrix: rendered.matrix
        });
    }

    /**
     * @description An off-screen Snapshot for batch rows and other callers:
     * content = { type, payload, isSensitive, filenameHint }, o = { design?,
     * minVersion? }. Uses the same steps as the preview without touching the
     * stage. Off-screen snapshots have negative revisions. Rejects with
     * Error('alerts.dataEmpty'), Error('alerts.dataTooLong') (code 'tooLong')
     * or Error('alerts.generationError') (code 'render').
     */
    async function buildSnapshot(content, o = {}) {
        if (!content || typeof content.payload !== 'string' || !content.payload) {
            throw codedError('alerts.dataEmpty', 'empty');
        }
        const design = o.design
            ? Object.freeze({ ...defaultDesign(), ...sanitizeDesign(o.design) })
            : state.design;
        const normalized = {
            type: String(content.type || 'URLText'),
            payload: content.payload,
            isSensitive: Boolean(content.isSensitive),
            filenameHint: String(content.filenameHint || '')
        };

        const prepared = prepareContent(normalized, design, minVersionOf(design, normalized.type, o.minVersion));
        if (!prepared.analysis.fits) throw codedError('alerts.dataTooLong', 'tooLong');

        state.offscreen += 1;
        const sequence = state.offscreen;
        try {
            return await composeSnapshot(normalized, prepared, design, -sequence, `qb${sequence}-`);
        } catch (error) {
            throw codedError('alerts.generationError', 'render', error);
        }
    }

    // --- Stage view ---

    function placeholderKey() {
        if (state.stage === 'error') return 'empty.error';
        if (state.stage === 'tooLong') return 'empty.tooLong';
        if (state.stage === 'invalid' && state.revealed) return 'empty.invalid';
        return EMPTY_TEXT_KEYS[activeTab()] || 'misc.qrPlaceholder';
    }

    function levelText(ecl, auto) {
        return auto
            ? translate('capacity.levelAuto', { level: ecl })
            : translate('capacity.level', { level: ecl });
    }

    /**
     * @description The QR info readout (SPEC B.6): version, modules and level,
     * plus a meter of the data used against the level's capacity.
     */
    function renderReadout() {
        const info = el('qr-info');
        if (!info) return;
        const text = el('capacity-text');
        const meter = el('capacity-meter');
        const usage = el('capacity-usage');
        const fixButton = el('capacity-fix-btn');
        const setMeter = value => {
            if (meter) meter.value = Math.max(0, Math.min(1, value));
        };

        info.dataset.state = state.stage;

        if (state.stage === 'tooLong' && state.tooLong) {
            const { analysis, ecl, eclAuto, fitsAtL } = state.tooLong;
            info.hidden = false;
            setText(text, levelText(ecl, eclAuto));
            setMeter(1);
            if (usage) {
                setText(usage, translate('capacity.tooLong', {
                    used: formatInteger(analysis.length),
                    level: ecl,
                    max: formatInteger(analysis.maxAtLevel)
                }));
                usage.classList.add('is-danger');
            }
            if (fixButton) fixButton.hidden = !fitsAtL;
            return;
        }

        if (fixButton) fixButton.hidden = true;
        const shown = state.stage === 'empty' || state.stage === 'error' ? null : state.artwork;
        if (!shown) {
            info.hidden = true;
            return;
        }

        const { analysis } = shown;
        info.hidden = false;
        if (text) {
            const version = translate('capacity.version', {
                version: formatInteger(shown.version),
                modules: formatInteger(shown.moduleCount)
            });
            setText(text, `${version} · ${levelText(shown.ecl, shown.eclAuto)}`);
        }
        setMeter(analysis.maxAtLevel ? analysis.length / analysis.maxAtLevel : 0);
        if (usage) {
            setText(usage, translate(USAGE_KEYS[analysis.mode] || 'capacity.usageBytes', {
                used: formatInteger(analysis.length),
                max: formatInteger(analysis.maxAtLevel)
            }));
            usage.classList.remove('is-danger');
        }
    }

    /**
     * @description Applies the stage state to the DOM: data attributes for
     * the CSS, the placeholder text and buttons, and the localized accessible
     * name of the artwork (never the payload).
     */
    function renderStage() {
        const stage = el('qr-stage');
        const container = el('qr-canvas-container');
        if (!stage || !container) return;

        const current = state.stage;
        const hasArtwork = Boolean(state.artwork && container.firstElementChild);
        const revealed = current === 'invalid' && Boolean(state.revealed);

        // Observers of data-state only hear real changes, not every keystroke.
        if (stage.dataset.state !== current) stage.dataset.state = current;
        stage.dataset.artwork = String(hasArtwork);
        stage.dataset.transparent = String(hasArtwork && state.artwork.design.transparentBackground === true);
        stage.dataset.ink = hasArtwork ? inkOf(state.artwork.design) : 'dark';
        stage.dataset.revealed = String(revealed);
        stage.setAttribute('aria-busy', String(current === 'pending'));
        container.classList.toggle('is-updating', current === 'pending');

        if (hasArtwork) {
            container.setAttribute('role', 'img');
            container.setAttribute('aria-label', current === 'invalid'
                ? translate('aria.qrImageStale')
                : translate('aria.qrImage', { type: translate(TAB_LABEL_KEYS[state.artwork.tab] || 'tabs.urlText') }));
        } else {
            container.removeAttribute('role');
            container.removeAttribute('aria-label');
        }

        const placeholder = el('qr-placeholder');
        if (placeholder) {
            placeholder.hidden = hasArtwork && !revealed;
            placeholder.classList.toggle('is-overlay', hasArtwork && revealed);
        }
        // Until the locale is loaded, the baked text stays, so it never
        // flashes in English.
        const placeholderText = el('qr-placeholder-text');
        if (placeholderText && languageReady()) setText(placeholderText, translate(placeholderKey()));

        // Without a field id, "Go to field" focuses the first field of the tab.
        const fixButton = el('stage-fix-btn');
        if (fixButton) fixButton.hidden = !revealed;
        const retryButton = el('stage-retry-btn');
        if (retryButton) retryButton.hidden = current !== 'error';

        renderReadout();
    }

    /**
     * @description 'light' when the code color is light, so a transparent
     * code is shown on a dark checkerboard instead of a light one.
     */
    function inkOf(design) {
        if (typeof calculateLuminance !== 'function') return 'dark';
        const colors = design.fill === 'gradient' ? [design.fgColor, design.fgColor2] : [design.fgColor];
        const brightness = colors.reduce((sum, color) => sum + calculateLuminance(color), 0) / colors.length;
        return brightness > 150 ? 'light' : 'dark';
    }

    function announce(message) {
        const ui = globalThis.QRTurboUI;
        if (ui && typeof ui.announce === 'function') {
            ui.announce(message);
            return;
        }
        const announcer = el('sr-announcer');
        if (announcer) announcer.textContent = message;
    }

    /**
     * @description Moves the stage to a new state. 'preview.ready' is
     * announced only when the code becomes ready after a non-ready state, not
     * after every pending refresh of a ready code. A failed render is
     * announced too (again after a failed "Try again"), because the ghost
     * text alone is silent for screen reader users.
     */
    function setStage(next) {
        const previous = state.stage;
        state.stage = next;
        if (next !== 'pending') {
            const settledBefore = state.settledStage;
            const retried = state.retrying;
            state.settledStage = next;
            state.retrying = false;
            if (next === 'ready' && settledBefore !== 'ready') announce(translate('preview.ready'));
            if (next === 'error' && (settledBefore !== 'error' || retried)) announce(translate('empty.error'));
        }
        renderStage();
        if (previous !== next) emit('stage', { state: next, previous });
    }

    function clearArtwork() {
        const container = el('qr-canvas-container');
        if (container) {
            if (typeof container.replaceChildren === 'function') {
                container.replaceChildren();
            } else {
                container.textContent = '';
            }
        }
        state.artwork = null;
    }

    function mountPreview(markup) {
        const container = el('qr-canvas-container');
        if (!container) return;
        const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
        const root = parsed.documentElement;
        if (!root || root.nodeName.toLowerCase() !== 'svg' || parsed.getElementsByTagName('parsererror').length) {
            throw new Error('The preview SVG could not be parsed');
        }
        const svg = document.importNode(root, true);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        if (typeof container.replaceChildren === 'function') {
            container.replaceChildren(svg);
        } else {
            container.textContent = '';
            container.appendChild(svg);
        }
    }

    // --- Preview pipeline ---

    function settle(revision) {
        if (revision !== state.revision) return;
        state.settledRevision = revision;
        const waiters = state.waiters;
        state.waiters = [];
        waiters.forEach(resolve => resolve(state.snapshot));
    }

    function sameError(shown, content) {
        return Boolean(shown) && shown.fieldId === content.fieldId && shown.errorKey === content.errorKey;
    }

    /**
     * @description Hides the content error in #form-error. With `always`, an
     * error that another module showed is hidden too.
     */
    function hideShownError(always = false) {
        const formError = el('form-error');
        const visible = Boolean(formError && !formError.hidden);
        if (!state.revealed && !(always && visible)) return;
        state.revealed = null;
        if (typeof clearFormError === 'function') clearFormError();
    }

    function showTooLongError(fieldId) {
        if (state.revealed && state.revealed.errorKey === 'alerts.dataTooLong' && state.revealed.fieldId === fieldId) return;
        if (typeof showFormError === 'function') {
            showFormError(translate('alerts.dataTooLong'), fieldId, 'alerts.dataTooLong');
        }
        state.revealed = { fieldId, errorKey: 'alerts.dataTooLong' };
    }

    function finishContentFailure(content, revision) {
        state.snapshot = null;
        state.tooLong = null;
        state.failure = content;
        // An error shown for another problem is out of date. The idle timer,
        // focusout or the next download attempt shows the new one.
        if (state.revealed && !sameError(state.revealed, content)) hideShownError();

        // Only a code of the same content type stays as the faded last good
        // code; a code from another tab would be misleading.
        const next = content.empty && !state.revealed ? 'empty' : 'invalid';
        if (next === 'empty' || (state.artwork && state.artwork.tab !== content.type)) clearArtwork();
        setStage(next);
        settle(revision);
        emit('preview-empty', { reason: next, fieldId: content.fieldId || null });
    }

    function finishTooLong(content, prepared, design, revision) {
        let fitsAtL = false;
        if (prepared.ecl !== 'L' && content.type !== 'Payment') {
            try {
                fitsAtL = globalThis.QRTurboCapacity.analyze(prepared.bytes, 'L', minVersionOf(design, content.type)).fits;
            } catch (error) {
                fitsAtL = false;
            }
        }
        const fieldId = content.primaryFieldId || null;

        state.snapshot = null;
        state.failure = null;
        state.tooLong = { analysis: prepared.analysis, ecl: prepared.ecl, eclAuto: prepared.eclAuto, fitsAtL, fieldId };
        if (state.revealed && state.revealed.errorKey !== 'alerts.dataTooLong') hideShownError();
        clearArtwork();
        showTooLongError(fieldId);
        setStage('tooLong');
        settle(revision);
        emit('preview-empty', { reason: 'tooLong', fieldId });
    }

    function finishError(revision, error) {
        if (error) console.error('QR preview failed:', error);
        state.snapshot = null;
        state.failure = null;
        state.tooLong = null;
        hideShownError();
        clearArtwork();
        setStage('error');
        settle(revision);
        emit('preview-empty', { reason: 'error', fieldId: null });
    }

    function finishReady(snapshot, revision) {
        state.snapshot = snapshot;
        state.artwork = snapshot;
        state.failure = null;
        state.tooLong = null;
        state.lastVersion = snapshot.version;
        hideShownError(true);
        setStage('ready');
        emit('preview-ready', snapshot);
        settle(revision);
    }

    /**
     * @description Runs one preview revision. Every exit either settles the
     * revision or drops it because a newer revision exists.
     */
    async function runPreview(revision) {
        if (revision !== state.revision) return;
        const design = state.design;

        let content;
        try {
            content = collectContent(false);
        } catch (error) {
            finishError(revision, error);
            return;
        }
        if (!content.ok) {
            finishContentFailure(content, revision);
            return;
        }

        let prepared;
        try {
            prepared = prepareContent(content, design, minVersionOf(design, content.type));
        } catch (error) {
            finishError(revision, error);
            return;
        }
        if (prepared.analysis.version) state.lastVersion = prepared.analysis.version;
        if (!prepared.analysis.fits) {
            finishTooLong(content, prepared, design, revision);
            return;
        }

        let snapshot;
        try {
            snapshot = await composeSnapshot(content, prepared, design, revision, `qp${revision}-`);
        } catch (error) {
            if (revision === state.revision) finishError(revision, error);
            return;
        }
        if (revision !== state.revision) return;

        try {
            mountPreview(snapshot.previewMarkup);
        } catch (error) {
            finishError(revision, error);
            return;
        }
        finishReady(snapshot, revision);
    }

    /**
     * @description Starts the latest revision, or queues it while another
     * render runs, so at most one render is in flight.
     */
    function startPreview() {
        if (state.running) {
            state.queued = true;
            return;
        }
        state.running = true;
        state.queued = false;
        runPreview(state.revision)
            .catch(error => finishError(state.revision, error))
            .finally(() => {
                state.running = false;
                const idle = state.timer === null && state.frame === null;
                if (state.queued && idle && state.settledRevision !== state.revision) {
                    startPreview();
                } else {
                    state.queued = false;
                }
            });
    }

    function cancelScheduled() {
        if (state.timer !== null) {
            clearTimeout(state.timer);
            state.timer = null;
        }
        if (state.frame !== null) {
            if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(state.frame);
            state.frame = null;
        }
    }

    /**
     * @description Queues a new preview revision (SPEC P0-2). Typing waits
     * 150 ms (250 ms above version 25), drags wait one animation frame, and
     * discrete changes run at once. A ready code stays visible, dimmed only
     * after a short delay, until the new one is swapped in.
     */
    function schedulePreview(o = {}) {
        state.revision += 1;
        const revision = state.revision;
        cancelScheduled();

        if ((state.stage === 'ready' || state.stage === 'pending') && state.artwork) setStage('pending');
        emit('preview-start', { revision });

        const reason = o.reason || 'discrete';
        const run = () => {
            state.timer = null;
            state.frame = null;
            startPreview();
        };

        if (o.immediate || reason === 'discrete') {
            state.timer = setTimeout(run, 0);
        } else if (reason === 'drag' && state.lastVersion >= DRAG_DENSE_VERSION) {
            state.timer = setTimeout(run, DRAG_DENSE_DELAY);
        } else if (reason === 'drag' && typeof requestAnimationFrame === 'function' && !document.hidden) {
            state.frame = requestAnimationFrame(run);
        } else {
            const typingDelay = state.lastVersion > DENSE_VERSION ? TYPING_DELAY_DENSE : TYPING_DELAY;
            state.timer = setTimeout(run, reason === 'drag' ? DRAG_FALLBACK_DELAY : typingDelay);
        }
    }

    /**
     * @description Runs a queued preview now and resolves with the Snapshot
     * of the latest revision, or null when that revision is not ready.
     */
    function whenReady() {
        if (state.timer !== null || state.frame !== null) {
            cancelScheduled();
            startPreview();
        }
        if (state.settledRevision === state.revision) return Promise.resolve(state.snapshot);
        return new Promise(resolve => state.waiters.push(resolve));
    }

    function getSnapshot() {
        return state.snapshot;
    }

    function getPreviewState() {
        return state.stage;
    }

    // --- Calm validation (SPEC B.11) ---

    function firstFieldOfActivePanel() {
        const tab = activeTab();
        const panel = tab ? el(tab) : null;
        return panel ? panel.querySelector('input:not([type="hidden"]):not([disabled]), textarea, select') : null;
    }

    function focusField(fieldId) {
        const field = (fieldId && el(fieldId)) || firstFieldOfActivePanel();
        if (!field || typeof field.focus !== 'function') return;
        try {
            field.focus({ preventScroll: true });
        } catch (error) {
            field.focus();
        }
        if (typeof field.scrollIntoView === 'function') {
            field.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
    }

    function contentField(target) {
        if (!target || typeof target.closest !== 'function' || !target.id) return null;
        if (!/^(?:INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return null;
        return target.closest('.tab-content') ? target : null;
    }

    function collectQuietly() {
        try {
            return collectContent(false);
        } catch (error) {
            return null;
        }
    }

    /**
     * @description Shows the content error of a failure through app.js
     * (collectContent(true) moves #form-error next to the field) and updates
     * the stage to show "Go to field".
     */
    function showContentError(content) {
        try {
            collectContent(true);
        } catch (error) {
            return;
        }
        state.revealed = { fieldId: content.fieldId || null, errorKey: content.errorKey };
        markRevealed(content);
    }

    // A revealed error turns a calm empty stage into 'invalid' with "Go to
    // field"; listeners hear about it like any other preview outcome.
    function markRevealed(content) {
        if (state.stage !== 'empty' && state.stage !== 'invalid') return;
        const previous = state.stage;
        state.failure = content;
        setStage('invalid');
        if (previous !== 'invalid') emit('preview-empty', { reason: 'invalid', fieldId: content.fieldId || null });
    }

    // Reveals the current error, but only when the user edited its field.
    function revealDirtyError() {
        const content = collectQuietly();
        if (!content || content.ok || !content.fieldId || !state.dirty.has(content.fieldId)) return;
        if (sameError(state.revealed, content)) return;
        showContentError(content);
    }

    function restartIdleTimer() {
        clearTimeout(state.idleTimer);
        state.idleTimer = setTimeout(() => {
            state.idleTimer = null;
            revealDirtyError();
        }, REVEAL_IDLE_DELAY);
    }

    function onContentInput(event) {
        const field = contentField(event.target);
        if (!field) return;
        state.dirty.add(field.id);
        restartIdleTimer();
    }

    function onContentFocusOut(event) {
        const field = contentField(event.target);
        if (!field || !state.dirty.has(field.id)) return;
        revealDirtyError();
    }

    /**
     * @description Shows every current error (content, too much content or a
     * failed render), optionally focusing the field or the retry button.
     * Returns true when something blocks a download, and false when the
     * latest code is fine or still being made. Used by Download, Copy, Share
     * and Print attempts.
     */
    function revealErrors(o = {}) {
        clearTimeout(state.idleTimer);
        state.idleTimer = null;

        let content = null;
        try {
            content = collectContent(true);
        } catch (error) {
            console.error('Reading the content failed:', error);
        }

        if (content && !content.ok) {
            state.revealed = { fieldId: content.fieldId || null, errorKey: content.errorKey };
            if (content.fieldId) state.dirty.add(content.fieldId);
            markRevealed(content);
            if (o.focus) focusField(content.fieldId);
            return true;
        }

        let prepared = null;
        try {
            prepared = content ? prepareContent(content, state.design, minVersionOf(state.design, content.type)) : null;
        } catch (error) {
            prepared = null;
        }
        if (prepared && !prepared.analysis.fits) {
            showTooLongError(content.primaryFieldId || null);
            if (o.focus) focusField(content.primaryFieldId);
            return true;
        }

        // A failed render of the latest revision. While a newer revision is
        // still on its way, the stage keeps 'error' but nothing blocks yet.
        if (state.stage === 'error' && state.settledRevision === state.revision) {
            if (o.focus) el('stage-retry-btn')?.focus();
            return true;
        }
        return false;
    }

    function useLevelL() {
        const previous = state.design.errorCorrection;
        updateDesign({ errorCorrection: 'L' }, { source: 'fix' });
        const ui = globalThis.QRTurboUI;
        if (ui && typeof ui.toast === 'function') {
            ui.toast(translate('toast.applied', { what: translate('actions.useLevelL') }), {
                tone: 'success',
                actionLabel: translate('actions.undo'),
                onAction: () => updateDesign({ errorCorrection: previous }, { source: 'undo' })
            });
        }
        el('preview-title')?.focus();
    }

    function initStage() {
        document.addEventListener('input', onContentInput);
        document.addEventListener('change', onContentInput);
        document.addEventListener('focusout', onContentFocusOut);

        el('stage-fix-btn')?.addEventListener('click', () => {
            focusField(state.revealed?.fieldId || state.failure?.fieldId || null);
        });
        el('stage-retry-btn')?.addEventListener('click', () => {
            state.retrying = true;
            schedulePreview({ immediate: true });
            el('preview-title')?.focus();
        });
        el('capacity-fix-btn')?.addEventListener('click', useLevelL);

        // A tab the user has not touched yet never starts with an error.
        on('tab', () => {
            clearTimeout(state.idleTimer);
            state.idleTimer = null;
            state.revealed = null;
        });

        renderStage();
    }

    /**
     * @description Re-applies the stage text after core.js translated the
     * page, re-emits it as 'i18n', and redraws a framed code whose default
     * label ("SCAN ME") changed language.
     */
    function onTranslated() {
        renderStage();
        emit('i18n');

        const artwork = state.artwork;
        if (artwork && artwork.frame && !String(artwork.design.frameText || '').trim()) {
            let label = artwork.frame.text;
            try {
                label = getFrameText(artwork.design);
            } catch (error) {
                label = artwork.frame.text;
            }
            if (label !== artwork.frame.text) schedulePreview({ reason: 'discrete' });
        }
    }

    /**
     * @description Loads the batch modules on first use and opens the dialog.
     */
    async function openBatch() {
        const ui = globalThis.QRTurboUI;
        await ui.loadScript('/js/lib/csv.js');
        await ui.loadScript('/js/lib/zip.js');
        await ui.loadScript('/js/ui/batch.js');
        await globalThis.QRTurboBatchUI.open(api);
    }

    // --- Startup ---

    function guard(label, fn) {
        try {
            fn();
        } catch (error) {
            console.error(`QRTurboApp: ${label} failed:`, error);
        }
    }

    function init() {
        if (state.initialized) return;
        state.initialized = true;

        guard('theme', () => setupThemeSelector());
        guard('service worker', () => registerServiceWorker());
        guard('QRTurboUI', () => globalThis.QRTurboUI.init());
        guard('export options', () => {
            state.exportOptions = restoreExportOptions();
        });
        guard('preview stage', () => initStage());
        guard('content forms', () => initContentForms(api));
        guard('QRTurboDesignUI', () => globalThis.QRTurboDesignUI.init(api));
        guard('QRTurboExportUI', () => globalThis.QRTurboExportUI.init(api));
        guard('QRTurboScan', () => globalThis.QRTurboScan.init(api));
        guard('i18n', () => document.addEventListener('qrturbo:i18n', onTranslated));
        schedulePreview({ immediate: true });
    }

    const api = {
        init,
        on,
        emit,
        defaultDesign,
        getDesign,
        updateDesign,
        replaceDesign,
        defaultExportOptions,
        getExportOptions,
        updateExportOptions,
        schedulePreview,
        whenReady,
        getSnapshot,
        getPreviewState,
        buildSnapshot,
        revealErrors,
        openBatch
    };

    globalThis.QRTurboApp = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        if (document.readyState === 'complete') {
            init();
        } else {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        }
    }
})();
