const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const QRTurboSvg = require('../../Public/js/lib/svg.js');
const frame = require('../../Public/js/frame.js');

const fixtureDir = path.join(__dirname, '../fixtures/library-svg');
const fixtures = fs.readdirSync(fixtureDir)
  .filter(name => name.endsWith('.svg'))
  .sort()
  .map(name => ({ name, markup: fs.readFileSync(path.join(fixtureDir, name), 'utf8') }));

function walk(node, visit) {
  visit(node);
  for (const child of node.children) walk(child, visit);
}

function stripDeclaration(markup) {
  return markup.replace(/^<\?xml[^>]*\?>\s*/, '');
}

/**
 * Checks that every url(#id) and local href in hardened markup points at an
 * id of the same document, and that the ids are unique and prefixed.
 */
function assertReferencesResolve(markup, prefix, label) {
  const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${label}: ids are unique`);
  for (const id of ids) assert.ok(id.startsWith(prefix), `${label}: ${id} carries the prefix`);
  const references = [
    ...[...markup.matchAll(/url\(([^)]*)\)/g)].map(match => match[1]),
    ...[...markup.matchAll(/\s(?:xlink:)?href="#([^"]*)"/g)].map(match => `#${match[1]}`)
  ];
  for (const reference of references) {
    assert.match(reference, /^#/, `${label}: ${reference} is an unquoted local reference`);
    assert.ok(ids.includes(reference.slice(1)), `${label}: ${reference} resolves`);
  }
}

test('the fixtures are the library SVG dumps', () => {
  assert.ok(fixtures.length >= 24, `found ${fixtures.length} fixtures`);
  for (const { name, markup } of fixtures) {
    assert.match(markup, /^<\?xml version="1\.0" standalone="no"\?>\r\n<svg /, name);
  }
});

test('parse reads elements, attributes, text and self-closing tags', () => {
  const root = QRTurboSvg.parse(
    '<?xml version="1.0"?>\n<!DOCTYPE svg [<!ENTITY x "y">]>\n<!-- head -->'
    + '<svg xmlns="http://www.w3.org/2000/svg" width=\'10\' data-a = "1 &amp; 2">'
    + '<g id="g1"><rect width="1" height="1"/><!-- inside --></g>'
    + '<text x="5">A &lt;b&gt; &quot;c&quot; &apos;d&apos; &#233; &#x20AC;<![CDATA[ <raw> & ]]></text>'
    + '</svg>\n'
  );

  assert.equal(root.name, 'svg');
  assert.deepEqual(root.attrs, { xmlns: 'http://www.w3.org/2000/svg', width: '10', 'data-a': '1 & 2' });
  assert.deepEqual(root.children.map(child => child.name), ['g', 'text']);
  const group = root.children[0];
  assert.equal(group.attrs.id, 'g1');
  assert.equal(group.children[0].name, 'rect');
  assert.deepEqual(group.children[0].children, []);
  assert.equal(group.children[0].text, '');
  assert.equal(root.children[1].text, 'A <b> "c" \'d\' \u00e9 \u20ac <raw> & ');
});

test('parse normalizes attribute whitespace but keeps character references', () => {
  const root = QRTurboSvg.parse('<svg a="x\ty\r\nz" b="1&#10;2" c="&unknown; &#0;"/>');
  assert.equal(root.attrs.a, 'x y z');
  assert.equal(root.attrs.b, '1\n2');
  assert.equal(root.attrs.c, '&unknown; &#0;', 'unknown entities and invalid code points stay literal');
});

test('parse keeps mixed text content in order as text and tail', () => {
  const markup = '<svg><text>Hello <tspan>big</tspan> world<tspan>!</tspan></text><g> <rect/> </g></svg>';
  const root = QRTurboSvg.parse(markup);
  const text = root.children[0];
  assert.equal(text.text, 'Hello ');
  assert.equal(text.children[0].text, 'big');
  assert.equal(text.children[0].tail, ' world');
  assert.equal(text.children[1].tail, '');
  assert.equal(root.children[1].text, '', 'whitespace between graphics elements is dropped');
  assert.equal(root.children[1].children[0].tail, '');
  assert.equal(QRTurboSvg.serialize(root), '<svg><text>Hello <tspan>big</tspan> world<tspan>!</tspan></text><g><rect/></g></svg>');
});

test('parse rejects malformed markup', () => {
  const cases = [
    '',
    'just text',
    '<svg>',
    '<svg></g>',
    '<svg><g></svg>',
    '<svg/><svg/>',
    '<svg a=1/>',
    '<svg a="1" a="2"/>',
    '<svg a/>',
    '<svg a="1/>',
    '<svg a="1"b="2"/>',
    '<svg><!-- open</svg>',
    '< svg/>',
    '<svg/>trailing text'
  ];
  for (const markup of cases) {
    assert.throws(() => QRTurboSvg.parse(markup), /QRTurboSvg\.parse:/, JSON.stringify(markup));
  }
});

test('serialize escapes attribute values and text', () => {
  const node = {
    name: 'text',
    attrs: { a: '1 & <2> "3" \'4\'', b: 'line\nbreak\ttab', skipped: undefined, empty: null, n: 5 },
    children: [],
    text: 'x < y & z > w\r'
  };
  const markup = QRTurboSvg.serialize(node);
  assert.equal(
    markup,
    '<text a="1 &amp; &lt;2> &quot;3&quot; \'4\'" b="line&#10;break&#9;tab" n="5">x &lt; y &amp; z &gt; w&#13;</text>'
  );
  const reparsed = QRTurboSvg.parse(markup);
  assert.equal(reparsed.attrs.a, node.attrs.a);
  assert.equal(reparsed.attrs.b, node.attrs.b);
  assert.equal(reparsed.text, node.text);
  assert.throws(() => QRTurboSvg.serialize(null), TypeError);
});

test('serialize drops characters that XML 1.0 forbids, so the output always parses', () => {
  const node = {
    name: 'text',
    attrs: { 'data-a': 'x\u0001y\uFFFEz\uD83D', 'data-b': 'ok\uD83D\uDE00' },
    children: [],
    text: 'A\u0000B\u000bC\u001fD\uFFFF E\uDE00F \uD83D\uDE00\tG\nH'
  };
  const markup = QRTurboSvg.serialize(node);
  assert.equal(
    markup,
    '<text data-a="xyz" data-b="ok\uD83D\uDE00">ABCD EF \uD83D\uDE00\tG\nH</text>',
    'controls, U+FFFE/U+FFFF and lone surrogates go; emoji pairs, tab and newline stay'
  );
  assert.equal(QRTurboSvg.serialize({ name: 'text', attrs: {}, children: [], text: '\u0001' }), '<text></text>');

  // A label cut in the middle of an emoji, or with a pasted control
  // character or character reference, still gives well-formed markup.
  const layout = frame.getFrameLayout(1024, 'banner-bottom');
  const framed = frame.buildFramedSvg(fixtures[0].markup, layout, {
    text: `${'a'.repeat(29)}\uD83D \u0007&#1;`,
    fontSize: 60,
    colors: { frame: '#000000', text: '#ffffff', card: '#ffffff' }
  });
  const hardened = QRTurboSvg.harden(framed, { idPrefix: 'qp1-', xmlDeclaration: false });
  assert.doesNotMatch(hardened, /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF\uD800-\uDFFF]/u);
  assert.match(hardened, />a{29} &amp;#1;<\/text>/);
  assert.match(
    QRTurboSvg.harden('<svg><text>&#1;x</text></svg>', { xmlDeclaration: false }),
    /<text>x<\/text>/,
    'a character reference to a control character is dropped too'
  );
});

test('every fixture survives a parse and serialize round trip byte for byte', () => {
  for (const { name, markup } of fixtures) {
    const tree = QRTurboSvg.parse(markup);
    const serialized = QRTurboSvg.serialize(tree);
    assert.equal(serialized, stripDeclaration(markup), name);
    assert.deepEqual(QRTurboSvg.parse(serialized), tree, `${name} parses back to the same tree`);
  }
});

test('harden makes every fixture portable', () => {
  for (const { name, markup } of fixtures) {
    const hardened = QRTurboSvg.harden(markup, { idPrefix: 'qrt-', width: '50mm', height: '50mm' });
    const label = `harden ${name}`;

    assert.ok(hardened.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<svg '), label);
    assert.match(
      hardened,
      /^<\?xml[^>]*\?>\n<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink" width="50mm" height="50mm" viewBox="0 0 \d+ \d+">/,
      label
    );
    const original = QRTurboSvg.parse(markup).attrs;
    assert.ok(hardened.includes(`viewBox="0 0 ${original.width} ${original.height}"`), `${label} keeps the source units`);
    assert.doesNotMatch(hardened, /transparent/, label);
    assert.doesNotMatch(hardened, /rotate\(0,/, label);
    assert.doesNotMatch(hardened, /url\('/, label);
    assert.doesNotMatch(hardened, /url\("/, label);
    assertReferencesResolve(hardened, 'qrt-', label);

    const tree = QRTurboSvg.parse(hardened);
    walk(tree, node => {
      if (node.name !== 'image') return;
      assert.ok(node.attrs.href.startsWith('data:image/'), `${label} keeps the data URL`);
      assert.equal(node.attrs['xlink:href'], node.attrs.href, `${label} mirrors href to xlink:href`);
      assert.match(node.attrs.width, /^\d+(?:\.\d+)?$/, `${label} image width has no px`);
      assert.match(node.attrs.height, /^\d+(?:\.\d+)?$/, `${label} image height has no px`);
    });

    // Hardening again with no prefix changes nothing.
    assert.equal(QRTurboSvg.harden(hardened, { idPrefix: '' }), hardened, `${label} is stable`);
  }
});

test('harden shrinks the library output by dropping rotate(0) transforms', () => {
  const { markup } = fixtures.find(fixture => fixture.name === 'dots-square.svg');
  const hardened = QRTurboSvg.harden(markup, { idPrefix: 'qrt-' });
  assert.ok(hardened.length < markup.length * 0.75, `${hardened.length} < 75% of ${markup.length}`);
});

test('harden drops dangling clip-path references and keeps valid ones', () => {
  const hardened = QRTurboSvg.harden(
    '<svg width="20" height="20"><defs><clipPath id="c"><rect width="5" height="5"/></clipPath></defs>'
    + '<rect width="20" height="20" clip-path="url(\'#missing\')" fill="#fff"/>'
    + '<rect width="20" height="20" clip-path="url(\'#c\')" fill="#000"/></svg>',
    { idPrefix: 'p-', xmlDeclaration: false }
  );
  assert.equal(
    hardened,
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20">'
    + '<defs><clipPath id="p-c"><rect width="5" height="5"/></clipPath></defs>'
    + '<rect width="20" height="20" fill="#fff"/>'
    + '<rect width="20" height="20" clip-path="url(#p-c)" fill="#000"/></svg>'
  );
});

test('harden removes transparent paint and zero rotations only', () => {
  const hardened = QRTurboSvg.harden(
    '<svg width="10" height="10">'
    + '<rect width="10" height="10" fill="transparent"/>'
    + '<rect id="kept" width="10" height="10" fill="Transparent"/>'
    + '<rect width="10" height="10" fill="transparent" stroke="#000"/>'
    + '<circle r="1" fill=" transparent " stroke="transparent"/>'
    + '<linearGradient id="g"><stop offset="0" stop-color="transparent"/></linearGradient>'
    + '<rect width="1" height="1" transform="rotate(0,5,95)"/>'
    + '<rect width="1" height="1" transform="rotate(0 5 95)"/>'
    + '<rect width="1" height="1" transform="rotate(-0.0)"/>'
    + '<rect width="1" height="1" transform="rotate(90,5,5)"/>'
    + '<rect width="1" height="1" transform="rotate(0,5,5) scale(2)"/>'
    + '</svg>',
    { idPrefix: '', xmlDeclaration: false }
  );
  assert.doesNotMatch(hardened, /transparent/i);
  assert.equal((hardened.match(/<rect /g) || []).length, 7, 'only the plain transparent rect is dropped');
  assert.match(hardened, /<rect id="kept" width="10" height="10" fill="none"\/>/);
  assert.match(hardened, /<rect width="10" height="10" fill="none" stroke="#000"\/>/);
  assert.match(hardened, /<circle r="1" fill="none" stroke="none"\/>/);
  assert.match(hardened, /<stop offset="0" stop-color="#000000" stop-opacity="0"\/>/);
  assert.equal((hardened.match(/transform=/g) || []).length, 2);
  assert.match(hardened, /transform="rotate\(90,5,5\)"/);
  assert.match(hardened, /transform="rotate\(0,5,5\) scale\(2\)"/);

  // Inside a clipPath the fill does not matter, so the shape keeps clipping.
  const clipped = QRTurboSvg.harden(
    '<svg width="10" height="10"><defs><clipPath id="c"><g><rect width="5" height="5" fill="transparent"/></g></clipPath></defs>'
    + '<rect width="10" height="10" clip-path="url(#c)" fill="#000"/><rect width="10" height="10" fill="transparent"/></svg>',
    { idPrefix: 'p-', xmlDeclaration: false }
  );
  assert.match(clipped, /<clipPath id="p-c"><g><rect width="5" height="5" fill="none"\/><\/g><\/clipPath>/);
  assert.equal((clipped.match(/<rect /g) || []).length, 2, 'the transparent rect outside the clipPath is dropped');
});

test('harden prefixes every id and every reference to it', () => {
  const hardened = QRTurboSvg.harden(
    '<svg viewBox="0 0 4 4"><defs><linearGradient id="a"/><linearGradient id="b" href="#a"/>'
    + '<path id="p" d="M0 0h1"/></defs>'
    + '<rect fill="url(&quot;#b&quot;) red" style="stroke: url( \'#a\' )"/>'
    + '<use xlink:href="#p"/><image href="#p" width="2px" height="1.5px"/><a href="https://example.com/#top"/></svg>',
    { idPrefix: 'qp7-', xmlDeclaration: false }
  );
  assert.match(hardened, /<linearGradient id="qp7-a"\/><linearGradient id="qp7-b" href="#qp7-a"\/>/);
  assert.match(hardened, /<path id="qp7-p" d="M0 0h1"\/>/);
  assert.match(hardened, /fill="url\(#qp7-b\) red" style="stroke: url\(#qp7-a\)"/);
  assert.match(hardened, /<use xlink:href="#qp7-p"\/>/);
  assert.match(hardened, /<image href="#qp7-p" xlink:href="#qp7-p" width="2" height="1\.5"\/>/);
  assert.match(hardened, /<a href="https:\/\/example\.com\/#top"\/>/, 'external fragments stay untouched');
  assertReferencesResolve(hardened, 'qp7-', 'prefix test');
});

test('harden with xlinkHref: false keeps only href on images, for the preview', () => {
  const logo = 'data:image/png;base64,' + 'A'.repeat(4000);
  const markup = `<svg viewBox="0 0 10 10"><image href="${logo}" width="4px" height="4"/>`
    + `<image xlink:href="${logo}" width="2" height="2"/>`
    + '<image href="#keep" xlink:href="#other"/><use xlink:href="#p"/><path id="p" d="M0 0h1"/><path id="keep" d="M0 0h1"/></svg>';

  const preview = QRTurboSvg.harden(markup, { idPrefix: 'qp1-', xmlDeclaration: false, xlinkHref: false });
  assert.doesNotMatch(preview, /<image [^>]*xlink:href/);
  assert.equal(preview.split(logo).length - 1, 2, 'each logo appears once');
  assert.match(preview, new RegExp(`<image href="${logo}" width="4" height="4"/>`));
  assert.match(preview, new RegExp(`<image href="${logo}" width="2" height="2"/>`), 'xlink:href becomes href');
  assert.match(preview, /<image href="#qp1-keep"\/>/, 'href wins over xlink:href');
  assert.match(preview, /<use xlink:href="#qp1-p"\/>/, 'only images change');
  assert.match(preview, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/);

  // Exports (the default) keep both attributes.
  const exported = QRTurboSvg.harden(markup, { idPrefix: 'qrt-', xmlDeclaration: false });
  assert.equal(exported.split(logo).length - 1, 4);
  assert.match(exported, new RegExp(`<image href="${logo}" xlink:href="${logo}" width="4" height="4"/>`));
  assert.match(exported, new RegExp(`<image href="${logo}" xlink:href="${logo}" width="2" height="2"/>`));
  assert.equal(QRTurboSvg.harden(markup, { xlinkHref: true }), QRTurboSvg.harden(markup));
  assert.ok(preview.length < exported.length * 0.6, 'the preview markup is about half the size');
});

test('harden sets the viewBox and the requested size', () => {
  const svg = attrs => `<svg ${attrs}><rect width="1" height="1"/></svg>`;
  const rootOf = (markup, opts) => QRTurboSvg.parse(QRTurboSvg.harden(markup, opts)).attrs;

  assert.deepEqual(rootOf(svg('width="330px" height="330"'), { idPrefix: 'x' }), {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    width: '330px',
    height: '330',
    viewBox: '0 0 330 330'
  });
  assert.deepEqual(rootOf(svg('viewBox="0,0,1024,1024" width="1024" height="1024"'), { idPrefix: 'x', width: 1024, height: 1024 }), {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    viewBox: '0 0 1024 1024',
    width: '1024',
    height: '1024'
  });
  const percent = rootOf(svg('xmlns="http://www.w3.org/2000/svg" width="210" height="210"'), { idPrefix: 'q', width: '100%', height: '100%' });
  assert.equal(percent.width, '100%');
  assert.equal(percent.height, '100%');
  assert.equal(percent.viewBox, '0 0 210 210');
  assert.equal(rootOf(svg('width="2in" height="2in"'), {}).viewBox, undefined, 'no viewBox without a pixel size');
  assert.equal(rootOf(svg('viewBox="bad" width="5" height="6"'), {}).viewBox, '0 0 5 6');
  assert.equal(rootOf(svg('width="5" height="6"'), { width: '2in' }).height, '6', 'a missing height option keeps the height');
});

test('harden writes the XML declaration unless it is turned off', () => {
  const markup = '<?xml version="1.0" standalone="no"?>\r\n<svg width="1" height="1"/>';
  assert.equal(
    QRTurboSvg.harden(markup, { idPrefix: 'a' }),
    '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1" height="1" viewBox="0 0 1 1"/>'
  );
  assert.ok(QRTurboSvg.harden(markup, { idPrefix: 'a', xmlDeclaration: false }).startsWith('<svg '));
  assert.ok(QRTurboSvg.harden(markup).startsWith('<?xml'), 'options are optional');
});

test('harden validates its input', () => {
  assert.throws(() => QRTurboSvg.harden('<g/>', { idPrefix: 'a' }), /root element is not <svg>/);
  assert.throws(() => QRTurboSvg.harden('<svg>', { idPrefix: 'a' }), /QRTurboSvg\.parse:/);
  for (const idPrefix of ['1a', 'a b', 'a"', '-a']) {
    assert.throws(() => QRTurboSvg.harden('<svg/>', { idPrefix }), TypeError, idPrefix);
  }
});

test('harden keeps a framed SVG intact: nested code, frame clip, label and its maximum width', () => {
  const { markup } = fixtures.find(fixture => fixture.name === 'g-ref.svg');
  for (const style of ['banner-bottom', 'banner-top', 'outline']) {
    const layout = frame.getFrameLayout(1024, style);
    const framed = frame.buildFramedSvg(markup, layout, {
      text: 'Menu & <prices>',
      fontSize: 60,
      colors: { frame: '#102a43', text: '#ffffff', card: '#ffffff' }
    });
    const hardened = QRTurboSvg.harden(framed, { idPrefix: 'qrt-', width: '40mm', height: '40mm' });
    const label = `framed ${style}`;

    assert.match(hardened, /^<\?xml[^>]*\?>\n<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink" width="40mm" height="40mm" viewBox="0 0 1024 1024">/, label);
    assert.match(hardened, /<clipPath id="qrt-qrturbo-frame-clip">/, label);
    assert.match(hardened, /<g clip-path="url\(#qrt-qrturbo-frame-clip\)"><svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" x="\d+" y="\d+" width="\d+" height="\d+" viewBox="0 0 512 512">/, label);
    assert.match(hardened, />Menu &amp; &lt;prices&gt;<\/text>/, label);
    assert.match(hardened, new RegExp(`data-max-width="${layout.label.maxWidth}"`), label);
    assert.doesNotMatch(hardened, /transparent|rotate\(0,|url\('/, label);
    assertReferencesResolve(hardened, 'qrt-', label);
  }
});

test('harden handles a version 40 sized document', () => {
  const rects = [];
  for (let row = 0; row < 177; row += 1) {
    for (let col = 0; col < 177; col += 1) {
      if ((row * 7 + col * 3) % 2) rects.push(`<rect x="${col * 10}" y="${row * 10}" width="10" height="10" transform="rotate(0,${col * 10 + 5},${row * 10 + 5})"/>`);
    }
  }
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="1770" height="1770"><defs><clipPath id="clip-path-dot-color">${rects.join('')}</clipPath></defs>`
    + '<rect x="0" y="0" height="1770" width="1770" clip-path="url(\'#clip-path-dot-color\')" fill="#000"/></svg>';
  const hardened = QRTurboSvg.harden(markup, { idPrefix: 'qp1-', width: '100%', height: '100%', xmlDeclaration: false });
  assert.equal((hardened.match(/<rect /g) || []).length, rects.length + 1);
  assert.doesNotMatch(hardened, /transform=/);
});
