'use strict';

// Node-side inspection of the vector exports (PDF and EPS).
// - parsePdf(buffer) validates the file structure (xref, object headers,
//   stream lengths) and returns the objects, the MediaBox and the inflated
//   page content.
// - rasterizePdf(buffer, opts) and rasterizeEps(text, opts) paint the
//   operators that QRTurboPdf and QRTurboEps emit into an RGBA buffer that
//   jsQR can decode. Any other operator throws, so a writer change that adds
//   operators fails loudly here.
// - qrTestDrawing(payload, opts) builds a Drawing from a real QR matrix
//   (from the vendored library) for writer tests.
// - Ghostscript is used only when it is installed (ghostscriptVersion()).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const HELVETICA_PATH = path.join(repoRoot, 'Public/js/lib/helvetica.js');

// ---------------------------------------------------------------------------
// PDF object parser

const PDF_WHITESPACE = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]);
const PDF_DELIMITERS = new Set('()<>[]{}/%'.split('').map(ch => ch.charCodeAt(0)));

function isPdfRegular(code) {
  return !PDF_WHITESPACE.has(code) && !PDF_DELIMITERS.has(code);
}

class PdfLexer {
  constructor(text, pos = 0) {
    this.text = text;
    this.pos = pos;
  }

  skipSpace() {
    const { text } = this;
    while (this.pos < text.length) {
      const code = text.charCodeAt(this.pos);
      if (PDF_WHITESPACE.has(code)) {
        this.pos += 1;
      } else if (code === 0x25) {
        while (this.pos < text.length && text[this.pos] !== '\n' && text[this.pos] !== '\r') this.pos += 1;
      } else {
        break;
      }
    }
  }

  readRegular() {
    const start = this.pos;
    while (this.pos < this.text.length && isPdfRegular(this.text.charCodeAt(this.pos))) this.pos += 1;
    return this.text.slice(start, this.pos);
  }

  readLiteralString() {
    const { text } = this;
    this.pos += 1;
    let depth = 1;
    const bytes = [];
    while (this.pos < text.length) {
      const ch = text[this.pos];
      if (ch === '\\') {
        const next = text[this.pos + 1];
        const simple = { n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92 };
        if (next in simple) {
          bytes.push(simple[next]);
          this.pos += 2;
        } else if (/[0-7]/.test(next)) {
          const match = /^[0-7]{1,3}/.exec(text.slice(this.pos + 1, this.pos + 4));
          bytes.push(parseInt(match[0], 8) & 0xff);
          this.pos += 1 + match[0].length;
        } else if (next === '\n' || next === '\r') {
          this.pos += 2;
          if (next === '\r' && text[this.pos] === '\n') this.pos += 1;
        } else {
          bytes.push(next.charCodeAt(0));
          this.pos += 2;
        }
        continue;
      }
      if (ch === '(') depth += 1;
      if (ch === ')') {
        depth -= 1;
        if (depth === 0) {
          this.pos += 1;
          return { type: 'string', bytes: Buffer.from(bytes) };
        }
      }
      bytes.push(ch.charCodeAt(0) & 0xff);
      this.pos += 1;
    }
    throw new Error('PDF: unterminated string');
  }

  readHexString() {
    const end = this.text.indexOf('>', this.pos);
    if (end < 0) throw new Error('PDF: unterminated hex string');
    let hex = this.text.slice(this.pos + 1, end).replace(/\s+/g, '');
    if (hex.length % 2) hex += '0';
    this.pos = end + 1;
    return { type: 'string', bytes: Buffer.from(hex, 'hex') };
  }

  // Returns the next value, or { keyword } for bare words such as obj or R.
  next() {
    this.skipSpace();
    const { text } = this;
    if (this.pos >= text.length) return { eof: true };
    const ch = text[this.pos];
    if (ch === '<' && text[this.pos + 1] === '<') {
      this.pos += 2;
      const dict = {};
      for (;;) {
        this.skipSpace();
        if (text.startsWith('>>', this.pos)) {
          this.pos += 2;
          return dict;
        }
        const key = this.next();
        if (typeof key !== 'string' || key[0] !== '/') throw new Error(`PDF: bad dictionary key at ${this.pos}`);
        dict[key.slice(1)] = this.value();
      }
    }
    if (ch === '<') return this.readHexString();
    if (ch === '[') {
      this.pos += 1;
      const list = [];
      for (;;) {
        this.skipSpace();
        if (text[this.pos] === ']') {
          this.pos += 1;
          return list;
        }
        list.push(this.value());
      }
    }
    if (ch === '(') return this.readLiteralString();
    if (ch === '/') {
      this.pos += 1;
      return '/' + this.readRegular();
    }
    if (ch === ']' || ch === '>' || ch === ')' || ch === '{' || ch === '}') {
      throw new Error(`PDF: unexpected ${ch} at ${this.pos}`);
    }
    const word = this.readRegular();
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(word)) return Number(word);
    if (word === 'true') return true;
    if (word === 'false') return false;
    if (word === 'null') return null;
    return { keyword: word };
  }

  // A value, folding "n g R" into a reference.
  value() {
    const first = this.next();
    if (typeof first === 'number' && Number.isInteger(first)) {
      const save = this.pos;
      const match = /^\s+(\d+)\s+R(?![^\s()<>[\]{}/%])/.exec(this.text.slice(this.pos, this.pos + 24));
      if (match) {
        this.pos += match[0].length;
        return { ref: first, gen: Number(match[1]) };
      }
      this.pos = save;
    }
    if (first && first.keyword) throw new Error(`PDF: unexpected keyword ${first.keyword}`);
    return first;
  }
}

function decodeStream(dict, raw) {
  const filters = dict.Filter == null ? [] : (Array.isArray(dict.Filter) ? dict.Filter : [dict.Filter]);
  let data = raw;
  for (const filter of filters) {
    if (filter !== '/FlateDecode') throw new Error(`PDF: unsupported filter ${filter}`);
    data = zlib.inflateSync(data);
  }
  return data;
}

/**
 * Parses and validates a PDF written by QRTurboPdf. Throws on a broken
 * xref entry, a wrong object header or a /Length that does not end exactly
 * at "endstream".
 */
function parsePdf(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const text = buffer.toString('latin1');
  const header = /^%PDF-(\d\.\d)/.exec(text);
  if (!header) throw new Error('PDF: missing %PDF- header');
  if (!text.endsWith('%%EOF\n')) throw new Error('PDF: must end with %%EOF and a newline');

  const startMatch = /startxref\n(\d+)\n%%EOF\n$/.exec(text);
  if (!startMatch) throw new Error('PDF: missing startxref');
  const xrefOffset = Number(startMatch[1]);
  if (!text.startsWith('xref\n', xrefOffset)) throw new Error('PDF: startxref does not point at xref');

  let pos = xrefOffset + 5;
  const sub = /^(\d+) (\d+)\n/.exec(text.slice(pos, pos + 40));
  if (!sub) throw new Error('PDF: bad xref subsection header');
  const first = Number(sub[1]);
  const count = Number(sub[2]);
  if (first !== 0) throw new Error('PDF: xref must start at object 0');
  pos += sub[0].length;
  const entries = [];
  for (let i = 0; i < count; i++) {
    const line = text.slice(pos, pos + 20);
    const match = /^(\d{10}) (\d{5}) ([nf])(?: \n|\r\n)$/.exec(line);
    if (!match) throw new Error(`PDF: xref entry ${i} is not exactly 20 bytes: ${JSON.stringify(line)}`);
    entries.push({ offset: Number(match[1]), gen: Number(match[2]), inUse: match[3] === 'n' });
    pos += 20;
  }
  const trailerLexer = new PdfLexer(text, pos);
  const trailerWord = trailerLexer.next();
  if (!trailerWord || trailerWord.keyword !== 'trailer') throw new Error('PDF: missing trailer');
  const trailer = trailerLexer.value();
  if (trailer.Size !== count) throw new Error('PDF: trailer /Size does not match the xref');

  const objects = new Map();
  const pending = [];
  entries.forEach((entry, num) => {
    if (!entry.inUse) return;
    const lexer = new PdfLexer(text, entry.offset);
    const n = lexer.next();
    const g = lexer.next();
    const kw = lexer.next();
    if (n !== num || typeof g !== 'number' || !kw || kw.keyword !== 'obj') {
      throw new Error(`PDF: xref entry ${num} does not point at "${num} 0 obj"`);
    }
    const value = lexer.value();
    lexer.skipSpace();
    let stream = null;
    let streamStart = -1;
    if (text.startsWith('stream', lexer.pos)) {
      lexer.pos += 6;
      if (text.startsWith('\r\n', lexer.pos)) lexer.pos += 2;
      else if (text[lexer.pos] === '\n') lexer.pos += 1;
      else throw new Error(`PDF: stream keyword of object ${num} is not followed by EOL`);
      streamStart = lexer.pos;
    }
    objects.set(num, { num, gen: g, offset: entry.offset, value, stream, data: null });
    if (streamStart >= 0) pending.push({ num, lexer, streamStart });
    else {
      const end = lexer.next();
      if (!end || end.keyword !== 'endobj') throw new Error(`PDF: object ${num} lacks endobj`);
    }
  });

  const resolve = value => (value && typeof value === 'object' && 'ref' in value ? objects.get(value.ref).value : value);

  for (const { num, lexer, streamStart } of pending) {
    const object = objects.get(num);
    const length = resolve(object.value.Length);
    if (!Number.isInteger(length)) throw new Error(`PDF: stream ${num} has no integer /Length`);
    const after = text.slice(streamStart + length, streamStart + length + 12);
    if (!/^\r?\nendstream/.test(after) && !after.startsWith('endstream')) {
      throw new Error(`PDF: /Length of object ${num} does not end at endstream`);
    }
    object.stream = buffer.subarray(streamStart, streamStart + length);
    object.data = decodeStream(object.value, object.stream);
    lexer.pos = streamStart + length;
    const endstream = lexer.next();
    const endobj = lexer.next();
    if (!endstream || endstream.keyword !== 'endstream' || !endobj || endobj.keyword !== 'endobj') {
      throw new Error(`PDF: object ${num} lacks endstream/endobj`);
    }
  }

  const root = resolve(trailer.Root);
  const pages = resolve(root.Pages);
  const page = resolve(pages.Kids[0]);
  const contents = Array.isArray(page.Contents) ? page.Contents : [page.Contents];
  const content = contents.map(ref => objects.get(ref.ref).data.toString('latin1')).join('\n');
  const resources = resolve(page.Resources) || {};

  return {
    version: header[1],
    buffer,
    text,
    objects,
    xref: { offset: xrefOffset, size: count, entries },
    trailer,
    root,
    info: resolve(trailer.Info),
    page,
    mediaBox: page.MediaBox.map(resolve),
    resources,
    content,
    resolve
  };
}

// ---------------------------------------------------------------------------
// Raster core shared by the PDF and EPS interpreters

// concat(m, ctm): m applied first, as PDF cm and PostScript concat.
function concat(m, ctm) {
  return [
    m[0] * ctm[0] + m[1] * ctm[2],
    m[0] * ctm[1] + m[1] * ctm[3],
    m[2] * ctm[0] + m[3] * ctm[2],
    m[2] * ctm[1] + m[3] * ctm[3],
    m[4] * ctm[0] + m[5] * ctm[2] + ctm[4],
    m[4] * ctm[1] + m[5] * ctm[3] + ctm[5]
  ];
}

function invert(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det) throw new Error('raster: singular matrix');
  return [
    m[3] / det, -m[1] / det, -m[2] / det, m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det,
    (m[1] * m[4] - m[0] * m[5]) / det
  ];
}

function apply(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

class PathBuilder {
  constructor() {
    this.subpaths = [];
    this.current = null;
    this.point = null;
  }

  moveTo(x, y) {
    this.current = { points: [[x, y]], closed: false };
    this.subpaths.push(this.current);
    this.point = [x, y];
  }

  lineTo(x, y) {
    if (!this.current) throw new Error('raster: lineto without a current point');
    if (this.current.closed) this.moveTo(this.current.points[0][0], this.current.points[0][1]);
    this.current.points.push([x, y]);
    this.point = [x, y];
  }

  curveTo(x1, y1, x2, y2, x3, y3) {
    if (!this.point) throw new Error('raster: curveto without a current point');
    const [x0, y0] = this.point;
    const length = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
    const steps = Math.max(4, Math.min(96, Math.ceil(length / 1.5)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      this.lineTo(a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3);
    }
  }

  close() {
    if (this.current && !this.current.closed) {
      this.current.closed = true;
      this.point = [this.current.points[0][0], this.current.points[0][1]];
    }
  }
}

/**
 * Scanline conversion at pixel centers (no anti-aliasing): calls
 * emit(row, x0, x1) for every covered run, x1 exclusive.
 */
function scanSpans(subpaths, evenOdd, width, height, emit) {
  const buckets = new Array(height);
  for (const subpath of subpaths) {
    const points = subpath.points;
    const n = points.length;
    if (n < 2) continue;
    for (let i = 0; i < n; i++) {
      const p = points[i];
      const q = points[(i + 1) % n];
      if (p[1] === q[1]) continue;
      const down = q[1] > p[1];
      const top = down ? p : q;
      const bottom = down ? q : p;
      const startRow = Math.max(0, Math.ceil(top[1] - 0.5));
      const endRow = Math.min(height - 1, Math.ceil(bottom[1] - 0.5) - 1);
      if (endRow < startRow) continue;
      const edge = {
        x0: top[0],
        y0: top[1],
        slope: (bottom[0] - top[0]) / (bottom[1] - top[1]),
        endRow,
        dir: down ? 1 : -1
      };
      (buckets[startRow] || (buckets[startRow] = [])).push(edge);
    }
  }
  let active = [];
  for (let row = 0; row < height; row++) {
    if (buckets[row]) active = active.concat(buckets[row]);
    if (!active.length) continue;
    active = active.filter(edge => edge.endRow >= row);
    if (!active.length) continue;
    const yc = row + 0.5;
    const crossings = active.map(edge => ({ x: edge.x0 + (yc - edge.y0) * edge.slope, dir: edge.dir }));
    crossings.sort((a, b) => a.x - b.x);
    let winding = 0;
    for (let i = 0; i < crossings.length - 1; i++) {
      winding += evenOdd ? 1 : crossings[i].dir;
      const inside = evenOdd ? (winding & 1) === 1 : winding !== 0;
      if (!inside) continue;
      const from = Math.max(0, Math.ceil(crossings[i].x - 0.5));
      const to = Math.min(width, Math.ceil(crossings[i + 1].x - 0.5));
      if (to > from) emit(row, from, to);
    }
  }
}

function strokePolygons(subpaths, halfWidth) {
  const polygons = [];
  const disc = (cx, cy) => {
    const points = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      points.push([cx + Math.cos(angle) * halfWidth, cy + Math.sin(angle) * halfWidth]);
    }
    polygons.push({ points, closed: true });
  };
  for (const subpath of subpaths) {
    const points = subpath.closed ? subpath.points.concat([subpath.points[0]]) : subpath.points;
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const length = Math.hypot(x1 - x0, y1 - y0);
      if (!length) continue;
      const nx = (-(y1 - y0) / length) * halfWidth;
      const ny = ((x1 - x0) / length) * halfWidth;
      polygons.push({ points: [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], closed: true });
      disc(x1, y1);
    }
    if (points.length) disc(points[0][0], points[0][1]);
  }
  return polygons;
}

function toRgb255(space, components) {
  const c = components.map(value => Math.max(0, Math.min(1, Number(value) || 0)));
  if (space === 'DeviceGray') return [c[0] * 255, c[0] * 255, c[0] * 255];
  if (space === 'DeviceCMYK') {
    const k = 1 - c[3];
    return [255 * (1 - c[0]) * k, 255 * (1 - c[1]) * k, 255 * (1 - c[2]) * k];
  }
  if (space === 'DeviceRGB') return [c[0] * 255, c[1] * 255, c[2] * 255];
  throw new Error(`raster: unsupported color space ${space}`);
}

function evalFunction(fn, t) {
  const type = fn.FunctionType;
  if (type === 2) {
    const c0 = fn.C0 || [0];
    const c1 = fn.C1 || [1];
    const n = fn.N == null ? 1 : fn.N;
    const x = Math.pow(Math.max(0, Math.min(1, t)), n);
    return c0.map((value, index) => value + x * (c1[index] - value));
  }
  if (type === 3) {
    const domain = fn.Domain || [0, 1];
    const x = Math.max(domain[0], Math.min(domain[1], t));
    const bounds = fn.Bounds || [];
    let index = 0;
    while (index < bounds.length && x >= bounds[index]) index += 1;
    const low = index === 0 ? domain[0] : bounds[index - 1];
    const high = index === bounds.length ? domain[1] : bounds[index];
    const encode = fn.Encode.slice(index * 2, index * 2 + 2);
    const local = high > low ? encode[0] + ((x - low) / (high - low)) * (encode[1] - encode[0]) : encode[0];
    return evalFunction(fn.Functions[index], local);
  }
  throw new Error(`raster: unsupported function type ${type}`);
}

class Raster {
  constructor(width, height, background = [255, 255, 255]) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      this.data[i * 4] = background[0];
      this.data[i * 4 + 1] = background[1];
      this.data[i * 4 + 2] = background[2];
      this.data[i * 4 + 3] = 255;
    }
  }

  blend(index, rgb, alpha, clip) {
    if (clip && !clip[index]) return;
    const o = index * 4;
    if (alpha >= 1) {
      this.data[o] = rgb[0];
      this.data[o + 1] = rgb[1];
      this.data[o + 2] = rgb[2];
      return;
    }
    if (alpha <= 0) return;
    this.data[o] = this.data[o] * (1 - alpha) + rgb[0] * alpha;
    this.data[o + 1] = this.data[o + 1] * (1 - alpha) + rgb[1] * alpha;
    this.data[o + 2] = this.data[o + 2] * (1 - alpha) + rgb[2] * alpha;
  }

  fill(subpaths, evenOdd, rgb, clip) {
    scanSpans(subpaths, evenOdd, this.width, this.height, (row, from, to) => {
      for (let x = from; x < to; x++) this.blend(row * this.width + x, rgb, 1, clip);
    });
  }

  clipMask(subpaths, evenOdd, clip) {
    const mask = new Uint8Array(this.width * this.height);
    scanSpans(subpaths, evenOdd, this.width, this.height, (row, from, to) => {
      mask.fill(1, row * this.width + from, row * this.width + to);
    });
    if (clip) for (let i = 0; i < mask.length; i++) mask[i] &= clip[i];
    return mask;
  }

  stroke(subpaths, deviceWidth, rgb, clip) {
    this.fill(strokePolygons(subpaths, Math.max(0.5, deviceWidth / 2)), false, rgb, clip);
  }

  // Paints a shading (types 2 and 3, concentric radial) over the clip.
  shade(shading, ctm, clip) {
    const inverse = invert(ctm);
    const space = String(shading.ColorSpace).replace(/^\//, '');
    const coords = shading.Coords;
    const fn = shading.Function;
    for (let row = 0; row < this.height; row++) {
      for (let x = 0; x < this.width; x++) {
        const index = row * this.width + x;
        if (clip && !clip[index]) continue;
        const [ux, uy] = apply(inverse, x + 0.5, row + 0.5);
        let t;
        if (shading.ShadingType === 2) {
          const dx = coords[2] - coords[0];
          const dy = coords[3] - coords[1];
          const len2 = dx * dx + dy * dy;
          t = len2 ? ((ux - coords[0]) * dx + (uy - coords[1]) * dy) / len2 : 0;
        } else if (shading.ShadingType === 3) {
          if (coords[0] !== coords[3] || coords[1] !== coords[4]) throw new Error('raster: only concentric radial shadings');
          const dist = Math.hypot(ux - coords[0], uy - coords[1]);
          t = coords[5] !== coords[2] ? (dist - coords[2]) / (coords[5] - coords[2]) : 0;
        } else {
          throw new Error(`raster: unsupported shading type ${shading.ShadingType}`);
        }
        t = Math.max(0, Math.min(1, t));
        this.blend(index, toRgb255(space, evalFunction(fn, t)), 1, clip);
      }
    }
  }

  // Paints an image through the CTM. imageMatrix maps user space to image
  // space; sample(col, row) returns [r, g, b, alpha 0..1] or null.
  image(ctm, imageMatrix, cols, rows, sample, clip) {
    const deviceToUser = invert(ctm);
    const userToImage = imageMatrix;
    const imageToUser = invert(userToImage);
    const corners = [[0, 0], [cols, 0], [0, rows], [cols, rows]]
      .map(([ix, iy]) => apply(imageToUser, ix, iy))
      .map(([ux, uy]) => apply(ctm, ux, uy));
    const minX = Math.max(0, Math.floor(Math.min(...corners.map(p => p[0]))));
    const maxX = Math.min(this.width, Math.ceil(Math.max(...corners.map(p => p[0]))));
    const minY = Math.max(0, Math.floor(Math.min(...corners.map(p => p[1]))));
    const maxY = Math.min(this.height, Math.ceil(Math.max(...corners.map(p => p[1]))));
    for (let row = minY; row < maxY; row++) {
      for (let x = minX; x < maxX; x++) {
        const [ux, uy] = apply(deviceToUser, x + 0.5, row + 0.5);
        const [ix, iy] = apply(userToImage, ux, uy);
        const col = Math.floor(ix);
        const r = Math.floor(iy);
        if (col < 0 || r < 0 || col >= cols || r >= rows) continue;
        const value = sample(col, r);
        if (value) this.blend(row * this.width + x, value, value[3], clip);
      }
    }
  }
}

function bitAt(bytes, rowBytes, col, row) {
  return (bytes[row * rowBytes + (col >> 3)] >> (7 - (col & 7))) & 1;
}

class Counter extends Map {
  add(key) {
    this.set(key, (this.get(key) || 0) + 1);
  }
}

// ---------------------------------------------------------------------------
// PDF content interpreter

const CONTENT_TOKEN = /\s*(?:%[^\n\r]*|(\/[^\s()<>[\]{}/%]*)|(\((?:\\.|[^\\)])*\))|(\[)|(\])|(<<)|(>>)|([+-]?(?:\d+\.?\d*|\.\d+))|([A-Za-z'"*][A-Za-z0-9'"*]*))/gy;

function parseContentString(raw) {
  return new PdfLexer(raw, 0).readLiteralString().bytes;
}

/**
 * Rasterizes page 1 of a QRTurboPdf file. Returns { width, height, data,
 * operators } where data is RGBA and operators counts each operator used.
 */
function rasterizePdf(input, opts = {}) {
  const doc = parsePdf(input);
  const pxPerPt = opts.pxPerPt || 4;
  const [llx, lly, urx, ury] = doc.mediaBox;
  const width = Math.ceil((urx - llx) * pxPerPt);
  const height = Math.ceil((ury - lly) * pxPerPt);
  const raster = new Raster(width, height, opts.background);
  const operators = new Counter();
  const { resolve } = doc;
  const xobjects = resolve(doc.resources.XObject) || {};
  const shadings = resolve(doc.resources.Shading) || {};

  let state = {
    ctm: [pxPerPt, 0, 0, -pxPerPt, -llx * pxPerPt, ury * pxPerPt],
    fill: [0, 0, 0],
    stroke: [0, 0, 0],
    lineWidth: 1,
    clip: null
  };
  const stack = [];
  let path = new PathBuilder();
  let pendingClip = null;
  let inText = false;
  const operands = [];
  const arrays = [];

  const deep = value => {
    const resolved = resolve(value);
    if (Array.isArray(resolved)) return resolved.map(deep);
    if (resolved && typeof resolved === 'object' && !resolved.type && !resolved.bytes) {
      const out = {};
      for (const [key, entry] of Object.entries(resolved)) out[key] = deep(entry);
      return out;
    }
    return resolved;
  };

  function point(x, y) {
    return apply(state.ctm, x, y);
  }

  function paintXObject(name) {
    const ref = xobjects[name.slice(1)];
    if (!ref) throw new Error(`rasterizePdf: missing XObject ${name}`);
    const object = doc.objects.get(ref.ref);
    const dict = object.value;
    if (dict.Subtype !== '/Image') throw new Error('rasterizePdf: only image XObjects');
    const cols = dict.Width;
    const rows = dict.Height;
    const imageMatrix = [cols, 0, 0, -rows, 0, rows];
    if (dict.ImageMask === true) {
      if (dict.BitsPerComponent !== 1) throw new Error('rasterizePdf: ImageMask needs 1 bit');
      const decode = dict.Decode || [0, 1];
      const paintBit = decode[0] === 1 ? 1 : 0;
      const rowBytes = Math.ceil(cols / 8);
      const color = state.fill;
      raster.image(state.ctm, imageMatrix, cols, rows,
        (col, row) => (bitAt(object.data, rowBytes, col, row) === paintBit ? [color[0], color[1], color[2], 1] : null),
        state.clip);
      return;
    }
    if (dict.BitsPerComponent !== 8) throw new Error('rasterizePdf: images need 8 bits');
    const space = String(dict.ColorSpace).slice(1);
    const channels = space === 'DeviceGray' ? 1 : (space === 'DeviceRGB' ? 3 : 0);
    if (!channels) throw new Error(`rasterizePdf: unsupported image color space ${space}`);
    if (object.data.length !== cols * rows * channels) throw new Error('rasterizePdf: image data size mismatch');
    let alpha = null;
    if (dict.SMask) {
      const smask = doc.objects.get(dict.SMask.ref);
      if (smask.value.Width !== cols || smask.value.Height !== rows) throw new Error('rasterizePdf: SMask size mismatch');
      alpha = smask.data;
    }
    raster.image(state.ctm, imageMatrix, cols, rows, (col, row) => {
      const i = row * cols + col;
      const a = alpha ? alpha[i] / 255 : 1;
      if (channels === 1) {
        const g = object.data[i];
        return [g, g, g, a];
      }
      return [object.data[i * 3], object.data[i * 3 + 1], object.data[i * 3 + 2], a];
    }, state.clip);
  }

  const handlers = {
    q: () => stack.push({ ...state }),
    Q: () => {
      if (!stack.length) throw new Error('rasterizePdf: unbalanced Q');
      state = stack.pop();
    },
    cm: a => { state.ctm = concat(a, state.ctm); },
    w: a => { state.lineWidth = a[0]; },
    rg: a => { state.fill = toRgb255('DeviceRGB', a); },
    RG: a => { state.stroke = toRgb255('DeviceRGB', a); },
    k: a => { state.fill = toRgb255('DeviceCMYK', a); },
    K: a => { state.stroke = toRgb255('DeviceCMYK', a); },
    g: a => { state.fill = toRgb255('DeviceGray', a); },
    G: a => { state.stroke = toRgb255('DeviceGray', a); },
    m: a => path.moveTo(...point(a[0], a[1])),
    l: a => path.lineTo(...point(a[0], a[1])),
    c: a => path.curveTo(...point(a[0], a[1]), ...point(a[2], a[3]), ...point(a[4], a[5])),
    h: () => path.close(),
    re: a => {
      path.moveTo(...point(a[0], a[1]));
      path.lineTo(...point(a[0] + a[2], a[1]));
      path.lineTo(...point(a[0] + a[2], a[1] + a[3]));
      path.lineTo(...point(a[0], a[1] + a[3]));
      path.close();
    },
    f: () => { raster.fill(path.subpaths, false, state.fill, state.clip); path = new PathBuilder(); },
    'f*': () => { raster.fill(path.subpaths, true, state.fill, state.clip); path = new PathBuilder(); },
    S: () => {
      const scale = Math.sqrt(Math.abs(state.ctm[0] * state.ctm[3] - state.ctm[1] * state.ctm[2]));
      raster.stroke(path.subpaths, state.lineWidth * scale, state.stroke, state.clip);
      path = new PathBuilder();
    },
    W: () => { pendingClip = 'nonzero'; },
    'W*': () => { pendingClip = 'evenodd'; },
    n: () => {
      if (pendingClip) state.clip = raster.clipMask(path.subpaths, pendingClip === 'evenodd', state.clip);
      pendingClip = null;
      path = new PathBuilder();
    },
    sh: a => {
      const ref = shadings[a[0].slice(1)];
      if (!ref) throw new Error(`rasterizePdf: missing shading ${a[0]}`);
      raster.shade(deep(ref), state.ctm, state.clip);
    },
    Do: a => paintXObject(a[0]),
    BT: () => { inText = true; },
    ET: () => { inText = false; },
    Tf: () => {},
    Tm: () => {},
    Tj: () => {}
  };
  const TEXT_ONLY = new Set(['Tf', 'Tm', 'Tj']);

  const content = doc.content;
  CONTENT_TOKEN.lastIndex = 0;
  while (CONTENT_TOKEN.lastIndex < content.length) {
    const start = CONTENT_TOKEN.lastIndex;
    const match = CONTENT_TOKEN.exec(content);
    if (!match) {
      if (/^\s*$/.test(content.slice(start))) break;
      throw new Error(`rasterizePdf: cannot tokenize content at ${start}`);
    }
    const [, name, str, open, close, dictOpen, dictClose, number, op] = match;
    const target = arrays.length ? arrays[arrays.length - 1] : operands;
    if (name !== undefined) target.push(name);
    else if (str !== undefined) target.push(parseContentString(str));
    else if (open) arrays.push([]);
    else if (close) {
      const list = arrays.pop();
      (arrays.length ? arrays[arrays.length - 1] : operands).push(list);
    } else if (dictOpen || dictClose) throw new Error('rasterizePdf: inline dictionaries are not emitted');
    else if (number !== undefined) target.push(Number(number));
    else if (op !== undefined) {
      const handler = handlers[op];
      if (!handler) throw new Error(`rasterizePdf: unsupported operator ${op}`);
      if (TEXT_ONLY.has(op) && !inText) throw new Error(`rasterizePdf: ${op} outside BT/ET`);
      operators.add(op);
      handler(operands.splice(0));
    }
  }
  if (stack.length) throw new Error('rasterizePdf: unbalanced q');
  if (inText) throw new Error('rasterizePdf: BT without ET');
  return { width, height, data: raster.data, operators };
}

// ---------------------------------------------------------------------------
// PostScript (EPS) interpreter for the QRTurboEps subset

const MARK = Symbol('mark');

function ascii85Decode(text) {
  const out = [];
  let group = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/\s/.test(ch)) continue;
    if (ch === 'z') {
      if (group.length) throw new Error('ASCII85: z inside a group');
      out.push(0, 0, 0, 0);
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code < 33 || code > 117) throw new Error(`ASCII85: bad character ${JSON.stringify(ch)}`);
    group.push(code - 33);
    if (group.length === 5) {
      let value = 0;
      for (const digit of group) value = value * 85 + digit;
      out.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
      group = [];
    }
  }
  if (group.length === 1) throw new Error('ASCII85: dangling character');
  if (group.length) {
    const count = group.length - 1;
    while (group.length < 5) group.push(84);
    let value = 0;
    for (const digit of group) value = value * 85 + digit;
    const bytes = [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
    out.push(...bytes.slice(0, count));
  }
  return Buffer.from(out);
}

function runLengthDecode(bytes) {
  const out = [];
  let i = 0;
  while (i < bytes.length) {
    const length = bytes[i++];
    if (length === 128) return Buffer.from(out);
    if (length < 128) {
      for (let j = 0; j <= length; j++) out.push(bytes[i++]);
    } else {
      const value = bytes[i++];
      for (let j = 0; j < 257 - length; j++) out.push(value);
    }
  }
  throw new Error('RunLengthDecode: missing EOD');
}

class PsDict {
  constructor() {
    this.map = new Map();
    this.font = null;
  }
}

class PsScanner {
  constructor(text) {
    this.text = text;
    this.pos = 0;
  }

  skipSpace() {
    const { text } = this;
    while (this.pos < text.length) {
      const ch = text[this.pos];
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === '\f') this.pos += 1;
      else if (ch === '%') {
        while (this.pos < text.length && text[this.pos] !== '\n') this.pos += 1;
      } else break;
    }
  }

  regular() {
    const start = this.pos;
    while (this.pos < this.text.length && !/[\s()<>[\]{}/%]/.test(this.text[this.pos])) this.pos += 1;
    return this.text.slice(start, this.pos);
  }

  next() {
    this.skipSpace();
    const { text } = this;
    if (this.pos >= text.length) return null;
    const ch = text[this.pos];
    if (ch === '(') {
      const lexer = new PdfLexer(text, this.pos);
      const value = lexer.readLiteralString();
      this.pos = lexer.pos;
      return { str: value.bytes };
    }
    if (text.startsWith('<~', this.pos)) {
      const end = text.indexOf('~>', this.pos);
      const value = ascii85Decode(text.slice(this.pos + 2, end));
      this.pos = end + 2;
      return { str: value };
    }
    if (text.startsWith('<<', this.pos) || text.startsWith('>>', this.pos)) {
      this.pos += 2;
      return { exec: ch === '<' ? '<<' : '>>' };
    }
    if (ch === '<') {
      const end = text.indexOf('>', this.pos);
      const hex = text.slice(this.pos + 1, end).replace(/\s+/g, '');
      this.pos = end + 1;
      return { str: Buffer.from(hex.length % 2 ? hex + '0' : hex, 'hex') };
    }
    if (ch === '[' || ch === ']') {
      this.pos += 1;
      return { exec: ch };
    }
    if (ch === '{') {
      this.pos += 1;
      const items = [];
      for (;;) {
        this.skipSpace();
        if (text[this.pos] === '}') {
          this.pos += 1;
          return { proc: items };
        }
        const token = this.next();
        if (token == null) throw new Error('PS: unterminated procedure');
        items.push(token);
      }
    }
    if (ch === '}' || ch === ')' || ch === '>') throw new Error(`PS: unexpected ${ch} at ${this.pos}`);
    if (ch === '/') {
      this.pos += 1;
      return { lit: this.regular() };
    }
    const word = this.regular();
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(word)) return Number(word);
    return { exec: word };
  }
}

class PsFile {
  constructor(source, filterName) {
    this.source = source;
    this.filterName = filterName;
    this.bytes = null;
    this.pos = 0;
  }

  all() {
    if (!this.bytes) {
      if (this.filterName === 'ASCII85Decode' && this.source instanceof PsScanner) {
        const scanner = this.source;
        const end = scanner.text.indexOf('~>', scanner.pos);
        if (end < 0) throw new Error('PS: ASCII85 data without ~>');
        this.bytes = ascii85Decode(scanner.text.slice(scanner.pos, end));
        scanner.pos = end + 2;
      } else if (this.source instanceof PsFile) {
        const input = this.source.rest();
        if (this.filterName === 'FlateDecode') this.bytes = zlib.inflateSync(input);
        else if (this.filterName === 'RunLengthDecode') this.bytes = runLengthDecode(input);
        else if (this.filterName === 'ASCII85Decode') this.bytes = ascii85Decode(input.toString('latin1'));
        else throw new Error(`PS: unsupported filter ${this.filterName}`);
      } else {
        throw new Error(`PS: unsupported data source for ${this.filterName}`);
      }
    }
    return this.bytes;
  }

  rest() {
    const bytes = this.all();
    const out = bytes.subarray(this.pos);
    this.pos = bytes.length;
    return out;
  }

  read(count) {
    const bytes = this.all();
    if (this.pos + count > bytes.length) throw new Error('PS: image data ran out');
    const out = bytes.subarray(this.pos, this.pos + count);
    this.pos += count;
    return out;
  }
}

/**
 * Rasterizes a QRTurboEps file. Supports exactly the operators that the
 * writer emits; anything else throws. Returns { width, height, data,
 * operators, languageLevel, boundingBox }.
 */
function rasterizeEps(text, opts = {}) {
  const source = Buffer.isBuffer(text) ? text.toString('latin1') : String(text);
  const bbox = /^%%BoundingBox:\s*(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s*$/m.exec(source);
  if (!bbox) throw new Error('rasterizeEps: missing %%BoundingBox');
  const [llx, lly, urx, ury] = bbox.slice(1).map(Number);
  const level = /^%%LanguageLevel:\s*(\d)\s*$/m.exec(source);
  const pxPerPt = opts.pxPerPt || 4;
  const width = Math.ceil((urx - llx) * pxPerPt);
  const height = Math.ceil((ury - lly) * pxPerPt);
  const raster = new Raster(width, height, opts.background);
  const operators = new Counter();
  const helvetica = require(HELVETICA_PATH);
  const scanner = new PsScanner(source);
  const stack = [];
  const userdict = new PsDict();
  const dictStack = [userdict];
  const fonts = new Map();
  let state = {
    ctm: [pxPerPt, 0, 0, -pxPerPt, -llx * pxPerPt, ury * pxPerPt],
    fill: [0, 0, 0],
    space: 'DeviceGray',
    lineWidth: 1,
    clip: null,
    font: null
  };
  let path = new PathBuilder();
  const gstack = [];
  let pageShown = false;

  const pop = () => {
    if (!stack.length) throw new Error('PS: stack underflow');
    return stack.pop();
  };
  const popNumber = () => {
    const value = pop();
    if (typeof value !== 'number') throw new Error('PS: number expected');
    return value;
  };
  const key = value => {
    if (value && typeof value === 'object' && 'lit' in value) return value.lit;
    if (value && typeof value === 'object' && 'str' in value) return Buffer.from(value.str).toString('latin1');
    throw new Error('PS: bad dictionary key');
  };
  const nameOf = value => (value && typeof value === 'object' && 'lit' in value ? value.lit : null);
  const get = (dict, name) => (dict instanceof PsDict ? dict.map.get(name) : undefined);
  const numbers = list => list.map(value => {
    if (typeof value !== 'number') throw new Error('PS: number array expected');
    return value;
  });

  function toPlain(value) {
    if (value instanceof PsDict) {
      const out = {};
      for (const [k, v] of value.map) out[k] = toPlain(v);
      return out;
    }
    if (Array.isArray(value)) return value.map(toPlain);
    if (value && typeof value === 'object' && 'lit' in value) return '/' + value.lit;
    return value;
  }

  function moveTo(x, y) {
    path.moveTo(...apply(state.ctm, x, y));
  }

  function currentUser() {
    if (!path.point) throw new Error('PS: no current point');
    return apply(invert(state.ctm), path.point[0], path.point[1]);
  }

  function fontAdvance(font, bytes) {
    let units = 0;
    for (const byte of bytes) units += helvetica.WIDTHS[byte];
    const m = font.font.matrix;
    return [m[0] * units, m[1] * units];
  }

  function readImageDict(dict) {
    const plain = name => get(dict, name);
    const matrix = numbers(plain('ImageMatrix'));
    return { width: plain('Width'), height: plain('Height'), bpc: plain('BitsPerComponent'), decode: plain('Decode'), matrix, dict };
  }

  function image(maskOnly) {
    const dict = pop();
    if (!(dict instanceof PsDict)) throw new Error('PS: only the dictionary form of image is supported');
    const type = get(dict, 'ImageType');
    if (maskOnly) {
      const info = readImageDict(dict);
      if (type !== 1 || info.bpc !== 1) throw new Error('PS: imagemask needs ImageType 1 with 1 bit');
      const paintBit = info.decode && info.decode[0] === 1 ? 1 : 0;
      const rowBytes = Math.ceil(info.width / 8);
      const data = get(dict, 'DataSource').read(rowBytes * info.height);
      const color = state.fill;
      raster.image(state.ctm, info.matrix, info.width, info.height,
        (col, row) => (bitAt(data, rowBytes, col, row) === paintBit ? [color[0], color[1], color[2], 1] : null),
        state.clip);
      return;
    }
    const channels = state.space === 'DeviceRGB' ? 3 : (state.space === 'DeviceGray' ? 1 : 0);
    if (!channels) throw new Error(`PS: unsupported image color space ${state.space}`);
    const pixel = (data, i) => (channels === 1 ? [data[i], data[i], data[i]] : [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]]);
    if (type === 1) {
      const info = readImageDict(dict);
      if (info.bpc !== 8) throw new Error('PS: images need 8 bits');
      const data = get(dict, 'DataSource').read(info.width * info.height * channels);
      raster.image(state.ctm, info.matrix, info.width, info.height,
        (col, row) => [...pixel(data, row * info.width + col), 1], state.clip);
      return;
    }
    if (type === 3) {
      if (get(dict, 'InterleaveType') !== 2) throw new Error('PS: only InterleaveType 2');
      const dataInfo = readImageDict(get(dict, 'DataDict'));
      const maskInfo = readImageDict(get(dict, 'MaskDict'));
      if (dataInfo.bpc !== 8 || maskInfo.bpc !== 1) throw new Error('PS: type 3 image needs 8-bit data and a 1-bit mask');
      if (maskInfo.width !== dataInfo.width || maskInfo.height !== dataInfo.height) {
        throw new Error('PS: this rasterizer needs equal mask and data sizes');
      }
      const paintBit = maskInfo.decode && maskInfo.decode[0] === 1 ? 1 : 0;
      const cols = dataInfo.width;
      const rows = dataInfo.height;
      const maskRow = Math.ceil(cols / 8);
      const file = get(dataInfo.dict, 'DataSource');
      const mask = new Uint8Array(maskRow * rows);
      const data = new Uint8Array(cols * rows * channels);
      for (let row = 0; row < rows; row++) {
        mask.set(file.read(maskRow), row * maskRow);
        data.set(file.read(cols * channels), row * cols * channels);
      }
      raster.image(state.ctm, dataInfo.matrix, cols, rows, (col, row) => {
        if (bitAt(mask, maskRow, col, row) !== paintBit) return null;
        return [...pixel(data, row * cols + col), 1];
      }, state.clip);
      return;
    }
    throw new Error(`PS: unsupported ImageType ${type}`);
  }

  const ops = {
    pop: () => { pop(); },
    dup: () => { const v = pop(); stack.push(v, v); },
    exch: () => { const b = pop(); const a = pop(); stack.push(b, a); },
    index: () => {
      const n = popNumber();
      if (n < 0 || n >= stack.length) throw new Error('PS: index out of range');
      stack.push(stack[stack.length - 1 - n]);
    },
    add: () => { const b = popNumber(); stack.push(popNumber() + b); },
    sub: () => { const b = popNumber(); stack.push(popNumber() - b); },
    mul: () => { const b = popNumber(); stack.push(popNumber() * b); },
    div: () => { const b = popNumber(); stack.push(popNumber() / b); },
    neg: () => stack.push(-popNumber()),
    eq: () => { const b = pop(); const a = pop(); stack.push(JSON.stringify(toPlain(a)) === JSON.stringify(toPlain(b))); },
    ne: () => { const b = pop(); const a = pop(); stack.push(JSON.stringify(toPlain(a)) !== JSON.stringify(toPlain(b))); },
    true: () => stack.push(true),
    false: () => stack.push(false),
    exec: () => run(pop()),
    if: () => { const proc = pop(); if (pop() === true) run(proc); },
    ifelse: () => { const no = pop(); const yes = pop(); run(pop() === true ? yes : no); },
    forall: () => {
      const proc = pop();
      const container = pop();
      if (container instanceof PsDict) {
        for (const [k, v] of [...container.map]) {
          stack.push({ lit: k }, v);
          run(proc);
        }
      } else if (Array.isArray(container)) {
        for (const v of container) {
          stack.push(v);
          run(proc);
        }
      } else throw new Error('PS: forall needs a dict or an array');
    },
    bind: () => {},
    dict: () => { popNumber(); stack.push(new PsDict()); },
    begin: () => {
      const dict = pop();
      if (!(dict instanceof PsDict)) throw new Error('PS: begin needs a dict');
      dictStack.push(dict);
    },
    end: () => {
      if (dictStack.length <= 1) throw new Error('PS: dict stack underflow');
      dictStack.pop();
    },
    def: () => { const value = pop(); dictStack[dictStack.length - 1].map.set(key(pop()), value); },
    currentdict: () => stack.push(dictStack[dictStack.length - 1]),
    length: () => {
      const value = pop();
      if (value instanceof PsDict) stack.push(value.map.size);
      else if (Array.isArray(value)) stack.push(value.length);
      else if (value && value.str) stack.push(value.str.length);
      else throw new Error('PS: length needs a dict, array or string');
    },
    '[': () => stack.push(MARK),
    '<<': () => stack.push(MARK),
    ']': () => {
      const list = [];
      for (;;) {
        const value = pop();
        if (value === MARK) break;
        list.unshift(value);
      }
      stack.push(list);
    },
    '>>': () => {
      const list = [];
      for (;;) {
        const value = pop();
        if (value === MARK) break;
        list.unshift(value);
      }
      if (list.length % 2) throw new Error('PS: odd dictionary');
      const dict = new PsDict();
      for (let i = 0; i < list.length; i += 2) dict.map.set(key(list[i]), list[i + 1]);
      stack.push(dict);
    },
    gsave: () => gstack.push({ ...state }),
    grestore: () => {
      if (!gstack.length) throw new Error('PS: unbalanced grestore');
      state = gstack.pop();
    },
    translate: () => { const y = popNumber(); const x = popNumber(); state.ctm = concat([1, 0, 0, 1, x, y], state.ctm); },
    scale: () => { const y = popNumber(); const x = popNumber(); state.ctm = concat([x, 0, 0, y, 0, 0], state.ctm); },
    newpath: () => { path = new PathBuilder(); },
    moveto: () => { const y = popNumber(); moveTo(popNumber(), y); },
    lineto: () => { const y = popNumber(); path.lineTo(...apply(state.ctm, popNumber(), y)); },
    curveto: () => {
      const a = numbers(stack.splice(-6));
      if (a.length !== 6) throw new Error('PS: curveto needs 6 numbers');
      path.curveTo(...apply(state.ctm, a[0], a[1]), ...apply(state.ctm, a[2], a[3]), ...apply(state.ctm, a[4], a[5]));
    },
    closepath: () => path.close(),
    rmoveto: () => {
      const dy = popNumber();
      const dx = popNumber();
      const [x, y] = currentUser();
      moveTo(x + dx, y + dy);
    },
    fill: () => { raster.fill(path.subpaths, false, state.fill, state.clip); path = new PathBuilder(); },
    eofill: () => { raster.fill(path.subpaths, true, state.fill, state.clip); path = new PathBuilder(); },
    clip: () => { state.clip = raster.clipMask(path.subpaths, false, state.clip); },
    eoclip: () => { state.clip = raster.clipMask(path.subpaths, true, state.clip); },
    stroke: () => {
      const scale = Math.sqrt(Math.abs(state.ctm[0] * state.ctm[3] - state.ctm[1] * state.ctm[2]));
      raster.stroke(path.subpaths, state.lineWidth * scale, state.fill, state.clip);
      path = new PathBuilder();
    },
    setlinewidth: () => { state.lineWidth = popNumber(); },
    setrgbcolor: () => {
      const b = popNumber(); const g = popNumber(); const r = popNumber();
      state.fill = toRgb255('DeviceRGB', [r, g, b]);
      state.space = 'DeviceRGB';
    },
    setcmykcolor: () => {
      const k = popNumber(); const y = popNumber(); const m = popNumber(); const c = popNumber();
      state.fill = toRgb255('DeviceCMYK', [c, m, y, k]);
      state.space = 'DeviceCMYK';
    },
    setgray: () => { state.fill = toRgb255('DeviceGray', [popNumber()]); state.space = 'DeviceGray'; },
    setcolorspace: () => {
      const name = nameOf(pop());
      if (!['DeviceRGB', 'DeviceGray', 'DeviceCMYK'].includes(name)) throw new Error(`PS: unsupported color space ${name}`);
      state.space = name;
      state.fill = [0, 0, 0];
    },
    shfill: () => raster.shade(toPlain(pop()), state.ctm, state.clip),
    image: () => image(false),
    imagemask: () => image(true),
    findfont: () => {
      const name = nameOf(pop());
      if (fonts.has(name)) stack.push(fonts.get(name));
      else if (name === 'Helvetica-Bold') {
        const font = new PsDict();
        font.font = { base: name, matrix: [0.001, 0, 0, 0.001, 0, 0] };
        stack.push(font);
      } else throw new Error(`PS: unknown font ${name}`);
    },
    definefont: () => {
      const font = pop();
      const name = key(pop());
      if (!(font instanceof PsDict)) throw new Error('PS: definefont needs a dict');
      const encoding = get(font, 'Encoding');
      if (!Array.isArray(encoding) || encoding.length !== 256) throw new Error('PS: re-encoded font needs 256 names');
      font.font = { base: 'Helvetica-Bold', matrix: [0.001, 0, 0, 0.001, 0, 0], encoding: encoding.map(nameOf) };
      fonts.set(name, font);
      stack.push(font);
    },
    makefont: () => {
      const matrix = numbers(pop());
      const font = pop();
      if (!(font instanceof PsDict) || !font.font) throw new Error('PS: makefont needs a font');
      const made = new PsDict();
      made.map = font.map;
      made.font = { ...font.font, matrix: concat(font.font.matrix, matrix) };
      stack.push(made);
    },
    setfont: () => {
      const font = pop();
      if (!(font instanceof PsDict) || !font.font) throw new Error('PS: setfont needs a font');
      state.font = font;
    },
    stringwidth: () => {
      const value = pop();
      if (!state.font) throw new Error('PS: no current font');
      const [dx, dy] = fontAdvance(state.font, value.str);
      stack.push(dx, dy);
    },
    show: () => {
      const value = pop();
      if (!state.font) throw new Error('PS: no current font');
      const [dx, dy] = fontAdvance(state.font, value.str);
      const [x, y] = currentUser();
      moveTo(x + dx, y + dy);
    },
    currentfile: () => stack.push(scanner),
    filter: () => {
      const name = nameOf(pop());
      const sourceFile = pop();
      if (!(sourceFile instanceof PsScanner) && !(sourceFile instanceof PsFile)) throw new Error('PS: filter needs a file');
      stack.push(new PsFile(sourceFile, name));
    },
    flushfile: () => {
      const file = pop();
      if (!(file instanceof PsFile)) throw new Error('PS: flushfile needs a filter');
      file.rest();
    },
    showpage: () => { pageShown = true; }
  };

  function lookup(name) {
    for (let i = dictStack.length - 1; i >= 0; i--) {
      if (dictStack[i].map.has(name)) return { value: dictStack[i].map.get(name) };
    }
    if (Object.prototype.hasOwnProperty.call(ops, name)) return { op: ops[name] };
    return null;
  }

  function execName(name) {
    const found = lookup(name);
    if (!found) throw new Error(`rasterizeEps: unsupported operator ${name}`);
    if (found.op) {
      operators.add(name);
      found.op();
    } else if (found.value && found.value.proc) {
      operators.add(name);
      run(found.value);
    } else {
      stack.push(found.value);
    }
  }

  function run(proc) {
    if (!proc || !proc.proc) throw new Error('PS: exec needs a procedure');
    for (const token of proc.proc) {
      if (token && typeof token === 'object' && 'exec' in token) execName(token.exec);
      else stack.push(token);
    }
  }

  for (;;) {
    const token = scanner.next();
    if (token == null) break;
    if (typeof token === 'object' && 'exec' in token) execName(token.exec);
    else stack.push(token);
  }
  if (gstack.length) throw new Error('rasterizeEps: unbalanced gsave');
  if (dictStack.length !== 1) throw new Error('rasterizeEps: unbalanced begin/end');
  if (stack.length) throw new Error(`rasterizeEps: ${stack.length} objects left on the operand stack`);
  if (!pageShown) throw new Error('rasterizeEps: no showpage');
  return {
    width,
    height,
    data: raster.data,
    operators,
    languageLevel: level ? Number(level[1]) : null,
    boundingBox: [llx, lly, urx, ury]
  };
}

// ---------------------------------------------------------------------------
// Decoding and test drawings

function decodeQr(raster) {
  const jsQR = require('jsqr');
  const result = jsQR(new Uint8ClampedArray(raster.data), raster.width, raster.height, { inversionAttempts: 'attemptBoth' });
  return result ? result.data : null;
}

let qrLibrary = null;

/**
 * A QR matrix from the vendored qr-code-styling library (standard
 * orientation): { size, isDark(row, col) }.
 */
function qrMatrix(payload, ecl = 'M') {
  if (!qrLibrary) {
    const context = { console };
    context.self = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(repoRoot, 'Public/js/qr-code-styling.min.js'), 'utf8'), context);
    qrLibrary = context.QRCodeStyling;
  }
  const instance = new qrLibrary({ data: '', type: 'svg' });
  instance._setupSvg = () => {};
  instance._setupCanvas = () => {};
  // The library writes one byte per character, so pass UTF-8 as a byte
  // string, as the app does (encodeTextForQRCode).
  const bytes = Buffer.from(String(payload), 'utf8').toString('latin1');
  instance.update({ data: bytes, qrOptions: { typeNumber: 0, errorCorrectionLevel: ecl } });
  const qr = instance._qr;
  return { size: qr.getModuleCount(), isDark: (row, col) => qr.isDark(row, col) };
}

const KAPPA = 0.5522847498307936;

function rectSegments(x, y, w, h) {
  return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
}

function circleSegments(cx, cy, r) {
  const k = KAPPA * r;
  return [
    ['M', cx + r, cy],
    ['C', cx + r, cy + k, cx + k, cy + r, cx, cy + r],
    ['C', cx - k, cy + r, cx - r, cy + k, cx - r, cy],
    ['C', cx - r, cy - k, cx - k, cy - r, cx, cy - r],
    ['C', cx + k, cy - r, cx + r, cy - k, cx + r, cy],
    ['Z']
  ];
}

function roundedRectSegments(x, y, w, h, r) {
  const k = KAPPA * r;
  return [
    ['M', x + r, y],
    ['L', x + w - r, y],
    ['C', x + w - r + k, y, x + w, y + r - k, x + w, y + r],
    ['L', x + w, y + h - r],
    ['C', x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h],
    ['L', x + r, y + h],
    ['C', x + r - k, y + h, x, y + h - r + k, x, y + h - r],
    ['L', x, y + r],
    ['C', x, y + r - k, x + r - k, y, x + r, y],
    ['Z']
  ];
}

function mapSegments(segments, fn) {
  return segments.map(seg => {
    if (seg[0] === 'Z') return seg;
    const out = [seg[0]];
    for (let i = 1; i < seg.length; i += 2) out.push(...fn(seg[i], seg[i + 1]));
    return out;
  });
}

function solid(color) {
  return { type: 'solid', color };
}

/**
 * A Drawing of a real QR code, shaped like the flattener output.
 * opts: { ecl, unit = 10, quietZone = 4, dots: 'square'|'circle',
 *   paint (dark modules), background: [r, g, b] | null,
 *   logo: { pixels, size } | null, frame: { style: 'banner'|'outline',
 *   color, textColor, text?, mask? } | null }
 */
function qrTestDrawing(payload, opts = {}) {
  const ecl = opts.ecl || 'M';
  const unit = opts.unit || 10;
  const quiet = opts.quietZone == null ? 4 : opts.quietZone;
  const matrix = qrMatrix(payload, ecl);
  const n = matrix.size;
  const total = (n + 2 * quiet) * unit;
  const inFinder = (row, col) => (row < 7 && col < 7) || (row < 7 && col >= n - 7) || (row >= n - 7 && col < 7);
  const dark = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!matrix.isDark(row, col)) continue;
      const x = (col + quiet) * unit;
      const y = (row + quiet) * unit;
      if (opts.dots === 'circle' && !inFinder(row, col)) dark.push(...circleSegments(x + unit / 2, y + unit / 2, unit / 2));
      else dark.push(...rectSegments(x, y, unit, unit));
    }
  }
  const items = [];
  if (opts.background !== null) items.push({ kind: 'path', d: rectSegments(0, 0, total, total), fillRule: 'nonzero', paint: solid(opts.background || [1, 1, 1]) });
  items.push({ kind: 'path', d: dark, fillRule: 'nonzero', paint: opts.paint || solid([0, 0, 0]) });
  if (opts.logo) {
    const size = (opts.logo.size || 0.2) * total;
    items.push({ kind: 'image', x: (total - size) / 2, y: (total - size) / 2, width: size, height: size, href: 'data:image/png;base64,', pixels: opts.logo.pixels });
  }
  if (!opts.frame) return { width: total, height: total, items, moduleCount: n };

  const frame = opts.frame;
  const W = 1024;
  const pad = Math.round(W * 0.05);
  const band = Math.round(W * 0.16);
  const qrSize = W - 2 * pad - band;
  const qrX = Math.round((W - qrSize) / 2);
  const qrY = pad;
  const scale = qrSize / total;
  const inner = items.map(item => (item.kind === 'image'
    ? { ...item, x: qrX + item.x * scale, y: qrY + item.y * scale, width: item.width * scale, height: item.height * scale }
    : { ...item, d: mapSegments(item.d, (x, y) => [qrX + x * scale, qrY + y * scale]) }));
  const frameItems = [];
  const frameColor = frame.color || [0, 0, 0];
  if (frame.style === 'outline') {
    frameItems.push({ kind: 'path', d: roundedRectSegments(0, 0, W, W, 61), fillRule: 'nonzero', paint: solid([1, 1, 1]) });
    const stroke = 20;
    frameItems.push({ kind: 'stroke', d: roundedRectSegments(stroke / 2, stroke / 2, W - stroke, W - stroke, 51), lineWidth: stroke, paint: solid(frameColor) });
  } else {
    frameItems.push({
      kind: 'path',
      d: roundedRectSegments(0, 0, W, W, 61).concat(roundedRectSegments(qrX, qrY, qrSize, qrSize, 20)),
      fillRule: 'evenodd',
      paint: solid(frameColor)
    });
  }
  frameItems.push({ kind: 'group', clip: { d: roundedRectSegments(qrX, qrY, qrSize, qrSize, 20), fillRule: 'nonzero' }, items: inner });
  const labelY = qrY + qrSize + (pad + band) / 2 + band * 0.46 * 0.35;
  if (frame.mask) frameItems.push({ kind: 'mask', ...frame.mask, paint: solid(frame.textColor || [1, 1, 1]) });
  else {
    frameItems.push({
      kind: 'text',
      text: frame.text == null ? 'SCAN ME' : frame.text,
      x: W / 2,
      y: labelY,
      fontSize: Math.round(band * 0.46),
      maxWidth: qrSize,
      anchor: 'middle',
      paint: solid(frame.textColor || [1, 1, 1])
    });
  }
  return { width: W, height: W, items: frameItems, moduleCount: n };
}

/**
 * Test logo pixels: a filled disc on a transparent square (alpha 0 or 255),
 * or fully opaque when opaque is set.
 */
function testLogoPixels(size = 64, opts = {}) {
  const rgb = new Uint8Array(size * size * 3);
  const alpha = new Uint8Array(size * size);
  const color = opts.color || [220, 30, 60];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const inside = Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) <= size / 2 - 1;
      rgb.set(inside ? color : [255, 255, 255], i * 3);
      alpha[i] = opts.opaque || inside ? 255 : 0;
    }
  }
  return { width: size, height: size, rgb, alpha: opts.noAlpha ? null : alpha };
}

// ---------------------------------------------------------------------------
// Optional Ghostscript cross-check

function ghostscriptVersion() {
  try {
    const result = spawnSync('gs', ['--version'], { encoding: 'utf8', timeout: 10_000 });
    return result.status === 0 ? result.stdout.trim() : null;
  } catch (error) {
    return null;
  }
}

/**
 * Renders a PDF or EPS with Ghostscript (when installed) and returns RGBA.
 */
function rasterizeWithGhostscript(bytes, opts = {}) {
  const kind = opts.kind === 'eps' ? 'eps' : 'pdf';
  const dpi = opts.dpi || 288;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qrturbo-gs-'));
  try {
    const input = path.join(dir, `input.${kind}`);
    const output = path.join(dir, 'output.ppm');
    fs.writeFileSync(input, Buffer.from(bytes));
    const args = ['-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=ppmraw', `-r${dpi}`, `-sOutputFile=${output}`];
    if (kind === 'eps') args.push('-dEPSCrop');
    args.push(input);
    const result = spawnSync('gs', args, { encoding: 'utf8', timeout: 60_000 });
    if (result.status !== 0) throw new Error(`Ghostscript failed: ${result.stderr || result.stdout}`);
    const ppm = fs.readFileSync(output);
    const header = /^P6\s+(?:#[^\n]*\s+)*(\d+)\s+(\d+)\s+(\d+)\s/.exec(ppm.subarray(0, 512).toString('latin1'));
    if (!header) throw new Error('Ghostscript: unexpected output');
    const width = Number(header[1]);
    const height = Number(header[2]);
    const pixels = ppm.subarray(header[0].length);
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      data[i * 4] = pixels[i * 3];
      data[i * 4 + 1] = pixels[i * 3 + 1];
      data[i * 4 + 2] = pixels[i * 3 + 2];
      data[i * 4 + 3] = 255;
    }
    return { width, height, data };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Average RGB of a device rectangle, for color assertions.
 */
function sampleColor(raster, x, y, w = 1, h = 1) {
  const sum = [0, 0, 0];
  let count = 0;
  for (let row = Math.max(0, y); row < Math.min(raster.height, y + h); row++) {
    for (let col = Math.max(0, x); col < Math.min(raster.width, x + w); col++) {
      const i = (row * raster.width + col) * 4;
      sum[0] += raster.data[i];
      sum[1] += raster.data[i + 1];
      sum[2] += raster.data[i + 2];
      count += 1;
    }
  }
  return sum.map(value => Math.round(value / Math.max(1, count)));
}

module.exports = {
  parsePdf,
  rasterizePdf,
  rasterizeEps,
  decodeQr,
  qrMatrix,
  qrTestDrawing,
  testLogoPixels,
  rectSegments,
  circleSegments,
  roundedRectSegments,
  ascii85Decode,
  runLengthDecode,
  ghostscriptVersion,
  rasterizeWithGhostscript,
  sampleColor
};
