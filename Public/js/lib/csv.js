// QRTurbo.app - CSV reader and writer (QRTurboCsv)
// Pure, loaded lazily on the first batch open. Reads pasted or chosen CSV and
// TSV data (RFC 4180 quoting, embedded line breaks, a BOM, CRLF, LF or CR line
// ends, comma, semicolon or tab delimiters), detects the header row, maps
// columns to payload fields and reads each row's values, makes safe and
// unique file names, and writes manifest.csv with spreadsheet
// formula-injection protection.
(function () {
    'use strict';

    // Detection order: a tab almost never appears inside spreadsheet data,
    // and a semicolon file often holds decimal commas.
    const DELIMITERS = ['\t', ';', ','];
    const SAMPLE_RECORDS = 50;
    const HEADER_SAMPLE_ROWS = 20;
    const CONSISTENT_SHARE = 0.9;
    const NAME_MAX_LENGTH = 80;

    // Cells that a spreadsheet could run as a formula (OWASP CSV injection).
    const FORMULA_START = /^[=+\-@\t\r]/;
    const NEEDS_QUOTES = /[",\r\n]/;

    // Cell kinds for header detection. Every pattern runs in linear time,
    // so a crafted cell can never freeze the page, and longer cells are not
    // classified at all.
    const KIND_MAX_LENGTH = 2048;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
    const URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:\S|www\.\S)/i;
    const DOMAIN_PATTERN = /^(?:[a-z0-9-]+\.)+[a-z]{2,24}(?::\d{1,5})?(?:[/?#]\S*)?$/i;
    const NUMBER_PATTERN = /^[+-]?[\d\s().,/:-]+$/;
    const DIGIT = /\d/;
    // Innermost parenthesized or bracketed parts only: a run of unclosed
    // '(' must not make the search quadratic.
    const PARENTHESIZED = /\([^()]*\)|\[[^[\]]*\]/g;

    // Line breaks and separators become spaces in file names; other control,
    // zero-width and bidirectional formatting characters are removed, so a
    // name can never hide its real extension.
    const NAME_SPACES = /[\t\n\r\v\f\u0085\u2028\u2029]+/g;
    const NAME_INVISIBLE = /[\u0000-\u001f\u007f-\u009f\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
    const NAME_FORBIDDEN = /[\\/:*?"<>|]+/g;
    const WINDOWS_DEVICE = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$/i;

    // --- Parsing ---

    /**
     * @description Splits text into records of fields with RFC 4180 quoting:
     * a field that starts with a quote may hold delimiters, line breaks and
     * doubled quotes. Records end at CRLF, LF or CR. An empty delimiter keeps
     * every record in one field. Stops after limit records.
     */
    function parseRecords(text, delimiter, limit) {
        const records = [];
        const length = text.length;
        let record = [];
        let field = '';
        let quoted = false;
        let atFieldStart = true;
        let i = 0;

        while (i < length) {
            const char = text[i];

            if (quoted) {
                if (char === '"') {
                    if (text[i + 1] === '"') {
                        field += '"';
                        i += 2;
                    } else {
                        quoted = false;
                        i += 1;
                    }
                    continue;
                }
                // Copy the run up to the next quote in one step.
                const next = text.indexOf('"', i);
                const end = next === -1 ? length : next;
                field += text.slice(i, end);
                i = end;
                continue;
            }

            if (char === '"' && atFieldStart) {
                quoted = true;
                atFieldStart = false;
                i += 1;
            } else if (delimiter && char === delimiter) {
                record.push(field);
                field = '';
                atFieldStart = true;
                i += 1;
            } else if (char === '\r' || char === '\n') {
                record.push(field);
                records.push(record);
                if (records.length >= limit) return records;
                record = [];
                field = '';
                atFieldStart = true;
                i += char === '\r' && text[i + 1] === '\n' ? 2 : 1;
            } else {
                field += char;
                atFieldStart = false;
                i += 1;
            }
        }

        if (!atFieldStart || field !== '' || record.length) {
            record.push(field);
            records.push(record);
        }
        return records;
    }

    function isBlankRecord(record) {
        return record.every(cell => cell.trim() === '');
    }

    /**
     * @description Picks the delimiter that splits the first records into the
     * most consistent number of columns (at least two). The first candidate in
     * the order tab, semicolon, comma that is consistent in 90% of the records
     * wins; otherwise the most consistent one. Returns '' for one column.
     */
    function detectDelimiter(text) {
        let best = null;

        for (const delimiter of DELIMITERS) {
            const widths = parseRecords(text, delimiter, SAMPLE_RECORDS)
                .filter(record => !isBlankRecord(record))
                .map(record => record.length);
            if (!widths.length) continue;

            const tally = new Map();
            widths.forEach(width => tally.set(width, (tally.get(width) || 0) + 1));
            let mode = 1;
            let modeCount = 0;
            tally.forEach((count, width) => {
                if (count > modeCount || (count === modeCount && width > mode)) {
                    mode = width;
                    modeCount = count;
                }
            });
            if (mode < 2) continue;

            const share = modeCount / widths.length;
            if (share >= CONSISTENT_SHARE) return delimiter;
            if (!best || share > best.share) best = { delimiter, share };
        }

        return best ? best.delimiter : '';
    }

    /**
     * @description Parses CSV or TSV text. opts.delimiter is ',', ';', '\t'
     * or 'auto' (the default). A leading BOM is removed. Records whose cells
     * are all empty are skipped; rowNumbers[i] is the 1-based record number
     * of rows[i] in the source, which matches the spreadsheet row number.
     */
    function parse(text, opts) {
        const source = String(text === undefined || text === null ? '' : text).replace(/^\uFEFF/, '');
        const requested = opts && opts.delimiter;
        const delimiter = DELIMITERS.includes(requested) ? requested : detectDelimiter(source);
        const rows = [];
        const rowNumbers = [];

        parseRecords(source, delimiter, Infinity).forEach((record, index) => {
            if (isBlankRecord(record)) return;
            rows.push(record);
            rowNumbers.push(index + 1);
        });

        return { delimiter, rows, rowNumbers };
    }

    // --- Header detection and column mapping ---

    function stripParentheses(text) {
        return String(text).replace(PARENTHESIZED, ' ');
    }

    /**
     * @description Comparison form of a header or field name: case-folded,
     * compatibility-normalized, letters and digits only ("E-mail" = "email").
     */
    function squash(text) {
        return String(text === undefined || text === null ? '' : text)
            .normalize('NFKC')
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, '');
    }

    function labelList(labels, key) {
        if (!labels || typeof labels !== 'object') return [];
        const value = labels[key];
        if (Array.isArray(value)) return value.filter(item => typeof item === 'string');
        return typeof value === 'string' ? [value] : [];
    }

    // Names a column header may use for a field: strong (the values key and
    // the translated label) and weak (the aliases). derived lists the forms
    // that exist only because a parenthesized part was removed, such as
    // 'phone' from "Phone (Work)".
    function fieldNames(field, labels) {
        const strong = new Set();
        const weak = new Set();
        const fullForms = new Set();
        const bareForms = new Set();
        const add = (set, text) => {
            const full = squash(text);
            if (full) {
                set.add(full);
                fullForms.add(full);
            }
            const bare = squash(stripParentheses(text));
            if (bare) {
                set.add(bare);
                bareForms.add(bare);
            }
        };
        add(strong, field.key);
        if (field.labelKey) add(strong, field.labelKey.split('.').pop());
        labelList(labels, field.key).forEach(label => add(strong, label));
        (Array.isArray(field.aliases) ? field.aliases : []).forEach(alias => add(weak, alias));
        const derived = new Set([...bareForms].filter(form => !fullForms.has(form)));
        return { strong, weak, derived };
    }

    /**
     * @description fieldNames for every field. A derived form that several
     * fields have ("Telefon" from "Telefon (Arbeit)", "Telefon (mobil)" and
     * "Telefon (privat)") stays only with a field that names it outright or,
     * when none does, with the field marked generic. So a plain "Phone"
     * column is the mobile phone and never claims the work phone.
     */
    function fieldNameList(fields, labels) {
        const list = fields.map(field => fieldNames(field, labels));
        const holders = new Map();
        list.forEach((names, index) => {
            [...names.strong, ...names.weak].forEach(form => {
                if (!holders.has(form)) holders.set(form, new Set());
                holders.get(form).add(index);
            });
        });

        const dropped = [];
        list.forEach((names, index) => {
            names.derived.forEach(form => {
                const owners = [...holders.get(form)];
                if (owners.length < 2) return;
                const named = owners.some(owner => !list[owner].derived.has(form));
                if (named || fields[index].generic !== true) dropped.push([names, form]);
            });
        });
        dropped.forEach(([names, form]) => {
            names.strong.delete(form);
            names.weak.delete(form);
        });
        return list;
    }

    function headerForms(header) {
        return { full: squash(header), bare: squash(stripParentheses(header)) };
    }

    /**
     * @description Maps payload fields to column indexes. Headers are
     * compared case-insensitively, ignoring spaces and punctuation, first by
     * their full text and then without parenthesized parts, against the
     * field key and translated label (o.labels: { key: string|string[] }),
     * then against the aliases. Each column serves one field. Without a
     * header (o.hasHeader === false), or with a single unknown column, the
     * first required field takes column 0. Unused fields map to -1.
     */
    function autoMap(headers, fields, o) {
        const options = o && typeof o === 'object' ? o : {};
        const list = Array.isArray(fields) ? fields.filter(field => field && field.key) : [];
        const columns = Array.isArray(headers) ? headers.map(headerForms) : [];
        const result = {};
        const used = new Set();
        list.forEach(field => {
            result[field.key] = -1;
        });
        if (!list.length) return result;

        if (options.hasHeader !== false) {
            const names = fieldNameList(list, options.labels);
            const passes = [
                ['full', 'strong'],
                ['full', 'weak'],
                ['bare', 'strong'],
                ['bare', 'weak']
            ];
            passes.forEach(([form, strength]) => {
                list.forEach((field, fieldIndex) => {
                    if (result[field.key] !== -1) return;
                    const set = names[fieldIndex][strength];
                    const column = columns.findIndex((header, index) => (
                        !used.has(index) && header[form] && set.has(header[form])
                    ));
                    if (column !== -1) {
                        result[field.key] = column;
                        used.add(column);
                    }
                });
            });
        }

        if (!used.size && columns.length && (options.hasHeader === false || columns.length === 1)) {
            const primary = list.find(field => field.required) || list[0];
            result[primary.key] = 0;
        }
        return result;
    }

    /**
     * @description The first column whose header matches one of the names
     * (compared like autoMap), or -1.
     */
    function findColumn(headers, names) {
        const wanted = new Set((Array.isArray(names) ? names : []).map(squash).filter(Boolean));
        if (!wanted.size || !Array.isArray(headers)) return -1;
        return headers.findIndex(header => {
            const forms = headerForms(header);
            return (forms.full && wanted.has(forms.full)) || (forms.bare && wanted.has(forms.bare));
        });
    }

    function cellKind(value) {
        const text = String(value === undefined || value === null ? '' : value).trim();
        if (!text) return 'empty';
        if (text.length > KIND_MAX_LENGTH) return 'text';
        if (EMAIL_PATTERN.test(text)) return 'email';
        if (URL_PATTERN.test(text) || DOMAIN_PATTERN.test(text)) return 'url';
        if (NUMBER_PATTERN.test(text) && DIGIT.test(text)) return 'number';
        return 'text';
    }

    function mostCommon(values) {
        const tally = new Map();
        let best = null;
        let bestCount = 0;
        values.forEach(value => {
            const count = (tally.get(value) || 0) + 1;
            tally.set(value, count);
            if (count > bestCount) {
                best = value;
                bestCount = count;
            }
        });
        return best;
    }

    /**
     * @description True when the first row looks like column names. Each
     * column votes: +2 when the first cell names one of the fields (key,
     * label or alias), +1 when it is plain text over a column of URLs,
     * email addresses or numbers, -1 when it has the same kind as the data
     * below or repeats one of its values. Needs a positive total; a single
     * row is a header only when it names a field.
     */
    function detectHeader(rows, fields, o) {
        if (!Array.isArray(rows) || !rows.length || !Array.isArray(rows[0])) return false;
        const options = o && typeof o === 'object' ? o : {};
        const first = rows[0];
        const sample = rows.slice(1, 1 + HEADER_SAMPLE_ROWS);
        const names = fieldNameList(
            (Array.isArray(fields) ? fields : []).filter(field => field && field.key),
            options.labels
        );
        let votes = 0;

        first.forEach((cell, column) => {
            const head = String(cell).trim();
            if (!head) return;
            const below = sample.map(row => String(row[column] === undefined ? '' : row[column]).trim()).filter(Boolean);
            const headSquashed = squash(head);
            if (headSquashed && below.some(value => squash(value) === headSquashed)) {
                votes -= 1;
                return;
            }

            const forms = headerForms(head);
            const named = names.some(({ strong, weak }) => (
                [forms.full, forms.bare].some(form => form && (strong.has(form) || weak.has(form)))
            ));
            if (named) {
                votes += 2;
                return;
            }

            if (!below.length) return;
            const headKind = cellKind(head);
            const dataKind = mostCommon(below.map(cellKind));
            if (dataKind === 'text') return;
            if (headKind === 'text') votes += 1;
            else if (headKind === dataKind) votes -= 1;
        });

        if (rows.length < 2) return votes >= 2;
        return votes > 0;
    }

    /**
     * @description The values object for one data row: every mapped field
     * gets its cell, trimmed unless the field is marked keepSpaces (a WiFi
     * name or password may start or end with a space, as in the form). A
     * cell of only spaces is empty for every field. Fields mapped to no
     * column (-1) are left out.
     */
    function rowValues(cells, mapping, fields) {
        const row = Array.isArray(cells) ? cells : [];
        const columns = mapping && typeof mapping === 'object' ? mapping : {};
        const keepSpaces = new Set((Array.isArray(fields) ? fields : [])
            .filter(field => field && field.keepSpaces === true)
            .map(field => field.key));
        const values = {};
        Object.keys(columns).forEach(key => {
            const column = columns[key];
            if (!Number.isInteger(column) || column < 0) return;
            const cell = row[column];
            const text = cell === undefined || cell === null ? '' : String(cell);
            const trimmed = text.trim();
            values[key] = keepSpaces.has(key) && trimmed ? text : trimmed;
        });
        return values;
    }

    // --- File names ---

    function truncate(text, max) {
        const chars = Array.from(text);
        return chars.length > max ? chars.slice(0, max).join('') : text;
    }

    /**
     * @description A file name base that is safe on Windows, macOS, Linux,
     * Android and iOS: no path separators, reserved or invisible characters,
     * no leading dot or dash, no trailing dot or space, no device names, at
     * most max characters. Letters outside ASCII are kept. May return ''.
     */
    function sanitizeName(value, max) {
        const limit = Number.isInteger(max) && max > 0 ? max : NAME_MAX_LENGTH;
        let name = String(value === undefined || value === null ? '' : value)
            .normalize('NFC')
            .replace(NAME_SPACES, ' ')
            .replace(NAME_INVISIBLE, '')
            .replace(NAME_FORBIDDEN, '-')
            .replace(/\s+/g, ' ')
            .replace(/-{2,}/g, '-')
            .trim()
            .replace(/^[.\s-]+/, '');
        name = truncate(name, limit).replace(/[.\s]+$/, '');
        if (WINDOWS_DEVICE.test(name)) name = truncate(`_${name}`, limit);
        return name;
    }

    /**
     * @description The value without a trailing ".<ext>" from extensions
     * (compared without case), so "anna.png" names the file "anna".
     */
    function stripExtension(value, extensions) {
        const text = String(value === undefined || value === null ? '' : value).trim();
        if (!extensions.length) return text;
        const lower = text.toLowerCase();
        const match = extensions.find(ext => lower.endsWith(`.${ext}`));
        return match ? text.slice(0, text.length - match.length - 1) : text;
    }

    /**
     * @description Sanitized, unique file name bases (no extension), one per
     * raw value. A trailing extension listed in opts.extensions (for example
     * ['png', 'svg']) is removed first. Empty values become
     * `<fallbackPrefix><n>` with n from opts.numbers or the 1-based position.
     * Duplicates, compared without case because Windows and macOS ignore it,
     * get -2, -3 and so on. Names in opts.reserved are never returned.
     */
    function filenames(raw, opts) {
        const options = opts && typeof opts === 'object' ? opts : {};
        const prefix = typeof options.fallbackPrefix === 'string' ? sanitizeName(options.fallbackPrefix) || 'row-' : 'row-';
        const fallbackPrefix = /[-_]$/.test(prefix) ? prefix : `${prefix}-`;
        const max = Number.isInteger(options.maxLength) && options.maxLength >= 8 ? options.maxLength : NAME_MAX_LENGTH;
        const numbers = Array.isArray(options.numbers) ? options.numbers : null;
        const seen = new Set((Array.isArray(options.reserved) ? options.reserved : []).map(name => String(name).toLowerCase()));
        const extensions = (Array.isArray(options.extensions) ? options.extensions : [])
            .map(ext => String(ext).replace(/^\./, '').toLowerCase())
            .filter(Boolean);

        return (Array.isArray(raw) ? raw : []).map((value, index) => {
            const number = numbers && Number.isFinite(numbers[index]) ? numbers[index] : index + 1;
            const base = sanitizeName(stripExtension(value, extensions), max) || `${fallbackPrefix}${number}`;
            let name = base;
            let counter = 2;
            while (seen.has(name.toLowerCase())) {
                const suffix = `-${counter}`;
                name = `${truncate(base, max - suffix.length).replace(/[.\s]+$/, '')}${suffix}`;
                counter += 1;
            }
            seen.add(name.toLowerCase());
            return name;
        });
    }

    // --- Writing ---

    /**
     * @description One RFC 4180 cell. A value that a spreadsheet could run as
     * a formula (starting with = + - @, tab or CR) gets a leading apostrophe.
     */
    function escapeCell(value) {
        let text = value === undefined || value === null ? '' : String(value);
        if (FORMULA_START.test(text)) text = `'${text}`;
        return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }

    /**
     * @description Writes rows as CSV: comma delimiter, CRLF after every row,
     * quotes only where needed, formula-injection safe cells. o.bom adds a
     * UTF-8 BOM so spreadsheet apps detect the encoding.
     */
    function stringify(rows, o) {
        const list = Array.isArray(rows) ? rows : [];
        const body = list
            .map(row => (Array.isArray(row) ? row : [row]).map(escapeCell).join(',') + '\r\n')
            .join('');
        return o && o.bom ? `\uFEFF${body}` : body;
    }

    const api = {
        parse,
        detectDelimiter,
        detectHeader,
        autoMap,
        findColumn,
        rowValues,
        sanitizeName,
        filenames,
        escapeCell,
        stringify
    };

    globalThis.QRTurboCsv = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
