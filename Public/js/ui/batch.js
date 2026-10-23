// QRTurbo.app - Batch dialog (QRTurboBatchUI)
// Loaded lazily on the first batch open, together with lib/csv.js and
// lib/zip.js. Owns #batch-dialog: CSV or TSV data (pasted, chosen or dropped),
// the header checkbox, the column mapping for the chosen type, the output
// options, the run with progress and Cancel, the row errors and the ZIP
// download.
//
// Each row: QRTurboPayloads.build -> app.buildSnapshot(content, { design,
// minVersion }) -> QRTurboExport.exportFile(snapshot, options) -> one ZIP
// entry, plus QRTurboScan.run when "Check that every code scans" is on. Rows
// run one at a time and yield to the browser after each one. Everything stays
// on this device. Payloads never reach the manifest, toasts or logs, and file
// names come only from the column the user picks (or the row number).
(function () {
    'use strict';

    const MAX_ROWS = 1000;
    const MAX_ERRORS_SHOWN = 50;
    const MAX_FILE_BYTES = 5 * 1024 * 1024;
    const MAX_COLUMNS = 200;
    const SAMPLE_LENGTH = 24;
    const INPUT_DELAY = 200;
    const STATUS_INTERVAL = 1000;

    const CSV_EXTENSIONS = /\.(?:csv|tsv|tab|txt)$/i;
    const SPREADSHEET_EXTENSIONS = /\.(?:xlsx|xlsm|xlsb|xls|ods|numbers)$/i;
    // Windows reports .csv files as application/vnd.ms-excel when Excel is
    // installed; an empty type is common for dropped files.
    const TEXT_TYPES = ['application/csv', 'application/vnd.ms-excel', 'application/x-csv', ''];
    const FILENAME_HEADERS = [
        'filename', 'file name', 'file', 'name of file', 'tiedostonimi', 'tiedosto', 'dateiname', 'datei',
        'nom de fichier', 'fichier', 'nombre de archivo', 'archivo', 'nome file', 'bestandsnaam', 'filnamn',
        'filnavn', 'nazwa pliku'
    ];
    const MANIFEST_NAME = 'manifest.csv';
    const MANIFEST_HEADER = ['file', 'row', 'status', 'version', 'modules', 'scan', 'error'];
    const LEVELS = ['L', 'M', 'Q', 'H'];

    const view = {
        ready: false,
        app: null,
        returnFocus: null,
        inputTimer: null,
        rowsFoundText: ''
    };
    const data = {
        rows: [],
        rowNumbers: [],
        headerTouched: false,
        headerRow: null,
        body: [],
        bodyNumbers: [],
        columnCount: 0,
        mappingKey: '',
        mapping: {},
        filenameColumn: -1
    };
    const runState = {
        active: false,
        controller: null,
        finished: null,
        status: null,
        result: null,
        lastStatusAt: 0
    };
    let verifyCheck = null;

    // --- Small helpers ---

    function tr(key, vars) {
        return typeof t === 'function' ? t(key, vars) : key;
    }

    function kit() {
        return globalThis.QRTurboUI || null;
    }

    function formatCount(value) {
        const ui = kit();
        return ui && typeof ui.formatNumber === 'function' ? ui.formatNumber(value) : String(value);
    }

    function setText(element, text) {
        if (element && element.textContent !== text) element.textContent = text;
    }

    function truncate(text, max) {
        const chars = Array.from(String(text).replace(/\s+/g, ' ').trim());
        return chars.length > max ? `${chars.slice(0, max - 1).join('')}\u2026` : chars.join('');
    }

    function abortError() {
        if (typeof DOMException === 'function') return new DOMException('The batch run was cancelled.', 'AbortError');
        const error = new Error('The batch run was cancelled.');
        error.name = 'AbortError';
        return error;
    }

    function isAbort(error) {
        return Boolean(error) && error.name === 'AbortError';
    }

    function yieldToBrowser() {
        return new Promise(resolve => setTimeout(resolve));
    }

    /**
     * @description Settles like promise, or rejects with an AbortError as
     * soon as signal aborts, so Cancel never waits for a slow render, export
     * or scan check. The abandoned work finishes in the background and its
     * result is dropped.
     */
    function untilAborted(promise, signal) {
        if (!signal || typeof signal.addEventListener !== 'function') return Promise.resolve(promise);
        if (signal.aborted) return Promise.reject(abortError());
        return new Promise((resolve, reject) => {
            const onAbort = () => reject(abortError());
            signal.addEventListener('abort', onAbort, { once: true });
            Promise.resolve(promise).then(value => {
                signal.removeEventListener('abort', onAbort);
                resolve(value);
            }, error => {
                signal.removeEventListener('abort', onAbort);
                reject(error);
            });
        });
    }

    function fieldsFor(type) {
        const payloads = globalThis.QRTurboPayloads;
        return (payloads && payloads.FIELDS && payloads.FIELDS[type]) || [];
    }

    function currentType() {
        return view.type.value;
    }

    function fieldLabels(fields) {
        const labels = {};
        fields.forEach(field => {
            labels[field.key] = tr(field.labelKey);
        });
        return labels;
    }

    // --- Elements ---

    function bindElements() {
        view.dialog = document.getElementById('batch-dialog');
        view.title = document.getElementById('batch-title');
        view.input = document.getElementById('batch-input');
        view.file = document.getElementById('batch-file');
        view.fileButton = document.getElementById('batch-file-btn');
        view.fileName = document.getElementById('batch-file-name');
        view.fileError = document.getElementById('batch-file-error');
        view.hasHeader = document.getElementById('batch-has-header');
        view.rowsFound = document.getElementById('batch-rows-found');
        view.type = document.getElementById('batch-type');
        view.mapping = document.getElementById('batch-mapping');
        view.filenameColumn = document.getElementById('batch-filename-col');
        view.format = document.getElementById('batch-format');
        view.sizeNote = document.getElementById('batch-size-note');
        view.sameSize = document.getElementById('batch-same-size');
        view.verify = document.getElementById('batch-verify');
        view.verifyGroup = document.getElementById('batch-verify-group');
        view.manifest = document.getElementById('batch-manifest');
        view.start = document.getElementById('batch-start');
        view.cancel = document.getElementById('batch-cancel');
        view.close = document.getElementById('batch-close');
        view.progress = document.getElementById('batch-progress');
        view.status = document.getElementById('batch-status');
        view.error = document.getElementById('batch-error');
        view.result = document.getElementById('batch-result');
        return Boolean(view.dialog && view.input && view.type && view.mapping && view.start);
    }

    // --- Data and mapping ---

    /**
     * @description Parses the textarea, detects the header row unless the
     * user set the checkbox, and refreshes the row count and mapping.
     */
    function refreshData() {
        const parsed = globalThis.QRTurboCsv.parse(view.input.value);
        data.rows = parsed.rows;
        data.rowNumbers = parsed.rowNumbers;
        // The user's header choice belongs to the data it was made for.
        if (!parsed.rows.length) data.headerTouched = false;
        if (!data.headerTouched) {
            const fields = fieldsFor(currentType());
            view.hasHeader.checked = globalThis.QRTurboCsv.detectHeader(parsed.rows, fields, { labels: fieldLabels(fields) });
        }
        applyRows();
    }

    function applyRows() {
        const header = view.hasHeader.checked && data.rows.length > 0;
        data.headerRow = header ? data.rows[0] : null;
        data.body = header ? data.rows.slice(1) : data.rows;
        data.bodyNumbers = header ? data.rowNumbers.slice(1) : data.rowNumbers;
        data.columnCount = Math.min(MAX_COLUMNS, data.rows.reduce((max, row) => Math.max(max, row.length), 0));
        renderRowsFound();
        renderMapping();
    }

    function firstValue(column) {
        for (const row of data.body) {
            const value = String(row[column] === undefined ? '' : row[column]).trim();
            if (value) return value;
        }
        return '';
    }

    // The option text for each column: its header, or "Column N" with the
    // first value as a hint when there is no header row.
    function columnLabels() {
        const labels = [];
        for (let index = 0; index < data.columnCount; index += 1) {
            const head = data.headerRow ? String(data.headerRow[index] === undefined ? '' : data.headerRow[index]).trim() : '';
            const n = formatCount(index + 1);
            if (head) {
                labels.push(truncate(head, SAMPLE_LENGTH * 2));
            } else {
                const sample = data.headerRow ? '' : firstValue(index);
                labels.push(sample
                    ? tr('batch.columnSample', { n, sample: truncate(sample, SAMPLE_LENGTH) })
                    : tr('batch.column', { n }));
            }
        }
        return labels;
    }

    function fillColumnSelect(select, labels, emptyLabel, selected) {
        const options = [new Option(emptyLabel, '')];
        labels.forEach((label, index) => options.push(new Option(label, String(index))));
        select.replaceChildren(...options);
        select.value = Number.isInteger(selected) && selected >= 0 && selected < labels.length ? String(selected) : '';
    }

    /**
     * @description One label and select per field of the chosen type. The
     * automatic mapping runs again only when the type or the columns change,
     * so the user's own choices survive edits to the data rows.
     */
    function renderMapping() {
        const type = currentType();
        const fields = fieldsFor(type);
        const headers = data.headerRow
            ? data.headerRow.slice(0, data.columnCount)
            : new Array(data.columnCount).fill('');
        const key = [type, data.headerRow ? 'header' : 'data', data.columnCount, ...headers].join('\u0001');

        if (key !== data.mappingKey) {
            data.mapping = globalThis.QRTurboCsv.autoMap(headers, fields, {
                labels: fieldLabels(fields),
                hasHeader: Boolean(data.headerRow)
            });
            data.filenameColumn = data.headerRow ? globalThis.QRTurboCsv.findColumn(headers, FILENAME_HEADERS) : -1;
            data.mappingKey = key;
        }

        const labels = columnLabels();
        const notUsed = tr('options.notUsed');
        const rows = fields.map(field => {
            const row = document.createElement('div');
            row.className = 'input-group batch-map-row';
            const label = document.createElement('label');
            label.htmlFor = `batch-map-${field.key}`;
            label.textContent = tr(field.labelKey);
            const select = document.createElement('select');
            select.id = `batch-map-${field.key}`;
            select.dataset.field = field.key;
            if (field.required) select.setAttribute('aria-required', 'true');
            fillColumnSelect(select, labels, notUsed, data.mapping[field.key]);
            row.append(label, select);
            return row;
        });
        view.mapping.replaceChildren(...rows);
        fillColumnSelect(view.filenameColumn, labels, tr('options.filenameRowNumber'), data.filenameColumn);
    }

    // "Rows found: N", plus the row limit on its own line above 1000 rows.
    // The live region changes only when its text does.
    function renderRowsFound() {
        const hasData = Boolean(view.input.value.trim());
        const count = data.body.length;
        const over = hasData && count > MAX_ROWS;
        const found = hasData ? tr('batch.rowsFound', { count: formatCount(count) }) : '';
        const limitText = over ? tr('batch.limit', { max: formatCount(MAX_ROWS) }) : '';
        const signature = `${found}\u0001${limitText}`;
        if (view.rowsFoundText === signature) return;
        view.rowsFoundText = signature;

        const parts = found ? [document.createTextNode(found)] : [];
        if (limitText) {
            const limit = document.createElement('span');
            limit.className = 'batch-limit';
            limit.textContent = limitText;
            parts.push(document.createTextNode(' '), limit);
        }
        view.rowsFound.replaceChildren(...parts);
        view.rowsFound.classList.toggle('is-over-limit', over);
    }

    // --- Output options ---

    function formatRadios() {
        return Array.from(view.format.querySelectorAll('input[name="batch-format"]'));
    }

    function isOffered(radio) {
        return !radio.closest('[hidden]');
    }

    function selectedFormat() {
        const radio = formatRadios().find(item => item.checked && isOffered(item));
        return radio ? radio.value : 'png';
    }

    function selectFormat(format) {
        const radios = formatRadios();
        const target = radios.find(item => item.value === format && isOffered(item))
            || radios.find(item => item.value === 'png');
        if (target) target.checked = true;
    }

    /**
     * @description Offers WebP only where the browser really writes WebP,
     * and EPS only when the exporter has it.
     */
    async function prepareFormats() {
        const exporter = globalThis.QRTurboExport;
        const formats = (exporter && exporter.FORMATS) || {};
        formatRadios().forEach(radio => {
            const group = radio.closest('.radio-group') || radio;
            group.hidden = !formats[radio.value];
        });

        const webp = document.getElementById('batch-format-webp');
        if (webp && formats.webp) {
            let supported = false;
            try {
                supported = Boolean(exporter.capabilities && (await exporter.capabilities()).webp);
            } catch (error) {
                supported = false;
            }
            (webp.closest('.radio-group') || webp).hidden = !supported;
        }
    }

    function renderSizeNote() {
        const exporter = globalThis.QRTurboExport;
        const app = view.app;
        let text = '';
        if (exporter && typeof exporter.describe === 'function' && app) {
            try {
                const info = exporter.describe({ ...app.getExportOptions(), format: selectedFormat() }, { design: app.getDesign() });
                text = [tr('batch.sizeNote', { summary: info.summary }), ...(info.notes || [])].join(' ');
            } catch (error) {
                text = '';
            }
        }
        setText(view.sizeNote, text);
    }

    /**
     * @description Resolves whether a scan decoder runs in this browser, once,
     * and hides "Check that every code scans" when none does.
     */
    function checkVerify() {
        if (!verifyCheck) {
            const scan = globalThis.QRTurboScan;
            const probe = scan && typeof scan.run === 'function'
                ? Promise.resolve().then(() => (typeof scan.available === 'function' ? scan.available() : true))
                : Promise.resolve(false);
            verifyCheck = probe.then(Boolean, () => false);
        }
        return verifyCheck.then(available => {
            if (view.verifyGroup) view.verifyGroup.hidden = !available;
            return available;
        });
    }

    // --- Messages ---

    function describedBy(element) {
        return (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    }

    // The invalid field points at #batch-error, so screen readers read the
    // message with the field (SPEC B.11 pattern of #form-error).
    function showError(key, vars, field) {
        setText(view.error, tr(key, vars));
        view.error.hidden = false;
        if (field) {
            field.setAttribute('aria-invalid', 'true');
            field.setAttribute('aria-errormessage', view.error.id);
            const ids = describedBy(field);
            if (!ids.includes(view.error.id)) field.setAttribute('aria-describedby', [...ids, view.error.id].join(' '));
            field.focus();
        }
    }

    function clearError() {
        view.error.hidden = true;
        setText(view.error, '');
        view.dialog.querySelectorAll('[aria-invalid="true"]').forEach(element => {
            element.removeAttribute('aria-invalid');
            element.removeAttribute('aria-errormessage');
            const ids = describedBy(element).filter(id => id !== view.error.id);
            if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
            else element.removeAttribute('aria-describedby');
        });
    }

    function showFileError(key) {
        setText(view.fileError, tr(key));
        view.fileError.hidden = false;
    }

    function clearFileError() {
        view.fileError.hidden = true;
        setText(view.fileError, '');
    }

    function setStatus(key, vars) {
        runState.status = key ? { key, vars: vars || {} } : null;
        setText(view.status, key ? tr(key, vars) : '');
    }

    function renderResult(result) {
        runState.result = result;
        const parts = [];
        if (result && result.scanFailed) {
            const note = document.createElement('p');
            note.textContent = tr('batch.scanFailed', { count: formatCount(result.scanFailed) });
            parts.push(note);
        }
        if (result && result.errors.length) {
            const list = document.createElement('ul');
            list.className = 'batch-errors';
            result.errors.slice(0, MAX_ERRORS_SHOWN).forEach(error => {
                const item = document.createElement('li');
                item.textContent = tr('batch.rowError', { row: formatCount(error.row), message: tr(error.key) });
                list.appendChild(item);
            });
            parts.push(list);
            if (result.errors.length > MAX_ERRORS_SHOWN) {
                const more = document.createElement('p');
                more.textContent = tr('batch.moreErrors', { count: formatCount(result.errors.length - MAX_ERRORS_SHOWN) });
                parts.push(more);
            }
        }
        view.result.replaceChildren(...parts);
        view.result.hidden = !parts.length;
    }

    function resetRunView() {
        clearError();
        clearFileError();
        setStatus(null);
        renderResult(null);
        view.progress.hidden = true;
        view.progress.value = 0;
    }

    // --- Files ---

    function isCsvFile(file) {
        const name = String((file && file.name) || '');
        if (SPREADSHEET_EXTENSIONS.test(name)) return false;
        if (CSV_EXTENSIONS.test(name)) return true;
        const type = String((file && file.type) || '').toLowerCase();
        return type.startsWith('text/') || TEXT_TYPES.includes(type);
    }

    function decodeWith(label, bytes, fatal) {
        return new TextDecoder(label, { fatal: Boolean(fatal) }).decode(bytes);
    }

    /**
     * @description Text of a CSV file: UTF-16 with a BOM (Excel "Unicode
     * text"), UTF-8, or Windows-1252 when the bytes are not valid UTF-8
     * (older Excel CSV). Returns null for spreadsheet and other binary files.
     */
    function decodeText(bytes) {
        if (bytes.length >= 2) {
            const zipContainer = bytes[0] === 0x50 && bytes[1] === 0x4b;
            const oleContainer = bytes[0] === 0xd0 && bytes[1] === 0xcf;
            if (zipContainer || oleContainer) return null;
        }
        let text;
        if (bytes[0] === 0xff && bytes[1] === 0xfe) {
            text = decodeWith('utf-16le', bytes.subarray(2));
        } else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
            text = decodeWith('utf-16be', bytes.subarray(2));
        } else {
            try {
                text = decodeWith('utf-8', bytes, true);
            } catch (error) {
                text = decodeWith('windows-1252', bytes);
            }
        }
        return text.includes('\u0000') ? null : text;
    }

    function readBytes(file) {
        if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
        return new Response(file).arrayBuffer();
    }

    async function loadFile(file) {
        if (!file || runState.active) return;
        clearFileError();
        if (!isCsvFile(file)) {
            showFileError('batch.notCsv');
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            showFileError('batch.fileTooLarge');
            return;
        }
        let text = null;
        try {
            text = decodeText(new Uint8Array(await readBytes(file)));
        } catch (error) {
            text = null;
        }
        if (text === null) {
            showFileError('batch.notCsv');
            return;
        }
        view.input.value = text;
        setText(view.fileName, file.name);
        data.headerTouched = false;
        clearError();
        refreshData();
    }

    // --- The run ---

    function effectiveEcl(design, type) {
        const rules = globalThis.QRTurboRules;
        if (rules && typeof rules.effectiveEcl === 'function') {
            try {
                const result = rules.effectiveEcl(design, type);
                if (result && LEVELS.includes(result.ecl)) return result.ecl;
            } catch (error) {
                // Falls through to the same rule, written out here.
            }
        }
        if (type === 'Payment') return 'M';
        if (LEVELS.includes(design.errorCorrection)) return design.errorCorrection;
        return design.logo ? 'H' : 'M';
    }

    /**
     * @description The highest QR version any row needs at the design's
     * level, for "Make all codes the same size". Rows that do not fit are
     * left out; they fail on their own later.
     */
    function largestVersion(items, type, design) {
        const capacity = globalThis.QRTurboCapacity;
        const bytes = globalThis.QRTurboBytes;
        if (!capacity || !bytes) return undefined;
        const ecl = effectiveEcl(design, type);
        const floor = Number.isInteger(design.minVersion) && design.minVersion >= 1 ? design.minVersion : 1;
        let largest = 0;
        items.forEach(item => {
            if (!item.built.ok) return;
            try {
                const analysis = capacity.analyze(bytes.byteString(item.built.payload), ecl, floor);
                if (analysis.fits && analysis.version > largest) largest = analysis.version;
            } catch (error) {
                // The row reports its own error when it runs.
            }
        });
        return largest || undefined;
    }

    function messageKeyOf(error) {
        const message = error && typeof error.message === 'string' ? error.message : '';
        return /^(?:alerts|warnings|logo)\.[A-Za-z0-9_.]+$/.test(message) ? message : 'alerts.generationError';
    }

    function scanLabel(result) {
        const decode = result && result.decode;
        if (decode === 'pass' || decode === 'pass-large' || decode === 'fail') return decode;
        return 'unavailable';
    }

    function reportProgress(done, total, force) {
        view.progress.max = Math.max(1, total);
        view.progress.value = done;
        const now = Date.now();
        if (force || now - runState.lastStatusAt >= STATUS_INTERVAL) {
            runState.lastStatusAt = now;
            setStatus('batch.progress', { done: formatCount(done), total: formatCount(total) });
        }
    }

    /**
     * @description Creates every row's file, one row at a time. Failed rows
     * are skipped and listed; a row that does not pass the scan check is
     * kept and listed. Resolves { ok, failed, scanFailed, errors, blob } or
     * rejects with an AbortError.
     */
    async function processRows(job, signal) {
        const Payloads = globalThis.QRTurboPayloads;
        const Export = globalThis.QRTurboExport;
        const Scan = globalThis.QRTurboScan;
        const total = job.rows.length;
        const ext = Export.FORMATS[job.format].ext;
        // "anna.png" in the file name column names the file "anna.<ext>".
        const extensions = ['jpeg', ...Object.keys(Export.FORMATS).map(format => Export.FORMATS[format].ext)];
        const names = globalThis.QRTurboCsv.filenames(
            job.rows.map(cells => (job.filenameColumn >= 0 ? cells[job.filenameColumn] : '')),
            { fallbackPrefix: 'row-', numbers: job.numbers, extensions }
        );
        const fields = fieldsFor(job.type);
        const items = job.rows.map((cells, index) => {
            let built;
            try {
                built = Payloads.build(job.type, globalThis.QRTurboCsv.rowValues(cells, job.mapping, fields));
            } catch (error) {
                built = { ok: false, errorKey: 'alerts.generationError' };
            }
            return { row: job.numbers[index], name: `${names[index]}.${ext}`, built };
        });
        const minVersion = job.sameSize ? largestVersion(items, job.type, job.design) : undefined;
        const zip = globalThis.QRTurboZip.writer({ blobParts: true, date: job.date });
        const manifest = [MANIFEST_HEADER];
        const errors = [];
        let ok = 0;
        let scanFailed = 0;

        reportProgress(0, total, true);
        for (let index = 0; index < items.length; index += 1) {
            if (signal.aborted) throw abortError();
            const item = items[index];
            try {
                if (!item.built.ok) throw new Error(item.built.errorKey || 'alerts.generationError');
                const content = {
                    type: job.type,
                    payload: item.built.payload,
                    isSensitive: Boolean(item.built.isSensitive),
                    filenameHint: String(item.built.filenameHint || '')
                };
                const snapshot = await untilAborted(job.app.buildSnapshot(content, { design: job.design, minVersion }), signal);
                const file = await untilAborted(Export.exportFile(snapshot, job.exportOptions, { signal, quiet: true }), signal);
                const bytes = new Uint8Array(await untilAborted(file.blob.arrayBuffer(), signal));
                let scan = '';
                if (job.verify) {
                    // A failing check never costs the row its file.
                    try {
                        scan = scanLabel(await untilAborted(Scan.run(snapshot, job.exportOptions, { signal }), signal));
                    } catch (error) {
                        if (isAbort(error) || signal.aborted) throw abortError();
                        scan = 'unavailable';
                    }
                }
                if (signal.aborted) throw abortError();
                zip.add(item.name, bytes);
                ok += 1;
                manifest.push([item.name, item.row, 'ok', snapshot.version, snapshot.moduleCount, scan, '']);
                if (scan === 'fail') {
                    scanFailed += 1;
                    errors.push({ row: item.row, key: 'warnings.decodeFailed' });
                }
            } catch (error) {
                if (isAbort(error) || signal.aborted) throw abortError();
                const key = messageKeyOf(error);
                errors.push({ row: item.row, key });
                manifest.push(['', item.row, 'skipped', '', '', '', tr(key)]);
                if (!/^(?:alerts|warnings|logo)\./.test(String(error && error.message))) {
                    console.warn('Batch row failed:', error && (error.code || error.name));
                }
            }
            reportProgress(index + 1, total, index + 1 === total);
            await untilAborted(yieldToBrowser(), signal);
        }

        if (signal.aborted) throw abortError();
        let blob = null;
        if (ok > 0) {
            if (job.manifest) zip.add(MANIFEST_NAME, globalThis.QRTurboCsv.stringify(manifest, { bom: true }));
            blob = zip.toBlob();
        }
        return { ok, failed: total - ok, scanFailed, errors, blob };
    }

    function zipName(date) {
        const pad = value => String(value).padStart(2, '0');
        return `qrcodes-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.zip`;
    }

    function setRunning(active) {
        // Read focus before Cancel is hidden: WebKit then moves it to the
        // dialog itself, Chromium to the body.
        const focused = document.activeElement;
        const focusLost = !focused || focused === document.body || focused === view.dialog
            || focused === view.cancel || !view.dialog.contains(focused);
        runState.active = active;
        view.dialog.classList.toggle('is-running', active);
        view.dialog.querySelectorAll('.batch-body > .batch-section:not(.batch-result)').forEach(section => {
            if ('inert' in section) section.inert = active;
        });
        view.start.hidden = active;
        view.cancel.hidden = !active;
        view.progress.hidden = !active;
        if (active) {
            view.cancel.focus();
        } else if (view.dialog.open && focusLost) {
            view.start.focus();
        }
    }

    /**
     * @description Checks the input, then runs every row and saves
     * qrcodes-YYYY-MM-DD.zip. Cancel (or closing the dialog) stops the run
     * and saves nothing.
     */
    async function start() {
        if (runState.active) return;
        const app = view.app;
        // Data typed or pasted a moment ago may still wait for its parse.
        if (view.inputTimer) {
            clearTimeout(view.inputTimer);
            view.inputTimer = null;
            refreshData();
        }
        clearError();
        clearFileError();
        renderResult(null);
        setStatus(null);

        const type = currentType();
        const fields = fieldsFor(type);
        if (!data.body.length) {
            showError('batch.emptyInput', null, view.input);
            return;
        }
        if (data.body.length > MAX_ROWS) {
            showError('batch.limit', { max: formatCount(MAX_ROWS) }, view.input);
            return;
        }
        // A required field without a column, or no column mapped at all
        // (types such as vCard have no single required field).
        const missing = fields.find(field => field.required && !(data.mapping[field.key] >= 0))
            || (fields.some(field => data.mapping[field.key] >= 0) ? null : fields[0]);
        if (missing) {
            showError('batch.mapRequired', { field: tr(missing.labelKey) }, document.getElementById(`batch-map-${missing.key}`));
            return;
        }

        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const signal = controller ? controller.signal : { aborted: false };
        let settle = null;
        runState.controller = controller;
        runState.finished = new Promise(resolve => {
            settle = resolve;
        });
        setRunning(true);

        let outcome = null;
        try {
            const format = selectedFormat();
            const verify = view.verify.checked && await checkVerify();
            outcome = await processRows({
                app,
                type,
                rows: data.body.slice(),
                numbers: data.bodyNumbers.slice(),
                mapping: { ...data.mapping },
                filenameColumn: data.filenameColumn,
                format,
                design: app.getDesign(),
                exportOptions: { ...app.getExportOptions(), format },
                sameSize: view.sameSize.checked,
                verify,
                manifest: view.manifest.checked,
                date: new Date()
            }, signal);
        } catch (error) {
            outcome = isAbort(error) ? { cancelled: true } : { crashed: true };
            if (!isAbort(error)) console.warn('Batch run failed:', error && error.name);
        } finally {
            runState.controller = null;
            setRunning(false);
            // open() waits for this; the lines below still run first,
            // because they follow synchronously.
            runState.finished = null;
            settle();
        }

        if (outcome.cancelled) {
            setStatus('batch.cancelled');
            return;
        }
        if (outcome.crashed) {
            setStatus('toast.exportFailed', { format: 'ZIP' });
            return;
        }
        const ui = kit();
        if (outcome.blob && ui && typeof ui.saveBlob === 'function') ui.saveBlob(outcome.blob, zipName(new Date()));
        setStatus('batch.done', { ok: formatCount(outcome.ok), failed: formatCount(outcome.failed) });
        renderResult(outcome);
        if (!view.result.hidden && typeof view.result.scrollIntoView === 'function') {
            view.result.scrollIntoView({ block: 'nearest' });
        }
    }

    function cancel() {
        if (runState.controller) runState.controller.abort();
    }

    // --- Dialog ---

    function onClose() {
        cancel();
        clearTimeout(view.inputTimer);
        view.inputTimer = null;
        const button = document.getElementById('batch-open-btn');
        const target = button && button.isConnected && !button.hidden ? button : view.returnFocus;
        if (target && typeof target.focus === 'function') target.focus();
        view.returnFocus = null;
    }

    function renderTexts() {
        if (!view.ready || !view.dialog.open) return;
        renderRowsFound();
        renderMapping();
        renderSizeNote();
        if (runState.status) setText(view.status, tr(runState.status.key, runState.status.vars));
        if (runState.result) renderResult(runState.result);
    }

    function selectDefaults(app) {
        const tab = typeof getActiveTabName === 'function' ? getActiveTabName() : null;
        const types = (globalThis.QRTurboPayloads && globalThis.QRTurboPayloads.BATCH_TYPES) || [];
        if (tab && types.includes(tab) && Array.from(view.type.options).some(option => option.value === tab)) {
            view.type.value = tab;
        }
        const options = app.getExportOptions();
        selectFormat(options && options.format);
    }

    function bindEvents() {
        // Typing or pasting means the data no longer matches a chosen file.
        view.input.addEventListener('input', () => {
            clearTimeout(view.inputTimer);
            setText(view.fileName, '');
            if (view.input.getAttribute('aria-invalid') === 'true') clearError();
            view.inputTimer = setTimeout(() => {
                view.inputTimer = null;
                refreshData();
            }, INPUT_DELAY);
        });

        view.fileButton.addEventListener('click', () => view.file.click());
        view.file.addEventListener('change', () => {
            const file = view.file.files && view.file.files[0];
            view.file.value = '';
            loadFile(file);
        });

        view.hasHeader.addEventListener('change', () => {
            data.headerTouched = true;
            applyRows();
        });

        view.type.addEventListener('change', () => {
            clearError();
            refreshData();
        });

        view.mapping.addEventListener('change', event => {
            const select = event.target;
            if (!select || !select.dataset || !select.dataset.field) return;
            data.mapping[select.dataset.field] = select.value === '' ? -1 : Number(select.value);
            if (select.getAttribute('aria-invalid') === 'true') clearError();
        });

        view.filenameColumn.addEventListener('change', () => {
            data.filenameColumn = view.filenameColumn.value === '' ? -1 : Number(view.filenameColumn.value);
        });

        view.format.addEventListener('change', renderSizeNote);
        view.start.addEventListener('click', start);
        view.cancel.addEventListener('click', cancel);
        view.close.addEventListener('click', () => view.dialog.close());
        view.dialog.addEventListener('close', onClose);

        const ui = kit();
        if (ui && typeof ui.dropzone === 'function') {
            ui.dropzone(view.dialog, {
                accept: () => true,
                multiple: true,
                onFiles: files => loadFile(files[0]),
                onReject: () => showFileError('batch.notCsv')
            });
        }
    }

    function init(app) {
        view.app = app;
        if (view.ready) return true;
        if (!bindElements()) return false;
        bindEvents();
        if (typeof app.on === 'function') app.on('i18n', renderTexts);
        view.ready = true;
        return true;
    }

    /**
     * @description Opens the batch dialog for the app: the type defaults to
     * the current tab and the format to the current download format. Closing
     * returns focus to #batch-open-btn.
     */
    async function open(app) {
        if (!app || typeof document === 'undefined') return;
        if (!init(app)) return;
        const dialog = view.dialog;
        if (dialog.open || typeof dialog.showModal !== 'function') return;

        view.returnFocus = document.activeElement;
        // A run cancelled by closing the dialog may still be unwinding; its
        // last status and focus change must not land in the new session.
        if (runState.finished) await runState.finished;
        if (dialog.open) return;
        resetRunView();
        await prepareFormats();
        selectDefaults(app);
        refreshData();
        renderSizeNote();
        checkVerify();

        if (dialog.open) return;
        const body = dialog.querySelector('.batch-body');
        if (body) body.scrollTop = 0;
        dialog.showModal();
        // Start on the title in every engine: Chromium would focus the
        // unnamed scrolling form body, and the textarea would open the
        // on-screen keyboard over the full-screen dialog on phones.
        if (view.title && typeof view.title.focus === 'function') {
            if (!view.title.hasAttribute('tabindex')) view.title.tabIndex = -1;
            view.title.focus({ preventScroll: true });
        }
    }

    const api = {
        open
    };

    globalThis.QRTurboBatchUI = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
