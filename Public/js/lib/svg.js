// QRTurbo.app - SVG parser and hardening (QRTurboSvg)
// Pure: a small XML tokenizer, so SVG can be parsed and serialized without a
// DOMParser (and therefore tested in Node), and harden(), which turns the
// library SVG into a portable, self-contained document.
//
// SvgNode: { name, attrs, children, text, tail }
//   name     qualified element name as written ('svg', 'clipPath', ...)
//   attrs    plain object of decoded attribute values, in document order
//   children element nodes only
//   text     decoded character data before the first child element
//   tail     decoded character data after this element, up to the next
//            sibling (the ElementTree model), so mixed content round-trips
// Whitespace-only character data is kept only inside text-like elements.
(function () {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const XLINK_NS = 'http://www.w3.org/1999/xlink';
    const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'' };
    // Elements whose whitespace-only character data is meaningful.
    const TEXT_ELEMENTS = new Set(['text', 'tspan', 'textPath', 'title', 'desc', 'style', 'script', 'a']);
    const ENTITY_RE = /&(#[xX][0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g;
    const URL_REF_RE = /url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g;
    const ID_PREFIX_RE = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
    const LENGTH_PX_RE = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*(?:px)?\s*$/;
    const PX_SUFFIX_RE = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*px\s*$/i;
    // rotate(0), rotate(0 cx cy) or rotate(0,cx,cy), with any zero spelling.
    const ZERO_ROTATE_RE = /^\s*rotate\(\s*[+-]?(?:0+\.?0*|\.0+)(?:[eE][+-]?\d+)?(?:(?:\s*,\s*|\s+)[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?:\s*,\s*|\s+)[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)?\s*\)\s*$/;
    const ATTRIBUTE_SPECIAL_RE = /[&<"\t\n\r]/;
    const TEXT_SPECIAL_RE = /[&<>\r]/;
    // Characters XML 1.0 forbids: C0 controls other than tab, LF and CR,
    // U+FFFE, U+FFFF and (with the u flag) lone surrogates, for example half
    // of an emoji cut by a length limit. One of them makes DOMParser fail.
    const INVALID_XML_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF\uD800-\uDFFF]/u;
    const INVALID_XML_GLOBAL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF\uD800-\uDFFF]/gu;
    const NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

    function parseError(message, index) {
        return new Error(`QRTurboSvg.parse: ${message} at offset ${index}`);
    }

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    /**
     * @description Decodes the five XML entities and numeric character
     * references. Unknown named entities are kept literally.
     */
    function decodeEntities(raw) {
        if (raw.indexOf('&') === -1) return raw;
        return raw.replace(ENTITY_RE, (match, body) => {
            if (body.charCodeAt(0) === 35) {
                const hex = body[1] === 'x' || body[1] === 'X';
                const code = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
                const valid = code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff);
                return valid ? String.fromCodePoint(code) : match;
            }
            return hasOwn(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : match;
        });
    }

    // XML attribute-value normalization: line breaks and tabs become spaces;
    // character references (for example &#10;) are decoded afterwards.
    function decodeAttribute(raw) {
        const normalized = /[\t\n\r]/.test(raw) ? raw.replace(/\r\n?/g, '\n').replace(/[\t\n]/g, ' ') : raw;
        return decodeEntities(normalized);
    }

    function isSpace(c) {
        return c === 32 || c === 10 || c === 9 || c === 13;
    }

    function skipSpaces(src, index) {
        let i = index;
        while (i < src.length && isSpace(src.charCodeAt(i))) i++;
        return i;
    }

    // End of an XML name: stops at whitespace, '/', '>', '=', quotes and '<'.
    function scanName(src, index) {
        let i = index;
        while (i < src.length) {
            const c = src.charCodeAt(i);
            if (isSpace(c) || c === 47 || c === 62 || c === 61 || c === 34 || c === 39 || c === 60) break;
            i++;
        }
        return i;
    }

    function createNode(name) {
        return { name, attrs: {}, children: [], text: '', tail: '' };
    }

    // DOCTYPE with an optional internal subset: skip to the matching '>'.
    function skipDoctype(src, start) {
        let depth = 0;
        for (let i = start + 2; i < src.length; i++) {
            const c = src.charCodeAt(i);
            if (c === 91) depth++;
            else if (c === 93) depth--;
            else if (c === 62 && depth <= 0) return i + 1;
        }
        throw parseError('unterminated <!DOCTYPE>', start);
    }

    /**
     * @description Parses SVG (XML) markup into an SvgNode tree without a
     * DOMParser. Skips the XML declaration, processing instructions, comments
     * and DOCTYPE; keeps CDATA as text; throws on malformed markup.
     */
    function parse(markup) {
        const src = String(markup == null ? '' : markup);
        const length = src.length;
        const stack = [];
        let root = null;
        let pos = src.charCodeAt(0) === 0xfeff ? 1 : 0;
        // The node whose text (or tail) receives the next character data.
        let textOwner = null;
        let textField = 'text';

        function appendText(raw, at, decoded) {
            if (!raw) return;
            const value = decoded ? raw : decodeEntities(raw);
            const container = stack.length ? stack[stack.length - 1] : null;
            const whitespace = !/\S/.test(value);
            if (!container) {
                if (whitespace) return;
                throw parseError('text outside the root element', at);
            }
            if (whitespace && !TEXT_ELEMENTS.has(container.name)) return;
            textOwner[textField] += value;
        }

        while (pos < length) {
            const lt = src.indexOf('<', pos);
            const textEnd = lt === -1 ? length : lt;
            if (textEnd > pos) appendText(src.slice(pos, textEnd), pos, false);
            if (lt === -1) break;
            pos = lt;

            if (src.startsWith('<!--', pos)) {
                const close = src.indexOf('-->', pos + 4);
                if (close === -1) throw parseError('unterminated comment', pos);
                pos = close + 3;
                continue;
            }
            if (src.startsWith('<![CDATA[', pos)) {
                const close = src.indexOf(']]>', pos + 9);
                if (close === -1) throw parseError('unterminated CDATA section', pos);
                appendText(src.slice(pos + 9, close), pos, true);
                pos = close + 3;
                continue;
            }
            if (src.startsWith('<?', pos)) {
                const close = src.indexOf('?>', pos + 2);
                if (close === -1) throw parseError('unterminated processing instruction', pos);
                pos = close + 2;
                continue;
            }
            if (src.startsWith('<!', pos)) {
                pos = skipDoctype(src, pos);
                continue;
            }

            if (src.charCodeAt(pos + 1) === 47) {
                const close = src.indexOf('>', pos + 2);
                if (close === -1) throw parseError('unterminated end tag', pos);
                const name = src.slice(pos + 2, close).trim();
                const open = stack.pop();
                if (!open || open.name !== name) throw parseError(`unexpected </${name}>`, pos);
                textOwner = open;
                textField = 'tail';
                pos = close + 1;
                continue;
            }

            const nameEnd = scanName(src, pos + 1);
            if (nameEnd === pos + 1) throw parseError('invalid start tag', pos);
            const node = createNode(src.slice(pos + 1, nameEnd));
            let cursor = nameEnd;
            let selfClosing = false;

            for (;;) {
                const spaceEnd = skipSpaces(src, cursor);
                const spaced = spaceEnd > cursor;
                cursor = spaceEnd;
                const c = src.charCodeAt(cursor);
                if (c === 62) {
                    cursor++;
                    break;
                }
                if (c === 47 && src.charCodeAt(cursor + 1) === 62) {
                    selfClosing = true;
                    cursor += 2;
                    break;
                }
                if (!spaced) throw parseError(`malformed <${node.name}>`, cursor);
                const attrEnd = scanName(src, cursor);
                if (attrEnd === cursor) throw parseError(`malformed attribute in <${node.name}>`, cursor);
                const attrName = src.slice(cursor, attrEnd);
                cursor = skipSpaces(src, attrEnd);
                if (src.charCodeAt(cursor) !== 61) throw parseError(`attribute ${attrName} has no value`, cursor);
                cursor = skipSpaces(src, cursor + 1);
                const quote = src[cursor];
                if (quote !== '"' && quote !== '\'') throw parseError(`attribute ${attrName} is not quoted`, cursor);
                const valueEnd = src.indexOf(quote, cursor + 1);
                if (valueEnd === -1) throw parseError(`unterminated value of ${attrName}`, cursor);
                if (hasOwn(node.attrs, attrName)) throw parseError(`duplicate attribute ${attrName}`, cursor);
                // A literal "__proto__" key would change the object's prototype.
                if (attrName !== '__proto__') {
                    node.attrs[attrName] = decodeAttribute(src.slice(cursor + 1, valueEnd));
                }
                cursor = valueEnd + 1;
            }

            if (stack.length) {
                stack[stack.length - 1].children.push(node);
            } else if (root) {
                throw parseError('more than one root element', pos);
            } else {
                root = node;
            }
            if (selfClosing) {
                textOwner = node;
                textField = 'tail';
            } else {
                stack.push(node);
                textOwner = node;
                textField = 'text';
            }
            pos = cursor;
        }

        if (stack.length) throw parseError(`<${stack[stack.length - 1].name}> is not closed`, length);
        if (!root) throw parseError('no root element', 0);
        return root;
    }

    // Drops the characters an XML 1.0 document cannot contain at all.
    function stripInvalidXml(value) {
        const text = String(value);
        return INVALID_XML_RE.test(text) ? text.replace(INVALID_XML_GLOBAL_RE, '') : text;
    }

    function escapeAttribute(value) {
        const text = stripInvalidXml(value);
        if (!ATTRIBUTE_SPECIAL_RE.test(text)) return text;
        return text.replace(/[&<"\t\n\r]/g, c => {
            switch (c) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '"': return '&quot;';
                case '\t': return '&#9;';
                case '\n': return '&#10;';
                default: return '&#13;';
            }
        });
    }

    function escapeText(value) {
        const text = stripInvalidXml(value);
        if (!TEXT_SPECIAL_RE.test(text)) return text;
        return text.replace(/[&<>\r]/g, c => {
            switch (c) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                default: return '&#13;';
            }
        });
    }

    function writeNode(node, out) {
        out.push('<', node.name);
        const attrs = node.attrs || {};
        for (const key of Object.keys(attrs)) {
            const value = attrs[key];
            if (value === undefined || value === null) continue;
            out.push(' ', key, '="', escapeAttribute(value), '"');
        }
        const children = node.children || [];
        const text = node.text == null ? '' : String(node.text);
        if (!children.length && !text) {
            out.push('/>');
            return;
        }
        out.push('>');
        if (text) out.push(escapeText(text));
        for (const child of children) {
            writeNode(child, out);
            if (child.tail) out.push(escapeText(child.tail));
        }
        out.push('</', node.name, '>');
    }

    /**
     * @description Serializes an SvgNode tree to markup. Attributes are
     * written with double quotes in their object order; elements without
     * content are self-closing. Characters that XML 1.0 forbids are dropped,
     * so the output always parses. No XML declaration is written.
     */
    function serialize(node) {
        if (!node || typeof node.name !== 'string') throw new TypeError('QRTurboSvg.serialize: expected an SvgNode');
        const out = [];
        writeNode(node, out);
        return out.join('');
    }

    function walk(node, visit) {
        visit(node);
        for (const child of node.children) walk(child, visit);
    }

    function readPixelLength(value) {
        const match = LENGTH_PX_RE.exec(String(value == null ? '' : value));
        if (!match) return null;
        const number = Number(match[1]);
        return number > 0 && Number.isFinite(number) ? number : null;
    }

    function formatNumber(value) {
        return String(Math.round(value * 1e6) / 1e6);
    }

    // Returns a normalized "minX minY width height" string, or null.
    function normalizeViewBox(value) {
        if (typeof value !== 'string') return null;
        const parts = value.trim().split(/[\s,]+/);
        if (parts.length !== 4 || !parts.every(part => NUMBER_RE.test(part))) return null;
        const numbers = parts.map(Number);
        if (!(numbers[2] > 0 && numbers[3] > 0)) return null;
        return numbers.map(formatNumber).join(' ');
    }

    function isZeroRotation(value) {
        return ZERO_ROTATE_RE.test(value);
    }

    function isTransparent(value) {
        return typeof value === 'string' && value.trim().toLowerCase() === 'transparent';
    }

    function isVisibleStroke(value) {
        if (value === undefined) return false;
        const normalized = String(value).trim().toLowerCase();
        return normalized !== '' && normalized !== 'none' && normalized !== 'transparent';
    }

    // Rebuilds attrs with the given keys first, keeping the rest in order.
    function reorderAttributes(attrs, leading) {
        const result = {};
        for (const key of Object.keys(leading)) result[key] = leading[key];
        for (const key of Object.keys(attrs)) {
            if (!hasOwn(result, key)) result[key] = attrs[key];
        }
        return result;
    }

    // Inserts key/value right after `afterKey` (or at the end).
    function insertAttributeAfter(attrs, afterKey, key, value) {
        if (!hasOwn(attrs, afterKey)) {
            attrs[key] = value;
            return attrs;
        }
        const result = {};
        for (const existing of Object.keys(attrs)) {
            if (existing === key) continue;
            result[existing] = attrs[existing];
            if (existing === afterKey) result[key] = value;
        }
        return result;
    }

    /**
     * @description Makes library (or framed) SVG portable, following SPEC C.4:
     * namespaces, viewBox and size, no dangling clip-path, no "transparent",
     * no rotate(0), unquoted url(#id), prefixed ids, xlink:href on images,
     * and an optional XML declaration.
     * opts: { idPrefix?, width?, height?, xmlDeclaration? (default true),
     * xlinkHref? (default true) }. With xlinkHref: false an <image> keeps
     * only href, without the xlink:href copy that old SVG 1.1 readers need:
     * the in-page preview uses that, which halves its size with a logo.
     */
    function harden(markup, opts) {
        const options = opts || {};
        const prefix = options.idPrefix === undefined || options.idPrefix === null ? '' : String(options.idPrefix);
        const xlinkHref = options.xlinkHref !== false;
        if (prefix && !ID_PREFIX_RE.test(prefix)) {
            throw new TypeError('QRTurboSvg.harden: idPrefix must be a valid XML name start');
        }
        const root = parse(markup);
        if (root.name !== 'svg') throw new Error('QRTurboSvg.harden: the root element is not <svg>');

        // 1. Namespaces. 2. viewBox, then the size from opts.
        const attrs = root.attrs;
        let viewBox = normalizeViewBox(attrs.viewBox);
        if (!viewBox) {
            const width = readPixelLength(attrs.width);
            const height = readPixelLength(attrs.height);
            if (width && height) viewBox = `0 0 ${formatNumber(width)} ${formatNumber(height)}`;
        }
        const hadViewBox = hasOwn(attrs, 'viewBox');
        let rootAttrs = reorderAttributes(attrs, { xmlns: SVG_NS, 'xmlns:xlink': XLINK_NS });
        if (viewBox) {
            if (hadViewBox) rootAttrs.viewBox = viewBox;
            else rootAttrs = insertAttributeAfter(rootAttrs, hasOwn(rootAttrs, 'height') ? 'height' : 'xmlns:xlink', 'viewBox', viewBox);
        } else if (hadViewBox) {
            delete rootAttrs.viewBox;
        }
        if (options.width !== undefined && options.width !== null) rootAttrs.width = String(options.width);
        if (options.height !== undefined && options.height !== null) rootAttrs.height = String(options.height);
        root.attrs = rootAttrs;

        const ids = new Set();
        walk(root, node => {
            if (typeof node.attrs.id === 'string' && node.attrs.id) ids.add(node.attrs.id);
        });

        const prefixReferences = value => value.replace(URL_REF_RE, (match, quote, id) => `url(#${prefix}${id})`);

        function fixNode(node, inClipPath) {
            const nodeAttrs = node.attrs;

            // 3. Dangling clip-path references.
            if (typeof nodeAttrs['clip-path'] === 'string') {
                URL_REF_RE.lastIndex = 0;
                const match = URL_REF_RE.exec(nodeAttrs['clip-path']);
                URL_REF_RE.lastIndex = 0;
                if (match && !ids.has(match[2])) delete nodeAttrs['clip-path'];
            }

            // 4. "transparent" is not an SVG 1.1 color. Inside a clipPath only
            // the geometry counts, so the rect stays there.
            if (isTransparent(nodeAttrs.fill)) {
                if (node.name === 'rect' && !inClipPath && !nodeAttrs.id && !isVisibleStroke(nodeAttrs.stroke)) return false;
                nodeAttrs.fill = 'none';
            }
            if (isTransparent(nodeAttrs.stroke)) nodeAttrs.stroke = 'none';
            if (isTransparent(nodeAttrs['stop-color'])) {
                nodeAttrs['stop-color'] = '#000000';
                nodeAttrs['stop-opacity'] = '0';
            }

            // 5. rotate(0,...) is a no-op.
            if (typeof nodeAttrs.transform === 'string' && isZeroRotation(nodeAttrs.transform)) {
                delete nodeAttrs.transform;
            }

            for (const key of Object.keys(nodeAttrs)) {
                const value = nodeAttrs[key];
                if (typeof value !== 'string') continue;
                // 6 and 7. url('#x') becomes url(#<prefix>x).
                if (value.indexOf('url(') !== -1) nodeAttrs[key] = prefixReferences(value);
                // 7. Local href references.
                if ((key === 'href' || key === 'xlink:href') && value.charCodeAt(0) === 35) {
                    nodeAttrs[key] = `#${prefix}${value.slice(1)}`;
                }
            }
            // 7. Ids.
            if (typeof nodeAttrs.id === 'string' && nodeAttrs.id) nodeAttrs.id = prefix + nodeAttrs.id;

            // 8. <image>: both href forms (only href without xlinkHref),
            // unitless size.
            if (node.name === 'image') {
                let imageAttrs = nodeAttrs;
                if (hasOwn(imageAttrs, 'xlink:href') && !hasOwn(imageAttrs, 'href')) {
                    const withHref = {};
                    for (const key of Object.keys(imageAttrs)) {
                        if (key === 'xlink:href') withHref.href = imageAttrs[key];
                        withHref[key] = imageAttrs[key];
                    }
                    imageAttrs = withHref;
                }
                if (!xlinkHref) {
                    // href wins over xlink:href in SVG 2, so href is kept.
                    if (hasOwn(imageAttrs, 'href')) delete imageAttrs['xlink:href'];
                } else if (hasOwn(imageAttrs, 'href') && !hasOwn(imageAttrs, 'xlink:href')) {
                    imageAttrs = insertAttributeAfter(imageAttrs, 'href', 'xlink:href', imageAttrs.href);
                }
                for (const key of ['width', 'height']) {
                    const match = PX_SUFFIX_RE.exec(String(imageAttrs[key] == null ? '' : imageAttrs[key]));
                    if (match) imageAttrs[key] = match[1];
                }
                node.attrs = imageAttrs;
            }

            if (node.children.length) {
                const clipChildren = inClipPath || node.name === 'clipPath';
                node.children = node.children.filter(child => fixNode(child, clipChildren));
            }
            return true;
        }

        fixNode(root, false);
        const body = serialize(root);
        // 9. XML declaration (default on).
        return options.xmlDeclaration === false ? body : XML_DECLARATION + body;
    }

    const api = {
        parse,
        serialize,
        harden
    };

    globalThis.QRTurboSvg = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
