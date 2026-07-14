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

Install dependencies:

```bash
npm install
```

Run the fast Node test suite:

```bash
npm test
```

Run browser end-to-end tests:

```bash
npx playwright install
npm run test:e2e
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
