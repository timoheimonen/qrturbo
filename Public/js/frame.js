// QRTurbo.app - Frame geometry and rendering
// Frames place the QR code and a call-to-action label inside a square output.
// These are top-level declarations on purpose: the unit tests and app.js call
// them by name. They read no application state; callers pass the design.

const FRAME_STYLES = new Set(['none', 'banner-bottom', 'banner-top', 'outline']);
const FRAME_TEXT_MAX_LENGTH = 30;
// Helvetica-compatible stack, so the preview, PNG, SVG and the Helvetica-Bold
// label in PDF and EPS exports look alike.
const FRAME_FONT_FAMILY = '\'Helvetica Neue\', Helvetica, Arial, \'Liberation Sans\', Arimo, system-ui, sans-serif';

/**
 * @description Perceived brightness (0-255, Rec. 601 weights). Only the
 * fallback of isLightColor while QRTurboColor is missing.
 */
function calculateLuminance(hex) {
    const rgb = parseInt(String(hex).slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * @description True when black reads better on the color than white: the
 * higher WCAG contrast ratio (QRTurboColor.contrastRatio) wins, so bright
 * greens such as #00ff00 get black. Falls back to calculateLuminance when
 * QRTurboColor is missing or the color cannot be parsed.
 */
function isLightColor(hex) {
    const color = globalThis.QRTurboColor;
    if (color && typeof color.contrastRatio === 'function') {
        const black = color.contrastRatio(hex, '#000000');
        const white = color.contrastRatio(hex, '#ffffff');
        if (Number.isFinite(black) && Number.isFinite(white)) return black >= white;
    }
    return calculateLuminance(hex) > 150;
}

function getReadableTextColor(backgroundHex) {
    return isLightColor(backgroundHex) ? '#000000' : '#ffffff';
}

function formatPdfNumber(value) {
    return Number(value).toFixed(2).replace(/\.?0+$/, '');
}

/**
 * @description Places the QR code and its call-to-action label inside a square
 * output of the selected size. The QR code keeps its own quiet zone, so the
 * frame never touches the modules that scanners read.
 */
function getFrameLayout(size, style) {
    const outputSize = Math.max(1, Math.round(Number(size) || 1));

    if (!FRAME_STYLES.has(style) || style === 'none') {
        return {
            style: 'none',
            framed: false,
            width: outputSize,
            height: outputSize,
            qr: { x: 0, y: 0, size: outputSize }
        };
    }

    const padding = Math.round(outputSize * 0.05);
    const band = Math.round(outputSize * 0.16);
    const qrSize = outputSize - (2 * padding) - band;
    const qrX = Math.round((outputSize - qrSize) / 2);
    const qrY = style === 'banner-top' ? padding + band : padding;
    const labelHeight = padding + band;
    const labelTop = style === 'banner-top' ? 0 : qrY + qrSize;

    return {
        style,
        framed: true,
        width: outputSize,
        height: outputSize,
        radius: Math.round(outputSize * 0.06),
        innerRadius: Math.round(outputSize * 0.02),
        stroke: Math.max(1, Math.round(outputSize * 0.02)),
        qr: { x: qrX, y: qrY, size: qrSize },
        label: {
            x: outputSize / 2,
            centerY: labelTop + (labelHeight / 2),
            maxWidth: qrSize,
            fontSize: Math.max(1, Math.round(band * 0.46))
        }
    };
}

/**
 * @description The label text of a design: trimmed, capped, or the localized
 * default when the field is empty. Control characters become spaces and
 * unpaired surrogates are dropped (also after the cap), because XML cannot
 * hold them and the label goes into SVG markup.
 */
function getFrameText(design) {
    const text = String(design?.frameText || '')
        .replace(/[\u0000-\u001f\u007f-\u009f\ufffe\uffff]/g, ' ')
        .replace(/[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g, unit => (unit.length === 2 ? unit : ''))
        .trim()
        .slice(0, FRAME_TEXT_MAX_LENGTH)
        .replace(/[\ud800-\udbff]$/, '')
        .trim();
    if (text) return text;
    return typeof t === 'function' ? t('frame.defaultText') : 'SCAN ME';
}

function getFrameColors(layout, design) {
    const frameColor = design.frameColor;
    return {
        frame: frameColor,
        text: layout.style === 'outline' ? frameColor : getReadableTextColor(frameColor),
        card: design.transparentBackground ? null : design.bgColor
    };
}

function getFrameFont(fontSize) {
    return `700 ${fontSize}px ${FRAME_FONT_FAMILY}`;
}

/**
 * @description Shrinks the label font until the measured text fits the QR width.
 */
function fitFrameFontSize(text, fontSize, maxWidth, measureWidth) {
    const measured = measureWidth(text, fontSize);
    if (!measured || measured <= maxWidth) return fontSize;
    return Math.max(1, Math.floor(fontSize * (maxWidth / measured)));
}

function measureFrameText(text, fontSize) {
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return 0;
    context.font = getFrameFont(fontSize);
    return context.measureText(text).width;
}

// The label is drawn on an alphabetic baseline in both canvas and SVG, so the
// raster and vector downloads place the text identically.
function getFrameLabelBaseline(layout, fontSize) {
    return layout.label.centerY + (fontSize * 0.35);
}

function roundedRectPathData(x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    const n = formatPdfNumber;
    return `M${n(x + r)} ${n(y)}H${n(x + width - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(y + r)}`
        + `V${n(y + height - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width - r)} ${n(y + height)}`
        + `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + height - r)}`
        + `V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`;
}

function traceRoundedRect(context, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Reads a plain numeric width or height ("330" or "330px") from the attribute
// text of an SVG start tag. Percentages and other units are not used.
function readSvgLength(attributes, name) {
    const match = String(attributes).match(new RegExp(`\\s${name}="\\s*([0-9]+(?:\\.[0-9]+)?)(?:px)?\\s*"`));
    const value = match ? Number(match[1]) : NaN;
    return value > 0 ? value : null;
}

/**
 * @description Wraps the library's SVG in a framed vector document. The QR code
 * stays a nested SVG, so its modules keep their exact vector geometry. The
 * nested viewBox keeps the inner document's own coordinate system, taken from
 * its width and height, so any source size scales into the frame's QR box.
 */
function buildFramedSvg(qrSvgMarkup, layout, options) {
    const { width, height, qr, radius, innerRadius, stroke } = layout;
    const { text, fontSize, colors } = options;
    const n = formatPdfNumber;
    const nestedSvg = String(qrSvgMarkup)
        .replace(/^\s*<\?xml[^>]*\?>\s*/i, '')
        .replace(/<svg\b([^>]*)>/i, (match, attributes) => {
            const innerWidth = readSvgLength(attributes, 'width') || qr.size;
            const innerHeight = readSvgLength(attributes, 'height') || qr.size;
            const cleanAttributes = attributes.replace(/\s(?:width|height|x|y|viewBox)="[^"]*"/g, '');
            return `<svg${cleanAttributes} x="${qr.x}" y="${qr.y}" width="${qr.size}" height="${qr.size}" `
                + `viewBox="0 0 ${n(innerWidth)} ${n(innerHeight)}">`;
        });

    const parts = [
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        '<defs><clipPath id="qrturbo-frame-clip">',
        `<path d="${roundedRectPathData(qr.x, qr.y, qr.size, qr.size, innerRadius)}"/>`,
        '</clipPath></defs>'
    ];

    if (layout.style === 'outline') {
        if (colors.card) {
            parts.push(`<path fill="${colors.card}" d="${roundedRectPathData(0, 0, width, height, radius)}"/>`);
        }
        const inset = stroke / 2;
        parts.push(
            `<path fill="none" stroke="${colors.frame}" stroke-width="${stroke}" `
            + `d="${roundedRectPathData(inset, inset, width - stroke, height - stroke, radius - inset)}"/>`
        );
    } else {
        parts.push(
            `<path fill="${colors.frame}" fill-rule="evenodd" d="${roundedRectPathData(0, 0, width, height, radius)}`
            + `${roundedRectPathData(qr.x, qr.y, qr.size, qr.size, innerRadius)}"/>`
        );
    }

    parts.push(
        `<g clip-path="url(#qrturbo-frame-clip)">${nestedSvg}</g>`,
        `<text x="${n(layout.label.x)}" y="${n(getFrameLabelBaseline(layout, fontSize))}" text-anchor="middle" `
        + `data-max-width="${n(layout.label.maxWidth)}" `
        + `font-family="${escapeXml(FRAME_FONT_FAMILY)}" font-weight="700" font-size="${fontSize}" `
        + `fill="${colors.text}">${escapeXml(text)}</text>`,
        '</svg>'
    );

    return parts.join('');
}

async function renderFramedCanvas(qrPngBlob, layout, options) {
    const image = await loadImageFromDataURL(await blobToDataURL(qrPngBlob));
    const { width, height, qr, radius, innerRadius, stroke } = layout;
    const { text, fontSize, colors } = options;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (layout.style === 'outline') {
        if (colors.card) {
            context.beginPath();
            traceRoundedRect(context, 0, 0, width, height, radius);
            context.fillStyle = colors.card;
            context.fill();
        }
        const inset = stroke / 2;
        context.beginPath();
        traceRoundedRect(context, inset, inset, width - stroke, height - stroke, radius - inset);
        context.lineWidth = stroke;
        context.strokeStyle = colors.frame;
        context.stroke();
    } else {
        context.beginPath();
        traceRoundedRect(context, 0, 0, width, height, radius);
        traceRoundedRect(context, qr.x, qr.y, qr.size, qr.size, innerRadius);
        context.fillStyle = colors.frame;
        context.fill('evenodd');
    }

    context.save();
    context.beginPath();
    traceRoundedRect(context, qr.x, qr.y, qr.size, qr.size, innerRadius);
    context.clip();
    context.imageSmoothingEnabled = false;
    context.drawImage(image, qr.x, qr.y, qr.size, qr.size);
    context.restore();

    context.font = getFrameFont(fontSize);
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.fillStyle = colors.text;
    context.fillText(text, layout.label.x, getFrameLabelBaseline(layout, fontSize));

    return canvas;
}

function canvasToBlob(canvas, type = 'image/png', quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))), type, quality);
    });
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Blob reading failed'));
        reader.readAsDataURL(blob);
    });
}

function loadImageFromDataURL(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image loading failed'));
        image.src = dataUrl;
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FRAME_STYLES,
        FRAME_TEXT_MAX_LENGTH,
        FRAME_FONT_FAMILY,
        calculateLuminance,
        isLightColor,
        getReadableTextColor,
        formatPdfNumber,
        getFrameLayout,
        getFrameText,
        getFrameColors,
        getFrameFont,
        fitFrameFontSize,
        measureFrameText,
        getFrameLabelBaseline,
        roundedRectPathData,
        traceRoundedRect,
        escapeXml,
        buildFramedSvg,
        renderFramedCanvas,
        canvasToBlob,
        blobToDataURL,
        loadImageFromDataURL
    };
}
