// QRTurbo.app - Scan check (QRTurboScan)
// Owns #scan-badge and #scan-warnings. 400 ms after each preview it draws the
// preview on a white canvas at 4 px per module, decodes it with the vendored
// jsQR in a worker (retrying once at 8 px per module), runs QRTurboRules and
// emits 'scan'. A change of the export options re-runs only the rules.
// Results for a preview that is no longer current are dropped.
//
// Decoders, in order: /js/scan-worker.js; jsQR on the main thread at idle
// time when the worker cannot start; otherwise 'unavailable', which the
// badge shows as "Looks good" instead of "Scans well".
(function () {
    'use strict';

    const SCAN_DELAY = 400;
    const BASE_PX_PER_MODULE = 4;
    const LARGE_PX_PER_MODULE = 8;
    const MIN_SCAN_PX = 200;
    const MAX_SCAN_PX = 4096;
    const IMAGE_TIMEOUT = 8000;
    const DECODE_TIMEOUT = 10000;
    const UNDO_TIMEOUT = 8000;
    const MM_PER_INCH = 25.4;

    // Internal outcomes, never returned from the public API.
    const UNAVAILABLE = 'unavailable';
    const WORKER_FAILED = { reason: 'worker-failed' };
    const TIMED_OUT = { reason: 'timed-out' };
    const CANCELLED = { reason: 'cancelled' };

    const decoder = {
        mode: 'worker', // 'worker', then 'main' after a worker failure, then 'none'
        worker: null,
        nextId: 1,
        pending: new Map(),
        mainReady: null
    };

    const view = {
        app: null,
        badge: null,
        label: null,
        panel: null,
        summary: null,
        list: null,
        expanded: false,
        visible: false,
        checking: false,
        snapshot: null,
        // The newest preview revision the controller started. A snapshot
        // older than this is stale even while the newer one is pending.
        latestRevision: 0,
        decode: null,
        result: null,
        timer: null,
        issuesSignature: ''
    };

    // --- Text and number formatting ---

    function translate(key, vars) {
        return typeof t === 'function' ? t(key, vars) : key;
    }

    function language() {
        return typeof currentLang === 'string' && currentLang ? currentLang : 'en';
    }

    function formatNumber(value, options) {
        try {
            return new Intl.NumberFormat(language(), options).format(value);
        } catch (error) {
            return new Intl.NumberFormat('en', options).format(value);
        }
    }

    function formatUnit(value, unit, maximumFractionDigits) {
        try {
            return formatNumber(value, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits });
        } catch (error) {
            const short = unit === 'inch' ? 'in' : 'mm';
            return `${formatNumber(value, { maximumFractionDigits })} ${short}`;
        }
    }

    /**
     * @description Formats the raw numbers in issue vars (see lib/rules.js):
     * a module size in mm with its unit system, a print width in its unit,
     * or an image width in px.
     */
    function displayVars(vars) {
        if (!vars) return undefined;
        const out = { ...vars };
        if (typeof vars.size === 'number') {
            if (vars.system === 'imperial') out.size = formatUnit(vars.size / MM_PER_INCH, 'inch', 3);
            else if (vars.system === 'metric') out.size = formatUnit(vars.size, 'millimeter', 2);
            else if (vars.unit === 'in') out.size = formatUnit(vars.size, 'inch', 1);
            else if (vars.unit === 'mm') out.size = formatUnit(vars.size, 'millimeter', 0);
            else out.size = formatNumber(vars.size, { useGrouping: false, maximumFractionDigits: 0 });
        }
        return out;
    }

    function fixLabel(fix) {
        return translate(fix.labelKey, displayVars(fix.vars));
    }

    // --- Decoding ---

    function settlePending(outcome) {
        const entries = [...decoder.pending.values()];
        decoder.pending.clear();
        entries.forEach(entry => {
            clearTimeout(entry.timer);
            entry.resolve(outcome);
        });
    }

    function dropWorker(outcome) {
        if (decoder.worker) decoder.worker.terminate();
        decoder.worker = null;
        settlePending(outcome);
    }

    /**
     * @description The worker could not load jsQR or crashed. Every later
     * decode runs on the main thread instead.
     */
    function failWorker() {
        if (decoder.mode === 'worker') decoder.mode = 'main';
        dropWorker(WORKER_FAILED);
    }

    function onWorkerMessage(event) {
        const message = event.data || {};
        const entry = decoder.pending.get(message.id);
        if (!entry) return;

        decoder.pending.delete(message.id);
        clearTimeout(entry.timer);
        if (message.unavailable) {
            failWorker();
            entry.resolve(WORKER_FAILED);
            return;
        }
        entry.resolve(Array.isArray(message.bytes) ? message.bytes : null);
    }

    function createWorker() {
        if (typeof Worker !== 'function') return null;
        const query = (globalThis.QRTurboUI && globalThis.QRTurboUI.ASSET_VERSION_QUERY) || '';
        const worker = new Worker('/js/scan-worker.js' + query);
        worker.addEventListener('message', onWorkerMessage);
        worker.addEventListener('messageerror', failWorker);
        worker.addEventListener('error', event => {
            if (event && typeof event.preventDefault === 'function') event.preventDefault();
            failWorker();
        });
        return worker;
    }

    /**
     * @description Sends a copy of the pixels to the worker, so the caller's
     * image stays usable for the main-thread fallback. Resolves with the
     * decoded bytes, null, WORKER_FAILED or TIMED_OUT.
     */
    function workerDecode(image) {
        return new Promise(resolve => {
            if (!decoder.worker) {
                try {
                    decoder.worker = createWorker();
                } catch (error) {
                    decoder.worker = null;
                }
            }
            const worker = decoder.worker;
            if (!worker) {
                decoder.mode = 'main';
                resolve(WORKER_FAILED);
                return;
            }

            const id = decoder.nextId;
            decoder.nextId += 1;
            // A worker that stops answering is replaced on the next request.
            const timer = setTimeout(() => {
                if (decoder.worker === worker) dropWorker(TIMED_OUT);
            }, DECODE_TIMEOUT);
            decoder.pending.set(id, { resolve, timer });

            try {
                const pixels = image.data.slice();
                worker.postMessage({ id, width: image.width, height: image.height, buffer: pixels.buffer }, [pixels.buffer]);
            } catch (error) {
                decoder.pending.delete(id);
                clearTimeout(timer);
                failWorker();
                resolve(WORKER_FAILED);
            }
        });
    }

    function whenIdle() {
        return new Promise(resolve => {
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(() => resolve(), { timeout: 2000 });
            } else {
                setTimeout(resolve, 0);
            }
        });
    }

    function loadMainDecoder() {
        if (!decoder.mainReady) {
            const ui = globalThis.QRTurboUI;
            const load = typeof globalThis.jsQR === 'function'
                ? Promise.resolve()
                : (ui && typeof ui.loadScript === 'function'
                    ? ui.loadScript('/js/vendor/jsqr.js')
                    : Promise.reject(new Error('No script loader')));
            decoder.mainReady = load
                .then(() => typeof globalThis.jsQR === 'function')
                .catch(() => false);
        }
        return decoder.mainReady;
    }

    async function mainDecode(image) {
        if (!(await loadMainDecoder())) {
            decoder.mode = 'none';
            return UNAVAILABLE;
        }
        await whenIdle();
        try {
            const result = globalThis.jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
            return result && result.binaryData ? Array.from(result.binaryData) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * @description Decoded payload bytes, null when no code was found, or
     * UNAVAILABLE when no decoder can run.
     */
    async function decodeBytes(image) {
        if (decoder.mode === 'worker') {
            const outcome = await workerDecode(image);
            if (outcome === TIMED_OUT) return UNAVAILABLE;
            if (outcome !== WORKER_FAILED) return outcome;
        }
        if (decoder.mode === 'main') return mainDecode(image);
        return UNAVAILABLE;
    }

    function sameBytes(actual, expected) {
        if (!expected || actual.length !== expected.length) return false;
        for (let i = 0; i < actual.length; i += 1) {
            if (actual[i] !== expected[i]) return false;
        }
        return true;
    }

    /**
     * @description Decodes an RGBA image and compares the raw bytes with the
     * expected payload bytes.
     */
    async function decode(image, expected) {
        if (!image || !image.data || !(image.width > 0) || !(image.height > 0)) return 'none';
        const bytes = await decodeBytes(image);
        if (bytes === UNAVAILABLE) return 'unavailable';
        if (!bytes) return 'none';
        return sameBytes(bytes, expected) ? 'match' : 'mismatch';
    }

    /**
     * @description Resolves true when a decoder (worker or main thread) can
     * run in this browser. Batch mode uses it to offer its scan check.
     */
    async function available() {
        if (decoder.mode === 'none') return false;
        const probe = { width: 1, height: 1, data: new Uint8ClampedArray(4) };
        return (await decode(probe, new Uint8Array(0))) !== 'unavailable';
    }

    // --- Rasterizing a snapshot ---

    function expectedBytes(payload) {
        const bytes = globalThis.QRTurboBytes;
        try {
            if (bytes && typeof bytes.utf8 === 'function') return bytes.utf8(String(payload));
        } catch (error) {
            // Fall through to TextEncoder.
        }
        return new TextEncoder().encode(String(payload));
    }

    /**
     * @description The share of the artwork width covered by the code with
     * its quiet zone: 1 without a frame.
     */
    function qrFraction(snapshot) {
        const layout = snapshot && snapshot.frame && snapshot.frame.layout;
        if (!layout || !layout.framed || !layout.qr || !(layout.width > 0)) return 1;
        const fraction = layout.qr.size / layout.width;
        return fraction > 0 && fraction <= 1 ? fraction : 1;
    }

    function scanSize(snapshot, pxPerModule) {
        const modules = (Number(snapshot.moduleCount) + (2 * (Number(snapshot.quietZone) || 0))) / qrFraction(snapshot);
        const size = Math.ceil(modules * pxPerModule);
        return Math.min(MAX_SCAN_PX, Math.max(MIN_SCAN_PX, Number.isFinite(size) ? size : MIN_SCAN_PX));
    }

    /**
     * @description Gives the root <svg> a fixed pixel size (the preview
     * markup uses 100%) and makes sure it has the SVG namespace, which an
     * SVG image needs.
     */
    function sizedMarkup(markup, size) {
        return String(markup).replace(/<svg\b([^>]*)>/i, (tag, attributes) => {
            let rest = attributes.replace(/\s(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
            const selfClosing = /\/\s*$/.test(rest);
            if (selfClosing) rest = rest.replace(/\/\s*$/, '');
            if (!/\sxmlns\s*=/.test(rest)) rest = ` xmlns="http://www.w3.org/2000/svg"${rest}`;
            return `<svg${rest} width="${size}" height="${size}"${selfClosing ? '/' : ''}>`;
        });
    }

    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const timer = setTimeout(() => reject(new Error('Image timed out')), IMAGE_TIMEOUT);
            image.onload = () => {
                clearTimeout(timer);
                resolve(image);
            };
            image.onerror = () => {
                clearTimeout(timer);
                reject(new Error('Image failed to load'));
            };
            image.src = url;
        }).then(image => (typeof image.decode === 'function'
            ? image.decode().catch(() => undefined).then(() => image)
            : image));
    }

    /**
     * @description Draws SVG markup on a white square canvas and returns its
     * pixels. The markup goes through a blob: URL, so its ids stay isolated
     * from the page.
     */
    async function rasterize(markup, size) {
        const url = URL.createObjectURL(new Blob([sizedMarkup(markup, size)], { type: 'image/svg+xml' }));
        try {
            const image = await loadImage(url);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) throw new Error('No 2D canvas');

            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, size, size);
            context.drawImage(image, 0, 0, size, size);
            const pixels = context.getImageData(0, 0, size, size);
            canvas.width = 0;
            canvas.height = 0;
            return pixels;
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    /**
     * @description The decode result for the rules: 'pass' at 4 px per
     * module, 'pass-large' when only the 8 px retry reads it, 'fail', or null
     * when no decoder or no image is available.
     */
    async function decodeSnapshot(snapshot, isCancelled) {
        if (!snapshot || typeof snapshot.previewMarkup !== 'string' || !snapshot.previewMarkup) return null;
        const expected = expectedBytes(snapshot.payload);
        const attempts = [[BASE_PX_PER_MODULE, 'pass'], [LARGE_PX_PER_MODULE, 'pass-large']];

        for (const [pxPerModule, passed] of attempts) {
            if (isCancelled()) return CANCELLED;
            let image;
            try {
                image = await rasterize(snapshot.previewMarkup, scanSize(snapshot, pxPerModule));
            } catch (error) {
                return null;
            }
            if (isCancelled()) return CANCELLED;

            const outcome = await decode(image, expected);
            if (outcome === 'unavailable') return null;
            if (outcome === 'match') return passed;
        }
        return 'fail';
    }

    // --- Results ---

    function freezeIssue(issue) {
        if (issue.fix) {
            Object.values(issue.fix).forEach(value => {
                if (value && typeof value === 'object') Object.freeze(value);
            });
            Object.freeze(issue.fix);
        }
        if (issue.vars) Object.freeze(issue.vars);
        return Object.freeze(issue);
    }

    /**
     * @description Runs the rules for a snapshot with the given export
     * options and decode result. No decoding happens here.
     */
    function evaluate(snapshot, exportOptions, decodeResult = null) {
        const Rules = globalThis.QRTurboRules;
        const options = exportOptions || null;
        const fraction = qrFraction(snapshot);
        const moduleCount = Number(snapshot.moduleCount);
        const quietZone = Number(snapshot.quietZone) || 0;
        const analysis = { ...(snapshot.analysis || {}), version: snapshot.version || (snapshot.analysis && snapshot.analysis.version) };

        const issues = Rules.issues({
            design: snapshot.design,
            ecl: snapshot.ecl,
            eclAuto: snapshot.eclAuto,
            analysis,
            type: snapshot.tab,
            exportOptions: options,
            physical: Rules.physical(options, fraction, moduleCount, quietZone),
            pixels: Rules.pixels(options, fraction, moduleCount, quietZone),
            decode: decodeResult
        }).map(freezeIssue);
        const { state, verified } = Rules.scanState(issues, decodeResult);

        return Object.freeze({
            revision: snapshot.revision,
            state,
            verified,
            issues: Object.freeze(issues),
            decode: decodeResult
        });
    }

    function abortError() {
        if (typeof DOMException === 'function') return new DOMException('The scan check was cancelled.', 'AbortError');
        const error = new Error('The scan check was cancelled.');
        error.name = 'AbortError';
        return error;
    }

    function currentExportOptions() {
        return view.app && typeof view.app.getExportOptions === 'function' ? view.app.getExportOptions() : null;
    }

    /**
     * @description Decodes a snapshot and runs the rules. Works for any
     * snapshot (also batch rows from app.buildSnapshot) and touches no DOM
     * outside its own canvas. o.signal cancels it with an AbortError.
     */
    async function run(snapshot, opts, o = {}) {
        const signal = o && o.signal;
        const isCancelled = () => Boolean(signal && signal.aborted);
        if (isCancelled()) throw abortError();

        const decodeResult = await decodeSnapshot(snapshot, isCancelled);
        if (decodeResult === CANCELLED || isCancelled()) throw abortError();
        return evaluate(snapshot, opts || currentExportOptions(), decodeResult);
    }

    // --- Badge and issue list ---

    function badgeLabelKey(result) {
        if (!result) return 'scan.checking';
        if (result.state === 'fail') return 'scan.fail';
        if (result.state === 'warn') return 'scan.tips';
        return result.verified === true ? 'scan.ok' : 'scan.looksGood';
    }

    function summaryKey(verified) {
        if (verified === true) return 'scan.verified';
        if (verified === false) return 'scan.notVerified';
        return 'scan.unavailable';
    }

    /**
     * @description The summary normally opens the panel. When a rule fails
     * although the test scan read the code (a print size that is too small,
     * very low contrast), the issues come first, so "May not scan" is not
     * followed directly by "read the code correctly".
     */
    function summaryLast(result) {
        return Boolean(result) && result.state === 'fail' && result.verified === true;
    }

    function placeSummary(last) {
        const { summary, list } = view;
        if (!summary.parentNode || summary.parentNode !== list.parentNode) return;
        if (last && list.nextElementSibling !== summary) list.after(summary);
        else if (!last && summary.nextElementSibling !== list) list.before(summary);
    }

    function setText(element, text) {
        if (element.textContent !== text) element.textContent = text;
    }

    function issueElement(issue, message, label) {
        const item = document.createElement('li');
        item.className = 'scan-issue';
        item.dataset.issue = issue.id;
        item.dataset.severity = issue.severity;

        const text = document.createElement('p');
        text.className = 'scan-issue-text';
        text.textContent = message;
        item.appendChild(text);

        if (label !== null) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'fix-btn';
            button.textContent = label;
            item.appendChild(button);
        }
        return item;
    }

    /**
     * @description Rebuilds the issue list only when its content changed,
     * and keeps keyboard focus on the same fix, or on the badge when that
     * fix is gone.
     */
    function renderIssues(issues) {
        const list = view.list;
        const rows = issues.map(issue => ({
            issue,
            message: translate(issue.messageKey, displayVars(issue.vars)),
            label: issue.fix ? fixLabel(issue.fix) : null
        }));
        const signature = JSON.stringify(rows.map(row => [row.issue.id, row.issue.severity, row.message, row.label]));

        if (signature !== view.issuesSignature) {
            const active = document.activeElement;
            const focusedItem = active && list.contains(active) ? active.closest('li') : null;
            const focusedId = focusedItem ? focusedItem.dataset.issue : null;

            list.replaceChildren(...rows.map(row => issueElement(row.issue, row.message, row.label)));
            view.issuesSignature = signature;

            if (focusedId) {
                const button = [...list.querySelectorAll('li')]
                    .find(item => item.dataset.issue === focusedId)?.querySelector('.fix-btn');
                if (button) button.focus();
                else if (!view.badge.hidden) view.badge.focus();
            }
        }

        list.hidden = rows.length === 0;
        list.querySelectorAll('.fix-btn').forEach(button => {
            if (view.checking) button.setAttribute('aria-disabled', 'true');
            else button.removeAttribute('aria-disabled');
        });
    }

    function render() {
        if (!view.badge) return;
        const result = view.result;
        const state = result ? result.state : 'checking';
        const open = view.visible && view.expanded;

        view.badge.hidden = !view.visible;
        view.badge.dataset.state = state;
        view.badge.classList.toggle('is-checking', view.checking);
        view.badge.setAttribute('aria-expanded', String(view.expanded));
        // The label is a polite live region: it only changes with the state.
        setText(view.label, translate(badgeLabelKey(result)));

        view.panel.hidden = !open;
        view.panel.dataset.state = state;
        view.panel.classList.toggle('is-checking', view.checking);
        setText(view.summary, translate(result ? summaryKey(result.verified) : 'scan.checking'));
        placeSummary(summaryLast(result));
        renderIssues(result ? result.issues : []);
    }

    function publish(result) {
        view.result = result;
        view.checking = false;
        render();
        view.app.emit('scan', result);
    }

    /**
     * @description True while the snapshot is still the latest preview. A
     * newer revision that has started but is not ready yet makes it stale,
     * so its result (and fixes computed for the older design) is dropped.
     */
    function isCurrent(snapshot) {
        if (!view.snapshot || view.snapshot.revision !== snapshot.revision) return false;
        if (snapshot.revision < view.latestRevision) return false;
        const latest = typeof view.app.getSnapshot === 'function' ? view.app.getSnapshot() : null;
        return !latest || latest.revision === snapshot.revision;
    }

    function noteRevision(revision) {
        const value = Number(revision);
        if (Number.isFinite(value) && value > view.latestRevision) view.latestRevision = value;
    }

    async function checkSnapshot(snapshot) {
        const isStale = () => !isCurrent(snapshot);
        if (isStale()) return;

        let decodeResult;
        try {
            decodeResult = await decodeSnapshot(snapshot, isStale);
        } catch (error) {
            decodeResult = null;
        }
        if (decodeResult === CANCELLED || isStale()) return;

        view.decode = { revision: snapshot.revision, value: decodeResult };
        try {
            publish(evaluate(snapshot, currentExportOptions(), decodeResult));
        } catch (error) {
            console.error('Scan check failed:', error);
        }
    }

    /**
     * @description A new preview revision started: a check that has not run
     * yet is cancelled, and the previous result stays visible, dimmed.
     */
    function onPreviewStart(detail) {
        noteRevision(detail && detail.revision);
        if (view.timer !== null && view.snapshot && view.snapshot.revision < view.latestRevision) {
            clearTimeout(view.timer);
            view.timer = null;
        }
        if (!view.visible || view.checking) return;
        view.checking = true;
        render();
    }

    function onPreviewReady(snapshot) {
        if (!snapshot) return;
        clearTimeout(view.timer);
        noteRevision(snapshot.revision);
        view.snapshot = snapshot;
        view.decode = null;
        view.visible = true;
        view.checking = true;
        render();

        view.timer = setTimeout(() => {
            view.timer = null;
            checkSnapshot(snapshot);
        }, SCAN_DELAY);
    }

    function onPreviewEmpty() {
        clearTimeout(view.timer);
        view.timer = null;
        view.snapshot = null;
        view.decode = null;
        view.visible = false;
        view.checking = false;
        render();
    }

    /**
     * @description Export options change the size issues only, so the rules
     * run again with the decode result already known for this preview. While
     * a newer preview is pending, its own check picks up the new options.
     */
    function onExportChange() {
        const snapshot = view.snapshot;
        if (!snapshot || !view.decode || view.decode.revision !== snapshot.revision) return;
        if (snapshot.revision < view.latestRevision) return;
        publish(evaluate(snapshot, currentExportOptions(), view.decode.value));
    }

    /**
     * @description Applies a one-click fix and offers Undo, which restores
     * the previous values of exactly the changed fields.
     */
    function applyFix(fix) {
        const app = view.app;
        const undoSteps = [];

        if (fix.design) {
            const before = app.getDesign();
            const undoPatch = {};
            Object.keys(fix.design).forEach(key => {
                undoPatch[key] = before[key];
            });
            undoSteps.push(() => app.updateDesign(undoPatch, { source: 'undo' }));
            app.updateDesign(fix.design, { source: 'fix' });
        }

        if (fix.exportOptions) {
            const before = app.getExportOptions();
            const undoPatch = {};
            Object.keys(fix.exportOptions).forEach(key => {
                undoPatch[key] = key === 'print' ? { ...before.print } : before[key];
            });
            undoSteps.push(() => app.updateExportOptions(undoPatch));
            app.updateExportOptions(fix.exportOptions);
        }

        const ui = globalThis.QRTurboUI;
        if (ui && typeof ui.toast === 'function') {
            ui.toast(translate('toast.applied', { what: fixLabel(fix) }), {
                tone: 'success',
                actionLabel: translate('actions.undo'),
                onAction: () => undoSteps.forEach(step => step()),
                timeoutMs: UNDO_TIMEOUT
            });
        }
    }

    function onIssueClick(event) {
        const button = event.target instanceof Element ? event.target.closest('.fix-btn') : null;
        if (!button || !view.list.contains(button)) return;
        if (view.checking || button.getAttribute('aria-disabled') === 'true') return;

        const id = button.closest('li').dataset.issue;
        const issue = view.result && view.result.issues.find(candidate => candidate.id === id);
        if (issue && issue.fix) applyFix(issue.fix);
    }

    function setExpanded(expanded) {
        view.expanded = expanded;
        render();
    }

    /**
     * @description Escape closes the open panel. The key is consumed, so the
     * document handler in kit.js does not also dismiss the newest toast,
     * which may be the Undo of a fix just applied.
     */
    function onKeydown(event) {
        if (event.key !== 'Escape' || !view.expanded) return;
        event.preventDefault();
        setExpanded(false);
        view.badge.focus();
    }

    /**
     * @description Wires the badge and the issue list to the app events.
     * Pages without the badge (privacy, terms) are left alone.
     */
    function init(app) {
        if (view.app || !app || typeof document === 'undefined') return;
        const badge = document.getElementById('scan-badge');
        const label = document.getElementById('scan-badge-label');
        const panel = document.getElementById('scan-warnings');
        const summary = document.getElementById('scan-summary');
        const list = document.getElementById('scan-issues');
        if (!badge || !label || !panel || !summary || !list) return;

        Object.assign(view, { app, badge, label, panel, summary, list });
        badge.addEventListener('click', () => setExpanded(!view.expanded));
        badge.addEventListener('keydown', onKeydown);
        panel.addEventListener('keydown', onKeydown);
        list.addEventListener('click', onIssueClick);

        app.on('preview-start', onPreviewStart);
        app.on('preview-ready', onPreviewReady);
        app.on('preview-empty', onPreviewEmpty);
        app.on('export', onExportChange);
        app.on('i18n', render);
        render();
    }

    const api = {
        init,
        run,
        decode,
        evaluate,
        available
    };

    globalThis.QRTurboScan = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
