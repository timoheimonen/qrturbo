# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-09-28

### Added

- Pre-rendered pages for every language at their own URLs (`/fi/`, `/de/`, ...), with correct `hreflang` alternates, canonical URLs and a sitemap that lists every language version. Previously all languages shared one URL and only English was visible to search engines.
- Ten new languages: Brazilian Portuguese (`/pt/`), Dutch (`/nl/`), Polish (`/pl/`), Turkish (`/tr/`), Indonesian (`/id/`), Traditional Chinese for Taiwan (`/zh-hant/`), Czech (`/cs/`), Romanian (`/ro/`), Hungarian (`/hu/`) and Greek (`/el/`), for 24 languages in total. Browsers set to Taiwan, Hong Kong or Macau Chinese (`zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant`) open the Traditional Chinese pages, and other Chinese variants open Simplified Chinese.
- Landing pages for WiFi, vCard, WhatsApp, email, SMS and phone, calendar event, location, social media and app download QR codes in all 24 languages. Each page opens the generator on its own type and explains how that QR code works.
- QR code frames with a call-to-action label ("Scan me"): label below, label above or outline, with custom text and color. Frames are included in PNG, SVG and PDF downloads.
- Print (2048 px) and poster (4096 px) sizes.
- "Free QR codes that never stop working" section that compares static QR codes with trial-based dynamic codes.
- Frequently asked questions with `FAQPage` structured data.
- Links between all QR code generator pages.
- Visited language and type pages are kept for offline use, and offline navigation falls back to the home page in the same language.
- `npm run build` generates the pages from `site/template.html` and `site/content/`.

### Changed

- The hero now leads with codes that never expire and require no sign-up.
- The language selector opens the same page in the chosen language. English pages open in the saved language or, on the first visit, in the browser language.

### Fixed

- On narrow phones the logo no longer overlaps the language selector, and long QR code type labels such as "SMS/Téléphone" hyphenate inside their buttons instead of overflowing.

### Removed

- The 256 px size, which was too small for print.

## [1.1.0] - 2026-09-27

### Added

- Introduction section with privacy highlights: generated in the browser, no uploads, no tracking or cookies, offline support, and open source.
- "How it works" and "Private by design" sections explaining how QR content stays on the device and why generated codes have no redirects or expiry.
- Icons for every QR code type.
- Translations for all new text in all 12 supported languages.

### Changed

- Redesigned the interface with the same visual language as diffvoid.com: a sticky header, serif display headline, calm monochrome surfaces, and a single blue accent.
- Two-column workspace on wide screens with a sticky live preview beside the form, so the QR code stays visible while editing content and style.
- Clearer preview card with a "created on this device" indicator and a prominent download button.
- The theme follows the system light or dark setting until a theme is chosen explicitly.
- Privacy policy and terms of use pages use the new layout.

### Fixed

- SVG QR codes now include a `viewBox`, so the preview scales to fit instead of being cropped and downloaded SVG files scale correctly in other applications.

## [1.0.1] - 2026-07-16

### Added

- Project changelog following the Keep a Changelog format.

### Changed

- Versioned local asset URLs using the package version for reliable cache invalidation after deployments.

## [1.0.0] - 2026-07-16

### Added

- Initial release of QRTurbo.app.
- Fully client-side QR code generation with no tracking, advertisements, or data uploads.
- Support for URL and text, vCard, MeCard, Wi-Fi, SMS, phone, email, calendar event, location, social media, WhatsApp, and app-link QR codes.
- QR code customization with foreground and background colors, transparent backgrounds, logos, dot and corner styles, quiet-zone controls, multiple sizes, and error-correction levels.
- Export to PNG, SVG, and PDF.
- Light and dark themes.
- User interface translations for 12 languages.
- Offline use through Progressive Web App support.
- Responsive and accessible interface for desktop and mobile devices.
- Privacy policy, terms of use, and third-party license notices.
- Automated unit, static, accessibility, browser, artifact, and PWA tests.

### Security

- QR code contents and uploaded logos are processed entirely in the browser.
- Input validation and scannability warnings for potentially unreliable QR code configurations.
- Sensitive QR payloads are excluded from exported PDF documents.
