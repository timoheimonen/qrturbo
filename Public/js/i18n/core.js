// QRTurbo.app - Internationalization (i18n) Core System
// 100% client-side, cookie-free localization. Every language has its own
// pre-rendered URL (/, /fi/, /de/ ...); this file provides the strings that
// JavaScript creates at runtime and switches between the language URLs.

const supportedLanguages = new Set(['en', 'da', 'de', 'es', 'fi', 'fr', 'it', 'ja', 'ko', 'no', 'sv', 'zh']);
const LANGUAGE_STORAGE_KEY = 'qrturbo_lang';

// The page language is fixed by the pre-rendered document.
const pageLang = document.documentElement.getAttribute('lang');
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
      qrTypes: 'QR code types'
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
      qrSize: 'QR Code Size',
      foregroundColor: 'Foreground Color',
      backgroundColor: 'Background Color',
      transparentBackground: 'Transparent background',
      errorCorrection: 'Error Correction',
      downloadFormat: 'Download Format',
      dotStyle: 'Dot Style',
      cornerSquare: 'Corner Square',
      cornerDot: 'Corner Dot',
      quietZone: 'Quiet Zone (Margin)',
      logoSize: 'Logo Size',
      logoMargin: 'Logo Margin',
      logo: 'Logo (Optional)',
      styleOptions: 'Style Options',
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
      frameColor: 'Frame color'
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
      generate: 'Create QR Code',
      download: 'Download QR Code',
      reset: 'Reset to Defaults',
      customize: 'Customize Appearance (Optional)',
      chooseLogo: 'Choose Image',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      showPayload: 'Show QR data',
      hidePayload: 'Hide QR data'
    },
    options: {
      sizeMedium: 'Screen (512 px)',
      sizeLarge: 'Large (1024 px)',
      sizePrint: 'Print (2048 px)',
      sizePoster: 'Poster (4096 px)',
      frameNone: 'No frame',
      frameBannerBottom: 'Label below',
      frameBannerTop: 'Label above',
      frameOutline: 'Outline with label',
      errorLow: 'L - Low (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - High (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vector)',
      formatPdf: 'PDF (document)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'None',
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
      appTargetAndroid: 'Use Android if no web URL'
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
      lowContrast:
        '⚠️ Low contrast detected. Your QR code may be difficult to scan. Consider using darker foreground or lighter background.',
      dataEmpty: 'QR code data is empty.',
      noData: 'No data provided for QR code.',
      libraryLoadFailed: 'QR Code library failed to load. Please refresh the page.',
      generationError: 'Error generating QR code',
      dataTooLong: 'This content is too large for the selected QR error correction level. Shorten it or choose a lower level.',
      pdfExportFailed: 'PDF export failed. Please try again.',
      generateFirst: 'Please generate a QR code first.',
      resetSuccess: 'Customization reset to defaults',
      largeImageWarning:
        '⚠️ Large image file ({{size}}MB). Consider using a smaller image for better performance.',
      invalidImageFile: 'Please select a valid image file (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} characters'
    },
    units: {
      modules: '{{count}} modules'
    },
    labels: {
      sms: 'SMS',
      phone: 'Phone Call'
    },
    warnings: {
      lowContrast:
        'Low contrast may make this QR code difficult to scan. Use a darker foreground or lighter background.',
      transparentBackground:
        'Transparent backgrounds depend on the final surface. Test the QR code on the exact background before publishing.',
      quietZoneSmall:
        'The quiet zone is too small. Use at least 4 modules for reliable scanning.',
      denseData:
        'This QR code contains a lot of data for the selected size. Use a larger size or shorten the content.',
      logoErrorCorrection:
        'Large logos scan more reliably with High (H) error correction.',
      logoLarge:
        'The logo is large and may cover too much of the QR code. Test before printing or sharing.'
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
      adjustLook: 'Size and style'
    },
    preview: {
      title: 'Preview',
      localBadge: 'Created on this device'
    },
    how: {
      title: 'How it works',
      step1Title: 'Choose',
      step1Text: 'Pick what the code should do: open a link, join a WiFi network, save a contact and more.',
      step2Title: 'Fill in',
      step2Text: 'Type your content. The preview updates as you write, right here in your browser.',
      step3Title: 'Download',
      step3Text: 'Save it as PNG, SVG or PDF. Test the scan before you print or share it.'
    },
    privacyInfo: {
      title: 'Private by design',
      intro: 'QR codes often carry personal details: a WiFi password, a phone number, a home address. QRTurbo.app is built so that none of it ever reaches a server.',
      localTitle: 'Stays on your device',
      localText: 'QR codes and logos are generated by code running in your browser. There is no backend that could receive what you type.',
      staticTitle: 'No redirects, no expiry',
      staticText: 'Your content is encoded directly in the QR code. Scans are never routed through us, and the code never expires.',
      noTrackingTitle: 'No tracking',
      noTrackingText: 'No analytics, ads, cookies or accounts. Only your language and theme choices are saved, locally in your browser.',
      openSourceTitle: 'Open to inspection',
      openSourceText: 'The full source code is public on GitHub, so anyone can verify these claims.'
    },
    footer: {
      privacy1: 'This free QR code generator runs entirely in your browser.',
      privacy2: 'No data is stored or sent anywhere. No tracking, no ads, no nonsense.',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      github: 'View source on GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Space around the QR code (minimum: 4 modules for reliable scanning)',
      socialHandleHelper:
        'Enter a handle such as @username or paste a full https:// profile URL.'
    },
    frame: {
      defaultText: 'SCAN ME'
    },
    misc: {
      qrPlaceholder: 'QR Code will appear here',
      socialPreview: 'QR target',
      wifiPayloadHidden: 'WiFi configuration — password hidden'
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

// Helper function to replace variables in template strings
function replaceVars(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? '');
}

// Main translation function
function t(key, vars = {}) {
  // Try current language first
  let value = getNestedValue(translations[currentLang], key);

  // Fallback to English if not found
  if (!value && currentLang !== 'en') {
    value = getNestedValue(translations.en, key);
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

// Update dynamic content that depends on current state
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
  if (formError?.dataset.i18nKey) {
    formError.textContent = t(formError.dataset.i18nKey);
  }
}

// Returns the same page in another language, using the hreflang alternates
// that every pre-rendered page declares in its <head>.
function getLanguageUrl(langCode) {
  const alternate = document.querySelector(`link[rel="alternate"][hreflang="${langCode}"]`);
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
