// QRTurbo.app - Shared UI helpers (QRTurboUI)
// Toasts, screen reader announcements, disclosures, drop zones, lazy script
// loading, downloads, clipboard text and locale-aware number formatting.
// Every helper feature-detects the browser APIs it uses and does nothing at
// load time besides declarations.
(function () {
    'use strict';

    // The ?v= query of this script. Lazy scripts, the scan worker and the
    // service worker reuse it, so they share the release's cache key.
    const ASSET_VERSION_QUERY = (typeof document !== 'undefined'
        && document.currentScript?.src.match(/\?v=[^#&]+/)?.[0]) || '';

    const TOAST_TIMEOUTS = { info: 6000, success: 6000, error: 10000, action: 8000 };
    const TOAST_LIMIT = 3;
    const TOAST_EXIT_MS = 160;
    const ANNOUNCE_DELAY = 100;
    const BLOB_URL_LIFETIME = 30000;
    const MM_PER_INCH = 25.4;
    const RADIO_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);
    const RADIO_GROUP_SELECTOR = 'fieldset, [role="radiogroup"], .radio-group-container';
    const KEYBOARD_CLASS = 'is-keyboard';

    const scriptLoads = new Map();
    const disclosures = new WeakMap();
    const numberFormats = new Map();
    const toasts = [];
    const state = {
        initialized: false,
        keyboardRadios: false,
        previewFit: false,
        announceTimer: null
    };

    // --- Small helpers ---

    function hasDocument() {
        return typeof document !== 'undefined' && typeof document.createElement === 'function';
    }

    function translate(key, vars) {
        return typeof globalThis.t === 'function' ? globalThis.t(key, vars) : key;
    }

    function prefersReducedMotion() {
        return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * @description The page language as an Intl locale. core.js keeps it in
     * the global lexical binding currentLang; <html lang> is the fallback.
     */
    function currentLocale() {
        const lang = typeof currentLang === 'string' ? currentLang
            : (hasDocument() && document.documentElement?.getAttribute('lang')) || 'en';
        return lang.toLowerCase() === 'zh-hant' ? 'zh-Hant' : lang;
    }

    /**
     * @description Returns a cached Intl.NumberFormat, or null when the
     * options (for example unit formatting) are not supported.
     */
    function numberFormat(options) {
        const locale = currentLocale();
        const key = `${locale}|${JSON.stringify(options)}`;
        if (!numberFormats.has(key)) {
            let format = null;
            try {
                format = new Intl.NumberFormat(locale, options);
            } catch (error) {
                try {
                    format = new Intl.NumberFormat('en', options);
                } catch (fallbackError) {
                    format = null;
                }
            }
            numberFormats.set(key, format);
        }
        return numberFormats.get(key);
    }

    // --- Script loading ---

    /**
     * @description Loads a classic script once. Repeated calls for the same
     * path share one promise; a failed load can be retried.
     */
    function loadScript(path) {
        if (!scriptLoads.has(path)) {
            scriptLoads.set(path, new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `${path}${ASSET_VERSION_QUERY}`;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => {
                    scriptLoads.delete(path);
                    script.remove();
                    reject(new Error(`Script failed to load: ${path}`));
                };
                document.head.appendChild(script);
            }));
        }
        return scriptLoads.get(path);
    }

    // --- Announcements ---

    /**
     * @description Speaks a message through the polite #sr-announcer region
     * without showing anything. Clearing first makes a repeated message
     * audible again.
     */
    function announce(message) {
        if (!hasDocument() || !message) return;
        const region = document.getElementById('sr-announcer');
        if (!region) return;
        region.textContent = '';
        clearTimeout(state.announceTimer);
        state.announceTimer = setTimeout(() => {
            region.textContent = String(message);
        }, ANNOUNCE_DELAY);
    }

    // --- Toasts ---

    function getToastRegion() {
        let region = document.getElementById('toast-region');
        if (!region) {
            region = document.createElement('div');
            region.id = 'toast-region';
            region.className = 'toast-region';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-label', translate('aria.notifications'));
            document.body.appendChild(region);
        }
        return region;
    }

    function createIcon(pathData) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        return svg;
    }

    function startToastTimer(entry) {
        clearTimeout(entry.timer);
        if (!(entry.remaining > 0) || entry.paused) return;
        entry.startedAt = Date.now();
        entry.timer = setTimeout(() => entry.dismiss(), entry.remaining);
    }

    function pauseToast(entry) {
        if (entry.paused || entry.closed) return;
        entry.paused = true;
        clearTimeout(entry.timer);
        // A toast without a timeout (timeoutMs 0) stays until it is dismissed.
        if (entry.remaining > 0) {
            entry.remaining = Math.max(1000, entry.remaining - (Date.now() - entry.startedAt));
        }
    }

    function resumeToast(entry) {
        if (!entry.paused || entry.closed) return;
        if (entry.element.matches(':hover') || entry.element.contains(document.activeElement)) return;
        entry.paused = false;
        startToastTimer(entry);
    }

    /**
     * @description Shows a toast in #toast-region. Toasts never take focus,
     * pause while hovered or focused, close with Esc or their dismiss
     * button, and close on their own after 6 s (errors 10 s, toasts with an
     * action 8 s) unless o.timeoutMs says otherwise. Returns { dismiss() }.
     */
    function toast(message, o = {}) {
        const noop = { dismiss() {} };
        if (!hasDocument() || !document.body || !message) return noop;

        const tone = ['info', 'success', 'error'].includes(o.tone) ? o.tone : 'info';
        const hasAction = typeof o.onAction === 'function' && Boolean(o.actionLabel);
        const timeout = Number.isFinite(o.timeoutMs)
            ? o.timeoutMs
            : (tone === 'error' ? TOAST_TIMEOUTS.error : (hasAction ? TOAST_TIMEOUTS.action : TOAST_TIMEOUTS[tone]));

        const element = document.createElement('div');
        element.className = `toast toast-${tone}`;
        element.dataset.tone = tone;

        const text = document.createElement('p');
        text.className = 'toast-message';
        text.textContent = String(message);
        element.appendChild(text);

        const entry = {
            element,
            message: text.textContent,
            remaining: timeout,
            startedAt: Date.now(),
            timer: null,
            paused: false,
            closed: false,
            returnFocus: null,
            dismiss: null
        };

        entry.dismiss = function dismiss() {
            if (entry.closed) return;
            entry.closed = true;
            clearTimeout(entry.timer);
            const index = toasts.indexOf(entry);
            if (index >= 0) toasts.splice(index, 1);

            // A toast never keeps focus: give it back to where it came from.
            if (element.contains(document.activeElement)) {
                const target = entry.returnFocus;
                if (target && target.isConnected && typeof target.focus === 'function') {
                    target.focus({ preventScroll: true });
                } else {
                    document.activeElement.blur();
                }
            }

            element.classList.add('is-leaving');
            setTimeout(() => element.remove(), prefersReducedMotion() ? 0 : TOAST_EXIT_MS);
        };

        if (hasAction) {
            const action = document.createElement('button');
            action.type = 'button';
            action.className = 'toast-action';
            action.textContent = String(o.actionLabel);
            action.addEventListener('click', () => {
                entry.dismiss();
                try {
                    o.onAction();
                } catch (error) {
                    console.error('Toast action failed:', error);
                }
            });
            element.appendChild(action);
        }

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'toast-close';
        close.setAttribute('aria-label', translate('actions.dismiss'));
        close.appendChild(createIcon('M6 6l12 12M18 6 6 18'));
        close.addEventListener('click', () => entry.dismiss());
        element.appendChild(close);

        element.addEventListener('mouseenter', () => pauseToast(entry));
        element.addEventListener('mouseleave', () => resumeToast(entry));
        element.addEventListener('focusin', event => {
            if (!element.contains(event.relatedTarget)) {
                entry.returnFocus = event.relatedTarget || entry.returnFocus;
            }
            pauseToast(entry);
        });
        element.addEventListener('focusout', event => {
            if (!element.contains(event.relatedTarget)) {
                setTimeout(() => resumeToast(entry), 0);
            }
        });

        // The same message again replaces the old toast instead of stacking.
        toasts.filter(other => other.message === entry.message).forEach(other => other.dismiss());

        getToastRegion().appendChild(element);
        toasts.push(entry);
        while (toasts.length > TOAST_LIMIT) {
            toasts[0].dismiss();
        }
        startToastTimer(entry);

        return { dismiss: entry.dismiss };
    }

    function onDocumentKeydown(event) {
        if (event.key !== 'Escape' || event.defaultPrevented || !toasts.length) return;
        // Dialogs and menus handle their own Escape.
        if (event.target?.closest?.('dialog[open], select')) return;
        const focused = toasts.find(entry => entry.element.contains(event.target));
        (focused || toasts[toasts.length - 1]).dismiss();
    }

    // --- Disclosure ---

    /**
     * @description Wires a button with aria-expanded to show and hide a
     * panel through its hidden attribute. Calling it twice for the same
     * button returns the first controller.
     */
    function disclosure(button, panel, o = {}) {
        if (!button || !panel) {
            return { open() {}, close() {}, toggle() {}, isOpen: () => false };
        }
        if (disclosures.has(button)) return disclosures.get(button);

        const isOpen = () => button.getAttribute('aria-expanded') === 'true';
        const set = open => {
            const changed = open !== isOpen() || panel.hidden === open;
            button.setAttribute('aria-expanded', String(open));
            panel.hidden = !open;
            if (changed && typeof o.onToggle === 'function') o.onToggle(open);
        };

        if (panel.id && !button.hasAttribute('aria-controls')) {
            button.setAttribute('aria-controls', panel.id);
        }
        panel.hidden = !isOpen();
        button.addEventListener('click', () => set(!isOpen()));

        const controller = Object.freeze({
            open: () => set(true),
            close: () => set(false),
            toggle: () => set(!isOpen()),
            isOpen
        });
        disclosures.set(button, controller);
        return controller;
    }

    // --- Drop zone ---

    function hasFiles(event) {
        const types = event.dataTransfer?.types;
        return Boolean(types) && Array.from(types).includes('Files');
    }

    function isTextEntry(element) {
        if (!element || element === document.body) return false;
        if (element.isContentEditable) return true;
        if (element.tagName === 'TEXTAREA') return true;
        if (element.tagName !== 'INPUT') return false;
        return !['button', 'checkbox', 'color', 'file', 'radio', 'range', 'reset', 'submit'].includes(element.type);
    }

    /**
     * @description True when an open modal dialog makes the rest of the page
     * inert and the element is not inside it.
     */
    function isBehindModal(element) {
        const dialogs = Array.from(document.querySelectorAll('dialog[open]'));
        return dialogs.some(dialog => {
            let modal = true;
            try {
                modal = dialog.matches(':modal');
            } catch (error) {
                // Without :modal support every open dialog counts as modal.
                modal = true;
            }
            return modal && !dialog.contains(element);
        });
    }

    /**
     * @description Turns an element into a file drop zone. Dragging files
     * over it adds .is-dragover and shows any [data-drop-overlay] or
     * .logo-drop-overlay child. With o.paste, pasting image files anywhere
     * outside a text field also counts. Files go through o.accept; the
     * accepted ones reach o.onFiles, otherwise o.onReject('type'|'count').
     */
    function dropzone(zone, o = {}) {
        if (!zone || zone.dataset.dropzone === 'true') return;
        zone.dataset.dropzone = 'true';

        const accept = typeof o.accept === 'function' ? o.accept : () => true;
        const onFiles = typeof o.onFiles === 'function' ? o.onFiles : () => {};
        const onReject = typeof o.onReject === 'function' ? o.onReject : () => {};
        let depth = 0;

        const setActive = active => {
            zone.classList.toggle('is-dragover', active);
            zone.querySelectorAll('[data-drop-overlay], .logo-drop-overlay').forEach(overlay => {
                overlay.hidden = !active;
            });
        };

        const handle = list => {
            const files = Array.from(list || []);
            if (!files.length) return;
            if (files.length > 1 && !o.multiple) {
                onReject('count');
                return;
            }
            const accepted = files.filter(file => {
                try {
                    return accept(file);
                } catch (error) {
                    return false;
                }
            });
            if (accepted.length) {
                onFiles(accepted);
            } else {
                onReject('type');
            }
        };

        zone.addEventListener('dragenter', event => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            depth += 1;
            setActive(true);
        });
        zone.addEventListener('dragover', event => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        });
        zone.addEventListener('dragleave', event => {
            if (!hasFiles(event)) return;
            depth = Math.max(0, depth - 1);
            if (depth === 0) setActive(false);
        });
        zone.addEventListener('drop', event => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            event.stopPropagation();
            depth = 0;
            setActive(false);
            handle(event.dataTransfer.files);
        });

        if (o.paste) {
            document.addEventListener('paste', event => {
                // One paste reaches one drop zone, never one behind a modal dialog.
                if (event.defaultPrevented || !zone.isConnected || isTextEntry(document.activeElement)) return;
                if (zone.closest('[hidden], dialog:not([open])') || isBehindModal(zone)) return;
                const items = Array.from(event.clipboardData?.items || []);
                const files = items
                    .filter(item => item.kind === 'file')
                    .map(item => item.getAsFile())
                    .filter(Boolean);
                if (!files.length) return;
                event.preventDefault();
                handle(files);
            });
        }
    }

    // A file dropped next to a drop zone must not replace the page.
    function onDocumentDrag(event) {
        if (!hasFiles(event) || event.defaultPrevented) return;
        if (event.target?.closest?.('input[type="file"]')) return;
        event.preventDefault();
        if (event.type === 'dragover') event.dataTransfer.dropEffect = 'none';
    }

    // --- Files and clipboard ---

    /**
     * @description Saves a Blob through a temporary download link. The
     * object URL is revoked after 30 s, long enough for every browser to
     * start the download.
     */
    function saveBlob(blob, filename) {
        if (!hasDocument() || !blob || typeof URL?.createObjectURL !== 'function') return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        link.rel = 'noopener';
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), BLOB_URL_LIFETIME);
    }

    /**
     * @description The execCommand fallback for browsers without the
     * Clipboard API. The helper field is fixed in the viewport and focused
     * without scrolling, so the page never jumps.
     */
    function copyWithSelection(text) {
        if (!hasDocument() || typeof document.execCommand !== 'function') return false;
        const previous = document.activeElement;
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.setAttribute('aria-hidden', 'true');
        area.tabIndex = -1;
        Object.assign(area.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '1px',
            height: '1px',
            padding: '0',
            border: '0',
            opacity: '0'
        });
        document.body.appendChild(area);
        area.focus({ preventScroll: true });
        area.select();
        // iOS Safari selects a read-only field only through a range.
        if (typeof area.setSelectionRange === 'function') area.setSelectionRange(0, area.value.length);
        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (error) {
            copied = false;
        }
        area.remove();
        if (previous && typeof previous.focus === 'function') previous.focus({ preventScroll: true });
        return copied;
    }

    // ClipboardItem plus clipboard.write for text, where the browser can say
    // so (ClipboardItem.supports).
    function canWriteTextItem(clipboard) {
        if (typeof ClipboardItem !== 'function' || !clipboard || typeof clipboard.write !== 'function') return false;
        if (typeof ClipboardItem.supports !== 'function') return true;
        try {
            return Boolean(ClipboardItem.supports('text/plain'));
        } catch (error) {
            return false;
        }
    }

    /**
     * @description Copies text that is not known yet. The clipboard write
     * starts at once with a text/plain ClipboardItem that waits for the
     * text, because Safari drops the user activation at the first await.
     * Without that, or when it fails, the text is written once it is known.
     */
    async function copyPendingText(clipboard, pending) {
        const textPromise = Promise.resolve(pending).then(value => {
            if (typeof value !== 'string' || !value) throw new Error('There is no text to copy');
            return value;
        });
        textPromise.catch(() => {});
        if (canWriteTextItem(clipboard)) {
            try {
                const blob = textPromise.then(value => new Blob([value], { type: 'text/plain' }));
                blob.catch(() => {});
                await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
                return true;
            } catch (error) {
                // Write the text once it is known instead.
            }
        }
        let value;
        try {
            value = await textPromise;
        } catch (error) {
            return false;
        }
        return copyText(value);
    }

    /**
     * @description Copies text to the clipboard. Call it synchronously from
     * the click handler; while the text is still being prepared, pass a
     * Promise of it. Resolves true on success and false when the browser
     * does not allow it or the Promise gives no text.
     */
    async function copyText(text) {
        const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
        if (text && typeof text.then === 'function') return copyPendingText(clipboard, text);
        const value = String(text ?? '');
        if (clipboard && typeof clipboard.writeText === 'function') {
            try {
                await clipboard.writeText(value);
                return true;
            } catch (error) {
                return copyWithSelection(value);
            }
        }
        return copyWithSelection(value);
    }

    // --- Numbers and lengths ---

    /**
     * @description Formats a number for the page language, for example
     * 2331 -> "2,331" in English and "2 331" in Finnish.
     */
    function formatNumber(n, maxFractionDigits) {
        const value = Number(n);
        if (!Number.isFinite(value)) return String(n);
        const options = Number.isInteger(maxFractionDigits)
            ? { maximumFractionDigits: Math.max(0, Math.min(20, maxFractionDigits)) }
            : {};
        const format = numberFormat(options);
        return format ? format.format(value) : String(value);
    }

    function formatUnit(value, unit, maxFractionDigits) {
        const format = numberFormat({
            style: 'unit',
            unit,
            unitDisplay: 'short',
            maximumFractionDigits: maxFractionDigits
        });
        if (format) return format.format(value);
        const fallback = { millimeter: 'mm', centimeter: 'cm', meter: 'm', inch: 'in', foot: 'ft' };
        return `${formatNumber(value, maxFractionDigits)} ${fallback[unit]}`;
    }

    function lengthDigits(value, small, medium) {
        if (value < small) return 2;
        if (value < medium) return 1;
        return 0;
    }

    /**
     * @description Formats a physical length given in millimeters, in mm for
     * 'metric' and in inches for 'imperial'. Small values keep more decimals:
     * 1.22 -> "1.22 mm", 50 -> "50 mm", 1.27 mm -> "0.05 in".
     */
    function formatLength(mm, system) {
        const value = Math.max(0, Number(mm) || 0);
        if (system === 'imperial') {
            const inches = value / MM_PER_INCH;
            const digits = inches < 0.1 ? 3 : (inches < 10 ? 2 : 1);
            return formatUnit(inches, 'inch', digits);
        }
        return formatUnit(value, 'millimeter', lengthDigits(value, 10, 100));
    }

    /**
     * @description Formats a viewing distance given in millimeters: cm or m
     * for 'metric', inches or feet for 'imperial'. 500 -> "50 cm",
     * 2500 -> "2.5 m", 1524 -> "5 ft".
     */
    function formatDistance(mm, system) {
        const value = Math.max(0, Number(mm) || 0);
        if (system === 'imperial') {
            const inches = value / MM_PER_INCH;
            if (inches < 36) return formatUnit(inches, 'inch', inches < 10 ? 1 : 0);
            const feet = inches / 12;
            return formatUnit(feet, 'foot', feet < 10 ? 1 : 0);
        }
        if (value < 1000) {
            const cm = value / 10;
            return formatUnit(cm, 'centimeter', cm < 10 ? 1 : 0);
        }
        const meters = value / 1000;
        return formatUnit(meters, 'meter', meters < 10 ? 1 : 0);
    }

    // --- Keyboard focus in radio groups ---

    /**
     * @description The group that shows a radio's focus ring: its closest
     * fieldset, [role="radiogroup"] or .radio-group-container.
     */
    function radioGroupOf(element) {
        if (!element || element.tagName !== 'INPUT' || element.type !== 'radio') return null;
        return typeof element.closest === 'function' ? element.closest(RADIO_GROUP_SELECTOR) : null;
    }

    function onRadioKeydown(event) {
        if (!RADIO_KEYS.has(event.key)) return;
        radioGroupOf(event.target)?.classList?.add(KEYBOARD_CLASS);
    }

    function onRadioFocusOut(event) {
        const group = radioGroupOf(event.target);
        if (group && !group.contains(event.relatedTarget)) group.classList.remove(KEYBOARD_CLASS);
    }

    function onPointerDown() {
        document.querySelectorAll(`.${KEYBOARD_CLASS}`).forEach(group => group.classList.remove(KEYBOARD_CLASS));
    }

    /**
     * @description WebKit does not match :focus-visible when the arrow keys
     * (or Home and End) move the choice in a radio group. A group used that
     * way gets .is-keyboard, so the CSS keeps the ring on its focused radio
     * with ".is-keyboard ... :focus". A pointer press anywhere, or focus
     * leaving the group, removes the class. Installs one set of document
     * listeners, however often it is called.
     */
    function trackKeyboardRadios() {
        if (state.keyboardRadios || !hasDocument() || typeof document.addEventListener !== 'function') return;
        state.keyboardRadios = true;
        document.addEventListener('keydown', onRadioKeydown);
        document.addEventListener('focusout', onRadioFocusOut);
        document.addEventListener('pointerdown', onPointerDown);
    }

    // --- Preview fit ---

    /**
     * @description Keeps --preview-chrome on the preview column up to date:
     * the height of the preview card (#qr-container) without its stage.
     * stage.css sizes the stage from it, so the whole card fits the sticky
     * column on desktop. Every part of the card except the stage is
     * observed, so resizing the stage never triggers another measurement.
     * While the column has to scroll and more of the card waits below its
     * edge, the column gets .is-clipped, and styles.css fades that edge.
     */
    function fitPreview() {
        if (state.previewFit || !hasDocument() || typeof ResizeObserver !== 'function') return;
        const card = document.getElementById('qr-container');
        const stage = document.getElementById('qr-stage');
        const column = card?.parentElement;
        if (!card || !stage || !column?.style || typeof getComputedStyle !== 'function') return;
        state.previewFit = true;

        const updateClip = () => {
            const hidden = column.scrollHeight - column.clientHeight - column.scrollTop;
            column.classList.toggle('is-clipped', hidden > 1);
        };
        const update = () => {
            const chrome = card.getBoundingClientRect().height - stage.getBoundingClientRect().height;
            const value = `${Math.max(0, Math.ceil(chrome))}px`;
            if (column.style.getPropertyValue('--preview-chrome') !== value) {
                column.style.setProperty('--preview-chrome', value);
            }
            updateClip();
        };
        const observer = new ResizeObserver(update);
        const observeParts = parent => Array.from(parent.children).forEach(part => {
            if (part === stage) return;
            // The children of a display: contents wrapper are the card's parts.
            if (getComputedStyle(part).display === 'contents') {
                observeParts(part);
            } else {
                observer.observe(part);
            }
        });
        observeParts(card);
        // Breakpoints on the window height change the card padding alone.
        globalThis.addEventListener?.('resize', update);
        column.addEventListener('scroll', updateClip, { passive: true });
        update();
    }

    // --- Startup ---

    /**
     * @description Wires the document-level behavior: Esc closes the newest
     * toast, files dropped outside a drop zone never open in the tab, radio
     * groups keep their focus ring under the arrow keys, and the preview
     * card fits the window.
     */
    function init() {
        if (state.initialized || !hasDocument()) return;
        state.initialized = true;
        document.addEventListener('keydown', onDocumentKeydown);
        document.addEventListener('dragover', onDocumentDrag);
        document.addEventListener('drop', onDocumentDrag);
        trackKeyboardRadios();
        fitPreview();
    }

    const api = {
        ASSET_VERSION_QUERY,
        init,
        trackKeyboardRadios,
        toast,
        announce,
        disclosure,
        dropzone,
        loadScript,
        saveBlob,
        copyText,
        formatNumber,
        formatLength,
        formatDistance
    };

    globalThis.QRTurboUI = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
