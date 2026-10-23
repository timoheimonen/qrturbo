// QRTurbo.app - Scan rules (QRTurboRules)
// Pure: the effective error correction level, physical and pixel size math,
// and the ordered list of scan issues with their one-click fixes.
//
// Issue vars hold raw numbers; the UI formats them for the current language:
//   warnings.printTooSmall  { size: module size in mm, system: 'metric'|'imperial' }
//   scan.fixPrintSize       { size: printed width in the chosen unit, unit: 'mm'|'in' }
//   warnings.sizeTooSmall   { size: image width in px }
//   scan.fixPixelSize       { size: image width in px }
(function () {
    'use strict';

    const LEVELS = ['L', 'M', 'Q', 'H'];
    const MM_PER_INCH = 25.4;

    // Symbol contrast thresholds, after the ISO/IEC 15415 grades C and D.
    const CONTRAST_FAIL = 0.25;
    const CONTRAST_WARN = 0.40;
    // Grade A. Below it a failed test scan is more likely the colors than
    // the shapes: jsQR misses light codes well above the warning level.
    const CONTRAST_GOOD = 0.70;
    const DENSE_VERSION = 15;
    // Module size in mm: fail, warn, and the target that the print fix uses.
    const MODULE_FAIL_MM = 0.25;
    const MODULE_WARN_MM = 0.4;
    const MODULE_TARGET_MM = 0.5;
    // The smallest printed code (without its quiet zone) most phones read.
    const MIN_CODE_MM = 20;
    // Phones read codes from about ten times their width.
    const SCAN_DISTANCE_FACTOR = 10;
    const MIN_PX_PER_MODULE = 3;
    const TARGET_PX_PER_MODULE = 4;
    // EPC069-12: a SEPA payment code is at most version 13 at level M.
    const PAYMENT_MAX_VERSION = 13;
    const MAX_VERSION = 40;

    // The ExportOptions limits, declared once: the controller, the export
    // panel and the exporter read them from here, so the numbers checked
    // while typing, stored and written to the file always match.
    const EXPORT_LIMITS = Object.freeze({
        print: Object.freeze({
            mm: Object.freeze({ min: 10, max: 2000, fallback: 50 }),
            in: Object.freeze({ min: 0.4, max: 80, fallback: 2 })
        }),
        pixels: Object.freeze({ min: 128, max: 4096, presets: Object.freeze([512, 1024, 2048, 4096]) }),
        dpis: Object.freeze([150, 300, 600])
    });
    const PIXEL_PRESETS = EXPORT_LIMITS.pixels.presets;
    const MIN_RASTER_PX = EXPORT_LIMITS.pixels.min;
    const MAX_RASTER_PX = EXPORT_LIMITS.pixels.max;
    const LOGO_LARGE = 0.45;
    const LOGO_SMALLER = 0.35;
    const EPSILON = 1e-9;

    const RASTER_FORMATS = ['png', 'jpg', 'webp'];
    // Formats whose "Set print size" option gives a physical width. WebP has
    // no print size; PDF and EPS always have one.
    const PRINT_OPTION_FORMATS = ['png', 'jpg', 'svg'];
    const ALWAYS_PRINT_FORMATS = ['pdf', 'eps'];
    const PRINT_LIMITS = EXPORT_LIMITS.print;

    const BLACK_ON_WHITE = Object.freeze({
        fgColor: '#000000',
        bgColor: '#ffffff',
        fill: 'solid',
        customCorners: false,
        transparentBackground: false
    });
    const SQUARE_SHAPES = Object.freeze({
        dotStyle: 'square',
        cornerSquareStyle: 'square',
        cornerDotStyle: 'square'
    });
    // Issues whose own fix is a likelier cure for a failed test scan.
    const DESIGN_CAUSES = ['lowContrast', 'logoErrorCorrection', 'logoLarge', 'paymentLogo'];

    function color() {
        return globalThis.QRTurboColor;
    }

    /**
     * @description The level the code is rendered with. Payment codes are
     * locked to M. An explicit level is kept. Auto uses H with a logo and M
     * without one.
     */
    function effectiveEcl(design, type) {
        if (type === 'Payment') return { ecl: 'M', auto: false };

        const level = design && design.errorCorrection;
        if (LEVELS.includes(level)) return { ecl: level, auto: false };
        return { ecl: design && design.logo ? 'H' : 'M', auto: true };
    }

    /**
     * @description The smallest version the code may use: an explicit floor
     * (batch "same size") or the design's minimum version, 1 when neither is
     * set. Payment codes never go above version 13 (EPC069-12), so their
     * floor is capped there.
     */
    function versionFloor(design, type, override) {
        const valid = value => Number.isInteger(value) && value >= 1 && value <= MAX_VERSION;
        let floor = 1;
        if (valid(override)) floor = override;
        else if (design && valid(design.minVersion)) floor = design.minVersion;
        return type === 'Payment' ? Math.min(floor, PAYMENT_MAX_VERSION) : floor;
    }

    function printOptions(exportOptions) {
        return (exportOptions && exportOptions.print) || {};
    }

    function widthInMm(print) {
        const width = Number(print.width);
        if (!(width > 0)) return null;
        return print.unit === 'in' ? width * MM_PER_INCH : width;
    }

    function hasPhysicalSize(exportOptions) {
        const format = exportOptions && exportOptions.format;
        if (ALWAYS_PRINT_FORMATS.includes(format)) return true;
        return PRINT_OPTION_FORMATS.includes(format) && printOptions(exportOptions).enabled === true;
    }

    function isPrintRaster(exportOptions) {
        const format = exportOptions && exportOptions.format;
        return (format === 'png' || format === 'jpg') && printOptions(exportOptions).enabled === true;
    }

    /**
     * @description Modules across the whole artwork per module of the code:
     * the code with its quiet zone, divided by the share of the artwork it
     * covers (less than 1 inside a frame).
     */
    function modulesAcross(qrFraction, moduleCount, quietZone) {
        const fraction = qrFraction > 0 && qrFraction <= 1 ? qrFraction : 1;
        const total = Number(moduleCount) + (2 * (Number(quietZone) || 0));
        if (!(total > 0) || !(Number(moduleCount) > 0)) return null;
        return { fraction, total };
    }

    /**
     * @description The physical size of the printed artwork, or null when no
     * print size applies. moduleMm is one module, codeMm the code without
     * its quiet zone, and scanDistanceMm about ten times codeMm.
     */
    function physical(exportOptions, qrFraction, moduleCount, quietZone) {
        if (!hasPhysicalSize(exportOptions)) return null;
        const widthMm = widthInMm(printOptions(exportOptions));
        const geometry = modulesAcross(qrFraction, moduleCount, quietZone);
        if (widthMm === null || !geometry) return null;

        const moduleMm = (widthMm * geometry.fraction) / geometry.total;
        const codeMm = moduleMm * moduleCount;
        return { widthMm, codeMm, moduleMm, scanDistanceMm: codeMm * SCAN_DISTANCE_FACTOR };
    }

    /**
     * @description The pixel size of a raster export, or null for vector
     * formats. In print mode the width comes from the print size and dpi and
     * is capped at 4096 px. Custom sizes are clamped to 128-4096 px, as the
     * exporter does.
     */
    function pixels(exportOptions, qrFraction, moduleCount, quietZone) {
        const format = exportOptions && exportOptions.format;
        if (!RASTER_FORMATS.includes(format)) return null;
        const geometry = modulesAcross(qrFraction, moduleCount, quietZone);
        if (!geometry) return null;

        let px;
        let capped = false;
        const print = isPrintRaster(exportOptions);
        if (print) {
            const widthMm = widthInMm(printOptions(exportOptions));
            const dpi = Number(printOptions(exportOptions).dpi);
            if (widthMm === null || !(dpi > 0)) return null;
            const exact = Math.round((widthMm / MM_PER_INCH) * dpi);
            capped = exact > MAX_RASTER_PX;
            px = Math.min(exact, MAX_RASTER_PX);
        } else {
            const custom = exportOptions.pixelSize === 'custom';
            px = custom ? Number(exportOptions.customPixels) : Number(exportOptions.pixelSize);
            if (!(px > 0)) return null;
            capped = px > MAX_RASTER_PX;
            px = Math.min(Math.round(px), MAX_RASTER_PX);
            if (custom) px = Math.max(px, MIN_RASTER_PX);
        }

        px = Math.max(1, px);
        return {
            px,
            pxPerModule: (px * geometry.fraction) / geometry.total,
            capped,
            mode: print ? 'print' : 'pixels'
        };
    }

    /**
     * @description The printed width, in the user's unit, at which modules
     * are at least 0.5 mm and the code is at least 2 cm. Rounded up to a
     * whole mm or 0.1 in. Null when no larger width is allowed.
     */
    function printFix(exportOptions, size) {
        const print = printOptions(exportOptions);
        const unit = print.unit === 'in' ? 'in' : 'mm';
        const scale = Math.max(MODULE_TARGET_MM / size.moduleMm, MIN_CODE_MM / size.codeMm);
        const neededMm = size.widthMm * scale;

        const step = unit === 'in' ? 10 : 1;
        const inUnit = unit === 'in' ? neededMm / MM_PER_INCH : neededMm;
        const width = Math.min(Math.ceil((inUnit * step) - EPSILON) / step, PRINT_LIMITS[unit].max);
        if (!(width > Number(print.width))) return null;

        return {
            labelKey: 'scan.fixPrintSize',
            vars: { size: width, unit },
            exportOptions: { print: { width } }
        };
    }

    /**
     * @description The smallest preset image size with at least 4 px per
     * module, or null when the current size is already that large.
     */
    function pixelFix(size) {
        const pxPerModulePerPx = size.pxPerModule / size.px;
        const needed = TARGET_PX_PER_MODULE / pxPerModulePerPx;
        const preset = PIXEL_PRESETS.find(candidate => candidate >= needed - EPSILON)
            || PIXEL_PRESETS[PIXEL_PRESETS.length - 1];
        if (preset <= size.px) return null;

        return {
            labelKey: 'scan.fixPixelSize',
            vars: { size: preset },
            exportOptions: { pixelSize: preset }
        };
    }

    /**
     * @description True when applying the design patch would change nothing,
     * so its fix button is left out.
     */
    function isNoopDesignFix(design, patch) {
        return Object.keys(patch).every(key => Object.is(design[key], patch[key]));
    }

    function withFix(issue, design, fix) {
        if (!fix) return issue;
        if (fix.design && isNoopDesignFix(design, fix.design)) return issue;
        issue.fix = fix;
        return issue;
    }

    /**
     * @description The symbol contrast of a design: the foreground color
     * closest to the background against that background, where a
     * transparent background counts as white.
     */
    function designContrast(design) {
        const Color = color();
        const bg = design.transparentBackground ? '#ffffff' : (Color.normalizeHex(design.bgColor) || '#ffffff');
        const worst = Color.worstForeground(design, bg);
        return { worst, contrast: Color.symbolContrast(worst, bg) };
    }

    /**
     * @description Swapping the code color and the background fixes an
     * inverted code only when every other foreground color (the second
     * gradient stop, custom corners) also ends up dark enough on the new
     * background. Otherwise black on white is offered instead.
     */
    function invertedFix(design) {
        const swap = { fgColor: design.bgColor, bgColor: design.fgColor };
        const swapped = designContrast({ ...design, ...swap }).contrast;
        if (swapped >= CONTRAST_WARN) return { labelKey: 'scan.fixSwapColors', design: swap };
        return { labelKey: 'scan.fixBlack', design: { ...BLACK_ON_WHITE } };
    }

    /**
     * @description The scan issues for one snapshot, always in this order:
     * lowContrast, inverted, transparentBackground, denseData, printTooSmall,
     * codeTooSmall, sizeTooSmall, logoErrorCorrection, logoLarge, paymentLogo,
     * smallScanRisky, decodeFailed. A decode failure is not listed when a
     * failing contrast already explains it, and it offers a fix (black on
     * white or square shapes) only when no contrast or logo issue is listed.
     */
    function issues(input) {
        const source = input || {};
        const design = source.design || {};
        const type = source.type;
        const exportOptions = source.exportOptions || {};
        const decode = source.decode || null;
        const list = [];
        const Color = color();

        // Contrast, against white when the background is transparent.
        const { worst, contrast } = designContrast(design);
        const contrastSize = Math.abs(contrast);
        const lowContrast = contrastSize < CONTRAST_WARN;
        const contrastFails = contrastSize < CONTRAST_FAIL;

        if (lowContrast) {
            list.push(withFix({
                id: 'lowContrast',
                severity: contrastFails ? 'fail' : 'warn',
                messageKey: worst === Color.normalizeHex(design.fgColor) ? 'warnings.lowContrast' : 'warnings.gradientContrast'
            }, design, { labelKey: 'scan.fixBlack', design: { ...BLACK_ON_WHITE } }));
        }

        if (!lowContrast && contrast < 0) {
            list.push(withFix({
                id: 'inverted',
                severity: 'warn',
                messageKey: 'warnings.inverted'
            }, design, invertedFix(design)));
        }

        if (design.transparentBackground) {
            list.push({ id: 'transparentBackground', severity: 'info', messageKey: 'warnings.transparentBackground' });
        }

        const version = Number(source.analysis && source.analysis.version);
        if (version > DENSE_VERSION) {
            list.push({ id: 'denseData', severity: 'warn', messageKey: 'warnings.denseData' });
        }

        const size = source.physical;
        let printTooSmall = false;
        if (size && size.moduleMm < MODULE_WARN_MM) {
            printTooSmall = true;
            list.push(withFix({
                id: 'printTooSmall',
                severity: size.moduleMm < MODULE_FAIL_MM ? 'fail' : 'warn',
                messageKey: 'warnings.printTooSmall',
                vars: { size: size.moduleMm, system: printOptions(exportOptions).unit === 'in' ? 'imperial' : 'metric' }
            }, design, printFix(exportOptions, size)));
        }

        if (size && !printTooSmall && size.codeMm < MIN_CODE_MM) {
            list.push(withFix({
                id: 'codeTooSmall',
                severity: 'warn',
                messageKey: 'warnings.codeTooSmall'
            }, design, printFix(exportOptions, size)));
        }

        const raster = source.pixels;
        if (raster && !isPrintRaster(exportOptions) && raster.pxPerModule < MIN_PX_PER_MODULE) {
            list.push(withFix({
                id: 'sizeTooSmall',
                severity: 'warn',
                messageKey: 'warnings.sizeTooSmall',
                vars: { size: raster.px }
            }, design, pixelFix(raster)));
        }

        const hasLogo = Boolean(design.logo);
        if (hasLogo && (source.ecl === 'L' || source.ecl === 'M') && type !== 'Payment') {
            list.push(withFix({
                id: 'logoErrorCorrection',
                severity: 'warn',
                messageKey: 'warnings.logoErrorCorrection'
            }, design, { labelKey: 'scan.fixEclH', design: { errorCorrection: 'auto' } }));
        }

        if (hasLogo && Number(design.logoSize) >= LOGO_LARGE - EPSILON) {
            list.push(withFix({
                id: 'logoLarge',
                severity: 'warn',
                messageKey: 'warnings.logoLarge'
            }, design, { labelKey: 'scan.fixLogoSmaller', design: { logoSize: LOGO_SMALLER } }));
        }

        if (hasLogo && type === 'Payment') {
            list.push(withFix({
                id: 'paymentLogo',
                severity: 'warn',
                messageKey: 'warnings.paymentLogo'
            }, design, { labelKey: 'scan.fixRemoveLogo', design: { logo: null } }));
        }

        if (decode === 'pass-large') {
            list.push({ id: 'smallScanRisky', severity: 'warn', messageKey: 'warnings.smallScanRisky' });
        }

        if (decode === 'fail' && !contrastFails) {
            // A fix is offered only when no contrast or logo issue already
            // offers a likelier one: black on white first for a light or
            // colored code, otherwise square shapes. A fix that would change
            // nothing gives way to the other one, so a failed scan never
            // ends without a next step while one is left.
            const otherCause = list.some(issue => DESIGN_CAUSES.includes(issue.id));
            const square = { labelKey: 'scan.fixSquare', design: { ...SQUARE_SHAPES } };
            const black = { labelKey: 'scan.fixBlack', design: { ...BLACK_ON_WHITE } };
            const order = contrastSize < CONTRAST_GOOD ? [black, square] : [square, black];
            const fix = otherCause ? null : order.find(candidate => !isNoopDesignFix(design, candidate.design));
            list.push(withFix({
                id: 'decodeFailed',
                severity: 'fail',
                messageKey: 'warnings.decodeFailed'
            }, design, fix || null));
        }

        return list;
    }

    /**
     * @description The badge state: any fail gives fail, otherwise any warn
     * gives warn, otherwise ok. verified is true after a successful decode,
     * false after a failed one, and null when no decoder ran.
     */
    function scanState(issueList, decode) {
        const severities = (issueList || []).map(issue => issue.severity);
        let state = 'ok';
        if (severities.includes('fail')) state = 'fail';
        else if (severities.includes('warn')) state = 'warn';

        let verified = null;
        if (decode === 'pass' || decode === 'pass-large') verified = true;
        else if (decode === 'fail') verified = false;

        return { state, verified };
    }

    const api = {
        EXPORT_LIMITS,
        PAYMENT_MAX_VERSION,
        effectiveEcl,
        versionFloor,
        physical,
        pixels,
        issues,
        scanState
    };

    globalThis.QRTurboRules = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
