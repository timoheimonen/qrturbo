const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppHarness } = require('../helpers/app-vm');

const FRAME_STYLES = ['banner-bottom', 'banner-top', 'outline'];

function contains(outer, inner) {
  return inner.x >= 0 && inner.y >= 0
    && inner.x + inner.size <= outer.width
    && inner.y + inner.size <= outer.height;
}

test('unframed layouts keep the QR code at the full selected size', () => {
  const app = createAppHarness();

  for (const style of ['none', 'unknown', undefined]) {
    const layout = app.context.getFrameLayout(1024, style);
    assert.equal(layout.framed, false);
    assert.equal(layout.width, 1024);
    assert.equal(layout.height, 1024);
    assert.deepEqual({ ...layout.qr }, { x: 0, y: 0, size: 1024 });
  }
});

test('framed layouts fit the QR code and label inside the square output', () => {
  const app = createAppHarness();

  for (const size of [512, 1024, 2048, 4096]) {
    for (const style of FRAME_STYLES) {
      const layout = app.context.getFrameLayout(size, style);
      const label = `${style} at ${size}px`;

      assert.equal(layout.framed, true, label);
      assert.equal(layout.width, size, label);
      assert.equal(layout.height, size, label);
      assert.ok(contains(layout, layout.qr), label);
      assert.ok(layout.qr.size >= size * 0.7, `${label} keeps the QR code large`);
      assert.ok(Number.isInteger(layout.qr.size) && Number.isInteger(layout.qr.x), label);

      // The label sits entirely outside the QR code, above or below it.
      const labelTop = layout.label.centerY - (layout.label.fontSize / 2);
      const labelBottom = layout.label.centerY + (layout.label.fontSize / 2);
      const qrBottom = layout.qr.y + layout.qr.size;
      assert.ok(labelBottom <= layout.qr.y || labelTop >= qrBottom, label);
      assert.ok(labelTop >= 0 && labelBottom <= size, label);
    }
  }

  assert.ok(app.context.getFrameLayout(1024, 'banner-top').qr.y > app.context.getFrameLayout(1024, 'banner-bottom').qr.y);
});

test('frame labels shrink to fit the QR code width', () => {
  const app = createAppHarness();
  const measure = (text, fontSize) => text.length * fontSize * 0.6;

  assert.equal(app.context.fitFrameFontSize('SCAN ME', 80, 700, measure), 80);
  const shrunk = app.context.fitFrameFontSize('Follow us on Instagram today', 80, 700, measure);
  assert.ok(shrunk < 80);
  assert.ok(measure('Follow us on Instagram today', shrunk) <= 700);
});

test('framed SVG nests the QR vector and escapes the label text', () => {
  const app = createAppHarness();
  const layout = app.context.getFrameLayout(1000, 'banner-bottom');
  const qrSvg = '<?xml version="1.0" standalone="no"?>\r\n'
    + `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.qr.size}" height="${layout.qr.size}"><rect width="10" height="10"/></svg>`;

  const svg = app.context.buildFramedSvg(qrSvg, layout, {
    text: '<Scan> & "win"',
    fontSize: 60,
    colors: { frame: '#102a43', text: '#ffffff', card: '#ffffff' }
  });

  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]* width="1000" height="1000" viewBox="0 0 1000 1000">/);
  assert.doesNotMatch(svg, /<\?xml/);
  assert.match(
    svg,
    new RegExp(`<svg xmlns="http://www.w3.org/2000/svg" x="${layout.qr.x}" y="${layout.qr.y}" width="${layout.qr.size}" height="${layout.qr.size}" viewBox="0 0 ${layout.qr.size} ${layout.qr.size}"><rect`)
  );
  assert.match(svg, /fill="#102a43" fill-rule="evenodd"/);
  assert.match(svg, /&lt;Scan&gt; &amp; &quot;win&quot;<\/text>/);
  assert.doesNotMatch(svg, /<Scan>/);
});

test('outline frames draw a stroked border and skip the card on transparent backgrounds', () => {
  const app = createAppHarness();
  const layout = app.context.getFrameLayout(512, 'outline');
  const qrSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
  const options = { text: 'SCAN ME', fontSize: 30, colors: { frame: '#2563eb', text: '#2563eb', card: null } };

  const svg = app.context.buildFramedSvg(qrSvg, layout, options);
  assert.match(svg, /fill="none" stroke="#2563eb"/);
  assert.doesNotMatch(svg, /fill-rule="evenodd"/);
  assert.equal((svg.match(/<path fill="#/g) || []).length, 0);

  const withCard = app.context.buildFramedSvg(qrSvg, layout, { ...options, colors: { ...options.colors, card: '#ffffff' } });
  assert.match(withCard, /<path fill="#ffffff"/);
});

test('label text color stays readable on light and dark frames', () => {
  const app = createAppHarness();

  assert.equal(app.context.getReadableTextColor('#000000'), '#ffffff');
  assert.equal(app.context.getReadableTextColor('#2563eb'), '#ffffff');
  assert.equal(app.context.getReadableTextColor('#ffd400'), '#000000');
  assert.equal(app.context.getReadableTextColor('#ffffff'), '#000000');
});
