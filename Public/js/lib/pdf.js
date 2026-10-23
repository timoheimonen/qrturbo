// QRTurbo.app - Vector PDF writer (QRTurboPdf)
// Pure, loaded lazily on the first PDF export: writes a Drawing as a PDF 1.4
// page in RGB, CMYK or K-only colors. Paths stay vectors, gradients become
// axial or radial shadings, Latin-1 labels stay Helvetica-Bold text, other
// labels arrive as 1-bit stencil masks, and logos become images with a soft
// mask. Nothing from the QR payload is ever written into the file.
(function () {
    'use strict';

    const PAGE_SIZES = Object.freeze({ a4: [595.276, 841.89], letter: [612, 792] });
    const DEFAULT_MARGIN_PT = 28.35;
    const FIT_EPSILON = 1e-6;

    /**
     * @description The shared writer helpers from QRTurboGeometry. The lazy
     * modules load in any order, so they are looked up on each write.
     */
    function writerKit() {
        const geometry = globalThis.QRTurboGeometry;
        if (!geometry || typeof geometry.writerKit !== 'function') {
            throw new Error('QRTurboPdf: QRTurboGeometry is not loaded');
        }
        return geometry.writerKit('QRTurboPdf');
    }

    function colorOperator(kit, rgb, mode, stroke) {
        const values = kit.colorComponents(rgb, mode).map(kit.num).join(' ');
        if (mode === 'rgb') return `${values} ${stroke ? 'RG' : 'rg'}`;
        return `${values} ${stroke ? 'K' : 'k'}`;
    }

    function asciiBytes(text) {
        const bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
        return bytes;
    }

    function concatBytes(parts, total) {
        const out = new Uint8Array(total);
        let offset = 0;
        for (const part of parts) {
            out.set(part, offset);
            offset += part.length;
        }
        return out;
    }

    function pdfDate(date) {
        const d = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
        const p2 = value => String(value).padStart(2, '0');
        return `D:${String(d.getUTCFullYear()).padStart(4, '0')}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}`
            + `${p2(d.getUTCHours())}${p2(d.getUTCMinutes())}${p2(d.getUTCSeconds())}Z`;
    }

    /**
     * @description Walks the Drawing in painter's order and returns the
     * content stream lines plus the resources it uses.
     */
    function buildContent(kit, drawing, mode, transform) {
        const { num, factor, solidColor, normalizeStops, pathOperators, hasDrawableSegments, escapeString } = kit;
        const helvetica = globalThis.QRTurboHelvetica;
        // The scale keeps 8 significant digits, so the artwork spans the
        // MediaBox exactly; the offsets are already in points.
        const lines = ['q', `${factor(transform.s)} 0 0 ${factor(-transform.s)} ${num(transform.tx)} ${num(transform.ty)} cm`];
        const resources = { font: false, shadings: [], shadingKeys: new Map(), images: [], masks: [] };
        let fill = null;

        function setFill(rgb) {
            const op = colorOperator(kit, rgb, mode, false);
            if (op !== fill) {
                lines.push(op);
                fill = op;
            }
        }

        function shadingName(paint) {
            const stops = normalizeStops(paint.stops);
            const coords = paint.type === 'linear'
                ? [paint.x1, paint.y1, paint.x2, paint.y2]
                : [paint.cx, paint.cy, 0, paint.cx, paint.cy, paint.r];
            const key = JSON.stringify([paint.type, coords.map(num), stops.map(stop => [num(stop.offset), stop.color.map(num)])]);
            if (!resources.shadingKeys.has(key)) {
                resources.shadings.push({ type: paint.type, coords, stops });
                resources.shadingKeys.set(key, `Sh${resources.shadings.length}`);
            }
            return resources.shadingKeys.get(key);
        }

        function emitFill(item) {
            if (!hasDrawableSegments(item.d)) return;
            const paint = item.paint;
            const evenOdd = item.fillRule === 'evenodd';
            if (kit.isGradient(paint)) {
                const name = shadingName(paint);
                lines.push('q', ...pathOperators(item.d), evenOdd ? 'W* n' : 'W n', `/${name} sh`, 'Q');
                return;
            }
            setFill(solidColor(paint));
            lines.push(...pathOperators(item.d), evenOdd ? 'f*' : 'f');
        }

        function emitStroke(item) {
            if (!hasDrawableSegments(item.d)) return;
            const width = Number(item.lineWidth);
            if (!(width > 0)) return;
            lines.push(`${num(width)} w`, colorOperator(kit, solidColor(item.paint), mode, true), ...pathOperators(item.d), 'S');
        }

        function emitText(item) {
            const text = String(item.text == null ? '' : item.text);
            if (!text) return;
            if (!helvetica || typeof helvetica.canEncode !== 'function') {
                throw new Error('QRTurboPdf: QRTurboHelvetica is not loaded');
            }
            if (!helvetica.canEncode(text)) {
                throw new RangeError('QRTurboPdf: text outside WinAnsi must be passed as a mask');
            }
            let size = Number(item.fontSize);
            if (!(size > 0)) return;
            let width = helvetica.measure(text, size);
            const maxWidth = Number(item.maxWidth);
            if (maxWidth > 0 && width > maxWidth) {
                size = size * maxWidth / width;
                width = helvetica.measure(text, size);
            }
            let x = Number(item.x);
            if (item.anchor === 'end') x -= width;
            else if (item.anchor !== 'start') x -= width / 2;
            resources.font = true;
            setFill(solidColor(item.paint));
            lines.push(`BT /F1 ${num(size)} Tf 1 0 0 -1 ${num(x)} ${num(item.y)} Tm (${escapeString(helvetica.encode(text))}) Tj ET`);
        }

        function placement(item) {
            return `${num(item.width)} 0 0 ${num(-item.height)} ${num(item.x)} ${num(Number(item.y) + Number(item.height))} cm`;
        }

        function emitImage(item) {
            const pixels = kit.checkPixels(item.pixels);
            if (!pixels || !(item.width > 0) || !(item.height > 0)) return;
            resources.images.push(pixels);
            lines.push('q', placement(item), `/Im${resources.images.length} Do`, 'Q');
        }

        function emitMask(item) {
            if (!(item.width > 0) || !(item.height > 0)) return;
            resources.masks.push({ cols: item.cols, rows: item.rows, bits: kit.packMask(item) });
            setFill(solidColor(item.paint));
            lines.push('q', placement(item), `/Mk${resources.masks.length} Do`, 'Q');
        }

        function emitItems(items) {
            if (!Array.isArray(items)) throw new TypeError('QRTurboPdf: items must be a list');
            for (const item of items) {
                if (!item) continue;
                switch (item.kind) {
                    case 'path': emitFill(item); break;
                    case 'stroke': emitStroke(item); break;
                    case 'text': emitText(item); break;
                    case 'image': emitImage(item); break;
                    case 'mask': emitMask(item); break;
                    case 'group': emitGroup(item); break;
                    default: throw new TypeError('QRTurboPdf: unknown drawing item');
                }
            }
        }

        function emitGroup(item) {
            if (!item.clip) {
                emitItems(item.items);
                return;
            }
            if (!hasDrawableSegments(item.clip.d)) return;
            const savedFill = fill;
            lines.push('q', ...pathOperators(item.clip.d), item.clip.fillRule === 'evenodd' ? 'W* n' : 'W n');
            emitItems(item.items);
            lines.push('Q');
            fill = savedFill;
        }

        emitItems(drawing.items);
        lines.push('Q');
        return { content: lines.join('\n') + '\n', resources };
    }

    function shadingColorSpace(mode) {
        return mode === 'rgb' ? '/DeviceRGB' : '/DeviceCMYK';
    }

    function functionDict(kit, stops, mode) {
        const { num } = kit;
        const components = stops.map(stop => `[${kit.colorComponents(stop.color, mode).map(num).join(' ')}]`);
        const pair = (a, b) => `<< /FunctionType 2 /Domain [0 1] /C0 ${a} /C1 ${b} /N 1 >>`;
        if (stops.length === 2 && stops[0].offset === 0 && stops[1].offset === 1) {
            return pair(components[0], components[1]);
        }
        const parts = [];
        for (let i = 0; i < stops.length - 1; i++) parts.push(pair(components[i], components[i + 1]));
        const bounds = stops.slice(1, -1).map(stop => num(stop.offset));
        const encode = parts.map(() => '0 1').join(' ');
        return `<< /FunctionType 3 /Domain [0 1] /Functions [${parts.join(' ')}] /Bounds [${bounds.join(' ')}] /Encode [${encode}] >>`;
    }

    function pageGeometry(drawing, o) {
        const widthPt = Number(o.widthPt);
        if (!(widthPt > 0) || !Number.isFinite(widthPt)) throw new RangeError('QRTurboPdf: widthPt must be positive');
        const dw = Number(drawing.width);
        const dh = Number(drawing.height);
        if (!(dw > 0) || !(dh > 0)) throw new RangeError('QRTurboPdf: the drawing has no size');
        const s0 = widthPt / dw;
        const artW = widthPt;
        const artH = dh * s0;
        const size = PAGE_SIZES[o.page];
        if (!size) {
            return { pageW: artW, pageH: artH, s: s0, tx: 0, ty: artH, scaledToFit: false };
        }
        const [pageW, pageH] = size;
        const margin = Number.isFinite(Number(o.marginPt)) && Number(o.marginPt) >= 0 ? Number(o.marginPt) : DEFAULT_MARGIN_PT;
        const availW = pageW - (2 * margin);
        const availH = pageH - (2 * margin);
        let fit = 1;
        let scaledToFit = false;
        if (artW > availW + FIT_EPSILON || artH > availH + FIT_EPSILON) {
            fit = Math.min(availW / artW, availH / artH);
            scaledToFit = true;
        }
        if (!(fit > 0)) throw new RangeError('QRTurboPdf: the page margin leaves no room');
        const w = artW * fit;
        const h = artH * fit;
        const bottom = (pageH - h) / 2;
        return { pageW, pageH, s: s0 * fit, tx: (pageW - w) / 2, ty: bottom + h, scaledToFit };
    }

    /**
     * @description Writes the Drawing as a one-page PDF 1.4 file. Streams are
     * FlateDecode when o.deflate returns bytes, otherwise uncompressed.
     */
    async function write(drawing, o) {
        const options = o || {};
        if (!drawing || !Array.isArray(drawing.items)) throw new TypeError('QRTurboPdf: invalid drawing');
        const mode = options.colorMode === 'cmyk' || options.colorMode === 'k' ? options.colorMode : 'rgb';
        const deflate = typeof options.deflate === 'function' ? options.deflate : null;
        const kit = writerKit();
        const { num } = kit;
        const geometry = pageGeometry(drawing, options);
        const { content, resources } = buildContent(kit, drawing, mode, geometry);

        // Objects 1-5 are fixed; resources follow from 6 in the order
        // fonts, shadings (each followed by its function), images (each
        // followed by its soft mask), stencil masks.
        const objects = [];
        let next = 6;
        const fontNum = resources.font ? next++ : 0;
        const shadingNums = resources.shadings.map(shading => {
            const own = next++;
            const fn = next++;
            return { shading, own, fn };
        });
        const imageNums = resources.images.map(pixels => {
            const own = next++;
            const translucent = Boolean(pixels.alpha) && pixels.alpha.some(value => value < 255);
            const smask = translucent ? next++ : 0;
            return { pixels, own, smask };
        });
        const maskNums = resources.masks.map(mask => ({ mask, own: next++ }));

        async function streamObject(objectNum, entries, raw) {
            const packed = await kit.compress(deflate, raw);
            const data = packed || raw;
            const filter = packed ? ' /Filter /FlateDecode' : '';
            objects[objectNum] = { dict: `<< /Length ${data.length}${filter}${entries ? ' ' + entries : ''} >>`, stream: data };
        }

        const resourceParts = [];
        if (fontNum) resourceParts.push(`/Font << /F1 ${fontNum} 0 R >>`);
        const xobjects = [
            ...imageNums.map((image, index) => `/Im${index + 1} ${image.own} 0 R`),
            ...maskNums.map((mask, index) => `/Mk${index + 1} ${mask.own} 0 R`)
        ];
        if (xobjects.length) resourceParts.push(`/XObject << ${xobjects.join(' ')} >>`);
        if (shadingNums.length) {
            resourceParts.push(`/Shading << ${shadingNums.map((entry, index) => `/Sh${index + 1} ${entry.own} 0 R`).join(' ')} >>`);
        }

        objects[1] = { dict: '<< /Type /Catalog /Pages 2 0 R >>' };
        objects[2] = { dict: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' };
        objects[3] = {
            dict: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(geometry.pageW)} ${num(geometry.pageH)}] `
                + `/Resources <<${resourceParts.map(part => ' ' + part).join('')} >> /Contents 4 0 R >>`
        };
        await streamObject(4, '', asciiBytes(content));
        objects[5] = {
            dict: `<< /Producer (QRTurbo.app) /Creator (QRTurbo.app) /Title (QR code) /CreationDate (${pdfDate(options.date)}) >>`
        };
        if (fontNum) {
            objects[fontNum] = { dict: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>' };
        }
        for (const entry of shadingNums) {
            const { shading } = entry;
            objects[entry.own] = {
                dict: `<< /ShadingType ${shading.type === 'linear' ? 2 : 3} /ColorSpace ${shadingColorSpace(mode)} `
                    + `/Coords [${shading.coords.map(num).join(' ')}] /Function ${entry.fn} 0 R /Extend [true true] >>`
            };
            objects[entry.fn] = { dict: functionDict(kit, shading.stops, mode) };
        }
        for (const entry of imageNums) {
            const { pixels } = entry;
            const count = pixels.width * pixels.height;
            const gray = mode === 'k';
            const entries = `/Type /XObject /Subtype /Image /Width ${pixels.width} /Height ${pixels.height} `
                + `/ColorSpace ${gray ? '/DeviceGray' : '/DeviceRGB'} /BitsPerComponent 8`
                + (entry.smask ? ` /SMask ${entry.smask} 0 R` : '');
            await streamObject(entry.own, entries, gray ? kit.graySamples(pixels.rgb, count) : pixels.rgb);
            if (entry.smask) {
                await streamObject(
                    entry.smask,
                    `/Type /XObject /Subtype /Image /Width ${pixels.width} /Height ${pixels.height} /ColorSpace /DeviceGray /BitsPerComponent 8`,
                    pixels.alpha
                );
            }
        }
        for (const entry of maskNums) {
            const { mask } = entry;
            await streamObject(
                entry.own,
                `/Type /XObject /Subtype /Image /Width ${mask.cols} /Height ${mask.rows} /ImageMask true /BitsPerComponent 1 /Decode [1 0]`,
                mask.bits
            );
        }

        const parts = [];
        let position = 0;
        const push = bytes => {
            parts.push(bytes);
            position += bytes.length;
        };
        push(asciiBytes('%PDF-1.4\n'));
        push(Uint8Array.of(0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a));
        const offsets = [];
        for (let n = 1; n < next; n++) {
            const object = objects[n];
            offsets[n] = position;
            push(asciiBytes(`${n} 0 obj\n${object.dict}\n`));
            if (object.stream) {
                push(asciiBytes('stream\n'));
                push(object.stream);
                push(asciiBytes('\nendstream\n'));
            }
            push(asciiBytes('endobj\n'));
        }
        const xrefOffset = position;
        const xref = [`xref\n0 ${next}\n`, '0000000000 65535 f \n'];
        for (let n = 1; n < next; n++) xref.push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`);
        push(asciiBytes(xref.join('')));
        push(asciiBytes(`trailer\n<< /Size ${next} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`));

        return { bytes: concatBytes(parts, position), scaledToFit: geometry.scaledToFit };
    }

    const api = {
        // write(d: Drawing, o: { widthPt, page: 'fit'|'a4'|'letter', marginPt?, colorMode: 'rgb'|'cmyk'|'k',
        //   deflate?, date? }): Promise<{ bytes: Uint8Array, scaledToFit: boolean }>
        write
    };

    globalThis.QRTurboPdf = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
