// QRTurbo.app - Export panel (QRTurboExportUI)
// Owns the export group in the preview card: format, size and print size,
// the download button, copy, share and print, the encoded data panel, the
// print sheet and the phone download bar. It talks to the rest of the page
// only through the app (QRTurboApp) and builds files with QRTurboExport.
(function () {
    'use strict';

    const FORMAT_LABEL_KEYS = Object.freeze({
        png: 'options.formatPng',
        svg: 'options.formatSvg',
        pdf: 'options.formatPdf',
        jpg: 'options.formatJpg',
        webp: 'options.formatWebp',
        eps: 'options.formatEps'
    });
    const FORMAT_HINT_KEYS = Object.freeze({
        png: 'output.hintPng',
        svg: 'output.hintSvg',
        pdf: 'output.hintPdf',
        jpg: 'output.hintJpg',
        webp: 'output.hintWebp',
        eps: 'output.hintEps'
    });
    const MORE_FORMATS = Object.freeze(['jpg', 'webp', 'eps']);
    const RASTER_FORMATS = Object.freeze(['png', 'jpg', 'webp']);
    const PRINTABLE_RASTER = Object.freeze(['png', 'jpg']);
    // The limits the controller and the exporter use too (rules.js loads first).
    const WIDTH_LIMITS = globalThis.QRTurboRules.EXPORT_LIMITS.print;
    const PIXEL_LIMITS = globalThis.QRTurboRules.EXPORT_LIMITS.pixels;
    const USABLE_STATES = Object.freeze(['ready', 'pending']);
    const FIELD_ERRORS = Object.freeze({ 'print-width': 'print-width-error', 'size-custom': 'size-custom-error' });
    const MM_PER_INCH = 25.4;
    const PREPARING_DELAY = 300;
    const SHARE_IDLE_DELAY = 1000;
    const FIELD_ERROR_DELAY = 1200;
    const NARROW_QUERY = '(max-width: 960px)';

    const state = {
        initialized: false,
        app: null,
        els: {},
        more: null,
        payload: null,
        support: { clipboardImage: false, clipboardText: false, share: false, print: false, webp: false },
        stageState: 'empty',
        description: null,
        exportNotes: [],
        notesText: '',
        invalidFields: new Map(),
        unitMemo: null,
        fieldTimers: new Map(),
        busy: false,
        shareTimer: null,
        revealed: false,
        payloadSource: null,
        describeWarned: false,
        mobile: {
            narrow: false,
            coarse: false,
            previewVisible: true,
            keyboardOpen: false,
            textFocused: false,
            everReady: false,
            thumbUrl: null,
            thumbRevision: null
        }
    };

    // --- Pure helpers (also used by the unit tests) ---

    function isMoreFormat(format) {
        return MORE_FORMATS.includes(format);
    }

    /**
     * @description Which export controls a format needs. PDF and EPS are
     * always print-sized, PNG and JPG can be, WebP never is.
     */
    function fieldLayout(options) {
        const format = options.format;
        const raster = RASTER_FORMATS.includes(format);
        const printableRaster = PRINTABLE_RASTER.includes(format);
        const alwaysPrint = format === 'pdf' || format === 'eps';
        const printEnabled = Boolean(options.print && options.print.enabled);
        const sizeLocked = printableRaster && printEnabled;
        const printMode = alwaysPrint || ((printableRaster || format === 'svg') && printEnabled);

        return {
            pixelSize: raster,
            sizeLocked,
            customSize: raster && options.pixelSize === 'custom' && !sizeLocked,
            vectorNote: format === 'svg',
            printToggle: printableRaster || format === 'svg',
            printSize: printMode,
            dpi: sizeLocked,
            page: format === 'pdf',
            colorMode: alwaysPrint,
            printMode,
            moreFormats: isMoreFormat(format)
        };
    }

    /**
     * @description Returns the width when it is a finite number inside the
     * limits of the unit, otherwise null.
     */
    function checkWidth(value, unit) {
        const limits = WIDTH_LIMITS[unit];
        const width = typeof value === 'number' ? value : Number.parseFloat(value);
        if (!limits || !Number.isFinite(width) || width < limits.min || width > limits.max) return null;
        return width;
    }

    /**
     * @description Returns the custom pixel size when it is a whole number
     * from 128 to 4096, otherwise null.
     */
    function checkPixels(value) {
        const pixels = typeof value === 'number' ? value : Number(value);
        if (!Number.isInteger(pixels) || pixels < PIXEL_LIMITS.min || pixels > PIXEL_LIMITS.max) return null;
        return pixels;
    }

    function unitSystem(unit) {
        return unit === 'in' ? 'imperial' : 'metric';
    }

    // --- Text ---

    function t(key, vars) {
        return typeof globalThis.t === 'function' ? globalThis.t(key, vars || {}) : key;
    }

    function ui() {
        return globalThis.QRTurboUI;
    }

    function formatName(format) {
        return t(FORMAT_LABEL_KEYS[format] || FORMAT_LABEL_KEYS.png);
    }

    /**
     * @description Accepts a translated note, an i18n key or { key, vars }
     * and returns display text.
     */
    function localizeNote(note) {
        if (note && typeof note === 'object' && typeof note.key === 'string') return t(note.key, note.vars);
        if (typeof note !== 'string' || !note) return '';
        if (/^[a-z]+\.[A-Za-z0-9_.]+$/.test(note) && typeof globalThis.t === 'function') {
            const text = globalThis.t(note);
            if (text !== note) return text;
        }
        return note;
    }

    // --- DOM helpers ---

    function byId(id) {
        return document.getElementById(id);
    }

    function setHidden(element, hidden) {
        if (element && element.hidden !== hidden) element.hidden = hidden;
    }

    function setText(element, text) {
        if (element && element.textContent !== text) element.textContent = text;
    }

    function setDisabled(button, disabled) {
        if (!button) return;
        if (disabled) {
            button.setAttribute('aria-disabled', 'true');
        } else {
            button.removeAttribute('aria-disabled');
        }
    }

    function addDescribedBy(element, id) {
        const ids = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        if (!ids.includes(id)) element.setAttribute('aria-describedby', [...ids, id].join(' '));
    }

    function removeDescribedBy(element, id) {
        const ids = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(item => item && item !== id);
        if (ids.length) {
            element.setAttribute('aria-describedby', ids.join(' '));
        } else {
            element.removeAttribute('aria-describedby');
        }
    }

    function prefersReducedMotion() {
        return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function isTextEntry(element) {
        if (!element) return false;
        if (element.tagName === 'TEXTAREA' || element.isContentEditable) return true;
        return element.tagName === 'INPUT'
            && !['button', 'checkbox', 'color', 'file', 'radio', 'range', 'reset', 'submit'].includes(element.type);
    }

    function cacheElements() {
        const ids = {
            group: 'export-group',
            formatGroup: 'qr-format',
            moreToggle: 'more-formats-toggle',
            morePanel: 'more-formats',
            formatWebp: 'format-webp',
            formatHint: 'format-hint',
            pixelSize: 'pixel-size',
            sizeSelect: 'size-select',
            sizeCustomGroup: 'size-custom-group',
            sizeCustom: 'size-custom',
            vectorNote: 'vector-size-note',
            printToggleGroup: 'print-toggle-group',
            printToggle: 'print-toggle',
            printSize: 'print-size',
            printWidth: 'print-width',
            printDpiGroup: 'print-dpi-group',
            printDpi: 'print-dpi',
            pdfPageGroup: 'pdf-page-group',
            pdfPage: 'pdf-page',
            colorModeGroup: 'color-mode-group',
            colorMode: 'color-mode',
            printInfo: 'print-info',
            exportNotes: 'export-notes',
            downloadBtn: 'download-btn',
            downloadLabel: 'download-label',
            downloadSummary: 'download-summary',
            copyBtn: 'copy-btn',
            copyBtnLabel: 'copy-btn-label',
            shareBtn: 'share-btn',
            printBtn: 'print-btn',
            payloadToggle: 'payload-toggle',
            payloadPanel: 'payload-panel',
            qrCodeText: 'qr-code-text',
            payloadRevealBtn: 'payload-reveal-btn',
            copyTextBtn: 'copy-text-btn',
            stage: 'qr-stage',
            container: 'qr-container',
            previewTitle: 'preview-title',
            retryBtn: 'stage-retry-btn',
            mobileBar: 'mobile-bar',
            mobileThumbBtn: 'mobile-thumb-btn',
            mobileThumb: 'mobile-thumb',
            mobileDownloadBtn: 'mobile-download-btn',
            mobileDownloadLabel: 'mobile-download-label',
            mobileShareBtn: 'mobile-share-btn',
            printSheet: 'print-sheet'
        };
        const els = {};
        Object.keys(ids).forEach(name => {
            els[name] = byId(ids[name]);
        });
        els.formatRadios = Array.from(document.querySelectorAll('input[name="qr-format"]'));
        els.unitRadios = Array.from(document.querySelectorAll('input[name="print-unit"]'));
        state.els = els;
    }

    // --- Capabilities ---

    function canShareFiles() {
        try {
            if (typeof navigator === 'undefined' || typeof navigator.share !== 'function'
                || typeof navigator.canShare !== 'function' || typeof File !== 'function') {
                return false;
            }
            const probe = new File([new Uint8Array([137, 80, 78, 71])], 'qrcode.png', { type: 'image/png' });
            return navigator.canShare({ files: [probe] }) === true;
        } catch (error) {
            return false;
        }
    }

    function detectSupport() {
        const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
        state.support.clipboardText = Boolean(clipboard) && typeof clipboard.writeText === 'function';
        state.support.clipboardImage = Boolean(clipboard) && typeof clipboard.write === 'function'
            && typeof globalThis.ClipboardItem === 'function';
        state.support.print = typeof window.print === 'function';
        state.support.share = canShareFiles();
    }

    /**
     * @description Asks the exporter what this browser can really do. WebP
     * stays hidden until the probe says yes; a remembered WebP choice falls
     * back to PNG when it cannot. The clipboard and share answers refine the
     * quick checks made at startup.
     */
    async function probeCapabilities() {
        let caps = null;
        try {
            caps = await globalThis.QRTurboExport?.capabilities?.();
        } catch (error) {
            caps = null;
        }
        state.support.webp = Boolean(caps && caps.webp === true);
        if (caps && typeof caps.clipboardImage === 'boolean') state.support.clipboardImage = caps.clipboardImage;
        if (caps && typeof caps.clipboardText === 'boolean') state.support.clipboardText = caps.clipboardText;
        if (caps && typeof caps.shareFiles === 'boolean') state.support.share = caps.shareFiles;

        applyWebpSupport();
        if (!state.support.webp && state.app.getExportOptions().format === 'webp') {
            state.app.updateExportOptions({ format: 'png' });
        }
        updateSummary();
        updateActions();
        scheduleSharePrepare();
    }

    function applyWebpSupport() {
        const radio = state.els.formatWebp;
        if (!radio) return;
        setHidden(radio, !state.support.webp);
        setHidden(radio.closest('.format-option'), !state.support.webp);
    }

    // --- Rendering the controls ---

    /**
     * @description Writes a number into an input unless the user is in the
     * middle of an edit that has not been applied yet.
     */
    function syncNumberInput(input, value) {
        if (!input) return;
        if (state.invalidFields.has(input.id)) {
            if (state.invalidFields.get(input.id) === value) return;
            clearFieldError(input.id);
        }
        if (input.valueAsNumber === value) return;
        input.value = String(value);
    }

    function render() {
        const els = state.els;
        const options = state.app.getExportOptions();
        const layout = fieldLayout(options);

        els.formatRadios.forEach(radio => {
            radio.checked = radio.value === options.format;
        });
        // A chosen JPG, WebP or EPS stays on screen: the row opens and its
        // toggle is disabled until a PNG, SVG or PDF is chosen, so the
        // checked chip is never hidden and the group never looks empty.
        if (layout.moreFormats && state.more && !state.more.isOpen()) state.more.open();
        if (els.moreToggle && els.moreToggle.disabled !== layout.moreFormats) {
            els.moreToggle.disabled = layout.moreFormats;
        }

        setHidden(els.pixelSize, !layout.pixelSize);
        if (els.sizeSelect) {
            els.sizeSelect.value = String(options.pixelSize);
            els.sizeSelect.disabled = layout.sizeLocked;
        }
        setHidden(els.sizeCustomGroup, !layout.customSize);
        syncNumberInput(els.sizeCustom, options.customPixels);
        setHidden(els.vectorNote, !layout.vectorNote);

        setHidden(els.printToggleGroup, !layout.printToggle);
        if (els.printToggle) els.printToggle.checked = Boolean(options.print.enabled);
        setHidden(els.printSize, !layout.printSize);
        els.unitRadios.forEach(radio => {
            radio.checked = radio.value === options.print.unit;
        });
        if (els.printWidth) {
            const limits = WIDTH_LIMITS[options.print.unit];
            els.printWidth.min = String(limits.min);
            els.printWidth.max = String(limits.max);
            syncNumberInput(els.printWidth, options.print.width);
        }
        setHidden(els.printDpiGroup, !layout.dpi);
        if (els.printDpi) els.printDpi.value = String(options.print.dpi);
        setHidden(els.pdfPageGroup, !layout.page);
        if (els.pdfPage) els.pdfPage.value = options.page;
        setHidden(els.colorModeGroup, !layout.colorMode);
        if (els.colorMode) els.colorMode.value = options.colorMode;

        updateSummary();
        updateActions();
    }

    /**
     * @description The download label, size summary, notes and print info
     * from QRTurboExport.describe. If it fails, the button still names the
     * format, without a summary.
     */
    function describe(options, snapshot) {
        try {
            const result = globalThis.QRTurboExport.describe(options, snapshot);
            if (result && typeof result.label === 'string' && result.label) {
                return {
                    label: localizeNote(result.label),
                    summary: typeof result.summary === 'string' ? localizeNote(result.summary) : '',
                    notes: Array.isArray(result.notes) ? result.notes.map(localizeNote).filter(Boolean) : [],
                    printInfo: typeof result.printInfo === 'string' && result.printInfo ? result.printInfo : null
                };
            }
        } catch (error) {
            if (!state.describeWarned) {
                state.describeWarned = true;
                console.warn('QRTurboExport.describe failed:', error);
            }
        }
        return {
            label: t('actions.downloadFormat', { format: formatName(options.format) }),
            summary: '',
            notes: [],
            printInfo: null
        };
    }

    function isBusy(button) {
        return Boolean(button) && button.classList.contains('is-busy');
    }

    function updateSummary() {
        const els = state.els;
        const options = state.app.getExportOptions();
        const snapshot = state.app.getSnapshot();
        const description = describe(options, snapshot);
        state.description = description;

        if (!isBusy(els.downloadBtn)) setText(els.downloadLabel, description.label);
        if (!isBusy(els.mobileDownloadBtn)) setText(els.mobileDownloadLabel, description.label);
        setText(els.downloadSummary, description.summary);
        setText(els.formatHint, t(FORMAT_HINT_KEYS[options.format] || FORMAT_HINT_KEYS.png));

        setText(els.printInfo, description.printInfo || '');
        setHidden(els.printInfo, !description.printInfo);

        const notes = [...new Set([...description.notes, ...state.exportNotes])];
        const notesText = notes.join('\n');
        if (els.exportNotes && notesText !== state.notesText) {
            state.notesText = notesText;
            els.exportNotes.replaceChildren(...notes.map(note => {
                const paragraph = document.createElement('p');
                paragraph.textContent = note;
                return paragraph;
            }));
        }

        setText(els.copyBtnLabel, t(copiesSvg(options) ? 'actions.copySvg' : 'actions.copyImage'));
    }

    // Without an image clipboard the exporter copies the SVG code instead.
    function copiesSvg(options) {
        return options.format === 'svg' || !state.support.clipboardImage;
    }

    // --- Field validation ---

    function currentOptionValue(id) {
        const options = state.app.getExportOptions();
        return id === 'print-width' ? options.print.width : options.customPixels;
    }

    function fieldErrorMessage(id) {
        if (id === 'size-custom') return t('output.customSizeInvalid');
        const unit = state.app.getExportOptions().print.unit;
        const limits = WIDTH_LIMITS[unit];
        const kit = ui();
        const system = unitSystem(unit);
        const toMm = value => (unit === 'in' ? value * MM_PER_INCH : value);
        return t('output.widthInvalid', {
            min: kit ? kit.formatLength(toMm(limits.min), system) : `${limits.min} ${unit}`,
            max: kit ? kit.formatLength(toMm(limits.max), system) : `${limits.max} ${unit}`
        });
    }

    function markInvalid(id) {
        state.invalidFields.set(id, currentOptionValue(id));
        clearTimeout(state.fieldTimers.get(id));
        state.fieldTimers.set(id, setTimeout(() => showFieldError(id), FIELD_ERROR_DELAY));
        updateActions();
    }

    function showFieldError(id, o = {}) {
        const input = byId(id);
        const error = byId(FIELD_ERRORS[id]);
        if (!input || !error || !state.invalidFields.has(id)) return;
        clearTimeout(state.fieldTimers.get(id));
        setText(error, fieldErrorMessage(id));
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        addDescribedBy(input, error.id);
        if (o.focus) {
            input.focus({ preventScroll: true });
            input.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
    }

    function clearFieldError(id) {
        const input = byId(id);
        const error = byId(FIELD_ERRORS[id]);
        clearTimeout(state.fieldTimers.get(id));
        state.invalidFields.delete(id);
        if (error) {
            error.hidden = true;
            error.textContent = '';
        }
        if (input) {
            input.removeAttribute('aria-invalid');
            removeDescribedBy(input, FIELD_ERRORS[id]);
        }
    }

    function refreshFieldErrorTexts() {
        Object.keys(FIELD_ERRORS).forEach(id => {
            const error = byId(FIELD_ERRORS[id]);
            if (error && !error.hidden) setText(error, fieldErrorMessage(id));
        });
    }

    /**
     * @description The first invalid export field that is currently shown.
     */
    function invalidVisibleField() {
        const layout = fieldLayout(state.app.getExportOptions());
        if (layout.printSize && state.invalidFields.has('print-width')) return 'print-width';
        if (layout.customSize && state.invalidFields.has('size-custom')) return 'size-custom';
        return null;
    }

    // --- Stage state and actions ---

    function readStageState() {
        return state.els.stage?.dataset.state || 'empty';
    }

    function stageUsable() {
        return USABLE_STATES.includes(state.stageState);
    }

    /**
     * @description Why export actions are unavailable: an invalid export
     * field ({ field }), a stage without a usable code ({ stage }), or null.
     */
    function currentBlocker() {
        const field = invalidVisibleField();
        if (field) return { field };
        if (!stageUsable()) return { stage: state.stageState };
        return null;
    }

    /**
     * @description Shows why the stage has no usable code: the content error,
     * too much content, or a failed render (focus goes to "Try again").
     * Returns false when there is nothing to show: the content is valid and
     * its code is still being made.
     */
    function revealStageProblem() {
        try {
            return state.app.revealErrors({ focus: true }) === true;
        } catch (error) {
            console.error('Revealing the content errors failed:', error);
            return true;
        }
    }

    /**
     * @description When an action is unavailable, shows why and moves focus
     * to the field to fix. Returns true when the action must not run. A
     * stage without a code whose content is already valid (the first render
     * after an empty, invalid or too long state) does not block: the action
     * waits for app.whenReady(), as it does while a code is pending.
     */
    function revealIfBlocked() {
        const blocker = currentBlocker();
        if (!blocker) return false;
        if (blocker.field) {
            showFieldError(blocker.field, { focus: true });
            return true;
        }
        return revealStageProblem();
    }

    function updateActions() {
        const els = state.els;
        const options = state.app.getExportOptions();
        const blocked = currentBlocker() !== null;

        [els.downloadBtn, els.mobileDownloadBtn, els.copyBtn, els.shareBtn, els.mobileShareBtn, els.printBtn]
            .forEach(button => setDisabled(button, blocked));
        setDisabled(els.copyTextBtn, !(stageUsable() && state.app.getSnapshot()));

        const canCopy = copiesSvg(options) ? state.support.clipboardText : state.support.clipboardImage;
        setHidden(els.copyBtn, !canCopy);
        setHidden(els.shareBtn, !state.support.share);
        setHidden(els.mobileShareBtn, !state.support.share);
        setHidden(els.printBtn, !state.support.print);

        updateMobileBar();
    }

    function syncStage() {
        const next = readStageState();
        const changed = next !== state.stageState;
        state.stageState = next;
        if (next === 'ready') state.mobile.everReady = true;
        syncPayload();
        updateSummary();
        updateActions();
        if (changed && next === 'ready') scheduleSharePrepare();
    }

    // --- Encoded data ---

    function syncPayload() {
        const els = state.els;
        const snapshot = state.app.getSnapshot();
        const showable = snapshot && (stageUsable() || state.stageState === 'invalid');

        if (!showable) {
            state.payloadSource = null;
            state.revealed = false;
            setText(els.qrCodeText, '');
            setHidden(els.payloadRevealBtn, true);
            if (els.payloadRevealBtn) els.payloadRevealBtn.dataset.revealed = 'false';
            els.qrCodeText?.classList.remove('is-stale');
            return;
        }

        if (state.payloadSource !== snapshot.payload) {
            state.payloadSource = snapshot.payload;
            state.revealed = false;
        }
        els.qrCodeText?.classList.toggle('is-stale', state.stageState === 'invalid');
        renderPayloadText(snapshot);
    }

    function renderPayloadText(snapshot) {
        const els = state.els;
        if (!snapshot) return;
        const sensitive = Boolean(snapshot.isSensitive);
        const revealed = sensitive && state.revealed;
        setHidden(els.payloadRevealBtn, !sensitive);
        if (els.payloadRevealBtn) {
            els.payloadRevealBtn.dataset.revealed = String(revealed);
            setText(els.payloadRevealBtn, t(revealed ? 'actions.hidePayload' : 'actions.showPayload'));
        }
        setText(els.qrCodeText, sensitive && !revealed ? t('misc.wifiPayloadHidden') : String(snapshot.payload ?? ''));
    }

    function onRevealPayload() {
        const snapshot = state.app.getSnapshot();
        if (!snapshot || !snapshot.isSensitive || state.payloadSource !== snapshot.payload) return;
        state.revealed = !state.revealed;
        renderPayloadText(snapshot);
    }

    /**
     * @description Like onCopy, the clipboard write starts inside the click.
     * While the preview is updating, the text goes to the clipboard as a
     * Promise of the next snapshot's payload, because Safari drops the user
     * activation at the first await.
     */
    async function onCopyText() {
        const kit = ui();
        const snapshot = state.app.getSnapshot();
        let text = null;
        let notReady = false;
        if (state.stageState === 'ready' && snapshot) {
            text = snapshot.payload;
        } else if (state.stageState === 'pending' || !revealStageProblem()) {
            text = state.app.whenReady().then(next => {
                syncStage();
                if (next && state.stageState === 'ready') return next.payload;
                notReady = true;
                return null;
            });
        } else {
            return;
        }
        const copied = kit ? await kit.copyText(text) : false;
        if (notReady) {
            revealStageProblem();
            return;
        }
        kit?.toast(t(copied ? 'toast.textCopied' : 'toast.copyFailed'), { tone: copied ? 'success' : 'error' });
    }

    // --- Download ---

    function setPreparing(button, label, preparing) {
        if (!button) return;
        if (preparing) {
            button.setAttribute('aria-busy', 'true');
            button.classList.add('is-busy');
            setText(label, t('output.preparing'));
        } else {
            button.removeAttribute('aria-busy');
            button.classList.remove('is-busy');
            setText(label, state.description ? state.description.label : t('actions.download'));
        }
    }

    function celebrate(button) {
        if (!button || prefersReducedMotion()) return;
        button.classList.remove('is-saved');
        void button.offsetWidth;
        button.classList.add('is-saved');
        button.addEventListener('animationend', () => button.classList.remove('is-saved'), { once: true });
    }

    /**
     * @description Shows notes that only the finished export knows, such as
     * a page that was too small, next to the download button.
     */
    function applyExportNotes(notes) {
        state.exportNotes = Array.isArray(notes) ? notes.map(localizeNote).filter(Boolean) : [];
        updateSummary();
    }

    /**
     * @description Download flow: flush the pending preview, build the file
     * and save it. After 300 ms the button says that the file is being
     * prepared. Success is announced; failure shows an error toast and focus
     * stays on the button.
     */
    async function onDownload(event) {
        const button = event.currentTarget;
        if (state.busy || revealIfBlocked()) return;

        const els = state.els;
        const label = button === els.mobileDownloadBtn ? els.mobileDownloadLabel : els.downloadLabel;
        let format = state.app.getExportOptions().format;
        state.busy = true;
        const timer = setTimeout(() => setPreparing(button, label, true), PREPARING_DELAY);

        try {
            const snapshot = await state.app.whenReady();
            syncStage();
            if (!snapshot || !stageUsable()) {
                revealStageProblem();
                return;
            }
            if (revealIfBlocked()) return;

            const options = state.app.getExportOptions();
            format = options.format;
            const result = await globalThis.QRTurboExport.exportFile(snapshot, options);
            if (!result || !result.blob) throw new Error('The exporter returned no file');

            ui()?.saveBlob(result.blob, result.filename);
            ui()?.announce(t('toast.saved', { filename: result.filename }));
            applyExportNotes(result.notes);
            celebrate(button);
        } catch (error) {
            if (error && error.name === 'AbortError') return;
            console.error('Export failed:', error);
            ui()?.toast(t('toast.exportFailed', { format: formatName(format) }), { tone: 'error' });
        } finally {
            clearTimeout(timer);
            setPreparing(button, label, false);
            state.busy = false;
        }
    }

    // --- Copy and share ---

    // source is a Snapshot or a Promise of one. notReady() says whether a
    // pending preview ended without a code; that shows the problem instead
    // of a copy error.
    function runCopy(source, options, notReady = () => false) {
        let job;
        try {
            job = Promise.resolve(globalThis.QRTurboExport.copy(source, options));
        } catch (error) {
            job = Promise.reject(error);
        }
        return job
            .then(kind => {
                ui()?.toast(t(kind === 'svg' ? 'toast.svgCopied' : 'toast.imageCopied'), { tone: 'success' });
            })
            .catch(error => {
                if (notReady()) {
                    revealStageProblem();
                    return;
                }
                console.warn('Copying failed:', error);
                ui()?.toast(t('toast.copyFailed'), { tone: 'error' });
            });
    }

    /**
     * @description The clipboard write must start inside the click, also
     * while the preview is updating: Safari drops the user activation at
     * the first await. A ready code is copied at once; for a pending one
     * the exporter gets app.whenReady() itself, synchronously, and starts
     * the write with the image (or text) as a Promise.
     */
    function onCopy() {
        if (revealIfBlocked()) return;
        const options = state.app.getExportOptions();
        const snapshot = state.app.getSnapshot();
        if (state.stageState === 'ready' && snapshot) {
            runCopy(snapshot, options);
            return;
        }
        let notReady = false;
        const ready = state.app.whenReady().then(next => {
            syncStage();
            if (next && state.stageState === 'ready') return next;
            notReady = true;
            return null;
        });
        runCopy(ready, options, () => notReady);
    }

    /**
     * @description Lets the exporter build the share file ahead of time, so
     * the click can call navigator.share() at once. The exporter skips the
     * work when the snapshot and options are unchanged.
     */
    function prepareShareNow() {
        if (!state.support.share || state.stageState !== 'ready') return;
        const snapshot = state.app.getSnapshot();
        if (!snapshot) return;
        try {
            globalThis.QRTurboExport.prepareShare(snapshot, state.app.getExportOptions());
        } catch (error) {
            console.warn('Preparing the shared file failed:', error);
        }
    }

    function scheduleSharePrepare() {
        if (!state.support.share) return;
        clearTimeout(state.shareTimer);
        state.shareTimer = setTimeout(() => {
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(prepareShareNow, { timeout: 2000 });
            } else {
                prepareShareNow();
            }
        }, SHARE_IDLE_DELAY);
    }

    async function onShare() {
        if (revealIfBlocked()) return;
        if (state.stageState !== 'ready') {
            await state.app.whenReady();
            syncStage();
            if (state.stageState !== 'ready') {
                revealStageProblem();
                return;
            }
        }
        try {
            const outcome = await globalThis.QRTurboExport.share(state.app.getSnapshot(), state.app.getExportOptions());
            if (outcome === 'unsupported') ui()?.toast(t('toast.shareFailed'), { tone: 'error' });
        } catch (error) {
            if (error && error.name === 'AbortError') return;
            console.warn('Sharing failed:', error && error.message);
            ui()?.toast(t('toast.shareFailed'), { tone: 'error' });
        }
    }

    // --- Print at exact size ---

    /**
     * @description Prints the vector code at its physical width. The
     * exporter fills #print-sheet, shows the "scale 100%" tip and opens the
     * print dialog; @media print then hides everything else.
     */
    async function onPrint() {
        if (state.busy || revealIfBlocked()) return;
        state.busy = true;
        try {
            const snapshot = await state.app.whenReady();
            syncStage();
            if (!snapshot || state.stageState !== 'ready') {
                revealStageProblem();
                return;
            }
            await globalThis.QRTurboExport.printSheet(snapshot, state.app.getExportOptions());
        } catch (error) {
            console.error('Printing failed:', error);
            state.els.printSheet?.replaceChildren();
            ui()?.toast(t('toast.exportFailed', { format: formatName('svg') }), { tone: 'error' });
        } finally {
            state.busy = false;
        }
    }

    // --- Phone download bar ---

    function updateThumb() {
        const snapshot = state.app.getSnapshot();
        const mobile = state.mobile;
        if (!snapshot || !snapshot.previewMarkup || snapshot.revision === mobile.thumbRevision) return;
        let markup = String(snapshot.previewMarkup);
        if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b[^>]*\bxmlns=/.test(markup)) {
            markup = markup.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
        if (mobile.thumbUrl) URL.revokeObjectURL(mobile.thumbUrl);
        mobile.thumbUrl = url;
        mobile.thumbRevision = snapshot.revision;
        if (state.els.mobileThumb) state.els.mobileThumb.src = url;
    }

    /**
     * @description Shows #mobile-bar on narrow screens while the preview
     * card is scrolled out of view, a code exists and the keyboard is closed.
     */
    function updateMobileBar() {
        const els = state.els;
        const mobile = state.mobile;
        if (!els.mobileBar) return;

        const hasCode = Boolean(state.app.getSnapshot());
        const stageOk = state.stageState === 'ready' || (state.stageState === 'pending' && mobile.everReady && hasCode);
        const keyboardOpen = mobile.keyboardOpen || (mobile.coarse && mobile.textFocused);
        const show = mobile.narrow && stageOk && hasCode && !mobile.previewVisible && !keyboardOpen;

        if (show) updateThumb();
        if (els.mobileBar.hidden === !show) return;

        if (!show && els.mobileBar.contains(document.activeElement)) {
            els.downloadBtn?.focus({ preventScroll: true });
        }
        els.mobileBar.hidden = !show;
        document.body.classList.toggle('has-mobile-bar', show);
    }

    function setupMobileBar() {
        const els = state.els;
        const mobile = state.mobile;
        if (!els.mobileBar) return;

        if (typeof matchMedia === 'function') {
            const narrow = matchMedia(NARROW_QUERY);
            const coarse = matchMedia('(pointer: coarse)');
            mobile.narrow = narrow.matches;
            mobile.coarse = coarse.matches;
            const onChange = () => {
                mobile.narrow = narrow.matches;
                mobile.coarse = coarse.matches;
                updateMobileBar();
            };
            narrow.addEventListener?.('change', onChange);
            coarse.addEventListener?.('change', onChange);
        }

        // The strip under the sticky header does not count as visible.
        if (typeof IntersectionObserver === 'function' && els.container) {
            const header = byId('menu-bar');
            const headerHeight = header ? Math.round(header.getBoundingClientRect().height) : 0;
            const observer = new IntersectionObserver(entries => {
                mobile.previewVisible = entries[entries.length - 1].isIntersecting;
                updateMobileBar();
            }, { rootMargin: `-${headerHeight}px 0px 0px 0px` });
            observer.observe(els.container);
        }

        const viewport = window.visualViewport;
        if (viewport) {
            const checkKeyboard = () => {
                mobile.keyboardOpen = viewport.height < 0.75 * window.innerHeight;
                updateMobileBar();
            };
            viewport.addEventListener('resize', checkKeyboard);
            checkKeyboard();
        }

        document.addEventListener('focusin', event => {
            const focused = isTextEntry(event.target);
            if (focused !== mobile.textFocused) {
                mobile.textFocused = focused;
                updateMobileBar();
            }
        });
        document.addEventListener('focusout', () => {
            setTimeout(() => {
                const focused = isTextEntry(document.activeElement);
                if (focused !== mobile.textFocused) {
                    mobile.textFocused = focused;
                    updateMobileBar();
                }
            }, 0);
        });

        els.mobileThumbBtn?.addEventListener('click', () => {
            els.container?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            els.previewTitle?.focus({ preventScroll: true });
        });
        els.mobileDownloadBtn?.addEventListener('click', onDownload);
        els.mobileShareBtn?.addEventListener('click', onShare);
    }

    // --- Option changes ---

    function update(patch) {
        state.app.updateExportOptions(patch);
    }

    function bindControls() {
        const els = state.els;

        els.formatRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) update({ format: radio.value });
            });
        });

        els.sizeSelect?.addEventListener('change', () => {
            const value = els.sizeSelect.value;
            update({ pixelSize: value === 'custom' ? 'custom' : Number(value) });
        });

        els.sizeCustom?.addEventListener('input', () => {
            const pixels = checkPixels(els.sizeCustom.valueAsNumber);
            if (pixels === null) {
                markInvalid('size-custom');
                return;
            }
            clearFieldError('size-custom');
            update({ customPixels: pixels });
            updateActions();
        });
        els.sizeCustom?.addEventListener('change', () => showFieldError('size-custom'));

        els.printToggle?.addEventListener('change', () => {
            update({ print: { enabled: els.printToggle.checked } });
        });

        els.printWidth?.addEventListener('input', () => {
            const unit = state.app.getExportOptions().print.unit;
            const width = checkWidth(els.printWidth.valueAsNumber, unit);
            if (width === null) {
                markInvalid('print-width');
                return;
            }
            clearFieldError('print-width');
            update({ print: { width } });
            updateActions();
        });
        els.printWidth?.addEventListener('change', () => showFieldError('print-width'));

        els.unitRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                const print = state.app.getExportOptions().print;
                if (print.unit === radio.value) return;
                clearFieldError('print-width');
                // Switching back without an edit restores the exact width.
                // Otherwise the controller converts the width to the new unit.
                const memo = state.unitMemo;
                const restore = memo && memo.unit === radio.value && memo.converted === print.width;
                update({ print: restore ? { unit: radio.value, width: memo.width } : { unit: radio.value } });
                const converted = state.app.getExportOptions().print.width;
                state.unitMemo = { unit: print.unit, width: print.width, converted };
            });
        });

        els.printDpi?.addEventListener('change', () => update({ print: { dpi: Number(els.printDpi.value) } }));
        els.pdfPage?.addEventListener('change', () => update({ page: els.pdfPage.value }));
        els.colorMode?.addEventListener('change', () => update({ colorMode: els.colorMode.value }));

        els.downloadBtn?.addEventListener('click', onDownload);
        els.copyBtn?.addEventListener('click', onCopy);
        els.shareBtn?.addEventListener('click', onShare);
        // A share right after the code appears would otherwise build the file
        // inside the click, and Safari drops the user activation meanwhile.
        [els.shareBtn, els.mobileShareBtn].forEach(button => {
            button?.addEventListener('pointerdown', prepareShareNow);
            button?.addEventListener('focus', prepareShareNow);
        });
        els.printBtn?.addEventListener('click', onPrint);
        els.payloadRevealBtn?.addEventListener('click', onRevealPayload);
        els.copyTextBtn?.addEventListener('click', onCopyText);
    }

    function onOptionsChanged() {
        state.exportNotes = [];
        render();
        scheduleSharePrepare();
    }

    function onPreviewReady() {
        state.exportNotes = [];
        syncStage();
    }

    function onLocale() {
        updateSummary();
        refreshFieldErrorTexts();
        const snapshot = state.app.getSnapshot();
        if (state.payloadSource !== null && snapshot) renderPayloadText(snapshot);
    }

    /**
     * @description Wires the export group, the encoded data panel, the print
     * sheet and the phone bar, then restores the saved export options.
     */
    function init(app) {
        if (state.initialized || !app || typeof document === 'undefined') return;
        if (!byId('export-group')) return;
        state.initialized = true;
        state.app = app;

        cacheElements();
        detectSupport();
        applyWebpSupport();

        const kit = ui();
        if (kit) {
            state.more = kit.disclosure(state.els.moreToggle, state.els.morePanel);
            state.payload = kit.disclosure(state.els.payloadToggle, state.els.payloadPanel);
        }

        bindControls();
        setupMobileBar();

        state.stageState = readStageState();
        render();
        syncStage();

        app.on('export', onOptionsChanged);
        app.on('preview-start', syncStage);
        app.on('preview-ready', onPreviewReady);
        app.on('preview-empty', syncStage);
        app.on('i18n', onLocale);

        if (state.els.stage && typeof MutationObserver === 'function') {
            new MutationObserver(syncStage).observe(state.els.stage, { attributes: true, attributeFilter: ['data-state'] });
        }

        probeCapabilities();
    }

    const api = {
        init,
        // Pure helpers, exposed for the unit tests and for other modules.
        helpers: Object.freeze({
            fieldLayout,
            checkWidth,
            checkPixels,
            localizeNote
        })
    };

    globalThis.QRTurboExportUI = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
