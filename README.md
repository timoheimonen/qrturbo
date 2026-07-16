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
- Choose dot styles, corner square styles, and corner dot styles
- Select QR code size: 256px, 512px, or 1024px
- Error correction levels: L, M, Q, H
- Export formats: PNG, SVG and PDF
- Light and dark themes
- Multilingual UI with 12 supported languages
- No external API calls
- Works fully offline after initial load
- Supports UTF-8 and long messages
- Download the QR code as an image

## Testing

Prerequisites are Node.js 20 or newer, npm, and Python 3 (used by the local test server).

From a clean checkout, install the locked dependencies and Chromium with its system dependencies,
then run the complete acceptance suite with one command:

```bash
npm ci && npx playwright install --with-deps chromium && npm run test:all
```

After that initial setup, run only the fast Node and static checks with:

```bash
npm run test:fast
```

Run only the browser end-to-end tests with:

```bash
npm run test:e2e
```

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
