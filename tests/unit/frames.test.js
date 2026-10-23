const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');

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

test('label text color takes the higher WCAG contrast, also on bright greens', () => {
  const app = createAppHarness();
  const Color = app.context.QRTurboColor;
  const dark = ['#000000', '#333333', '#2563eb', '#b00020', '#102a43'];
  const light = ['#00ff00', '#22dd22', '#00c853', '#00b000', '#808080', '#ff00ff', '#ffd400', '#ffffff'];

  for (const color of dark) assert.equal(app.context.getReadableTextColor(color), '#ffffff', color);
  for (const color of light) assert.equal(app.context.getReadableTextColor(color), '#000000', color);
  for (const color of [...dark, ...light]) {
    const text = app.context.getReadableTextColor(color);
    const other = text === '#000000' ? '#ffffff' : '#000000';
    assert.ok(Color.contrastRatio(color, text) >= Color.contrastRatio(color, other), color);
    assert.equal(app.context.isLightColor(color), text === '#000000', color);
  }

  const layout = app.context.getFrameLayout(1024, 'banner-bottom');
  const colors = app.context.getFrameColors(layout, { frameColor: '#00ff00', bgColor: '#ffffff', transparentBackground: false });
  assert.equal(colors.text, '#000000', 'a bright green banner gets a black label');
  assert.ok(Color.contrastRatio(colors.frame, colors.text) > 15);
});

test('label text color falls back to the brightness rule without QRTurboColor', () => {
  const frame = require('../../Public/js/frame.js');
  assert.equal(globalThis.QRTurboColor, undefined);
  assert.equal(frame.getReadableTextColor('#ffd400'), '#000000');
  assert.equal(frame.getReadableTextColor('#2563eb'), '#ffffff');
  assert.equal(frame.isLightColor('#ffffff'), true);
  assert.equal(frame.isLightColor('#000000'), false);
});

test('framed SVG takes the nested viewBox from the inner width and height', () => {
  const app = createAppHarness();
  const layout = app.context.getFrameLayout(1024, 'banner-top');
  const options = { text: 'SCAN ME', fontSize: 40, colors: { frame: '#000000', text: '#ffffff', card: '#ffffff' } };

  const unitSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="330" height="330"><rect width="10" height="10"/></svg>';
  const svg = app.context.buildFramedSvg(unitSvg, layout, options);
  assert.match(
    svg,
    new RegExp(`<svg xmlns="http://www.w3.org/2000/svg" x="${layout.qr.x}" y="${layout.qr.y}" width="${layout.qr.size}" height="${layout.qr.size}" viewBox="0 0 330 330">`)
  );

  const pxSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="250px" height="250px"></svg>';
  assert.match(app.context.buildFramedSvg(pxSvg, layout, options), /viewBox="0 0 250 250"/);

  const noSize = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  assert.match(app.context.buildFramedSvg(noSize, layout, options), new RegExp(`viewBox="0 0 ${layout.qr.size} ${layout.qr.size}"`));
});

test('framed SVG labels carry their maximum width and the Helvetica-compatible font stack', () => {
  const app = createAppHarness();
  const FRAME_FONT_FAMILY = vm.runInContext('FRAME_FONT_FAMILY', app.context);
  const layout = app.context.getFrameLayout(1024, 'banner-bottom');
  const svg = app.context.buildFramedSvg('<svg xmlns="http://www.w3.org/2000/svg" width="330" height="330"></svg>', layout, {
    text: 'SCAN ME',
    fontSize: 60,
    colors: { frame: '#000000', text: '#ffffff', card: null }
  });

  assert.match(FRAME_FONT_FAMILY, /^'Helvetica Neue', Helvetica, Arial, /);
  assert.match(svg, new RegExp(`<text [^>]*data-max-width="${layout.label.maxWidth}"`));
  assert.match(svg, /font-family="&apos;Helvetica Neue&apos;, Helvetica, Arial, &apos;Liberation Sans&apos;, Arimo, system-ui, sans-serif"/);
  assert.match(svg, /font-weight="700" font-size="60"/);
  assert.equal(app.context.getFrameFont(30), `700 30px ${FRAME_FONT_FAMILY}`);
});

test('frame text and colors come from the design passed in', () => {
  const app = createAppHarness();
  const layout = app.context.getFrameLayout(1024, 'banner-bottom');
  const outline = app.context.getFrameLayout(1024, 'outline');

  assert.equal(app.context.getFrameText({ frameText: '  Menu  ' }), 'Menu');
  assert.equal(app.context.getFrameText({ frameText: 'x'.repeat(40) }).length, vm.runInContext('FRAME_TEXT_MAX_LENGTH', app.context));
  assert.equal(app.context.getFrameText({ frameText: '   ' }), 'frame.defaultText');
  assert.equal(app.context.getFrameText(null), 'frame.defaultText');

  const design = { frameColor: '#ffd400', bgColor: '#102a43', transparentBackground: false };
  assert.deepEqual({ ...app.context.getFrameColors(layout, design) }, { frame: '#ffd400', text: '#000000', card: '#102a43' });
  assert.deepEqual(
    { ...app.context.getFrameColors(outline, { ...design, transparentBackground: true }) },
    { frame: '#ffd400', text: '#ffd400', card: null }
  );
});

test('frame text never carries characters that XML cannot hold', () => {
  const app = createAppHarness();
  const max = vm.runInContext('FRAME_TEXT_MAX_LENGTH', app.context);

  assert.equal(app.context.getFrameText({ frameText: 'Scan\u0000me\u0007\u001f now￿' }), 'Scan me   now');
  assert.equal(app.context.getFrameText({ frameText: 'lone \ud800 high and \udc00 low' }), 'lone  high and  low');
  assert.equal(app.context.getFrameText({ frameText: '\u0001\u0002' }), 'frame.defaultText');

  // The cap never splits an emoji into a lone surrogate.
  const capped = app.context.getFrameText({ frameText: `${'a'.repeat(max - 1)}😀` });
  assert.equal(capped, 'a'.repeat(max - 1));
  assert.equal(app.context.getFrameText({ frameText: `${'a'.repeat(max - 2)}😀` }), `${'a'.repeat(max - 2)}😀`);

  const layout = app.context.getFrameLayout(1024, 'banner-bottom');
  const svg = app.context.buildFramedSvg('<svg xmlns="http://www.w3.org/2000/svg" width="330" height="330"></svg>', layout, {
    text: app.context.getFrameText({ frameText: 'A & B <C>\u0008' }),
    fontSize: 60,
    colors: { frame: '#000000', text: '#ffffff', card: null }
  });
  assert.match(svg, />A &amp; B &lt;C&gt;<\/text>/);
});
