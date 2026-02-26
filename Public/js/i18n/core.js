// QRTurbo.app - Internationalization (i18n) Core System
// 100% client-side, cookie-free localization using localStorage
// Lazy-loads language files on demand for better performance

// Current language (default: English)
let currentLang = 'en';

// Translation database (English embedded, others lazy-loaded)
// Expose on window so locale files can register their translations
const translations = {
  en: {
    meta: {
      title: 'Free QR Code Generator - Customize Colors, Logos & Styles | QRTurbo.app',
      description:
        'Generate free customizable QR codes instantly with QRTurbo.app. Add logos, custom colors, and styles. Create QR codes for URLs, WiFi networks, vCards, SMS, and phone calls. No ads, no tracking – fully browser-based and secure.',
      keywords:
        'QR code generator, custom QR code, QR code with logo, colored QR code, free QR code maker, WiFi QR code, vCard QR code, SMS QR code, online QR tool, no tracking QR generator'
    },
    app: {
      title: 'QRTurbo.app - Free QR Code Generator',
      subtitle:
        'Create customizable QR codes with logos, colors, and styles. Support for URLs, WiFi, vCards, SMS, and phone calls',
      selectLanguage: 'Select Language'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Phone',
      wifi: 'WiFi'
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
      errorCorrection: 'Error Correction',
      downloadFormat: 'Download Format',
      dotStyle: 'Dot Style',
      cornerSquare: 'Corner Square',
      cornerDot: 'Corner Dot',
      quietZone: 'Quiet Zone (Margin)',
      logoSize: 'Logo Size',
      logoMargin: 'Logo Margin',
      logo: 'Logo (Optional)',
      styleOptions: 'Style Options'
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
      smsMessage: 'Your pre-filled message here...'
    },
    actions: {
      generate: 'Create QR Code',
      download: 'Download QR Code',
      reset: 'Reset to Defaults',
      customize: 'Customize Appearance (Optional)',
      chooseLogo: 'Choose Image'
    },
    options: {
      sizeSmall: 'Small (256px)',
      sizeMedium: 'Medium (512px)',
      sizeLarge: 'Large (1024px)',
      errorLow: 'L - Low (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - High (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vector)',
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
      cornerDot: 'Dot'
    },
    alerts: {
      enterText: 'Please enter some text or a URL',
      vcardRequired:
        'Please fill at least one of: First Name, Last Name, Email or Phone number.',
      wifiSsidRequired: 'Please enter the Network Name (SSID).',
      phoneRequired: 'Please enter a phone number.',
      lowContrast:
        '⚠️ Low contrast detected. Your QR code may be difficult to scan. Consider using darker foreground or lighter background.',
      dataEmpty: 'QR code data is empty.',
      noData: 'No data provided for QR code.',
      libraryLoadFailed: 'QR Code library failed to load. Please refresh the page.',
      generationError: 'Error generating QR code',
      generateFirst: 'Please generate a QR code first.',
      resetSuccess: 'Customization reset to defaults',
      largeImageWarning:
        '⚠️ Large image file ({{size}}MB). Consider using a smaller image for better performance.',
      invalidImageFile: 'Please select a valid image file (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} characters'
    },
    labels: {
      sms: 'SMS',
      phone: 'Phone Call'
    },
    footer: {
      privacy1: 'This free QR code generator runs entirely in your browser.',
      privacy2: 'No data is stored or sent anywhere. No tracking, no ads, no nonsense.',
      github: 'View source on GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Space around the QR code (recommended: 4-16px for reliable scanning)'
    },
    misc: {
      qrPlaceholder: 'QR Code will appear here'
    }
  }
};

// Expose translations on window for locale files to register
window.translations = translations;

// List of supported language codes (for browser detection before lazy-loading)
const supportedLanguages = new Set(['en', 'da', 'de', 'es', 'fi', 'fr', 'it', 'ja', 'ko', 'no', 'sv', 'zh']);

// Language loading state management
const loadedLanguages = new Set(['en']); // English is always loaded
const loadingPromises = new Map(); // Prevent duplicate loading

// Helper function to get nested value from object using dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// Helper function to replace variables in template strings
function replaceVars(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] || '');
}

// Helper function to check if a language is available
function isLanguageAvailable(langCode) {
  return !!(translations[langCode] || (window.translations && window.translations[langCode]));
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

// Detect browser language
function getBrowserLanguage() {
  // Get browser language(s) - navigator.languages is preferred (array of preferred languages)
  // Fall back to navigator.language or navigator.userLanguage for older browsers
  const browserLangs = navigator.languages 
    ? Array.from(navigator.languages).map(lang => lang.toLowerCase().split('-')[0])
    : [(navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0]];

  // Find first supported language from browser preferences
  for (const langCode of browserLangs) {
    if (supportedLanguages.has(langCode)) {
      return langCode;
    }
  }

  // Fallback to English if no supported language found
  return 'en';
}

// Dynamic language loader
async function loadLanguage(langCode) {
  // Skip if already loaded
  if (loadedLanguages.has(langCode)) {
    return Promise.resolve();
  }

  // Skip English (always loaded)
  if (langCode === 'en') {
    return Promise.resolve();
  }

  // Check if already loading
  if (loadingPromises.has(langCode)) {
    return loadingPromises.get(langCode);
  }

  // Create loading promise
  const loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `js/i18n/locales/${langCode}.js`;
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

// Set language and update UI (async version with lazy loading)
async function setLanguageAsync(langCode) {
  try {
    // Load language file if needed
    await loadLanguage(langCode);

    // Validate language code using helper function
    if (!isLanguageAvailable(langCode)) {
      langCode = 'en';
    } else if (!translations[langCode] && window.translations && window.translations[langCode]) {
      // Merge if somehow not merged yet
      translations[langCode] = window.translations[langCode];
    }

    // Update current language
    currentLang = langCode;

    // Set HTML lang attribute
    document.documentElement.setAttribute('lang', langCode);

    // Save to localStorage (cookie-free!)
    try {
      localStorage.setItem('qrturbo_lang', langCode);
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }

    // Translate all content
    translatePage();

    // Update meta tags
    updateMetaTags();

    // Update language selector dropdown if it exists
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = currentLang;
    }
  } catch (error) {
    console.error('Error loading language:', error);
    // Fallback to English on error
    if (langCode !== 'en') {
      await setLanguageAsync('en');
    }
  }
}

// Backward compatibility wrapper (now properly async)
async function setLanguage(langCode) {
  try {
    await setLanguageAsync(langCode);
  } catch (error) {
    console.error('Language switch failed:', error);
    // Fallback to English on error
    if (langCode !== 'en') {
      await setLanguageAsync('en');
    }
  }
}

// Translate all elements on the page
function translatePage() {
  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // Translate option values (for select dropdowns)
  document.querySelectorAll('[data-i18n-option]').forEach((el) => {
    const key = el.getAttribute('data-i18n-option');
    el.textContent = t(key);
  });

  // Update dynamic content (character counters, etc.)
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
}

// Update meta tags
function updateMetaTags() {
  document.title = t('meta.title');

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', t('meta.description'));
  }

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', t('meta.keywords'));
  }

  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', t('meta.title'));
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', t('meta.description'));
  }

  // Update Twitter Card tags
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', t('meta.title'));
  }

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) {
    twitterDesc.setAttribute('content', t('meta.description'));
  }
}

// Initialize i18n system
async function initI18n() {
  let savedLang = null;

  // Try to load saved language from localStorage
  try {
    savedLang = localStorage.getItem('qrturbo_lang');

    // Validate it's a supported language (check against supported list, not loaded translations)
    if (savedLang && !supportedLanguages.has(savedLang)) {
      savedLang = null;
      localStorage.removeItem('qrturbo_lang');
    }
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }

  // Determine language: saved > browser > default
  const browserLang = getBrowserLanguage();
  const initialLang = savedLang || browserLang || 'en';

  // Set the language (will lazy-load if needed) - wait for it to complete
  await setLanguageAsync(initialLang);

  // Update language selector if it exists (after language is loaded)
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = currentLang;
  }
}

// Setup language selector event listener
function setupLanguageSelector() {
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      await setLanguage(e.target.value);

      // Re-translate dynamic content
      updateDynamicTranslations();
    });
  }
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
