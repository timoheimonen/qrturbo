# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
