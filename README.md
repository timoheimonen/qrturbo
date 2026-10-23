# QRTurbo.app

A fast, ad-free, privacy-respecting QR code generator.

**Runs entirely in your browser.**  
**No tracking. No ads. No data is sent or stored.**  
**Open source under MIT license.**

## Edge Native

QRTurbo.app is deployed on Cloudflare Pages and runs entirely at the edge.
The app is served as static assets from Cloudflare's global network, with no origin server or backend API required for QR code generation.

---

## Features

- Create QR codes instantly in your browser, with a live preview that never flickers while you type
- QR code types: URL/Text, vCard, MeCard, WiFi (including WPA3), SMS/Phone, Email, Calendar Events (all-day and time zones),
  Locations, Social Media, WhatsApp, App Links and SEPA payments (EPC QR code with Finnish reference numbers)
- Create many codes at once from a CSV file and download them as a ZIP file
- Style presets, solid or gradient code colors, custom corner colors, transparent backgrounds
- Logos by choosing, dropping or pasting an image, with adjustable size and spacing
- Frames with a call-to-action label such as "Scan me"
- Pattern, corner frame and corner center shapes
- Automatic error correction (M, or H with a logo), or a fixed level L, M, Q or H, and an optional minimum QR version
- Built-in scan check: every code is test-scanned on your device, with one-click fixes for contrast, logo size and print size
- QR info readout: version, module count and how much of the capacity the content uses
- Export formats: PNG, JPG and WebP images up to 4096 px, SVG, vector PDF (fit to code, A4 or US Letter) and EPS
- Exact print sizes in millimetres or inches at 150, 300 or 600 dpi, written into PNG and JPG files
- PDF and EPS in RGB, CMYK or black only
- Copy the image, share it on phones, or print it at its exact size
- Light and dark themes
- Multilingual UI with 22 supported languages, each pre-rendered at its own URL
- Landing pages for every QR code type in every language
- No external API calls
- Works fully offline after initial load
- Supports UTF-8 and long messages

## Pages

The HTML pages in `Public/` are generated. Edit `site/template.html` for the page structure,
`site/content/<lang>.js` for page texts (titles, landing pages, comparison and FAQ), and
`Public/js/i18n/` for interface strings. Then regenerate every language and QR code type page and
`sitemap.xml`:

```bash
npm run build
```

When you add or rename interface strings in `Public/js/i18n/core.js`, copy the English key set into
every locale file (new keys get the English text until they are translated):

```bash
node scripts/sync-locales.js
```

`npm run build:check` and the static tests fail when the committed pages are out of date.

## Testing

Prerequisites are Node.js 22.5 or newer and npm.

From a clean checkout, install the locked dependencies and the tested browsers with their system dependencies,
then run the complete acceptance suite with one command:

```bash
npm ci && npx playwright install --with-deps chromium webkit && npm run test:all
```

After that initial setup, run only the fast Node and static checks with:

```bash
npm run test:fast
```

Run only the browser end-to-end tests with:

```bash
npm run test:e2e
```

Generate the diagnostic production-code coverage report with:

```bash
npm run test:coverage
```

The report contains `Public/js/app.js`, `Public/js/frame.js`, the modules in `Public/js/lib/` and
`Public/sw.js`. It intentionally excludes the vendored libraries and test harnesses, and it does not
enforce an arbitrary percentage threshold.

The browser suite runs fully on desktop Chromium. Pixel 7 runs one responsive mobile smoke test,
while WebKit runs the core generation, PNG/SVG download, and logo/FileReader paths. PWA cache tests
run once on desktop Chromium.

Run the complete acceptance suite again without reinstalling dependencies:

```bash
npm run test:all
```

---

## Privacy

This tool does **not** send your input to any server.
Everything happens **locally in your browser**.
Logo images are processed using the browser's FileReader API - they never leave your device.

---

## License

MIT License.
This project includes the [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) library.
Third-party copyright and license notices are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Author
Timo Heimonen (timo.heimonen@proton.me)
