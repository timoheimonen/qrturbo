// QRTurbo.app - Internationalization (i18n) Core System
// 100% client-side, cookie-free localization. Every language has its own
// pre-rendered URL (/, /fi/, /de/ ...); this file provides the strings that
// JavaScript creates at runtime and switches between the language URLs.

const supportedLanguages = new Set([
  'en', 'cs', 'da', 'de', 'el', 'es', 'fi', 'fr', 'hu', 'id', 'it', 'ja',
  'ko', 'nl', 'no', 'pl', 'pt', 'ro', 'sv', 'tr', 'zh', 'zh-hant'
]);
const LANGUAGE_STORAGE_KEY = 'qrturbo_lang';

// Language codes are lowercase; <html lang> and hreflang use the BCP 47
// spelling, such as zh-Hant for the zh-hant pages.
const HREFLANGS = { 'zh-hant': 'zh-Hant' };

// The page language is fixed by the pre-rendered document.
const pageLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
let currentLang = supportedLanguages.has(pageLang) ? pageLang : 'en';
const assetVersionQuery = document.currentScript?.src.match(/\?v=[^#&]+/)?.[0] || '';

// Translation database (English embedded, others lazy-loaded)
// Expose on window so locale files can register their translations
const translations = {
  en: {
    app: {
      selectLanguage: 'Select Language'
    },
    aria: {
      themeGroup: 'Theme',
      lightTheme: 'Light theme',
      darkTheme: 'Dark theme',
      language: 'Language',
      qrTypes: 'QR code types',
      skipToGenerator: 'Skip to the QR code generator',
      qrImage: 'QR code preview: {{type}}',
      qrImageStale: 'QR code preview, out of date',
      removeLogo: 'Remove logo',
      formatGroup: 'File format',
      presetGroup: 'Style presets',
      mobileBar: 'Quick download',
      notifications: 'Notifications',
      hexValue: '{{name}}, hex value'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Phone',
      wifi: 'WiFi',
      email: 'Email',
      calendarEvent: 'Event',
      location: 'Location',
      socialMedia: 'Social Media',
      whatsapp: 'WhatsApp',
      payment: 'Payment',
      mecard: 'MeCard',
      appLink: 'App Link'
    },
    fields: {
      textOrUrl: 'Text or URL',
      firstName: 'First Name',
      lastName: 'Last Name',
      organization: 'Organization',
      title: 'Title',
      phoneWork: 'Phone (Work)',
      phoneMobile: 'Phone (Mobile)',
      email: 'Email',
      website: 'Website',
      street: 'Street',
      city: 'City',
      state: 'State/Province',
      zip: 'ZIP/Postal Code',
      country: 'Country',
      ssid: 'Network Name (SSID)',
      password: 'Password',
      authentication: 'Authentication',
      hiddenNetwork: 'This is a hidden network',
      phoneNumber: 'Phone Number',
      message: 'Message (optional)',
      qrSize: 'Size',
      foregroundColor: 'Code color',
      backgroundColor: 'Background',
      transparentBackground: 'Transparent background',
      errorCorrection: 'Error correction',
      dotStyle: 'Pattern',
      cornerSquare: 'Corner frame',
      cornerDot: 'Corner center',
      quietZone: 'Quiet zone',
      logoSize: 'Logo size',
      logoMargin: 'Space around logo',
      logo: 'Logo',
      styleOptions: 'Shapes',
      emailTo: 'Recipient Email',
      emailSubject: 'Subject',
      emailBody: 'Message',
      eventTitle: 'Event Title',
      eventStart: 'Start',
      eventEnd: 'End',
      eventLocation: 'Location',
      eventDescription: 'Description',
      locationAddress: 'Address or Place',
      latitude: 'Latitude',
      longitude: 'Longitude',
      socialPlatform: 'Platform',
      socialProfileType: 'Profile type',
      socialHandleOrUrl: 'Handle or profile URL',
      whatsappPhone: 'WhatsApp Number or @username',
      whatsappMessage: 'Message (optional)',
      mecardName: 'Name',
      address: 'Address',
      appWebUrl: 'Fallback / Web URL',
      appIosUrl: 'iOS App Store URL',
      appAndroidUrl: 'Android Play Store URL',
      appLinkTarget: 'Store fallback',
      frame: 'Frame',
      frameText: 'Frame text',
      frameColor: 'Frame color',
      smsPhoneType: 'Code type',
      fill: 'Fill',
      gradientColor2: 'Second color',
      gradientType: 'Gradient type',
      gradientAngle: 'Angle',
      customCorners: 'Custom corner colors',
      cornerOuterColor: 'Corner frame color',
      cornerInnerColor: 'Corner center color',
      customPixels: 'Width in pixels',
      setPrintSize: 'Set print size',
      printWidth: 'Printed width',
      unit: 'Unit',
      dpi: 'Resolution',
      pdfPage: 'Page',
      colorMode: 'Color mode',
      minVersion: 'Minimum QR version',
      paymentName: 'Recipient name',
      iban: 'IBAN',
      bic: 'BIC (optional)',
      amount: 'Amount in euros (optional)',
      paymentReference: 'Reference number (optional)',
      paymentMessage: 'Message (optional)',
      dueDate: 'Due date (optional)',
      allDay: 'All-day event',
      timeZone: 'Time zone',
      phoneHome: 'Phone (Home)',
      department: 'Department',
      birthday: 'Birthday',
      note: 'Note',
      addressType: 'Address type',
      batchSource: 'CSV data',
      batchHasHeader: 'The first row contains column names',
      batchType: 'Code type',
      batchFilename: 'File names from',
      batchFormat: 'File format',
      batchSameSize: 'Make all codes the same size',
      batchManifest: 'Include a list of all files (manifest.csv)',
      batchVerify: 'Check that every code scans'
    },
    placeholders: {
      url: 'e.g., https://www.example.com',
      firstName: 'John',
      lastName: 'Appleseed',
      organization: 'ACME Inc.',
      title: 'Developer',
      phoneWork: '+1-555-555-1234',
      phoneMobile: '+1-555-555-5678',
      email: 'john.appleseed@example.com',
      website: 'https://www.example.com',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '90210',
      country: 'USA',
      ssid: 'e.g., MyHomeWiFi',
      wifiPassword: 'Your secret password',
      phoneNumber: 'e.g., +15551234567',
      smsMessage: 'Your pre-filled message here...',
      emailTo: 'hello@example.com',
      emailSubject: 'Hello from QRTurbo.app',
      emailBody: 'Write your email message here...',
      eventTitle: 'Team meeting',
      eventLocation: 'Conference room or address',
      eventDescription: 'Event details...',
      locationAddress: '1600 Amphitheatre Parkway, Mountain View',
      latitude: '37.422',
      longitude: '-122.084',
      socialHandle: '@username or https://...',
      whatsappPhone: 'e.g., +15551234567 or @username',
      whatsappMessage: 'Your WhatsApp message here...',
      mecardName: 'John Appleseed',
      address: '123 Main St, Anytown',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      download: 'Download',
      reset: 'Reset design',
      customize: 'More design options',
      chooseLogo: 'Choose image',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      showPayload: 'Show QR data',
      hidePayload: 'Hide QR data',
      downloadFormat: 'Download {{format}}',
      copyImage: 'Copy image',
      copySvg: 'Copy SVG code',
      copyText: 'Copy text',
      share: 'Share',
      undo: 'Undo',
      goToField: 'Go to field',
      addHttps: 'Add https://',
      moreFormats: 'More formats',
      swapColors: 'Swap colors',
      dismiss: 'Dismiss',
      retry: 'Try again',
      useLevelL: 'Use level L',
      print: 'Print',
      cancel: 'Cancel',
      close: 'Close',
      createMany: 'Create many from a CSV file',
      batchStart: 'Create ZIP file',
      chooseCsv: 'Choose CSV file'
    },
    options: {
      sizeMedium: 'Small (512 px)',
      sizeLarge: 'Medium (1024 px)',
      sizePrint: 'Large (2048 px)',
      sizePoster: 'Extra large (4096 px)',
      frameNone: 'No frame',
      frameBannerBottom: 'Label below',
      frameBannerTop: 'Label above',
      frameOutline: 'Outline with label',
      errorLow: 'L - Low (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - High (30%)',
      formatPng: 'PNG',
      formatSvg: 'SVG',
      formatPdf: 'PDF',
      authWpa: 'WPA/WPA2/WPA3 (recommended)',
      authWep: 'WEP (outdated)',
      authNone: 'None (open network)',
      dotSquare: 'Square',
      dotRounded: 'Rounded',
      dotDots: 'Dots',
      dotClassy: 'Classy',
      dotClassyRounded: 'Classy Rounded',
      dotExtraRounded: 'Extra Rounded',
      cornerSquare: 'Square',
      cornerExtraRounded: 'Extra Rounded',
      cornerDot: 'Dot',
      socialInstagram: 'Instagram',
      socialTikTok: 'TikTok',
      socialYouTube: 'YouTube',
      socialFacebook: 'Facebook',
      socialX: 'X / Twitter',
      socialLinkedIn: 'LinkedIn',
      socialSnapchat: 'Snapchat',
      socialPinterest: 'Pinterest',
      socialReddit: 'Reddit',
      socialThreads: 'Threads',
      socialBluesky: 'Bluesky',
      socialOther: 'Other URL',
      socialTypePerson: 'Person/Profile',
      socialTypeCompany: 'Company',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Use iOS if no web URL',
      appTargetAndroid: 'Use Android if no web URL',
      errorAuto: 'Auto (recommended)',
      sizeCustom: 'Custom size',
      formatJpg: 'JPG',
      formatWebp: 'WebP',
      unitMm: 'mm',
      unitIn: 'in',
      dpi150: '150 dpi (draft)',
      dpi300: '300 dpi (print)',
      dpi600: '600 dpi (fine print)',
      pageFit: 'Fit to code',
      pageA4: 'A4',
      pageLetter: 'US Letter',
      fillSolid: 'Solid',
      fillGradient: 'Gradient',
      gradientLinear: 'Linear',
      gradientRadial: 'Radial',
      formatEps: 'EPS',
      colorRgb: 'RGB',
      colorCmyk: 'CMYK',
      colorK: 'Black only (100% K)',
      authWpa3: 'WPA3 only',
      versionAuto: 'Automatic',
      addressAuto: 'Automatic',
      addressWork: 'Work',
      addressHome: 'Home',
      filenameRowNumber: 'Row number',
      notUsed: 'Not used'
    },
    alerts: {
      enterText: 'Please enter some text or a URL',
      vcardRequired:
        'Please fill at least one of: First Name, Last Name, Email or Phone number.',
      wifiSsidRequired: 'Please enter the Network Name (SSID).',
      wifiSsidLengthInvalid: 'A WiFi network name can be at most 32 UTF-8 bytes.',
      wifiWpaPasswordInvalid:
        'WPA/WPA2 passwords must be 8-63 printable characters, or exactly 64 hexadecimal characters.',
      wifiWepPasswordInvalid:
        'WEP passwords must be 5 or 13 printable characters, or 10 or 26 hexadecimal characters.',
      phoneRequired: 'Please enter a phone number.',
      emailRequired: 'Please enter at least one email field.',
      emailInvalid: 'Please enter a valid email address.',
      eventRequired: 'Please enter an event title and start time.',
      eventEndInvalid: 'Event end time cannot be before the start time.',
      locationRequired: 'Please enter an address or both coordinates.',
      locationCoordinatesInvalid: 'Please enter valid latitude and longitude coordinates.',
      socialRequired: 'Please enter a social media handle or profile URL.',
      socialHandleInvalid: 'Please enter a valid handle using letters, numbers, dots, underscores or hyphens.',
      socialUrlInvalid: 'Please enter a valid social profile URL starting with http:// or https://.',
      whatsappPhoneRequired: 'Please enter a WhatsApp phone number with country code or a valid @username.',
      mecardRequired: 'Please enter at least one of: Name, Phone Number or Email.',
      appLinkRequired: 'Please enter a web, iOS or Android app URL.',
      urlInvalid: 'Please enter a valid URL starting with http:// or https://.',
      dataEmpty: 'QR code data is empty.',
      noData: 'No data provided for QR code.',
      generationError: 'Error generating QR code',
      dataTooLong: 'This content is too large for the selected QR error correction level. Shorten it or choose a lower level.',
      phoneInvalid: 'Please enter a phone number using digits, for example +358401234567.',
      paymentRequired: 'Please enter the recipient name and IBAN.',
      paymentNameTooLong: 'The recipient name can be at most 70 characters.',
      ibanInvalid: 'Please check the IBAN. Its check digits do not match.',
      bicInvalid: 'Please enter a valid BIC of 8 or 11 characters.',
      amountInvalid: 'Enter an amount between 0.01 and 999999999.99 euros.',
      referenceInvalid: 'Please check the reference number.',
      referenceAndMessage: 'Use either a reference number or a message, not both.',
      paymentTooLong: 'The payment details are too long for a payment QR code (at most 331 bytes).',
      paymentMessageTooLong: 'The message can be at most 140 characters.',
      dateInvalid: 'Please enter a valid date, for example 2026-12-31.'
    },
    counters: {
      characters: '{{current}} / {{max}} characters'
    },
    units: {
      modules: '{{count}} modules',
      modules_one: '{{count}} module'
    },
    labels: {
      sms: 'SMS',
      phone: 'Phone Call'
    },
    warnings: {
      lowContrast:
        'Low contrast may make this QR code difficult to scan. Use a darker code color or a lighter background.',
      transparentBackground:
        'Transparent backgrounds depend on the final surface. Test the QR code on the exact background before publishing.',
      denseData:
        'This code holds a lot of data, so its modules are small. Shorten the content or show it larger.',
      logoErrorCorrection:
        'Codes with a logo scan more reliably with High (H) error correction.',
      logoLarge:
        'The logo is large and may cover too much of the QR code. Test before printing or sharing.',
      inverted:
        'The code is lighter than its background. Some scanner apps cannot read inverted codes.',
      gradientContrast: 'Part of the code color is too light against the background.',
      printTooSmall:
        'At this print size each module is only {{size}}. Print it larger so phones can read it.',
      codeTooSmall: 'The code is smaller than 2 cm (0.8 in). Many phones need it larger.',
      sizeTooSmall: 'At {{size}} px the modules are very small. Use a larger image size.',
      smallScanRisky: 'This code only scans when it is shown large. Avoid printing it small.',
      decodeFailed: 'The built-in scanner could not read this design.',
      paymentLogo: 'Payment codes scan more reliably without a logo.'
    },
    brand: {
      tagline: 'your private place to make QR codes'
    },
    trust: {
      local: 'Generated in your browser',
      noUploads: 'Nothing is uploaded',
      noTracking: 'No tracking or cookies',
      offline: 'Works offline',
      openSource: 'Open source',
      noExpiry: 'Never expires',
      noSignup: 'No sign-up'
    },
    workspace: {
      chooseType: 'Choose a type',
      addContent: 'Add your content',
      adjustLook: 'Design'
    },
    preview: {
      title: 'Preview',
      localBadge: 'Created on this device',
      encodedData: 'Encoded data',
      ready: 'QR code ready'
    },
    how: {
      title: 'How it works',
      step1Title: 'Choose',
      step1Text: 'Pick what the code should do: open a link, join a WiFi network, save a contact and more.',
      step2Title: 'Fill in',
      step2Text: 'Type your content. The preview updates as you write, right here in your browser.',
      step3Title: 'Download',
      step3Text:
        'Download PNG, SVG, PDF or EPS at the exact size you need, or copy and share it. The scan check tells you if it will scan.'
    },
    privacyInfo: {
      title: 'Private by design',
      intro: 'QR codes often carry personal details: a WiFi password, a phone number, a home address. QRTurbo.app is built so that none of it ever reaches a server.',
      localTitle: 'Stays on your device',
      localText: 'QR codes and logos are generated by code running in your browser. There is no backend that could receive what you type.',
      staticTitle: 'No redirects, no expiry',
      staticText: 'Your content is encoded directly in the QR code. Scans are never routed through us, and the code never expires.',
      noTrackingTitle: 'No tracking',
      noTrackingText:
        'No analytics, ads, cookies or accounts. Only your language, theme and download settings are saved, locally in your browser.',
      openSourceTitle: 'Open to inspection',
      openSourceText: 'The full source code is public on GitHub, so anyone can verify these claims.'
    },
    footer: {
      privacy1: 'This free QR code generator runs entirely in your browser.',
      privacy2: 'Nothing you enter is stored or sent anywhere. No tracking, no ads, no nonsense.',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      github: 'View source on GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Space around the QR code (minimum: 4 modules for reliable scanning)',
      socialHandleHelper:
        'Enter a handle such as @username or paste a full https:// profile URL.',
      httpsSuggestion: 'Phones open links only when they start with https://.',
      ecHelper: 'Higher levels survive damage and logos, but make the code denser.',
      wifiWpa3: 'Choose WPA3 only if the network does not accept older WPA2 devices.',
      wifiHiddenIos: 'iPhones may ask guests to join a hidden network by hand.',
      paymentReference: 'An RF creditor reference, or a Finnish reference number (converted to RF).',
      paymentDueDate: 'Finnish banking apps fill in the due date. Other apps may show it as a note.',
      eventTimeZone: 'The time is saved with this time zone, so it shows correctly everywhere.',
      colorMode: 'RGB suits screens and office printers. CMYK is for print shops and uses a basic color conversion.'
    },
    frame: {
      defaultText: 'SCAN ME'
    },
    misc: {
      qrPlaceholder: 'Your QR code will appear here.',
      socialPreview: 'QR target',
      wifiPayloadHidden: 'WiFi settings: password hidden'
    },
    output: {
      title: 'Download',
      hintPng: 'Sharp image for screens, documents and most printers.',
      hintSvg: 'Vector image for websites and design tools. Sharp at any size.',
      hintPdf: 'Vector PDF, ready for print shops and documents.',
      hintJpg: 'For apps that do not accept PNG. Not recommended for print.',
      hintWebp: 'Small image for websites.',
      hintEps: 'Vector file for older design and sign-making software.',
      vectorAnySize: 'Vector: sharp at any size',
      summaryPixels: '{{width}} × {{height}} px',
      summaryPrint: '{{size}} at {{dpi}} dpi',
      summaryVector: 'Vector',
      summaryVectorPrint: '{{size}} wide',
      moduleSize: 'Each module is {{size}}.',
      scanDistance: 'Scans from up to about {{distance}}.',
      sizeCapped: 'Images are limited to 4096 px. Use SVG or PDF for larger prints.',
      pageTooSmall: 'The code was scaled down to fit the page.',
      transparentJpg: 'JPG cannot be transparent, so the background will be white.',
      epsOffice: 'Microsoft Office on Windows does not open EPS files. Use PDF or SVG there.',
      printTip: 'In the print dialog, set the scale to 100% for the exact size.',
      preparing: 'Preparing file',
      widthInvalid: 'Enter a width between {{min}} and {{max}}.',
      customSizeInvalid: 'Enter a size between 128 and 4096 pixels.'
    },
    capacity: {
      version: 'Version {{version}} · {{modules}} × {{modules}} modules',
      level: 'Level {{level}}',
      levelAuto: 'Level {{level}}, automatic',
      label: 'Data used',
      usageBytes: '{{used}} of {{max}} bytes',
      usageChars: '{{used}} of {{max}} characters (compact mode)',
      usageDigits: '{{used}} of {{max}} digits',
      tooLong: 'Too much content: {{used}} of {{max}} at level {{level}}.',
      paymentLimit: '{{used}} of 331 bytes'
    },
    scan: {
      title: 'Scan check',
      checking: 'Checking',
      ok: 'Scans well',
      looksGood: 'Looks good',
      tips: 'Scans, see tips',
      fail: 'May not scan',
      verified: 'A test scan on this device read the code correctly.',
      notVerified: 'The built-in scanner could not read this code. Try the fixes below.',
      unavailable:
        'Automatic test scans are not available in this browser. Test with your phone camera before printing.',
      fixEclH: 'Use level H',
      fixBlack: 'Use black on white',
      fixSwapColors: 'Swap colors',
      fixLogoSmaller: 'Make the logo smaller',
      fixPrintSize: 'Print at {{size}}',
      fixPixelSize: 'Use {{size}} px',
      fixSquare: 'Use square shapes',
      fixRemoveLogo: 'Remove logo'
    },
    empty: {
      urlText: 'Type or paste a link or some text to see your QR code.',
      vcard: 'Add a name, email or phone number to see your contact code.',
      smsPhone: 'Enter a phone number to see your code.',
      wifi: 'Enter your network name to see your WiFi code.',
      email: 'Add an email address, subject or message.',
      calendarEvent: 'Add an event title and a start time.',
      location: 'Enter an address or coordinates.',
      socialMedia: 'Enter a handle or a profile link.',
      whatsapp: 'Enter a WhatsApp number with country code.',
      payment: 'Enter the recipient name and IBAN.',
      mecard: 'Add a name, phone number or email.',
      appLink: 'Add an app store link or a web link.',
      invalid: 'Fix the highlighted field to update the code.',
      tooLong: 'Too much content for one QR code.',
      error: 'The code could not be created.'
    },
    design: {
      presets: 'Style',
      custom: 'Custom',
      presetStandard: 'Standard',
      presetClassic: 'Classic',
      presetRounded: 'Rounded',
      presetDots: 'Dots',
      presetSoft: 'Soft',
      presetScanMe: 'Scan me',
      colors: 'Colors',
      advanced: 'Advanced',
      eclAutoHelp: 'Auto uses level M, or H when the code has a logo.',
      eclLockedPayment: 'Payment codes always use level M.'
    },
    logo: {
      dropHint: 'Drop, paste or choose an image: PNG, JPEG, WebP, GIF or SVG.',
      dropHere: 'Drop the image to use it as a logo',
      readFailed: 'This image could not be opened. Try a PNG, JPEG, WebP or SVG file.',
      tooLarge: 'This image is larger than 10 MB. Choose a smaller file.',
      optimized: 'Image resized to {{size}} px to keep things fast.'
    },
    toast: {
      designReset: 'Design reset.',
      applied: 'Applied: {{what}}',
      imageCopied: 'Image copied.',
      svgCopied: 'SVG code copied.',
      textCopied: 'Text copied.',
      copyFailed: 'Copying is not allowed in this browser. Use Download instead.',
      shareFailed: 'Sharing did not work. Use Download instead.',
      saved: 'Saved {{filename}}',
      exportFailed: 'The {{format}} file could not be created. Please try again.',
      pdfRasterFallback: 'The PDF was saved with the code as an image.',
      batchLoadFailed: 'Creating many codes is not available right now. Reload the page and try again.'
    },
    mobile: {
      showPreview: 'Show the QR code'
    },
    batch: {
      title: 'Create many QR codes',
      intro:
        'Paste rows from a spreadsheet or choose a CSV file. Each row becomes one QR code with your current design. The file is read on this device and never uploaded.',
      dropHint: 'Drop a CSV file here',
      mappingTitle: 'Match columns to fields',
      rowsFound: 'Rows found: {{count}}',
      limit: 'At most {{max}} rows can be created at once.',
      sizeNote: 'Size comes from your current download settings: {{summary}}.',
      progress: 'Creating {{done}} of {{total}}',
      done: 'Created: {{ok}}. Skipped: {{failed}}.',
      rowError: 'Row {{row}}: {{message}}',
      emptyInput: 'Paste CSV data or choose a file first.',
      cancelled: 'Stopped. No ZIP file was created.',
      column: 'Column {{n}}',
      columnSample: 'Column {{n}} ({{sample}})',
      mapRequired: 'Choose a column for {{field}}.',
      fileTooLarge: 'This file is larger than 5 MB. Choose a smaller CSV file.',
      notCsv: 'This is not a CSV file. In your spreadsheet app, save or export it as CSV, then try again.',
      scanFailed: 'Codes that did not pass the scan check: {{count}}.',
      moreErrors: 'More rows with problems: {{count}}.'
    }
  }
};

// Expose translations on window for locale files to register
window.translations = translations;

// Language loading state management
const loadedLanguages = new Set(['en']); // English is always loaded
const loadingPromises = new Map(); // Prevent duplicate loading

// Helper function to get nested value from object using dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * @description Fills the {{name}} variables of a template. A value that
 * already ends in a period (Intl units such as "χλστ." or "pol.") absorbs
 * the template's sentence period, so the text never shows "..".
 */
function replaceVars(str, vars) {
  return str.replace(/\{\{(\w+)\}\}(\.?)/g, (_, name, period) => {
    const value = String(vars[name] ?? '');
    return period && value.endsWith('.') ? value : value + period;
  });
}

/**
 * @description Counted strings: t(key, { count }) uses the "<key>_one"
 * variant when the count is exactly 1 and that key exists, so "1 module"
 * and "4 modules" can differ. Other counts, and languages without the
 * variant, use the key itself.
 */
function countedValue(lang, key, vars) {
  if (vars.count === undefined || vars.count === null) return undefined;
  if (Number(String(vars.count).trim()) !== 1) return undefined;
  return getNestedValue(translations[lang], `${key}_one`);
}

// Main translation function
function t(key, vars = {}) {
  // Try current language first
  let value = countedValue(currentLang, key, vars) || getNestedValue(translations[currentLang], key);

  // Fallback to English if not found
  if (!value && currentLang !== 'en') {
    value = countedValue('en', key, vars) || getNestedValue(translations.en, key);
  }

  // Return key if still not found (dev mode indicator)
  if (!value) {
    console.warn(`Translation missing: ${key} for language: ${currentLang}`);
    return key;
  }

  // Replace variables if present
  return replaceVars(value, vars);
}

// Dynamic language loader
async function loadLanguage(langCode) {
  if (loadedLanguages.has(langCode)) {
    return;
  }

  if (loadingPromises.has(langCode)) {
    return loadingPromises.get(langCode);
  }

  const loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `/js/i18n/locales/${langCode}.js${assetVersionQuery}`;
    script.async = true;

    script.onload = () => {
      // Merge loaded translations from window.translations into main translations object
      if (window.translations && window.translations[langCode]) {
        translations[langCode] = window.translations[langCode];
      }
      loadedLanguages.add(langCode);
      loadingPromises.delete(langCode);
      resolve();
    };

    script.onerror = () => {
      console.error(`Failed to load language: ${langCode}`);
      loadingPromises.delete(langCode);
      reject(new Error(`Language ${langCode} failed to load`));
    };

    document.head.appendChild(script);
  });

  loadingPromises.set(langCode, loadPromise);
  return loadPromise;
}

// Translate all elements on the page. The pre-rendered HTML already contains
// these strings; this keeps runtime-created content in the same language.
function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
  });

  document.querySelectorAll('[data-i18n-option]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n-option'));
  });

  updateDynamicTranslations();
}

// Update dynamic content that depends on current state. Every lookup is
// null-safe: the build and test sandboxes have no real DOM. Feature modules
// re-apply their own runtime text on the 'qrturbo:i18n' event fired below.
function updateDynamicTranslations() {
  // Character counters
  const qrTextInput = document.getElementById('qr-text');
  const charCountDisplay = document.getElementById('char-count');
  if (qrTextInput && charCountDisplay) {
    const currentLength = qrTextInput.value.length;
    charCountDisplay.textContent = t('counters.characters', {
      current: currentLength,
      max: 2000
    });
  }

  const smsMessageInput = document.getElementById('sms-message');
  const smsCharCountDisplay = document.getElementById('sms-char-count');
  if (smsMessageInput && smsCharCountDisplay) {
    const currentLength = smsMessageInput.value.length;
    smsCharCountDisplay.textContent = t('counters.characters', {
      current: currentLength,
      max: 300
    });
  }

  const marginInput = document.getElementById('qr-margin');
  const marginValue = document.getElementById('qr-margin-value');
  if (marginInput && marginValue) {
    marginValue.textContent = t('units.modules', { count: Number(marginInput.value) });
  }

  const revealButton = document.getElementById('payload-reveal-btn');
  if (revealButton) {
    revealButton.textContent = t(
      revealButton.dataset.revealed === 'true' ? 'actions.hidePayload' : 'actions.showPayload'
    );
  }

  const qrCodeText = document.getElementById('qr-code-text');
  if (revealButton && qrCodeText && !revealButton.hidden && revealButton.dataset.revealed !== 'true') {
    qrCodeText.textContent = t('misc.wifiPayloadHidden');
  }

  const formError = document.getElementById('form-error');
  if (formError?.dataset?.i18nKey) {
    formError.textContent = t(formError.dataset.i18nKey);
  }

  // translatePage() resets every data-i18n element to its static text, so
  // modules with runtime text listen for this event and re-apply it.
  if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    document.dispatchEvent(new CustomEvent('qrturbo:i18n'));
  }
}

// Returns the same page in another language, using the hreflang alternates
// that every pre-rendered page declares in its <head>.
function getLanguageUrl(langCode) {
  const hreflang = HREFLANGS[langCode] || langCode;
  const alternate = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!alternate) return null;

  const target = new URL(alternate.getAttribute('href'), window.location.href);
  return `${target.pathname}${window.location.search}${window.location.hash}`;
}

function saveLanguagePreference(langCode) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }
}

// Initialize i18n system
async function initI18n() {
  try {
    await loadLanguage(currentLang);
  } catch (error) {
    console.error('Error loading language:', error);
    currentLang = 'en';
  }

  translatePage();

  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = pageLang && supportedLanguages.has(pageLang) ? pageLang : 'en';
  }
}

// Choosing a language is remembered and opens the matching language URL.
function setupLanguageSelector() {
  const langSelect = document.getElementById('lang-select');
  if (!langSelect) return;

  langSelect.addEventListener('change', (e) => {
    const langCode = e.target.value;
    if (!supportedLanguages.has(langCode)) return;

    saveLanguagePreference(langCode);
    const targetUrl = getLanguageUrl(langCode);
    if (targetUrl) {
      window.location.assign(targetUrl);
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await initI18n();
    setupLanguageSelector();
  });
} else {
  (async () => {
    await initI18n();
    setupLanguageSelector();
  })();
}
