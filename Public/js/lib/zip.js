// QRTurbo.app - ZIP writer (QRTurboZip)
// Pure, loaded lazily on the first batch open. Writes STORE-only ZIP archives
// (APPNOTE 6.3): no compression, because PNG, JPEG, WebP and PDF are already
// compressed, and no data descriptor, because sizes and CRCs are known before
// each entry is written. Non-ASCII names are UTF-8 with flag bit 11. Times are
// MS-DOS local time. No ZIP64: at most 65535 entries and 4 GiB.
(function () {
    'use strict';

    const LOCAL_SIGNATURE = 0x04034b50;
    const CENTRAL_SIGNATURE = 0x02014b50;
    const END_SIGNATURE = 0x06054b50;
    const LOCAL_HEADER_SIZE = 30;
    const CENTRAL_HEADER_SIZE = 46;
    const END_RECORD_SIZE = 22;
    const VERSION_NEEDED = 20;
    const VERSION_MADE_BY = 0x0314; // UNIX, specification 2.0
    const FLAG_UTF8 = 0x0800;
    const METHOD_STORE = 0;
    const EXTERNAL_ATTRIBUTES = 0x81a40000; // regular file, mode 0644
    const MAX_ENTRIES = 0xffff;
    const MAX_U32 = 0xffffffff;
    const MAX_NAME_BYTES = 0xffff;
    const MIME = 'application/zip';

    function crc32(bytes) {
        const lib = globalThis.QRTurboBytes;
        if (!lib || typeof lib.crc32 !== 'function') throw new Error('QRTurboZip needs QRTurboBytes.crc32');
        return lib.crc32(bytes) >>> 0;
    }

    function utf8(text) {
        const lib = globalThis.QRTurboBytes;
        if (lib && typeof lib.utf8 === 'function') return lib.utf8(text);
        return new TextEncoder().encode(text);
    }

    function toBytes(data) {
        if (data instanceof Uint8Array) return data;
        if (typeof data === 'string') return utf8(data);
        if (data instanceof ArrayBuffer) return new Uint8Array(data);
        if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        throw new TypeError('ZIP entry data must be bytes or a string');
    }

    /**
     * @description MS-DOS time and date fields in local time:
     * time = hour << 11 | minute << 5 | second / 2,
     * date = (year - 1980) << 9 | month << 5 | day.
     * Dates outside 1980-2107 are clamped to the nearest valid value.
     */
    function dosDateTime(value) {
        const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
        const year = date.getFullYear();
        if (year < 1980) return { time: 0, date: (1 << 5) | 1 };
        if (year > 2107) return { time: (23 << 11) | (59 << 5) | 29, date: (127 << 9) | (12 << 5) | 31 };
        return {
            time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
            date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
        };
    }

    function localHeader(entry) {
        const out = new Uint8Array(LOCAL_HEADER_SIZE + entry.name.length);
        const view = new DataView(out.buffer);
        view.setUint32(0, LOCAL_SIGNATURE, true);
        view.setUint16(4, VERSION_NEEDED, true);
        view.setUint16(6, entry.flags, true);
        view.setUint16(8, METHOD_STORE, true);
        view.setUint16(10, entry.time, true);
        view.setUint16(12, entry.date, true);
        view.setUint32(14, entry.crc, true);
        view.setUint32(18, entry.size, true);
        view.setUint32(22, entry.size, true);
        view.setUint16(26, entry.name.length, true);
        view.setUint16(28, 0, true);
        out.set(entry.name, LOCAL_HEADER_SIZE);
        return out;
    }

    function centralHeader(entry) {
        const out = new Uint8Array(CENTRAL_HEADER_SIZE + entry.name.length);
        const view = new DataView(out.buffer);
        view.setUint32(0, CENTRAL_SIGNATURE, true);
        view.setUint16(4, VERSION_MADE_BY, true);
        view.setUint16(6, VERSION_NEEDED, true);
        view.setUint16(8, entry.flags, true);
        view.setUint16(10, METHOD_STORE, true);
        view.setUint16(12, entry.time, true);
        view.setUint16(14, entry.date, true);
        view.setUint32(16, entry.crc, true);
        view.setUint32(20, entry.size, true);
        view.setUint32(24, entry.size, true);
        view.setUint16(28, entry.name.length, true);
        view.setUint16(30, 0, true);
        view.setUint16(32, 0, true);
        view.setUint16(34, 0, true);
        view.setUint16(36, 0, true);
        view.setUint32(38, EXTERNAL_ATTRIBUTES, true);
        view.setUint32(42, entry.offset, true);
        out.set(entry.name, CENTRAL_HEADER_SIZE);
        return out;
    }

    function endRecord(count, directorySize, directoryOffset) {
        const out = new Uint8Array(END_RECORD_SIZE);
        const view = new DataView(out.buffer);
        view.setUint32(0, END_SIGNATURE, true);
        view.setUint16(4, 0, true);
        view.setUint16(6, 0, true);
        view.setUint16(8, count, true);
        view.setUint16(10, count, true);
        view.setUint32(12, directorySize, true);
        view.setUint32(16, directoryOffset, true);
        view.setUint16(20, 0, true);
        return out;
    }

    function concat(parts) {
        const total = parts.reduce((sum, part) => sum + part.length, 0);
        const out = new Uint8Array(total);
        let offset = 0;
        parts.forEach(part => {
            out.set(part, offset);
            offset += part.length;
        });
        return out;
    }

    /**
     * @description An incremental ZIP writer. add(name, data, date?) appends
     * one stored entry (data: bytes or a string, written as UTF-8). With
     * o.blobParts, each entry is moved into a Blob as soon as it is added,
     * so large batches do not stay in the JavaScript heap; such a writer can
     * only finish with toBlob(). toBytes() and toBlob() write the central
     * directory and the end record and may be called more than once.
     */
    function writer(o) {
        const options = o && typeof o === 'object' ? o : {};
        const useBlobs = Boolean(options.blobParts) && typeof Blob === 'function';
        const parts = [];
        const entries = [];
        let offset = 0;

        function add(name, data, date) {
            if (typeof name !== 'string' || !name) throw new TypeError('A ZIP entry needs a name');
            if (entries.length >= MAX_ENTRIES) throw new RangeError('A ZIP archive holds at most 65535 entries');
            const nameBytes = utf8(name);
            if (nameBytes.length > MAX_NAME_BYTES) throw new RangeError('The ZIP entry name is too long');
            const bytes = toBytes(data);
            const stamp = dosDateTime(date || options.date);
            const entry = {
                name: nameBytes,
                flags: nameBytes.some(byte => byte > 0x7f) ? FLAG_UTF8 : 0,
                time: stamp.time,
                date: stamp.date,
                crc: crc32(bytes),
                size: bytes.length,
                offset
            };
            const header = localHeader(entry);
            if (offset + header.length + bytes.length > MAX_U32) throw new RangeError('The ZIP archive would exceed 4 GiB');

            if (useBlobs) {
                parts.push(new Blob([header, bytes]));
            } else {
                parts.push(header, bytes);
            }
            entries.push(entry);
            offset += header.length + bytes.length;
        }

        function directory() {
            const headers = entries.map(centralHeader);
            const size = headers.reduce((sum, header) => sum + header.length, 0);
            if (offset + size + END_RECORD_SIZE > MAX_U32) throw new RangeError('The ZIP archive would exceed 4 GiB');
            return [...headers, endRecord(entries.length, size, offset)];
        }

        function toBytesOut() {
            if (useBlobs) throw new Error('This ZIP writer keeps its entries in Blobs; use toBlob()');
            return concat([...parts, ...directory()]);
        }

        function toBlob(type) {
            if (typeof Blob !== 'function') throw new Error('Blob is not available');
            return new Blob([...parts, ...directory()], { type: type || MIME });
        }

        return Object.freeze({
            add,
            count: () => entries.length,
            size: () => offset,
            toBytes: toBytesOut,
            toBlob
        });
    }

    /**
     * @description Writes a whole archive from [{ name, data, date? }] and
     * returns its bytes. o.date is the default time stamp.
     */
    function create(entries, o) {
        const zip = writer({ date: o && o.date });
        (Array.isArray(entries) ? entries : []).forEach(entry => zip.add(entry.name, entry.data, entry.date));
        return zip.toBytes();
    }

    /**
     * @description Like create(), but returns a Blob of type application/zip.
     */
    function createBlob(entries, o) {
        const zip = writer({ date: o && o.date, blobParts: true });
        (Array.isArray(entries) ? entries : []).forEach(entry => zip.add(entry.name, entry.data, entry.date));
        return zip.toBlob();
    }

    const api = {
        MIME,
        create,
        createBlob,
        writer,
        dosDateTime
    };

    globalThis.QRTurboZip = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
