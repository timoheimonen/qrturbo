// QRTurbo.app - Rendering engine (QRTurboEngine)
// The single adapter around the bundled QRCodeStyling library: option
// mapping, standard module orientation, render timeouts, raster canvases and
// logo preparation.
//
// Orientation: the library draws module isDark(i, j) at x = i, y = j, which is
// the transpose of a standard QR symbol. render() wraps the instance's
// _setupSvg before the first real update({data}). update() builds _qr and
// selects the mask first, then calls _setupSvg (also from _setupCanvas), so
// the wrapper swaps the isDark arguments after mask selection and before any
// drawing, in one render. The same wrapper sets the geometry from the real
// module count. When the private API is missing, selfTest() fails and the
// engine renders without the wrapper (mirrored but decodable output).
(function () {
    'use strict';

    const UNIT = 10;
    const RENDER_TIMEOUT_MS = 8000;
    const LOGO_DECODE_TIMEOUT_MS = 5000;
    const LOGO_MAX_BYTES = 10 * 1024 * 1024;
    const LOGO_MAX_SIDE = 1024;
    const LOGO_MIN_SIDE = 256;
    const LOGO_OPTIMIZE_BYTES = 1024 * 1024;
    const SVG_LOGO_MAX_BYTES = 512 * 1024;
    const LOGO_JPEG_QUALITY = 0.92;
    const LEVELS = ['L', 'M', 'Q', 'H'];

    const LOGO_MIME = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        svg: 'image/svg+xml'
    };

    let selfTestResult = null;

    /**
     * @description Races a promise against a timer. The timeout rejects with
     * an Error whose code is 'timeout'; the timer is always cleared.
     */
    function withTimeout(promise, ms, label) {
        let timer = null;
        const timeout = new Promise((resolve, reject) => {
            timer = setTimeout(() => {
                const error = new Error(`${label || 'Operation'} timed out after ${ms} ms`);
                error.code = 'timeout';
                reject(error);
            }, ms);
        });
        return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
    }

    function toError(value) {
        if (value instanceof Error) return value;
        return new Error(typeof value === 'string' ? value : 'QR rendering failed');
    }

    function isOverflow(error) {
        return /code length overflow/.test(String(error && error.message ? error.message : error));
    }

    /**
     * @description Maps a Design to QRCodeStyling options. Pure: no DOM and
     * no library access. The corners share the dots paint unless custom
     * corner colors are on, so a gradient runs across the whole code.
     */
    function buildOptions(design, bytes, o) {
        const options = {
            type: o.type === 'canvas' ? 'canvas' : 'svg',
            shape: 'square',
            width: o.width,
            height: o.width,
            margin: o.margin,
            data: String(bytes),
            qrOptions: {
                typeNumber: o.typeNumber,
                errorCorrectionLevel: o.ecl
            },
            dotsOptions: design.fill === 'gradient'
                ? {
                    type: design.dotStyle,
                    gradient: {
                        type: design.gradientType === 'radial' ? 'radial' : 'linear',
                        rotation: (Number(design.gradientAngle) || 0) * Math.PI / 180,
                        colorStops: [
                            { offset: 0, color: design.fgColor },
                            { offset: 1, color: design.fgColor2 }
                        ]
                    }
                }
                : { type: design.dotStyle, color: design.fgColor },
            cornersSquareOptions: {
                type: design.cornerSquareStyle,
                ...(design.customCorners ? { color: design.cornerOuterColor } : {})
            },
            cornersDotOptions: {
                type: design.cornerDotStyle,
                ...(design.customCorners ? { color: design.cornerInnerColor } : {})
            },
            backgroundOptions: {
                color: design.transparentBackground ? '' : design.bgColor
            }
        };

        if (design.logo && design.logo.dataUrl) {
            options.image = design.logo.dataUrl;
            options.imageOptions = {
                hideBackgroundDots: true,
                imageSize: design.logoSize,
                margin: (Number(design.logoPadding) || 0) * o.modulePx,
                crossOrigin: 'anonymous'
            };
        }

        return options;
    }

    /**
     * @description True when the library internals the orientation hook needs
     * are present: a prototype _setupSvg that update() calls with a built _qr
     * exposing isDark and getModuleCount. Probed once without drawing.
     */
    function selfTest() {
        if (selfTestResult !== null) return selfTestResult;
        selfTestResult = false;

        const Library = globalThis.QRCodeStyling;
        if (typeof Library !== 'function' || !Library.prototype) return selfTestResult;
        const proto = Library.prototype;
        if (typeof proto._setupSvg !== 'function' || typeof proto.update !== 'function') return selfTestResult;

        try {
            const probe = new Library({ type: 'svg', width: 100, height: 100, data: '' });
            let shapeOk = false;
            probe._setupSvg = function () {
                const qr = this._qr;
                shapeOk = Boolean(qr && typeof qr.isDark === 'function' && typeof qr.getModuleCount === 'function');
            };
            probe.update({ data: '1', qrOptions: { typeNumber: 0, errorCorrectionLevel: 'M' } });
            selfTestResult = shapeOk && probe._qr.getModuleCount() === 21;
        } catch (error) {
            selfTestResult = false;
        }
        return selfTestResult;
    }

    /**
     * @description Output geometry for a module count. Without a size the
     * code is drawn at UNIT per module with a quiet zone of whole modules;
     * with a size the quiet zone is rounded up to whole pixels.
     */
    function geometry(count, o) {
        const q = Number(o.quietZone) || 0;
        if (o.size) {
            const width = Math.max(1, Math.round(o.size));
            // calculateQuietZonePixels (app.js) rounds up to whole pixels.
            const margin = globalThis.calculateQuietZonePixels(width, count, q);
            return { width, margin, dot: Math.max(0, Math.floor((width - (2 * margin)) / count)) };
        }
        return { width: (count + (2 * q)) * UNIT, margin: q * UNIT, dot: UNIT };
    }

    function applyGeometry(options, g, design, type) {
        if (type !== 'canvas') {
            options.width = g.width;
            options.height = g.width;
        }
        options.margin = g.margin;
        if (options.imageOptions && options.image) {
            options.imageOptions.margin = (Number(design.logoPadding) || 0) * g.dot;
        }
    }

    function blobText(blob) {
        if (typeof blob.text === 'function') return blob.text();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error || new Error('Blob reading failed'));
            reader.readAsText(blob);
        });
    }

    function stripXmlDeclaration(markup) {
        return String(markup).replace(/^\uFEFF?\s*<\?xml[^>]*\?>\s*/i, '');
    }

    async function canvasFromBlob(blob) {
        const image = await loadImageFromDataURL(await blobToDataURL(blob));
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas;
    }

    /**
     * @description One library render. Returns the drawn result, or throws
     * the library's overflow error when typeNumber is too small.
     */
    async function draw(design, bytes, o, typeNumber) {
        const Library = globalThis.QRCodeStyling;
        if (typeof Library !== 'function') throw new Error('The QR code library is not available');

        const type = o.type === 'canvas' ? 'canvas' : 'svg';
        const hooked = selfTest();
        const assumedCount = typeNumber > 0 ? 17 + (4 * typeNumber) : 21;
        const assumed = geometry(assumedCount, o);
        const options = buildOptions(design, '', {
            type,
            width: assumed.width,
            margin: assumed.margin,
            typeNumber,
            ecl: o.ecl,
            modulePx: assumed.dot
        });

        // data is '' here, so the constructor builds no _qr and draws nothing.
        const instance = new Library(options);
        let drawn = null;

        if (hooked) {
            const proto = Library.prototype;
            instance._setupSvg = function () {
                const qr = this._qr;
                if (qr && !qr.__qrturboStandard) {
                    const original = qr.isDark;
                    qr.__qrturboIsDark = original;
                    qr.isDark = (row, col) => original(col, row);
                    qr.__qrturboStandard = true;
                }
                if (qr) {
                    drawn = geometry(qr.getModuleCount(), o);
                    applyGeometry(this._options, drawn, design, type);
                }
                return proto._setupSvg.call(this);
            };
        }

        try {
            instance.update({ data: String(bytes) });
        } catch (error) {
            throw toError(error);
        }

        if (!instance._qr || typeof instance._qr.getModuleCount !== 'function') {
            throw new Error('The QR code library did not build a code');
        }
        const moduleCount = instance._qr.getModuleCount();

        if (!drawn) {
            // Without the hook, the geometry was only a guess from typeNumber.
            drawn = geometry(moduleCount, o);
            if (moduleCount !== assumedCount) {
                const corrected = { margin: drawn.margin };
                if (type !== 'canvas') {
                    corrected.width = drawn.width;
                    corrected.height = drawn.width;
                }
                if (options.image) {
                    corrected.imageOptions = { margin: (Number(design.logoPadding) || 0) * drawn.dot };
                }
                instance.update(corrected);
            }
        }

        const qr = instance._qr;
        const isDark = typeof qr.__qrturboIsDark === 'function' ? qr.__qrturboIsDark : qr.isDark;
        const result = {
            instance,
            moduleCount,
            version: (moduleCount - 17) / 4,
            width: drawn.width,
            margin: drawn.margin,
            dot: drawn.dot,
            standardized: qr.__qrturboStandard === true,
            matrix: (row, col) => Boolean(isDark(row, col))
        };

        if (type === 'svg') {
            const blob = await instance.getRawData('svg');
            if (!blob) throw new Error('The QR code library returned no SVG');
            result.svgMarkup = stripXmlDeclaration(await blobText(blob));
        } else if (instance._canvas && instance._canvasDrawingPromise) {
            await instance._canvasDrawingPromise;
            result.canvas = instance._canvas;
        } else {
            const blob = await instance.getRawData('png');
            if (!blob) throw new Error('The QR code library returned no image');
            result.canvas = await canvasFromBlob(blob);
        }

        return result;
    }

    /**
     * @description Renders a code with the predicted version. When the
     * prediction is too small the library throws 'code length overflow'; the
     * engine then retries once with the automatic version and takes the
     * geometry from the module count it really used.
     */
    async function renderCode(design, bytes, o) {
        const typeNumber = Math.min(40, Math.max(0, Math.floor(Number(o.typeNumber) || 0)));
        try {
            return await draw(design, bytes, o, typeNumber);
        } catch (error) {
            if (!(typeNumber > 0 && isOverflow(error))) throw toError(error);
        }
        console.warn('QRTurboEngine: the predicted version overflowed, retrying with the automatic version');
        try {
            return await draw(design, bytes, o, 0);
        } catch (error) {
            throw toError(error);
        }
    }

    function render(design, bytes, o = {}) {
        if (!LEVELS.includes(o.ecl)) {
            return Promise.reject(new RangeError(`Unknown error correction level: ${o.ecl}`));
        }
        const timeoutMs = Number(o.timeoutMs) > 0 ? Number(o.timeoutMs) : RENDER_TIMEOUT_MS;
        return withTimeout(renderCode(design, bytes, o), timeoutMs, 'QR render');
    }

    /**
     * @description A canvas of the code at an exact pixel size, for PNG, JPG
     * and WebP exports. Frames are drawn by renderFramedCanvas around a code
     * rendered at the frame's QR box. A FrameSpec laid out for another size
     * is laid out again at this size.
     */
    async function rasterCanvas(design, bytes, o) {
        const size = Math.max(1, Math.round(Number(o.size) || 0));
        const base = { quietZone: o.quietZone, typeNumber: o.typeNumber, ecl: o.ecl, timeoutMs: o.timeoutMs };
        const frame = o.frame;

        if (!frame || !frame.layout || !frame.layout.framed) {
            const plain = await render(design, bytes, { ...base, type: 'canvas', size });
            return plain.canvas;
        }

        let layout = frame.layout;
        let fontSize = frame.fontSize;
        if (layout.width !== size) {
            layout = getFrameLayout(size, layout.style);
            fontSize = fitFrameFontSize(frame.text, layout.label.fontSize, layout.label.maxWidth, measureFrameText);
        }

        const inner = await render(design, bytes, { ...base, type: 'canvas', size: layout.qr.size });
        const blob = await canvasToBlob(inner.canvas);
        inner.canvas.width = 0;
        inner.canvas.height = 0;
        return renderFramedCanvas(blob, layout, { text: frame.text, fontSize, colors: frame.colors });
    }

    // --- Logo preparation (SPEC E.8) ---

    function logoError(key) {
        const error = new Error(key);
        error.code = key;
        return error;
    }

    /**
     * @description Loads and decodes an image URL under the logo timeout.
     * decode() is preferred; when it is missing, or rejects although the
     * image loaded (some browsers do this for SVG), the load event decides.
     */
    function decodeImage(url) {
        const image = new Image();
        const loaded = new Promise((resolve, reject) => {
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Image decoding failed'));
        });
        image.src = url;
        const decoded = typeof image.decode === 'function'
            ? image.decode().then(() => image, () => loaded)
            : loaded;
        return withTimeout(decoded, LOGO_DECODE_TIMEOUT_MS, 'Logo decoding');
    }

    /**
     * @description The first <svg ...> start tag, found in linear time: the
     * first '<svg' that ends a word, up to the next '>'. A single regex over
     * the whole file is quadratic when it holds many '<svg' and no '>'.
     * Returns { tag, index } or null.
     */
    function findSvgRoot(text) {
        const start = /<svg\b/i.exec(text);
        if (!start) return null;
        const end = text.indexOf('>', start.index);
        if (end === -1) return null;
        return { tag: text.slice(start.index, end + 1), index: start.index };
    }

    /**
     * @description Removes what editors store about the author and their
     * files from an SVG logo: comments, <metadata>, Sodipodi's namedview and
     * inkscape:/sodipodi: attributes (they can hold names and file paths).
     * The logo is embedded verbatim in SVG exports, so this keeps those
     * details out of files that people share.
     */
    function stripSvgMetadata(text) {
        return text
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<metadata\b[^>]*\/>|<metadata\b[^>]*>[\s\S]*?<\/metadata\s*>/gi, '')
            .replace(/<sodipodi:namedview\b[^>]*\/>|<sodipodi:namedview\b[^>]*>[\s\S]*?<\/sodipodi:namedview\s*>/gi, '')
            .replace(/\s(?:inkscape|sodipodi):[\w.-]+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    }

    /**
     * @description SVG logos need an intrinsic size: without an absolute
     * width and height, browsers report 300 x 150 or 0 x 0, and the library
     * sizes the logo from that. When the root has a viewBox but no absolute
     * size, width and height are added from the viewBox. Editor metadata is
     * removed first. Returns the bytes to use and the size, or null when the
     * markup has no <svg> root.
     */
    function svgWithIntrinsicSize(bytes) {
        const text = stripSvgMetadata(new TextDecoder('utf-8', { fatal: false }).decode(bytes));
        const root = findSvgRoot(text);
        if (!root) return null;

        const tag = root.tag;
        const absolute = name => new RegExp(`\\s${name}\\s*=\\s*["']\\s*\\d+(?:\\.\\d+)?(?:px)?\\s*["']`, 'i').test(tag);
        const stripped = new TextEncoder().encode(text);
        if (absolute('width') && absolute('height')) return { bytes: stripped, width: 0, height: 0 };

        const viewBox = tag.match(/\sviewBox\s*=\s*["']\s*[-+\d.eE]+[\s,]+[-+\d.eE]+[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)\s*["']/i);
        const width = viewBox ? Number(viewBox[1]) : 0;
        const height = viewBox ? Number(viewBox[2]) : 0;
        if (!(width > 0 && height > 0)) return { bytes: stripped, width: 0, height: 0 };

        const sizedTag = tag
            .replace(/\s(?:width|height)\s*=\s*(["'])[^"']*\1/gi, '')
            .replace(/^<svg\b/i, `<svg width="${width}" height="${height}"`);
        const sized = text.slice(0, root.index) + sizedTag + text.slice(root.index + tag.length);
        return { bytes: new TextEncoder().encode(sized), width, height };
    }

    /**
     * @description Draws the image as a PNG (or a JPEG for JPEG sources)
     * whose long side is `side` px, keeping the aspect ratio and the alpha
     * channel. The browser applies the EXIF orientation while decoding, and
     * the new file carries no metadata.
     */
    async function redrawImage(image, sourceWidth, sourceHeight, side, mime) {
        const scale = side / Math.max(sourceWidth, sourceHeight);
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, mime, mime === 'image/jpeg' ? LOGO_JPEG_QUALITY : undefined);
        canvas.width = 0;
        canvas.height = 0;
        return { blob, width, height };
    }

    /**
     * @description Validates and prepares an uploaded logo: rejects HEIC,
     * TIFF, unknown types and files over 10 MB and decodes it under a 5 s
     * timeout. Every raster is redrawn, which drops EXIF (such as GPS
     * positions) and text chunks: JPEGs as JPEG, other rasters as PNG, at most
     * 1024 px and 1 MB. SVGs up to 512 KB stay vector without editor
     * metadata; larger ones become a 1024 px PNG. Rejects with
     * Error('logo.readFailed') or Error('logo.tooLarge').
     */
    async function prepareLogo(file) {
        if (!file || typeof file.arrayBuffer !== 'function') throw logoError('logo.readFailed');
        if (file.size > LOGO_MAX_BYTES) throw logoError('logo.tooLarge');

        let bytes;
        try {
            bytes = new Uint8Array(await file.arrayBuffer());
        } catch (error) {
            throw logoError('logo.readFailed');
        }
        if (bytes.length > LOGO_MAX_BYTES) throw logoError('logo.tooLarge');

        const kind = globalThis.QRTurboBytes.sniffImage(bytes);
        const sourceMime = LOGO_MIME[kind];
        if (!sourceMime) throw logoError('logo.readFailed');

        let svgSize = null;
        if (kind === 'svg') {
            svgSize = svgWithIntrinsicSize(bytes);
            if (!svgSize) throw logoError('logo.readFailed');
            bytes = svgSize.bytes;
        }

        const name = String(file.name || '');
        const sourceBlob = new Blob([bytes], { type: sourceMime });
        const objectUrl = URL.createObjectURL(sourceBlob);

        try {
            let image;
            try {
                image = await decodeImage(objectUrl);
            } catch (error) {
                throw logoError('logo.readFailed');
            }

            const width = image.naturalWidth || image.width || (svgSize ? svgSize.width : 0);
            const height = image.naturalHeight || image.height || (svgSize ? svgSize.height : 0);
            if (!width || !height) throw logoError('logo.readFailed');

            const longSide = Math.max(width, height);
            if (kind === 'svg' && bytes.length <= SVG_LOGO_MAX_BYTES) {
                return {
                    dataUrl: await blobToDataURL(sourceBlob),
                    mime: sourceMime,
                    name,
                    width,
                    height,
                    bytes: bytes.length,
                    optimized: false
                };
            }

            // A raster over 1 MB is embedded in every render and export, so it
            // is made smaller too (SPEC B.11), even when it is 1024 px or less.
            const heavy = kind !== 'svg' && bytes.length > LOGO_OPTIMIZE_BYTES;
            const mime = kind === 'jpeg' ? 'image/jpeg' : 'image/png';

            // SVGs are rasterized at 1024 px, rasters at their own size up to
            // 1024 px. A file still over 1 MB is redrawn smaller, down to 256 px.
            let side = kind === 'svg' ? LOGO_MAX_SIDE : Math.min(longSide, LOGO_MAX_SIDE);
            let out;
            try {
                out = await redrawImage(image, width, height, side, mime);
                while (out.blob.size > LOGO_OPTIMIZE_BYTES && side > LOGO_MIN_SIDE) {
                    side = Math.max(LOGO_MIN_SIDE, Math.round(side * 0.75));
                    out = await redrawImage(image, width, height, side, mime);
                }
            } catch (error) {
                throw logoError('logo.readFailed');
            }
            return {
                dataUrl: await blobToDataURL(out.blob),
                mime,
                name,
                width: out.width,
                height: out.height,
                bytes: out.blob.size,
                optimized: heavy || side !== longSide
            };
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }

    const api = {
        // Library units per module in the preview SVG.
        UNIT,
        RENDER_TIMEOUT_MS,
        buildOptions,
        render,
        rasterCanvas,
        prepareLogo,
        withTimeout,
        selfTest
    };

    globalThis.QRTurboEngine = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
