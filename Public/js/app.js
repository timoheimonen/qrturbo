// QR Code Styling instance (global for download access)
let qrCodeInstance = null;
let previewDebounceTimer = null;

const THEME_STORAGE_KEY = 'qrturbo_theme';
const DEFAULT_THEME = 'light';
const AUTO_PREVIEW_DELAY = 450;

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
    margin: 16,
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

function normalizeWhatsAppNumber(value) {
    return value.replace(/\D/g, '');
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

function notifyValidation(messageKey, showAlerts) {
    if (showAlerts) {
        alert(t(messageKey));
    }
    return null;
}

function collectQRCodeText(showAlerts = false) {
    const activeTabButton = document.querySelector('.tab-link.active');
    if (!activeTabButton) return null;
    const activeTab = activeTabButton.dataset.tab;

    if (activeTab === 'URLText') {
        const text = document.getElementById('qr-text').value;
        return text ? text : notifyValidation('alerts.enterText', showAlerts);
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
            return notifyValidation('alerts.vcardRequired', showAlerts);
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
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const password = document.getElementById('wifi-password').value;
        const authType = document.getElementById('wifi-auth').value;
        const isHidden = document.getElementById('wifi-hidden').checked;

        if (!ssid) {
            return notifyValidation('alerts.wifiSsidRequired', showAlerts);
        }

        if (authType === 'WPA' && !/^(?:[ -~]{8,63}|[0-9A-Fa-f]{64})$/.test(password)) {
            return notifyValidation('alerts.wifiWpaPasswordInvalid', showAlerts);
        }

        if (authType === 'WEP' && !/^(?:[ -~]{5}|[ -~]{13}|[0-9A-Fa-f]{10}|[0-9A-Fa-f]{26})$/.test(password)) {
            return notifyValidation('alerts.wifiWepPasswordInvalid', showAlerts);
        }

        const escapeWifi = (s) => s.replace(/([\\;,"])/g, '\\$1');
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
            return notifyValidation('alerts.phoneRequired', showAlerts);
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
            return notifyValidation('alerts.emailRequired', showAlerts);
        }

        if (to && !isValidEmail(to)) {
            return notifyValidation('alerts.emailInvalid', showAlerts);
        }

        const params = new URLSearchParams();
        if (subject) params.set('subject', subject);
        if (body) params.set('body', body);
        const query = params.toString();
        return `mailto:${to}${query ? `?${query}` : ''}`;
    }

    if (activeTab === 'CalendarEvent') {
        const title = getFieldValue('event-title');
        const location = getFieldValue('event-location');
        const start = document.getElementById('event-start').value;
        const end = document.getElementById('event-end').value;
        const description = document.getElementById('event-description').value.trim();

        if (!title || !start) {
            return notifyValidation('alerts.eventRequired', showAlerts);
        }

        if (end && new Date(end) < new Date(start)) {
            return notifyValidation('alerts.eventEndInvalid', showAlerts);
        }

        const eventLines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//QRTurbo//QR Event//EN',
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
            return notifyValidation('alerts.locationRequired', showAlerts);
        }

        if (hasLat || hasLng) {
            const lat = Number(latitude);
            const lng = Number(longitude);
            if (!hasLat || !hasLng || Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return notifyValidation('alerts.locationCoordinatesInvalid', showAlerts);
            }
            return address
                ? `geo:${lat},${lng}?q=${encodeURIComponent(address)}`
                : `geo:${lat},${lng}`;
        }

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    if (activeTab === 'WhatsApp') {
        const phone = getFieldValue('whatsapp-phone');
        const message = document.getElementById('whatsapp-message').value;
        const digits = normalizeWhatsAppNumber(phone);

        if (!digits || digits.length < 7) {
            return notifyValidation('alerts.whatsappPhoneRequired', showAlerts);
        }

        return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    }

    if (activeTab === 'MeCard') {
        const name = getFieldValue('mecard-name');
        const phone = getFieldValue('mecard-phone');
        const email = getFieldValue('mecard-email');
        const url = getFieldValue('mecard-url');
        const address = getFieldValue('mecard-address');

        if (!name && !phone && !email) {
            return notifyValidation('alerts.mecardRequired', showAlerts);
        }

        if (email && !isValidEmail(email)) {
            return notifyValidation('alerts.emailInvalid', showAlerts);
        }

        if (url && !isValidHttpUrl(url)) {
            return notifyValidation('alerts.urlInvalid', showAlerts);
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
            return notifyValidation('alerts.appLinkRequired', showAlerts);
        }

        if (urls.some(url => !isValidHttpUrl(url))) {
            return notifyValidation('alerts.urlInvalid', showAlerts);
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

    if (qrCustomization.margin < 8) {
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

    qrCodeInstance = null;
    if (qrCanvasContainer) {
        qrCanvasContainer.innerHTML = '';
        qrCanvasContainer.classList.remove('transparent-preview');
    }
    if (qrPlaceholder) qrPlaceholder.style.display = 'block';
    if (qrImage) {
        qrImage.src = '';
        qrImage.style.display = 'none';
    }
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (qrCodeText) qrCodeText.style.display = 'none';
    if (qrContainer) qrContainer.classList.remove('loading');
    renderScannabilityWarnings([]);
}

function schedulePreview() {
    window.clearTimeout(previewDebounceTimer);
    previewDebounceTimer = window.setTimeout(() => {
        generateQRCode({ silent: true });
    }, AUTO_PREVIEW_DELAY);
}

/**
 * @description Main function to generate the QR code based on the active tab and user input.
 */
function generateQRCode(options = {}) {
    const silent = Boolean(options.silent);
    const text = collectQRCodeText(!silent);

    if (!text) {
        if (silent) {
            clearGeneratedQRCode();
        }
        return;
    }

    const qrContainer = document.getElementById('qr-container');
    const qrCanvasContainer = document.getElementById('qr-canvas-container');
    const qrImage = document.getElementById('qr-image');
    const downloadBtn = document.getElementById('download-btn');
    const qrCodeText = document.getElementById('qr-code-text');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const size = parseInt(document.getElementById('size-select').value);
    const qrText = String(text).trim();

    if (typeof QRCodeStyling === 'undefined') {
        if (!silent) {
            alert(t('alerts.libraryLoadFailed'));
        }
        return;
    }

    if (!qrText) {
        if (!silent) {
            alert(t('alerts.dataEmpty'));
        }
        return;
    }

    if (!silent) {
        qrContainer.classList.add('loading');
    }
    qrPlaceholder.style.display = 'none';
    qrImage.style.display = 'none';
    downloadBtn.style.display = 'none';
    qrCodeText.style.display = 'none';

    const config = {
        width: size,
        height: size,
        type: qrCustomization.format === 'svg' ? 'svg' : 'canvas',
        data: qrText,
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
        margin: qrCustomization.margin
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
        qrCanvasContainer.innerHTML = '';
        qrCanvasContainer.classList.toggle('transparent-preview', qrCustomization.transparentBackground);

        qrCodeInstance = new QRCodeStyling(config);
        qrCodeInstance.append(qrCanvasContainer);

        renderScannabilityWarnings(getScannabilityWarnings(qrText, size));

        qrCodeText.textContent = text;
        qrCodeText.style.display = 'block';

        qrContainer.classList.remove('loading');
        downloadBtn.style.display = 'block';

        if (!silent) {
            qrContainer.style.animation = 'none';
            qrContainer.offsetHeight;
            qrContainer.style.animation = 'qrAppear 0.6s ease-out';
        }
    } catch (error) {
        console.error('QR Code Generation Error:', error);
        if (!silent) {
            alert(t('alerts.generationError') + ': ' + error.message);
        }
        qrContainer.classList.remove('loading');
        qrPlaceholder.style.display = 'block';
    }
}

/**
 * @description Handles downloading the generated QR code image.
 */
function downloadQRCode() {
    if (!qrCodeInstance) {
        alert(t('alerts.generateFirst'));
        return;
    }

    const activeTabButton = document.querySelector('.tab-link.active');
    if (!activeTabButton) return;
    const activeTab = activeTabButton.dataset.tab;

    // Generate a user-friendly filename based on the input
    let filename = 'qrcode_unknown';
    
    if (activeTab === 'URLText') {
        const urlText = document.getElementById('qr-text').value.trim();
        if (urlText) {
            // For URLs, try to extract domain name, otherwise use first 30 chars
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
        const ssid = document.getElementById('wifi-ssid').value.trim();
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
    } else if (activeTab === 'WhatsApp') {
        const phoneNumber = document.getElementById('whatsapp-phone').value.trim();
        filename = phoneNumber ? `whatsapp_${phoneNumber.replace(/[^\d+]/g, '')}` : 'whatsapp_message';
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

    // Sanitize the filename: allow alphanumeric, hyphens, underscores, limit length
    const safeText = filename
        .replace(/[^a-z0-9\-_]/gi, '_')  // Replace invalid chars with underscore
        .replace(/_+/g, '_')             // Replace multiple underscores with single
        .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
        .substring(0, 50)                // Limit length
        || 'qrcode_unknown';             // Fallback if empty

    const finalFilename = `qrcode_${safeText}`;
    const extension = qrCustomization.format; // 'png' or 'svg'

    // Download using QRCodeStyling API
    qrCodeInstance.download({
        name: finalFilename,
        extension: extension
    });

    // Re-trigger the download button's animation for user feedback
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.style.animation = 'none';
    downloadBtn.offsetHeight; // Force reflow
    downloadBtn.style.animation = 'bounceIn 0.6s ease-out';
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

    // --- Event Listeners ---

    // Track character count for the URL/Text input
    qrTextInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCountDisplay.textContent = t('counters.characters', { current: currentLength, max: 2000 });
        charCountDisplay.classList.toggle('warning', currentLength >= 1800);
        schedulePreview();
    });

    // Track character count for the SMS message input
    smsMessageInput.addEventListener('input', function() {
        const currentLength = this.value.length;
        smsCharCountDisplay.textContent = t('counters.characters', { current: currentLength, max: 300 });
        smsCharCountDisplay.classList.toggle('warning', currentLength >= 250);
        schedulePreview();
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

    // Toggle password field enabled state based on authentication type
    wifiAuthSelect.addEventListener('change', function() {
        const isPasswordNeeded = this.value !== 'nopass';
        wifiPasswordField.disabled = !isPasswordNeeded;
        wifiPasswordToggle.disabled = !isPasswordNeeded;
        if (!isPasswordNeeded) {
            wifiPasswordField.value = ''; // Clear password if not needed
            wifiPasswordField.type = 'password';
        }
        updateWifiPasswordToggleLabel();
        schedulePreview();
    });
    // Trigger change on load to set initial state
    wifiAuthSelect.dispatchEvent(new Event('change'));

    wifiPasswordToggle.addEventListener('click', function() {
        const isHidden = wifiPasswordField.type === 'password';
        wifiPasswordField.type = isHidden ? 'text' : 'password';
        updateWifiPasswordToggleLabel();
    });




    // --- Tab Switching Logic ---
    tabsContainer.addEventListener('click', function(event) {
        const clickedTab = event.target.closest('.tab-link');
        // Ignore clicks that are not on a a tab link or are on the already active tab
        if (!clickedTab || clickedTab.classList.contains('active')) {
            return;
        }

        const tabName = clickedTab.dataset.tab;

        // Store current scroll position before switching tabs
        const currentScrollY = window.scrollY;

        tabsContainer.querySelectorAll('.tab-link').forEach(tab => {
            const isSelected = tab === clickedTab;
            tab.classList.toggle('active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(tabName).style.display = 'block';

        // Restore scroll position after tab switch to prevent page jumping
        window.scrollTo(0, currentScrollY);

        // Keep form values when switching tabs, but refresh dependent UI states.
        document.getElementById('wifi-auth').dispatchEvent(new Event('change'));
        updateSmsPhoneUI();

        updateDynamicTranslations();

        const qrContainer = document.getElementById('qr-container');
        const qrImage = document.getElementById('qr-image');
        const downloadBtn = document.getElementById('download-btn');
        const qrCodeText = document.getElementById('qr-code-text');
        const qrPlaceholder = document.getElementById('qr-placeholder');
        
        qrPlaceholder.style.display = 'block';
        qrImage.src = "";
        qrImage.style.display = 'none';
        downloadBtn.style.display = 'none';
        qrCodeText.style.display = 'none';
        qrContainer.classList.remove('loading');

        qrContainer.style.animation = 'none';
        clearGeneratedQRCode();
        schedulePreview();
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
        element.addEventListener(eventName, schedulePreview);
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
                margin: 16,
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
            document.getElementById('qr-margin').value = '16';
            document.getElementById('qr-margin-value').textContent = '16px';

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
            marginValue.textContent = this.value + 'px';
            qrCustomization.margin = parseInt(this.value);
            schedulePreview();
        });
    }

});
