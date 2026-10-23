// QRTurbo.app - File export (QRTurboExport)
// Builds downloadable files from a preview Snapshot and the ExportOptions:
// PNG, JPG and WebP rasters, hardened SVG, vector PDF and EPS. Also copy,
// share and the print sheet.
//
// Rasters come from QRTurboEngine.rasterCanvas at the exact output size and
// get print metadata (PNG pHYs and sRGB, JPEG JFIF density) from
// QRTurboBytes. SVG is the hardened library SVG. PDF and EPS load the vector
// modules on first use, flatten the same SVG and write it at the physical
// width. A failed vector PDF falls back to the raster PDF in app.js.
//
// The payload never reaches a file name (only filenameHint does), metadata,
// a toast, a share title or a log line.
(function () {
    'use strict';

    const FORMATS = Object.freeze({
        png: Object.freeze({ ext: 'png', mime: 'image/png', kind: 'raster' }),
        jpg: Object.freeze({ ext: 'jpg', mime: 'image/jpeg', kind: 'raster' }),
        webp: Object.freeze({ ext: 'webp', mime: 'image/webp', kind: 'raster' }),
        svg: Object.freeze({ ext: 'svg', mime: 'image/svg+xml', kind: 'vector' }),
        pdf: Object.freeze({ ext: 'pdf', mime: 'application/pdf', kind: 'vector' }),
        eps: Object.freeze({ ext: 'eps', mime: 'application/postscript', kind: 'vector' })
    });

    const FORMAT_LABEL_KEYS = {
        png: 'options.formatPng',
        jpg: 'options.formatJpg',
        webp: 'options.formatWebp',
        svg: 'options.formatSvg',
        pdf: 'options.formatPdf',
        eps: 'options.formatEps'
    };

    // The <type> part of file names (SPEC D.10). URLText and SMSPhone are
    // refined from the payload kind in typeSlug().
    const TYPE_SLUGS = {
        URLText: 'text',
        VCard: 'vcard',
        Wifi: 'wifi',
        SMSPhone: 'sms',
        Email: 'email',
        CalendarEvent: 'event',
        Location: 'location',
        SocialMedia: 'social',
        WhatsApp: 'whatsapp',
        MeCard: 'mecard',
        AppLink: 'app',
        Payment: 'payment'
    };

    const PAYMENT_HINT_PREFIX = /^payment(?: +|$)/;

    const PIXEL_SIZES = [512, 1024, 2048, 4096];
    const MIN_PIXELS = 128;
    const MAX_PIXELS = 4096;
    const PRINT_UNITS = {
        mm: { min: 10, max: 2000, fallback: 50, toMm: 1 },
        in: { min: 0.4, max: 80, fallback: 2, toMm: 25.4 }
    };
    const PRINT_DPIS = [150, 300, 600];
    const PAGES = ['fit', 'a4', 'letter'];
    const COLOR_MODES = ['rgb', 'cmyk', 'k'];
    const PAGE_SIZES_PT = { a4: [595.276, 841.89], letter: [612, 792] };
    const PAGE_MARGIN_PT = 28.35;
    const PT_PER_MM = 72 / 25.4;
    // The widest code the print sheet holds: A4 portrait (narrower than
    // Letter) inside the 12 mm @page margins of styles.css.
    const PRINT_SHEET_MAX_MM = 210 - (2 * 12);

    const COPY_RASTER_CAP = 2048;
    const VECTOR_RASTER_SIZE = 1024;
    const FALLBACK_PDF_DPI = 300;
    const SHAREABLE_FORMATS = ['png', 'jpg', 'webp', 'pdf', 'svg'];

    const LABEL_MASK_DPI = 1200;
    const LABEL_MASK_MAX_COLS = 8000;
    const LABEL_ASCENT = 1.0;
    const LABEL_DESCENT = 0.4;
    const IMAGE_DPI = 600;
    const IMAGE_MAX_PX = { pdf: 2048, eps: 1024 };
    const IMAGE_DECODE_TIMEOUT = 5000;
    const PROBE_TIMEOUT = 2000;

    let capabilitiesPromise = null;
    let printUrl = null;
    const shareState = { token: 0, snapshot: null, key: '', promise: null, file: null };
    const prefetchedFormats = new Set();

    // --- Small helpers ---

    function tr(key, vars) {
        return typeof t === 'function' ? t(key, vars) : key;
    }

    function ui() {
        return globalThis.QRTurboUI || null;
    }

    function language() {
        return typeof currentLang === 'string' && currentLang ? currentLang : 'en';
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function trimNumber(value, digits) {
        const factor = 10 ** digits;
        const rounded = Math.round(Number(value) * factor) / factor;
        return String(Object.is(rounded, -0) ? 0 : rounded);
    }

    function abortError() {
        if (typeof DOMException === 'function') return new DOMException('The export was cancelled.', 'AbortError');
        const error = new Error('The export was cancelled.');
        error.name = 'AbortError';
        return error;
    }

    function isAbort(error) {
        return Boolean(error) && error.name === 'AbortError';
    }

    function throwIfAborted(signal) {
        if (signal && signal.aborted) throw abortError();
    }

    function withTimeout(promise, ms, label) {
        let timer = null;
        return Promise.race([
            promise,
            new Promise((resolve, reject) => {
                timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
            })
        ]).finally(() => clearTimeout(timer));
    }

    function releaseCanvas(canvas) {
        if (!canvas) return;
        try {
            canvas.width = 0;
            canvas.height = 0;
        } catch {
            // A detached or transferred canvas has nothing left to release.
        }
    }

    function toBlob(canvas, type, quality) {
        if (typeof canvasToBlob === 'function') return canvasToBlob(canvas, type, quality);
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))), type, quality);
        });
    }

    async function blobBytes(blob) {
        return new Uint8Array(await blob.arrayBuffer());
    }

    function bytesApi() {
        const bytes = globalThis.QRTurboBytes;
        if (!bytes) throw new Error('QRTurboBytes is not loaded');
        return bytes;
    }

    function getAttr(node, name) {
        const attrs = node && node.attrs;
        if (!attrs) return undefined;
        return attrs instanceof Map ? attrs.get(name) : attrs[name];
    }

    // --- Options and sizes ---

    /**
     * @description Returns ExportOptions with every field checked against the
     * allowed values. Missing or invalid fields fall back to the defaults.
     */
    function normalizeOptions(opts) {
        const source = opts && typeof opts === 'object' ? opts : {};
        const print = source.print && typeof source.print === 'object' ? source.print : {};
        const unit = PRINT_UNITS[print.unit] ? print.unit : 'mm';
        const limits = PRINT_UNITS[unit];
        const width = Number(print.width);
        const custom = Math.round(Number(source.customPixels));
        const preset = source.pixelSize === 'custom' ? 'custom' : Number(source.pixelSize);

        return {
            v: 1,
            format: FORMATS[source.format] ? source.format : 'png',
            pixelSize: PIXEL_SIZES.includes(preset) || preset === 'custom' ? preset : 1024,
            customPixels: Number.isFinite(custom) && custom > 0 ? custom : 1024,
            print: {
                enabled: Boolean(print.enabled),
                unit,
                width: Number.isFinite(width) && width > 0 ? clamp(width, limits.min, limits.max) : limits.fallback,
                dpi: PRINT_DPIS.includes(Number(print.dpi)) ? Number(print.dpi) : 300
            },
            page: PAGES.includes(source.page) ? source.page : 'fit',
            colorMode: COLOR_MODES.includes(source.colorMode) ? source.colorMode : 'rgb'
        };
    }

    function pixelSize(o) {
        if (o.pixelSize !== 'custom') return { px: o.pixelSize, capped: false };
        return { px: clamp(o.customPixels, MIN_PIXELS, MAX_PIXELS), capped: o.customPixels > MAX_PIXELS };
    }

    /**
     * @description The output size for the options:
     * - 'pixels': raster at px (custom sizes clamped to 128-4096);
     * - 'print': raster at widthMm and dpi, px capped at 4096;
     * - 'vector-print': PDF and EPS always, SVG with "Set print size";
     * - 'vector': SVG without a print size (px is its nominal width).
     * WebP has no print size. unit and width repeat the entered print width.
     */
    function resolveSize(opts) {
        const o = normalizeOptions(opts);
        const unitInfo = PRINT_UNITS[o.print.unit];
        const widthMm = o.print.width * unitInfo.toMm;
        const printFields = { widthMm, unit: o.print.unit, width: o.print.width };

        if (FORMATS[o.format].kind === 'vector') {
            if (o.format === 'pdf' || o.format === 'eps' || o.print.enabled) {
                return { kind: 'vector-print', ...printFields, capped: false };
            }
            return { kind: 'vector', px: pixelSize(o).px, capped: false };
        }

        if (o.print.enabled && o.format !== 'webp') {
            const exact = Math.max(1, Math.round((widthMm / 25.4) * o.print.dpi));
            return {
                kind: 'print',
                px: Math.min(exact, MAX_PIXELS),
                ...printFields,
                dpi: o.print.dpi,
                capped: exact > MAX_PIXELS
            };
        }

        const pixels = pixelSize(o);
        return { kind: 'pixels', px: pixels.px, capped: pixels.capped };
    }

    function isPhysical(size) {
        return size.kind === 'print' || size.kind === 'vector-print';
    }

    // The widest square artwork an A4 or Letter page holds inside its
    // margins, in points.
    function pageFitPt(page) {
        const [pageWidth, pageHeight] = PAGE_SIZES_PT[page];
        return Math.min(pageWidth, pageHeight) - (2 * PAGE_MARGIN_PT);
    }

    function pageTooSmall(o, size) {
        if (o.format !== 'pdf' || o.page === 'fit' || !size.widthMm) return false;
        return size.widthMm * PT_PER_MM > pageFitPt(o.page) + 1e-6;
    }

    /**
     * @description The size the artwork really gets. A PDF page that is too
     * small scales the (square) artwork down to fit inside the margins, as
     * QRTurboPdf does, so widthMm and width shrink to that fit and
     * scaledToFit is true. Every other size is returned unchanged.
     */
    function effectiveSize(o, size) {
        if (!pageTooSmall(o, size)) return size;
        const widthMm = pageFitPt(o.page) / PT_PER_MM;
        return { ...size, widthMm, width: widthMm / PRINT_UNITS[size.unit].toMm, scaledToFit: true };
    }

    function formatLabel(format) {
        return tr(FORMAT_LABEL_KEYS[format] || FORMAT_LABEL_KEYS.png);
    }

    function formatUnitValue(value, unit) {
        const intlUnit = unit === 'in' ? 'inch' : 'millimeter';
        try {
            return new Intl.NumberFormat(language(), { style: 'unit', unit: intlUnit, unitDisplay: 'short', maximumFractionDigits: 2 })
                .format(value);
        } catch {
            return `${trimNumber(value, 2)} ${unit}`;
        }
    }

    function formatLength(mm, system) {
        const kit = ui();
        if (kit && typeof kit.formatLength === 'function') return kit.formatLength(mm, system);
        return system === 'imperial' ? formatUnitValue(mm / 25.4, 'in') : formatUnitValue(mm, 'mm');
    }

    function formatDistance(mm, system) {
        const kit = ui();
        if (kit && typeof kit.formatDistance === 'function') return kit.formatDistance(mm, system);
        return formatLength(mm, system);
    }

    function snapshotGeometry(snapshot) {
        if (!snapshot || !snapshot.moduleCount) return null;
        const layout = snapshot.frame && snapshot.frame.layout;
        return {
            qrFraction: layout && layout.framed && layout.width ? layout.qr.size / layout.width : 1,
            moduleCount: snapshot.moduleCount,
            quietZone: snapshot.quietZone
        };
    }

    // The options QRTurboRules sees: print sizing switched on exactly when
    // the format has a physical size (always for PDF and EPS, never for WebP),
    // at the width the artwork really gets on the page.
    function rulesOptions(o, size) {
        const print = { ...o.print, enabled: isPhysical(size) };
        if (isPhysical(size) && size.width > 0) print.width = size.width;
        return { ...o, print };
    }

    function callRules(name, o, size, geometry) {
        const rules = globalThis.QRTurboRules;
        if (!geometry || !rules || typeof rules[name] !== 'function') return null;
        try {
            return rules[name](rulesOptions(o, size), geometry.qrFraction, geometry.moduleCount, geometry.quietZone) || null;
        } catch {
            return null;
        }
    }

    /**
     * @description Everything the export panel shows for the options: the
     * button label ("Download PNG"), the size summary, translated notes, the
     * module size and scan distance line, and the raw rules results.
     */
    function describe(opts, snapshot) {
        const o = normalizeOptions(opts);
        // A page that is too small scales the artwork down: the summary,
        // the module size and the scan distance all describe that size.
        const size = effectiveSize(o, resolveSize(o));
        let summary;
        // The panel describes the options whenever they change, which is
        // also the moment to warm the vector modules for PDF and EPS.
        prefetch(o.format);

        if (size.kind === 'pixels') {
            summary = tr('output.summaryPixels', { width: String(size.px), height: String(size.px) });
        } else if (size.kind === 'print') {
            summary = tr('output.summaryPrint', { size: formatUnitValue(size.width, size.unit), dpi: String(size.dpi) });
        } else if (size.kind === 'vector-print') {
            summary = tr('output.summaryVectorPrint', { size: formatUnitValue(size.width, size.unit) });
        } else {
            summary = tr('output.summaryVector');
        }

        const notes = [];
        if (size.capped) notes.push(tr('output.sizeCapped'));
        if (o.format === 'jpg' && snapshot && snapshot.design && snapshot.design.transparentBackground) {
            notes.push(tr('output.transparentJpg'));
        }
        if (size.scaledToFit) notes.push(tr('output.pageTooSmall'));
        if (o.format === 'eps') notes.push(tr('output.epsOffice'));

        const geometry = snapshotGeometry(snapshot);
        const physical = callRules('physical', o, size, geometry);
        const pixels = callRules('pixels', o, size, geometry);
        let printInfo = null;
        if (physical && isPhysical(size)) {
            const system = o.print.unit === 'in' ? 'imperial' : 'metric';
            printInfo = [
                tr('output.moduleSize', { size: formatLength(physical.moduleMm, system) }),
                tr('output.scanDistance', { distance: formatDistance(physical.scanDistanceMm, system) })
            ].join(' ');
        }

        return {
            label: tr('actions.downloadFormat', { format: formatLabel(o.format) }),
            summary,
            notes,
            printInfo,
            physical,
            pixels
        };
    }

    // --- File names (SPEC D.10) ---

    function localSlugify(text, max) {
        return String(text || '')
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, max)
            .replace(/-+$/g, '');
    }

    function slugify(text) {
        let slug = '';
        const payloads = globalThis.QRTurboPayloads;
        if (payloads && typeof payloads.slugify === 'function') {
            try {
                slug = String(payloads.slugify(String(text || ''), 40) || '');
            } catch {
                slug = '';
            }
        }
        if (!slug) slug = localSlugify(text, 40);
        // Whatever produced it, the slug is lowercase ASCII words joined by '-'.
        return localSlugify(slug, 40);
    }

    function typeSlug(snapshot) {
        const tab = snapshot && snapshot.tab;
        const payload = String((snapshot && snapshot.payload) || '').trim();
        if (tab === 'URLText') return /^https?:\/\//i.test(payload) ? 'url' : 'text';
        if (tab === 'SMSPhone') return /^tel:/i.test(payload) ? 'phone' : 'sms';
        return TYPE_SLUGS[tab] || '';
    }

    // SPEC D.9 gives Payment the hint "payment <name>", which would repeat
    // the type in the file name. Only that exact prefix is dropped.
    function filenameHintOf(snapshot, type) {
        const hint = String((snapshot && snapshot.filenameHint) || '');
        if (type === 'payment') return hint.replace(PAYMENT_HINT_PREFIX, '');
        return hint;
    }

    /**
     * @description qrcode-<type>[-<slug>]-<variant>.<ext>, lowercase ASCII.
     * The slug comes from the snapshot's filenameHint only, never from the
     * payload. The variant is the size the artwork really gets, also when a
     * PDF page is too small and scales it down.
     */
    function buildFilename(snapshot, opts) {
        const o = normalizeOptions(opts);
        const size = effectiveSize(o, resolveSize(o));
        const type = typeSlug(snapshot);
        const slug = slugify(filenameHintOf(snapshot, type));

        let variant = 'vector';
        if (size.kind === 'pixels') variant = `${size.px}px`;
        if (size.kind === 'print') variant = `${trimNumber(size.width, 2)}${size.unit}-${size.dpi}dpi`;
        if (size.kind === 'vector-print') variant = `${trimNumber(size.width, 2)}${size.unit}`;

        return `${['qrcode', type, slug, variant].filter(Boolean).join('-')}.${FORMATS[o.format].ext}`;
    }

    // --- Rendering helpers ---

    function snapshotMarkup(snapshot) {
        if (!snapshot || typeof snapshot.qrSvgMarkup !== 'string') throw new Error('The snapshot has no SVG');
        if (!snapshot.frame) return snapshot.qrSvgMarkup;
        return buildFramedSvg(snapshot.qrSvgMarkup, snapshot.frame.layout, snapshot.frame);
    }

    function hardenSvg(markup, options) {
        const svg = globalThis.QRTurboSvg;
        if (!svg || typeof svg.harden !== 'function') throw new Error('QRTurboSvg is not loaded');
        return svg.harden(markup, options);
    }

    function svgLength(size) {
        if (size.kind === 'vector-print' || size.kind === 'print') return `${trimNumber(size.width, 3)}${size.unit}`;
        return size.px;
    }

    /**
     * @description The id prefix of one exported SVG document: 'qrt-' plus a
     * hash (FNV-1a) of the source markup and the size. The library ids, such
     * as clip-path-dot-color, are the same in every code, and url(#id) in an
     * SVG inlined into a web page resolves to the first element with that id
     * in the whole page, so with one shared prefix a second inlined code was
     * drawn with the first code's modules. The same export always gets the
     * same prefix, so files stay reproducible.
     */
    function documentIdPrefix(markup, length) {
        const text = `${length}\n${markup}`;
        let hash = 0x811c9dc5;
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }
        return `qrt-${(hash >>> 0).toString(36).padStart(7, '0')}-`;
    }

    // The hardened export document at the given width and height.
    function exportMarkup(snapshot, length) {
        const markup = snapshotMarkup(snapshot);
        return hardenSvg(markup, { idPrefix: documentIdPrefix(markup, length), width: length, height: length });
    }

    /**
     * @description The exported SVG: library SVG (or the framed document),
     * hardened with its own id prefix, with width/height in px or in the
     * print unit.
     */
    function buildSvg(snapshot, opts) {
        return exportMarkup(snapshot, svgLength(resolveSize(opts)));
    }

    // The frame at the export size: the layout is proportional, the label is
    // fitted again at that size and the colors follow the export design.
    function frameAt(snapshot, design, px) {
        const frame = snapshot.frame;
        if (!frame) return null;
        const layout = getFrameLayout(px, frame.layout.style);
        let fontSize = Math.max(1, Math.round((frame.fontSize * px) / (frame.layout.width || px)));
        try {
            fontSize = fitFrameFontSize(frame.text, layout.label.fontSize, layout.label.maxWidth, measureFrameText);
        } catch {
            // Measuring needs a canvas; the proportional size is close enough.
        }
        return { layout, text: frame.text, fontSize, colors: getFrameColors(layout, design) };
    }

    // The library needs at least one pixel per module; tiny print sizes of
    // large codes are raised to that minimum instead of failing.
    function minimumPixels(px, snapshot) {
        const needed = (Number(snapshot.moduleCount) || 21) + (2 * (Number(snapshot.quietZone) || 4));
        let size = Math.max(px, needed);
        if (snapshot.frame) {
            while (getFrameLayout(size, snapshot.frame.layout.style).qr.size < needed) size++;
        }
        return size;
    }

    async function renderCanvas(snapshot, design, px) {
        const engine = globalThis.QRTurboEngine;
        if (!engine || typeof engine.rasterCanvas !== 'function') throw new Error('QRTurboEngine is not loaded');
        return engine.rasterCanvas(design, snapshot.bytes, {
            size: px,
            quietZone: snapshot.quietZone,
            typeNumber: snapshot.version,
            ecl: snapshot.ecl,
            frame: frameAt(snapshot, design, px)
        });
    }

    function paintBehind(canvas, color) {
        const context = canvas.getContext('2d');
        if (!context) return;
        context.save();
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    /**
     * @description PNG, JPG or WebP at the resolved size. JPG is always
     * opaque. Print mode adds the density; when the pixel size had to change
     * (4096 cap or module minimum), the density keeps the physical width.
     */
    async function exportRaster(snapshot, o, signal) {
        const size = resolveSize(o);
        const notes = [];
        const format = o.format;
        const mime = FORMATS[format].mime;
        const bytesLib = bytesApi();
        let design = snapshot.design;

        if (size.capped) notes.push(tr('output.sizeCapped'));
        if (format === 'jpg') {
            if (design.transparentBackground) notes.push(tr('output.transparentJpg'));
            design = { ...design, transparentBackground: false, bgColor: design.transparentBackground ? '#ffffff' : design.bgColor };
        }

        const px = minimumPixels(size.px, snapshot);
        let dpi = null;
        if (size.kind === 'print') {
            const exact = Math.round((size.widthMm / 25.4) * size.dpi);
            dpi = px === exact ? size.dpi : (px * 25.4) / size.widthMm;
        }

        throwIfAborted(signal);
        const canvas = await renderCanvas(snapshot, design, px);
        let blob;
        try {
            throwIfAborted(signal);
            // Pixels the design leaves transparent (rounded frame corners)
            // become white, as on a page; the code itself is already opaque.
            if (format === 'jpg') paintBehind(canvas, '#ffffff');
            blob = await toBlob(canvas, mime, 1);
        } finally {
            releaseCanvas(canvas);
        }
        throwIfAborted(signal);

        let bytes = await blobBytes(blob);
        const kind = bytesLib.sniffImage(bytes);
        if (format === 'png') {
            if (kind !== 'png') throw new Error('The browser did not produce a PNG');
            bytes = bytesLib.pngWithMeta(bytes, { srgb: true, dpi });
        } else if (format === 'jpg') {
            if (kind !== 'jpeg') throw new Error('The browser did not produce a JPEG');
            if (dpi) bytes = bytesLib.jpegWithDpi(bytes, dpi);
        } else if (kind !== 'webp') {
            throw new Error('This browser cannot create WebP files');
        }

        return { blob: new Blob([bytes], { type: mime }), notes };
    }

    // --- Vector export helpers (browser side) ---

    /**
     * @description Turns an <image> data URL into pixels for the PDF and EPS
     * writers: drawn at min(natural size, 600 dpi of the fitted box, cap) and
     * split into RGB and alpha (alpha is null when fully opaque). SVG sources
     * are always drawn at the 600 dpi size. boxPx is the image box in Drawing
     * units before xMidYMid meet; o.pxPerUnit converts Drawing units to
     * 600 dpi pixels. The pixels keep the natural aspect ratio and report
     * naturalWidth/naturalHeight, so the flattener can fit the box exactly.
     */
    async function resolveImage(href, boxPx, o = {}) {
        if (typeof document === 'undefined') throw new Error('Images need a browser');
        if (!/^data:/i.test(String(href))) throw new Error('Only embedded images are exported');

        const isSvg = /^data:image\/svg\+xml/i.test(String(href));
        const image = new Image();
        image.decoding = 'async';
        image.src = href;
        await withTimeout(
            typeof image.decode === 'function'
                ? image.decode()
                : new Promise((resolve, reject) => {
                    image.onload = resolve;
                    image.onerror = () => reject(new Error('Image failed to load'));
                }),
            IMAGE_DECODE_TIMEOUT,
            'Image decoding'
        );

        const box = boxPx || {};
        const boxWidth = Number(box.w ?? box.width) || 0;
        const boxHeight = Number(box.h ?? box.height) || 0;
        const naturalWidth = image.naturalWidth || boxWidth || 1;
        const naturalHeight = image.naturalHeight || boxHeight || 1;
        const naturalLong = Math.max(naturalWidth, naturalHeight);
        // The box the image really covers after xMidYMid meet.
        const fit = boxWidth > 0 && boxHeight > 0 ? Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight) : 0;
        const dpiLong = o.pxPerUnit > 0 && fit > 0 ? naturalLong * fit * o.pxPerUnit : 0;
        const maxPx = o.maxPx || IMAGE_MAX_PX.pdf;

        let targetLong;
        if (isSvg || !image.naturalWidth) targetLong = dpiLong || naturalLong || 512;
        else targetLong = dpiLong ? Math.min(naturalLong, dpiLong) : naturalLong;
        targetLong = clamp(Math.round(targetLong), 1, maxPx);

        const width = Math.max(1, Math.round((targetLong * naturalWidth) / naturalLong));
        const height = Math.max(1, Math.round((targetLong * naturalHeight) / naturalLong));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        try {
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) throw new Error('A 2D canvas is required');
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            context.drawImage(image, 0, 0, width, height);
            const data = context.getImageData(0, 0, width, height).data;
            const rgb = new Uint8Array(width * height * 3);
            const alpha = new Uint8Array(width * height);
            let opaque = true;
            for (let source = 0, pixel = 0; pixel < alpha.length; pixel++, source += 4) {
                rgb[pixel * 3] = data[source];
                rgb[(pixel * 3) + 1] = data[source + 1];
                rgb[(pixel * 3) + 2] = data[source + 2];
                alpha[pixel] = data[source + 3];
                if (data[source + 3] !== 255) opaque = false;
            }
            return { width, height, rgb, alpha: opaque ? null : alpha, naturalWidth, naturalHeight };
        } finally {
            releaseCanvas(canvas);
        }
    }

    /**
     * @description Renders one label as a 1-bit stencil: the box spans
     * maxWidth x 1.4 em around the baseline, at o.pxPerUnit pixels per unit
     * (1200 dpi), at most 8000 px wide, alpha threshold 128. bits are packed
     * MSB first, each row padded to a whole byte, 1 = paint.
     */
    function textToMask(item, pxPerUnit) {
        const text = String(item.text || '');
        const fontSize = Number(item.fontSize) || 1;
        if (!text.trim()) return null;

        // Frame labels carry maxWidth; other text is measured (one canvas).
        const boxWidth = item.maxWidth > 0
            ? item.maxWidth
            : Math.max(fontSize, measureFrameText(text, fontSize) * 1.05);
        let scale = pxPerUnit > 0 ? pxPerUnit : 1;
        if (boxWidth * scale > LABEL_MASK_MAX_COLS) scale = LABEL_MASK_MAX_COLS / boxWidth;
        const cols = Math.max(1, Math.min(LABEL_MASK_MAX_COLS, Math.ceil(boxWidth * scale)));
        const rows = Math.max(1, Math.ceil((LABEL_ASCENT + LABEL_DESCENT) * fontSize * scale));
        const canvas = document.createElement('canvas');
        canvas.width = cols;
        canvas.height = rows;

        try {
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) throw new Error('A 2D canvas is required');
            let fontPx = fontSize * scale;
            context.font = getFrameFont(fontPx);
            const width = context.measureText(text).width;
            if (width > cols) {
                fontPx *= cols / width;
                context.font = getFrameFont(fontPx);
            }
            const anchor = item.anchor || 'middle';
            context.textAlign = anchor === 'middle' ? 'center' : (anchor === 'end' ? 'right' : 'left');
            context.textBaseline = 'alphabetic';
            context.fillStyle = '#000000';
            const drawX = anchor === 'middle' ? cols / 2 : (anchor === 'end' ? cols : 0);
            context.fillText(text, drawX, LABEL_ASCENT * fontSize * scale);

            const data = context.getImageData(0, 0, cols, rows).data;
            const rowBytes = Math.ceil(cols / 8);
            const bits = new Uint8Array(rowBytes * rows);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (data[(((y * cols) + x) * 4) + 3] >= 128) bits[(y * rowBytes) + (x >> 3)] |= 0x80 >> (x & 7);
                }
            }

            const maskWidth = cols / scale;
            let left = item.x - (maskWidth / 2);
            if (anchor === 'start') left = item.x;
            if (anchor === 'end') left = item.x - maskWidth;
            return {
                kind: 'mask',
                x: left,
                y: item.y - (LABEL_ASCENT * fontSize),
                width: maskWidth,
                height: rows / scale,
                cols,
                rows,
                bits,
                paint: item.paint
            };
        } finally {
            releaseCanvas(canvas);
        }
    }

    /**
     * @description Replaces every text item that Helvetica-Bold cannot encode
     * (QRTurboHelvetica.canEncode) with a 1200 dpi stencil mask painted in
     * the label color. o.pxPerUnit is the 1200 dpi scale of the drawing.
     * Returns a new Drawing; groups are walked recursively.
     */
    async function prepareText(drawing, o = {}) {
        const helvetica = globalThis.QRTurboHelvetica;
        const canEncode = text => Boolean(helvetica && typeof helvetica.canEncode === 'function' && helvetica.canEncode(text));
        const visit = items => items.flatMap(item => {
            if (item.kind === 'group') return [{ ...item, items: visit(item.items || []) }];
            if (item.kind !== 'text' || canEncode(item.text)) return [item];
            const mask = textToMask(item, o.pxPerUnit);
            return mask ? [mask] : [];
        });
        return { ...drawing, items: visit(drawing.items || []) };
    }

    function loadVectorModules(format) {
        const kit = ui();
        if (!kit || typeof kit.loadScript !== 'function') return Promise.reject(new Error('QRTurboUI is not loaded'));
        return Promise.all([
            kit.loadScript('/js/lib/geometry.js'),
            kit.loadScript('/js/lib/helvetica.js'),
            format === 'eps' ? kit.loadScript('/js/lib/eps.js') : kit.loadScript('/js/lib/pdf.js')
        ]);
    }

    /**
     * @description Loads the lazy PDF or EPS modules at idle, once per format
     * (SPEC C.2), so the first vector download does not wait for them. A
     * failed load is retried by the export itself.
     */
    function prefetch(format) {
        if ((format !== 'pdf' && format !== 'eps') || prefetchedFormats.has(format)) return;
        const kit = ui();
        if (!kit || typeof kit.loadScript !== 'function' || typeof document === 'undefined') return;
        prefetchedFormats.add(format);
        const run = () => {
            loadVectorModules(format).catch(() => prefetchedFormats.delete(format));
        };
        if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 3000 });
        else setTimeout(run, 1000);
    }

    function viewBoxWidth(root, snapshot) {
        const viewBox = String(getAttr(root, 'viewBox') || '').trim().split(/[\s,]+/).map(Number);
        if (viewBox.length === 4 && viewBox[2] > 0) return viewBox[2];
        const width = parseFloat(getAttr(root, 'width'));
        if (width > 0) return width;
        if (snapshot.frame) return snapshot.frame.layout.width;
        return ((snapshot.moduleCount || 21) + (2 * (snapshot.quietZone || 4))) * 10;
    }

    /**
     * @description Flattens the export SVG into a Drawing with logos as
     * pixels and non-Latin-1 labels as stencil masks.
     */
    async function buildDrawing(snapshot, size, format, signal) {
        const svg = globalThis.QRTurboSvg;
        const geometry = globalThis.QRTurboGeometry;
        const markup = hardenSvg(snapshotMarkup(snapshot), { idPrefix: 'qrt-', xmlDeclaration: false });
        const root = svg.parse(markup);
        const mmPerUnit = size.widthMm / viewBoxWidth(root, snapshot);
        const drawing = await geometry.flatten(root, {
            resolveImage: (href, boxPx) => resolveImage(href, boxPx, {
                pxPerUnit: (mmPerUnit / 25.4) * IMAGE_DPI,
                maxPx: IMAGE_MAX_PX[format] || IMAGE_MAX_PX.pdf
            })
        });
        throwIfAborted(signal);
        const labelScale = ((size.widthMm / (drawing.width || viewBoxWidth(root, snapshot))) / 25.4) * LABEL_MASK_DPI;
        return prepareText(drawing, { pxPerUnit: labelScale });
    }

    async function exportPdfVector(snapshot, o, size, signal) {
        await loadVectorModules('pdf');
        throwIfAborted(signal);
        const drawing = await buildDrawing(snapshot, size, 'pdf', signal);
        const result = await globalThis.QRTurboPdf.write(drawing, {
            widthPt: size.widthMm * PT_PER_MM,
            page: o.page,
            colorMode: o.colorMode,
            deflate: bytesApi().deflate
        });
        throwIfAborted(signal);
        return {
            blob: new Blob([result.bytes], { type: FORMATS.pdf.mime }),
            notes: result.scaledToFit ? [tr('output.pageTooSmall')] : []
        };
    }

    // The raster PDF from app.js: the code at 300 dpi of the requested width
    // (at most 4096 px), as an opaque RGB image on one A4 page.
    async function exportPdfRaster(snapshot, size, signal) {
        const px = minimumPixels(Math.min(MAX_PIXELS, Math.round((size.widthMm / 25.4) * FALLBACK_PDF_DPI)), snapshot);
        const canvas = await renderCanvas(snapshot, snapshot.design, px);
        let png;
        try {
            png = await toBlob(canvas, 'image/png');
        } finally {
            releaseCanvas(canvas);
        }
        throwIfAborted(signal);
        const imageData = await getOpaqueImageDataFromBlob(png);
        return { blob: createQRCodePdfBlob(imageData), notes: [] };
    }

    async function exportPdf(snapshot, o, signal, quiet) {
        const size = resolveSize(o);
        try {
            return await exportPdfVector(snapshot, o, size, signal);
        } catch (error) {
            if (isAbort(error)) throw error;
            console.warn('Vector PDF export failed; saving the raster PDF instead.', error && error.message);
            const result = await exportPdfRaster(snapshot, size, signal);
            const kit = ui();
            if (!quiet && kit && typeof kit.toast === 'function') {
                kit.toast(tr('toast.pdfRasterFallback'), { tone: 'info' });
            }
            return { ...result, rasterFallback: true };
        }
    }

    async function exportEps(snapshot, o, signal) {
        const size = resolveSize(o);
        await loadVectorModules('eps');
        throwIfAborted(signal);
        const drawing = await buildDrawing(snapshot, size, 'eps', signal);
        const text = await globalThis.QRTurboEps.write(drawing, {
            widthPt: size.widthMm * PT_PER_MM,
            colorMode: o.colorMode,
            deflate: bytesApi().deflate
        });
        throwIfAborted(signal);
        return { blob: new Blob([text], { type: FORMATS.eps.mime }), notes: [] };
    }

    /**
     * @description Creates the file for a snapshot. Resolves
     * { blob, filename, mime, notes, rasterFallback? }. notes are translated
     * messages about the file (size capped, white JPG background, page
     * scaled to fit). A PDF that had to use the raster fallback has
     * rasterFallback: true; the exporter shows toast.pdfRasterFallback itself
     * unless o.quiet is set (batch runs). Rejects with an AbortError when
     * o.signal aborts.
     */
    async function exportFile(snapshot, opts, o = {}) {
        if (!snapshot) throw new Error('There is no QR code to export');
        const options = normalizeOptions(opts);
        const signal = o.signal;
        const format = options.format;
        throwIfAborted(signal);

        let result;
        if (FORMATS[format].kind === 'raster') {
            result = await exportRaster(snapshot, options, signal);
        } else if (format === 'svg') {
            result = { blob: new Blob([buildSvg(snapshot, options)], { type: FORMATS.svg.mime }), notes: [] };
        } else if (format === 'pdf') {
            result = await exportPdf(snapshot, options, signal, Boolean(o.quiet));
        } else {
            result = await exportEps(snapshot, options, signal);
        }
        throwIfAborted(signal);

        const output = {
            blob: result.blob,
            filename: buildFilename(snapshot, options),
            mime: FORMATS[format].mime,
            notes: result.notes
        };
        if (result.rasterFallback) output.rasterFallback = true;
        return output;
    }

    // --- Capabilities ---

    function shareSupported() {
        return typeof navigator !== 'undefined'
            && typeof navigator.share === 'function'
            && typeof navigator.canShare === 'function'
            && typeof File === 'function';
    }

    function canShareFiles(files) {
        try {
            return Boolean(navigator.canShare({ files }));
        } catch {
            return false;
        }
    }

    function probeWebp() {
        if (typeof document === 'undefined') return Promise.resolve(false);
        return new Promise(resolve => {
            let canvas = null;
            try {
                canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const timer = setTimeout(() => {
                    releaseCanvas(canvas);
                    resolve(false);
                }, PROBE_TIMEOUT);
                canvas.toBlob(blob => {
                    clearTimeout(timer);
                    releaseCanvas(canvas);
                    resolve(Boolean(blob) && blob.type === 'image/webp');
                }, 'image/webp', 1);
            } catch {
                releaseCanvas(canvas);
                resolve(false);
            }
        });
    }

    function getClipboard() {
        return typeof navigator !== 'undefined' && navigator.clipboard ? navigator.clipboard : null;
    }

    function canWriteText(clipboard) {
        return Boolean(clipboard) && typeof clipboard.writeText === 'function';
    }

    // ClipboardItem plus clipboard.write, and the type accepted where the
    // browser can say so (ClipboardItem.supports).
    function canWriteItem(clipboard, type) {
        if (typeof ClipboardItem !== 'function' || !clipboard || typeof clipboard.write !== 'function') return false;
        if (typeof ClipboardItem.supports !== 'function') return true;
        try {
            return Boolean(ClipboardItem.supports(type));
        } catch {
            return false;
        }
    }

    function canWriteImage(clipboard) {
        return canWriteItem(clipboard, 'image/png');
    }

    function detectCapabilities() {
        const clipboard = getClipboard();
        const clipboardImage = canWriteImage(clipboard);
        let shareFiles = false;
        if (shareSupported()) {
            shareFiles = canShareFiles([new File([new Uint8Array(8)], 'qrcode.png', { type: 'image/png' })]);
        }

        return probeWebp().then(webp => Object.freeze({
            webp,
            clipboardImage,
            clipboardText: canWriteText(clipboard),
            shareFiles,
            deflate: typeof CompressionStream === 'function'
        }));
    }

    /**
     * @description What this browser can do, detected once: WebP encoding
     * (a real probe, Safari returns PNG), clipboard image and text, sharing
     * files and deflate compression.
     */
    function capabilities() {
        if (!capabilitiesPromise) capabilitiesPromise = detectCapabilities();
        return capabilitiesPromise;
    }

    // --- Copy ---

    function clipboardImageOptions(o) {
        const size = resolveSize(o);
        const px = FORMATS[o.format].kind === 'raster' ? Math.min(size.px, COPY_RASTER_CAP) : VECTOR_RASTER_SIZE;
        return { ...o, format: 'png', pixelSize: 'custom', customPixels: px, print: { ...o.print, enabled: false } };
    }

    function isThenable(value) {
        return Boolean(value) && typeof value.then === 'function';
    }

    function requireSnapshot(snapshot) {
        if (!snapshot) throw new Error('There is no QR code to copy');
        return snapshot;
    }

    // A Promise handed to ClipboardItem is observed by the browser; the
    // extra handler keeps a rejection from being reported as unhandled.
    function quiet(promise) {
        promise.catch(() => {});
        return promise;
    }

    // When the clipboard write fails because the snapshot never came, the
    // snapshot's error is the one worth reporting.
    function preferSourceError(write, snapshotPromise) {
        return write.catch(error => snapshotPromise.then(() => {
            throw error;
        }));
    }

    // SVG code for a snapshot that is still being made. writeText needs the
    // text inside the click, so the text goes out as a 'text/plain' Promise
    // where ClipboardItem allows it; otherwise (or when that write fails)
    // the text is written once it exists, which works where the browser
    // still allows it.
    function copySvgLater(snapshotPromise, o, clipboard) {
        const markupPromise = quiet(snapshotPromise.then(snapshot => buildSvg(snapshot, o)));
        const writeLater = () => markupPromise.then(markup => clipboard.writeText(markup));
        if (!canWriteItem(clipboard, 'text/plain')) return writeLater();

        let item;
        try {
            item = new ClipboardItem({
                'text/plain': quiet(markupPromise.then(markup => new Blob([markup], { type: 'text/plain' })))
            });
        } catch {
            return writeLater();
        }
        return settle(() => clipboard.write([item])).catch(() => writeLater());
    }

    /**
     * @description Copies the code. Call it synchronously from the click
     * handler, with the Snapshot or, while the preview is still updating,
     * with a Promise of it (app.whenReady()). The clipboard write starts
     * before any await, with the PNG passed to ClipboardItem as a Promise
     * that waits for the snapshot and renders, because Safari drops the
     * user activation at the first await. SVG format, or a browser without
     * image clipboard, copies the SVG code as text. Resolves 'image' or
     * 'svg'; rejects when there is no snapshot, also when the Promise
     * resolves to null.
     */
    function copy(source, opts) {
        const o = normalizeOptions(opts);
        const clipboard = getClipboard();
        const canText = canWriteText(clipboard);
        const canImage = canWriteImage(clipboard);

        if (!source) return Promise.reject(new Error('There is no QR code to copy'));
        if (!canText && !canImage) return Promise.reject(new Error('The clipboard is not available'));

        const pending = isThenable(source);
        const snapshotPromise = quiet(Promise.resolve(source).then(requireSnapshot));

        if (canText && (o.format === 'svg' || !canImage)) {
            if (pending) return copySvgLater(snapshotPromise, o, clipboard).then(() => 'svg');
            let markup;
            try {
                markup = buildSvg(source, o);
            } catch (error) {
                return Promise.reject(error);
            }
            return settle(() => clipboard.writeText(markup)).then(() => 'svg');
        }

        const pngPromise = quiet(snapshotPromise
            .then(snapshot => exportRaster(snapshot, clipboardImageOptions(o)))
            .then(result => result.blob));
        let item;
        try {
            item = new ClipboardItem({ 'image/png': pngPromise });
        } catch {
            // Older engines accept only a Blob, not a Promise.
            return pngPromise
                .then(blob => clipboard.write([new ClipboardItem({ 'image/png': blob })]))
                .then(() => 'image');
        }
        return preferSourceError(settle(() => clipboard.write([item])), snapshotPromise).then(() => 'image');
    }

    // Runs a call that should return a Promise; a synchronous throw becomes
    // a rejection, so callers always get a Promise back.
    function settle(call) {
        try {
            return Promise.resolve(call());
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // --- Share ---

    function shareKey(opts) {
        const o = normalizeOptions(opts);
        return JSON.stringify([o.format, o.pixelSize, o.customPixels, o.print, o.page, o.colorMode]);
    }

    async function buildShareFile(snapshot, opts) {
        const o = normalizeOptions(opts);
        const asFile = result => new File([result.blob], result.filename, { type: result.mime });

        if (SHAREABLE_FORMATS.includes(o.format)) {
            const file = asFile(await exportFile(snapshot, o, { quiet: true }));
            if (canShareFiles([file])) return file;
        }

        const png = { ...o, format: 'png', pixelSize: VECTOR_RASTER_SIZE, print: { ...o.print, enabled: false } };
        const file = asFile(await exportFile(snapshot, png, { quiet: true }));
        return canShareFiles([file]) ? file : null;
    }

    /**
     * @description Generates the share file ahead of time, so share() can
     * call navigator.share() without slow work in between (Safari drops the
     * user activation otherwise). The chosen format when the browser can
     * share it, otherwise a 1024 px PNG. Repeated calls for the same
     * snapshot and options do nothing.
     */
    function prepareShare(snapshot, opts) {
        if (!snapshot || !shareSupported()) return;
        const key = shareKey(opts);
        if (shareState.snapshot === snapshot && shareState.key === key && shareState.promise) return;

        const token = ++shareState.token;
        shareState.snapshot = snapshot;
        shareState.key = key;
        shareState.file = null;
        shareState.promise = buildShareFile(snapshot, opts)
            .then(file => {
                if (token === shareState.token) shareState.file = file;
                return file;
            })
            .catch(error => {
                console.warn('Preparing the share file failed.', error && error.message);
                if (token === shareState.token) {
                    shareState.snapshot = null;
                    shareState.promise = null;
                }
                return null;
            });
    }

    /**
     * @description Shares the prepared file with navigator.share({files}),
     * never with a title or text. Pass the snapshot and options to make sure
     * the file matches them; a missing file is then generated first.
     * Resolves 'shared', 'cancelled' (AbortError) or 'unsupported'; other
     * errors reject.
     */
    async function share(snapshot, opts) {
        if (!shareSupported()) return 'unsupported';
        if (snapshot) prepareShare(snapshot, opts);

        const file = shareState.file || (shareState.promise ? await shareState.promise : null);
        if (!file) throw new Error('There is no file to share');

        try {
            await navigator.share({ files: [file] });
            return 'shared';
        } catch (error) {
            if (isAbort(error)) return 'cancelled';
            throw error;
        }
    }

    // --- Print ---

    function clearPrintSheet() {
        const sheet = typeof document !== 'undefined' ? document.getElementById('print-sheet') : null;
        if (sheet) sheet.replaceChildren();
        if (printUrl) {
            URL.revokeObjectURL(printUrl);
            printUrl = null;
        }
    }

    /**
     * @description The width Print uses, as { width, unit, widthMm,
     * scaledToFit }: the print size the export panel shows (PDF and EPS
     * always, PNG, JPG and SVG with "Set print size"), otherwise the default
     * width of the unit (50 mm or 2 in), never a width the current format
     * hides. A width the print page cannot hold is scaled down to
     * PRINT_SHEET_MAX_MM and scaledToFit is true.
     */
    function printSize(opts) {
        const o = normalizeOptions(opts);
        const unitInfo = PRINT_UNITS[o.print.unit];
        const size = effectiveSize(o, resolveSize(o));
        let widthMm = isPhysical(size) ? size.widthMm : unitInfo.fallback * unitInfo.toMm;
        let scaledToFit = Boolean(size.scaledToFit);
        if (widthMm > PRINT_SHEET_MAX_MM + 1e-6) {
            widthMm = PRINT_SHEET_MAX_MM;
            scaledToFit = true;
        }
        return { width: widthMm / unitInfo.toMm, unit: o.print.unit, widthMm, scaledToFit };
    }

    /**
     * @description Prints the code at its exact physical width: fills
     * #print-sheet with the hardened SVG at printSize(opts), shows that size
     * with the "scale 100%" tip and opens the print dialog. Resolves the
     * printSize result, or undefined when printing is not possible.
     */
    async function printSheet(snapshot, opts) {
        if (typeof document === 'undefined' || typeof window === 'undefined' || typeof window.print !== 'function') return undefined;
        const sheet = document.getElementById('print-sheet');
        if (!sheet || !snapshot) return undefined;

        const size = printSize(opts);
        const length = `${trimNumber(size.width, 3)}${size.unit}`;
        const markup = exportMarkup(snapshot, length);

        clearPrintSheet();
        printUrl = URL.createObjectURL(new Blob([markup], { type: FORMATS.svg.mime }));
        const image = document.createElement('img');
        image.alt = '';
        image.className = 'print-sheet-image';
        image.style.width = length;
        image.style.height = length;
        image.src = printUrl;
        sheet.replaceChildren(image);

        try {
            if (typeof image.decode === 'function') await withTimeout(image.decode(), IMAGE_DECODE_TIMEOUT, 'Print image');
        } catch {
            // Print anyway; the browser finishes loading the image itself.
        }

        window.addEventListener('afterprint', clearPrintSheet, { once: true });
        const kit = ui();
        if (kit && typeof kit.toast === 'function') {
            // The size is always named, also when the panel does not show it.
            const parts = [tr('output.summaryVectorPrint', { size: formatUnitValue(size.width, size.unit) })];
            if (size.scaledToFit) parts.push(tr('output.pageTooSmall'));
            parts.push(tr('output.printTip'));
            kit.toast(parts.join(' · '), { tone: 'info' });
        }
        window.print();
        return size;
    }

    const api = {
        FORMATS,
        capabilities,
        resolveSize,
        describe,
        buildFilename,
        exportFile,
        copy,
        prepareShare,
        share,
        printSize,
        printSheet,
        prefetch,
        // Helpers for the vector pipeline, exposed for tests and tooling.
        normalizeOptions,
        resolveImage,
        prepareText
    };

    globalThis.QRTurboExport = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
