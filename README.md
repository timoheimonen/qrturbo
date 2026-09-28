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

- Create QR codes instantly in your browser
- Generate QR codes for URL/Text, vCard, MeCard, WiFi, SMS/Phone, Email, Calendar Events, Locations, Social Media, WhatsApp, and App Links
- Customize foreground and background colors
- Add an optional logo with adjustable size and margin
- Add a frame with a call-to-action label such as "Scan me"
- Choose dot styles, corner square styles, and corner dot styles
- Select QR code size: 512px, 1024px, 2048px, or 4096px
- Error correction levels: L, M, Q, H
- Export formats: PNG, SVG and PDF
- Light and dark themes
- Multilingual UI with 24 supported languages, each pre-rendered at its own URL
- Landing pages for every QR code type in every language
- No external API calls
- Works fully offline after initial load
- Supports UTF-8 and long messages
- Download the QR code as an image

## Pages

The HTML pages in `Public/` are generated. Edit `site/template.html` for the page structure,
`site/content/<lang>.js` for page texts (titles, landing pages, comparison and FAQ), and
`Public/js/i18n/` for interface strings. Then regenerate every language and QR code type page and
`sitemap.xml`:

```bash
npm run build
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

The report contains `Public/js/app.js` and `Public/sw.js`. It intentionally excludes the vendor
QR library and test harnesses, and it does not enforce an arbitrary percentage threshold.

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
