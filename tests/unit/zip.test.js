const assert = require('node:assert/strict');
const test = require('node:test');
const zlib = require('node:zlib');

require('../../Public/js/lib/bytes.js');
const Zip = require('../../Public/js/lib/zip.js');
const Csv = require('../../Public/js/lib/csv.js');

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const END_SIGNATURE = 0x06054b50;

/**
 * Reads a STORE-only archive the way unzip tools do: the end record, then the
 * central directory, then each local header it points at.
 */
function readZip(input) {
  const buffer = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 0xffff); i -= 1) {
    if (buffer.readUInt32LE(i) === END_SIGNATURE) {
      end = i;
      break;
    }
  }
  assert.ok(end >= 0, 'end of central directory record not found');
  assert.equal(end + 22, buffer.length, 'nothing may follow the end record');

  const record = {
    disk: buffer.readUInt16LE(end + 4),
    directoryDisk: buffer.readUInt16LE(end + 6),
    diskEntries: buffer.readUInt16LE(end + 8),
    totalEntries: buffer.readUInt16LE(end + 10),
    directorySize: buffer.readUInt32LE(end + 12),
    directoryOffset: buffer.readUInt32LE(end + 16),
    commentLength: buffer.readUInt16LE(end + 20)
  };
  assert.equal(record.directoryOffset + record.directorySize, end, 'central directory must end at the end record');

  const entries = [];
  let at = record.directoryOffset;
  for (let n = 0; n < record.totalEntries; n += 1) {
    assert.equal(buffer.readUInt32LE(at), CENTRAL_SIGNATURE, `central header ${n} signature`);
    const nameLength = buffer.readUInt16LE(at + 28);
    const extraLength = buffer.readUInt16LE(at + 30);
    const commentLength = buffer.readUInt16LE(at + 32);
    const entry = {
      madeBy: buffer.readUInt16LE(at + 4),
      needed: buffer.readUInt16LE(at + 6),
      flags: buffer.readUInt16LE(at + 8),
      method: buffer.readUInt16LE(at + 10),
      time: buffer.readUInt16LE(at + 12),
      date: buffer.readUInt16LE(at + 14),
      crc: buffer.readUInt32LE(at + 16),
      compressedSize: buffer.readUInt32LE(at + 20),
      size: buffer.readUInt32LE(at + 24),
      diskStart: buffer.readUInt16LE(at + 34),
      internal: buffer.readUInt16LE(at + 36),
      external: buffer.readUInt32LE(at + 38),
      offset: buffer.readUInt32LE(at + 42),
      nameBytes: buffer.subarray(at + 46, at + 46 + nameLength),
      extraLength,
      commentLength
    };
    entry.name = entry.nameBytes.toString(entry.flags & 0x0800 ? 'utf8' : 'latin1');

    const local = entry.offset;
    assert.equal(buffer.readUInt32LE(local), LOCAL_SIGNATURE, `local header signature of ${entry.name}`);
    const localNameLength = buffer.readUInt16LE(local + 26);
    const localExtraLength = buffer.readUInt16LE(local + 28);
    entry.local = {
      needed: buffer.readUInt16LE(local + 4),
      flags: buffer.readUInt16LE(local + 6),
      method: buffer.readUInt16LE(local + 8),
      time: buffer.readUInt16LE(local + 10),
      date: buffer.readUInt16LE(local + 12),
      crc: buffer.readUInt32LE(local + 14),
      compressedSize: buffer.readUInt32LE(local + 18),
      size: buffer.readUInt32LE(local + 22),
      nameBytes: buffer.subarray(local + 30, local + 30 + localNameLength),
      extraLength: localExtraLength
    };
    const dataStart = local + 30 + localNameLength + localExtraLength;
    entry.data = buffer.subarray(dataStart, dataStart + entry.compressedSize);
    entry.dataEnd = dataStart + entry.compressedSize;
    entries.push(entry);
    at += 46 + nameLength + extraLength + commentLength;
  }
  assert.equal(at, end, 'central directory size matches its entries');
  return { record, entries };
}

const fixedDate = new Date(2026, 9, 22, 14, 30, 8);

test('dosDateTime packs local time and clamps to the DOS range', () => {
  assert.deepEqual(Zip.dosDateTime(fixedDate), {
    time: (14 << 11) | (30 << 5) | 4,
    date: ((2026 - 1980) << 9) | (10 << 5) | 22
  });
  assert.equal(Zip.dosDateTime(fixedDate).time, 0x73c4);
  assert.equal(Zip.dosDateTime(new Date(2026, 0, 1, 0, 0, 59)).time, 29);
  assert.deepEqual(Zip.dosDateTime(new Date(1970, 0, 1)), { time: 0, date: (1 << 5) | 1 });
  assert.equal(Zip.dosDateTime(new Date(2200, 0, 1)).date >> 9, 127);
});

test('a central-directory reader finds every entry with matching names, offsets and CRCs', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4, 5]);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>', 'utf8');
  const empty = new Uint8Array(0);
  const bytes = Zip.create([
    { name: 'row-1.png', data: png },
    { name: 'Jääskeläinen.svg', data: svg },
    { name: 'empty.txt', data: empty },
    { name: 'manifest.csv', data: 'file,row\r\n' }
  ], { date: fixedDate });

  const { record, entries } = readZip(bytes);
  assert.equal(record.disk, 0);
  assert.equal(record.directoryDisk, 0);
  assert.equal(record.diskEntries, 4);
  assert.equal(record.totalEntries, 4);
  assert.equal(record.commentLength, 0);
  assert.deepEqual(entries.map(entry => entry.name), ['row-1.png', 'Jääskeläinen.svg', 'empty.txt', 'manifest.csv']);

  const expected = [png, svg, Buffer.alloc(0), Buffer.from('file,row\r\n')];
  let offset = 0;
  entries.forEach((entry, index) => {
    assert.equal(entry.offset, offset, `${entry.name} local header offset`);
    assert.deepEqual(Buffer.from(entry.data), expected[index]);
    assert.equal(entry.crc, zlib.crc32(expected[index]), `${entry.name} CRC`);
    assert.equal(entry.local.crc, entry.crc);
    assert.equal(entry.size, expected[index].length);
    assert.equal(entry.compressedSize, entry.size);
    assert.equal(entry.local.size, entry.size);
    assert.equal(entry.local.compressedSize, entry.size);
    assert.equal(entry.method, 0);
    assert.equal(entry.local.method, 0);
    assert.equal(entry.madeBy, 0x0314);
    assert.equal(entry.needed, 20);
    assert.equal(entry.local.needed, 20);
    assert.equal(entry.external, 0x81a40000);
    assert.equal(entry.internal, 0);
    assert.equal(entry.diskStart, 0);
    assert.equal(entry.extraLength, 0);
    assert.equal(entry.local.extraLength, 0);
    assert.equal(entry.commentLength, 0);
    assert.deepEqual(Buffer.from(entry.local.nameBytes), Buffer.from(entry.nameBytes));
    assert.equal(entry.time, 0x73c4);
    assert.equal(entry.local.time, entry.time);
    assert.equal(entry.local.date, entry.date);
    assert.equal(entry.flags & 0x0008, 0, 'no data descriptor');
    offset = entry.dataEnd;
  });
  assert.equal(record.directoryOffset, offset);
});

test('the UTF-8 name flag is set exactly for names outside ASCII', () => {
  const { entries } = readZip(Zip.create([
    { name: 'plain-ascii.png', data: new Uint8Array([1]) },
    { name: 'Jääskeläinen.png', data: new Uint8Array([2]) },
    { name: '東京.png', data: new Uint8Array([3]) },
    { name: '😀.png', data: new Uint8Array([4]) }
  ]));
  assert.deepEqual(entries.map(entry => entry.flags), [0, 0x0800, 0x0800, 0x0800]);
  assert.deepEqual(entries.map(entry => entry.local.flags), [0, 0x0800, 0x0800, 0x0800]);
  assert.deepEqual(entries.map(entry => entry.name), ['plain-ascii.png', 'Jääskeläinen.png', '東京.png', '😀.png']);
  assert.deepEqual(entries[2].nameBytes, Buffer.from('東京.png', 'utf8'));
});

test('an empty archive is only the end record', () => {
  const bytes = Zip.create([]);
  assert.equal(bytes.length, 22);
  const { record, entries } = readZip(bytes);
  assert.equal(record.totalEntries, 0);
  assert.equal(record.directoryOffset, 0);
  assert.equal(entries.length, 0);
});

test('createBlob and the Blob writer give the same bytes as create', async () => {
  const entries = [
    { name: 'a.png', data: new Uint8Array([1, 2, 3]) },
    { name: 'ö.svg', data: '<svg/>' }
  ];
  const bytes = Zip.create(entries, { date: fixedDate });
  const blob = Zip.createBlob(entries, { date: fixedDate });
  assert.equal(blob.type, 'application/zip');
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), bytes);

  const writer = Zip.writer({ blobParts: true, date: fixedDate });
  entries.forEach(entry => writer.add(entry.name, entry.data));
  assert.equal(writer.count(), 2);
  assert.throws(() => writer.toBytes(), /toBlob/);
  assert.deepEqual(new Uint8Array(await writer.toBlob().arrayBuffer()), bytes);
});

test('the writer accepts ArrayBuffers and typed-array views and reports its size', () => {
  const backing = new Uint8Array([9, 9, 1, 2, 3, 9]);
  const writer = Zip.writer({ date: fixedDate });
  writer.add('view.bin', backing.subarray(2, 5));
  writer.add('buffer.bin', new Uint8Array([7, 8]).buffer);
  assert.equal(writer.size(), (30 + 8 + 3) + (30 + 10 + 2));
  const { entries } = readZip(writer.toBytes());
  assert.deepEqual([...entries[0].data], [1, 2, 3]);
  assert.deepEqual([...entries[1].data], [7, 8]);
});

test('the writer rejects missing names and unsupported data', () => {
  const writer = Zip.writer();
  assert.throws(() => writer.add('', new Uint8Array(1)), TypeError);
  assert.throws(() => writer.add('x.bin', 42), TypeError);
  assert.throws(() => writer.add('x'.repeat(70000), new Uint8Array(1)), RangeError);
});

test('a batch-shaped archive with a manifest round-trips through the reader and the CSV parser', () => {
  const names = Csv.filenames(['Anna', 'anna', ''], { numbers: [2, 3, 4] });
  const files = names.map((name, index) => ({ name: `${name}.png`, data: new Uint8Array([index]) }));
  const manifest = Csv.stringify([
    ['file', 'row', 'status', 'version', 'modules', 'scan', 'error'],
    ...files.map((file, index) => [file.name, index + 2, 'ok', 2, 25, 'pass', '']),
    ['', 5, 'skipped', '', '', '', '=bad']
  ], { bom: true });
  const { entries } = readZip(Zip.create([...files, { name: 'manifest.csv', data: manifest }]));
  assert.deepEqual(entries.map(entry => entry.name), ['Anna.png', 'anna-2.png', 'row-4.png', 'manifest.csv']);

  const text = entries[3].data.toString('utf8');
  assert.ok(text.startsWith('\uFEFFfile,row,status,version,modules,scan,error\r\n'));
  const rows = Csv.parse(text).rows;
  assert.deepEqual(rows[1], ['Anna.png', '2', 'ok', '2', '25', 'pass', '']);
  assert.deepEqual(rows[4], ['', '5', 'skipped', '', '', '', "'=bad"]);
});
