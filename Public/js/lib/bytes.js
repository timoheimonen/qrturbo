// QRTurbo.app - Byte helpers (QRTurboBytes)
// Pure: UTF-8 and Latin-1 encoding, CRC-32, deflate, image sniffing and the
// PNG pHYs/sRGB and JPEG JFIF density patches used by print exports.
(function () {
    'use strict';

    const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    // sRGB chunk with rendering intent 0 (perceptual), CRC included.
    const SRGB_CHUNK = [0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42, 0x00, 0xae, 0xce, 0x1c, 0xe9];
    // Text chunks are dropped: exports never carry metadata text.
    const PNG_TEXT_CHUNKS = new Set(['tEXt', 'iTXt', 'zTXt']);
    const METRES_PER_INCH = 0.0254;
    const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let crcTable = null;
    let base64Lookup = null;

    // Accepts bytes from any realm (worker, iframe, Node vm): instanceof
    // alone misses those, so ArrayBuffer is also recognized by its tag.
    function toBytes(input) {
        if (input instanceof Uint8Array) return input;
        if (typeof input === 'string') return utf8(input);
        if (input instanceof ArrayBuffer || Object.prototype.toString.call(input) === '[object ArrayBuffer]') {
            return new Uint8Array(input);
        }
        if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
        throw new TypeError('Expected bytes');
    }

    /**
     * @description UTF-8 bytes of a string. Lone surrogates become U+FFFD,
     * the same as TextEncoder.
     */
    function utf8(text) {
        const value = String(text);
        if (typeof TextEncoder === 'function') return new TextEncoder().encode(value);

        const out = [];
        for (let i = 0; i < value.length; i++) {
            let code = value.charCodeAt(i);
            if (code >= 0xd800 && code <= 0xdbff && i + 1 < value.length) {
                const next = value.charCodeAt(i + 1);
                if (next >= 0xdc00 && next <= 0xdfff) {
                    code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
                    i++;
                }
            }
            if (code >= 0xd800 && code <= 0xdfff) code = 0xfffd;
            if (code < 0x80) {
                out.push(code);
            } else if (code < 0x800) {
                out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
            } else if (code < 0x10000) {
                out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
            } else {
                out.push(
                    0xf0 | (code >> 18),
                    0x80 | ((code >> 12) & 0x3f),
                    0x80 | ((code >> 6) & 0x3f),
                    0x80 | (code & 0x3f)
                );
            }
        }
        return Uint8Array.from(out);
    }

    /**
     * @description One character per UTF-8 byte, which is what the bundled
     * QR library expects. Same output as encodeTextForQRCode in app.js.
     */
    function byteString(text) {
        const bytes = utf8(text);
        let result = '';
        for (let offset = 0; offset < bytes.length; offset += 0x2000) {
            result += String.fromCharCode.apply(null, bytes.subarray(offset, offset + 0x2000));
        }
        return result;
    }

    function concat(parts) {
        const list = Array.from(parts || [], toBytes);
        const total = list.reduce((sum, part) => sum + part.length, 0);
        const out = new Uint8Array(total);
        let offset = 0;
        list.forEach(part => {
            out.set(part, offset);
            offset += part.length;
        });
        return out;
    }

    /**
     * @description CRC-32 (reflected 0xEDB88320, as used by PNG and ZIP).
     * Accepts bytes or a string, which is UTF-8 encoded first.
     */
    function crc32(input) {
        const bytes = toBytes(input);
        if (!crcTable) {
            crcTable = new Uint32Array(256);
            for (let n = 0; n < 256; n++) {
                let c = n;
                for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
                crcTable[n] = c >>> 0;
            }
        }
        let crc = 0xffffffff;
        for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
        return (crc ^ 0xffffffff) >>> 0;
    }

    function latin1(text) {
        const value = String(text);
        const out = new Uint8Array(value.length);
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            if (code > 0xff) throw new RangeError(`Character U+${code.toString(16).toUpperCase().padStart(4, '0')} is not Latin-1`);
            out[i] = code;
        }
        return out;
    }

    /**
     * @description zlib-wrapped deflate (the PDF FlateDecode format) through
     * CompressionStream. Resolves null when the browser has no
     * CompressionStream or compression fails, so writers store raw data.
     */
    async function deflate(bytes) {
        if (typeof CompressionStream !== 'function' || typeof Response !== 'function' || typeof Blob !== 'function') {
            return null;
        }
        try {
            const stream = new Blob([toBytes(bytes)]).stream().pipeThrough(new CompressionStream('deflate'));
            return new Uint8Array(await new Response(stream).arrayBuffer());
        } catch {
            return null;
        }
    }

    function base64ToBytes(text) {
        const clean = String(text).replace(/[\s]/g, '').replace(/=+$/, '');
        if (/[^A-Za-z0-9+/\-_]/.test(clean)) throw new TypeError('Invalid base64 data');
        if (!base64Lookup) {
            base64Lookup = new Uint8Array(128);
            for (let i = 0; i < BASE64_ALPHABET.length; i++) base64Lookup[BASE64_ALPHABET.charCodeAt(i)] = i;
            base64Lookup[45] = 62; // '-' (base64url)
            base64Lookup[95] = 63; // '_' (base64url)
        }
        const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
        let buffer = 0;
        let bits = 0;
        let index = 0;
        for (let i = 0; i < clean.length; i++) {
            buffer = (buffer << 6) | base64Lookup[clean.charCodeAt(i)];
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                out[index++] = (buffer >> bits) & 0xff;
            }
        }
        return index === out.length ? out : out.subarray(0, index);
    }

    function percentToBytes(text) {
        const value = String(text);
        const out = [];
        for (let i = 0; i < value.length; i++) {
            const character = value[i];
            if (character === '%' && /^[0-9a-f]{2}$/i.test(value.slice(i + 1, i + 3))) {
                out.push(parseInt(value.slice(i + 1, i + 3), 16));
                i += 2;
            } else {
                const code = value.codePointAt(i);
                utf8(String.fromCodePoint(code)).forEach(byte => out.push(byte));
                if (code > 0xffff) i++;
            }
        }
        return Uint8Array.from(out);
    }

    /**
     * @description Decodes a data: URL (base64 or percent-encoded) into its
     * lowercase MIME type and bytes. Throws TypeError for anything else.
     */
    function dataUrlToBytes(url) {
        const match = /^data:([^,]*),([\s\S]*)$/i.exec(String(url).trim());
        if (!match) throw new TypeError('Not a data URL');
        const params = match[1].split(';').map(part => part.trim());
        const isBase64 = params.length > 1 && params[params.length - 1].toLowerCase() === 'base64';
        const mime = (params[0] || 'text/plain').toLowerCase();
        const bytes = isBase64 ? base64ToBytes(match[2]) : percentToBytes(match[2]);
        return { mime, bytes };
    }

    function startsWith(bytes, signature, offset = 0) {
        if (bytes.length < offset + signature.length) return false;
        for (let i = 0; i < signature.length; i++) {
            if (bytes[offset + i] !== signature[i]) return false;
        }
        return true;
    }

    function asciiAt(bytes, offset, length) {
        let text = '';
        for (let i = offset; i < offset + length && i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
        return text;
    }

    function looksLikeSvg(bytes) {
        let start = 0;
        if (startsWith(bytes, [0xef, 0xbb, 0xbf])) start = 3;
        const head = asciiAt(bytes, start, 4096).replace(/^\s+/, '');
        if (!head.startsWith('<')) return false;
        // Skip the XML declaration, comments, processing instructions and the
        // doctype, then expect the svg root element.
        const rest = head.replace(/^(?:<\?[\s\S]*?\?>\s*|<!--[\s\S]*?-->\s*|<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>\s*)*/i, '');
        return /^<(?:[A-Za-z_][\w.-]*:)?svg[\s>/]/i.test(rest);
    }

    /**
     * @description Identifies an image by its magic bytes. HEIC and TIFF are
     * reported so callers can reject them by name; anything unknown is null.
     */
    function sniffImage(input) {
        const bytes = toBytes(input);
        if (startsWith(bytes, PNG_SIGNATURE)) return 'png';
        if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
        if (asciiAt(bytes, 0, 4) === 'RIFF' && asciiAt(bytes, 8, 4) === 'WEBP') return 'webp';
        if (asciiAt(bytes, 0, 6) === 'GIF87a' || asciiAt(bytes, 0, 6) === 'GIF89a') return 'gif';
        if (startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) || startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])) return 'tiff';
        if (asciiAt(bytes, 4, 4) === 'ftyp') {
            const brand = asciiAt(bytes, 8, 4);
            if (/^(?:heic|heix|hevc|hevx|heim|heis|hevm|hevs|mif1|msf1)$/.test(brand)) return 'heic';
            return null;
        }
        if (looksLikeSvg(bytes)) return 'svg';
        return null;
    }

    function readU32(bytes, offset) {
        return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
    }

    function writeU32(bytes, offset, value) {
        bytes[offset] = (value >>> 24) & 0xff;
        bytes[offset + 1] = (value >>> 16) & 0xff;
        bytes[offset + 2] = (value >>> 8) & 0xff;
        bytes[offset + 3] = value & 0xff;
    }

    /**
     * @description Splits a PNG into its chunks: { type, start, end } with
     * start/end covering length, type, data and CRC. Throws on a bad file.
     */
    function pngChunks(png) {
        if (!startsWith(png, PNG_SIGNATURE)) throw new TypeError('Not a PNG file');
        const chunks = [];
        let offset = PNG_SIGNATURE.length;
        while (offset + 12 <= png.length) {
            const length = readU32(png, offset);
            const end = offset + 12 + length;
            if (end > png.length) throw new TypeError('Truncated PNG chunk');
            const type = asciiAt(png, offset + 4, 4);
            chunks.push({ type, start: offset, end, dataStart: offset + 8, length });
            offset = end;
            if (type === 'IEND') break;
        }
        if (!chunks.length || chunks[0].type !== 'IHDR') throw new TypeError('PNG must start with IHDR');
        if (!chunks.some(chunk => chunk.type === 'IDAT')) throw new TypeError('PNG has no image data');
        return chunks;
    }

    function physChunk(dpi) {
        const ppm = Math.max(1, Math.round(Number(dpi) / METRES_PER_INCH));
        const chunk = new Uint8Array(21);
        writeU32(chunk, 0, 9);
        chunk.set([0x70, 0x48, 0x59, 0x73], 4);
        writeU32(chunk, 8, ppm);
        writeU32(chunk, 12, ppm);
        chunk[16] = 1;
        writeU32(chunk, 17, crc32(chunk.subarray(4, 17)));
        return chunk;
    }

    /**
     * @description Adds print metadata to a PNG. IHDR stays first. Any pHYs
     * and text chunks are removed. sRGB is inserted before PLTE/IDAT unless
     * sRGB or iCCP is already present; with a dpi, a pHYs chunk (pixels per
     * metre, unit 1) goes right before the first IDAT.
     */
    function pngWithMeta(input, opts = {}) {
        const png = toBytes(input);
        const chunks = pngChunks(png);
        const dpi = Number(opts.dpi);
        const addPhys = Number.isFinite(dpi) && dpi > 0;
        const hasColorProfile = chunks.some(chunk => chunk.type === 'sRGB' || chunk.type === 'iCCP');
        const addSrgb = Boolean(opts.srgb) && !hasColorProfile;
        const parts = [png.subarray(0, PNG_SIGNATURE.length)];
        let srgbDone = !addSrgb;
        let physDone = !addPhys;

        chunks.forEach(chunk => {
            if (!srgbDone && (chunk.type === 'PLTE' || chunk.type === 'IDAT')) {
                parts.push(Uint8Array.from(SRGB_CHUNK));
                srgbDone = true;
            }
            if (!physDone && chunk.type === 'IDAT') {
                parts.push(physChunk(dpi));
                physDone = true;
            }
            if (chunk.type === 'pHYs' || PNG_TEXT_CHUNKS.has(chunk.type)) return;
            parts.push(png.subarray(chunk.start, chunk.end));
        });

        return concat(parts);
    }

    function readPngDpi(input) {
        try {
            const png = toBytes(input);
            const phys = pngChunks(png).find(chunk => chunk.type === 'pHYs' && chunk.length === 9);
            if (!phys || png[phys.dataStart + 8] !== 1) return null;
            const ppm = readU32(png, phys.dataStart);
            return ppm ? Math.round(ppm * METRES_PER_INCH) : null;
        } catch {
            return null;
        }
    }

    function hasJfifHeader(jpeg) {
        return jpeg.length >= 18
            && jpeg[0] === 0xff && jpeg[1] === 0xd8
            && jpeg[2] === 0xff && jpeg[3] === 0xe0
            && asciiAt(jpeg, 6, 5) === 'JFIF\0';
    }

    /**
     * @description Sets the JFIF density of a JPEG to dpi (units 1). Patches
     * an existing JFIF APP0 segment, or inserts one right after SOI.
     */
    function jpegWithDpi(input, dpi) {
        const jpeg = toBytes(input);
        if (!(jpeg.length >= 4 && jpeg[0] === 0xff && jpeg[1] === 0xd8)) throw new TypeError('Not a JPEG file');
        const density = Math.min(0xffff, Math.max(1, Math.round(Number(dpi) || 72)));
        const hi = density >> 8;
        const lo = density & 0xff;

        if (hasJfifHeader(jpeg)) {
            const out = new Uint8Array(jpeg);
            out[13] = 1;
            out[14] = hi;
            out[15] = lo;
            out[16] = hi;
            out[17] = lo;
            return out;
        }

        const app0 = Uint8Array.from([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x02, 0x01, hi, lo, hi, lo, 0x00, 0x00]);
        return concat([jpeg.subarray(0, 2), app0, jpeg.subarray(2)]);
    }

    function readJpegDpi(input) {
        try {
            const jpeg = toBytes(input);
            if (!hasJfifHeader(jpeg)) return null;
            const density = (jpeg[14] << 8) | jpeg[15];
            if (!density) return null;
            if (jpeg[13] === 1) return density;
            if (jpeg[13] === 2) return Math.round(density * 2.54);
            return null;
        } catch {
            return null;
        }
    }

    const api = {
        utf8,
        byteString,
        concat,
        crc32,
        latin1,
        deflate,
        dataUrlToBytes,
        sniffImage,
        pngWithMeta,
        readPngDpi,
        jpegWithDpi,
        readJpegDpi
    };

    globalThis.QRTurboBytes = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
