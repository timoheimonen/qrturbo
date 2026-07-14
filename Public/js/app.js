// QR Code Styling instance (global for download access)
let qrCodeInstance = null;
let previewDebounceTimer = null;
let generationRevision = 0;
let generatedQRCode = null;
let activeGenerationPromise = null;

const THEME_STORAGE_KEY = 'qrturbo_theme';
const DEFAULT_THEME = 'light';
const AUTO_PREVIEW_DELAY = 450;
const WHATSAPP_USERNAME_PATTERN = /^@(?![0-9]{3,35}$)[a-z0-9._]{3,35}$/;
const WHATSAPP_PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const MIN_QUIET_ZONE_MODULES = 4;

const SOCIAL_PLATFORM_CONFIG = {
    instagram: {
        buildUrl: handle => `https://www.instagram.com/${handle}/`
    },
    tiktok: {
        buildUrl: handle => `https://www.tiktok.com/@${handle}`
    },
    youtube: {
        buildUrl: handle => `https://www.youtube.com/@${handle}`
    },
    facebook: {
        buildUrl: handle => `https://www.facebook.com/${handle}`
    },
    x: {
        buildUrl: handle => `https://x.com/${handle}`
    },
    linkedin: {
        buildUrl: (handle, type) => `https://www.linkedin.com/${type === 'company' ? 'company' : 'in'}/${handle}`
    },
    snapchat: {
        buildUrl: handle => `https://www.snapchat.com/add/${handle}`
    },
    pinterest: {
        buildUrl: handle => `https://www.pinterest.com/${handle}/`
    },
    reddit: {
        buildUrl: (handle, type) => `https://www.reddit.com/${type === 'subreddit' ? 'r' : 'user'}/${handle}`
    },
    threads: {
        buildUrl: handle => `https://www.threads.net/@${handle}`
    },
    bluesky: {
        buildUrl: handle => `https://bsky.app/profile/${handle}`
    },
    other: {
        requiresUrl: true
    }
};

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.warn('Service worker registration failed:', error);
        });
    });
}

// Customization state
let qrCustomization = {
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorCorrection: 'M',
    format: 'png',
    dotStyle: 'square',
    cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot',
    margin: MIN_QUIET_ZONE_MODULES,
    logoImage: null,
    logoSize: 0.4,
    logoMargin: 4,
    transparentBackground: false
};

function normalizeTheme(theme) {
    return theme === 'dark' ? 'dark' : DEFAULT_THEME;
}

function getStoredTheme() {
    try {
        return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
    } catch (error) {
        console.warn('localStorage unavailable:', error);
        return normalizeTheme(document.documentElement.dataset.theme);
    }
}

function applyTheme(theme, persist = true) {
    const normalizedTheme = normalizeTheme(theme);
    document.documentElement.dataset.theme = normalizedTheme;

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = normalizedTheme;
    }

    document.querySelectorAll('[data-theme-choice]').forEach(button => {
        const isActive = button.dataset.themeChoice === normalizedTheme;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    if (persist) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
        } catch (error) {
            console.warn('localStorage unavailable:', error);
        }
    }
}

function setupThemeSelector() {
    const themeSelect = document.getElementById('theme-select');
    const themeButtons = document.querySelectorAll('[data-theme-choice]');
    if (!themeSelect && !themeButtons.length) return;

    applyTheme(getStoredTheme(), false);

    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            applyTheme(this.value);
        });
    }

    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            applyTheme(this.dataset.themeChoice);
        });
    });
}

/**
 * @description Calculate luminance for color contrast validation
 */
function calculateLuminance(hex) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * @description Validate color contrast to ensure QR code scannability
 */
function validateColorContrast(fgColor, bgColor) {
    const fgLum = calculateLuminance(fgColor);
    const bgLum = calculateLuminance(bgColor);
    const contrast = Math.abs(fgLum - bgLum);

    if (contrast < 100) {
        alert(t('alerts.lowContrast'));
        return false;
    }
    return true;
}

function getFieldValue(id) {
    return document.getElementById(id).value.trim();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function getUtf8Bytes(value) {
    const text = String(value);
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(text);
    }

    const encoded = unescape(encodeURIComponent(text));
    return Uint8Array.from(encoded, character => character.charCodeAt(0));
}

// The bundled QR renderer consumes one JavaScript character per byte. Passing
// this byte string preserves the original UTF-8 payload instead of truncating
// non-ASCII UTF-16 code units to their low byte.
function encodeTextForQRCode(value) {
    return Array.from(getUtf8Bytes(value), byte => String.fromCharCode(byte)).join('');
}

function calculateQuietZonePixels(size, moduleCount, quietZoneModules = MIN_QUIET_ZONE_MODULES) {
    const safeSize = Math.max(1, Number(size) || 1);
    const safeModuleCount = Math.max(1, Number(moduleCount) || 1);
    const safeQuietZone = Math.max(MIN_QUIET_ZONE_MODULES, Number(quietZoneModules) || 0);

    return Math.ceil((safeQuietZone * safeSize) / (safeModuleCount + (2 * safeQuietZone)));
}

function formatQuietZoneValue(value) {
    return t('units.modules', { count: Number(value) });
}

function cleanSocialHandle(value, platform, type) {
    let handle = String(value)
        .trim()
        .replace(/^@+/, '')
        .replace(/^\/+/, '')
        .replace(/^@+/, '')
        .replace(/\/+$/, '');

    if (platform === 'linkedin') {
        handle = type === 'company'
            ? handle.replace(/^company\//i, '')
            : handle.replace(/^in\//i, '');
    }

    if (platform === 'reddit') {
        handle = type === 'subreddit'
            ? handle.replace(/^r\//i, '')
            : handle.replace(/^(?:u|user)\//i, '');
    }

    if (platform === 'youtube') {
        handle = handle.replace(/^@+/, '');
    }

    return handle;
}

function isValidSocialHandle(value) {
    return /^[A-Za-z0-9._-]+$/.test(value);
}

function getSocialQRCodeUrl(showAlerts = false) {
    const platform = getFieldValue('social-platform') || 'instagram';
    const profileType = getFieldValue('social-profile-type') || 'person';
    const rawValue = getFieldValue('social-handle');
    const config = SOCIAL_PLATFORM_CONFIG[platform] || SOCIAL_PLATFORM_CONFIG.instagram;

    if (!rawValue) {
        return notifyValidation('alerts.socialRequired', showAlerts, 'social-handle');
    }

    if (/^https?:\/\//i.test(rawValue)) {
        return isValidHttpUrl(rawValue)
            ? rawValue
            : notifyValidation('alerts.socialUrlInvalid', showAlerts, 'social-handle');
    }

    if (config.requiresUrl) {
        return notifyValidation('alerts.socialUrlInvalid', showAlerts, 'social-handle');
    }

    const handle = cleanSocialHandle(rawValue, platform, profileType);
    if (!isValidSocialHandle(handle)) {
        return notifyValidation('alerts.socialHandleInvalid', showAlerts, 'social-handle');
    }

    return config.buildUrl(handle, profileType);
}

function normalizeWhatsAppNumber(value) {
    return value.replace(/\D/g, '');
}

function normalizeWhatsAppUsername(value) {
    const username = String(value).trim();
    return username.startsWith('@') ? username : '';
}

function getWhatsAppQRCodeUrl(showAlerts = false) {
    const target = getFieldValue('whatsapp-phone');
    const message = document.getElementById('whatsapp-message').value;
    const username = normalizeWhatsAppUsername(target);

    if (username) {
        if (!WHATSAPP_USERNAME_PATTERN.test(username)) {
            return notifyValidation('alerts.whatsappPhoneRequired', showAlerts, 'whatsapp-phone');
        }

        return `https://wa.me/${username.slice(1)}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    }

    const phoneTarget = String(target).trim();
    if (!WHATSAPP_PHONE_PATTERN.test(phoneTarget)) {
        return notifyValidation('alerts.whatsappPhoneRequired', showAlerts, 'whatsapp-phone');
    }

    const digits = normalizeWhatsAppNumber(phoneTarget);

    if (!digits || digits.length < 7 || digits.length > 15) {
        return notifyValidation('alerts.whatsappPhoneRequired', showAlerts, 'whatsapp-phone');
    }

    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

function escapeICalText(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\r|\n/g, '\\n')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,');
}

function formatICalDateTime(value) {
    const compactValue = value.replace(/[-:]/g, '');
    return compactValue.length === 13 ? `${compactValue}00` : compactValue.slice(0, 15);
}

function escapeMeCardField(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/:/g, '\\:')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\r|\n/g, ' ');
}

function clearFormError() {
    const errorContainer = document.getElementById('form-error');
    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.hidden = true;
        delete errorContainer.dataset.i18nKey;
    }

    document.querySelectorAll?.('[aria-invalid="true"]').forEach(field => {
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-errormessage');
    });
}

function showFormError(message, fieldId, messageKey) {
    const errorContainer = document.getElementById('form-error');
    if (!errorContainer) return false;

    errorContainer.textContent = message;
    errorContainer.hidden = false;
    if (messageKey) {
        errorContainer.dataset.i18nKey = messageKey;
    } else {
        delete errorContainer.dataset.i18nKey;
    }

    if (fieldId) {
        const field = document.getElementById(fieldId);
        field?.setAttribute('aria-invalid', 'true');
        field?.setAttribute('aria-errormessage', 'form-error');
    }

    return true;
}

function notifyValidation(messageKey, showErrors, fieldId) {
    if (showErrors) {
        const message = t(messageKey);
        if (!showFormError(message, fieldId, messageKey)) {
            alert(message);
        }
    }
    return null;
}

function collectQRCodeText(showAlerts = false) {
    const activeTabButton = document.querySelector('.tab-link.active');
    if (!activeTabButton) return null;
    const activeTab = activeTabButton.dataset.tab;

    if (activeTab === 'URLText') {
        const text = document.getElementById('qr-text').value;
        return text.trim() ? text : notifyValidation('alerts.enterText', showAlerts, 'qr-text');
    }

    if (activeTab === 'VCard') {
        const vcard = {
            fn: document.getElementById('vcard-fn').value.trim(),
            ln: document.getElementById('vcard-ln').value.trim(),
            org: document.getElementById('vcard-org').value.trim(),
            title: document.getElementById('vcard-title').value.trim(),
            telWork: document.getElementById('vcard-tel-work').value.trim(),
            telMobile: document.getElementById('vcard-tel-mobile').value.trim(),
            email: document.getElementById('vcard-email').value.trim(),
            url: document.getElementById('vcard-url').value.trim(),
            street: document.getElementById('vcard-street').value.trim(),
            city: document.getElementById('vcard-city').value.trim(),
            state: document.getElementById('vcard-state').value.trim(),
            zip: document.getElementById('vcard-zip').value.trim(),
            country: document.getElementById('vcard-country').value.trim(),
        };

        if (!vcard.fn && !vcard.ln && !vcard.email && !vcard.telMobile && !vcard.telWork) {
            return notifyValidation('alerts.vcardRequired', showAlerts, 'vcard-fn');
        }

        if (vcard.email && !isValidEmail(vcard.email)) {
            return notifyValidation('alerts.emailInvalid', showAlerts, 'vcard-email');
        }

        if (vcard.url && !isValidHttpUrl(vcard.url)) {
            return notifyValidation('alerts.urlInvalid', showAlerts, 'vcard-url');
        }

        const escapeVCardField = (value) => {
            if (!value) return '';
            return String(value)
                .replace(/\\/g, '\\\\')
                .replace(/\r\n|\r|\n/g, '\\n')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,');
        };

        const vCardLines = ['BEGIN:VCARD', 'VERSION:3.0'];
        const hasName = vcard.fn || vcard.ln;
        const displayName = hasName
            ? `${vcard.fn || ''} ${vcard.ln || ''}`.trim()
            : vcard.email || vcard.telMobile || vcard.telWork || vcard.org || 'Contact';

        vCardLines.push(`N:${escapeVCardField(vcard.ln)};${escapeVCardField(vcard.fn)};;;`);
        vCardLines.push(`FN:${escapeVCardField(displayName)}`);
        if (vcard.org) vCardLines.push(`ORG:${escapeVCardField(vcard.org)}`);
        if (vcard.title) vCardLines.push(`TITLE:${escapeVCardField(vcard.title)}`);
        if (vcard.telWork) vCardLines.push(`TEL;TYPE=WORK,VOICE:${escapeVCardField(vcard.telWork)}`);
        if (vcard.telMobile) vCardLines.push(`TEL;TYPE=CELL,VOICE:${escapeVCardField(vcard.telMobile)}`);
        if (vcard.email) vCardLines.push(`EMAIL:${escapeVCardField(vcard.email)}`);
        if (vcard.url) vCardLines.push(`URL:${escapeVCardField(vcard.url)}`);
        if (vcard.street || vcard.city || vcard.state || vcard.zip || vcard.country) {
            vCardLines.push(`ADR;TYPE=HOME:;;${escapeVCardField(vcard.street)};${escapeVCardField(vcard.city)};${escapeVCardField(vcard.state)};${escapeVCardField(vcard.zip)};${escapeVCardField(vcard.country)}`);
        }
        vCardLines.push('END:VCARD');
        return vCardLines.join('\r\n');
    }

    if (activeTab === 'Wifi') {
        const ssid = document.getElementById('wifi-ssid').value;
        const password = document.getElementById('wifi-password').value;
        const authType = document.getElementById('wifi-auth').value;
        const isHidden = document.getElementById('wifi-hidden').checked;

        if (!ssid.length) {
            return notifyValidation('alerts.wifiSsidRequired', showAlerts, 'wifi-ssid');
        }

        if (getUtf8Bytes(ssid).length > 32) {
            return notifyValidation('alerts.wifiSsidLengthInvalid', showAlerts, 'wifi-ssid');
        }

        if (authType === 'WPA' && !/^(?:[ -~]{8,63}|[0-9A-Fa-f]{64})$/.test(password)) {
            return notifyValidation('alerts.wifiWpaPasswordInvalid', showAlerts, 'wifi-password');
        }

        if (authType === 'WEP' && !/^(?:[ -~]{5}|[ -~]{13}|[0-9A-Fa-f]{10}|[0-9A-Fa-f]{26})$/.test(password)) {
            return notifyValidation('alerts.wifiWepPasswordInvalid', showAlerts, 'wifi-password');
        }

        const escapeWifi = (s) => s.replace(/([\\;,":])/g, '\\$1');
        let wifiString = `WIFI:S:${escapeWifi(ssid)};T:${authType};`;
        if (authType !== 'nopass') {
            wifiString += `P:${escapeWifi(password)};`;
        }
        if (isHidden) {
            wifiString += 'H:true;';
        }
        return wifiString;
    }

    if (activeTab === 'SMSPhone') {
        const type = document.querySelector('input[name="sms-phone-type"]:checked').value;
        const phoneNumber = document.getElementById('sms-phone-number').value.trim();

        if (!phoneNumber) {
            return notifyValidation('alerts.phoneRequired', showAlerts, 'sms-phone-number');
        }

        return type === 'sms'
            ? `SMSTO:${phoneNumber}:${document.getElementById('sms-message').value}`
            : `tel:${phoneNumber}`;
    }

    if (activeTab === 'Email') {
        const to = getFieldValue('email-to');
        const subject = getFieldValue('email-subject');
        const body = document.getElementById('email-body').value;

        if (!to && !subject && !body.trim()) {
            return notifyValidation('alerts.emailRequired', showAlerts, 'email-to');
        }

        if (to && !isValidEmail(to)) {
            return notifyValidation('alerts.emailInvalid', showAlerts, 'email-to');
        }

        const params = [];
        const encodeMailtoValue = value => encodeURIComponent(
            String(value).replace(/\r\n|\r|\n/g, '\r\n')
        );
        if (subject) params.push(`subject=${encodeMailtoValue(subject)}`);
        if (body) params.push(`body=${encodeMailtoValue(body)}`);
        const query = params.join('&');
        return `mailto:${to}${query ? `?${query}` : ''}`;
    }

    if (activeTab === 'CalendarEvent') {
        const title = getFieldValue('event-title');
        const location = getFieldValue('event-location');
        const start = document.getElementById('event-start').value;
        const end = document.getElementById('event-end').value;
        const description = document.getElementById('event-description').value.trim();

        if (!title || !start) {
            return notifyValidation('alerts.eventRequired', showAlerts, !title ? 'event-title' : 'event-start');
        }

        if (end && new Date(end) < new Date(start)) {
            return notifyValidation('alerts.eventEndInvalid', showAlerts, 'event-end');
        }

        const eventLines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//QRTurbo.app//QR Event//EN',
            'BEGIN:VEVENT',
            `UID:${Date.now()}@qrturbo.app`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
            `DTSTART:${formatICalDateTime(start)}`,
        ];

        if (end) eventLines.push(`DTEND:${formatICalDateTime(end)}`);
        eventLines.push(`SUMMARY:${escapeICalText(title)}`);
        if (location) eventLines.push(`LOCATION:${escapeICalText(location)}`);
        if (description) eventLines.push(`DESCRIPTION:${escapeICalText(description)}`);
        eventLines.push('END:VEVENT', 'END:VCALENDAR');
        return eventLines.join('\r\n');
    }

    if (activeTab === 'Location') {
        const address = getFieldValue('location-address');
        const latitude = getFieldValue('location-lat');
        const longitude = getFieldValue('location-lng');
        const hasLat = latitude !== '';
        const hasLng = longitude !== '';

        if (!address && !hasLat && !hasLng) {
            return notifyValidation('alerts.locationRequired', showAlerts, 'location-address');
        }

        if (hasLat || hasLng) {
            const lat = Number(latitude);
            const lng = Number(longitude);
            if (!hasLat || !hasLng || Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return notifyValidation(
                    'alerts.locationCoordinatesInvalid',
                    showAlerts,
                    !hasLat || Number.isNaN(lat) || lat < -90 || lat > 90 ? 'location-lat' : 'location-lng'
                );
            }
            return address
                ? `geo:${lat},${lng}?q=${encodeURIComponent(address)}`
                : `geo:${lat},${lng}`;
        }

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    if (activeTab === 'SocialMedia') {
        return getSocialQRCodeUrl(showAlerts);
    }

    if (activeTab === 'WhatsApp') {
        return getWhatsAppQRCodeUrl(showAlerts);
    }

    if (activeTab === 'MeCard') {
        const name = getFieldValue('mecard-name');
        const phone = getFieldValue('mecard-phone');
        const email = getFieldValue('mecard-email');
        const url = getFieldValue('mecard-url');
        const address = getFieldValue('mecard-address');

        if (!name && !phone && !email) {
            return notifyValidation('alerts.mecardRequired', showAlerts, 'mecard-name');
        }

        if (email && !isValidEmail(email)) {
            return notifyValidation('alerts.emailInvalid', showAlerts, 'mecard-email');
        }

        if (url && !isValidHttpUrl(url)) {
            return notifyValidation('alerts.urlInvalid', showAlerts, 'mecard-url');
        }

        let meCardString = 'MECARD:';
        if (name) meCardString += `N:${escapeMeCardField(name)};`;
        if (phone) meCardString += `TEL:${escapeMeCardField(phone)};`;
        if (email) meCardString += `EMAIL:${escapeMeCardField(email)};`;
        if (url) meCardString += `URL:${escapeMeCardField(url)};`;
        if (address) meCardString += `ADR:${escapeMeCardField(address)};`;
        return `${meCardString};`;
    }

    if (activeTab === 'AppLink') {
        const webUrl = getFieldValue('app-web-url');
        const iosUrl = getFieldValue('app-ios-url');
        const androidUrl = getFieldValue('app-android-url');
        const target = document.getElementById('app-link-target').value;
        const urls = [webUrl, iosUrl, androidUrl].filter(Boolean);

        if (!urls.length) {
            return notifyValidation('alerts.appLinkRequired', showAlerts, 'app-web-url');
        }

        if (urls.some(url => !isValidHttpUrl(url))) {
            const invalidField = [
                ['app-web-url', webUrl],
                ['app-ios-url', iosUrl],
                ['app-android-url', androidUrl]
            ].find(([, url]) => url && !isValidHttpUrl(url));
            return notifyValidation('alerts.urlInvalid', showAlerts, invalidField?.[0]);
        }

        if (webUrl) {
            return webUrl;
        }

        const selectedStoreUrl = target === 'ios' ? iosUrl : androidUrl;
        const fallbackStoreUrl = target === 'ios' ? androidUrl : iosUrl;
        return selectedStoreUrl || fallbackStoreUrl;
    }

    return notifyValidation('alerts.noData', showAlerts);
}

function estimateQrComplexity(text) {
    const length = new Blob([text]).size;
    if (length > 1200) return 'veryHigh';
    if (length > 700) return 'high';
    if (length > 350) return 'medium';
    return 'low';
}

function getScannabilityWarnings(text, size) {
    const warnings = [];
    const fgLum = calculateLuminance(qrCustomization.fgColor);
    const bgLum = qrCustomization.transparentBackground ? 255 : calculateLuminance(qrCustomization.bgColor);
    const contrast = Math.abs(fgLum - bgLum);
    const complexity = estimateQrComplexity(text);

    if (contrast < 100) {
        warnings.push(t('warnings.lowContrast'));
    }

    if (qrCustomization.transparentBackground) {
        warnings.push(t('warnings.transparentBackground'));
    }

    if (qrCustomization.margin < MIN_QUIET_ZONE_MODULES) {
        warnings.push(t('warnings.quietZoneSmall'));
    }

    if (complexity === 'veryHigh' || (complexity === 'high' && size < 1024) || (complexity === 'medium' && size < 512)) {
        warnings.push(t('warnings.denseData'));
    }

    if (qrCustomization.logoImage && qrCustomization.logoSize >= 0.4 && qrCustomization.errorCorrection !== 'H') {
        warnings.push(t('warnings.logoErrorCorrection'));
    }

    if (qrCustomization.logoImage && qrCustomization.logoSize >= 0.45) {
        warnings.push(t('warnings.logoLarge'));
    }

    return warnings;
}

function renderScannabilityWarnings(warnings) {
    const warningsContainer = document.getElementById('scan-warnings');
    if (!warningsContainer) return;

    if (!warnings.length) {
        warningsContainer.style.display = 'none';
        warningsContainer.innerHTML = '';
        return;
    }

    warningsContainer.innerHTML = warnings
        .map(warning => `<p>${warning}</p>`)
        .join('');
    warningsContainer.style.display = 'block';
}

function clearGeneratedQRCode() {
    const qrContainer = document.getElementById('qr-container');
    const qrCanvasContainer = document.getElementById('qr-canvas-container');
    const qrImage = document.getElementById('qr-image');
    const downloadBtn = document.getElementById('download-btn');
    const qrCodeText = document.getElementById('qr-code-text');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const payloadRevealBtn = document.getElementById('payload-reveal-btn');

    qrCodeInstance = null;
    generatedQRCode = null;
    if (qrCanvasContainer) {
        qrCanvasContainer.innerHTML = '';
        qrCanvasContainer.classList.remove('transparent-preview');
    }
    if (qrPlaceholder) qrPlaceholder.style.display = 'block';
    if (qrImage) {
        qrImage.src = '';
        qrImage.style.display = 'none';
    }
    if (downloadBtn) {
        downloadBtn.style.display = 'none';
        downloadBtn.disabled = true;
    }
    if (qrCodeText) {
        qrCodeText.textContent = '';
        qrCodeText.style.display = 'none';
    }
    if (payloadRevealBtn) {
        payloadRevealBtn.hidden = true;
        payloadRevealBtn.dataset.revealed = 'false';
    }
    if (qrContainer) {
        qrContainer.classList.remove('loading');
        qrContainer.setAttribute('aria-busy', 'false');
    }
    renderScannabilityWarnings([]);
}

function invalidateGeneratedQRCode() {
    generationRevision += 1;
    clearFormError();
    clearGeneratedQRCode();
    return generationRevision;
}

function schedulePreview({ showErrors = false } = {}) {
    window.clearTimeout(previewDebounceTimer);
    const revision = invalidateGeneratedQRCode();
    previewDebounceTimer = window.setTimeout(() => {
        activeGenerationPromise = generateQRCode({ revision, animate: false, showErrors });
        activeGenerationPromise.finally(() => {
            if (generationRevision === revision) activeGenerationPromise = null;
        });
    }, AUTO_PREVIEW_DELAY);
}

function getActiveTabName() {
    return document.querySelector('.tab-link.active')?.dataset.tab || null;
}

function getPayloadPresentation(activeTab, payload) {
    const isSensitive = activeTab === 'Wifi' && document.getElementById('wifi-auth')?.value !== 'nopass';
    return {
        isSensitive,
        displayText: isSensitive ? t('misc.wifiPayloadHidden') : payload
    };
}

function getGenerationErrorMessage(error) {
    const details = String(error?.message || error || '');
    return /code length overflow|data too long|capacity/i.test(details)
        ? t('alerts.dataTooLong')
        : `${t('alerts.generationError')}${details ? `: ${details}` : ''}`;
}

/**
 * @description Main function to generate the QR code based on the active tab and user input.
 */
async function generateQRCode(options = {}) {
    const revision = Number.isInteger(options.revision) ? options.revision : generationRevision;
    const animate = options.animate !== false;
    const showErrors = Boolean(options.showErrors);

    clearFormError();
    const text = collectQRCodeText(showErrors);

    if (!text) {
        if (revision === generationRevision) {
            clearGeneratedQRCode();
        }
        return null;
    }

    const qrContainer = document.getElementById('qr-container');
    const qrCanvasContainer = document.getElementById('qr-canvas-container');
    const qrImage = document.getElementById('qr-image');
    const downloadBtn = document.getElementById('download-btn');
    const qrCodeText = document.getElementById('qr-code-text');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const payloadRevealBtn = document.getElementById('payload-reveal-btn');
    const size = parseInt(document.getElementById('size-select').value);
    const qrText = String(text);
    const activeTab = getActiveTabName();

    if (typeof QRCodeStyling === 'undefined') {
        showFormError(t('alerts.libraryLoadFailed'));
        return null;
    }

    qrContainer.classList.add('loading');
    qrContainer.setAttribute('aria-busy', 'true');
    qrPlaceholder.style.display = 'none';
    qrImage.style.display = 'none';
    downloadBtn.style.display = 'none';
    downloadBtn.disabled = true;
    qrCodeText.style.display = 'none';

    const config = {
        width: size,
        height: size,
        type: qrCustomization.format === 'svg' ? 'svg' : 'canvas',
        data: encodeTextForQRCode(qrText),
        dotsOptions: {
            color: qrCustomization.fgColor,
            type: qrCustomization.dotStyle
        },
        backgroundOptions: {
            color: qrCustomization.transparentBackground ? 'transparent' : qrCustomization.bgColor
        },
        cornersSquareOptions: {
            color: qrCustomization.fgColor,
            type: qrCustomization.cornerSquareStyle
        },
        cornersDotOptions: {
            color: qrCustomization.fgColor,
            type: qrCustomization.cornerDotStyle
        },
        qrOptions: {
            errorCorrectionLevel: qrCustomization.errorCorrection
        },
        margin: 0
    };

    if (qrCustomization.logoImage) {
        config.image = qrCustomization.logoImage;
        config.imageOptions = {
            hideBackgroundDots: true,
            imageSize: qrCustomization.logoSize,
            margin: qrCustomization.logoMargin,
            crossOrigin: 'anonymous'
        };
    }

    try {
        const candidate = new QRCodeStyling(config);
        const renderType = qrCustomization.format === 'svg' ? 'svg' : 'png';

        // First render resolves automatic QR version selection and therefore
        // the exact module count used for a standards-sized quiet zone.
        await candidate.getRawData(renderType);
        if (revision !== generationRevision) return null;

        const moduleCount = candidate._qr?.getModuleCount?.();
        if (!moduleCount) {
            throw new Error('QR module count was not available');
        }

        const margin = calculateQuietZonePixels(size, moduleCount, qrCustomization.margin);
        candidate.update({ margin });
        await candidate.getRawData(renderType);
        if (revision !== generationRevision) return null;

        qrCanvasContainer.innerHTML = '';
        qrCanvasContainer.classList.toggle('transparent-preview', qrCustomization.transparentBackground);
        candidate.append(qrCanvasContainer);

        const presentation = getPayloadPresentation(activeTab, qrText);
        const snapshot = {
            revision,
            activeTab,
            payload: qrText,
            format: qrCustomization.format,
            filename: buildQRCodeFilename(activeTab, qrText),
            isSensitive: presentation.isSensitive,
            instance: candidate,
            moduleCount,
            margin
        };
        qrCodeInstance = candidate;
        generatedQRCode = snapshot;

        renderScannabilityWarnings(getScannabilityWarnings(qrText, size));

        qrCodeText.textContent = presentation.displayText;
        qrCodeText.style.display = 'block';
        if (payloadRevealBtn) {
            payloadRevealBtn.hidden = !presentation.isSensitive;
            payloadRevealBtn.dataset.revealed = 'false';
            payloadRevealBtn.textContent = t('actions.showPayload');
        }

        qrContainer.classList.remove('loading');
        qrContainer.setAttribute('aria-busy', 'false');
        downloadBtn.disabled = false;
        downloadBtn.style.display = 'block';

        if (animate) {
            qrContainer.style.animation = 'none';
            qrContainer.offsetHeight;
            qrContainer.style.animation = 'qrAppear 0.6s ease-out';
        }
        return snapshot;
    } catch (error) {
        console.error('QR Code Generation Error:', error);
        if (revision === generationRevision) {
            clearGeneratedQRCode();
            showFormError(getGenerationErrorMessage(error));
            qrPlaceholder.style.display = 'block';
        }
        return null;
    } finally {
        if (revision === generationRevision) {
            qrContainer.classList.remove('loading');
            qrContainer.setAttribute('aria-busy', 'false');
        }
    }
}

/**
 * @description Converts a string into byte values for PDF syntax.
 */
function stringToPdfBytes(value) {
    const bytes = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i++) {
        bytes[i] = value.charCodeAt(i) & 0xff;
    }
    return bytes;
}

/**
 * @description Joins binary and text parts into one Blob.
 */
function createBlobFromParts(parts, type) {
    const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
    const bytes = new Uint8Array(totalLength);
    let offset = 0;

    for (const part of parts) {
        bytes.set(part, offset);
        offset += part.length;
    }

    return new Blob([bytes], { type });
}

function formatPdfNumber(value) {
    return Number(value).toFixed(2).replace(/\.?0+$/, '');
}

function escapePdfText(value) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function getPdfSafeText(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[^\x20-\x7E]/g, '?');
}

function getPdfPayloadLines(payloadText) {
    const cleanText = getPdfSafeText(payloadText);
    if (!cleanText) return [];

    const maxLines = 2;
    const maxLineLength = 68;
    const lines = [];
    let remaining = cleanText;

    while (remaining && lines.length < maxLines) {
        if (remaining.length <= maxLineLength) {
            lines.push(remaining);
            remaining = '';
            break;
        }

        let splitAt = remaining.lastIndexOf(' ', maxLineLength);
        if (splitAt < 24) splitAt = maxLineLength;

        lines.push(remaining.slice(0, splitAt).trim());
        remaining = remaining.slice(splitAt).trim();
    }

    if (remaining && lines.length) {
        lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, maxLineLength - 3)}...`;
    }

    return lines;
}

function imageDataToRgbBytes(imageData) {
    const rgbBytes = new Uint8Array(imageData.width * imageData.height * 3);
    const rgbaBytes = imageData.data;
    let rgbIndex = 0;

    for (let i = 0; i < rgbaBytes.length; i += 4) {
        rgbBytes[rgbIndex++] = rgbaBytes[i];
        rgbBytes[rgbIndex++] = rgbaBytes[i + 1];
        rgbBytes[rgbIndex++] = rgbaBytes[i + 2];
    }

    return rgbBytes;
}

function createQRCodePdfBlob(imageData, payloadText = '', includePayload = false) {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const qrSize = 360;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 292;
    const payloadLines = includePayload ? getPdfPayloadLines(payloadText) : [];
    const rgbBytes = imageDataToRgbBytes(imageData);
    const parts = [];
    const offsets = [];
    let position = 0;

    function appendString(value) {
        const bytes = stringToPdfBytes(value);
        parts.push(bytes);
        position += bytes.length;
    }

    function appendBytes(bytes) {
        parts.push(bytes);
        position += bytes.length;
    }

    function beginObject(id) {
        offsets[id] = position;
        appendString(`${id} 0 obj\n`);
    }

    function endObject() {
        appendString('endobj\n');
    }

    const contentLines = [
        'q',
        `${formatPdfNumber(qrSize)} 0 0 ${formatPdfNumber(qrSize)} ${formatPdfNumber(qrX)} ${formatPdfNumber(qrY)} cm`,
        '/Im0 Do',
        'Q'
    ];

    if (payloadLines.length) {
        contentLines.push(
            'BT',
            '/F1 10 Tf',
            '0.25 g',
            '12 TL',
            `${formatPdfNumber(qrX)} ${formatPdfNumber(qrY - 24)} Td`
        );

        payloadLines.forEach((line, index) => {
            if (index > 0) contentLines.push('T*');
            contentLines.push(`(${escapePdfText(line)}) Tj`);
        });

        contentLines.push('ET');
    }

    const contentStream = `${contentLines.join('\n')}\n`;

    appendString('%PDF-1.4\n% QRTurbo PDF export\n');

    beginObject(1);
    appendString('<< /Type /Catalog /Pages 2 0 R >>\n');
    endObject();

    beginObject(2);
    appendString('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n');
    endObject();

    beginObject(3);
    appendString(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageWidth)} ${formatPdfNumber(pageHeight)}] ` +
        '/Resources << /XObject << /Im0 4 0 R >> /Font << /F1 6 0 R >> >> /Contents 5 0 R >>\n'
    );
    endObject();

    beginObject(4);
    appendString(
        `<< /Type /XObject /Subtype /Image /Width ${imageData.width} /Height ${imageData.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${rgbBytes.length} >>\nstream\n`
    );
    appendBytes(rgbBytes);
    appendString('\nendstream\n');
    endObject();

    beginObject(5);
    appendString(`<< /Length ${stringToPdfBytes(contentStream).length} >>\nstream\n`);
    appendString(contentStream);
    appendString('endstream\n');
    endObject();

    beginObject(6);
    appendString('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n');
    endObject();

    const xrefOffset = position;
    appendString('xref\n0 7\n');
    appendString('0000000000 65535 f \n');
    for (let i = 1; i <= 6; i++) {
        appendString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    }
    appendString(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

    return createBlobFromParts(parts, 'application/pdf');
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Blob reading failed'));
        reader.readAsDataURL(blob);
    });
}

function loadImageFromDataURL(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image loading failed'));
        image.src = dataUrl;
    });
}

async function getOpaqueImageDataFromBlob(blob) {
    const dataUrl = await blobToDataURL(blob);
    const image = await loadImageFromDataURL(dataUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, width, height);

    return context.getImageData(0, 0, width, height);
}

function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadQRCodePdf(snapshot) {
    const qrPngBlob = await snapshot.instance.getRawData('png');
    if (!qrPngBlob) {
        throw new Error('QR PNG data was not available');
    }

    const imageData = await getOpaqueImageDataFromBlob(qrPngBlob);
    // The PDF intentionally contains only the QR image. Payload captions can
    // leak Wi-Fi passwords and other private data into otherwise shared files.
    const pdfBlob = createQRCodePdfBlob(imageData);

    triggerBlobDownload(pdfBlob, `${snapshot.filename}.pdf`);
}

function animateDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.style.animation = 'none';
    downloadBtn.offsetHeight; // Force reflow
    downloadBtn.style.animation = 'bounceIn 0.6s ease-out';
}

function buildQRCodeFilename(activeTab, payload = '') {
    let filename = 'qrcode_unknown';

    if (activeTab === 'URLText') {
        const urlText = String(payload).trim();
        if (urlText) {
            if (urlText.startsWith('http')) {
                try {
                    const url = new URL(urlText);
                    filename = `url_${url.hostname.replace(/^www\./, '')}`;
                } catch {
                    filename = `text_${urlText.substring(0, 30)}`;
                }
            } else {
                filename = `text_${urlText.substring(0, 30)}`;
            }
        }
    } else if (activeTab === 'VCard') {
        const firstName = document.getElementById('vcard-fn').value.trim();
        const lastName = document.getElementById('vcard-ln').value.trim();
        const email = document.getElementById('vcard-email').value.trim();
        const org = document.getElementById('vcard-org').value.trim();
        
        if (firstName || lastName) {
            filename = `vcard_${firstName || ''}_${lastName || ''}`.trim();
        } else if (email) {
            filename = `vcard_${email.split('@')[0]}`;
        } else if (org) {
            filename = `vcard_${org}`;
        } else {
            filename = 'vcard_contact';
        }
    } else if (activeTab === 'Wifi') {
        const ssid = document.getElementById('wifi-ssid').value;
        if (ssid) {
            filename = `wifi_${ssid}`;
        } else {
            filename = 'wifi_network';
        }
    } else if (activeTab === 'SMSPhone') {
        const type = document.querySelector('input[name="sms-phone-type"]:checked').value;
        const phoneNumber = document.getElementById('sms-phone-number').value.trim();
        if (phoneNumber) {
            filename = `${type}_${phoneNumber.replace(/[^\d+]/g, '')}`;
        } else {
            filename = `${type}_number`;
        }
    } else if (activeTab === 'Email') {
        const emailTo = document.getElementById('email-to').value.trim();
        filename = emailTo ? `email_${emailTo.split('@')[0]}` : 'email_message';
    } else if (activeTab === 'CalendarEvent') {
        const eventTitle = document.getElementById('event-title').value.trim();
        filename = eventTitle ? `event_${eventTitle}` : 'calendar_event';
    } else if (activeTab === 'Location') {
        const address = document.getElementById('location-address').value.trim();
        filename = address ? `location_${address.substring(0, 30)}` : 'geo_location';
    } else if (activeTab === 'SocialMedia') {
        const platform = document.getElementById('social-platform').value;
        const handle = document.getElementById('social-handle').value.trim();
        filename = handle
            ? `social_${platform}_${handle.replace(/^https?:\/\//i, '').substring(0, 30)}`
            : `social_${platform}`;
    } else if (activeTab === 'WhatsApp') {
        const whatsappTarget = document.getElementById('whatsapp-phone').value.trim();
        filename = whatsappTarget
            ? `whatsapp_${whatsappTarget.replace(/^@/, '').replace(/[^\dA-Za-z._-]/g, '')}`
            : 'whatsapp_message';
    } else if (activeTab === 'MeCard') {
        const name = document.getElementById('mecard-name').value.trim();
        const email = document.getElementById('mecard-email').value.trim();
        filename = name ? `mecard_${name}` : email ? `mecard_${email.split('@')[0]}` : 'mecard_contact';
    } else if (activeTab === 'AppLink') {
        const webUrl = document.getElementById('app-web-url').value.trim();
        if (webUrl) {
            try {
                filename = `app_${new URL(webUrl).hostname.replace(/^www\./, '')}`;
            } catch {
                filename = 'app_link';
            }
        } else {
            filename = 'app_link';
        }
    }

    const safeText = filename
        .replace(/[^a-z0-9\-_]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50)
        || 'qrcode_unknown';

    return `qrcode_${safeText}`;
}

/**
 * @description Downloads only the immutable, fully rendered input revision.
 */
async function downloadQRCode() {
    window.clearTimeout(previewDebounceTimer);

    if (activeGenerationPromise) {
        await activeGenerationPromise;
    }

    let snapshot = generatedQRCode;
    if (!snapshot || snapshot.revision !== generationRevision) {
        activeGenerationPromise = generateQRCode({
            revision: generationRevision,
            animate: false,
            showErrors: true
        });
        snapshot = await activeGenerationPromise;
        activeGenerationPromise = null;
    }

    if (!snapshot || snapshot.revision !== generationRevision) {
        showFormError(t('alerts.generateFirst'));
        return;
    }

    const extension = snapshot.format;
    const downloadBtn = document.getElementById('download-btn');

    try {
        downloadBtn.disabled = true;

        if (extension === 'pdf') {
            await downloadQRCodePdf(snapshot);
        } else {
            await snapshot.instance.download({
                name: snapshot.filename,
                extension: extension
            });
        }

        if (generatedQRCode === snapshot) {
            animateDownloadButton();
        }
    } catch (error) {
        console.error('Download failed:', error);
        if (generatedQRCode === snapshot) {
            showFormError(extension === 'pdf' ? t('alerts.pdfExportFailed') : t('alerts.generationError'));
        }
    } finally {
        if (generatedQRCode === snapshot) {
            downloadBtn.disabled = false;
        }
    }
}

// Setup page logic after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    registerServiceWorker();
    setupThemeSelector();

    // --- Element Selectors ---
    const tabsContainer = document.getElementById('tabs');
    const wifiAuthSelect = document.getElementById('wifi-auth');
    const wifiPasswordField = document.getElementById('wifi-password');
    const wifiPasswordToggle = document.getElementById('wifi-password-toggle');
    const smsPhoneTypeRadios = document.querySelectorAll('input[name="sms-phone-type"]');
    const smsMessageGroup = document.getElementById('sms-message-group');
    const qrTextInput = document.getElementById('qr-text');
    const charCountDisplay = document.getElementById('char-count');
    const smsMessageInput = document.getElementById('sms-message');
    const smsCharCountDisplay = document.getElementById('sms-char-count');
    const socialPlatformSelect = document.getElementById('social-platform');
    const socialProfileTypeSelect = document.getElementById('social-profile-type');
    const socialProfileTypeGroup = document.getElementById('social-profile-type-group');
    const socialHandleInput = document.getElementById('social-handle');
    const socialPreviewUrl = document.getElementById('social-preview-url');
    const downloadBtn = document.getElementById('download-btn');
    const payloadRevealBtn = document.getElementById('payload-reveal-btn');

    // --- Event Listeners ---

    downloadBtn?.addEventListener('click', downloadQRCode);
    payloadRevealBtn?.addEventListener('click', function() {
        if (!generatedQRCode?.isSensitive || generatedQRCode.revision !== generationRevision) {
            return;
        }

        const qrCodeText = document.getElementById('qr-code-text');
        const isRevealed = this.dataset.revealed !== 'true';
        this.dataset.revealed = String(isRevealed);
        this.textContent = t(isRevealed ? 'actions.hidePayload' : 'actions.showPayload');
        qrCodeText.textContent = isRevealed
            ? generatedQRCode.payload
            : t('misc.wifiPayloadHidden');
    });

    // Track character count for the URL/Text input
    qrTextInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCountDisplay.textContent = t('counters.characters', { current: currentLength, max: 2000 });
        charCountDisplay.classList.toggle('warning', currentLength >= 1800);
        schedulePreview({ showErrors: true });
    });

    // Track character count for the SMS message input
    smsMessageInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        smsCharCountDisplay.textContent = t('counters.characters', { current: currentLength, max: 300 });
        smsCharCountDisplay.classList.toggle('warning', currentLength >= 250);
        schedulePreview({ showErrors: true });
    });

    // Add a subtle scale effect on input focus for better UX
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="url"], textarea').forEach(el => {
        el.addEventListener('focus', function() {
            // The :focus CSS already handles this, but if you wanted JS-only:
            // this.style.transform = 'scale(1.02)';
        });
        el.addEventListener('blur', function() {
            // The :focus CSS already handles this, but if you wanted JS-only:
            // this.style.transform = 'scale(1)';
        });
    });

    // --- SMS/Phone Form Logic ---
    function updateSmsPhoneUI() {
        const selectedType = document.querySelector('input[name="sms-phone-type"]:checked').value;
        const isSms = selectedType === 'sms';
        // Use 'flex' to match the .input-group display property
        smsMessageGroup.style.display = isSms ? 'flex' : 'none';
    }
    smsPhoneTypeRadios.forEach(radio => radio.addEventListener('change', updateSmsPhoneUI));
    smsPhoneTypeRadios.forEach(radio => radio.addEventListener('change', schedulePreview));
    // Set initial state on page load
    updateSmsPhoneUI();

    // --- Wifi Form Logic ---
    function updateWifiPasswordToggleLabel() {
        wifiPasswordToggle.textContent = t(
            wifiPasswordField.type === 'password' ? 'actions.showPassword' : 'actions.hidePassword'
        );
    }

    function updateWifiPasswordState() {
        const isPasswordNeeded = wifiAuthSelect.value !== 'nopass';
        wifiPasswordField.disabled = !isPasswordNeeded;
        wifiPasswordToggle.disabled = !isPasswordNeeded;
        if (!isPasswordNeeded) {
            wifiPasswordField.value = ''; // Clear password if not needed
            wifiPasswordField.type = 'password';
        }
        updateWifiPasswordToggleLabel();
    }

    // Toggle password field enabled state based on authentication type
    wifiAuthSelect.addEventListener('change', function() {
        updateWifiPasswordState();
        schedulePreview();
    });
    updateWifiPasswordState();

    wifiPasswordToggle.addEventListener('click', function() {
        const isHidden = wifiPasswordField.type === 'password';
        wifiPasswordField.type = isHidden ? 'text' : 'password';
        updateWifiPasswordToggleLabel();
    });

    // --- Social Media Form Logic ---
    function updateSocialProfileTypeUI() {
        if (!socialPlatformSelect || !socialProfileTypeSelect || !socialProfileTypeGroup) return;

        const platform = socialPlatformSelect.value;
        const allowedTypes = platform === 'linkedin'
            ? ['person', 'company']
            : platform === 'reddit'
                ? ['person', 'subreddit']
                : ['person'];

        socialProfileTypeGroup.style.display = allowedTypes.length > 1 ? 'flex' : 'none';

        Array.from(socialProfileTypeSelect.options).forEach(option => {
            option.hidden = !allowedTypes.includes(option.value);
        });

        if (!allowedTypes.includes(socialProfileTypeSelect.value)) {
            socialProfileTypeSelect.value = 'person';
        }
    }

    function updateSocialPreview() {
        if (!socialPreviewUrl) return;
        socialPreviewUrl.textContent = getSocialQRCodeUrl(false) || '-';
    }

    function updateSocialMediaUI() {
        updateSocialProfileTypeUI();
        updateSocialPreview();
    }

    [socialPlatformSelect, socialProfileTypeSelect, socialHandleInput].forEach(element => {
        if (!element) return;
        const eventName = element.tagName === 'SELECT' ? 'change' : 'input';
        element.addEventListener(eventName, function() {
            updateSocialMediaUI();
        });
    });
    updateSocialMediaUI();


    // --- Tab Switching Logic ---
    function activateTab(nextTab, { focus = false } = {}) {
        if (!nextTab || nextTab.classList.contains('active')) {
            if (focus) nextTab?.focus();
            return;
        }

        const tabName = nextTab.dataset.tab;
        const currentScrollY = window.scrollY;

        tabsContainer.querySelectorAll('.tab-link').forEach(tab => {
            const isSelected = tab === nextTab;
            tab.classList.toggle('active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            const isSelected = content.id === tabName;
            content.hidden = !isSelected;
            content.style.display = isSelected ? 'block' : 'none';
        });

        window.scrollTo(0, currentScrollY);

        updateWifiPasswordState();
        updateSmsPhoneUI();
        updateSocialMediaUI();
        updateDynamicTranslations();
        schedulePreview();

        if (focus) nextTab.focus();
    }

    tabsContainer.addEventListener('click', function(event) {
        activateTab(event.target.closest('.tab-link'));
    });

    tabsContainer.addEventListener('keydown', function(event) {
        const currentTab = event.target.closest('.tab-link');
        if (!currentTab) return;

        const tabs = Array.from(tabsContainer.querySelectorAll('.tab-link'));
        const currentIndex = tabs.indexOf(currentTab);
        let nextIndex = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
            event.preventDefault();
            activateTab(tabs[nextIndex], { focus: true });
        }
    });

    // --- Customization Panel Event Handlers ---

    // Toggle customization panel
    const customizeToggle = document.getElementById('customize-toggle');
    const customizePanel = document.getElementById('customize-panel');
    const customizeIcon = document.getElementById('customize-icon');

    if (customizeToggle) {
        customizeToggle.addEventListener('click', function() {
            const isExpanded = customizePanel.style.display === 'block';
            customizePanel.style.display = isExpanded ? 'none' : 'block';
            customizeIcon.textContent = isExpanded ? '▶' : '▼';
            customizeToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Color picker sync (picker <-> text input)
    function setupColorSync(colorInputId, textInputId, stateKey) {
        const colorInput = document.getElementById(colorInputId);
        const textInput = document.getElementById(textInputId);

        if (colorInput && textInput) {
            colorInput.addEventListener('input', function() {
                textInput.value = this.value.toUpperCase();
                qrCustomization[stateKey] = this.value;
                schedulePreview();
            });

            textInput.addEventListener('input', function() {
                const hex = this.value.trim();
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    colorInput.value = hex;
                    qrCustomization[stateKey] = hex;
                    schedulePreview();
                }
            });
        }
    }

    setupColorSync('qr-fg-color', 'qr-fg-color-text', 'fgColor');
    setupColorSync('qr-bg-color', 'qr-bg-color-text', 'bgColor');

    const transparentBackgroundCheckbox = document.getElementById('qr-transparent-bg');
    function updateTransparentBackgroundUI() {
        const isTransparent = transparentBackgroundCheckbox?.checked || false;
        qrCustomization.transparentBackground = isTransparent;
        document.getElementById('qr-bg-color').disabled = isTransparent;
        document.getElementById('qr-bg-color-text').disabled = isTransparent;
    }

    if (transparentBackgroundCheckbox) {
        transparentBackgroundCheckbox.addEventListener('change', function() {
            updateTransparentBackgroundUI();
            schedulePreview();
        });
        updateTransparentBackgroundUI();
    }

    // Error correction change
    const errorCorrectionSelect = document.getElementById('qr-error-correction');
    if (errorCorrectionSelect) {
        errorCorrectionSelect.addEventListener('change', function() {
            qrCustomization.errorCorrection = this.value;
            schedulePreview();
        });
    }

    // Format change
    const formatSelect = document.getElementById('qr-format');
    if (formatSelect) {
        formatSelect.addEventListener('change', function() {
            qrCustomization.format = this.value;
            schedulePreview();
        });
    }

    const sizeSelect = document.getElementById('size-select');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', schedulePreview);
    }

    document.querySelectorAll('.tab-content input, .tab-content textarea, .tab-content select').forEach(element => {
        if (element === qrTextInput || element === smsMessageInput || element.name === 'sms-phone-type' || element === wifiAuthSelect) {
            return;
        }

        const eventName = element.type === 'checkbox' || element.type === 'radio' || element.tagName === 'SELECT'
            ? 'change'
            : 'input';
        element.addEventListener(eventName, () => schedulePreview({
            showErrors: eventName === 'input'
        }));
    });

    // Reset customization button
    const resetCustomizationBtn = document.getElementById('reset-customization');
    if (resetCustomizationBtn) {
        resetCustomizationBtn.addEventListener('click', function() {
            // Reset to defaults
            qrCustomization = {
                fgColor: '#000000',
                bgColor: '#ffffff',
                errorCorrection: 'M',
                format: 'png',
                dotStyle: 'square',
                cornerSquareStyle: 'extra-rounded',
                cornerDotStyle: 'dot',
                margin: MIN_QUIET_ZONE_MODULES,
                logoImage: null,
                logoSize: 0.4,
                logoMargin: 4,
                transparentBackground: false
            };

            // Update UI
            document.getElementById('qr-fg-color').value = '#000000';
            document.getElementById('qr-fg-color-text').value = '#000000';
            document.getElementById('qr-bg-color').value = '#ffffff';
            document.getElementById('qr-bg-color-text').value = '#ffffff';
            document.getElementById('qr-transparent-bg').checked = false;
            document.getElementById('qr-error-correction').value = 'M';
            document.getElementById('qr-format').value = 'png';
            updateTransparentBackgroundUI();

            // Reset logo
            const logoInput = document.getElementById('qr-logo');
            if (logoInput) {
                logoInput.value = '';
                document.getElementById('logo-preview').style.display = 'none';
                document.getElementById('logo-controls').style.display = 'none';
                document.getElementById('logo-filename').textContent = '';
                document.getElementById('logo-remove-btn').style.display = 'none';
                document.getElementById('qr-logo-size').value = '0.4';
                document.getElementById('qr-logo-size-value').textContent = '40%';
                document.getElementById('qr-logo-margin').value = '4';
                document.getElementById('qr-logo-margin-value').textContent = '4px';
            }

            // Reset style options
            document.getElementById('qr-dot-style').value = 'square';
            document.getElementById('qr-corner-square-style').value = 'extra-rounded';
            document.getElementById('qr-corner-dot-style').value = 'dot';
            document.getElementById('qr-margin').value = String(MIN_QUIET_ZONE_MODULES);
            document.getElementById('qr-margin-value').textContent = formatQuietZoneValue(MIN_QUIET_ZONE_MODULES);

            alert(t('alerts.resetSuccess'));
            schedulePreview();
        });
    }

    // --- Logo Upload Event Handlers ---

    // Logo select button click
    const logoSelectBtn = document.getElementById('logo-select-btn');
    const logoInput = document.getElementById('qr-logo');
    if (logoSelectBtn && logoInput) {
        logoSelectBtn.addEventListener('click', function() {
            logoInput.click();
        });
    }

    // Logo file selection
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                // Check file size (warn if > 1MB)
                if (file.size > 1048576) {
                    alert(t('alerts.largeImageWarning', { size: (file.size / 1048576).toFixed(1) }));
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const logoDataURL = event.target.result;

                    // Store in customization state
                    qrCustomization.logoImage = logoDataURL;

                    // Show preview
                    document.getElementById('logo-preview-img').src = logoDataURL;
                    document.getElementById('logo-preview').style.display = 'block';
                    document.getElementById('logo-controls').style.display = 'block';
                    document.getElementById('logo-filename').textContent = file.name;
                    document.getElementById('logo-remove-btn').style.display = 'inline-block';
                    schedulePreview();
                };
                reader.readAsDataURL(file);
            } else {
                alert(t('alerts.invalidImageFile'));
            }
        });
    }

    // Logo remove button
    const logoRemoveBtn = document.getElementById('logo-remove-btn');
    if (logoRemoveBtn) {
        logoRemoveBtn.addEventListener('click', function() {
            // Clear logo
            qrCustomization.logoImage = null;
            document.getElementById('qr-logo').value = '';
            document.getElementById('logo-preview').style.display = 'none';
            document.getElementById('logo-controls').style.display = 'none';
            document.getElementById('logo-filename').textContent = '';
            this.style.display = 'none';
            schedulePreview();
        });
    }

    // Logo size slider
    const logoSizeSlider = document.getElementById('qr-logo-size');
    const logoSizeValue = document.getElementById('qr-logo-size-value');
    if (logoSizeSlider && logoSizeValue) {
        logoSizeSlider.addEventListener('input', function() {
            const percentage = Math.round(this.value * 100);
            logoSizeValue.textContent = percentage + '%';
            qrCustomization.logoSize = parseFloat(this.value);
            schedulePreview();
        });
    }

    // Logo margin slider
    const logoMarginSlider = document.getElementById('qr-logo-margin');
    const logoMarginValue = document.getElementById('qr-logo-margin-value');
    if (logoMarginSlider && logoMarginValue) {
        logoMarginSlider.addEventListener('input', function() {
            logoMarginValue.textContent = this.value + 'px';
            qrCustomization.logoMargin = parseInt(this.value);
            schedulePreview();
        });
    }

    // --- Style Options Event Handlers ---

    // Dot style selector
    const dotStyleSelect = document.getElementById('qr-dot-style');
    if (dotStyleSelect) {
        dotStyleSelect.addEventListener('change', function() {
            qrCustomization.dotStyle = this.value;
            schedulePreview();
        });
    }

    // Corner square style selector
    const cornerSquareStyleSelect = document.getElementById('qr-corner-square-style');
    if (cornerSquareStyleSelect) {
        cornerSquareStyleSelect.addEventListener('change', function() {
            qrCustomization.cornerSquareStyle = this.value;
            schedulePreview();
        });
    }

    // Corner dot style selector
    const cornerDotStyleSelect = document.getElementById('qr-corner-dot-style');
    if (cornerDotStyleSelect) {
        cornerDotStyleSelect.addEventListener('change', function() {
            qrCustomization.cornerDotStyle = this.value;
            schedulePreview();
        });
    }

    // Margin slider
    const marginSlider = document.getElementById('qr-margin');
    const marginValue = document.getElementById('qr-margin-value');
    if (marginSlider && marginValue) {
        marginSlider.addEventListener('input', function() {
            marginValue.textContent = formatQuietZoneValue(this.value);
            qrCustomization.margin = parseInt(this.value);
            schedulePreview();
        });
        marginValue.textContent = formatQuietZoneValue(marginSlider.value);
    }

});
