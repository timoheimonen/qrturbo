// QRTurbo.app - Content forms, validation and page helpers
// This file reads the content forms and hands their values to
// QRTurboPayloads.build(), which turns them into QR payloads. The preview,
// design and export live in controller.js and the UI modules; controller.js
// starts the page and calls initContentForms(app).

const THEME_STORAGE_KEY = 'qrturbo_theme';
const DEFAULT_THEME = 'light';
const MIN_QUIET_ZONE_MODULES = 4;
const URL_TEXT_MAX_LENGTH = 2000;
const SMS_MESSAGE_MAX_LENGTH = 300;

// The field that receives focus and the error message for each content type
// when no more specific field is invalid.
const CONTENT_PRIMARY_FIELDS = {
    URLText: 'qr-text',
    VCard: 'vcard-fn',
    Wifi: 'wifi-ssid',
    SMSPhone: 'sms-phone-number',
    Email: 'email-to',
    CalendarEvent: 'event-title',
    Location: 'location-address',
    SocialMedia: 'social-handle',
    WhatsApp: 'whatsapp-phone',
    MeCard: 'mecard-name',
    AppLink: 'app-web-url',
    Payment: 'payment-name'
};

// Form field ids per content type, keyed by the QRTurboPayloads values key
// (SPEC D). Validation errors name a values key; this maps it back to the
// field to highlight.
const CONTENT_FIELD_IDS = {
    URLText: { text: 'qr-text' },
    VCard: {
        firstName: 'vcard-fn',
        lastName: 'vcard-ln',
        organization: 'vcard-org',
        department: 'vcard-department',
        title: 'vcard-title',
        phoneWork: 'vcard-tel-work',
        phoneMobile: 'vcard-tel-mobile',
        phoneHome: 'vcard-tel-home',
        email: 'vcard-email',
        website: 'vcard-url',
        street: 'vcard-street',
        city: 'vcard-city',
        state: 'vcard-state',
        zip: 'vcard-zip',
        country: 'vcard-country',
        addressType: 'vcard-adr-type',
        birthday: 'vcard-bday',
        note: 'vcard-note'
    },
    Wifi: { ssid: 'wifi-ssid', password: 'wifi-password', security: 'wifi-auth', hidden: 'wifi-hidden' },
    SMSPhone: { mode: 'sms-type-sms', number: 'sms-phone-number', message: 'sms-message' },
    Email: { to: 'email-to', subject: 'email-subject', body: 'email-body' },
    CalendarEvent: {
        title: 'event-title',
        location: 'event-location',
        start: 'event-start',
        end: 'event-end',
        description: 'event-description',
        allDay: 'event-all-day',
        timeZone: 'event-time-zone'
    },
    Location: { address: 'location-address', latitude: 'location-lat', longitude: 'location-lng' },
    SocialMedia: { platform: 'social-platform', profileType: 'social-profile-type', handle: 'social-handle' },
    WhatsApp: { phone: 'whatsapp-phone', message: 'whatsapp-message' },
    MeCard: { name: 'mecard-name', phone: 'mecard-phone', email: 'mecard-email', url: 'mecard-url', address: 'mecard-address' },
    AppLink: { webUrl: 'app-web-url', iosUrl: 'app-ios-url', androidUrl: 'app-android-url', target: 'app-link-target' },
    Payment: {
        name: 'payment-name',
        iban: 'payment-iban',
        bic: 'payment-bic',
        amount: 'payment-amount',
        reference: 'payment-reference',
        message: 'payment-message',
        dueDate: 'payment-due-date'
    }
};

// Values keys that come from checkboxes.
const CONTENT_BOOLEAN_KEYS = ['hidden', 'allDay'];

// Mutable page state for the content forms: the event UID and DTSTAMP stay
// the same while the event fields do not change, so redrawing the preview
// (for example after a color change) never reshuffles the code.
const contentFormState = {
    calendar: null,
    formErrorHome: null
};

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    // The service worker inherits the page's ?v= query, which it propagates.
    const versionQuery = globalThis.QRTurboUI?.ASSET_VERSION_QUERY || '';

    // Keep this language and page available offline.
    const cachePage = worker => {
        worker?.postMessage({ type: 'cache-page', path: window.location.pathname });
    };

    // An update replaces the worker and its cache while this page is open, so
    // the new worker is asked too. The first visit's takeover needs no repeat.
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) {
            cachePage(navigator.serviceWorker.controller);
        }
        hadController = true;
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`/sw.js${versionQuery}`)
            .then(() => navigator.serviceWorker.ready)
            .then(registration => cachePage(registration.active))
            .catch(error => {
                console.warn('Service worker registration failed:', error);
            });
    });
}

function normalizeTheme(theme) {
    return theme === 'dark' ? 'dark' : DEFAULT_THEME;
}

function getSystemTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : DEFAULT_THEME;
}

function getStoredTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null;
    } catch (error) {
        console.warn('localStorage unavailable:', error);
        return null;
    }
}

function getInitialTheme() {
    return getStoredTheme() || getSystemTheme();
}

function applyTheme(theme, persist = true) {
    const normalizedTheme = normalizeTheme(theme);
    document.documentElement.dataset.theme = normalizedTheme;

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
    const themeButtons = document.querySelectorAll('[data-theme-choice]');
    if (!themeButtons.length) return;

    applyTheme(getInitialTheme(), false);

    // Follow the system theme until the user explicitly picks one.
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)');
    systemDark?.addEventListener?.('change', event => {
        if (!getStoredTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
    });

    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            applyTheme(this.dataset.themeChoice);
        });
    });
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

// --- Validation messages ---

function addIdToken(element, attribute, id) {
    const tokens = (element.getAttribute?.(attribute) || '').split(/\s+/).filter(Boolean);
    if (!tokens.includes(id)) element.setAttribute(attribute, [...tokens, id].join(' '));
}

function removeIdToken(element, attribute, id) {
    const tokens = (element.getAttribute?.(attribute) || '').split(/\s+/).filter(Boolean);
    if (!tokens.includes(id)) return;
    const remaining = tokens.filter(token => token !== id);
    if (remaining.length) {
        element.setAttribute(attribute, remaining.join(' '));
    } else {
        element.removeAttribute(attribute);
    }
}

/**
 * @description Removes the invalid state from the fields that #form-error
 * described. Other modules' own aria-invalid fields are left alone.
 */
function clearInvalidFields(exceptField = null) {
    document.querySelectorAll?.('[aria-errormessage="form-error"]').forEach(field => {
        if (field === exceptField) return;
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-errormessage');
        removeIdToken(field, 'aria-describedby', 'form-error');
    });
}

function clearFormError() {
    const errorContainer = document.getElementById('form-error');
    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.hidden = true;
        delete errorContainer.dataset.i18nKey;
    }

    clearInvalidFields();
}

/**
 * @description Moves #form-error to its place: at the end of the invalid
 * field's own .input-group, so in a two-column grid the message stays in the
 * field's cell and never pushes the neighbouring field to another row. A
 * field without a group gets it right after its fieldset or itself. With no
 * field it goes back to its home in the preview card.
 */
function placeFormError(errorContainer, field) {
    if (!contentFormState.formErrorHome && errorContainer.parentNode) {
        contentFormState.formErrorHome = {
            parent: errorContainer.parentNode,
            next: errorContainer.nextSibling
        };
    }

    const group = field ? field.closest?.('.input-group') : null;
    if (group) {
        if (group.lastElementChild !== errorContainer) group.append(errorContainer);
        return;
    }

    const anchor = field ? (field.closest?.('fieldset') || field) : null;
    if (anchor && anchor.parentNode) {
        if (anchor.nextElementSibling !== errorContainer) anchor.after(errorContainer);
        return;
    }

    const home = contentFormState.formErrorHome;
    if (home && errorContainer.parentNode !== home.parent) {
        const next = home.next && home.next.parentNode === home.parent ? home.next : null;
        home.parent.insertBefore(errorContainer, next);
    }
}

/**
 * @description Shows a message in #form-error next to the invalid field and
 * marks the field with aria-invalid, aria-errormessage and
 * aria-describedby. Returns false when the page has no #form-error.
 */
function showFormError(message, fieldId, messageKey) {
    const errorContainer = document.getElementById('form-error');
    if (!errorContainer) return false;

    const field = fieldId ? document.getElementById(fieldId) : null;
    const unchanged = !errorContainer.hidden &&
        errorContainer.textContent === message &&
        (!field || field.getAttribute('aria-errormessage') === 'form-error');

    clearInvalidFields(field);
    placeFormError(errorContainer, field);

    // Rewriting the same text would make screen readers repeat the alert.
    if (!unchanged) {
        errorContainer.textContent = message;
        errorContainer.hidden = false;
    }
    if (messageKey) {
        errorContainer.dataset.i18nKey = messageKey;
    } else {
        delete errorContainer.dataset.i18nKey;
    }

    if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-errormessage', 'form-error');
        addIdToken(field, 'aria-describedby', 'form-error');
    }

    return true;
}

/**
 * @description Shows a validation message next to the form when requested.
 * Without a #form-error region (as in the Node test harness) the message goes
 * to the validation sink, never to a blocking dialog.
 */
function notifyValidation(messageKey, showErrors, fieldId) {
    if (showErrors) {
        const message = t(messageKey);
        if (!showFormError(message, fieldId, messageKey)) {
            (globalThis.__qrturboValidationSink || console.warn)(message);
        }
    }
    return null;
}

// --- Reading the content forms ---

/**
 * @description Reads the form of one content type into the plain values
 * object that QRTurboPayloads.build() expects.
 */
function readContentValues(type) {
    const ids = CONTENT_FIELD_IDS[type] || {};
    const values = {};

    Object.keys(ids).forEach(key => {
        if (type === 'SMSPhone' && key === 'mode') {
            values.mode = document.querySelector('input[name="sms-phone-type"]:checked')?.value || 'sms';
            return;
        }

        const element = document.getElementById(ids[key]);
        if (!element) return;
        values[key] = CONTENT_BOOLEAN_KEYS.includes(key) ? Boolean(element.checked) : element.value;
    });

    return values;
}

/**
 * @description The event UID and DTSTAMP for the current event values. They
 * change only when the event fields change.
 */
function getCalendarOptions(values) {
    const key = JSON.stringify(values);
    const cached = contentFormState.calendar;
    if (cached && cached.key === key) return { now: cached.now, uid: cached.uid };

    const next = { key, now: new Date(), uid: globalThis.QRTurboPayloads.createUid() };
    contentFormState.calendar = next;
    return { now: next.now, uid: next.uid };
}

/**
 * @description Reads the active content form and returns a ContentResult:
 * { ok: true, type, payload, isSensitive, filenameHint, primaryFieldId } or
 * { ok: false, type, empty, errorKey, fieldId }. With showErrors, a failure
 * is also shown in #form-error next to the invalid field.
 */
function collectContent(showErrors = false) {
    const type = getActiveTabName();
    const ids = CONTENT_FIELD_IDS[type];
    const payloads = globalThis.QRTurboPayloads;

    if (!ids || !payloads || typeof payloads.build !== 'function') {
        notifyValidation('alerts.noData', showErrors, null);
        return { ok: false, type, empty: true, errorKey: 'alerts.noData', fieldId: null };
    }

    const values = readContentValues(type);
    const result = payloads.build(type, values, type === 'CalendarEvent' ? getCalendarOptions(values) : undefined);

    if (!result.ok) {
        const fieldId = (result.field && ids[result.field]) || null;
        notifyValidation(result.errorKey, showErrors, fieldId);
        return {
            ok: false,
            type,
            empty: Boolean(result.empty),
            errorKey: result.errorKey,
            fieldId
        };
    }

    return {
        ok: true,
        type,
        payload: result.payload,
        isSensitive: Boolean(result.isSensitive),
        filenameHint: String(result.filenameHint || ''),
        primaryFieldId: CONTENT_PRIMARY_FIELDS[type] || null
    };
}

/**
 * @description Compatibility wrapper: the payload of the active tab, or null.
 */
function collectQRCodeText(showAlerts = false) {
    const result = collectContent(showAlerts);
    return result.ok ? result.payload : null;
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

// --- Raster PDF fallback ---

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

/**
 * @description Raster PDF fallback: one A4 page holding the QR code as an RGB
 * image. The vector PDF writer falls back to this when it fails.
 */
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

    appendString('%PDF-1.4\n% QRTurbo.app PDF export\n');

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

async function getOpaqueImageDataFromBlob(blob) {
    const dataUrl = await blobToDataURL(blob);
    const image = await loadImageFromDataURL(dataUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const canvas = document.createElement('canvas');

    try {
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, width, height);

        return context.getImageData(0, 0, width, height);
    } finally {
        // The pixels are copied out; release the canvas memory at once
        // (Safari keeps a small total canvas budget).
        canvas.width = 0;
        canvas.height = 0;
    }
}

// --- Content form helpers (browser only, wired by initContentForms) ---

function updateCharCounter(input, counter, max, warnAt) {
    if (!input || !counter) return;
    const currentLength = input.value.length;
    counter.textContent = t('counters.characters', { current: currentLength, max });
    counter.classList.toggle('warning', currentLength >= warnAt);
}

function prefersReducedMotion() {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

const TAB_CHIP_CLEARANCE = 16;

function cssPixels(value) {
    const number = parseFloat(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
}

/**
 * @description How far a chip must stay from each end of the tab row: the
 * row's padding (or scroll padding, whichever is larger). On phones that
 * is --panel-pad, the width of the edge fade, so a chip that keeps this
 * clearance is never faded.
 */
function tabRowClearance(row) {
    let style = null;
    try {
        style = window.getComputedStyle?.(row) || null;
    } catch {
        style = null;
    }
    const left = style ? Math.max(cssPixels(style.paddingLeft), cssPixels(style.scrollPaddingLeft)) : 0;
    const right = style ? Math.max(cssPixels(style.paddingRight), cssPixels(style.scrollPaddingRight)) : 0;
    return { left: left || TAB_CHIP_CLEARANCE, right: right || TAB_CHIP_CLEARANCE };
}

/**
 * @description Scrolls the tab row sideways so the chip is fully visible
 * and clear of the edge fade, without moving the page. Smooth only when
 * asked and when the user has not asked for reduced motion.
 *
 * On phones the row snaps chip starts to its scroll padding, and Chromium
 * moves a programmatic scroll to the nearest snap position, even backwards
 * into the fade. So the scroll always ends on a snap position: the chip's
 * own start, or the first chip start that shows the whole chip.
 */
function scrollTabChipIntoView(tab, smooth) {
    const row = tab?.parentElement;
    if (!row || row.scrollWidth <= row.clientWidth) return;

    const rowRect = row.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const clearance = tabRowClearance(row);
    const visibleLeft = rowRect.left + clearance.left;
    const visibleRight = rowRect.right - clearance.right;
    let delta = 0;
    if (tabRect.left < visibleLeft || tabRect.width > visibleRight - visibleLeft) {
        delta = tabRect.left - visibleLeft;
    } else if (tabRect.right > visibleRight) {
        const needed = tabRect.right - visibleRight;
        delta = needed;
        for (const chip of Array.from(row.children || [])) {
            const offset = chip.getBoundingClientRect().left - visibleLeft;
            if (offset >= needed - 0.5) {
                delta = offset;
                break;
            }
        }
    }
    if (Math.abs(delta) < 0.5) return;

    if (typeof row.scrollBy === 'function') {
        row.scrollBy({ left: delta, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
    } else {
        row.scrollLeft += delta;
    }
}

/**
 * @description The URL/Text form: character counter and the "Add https://"
 * suggestion for values that look like a bare domain.
 */
function initUrlTextForm() {
    const input = document.getElementById('qr-text');
    const counter = document.getElementById('char-count');
    const hint = document.getElementById('url-https-hint');
    const button = document.getElementById('url-https-btn');

    function refresh() {
        if (!input) return;
        updateCharCounter(input, counter, URL_TEXT_MAX_LENGTH, 1800);
        if (hint) hint.hidden = !globalThis.QRTurboPayloads?.looksLikeBareDomain(input.value);
    }

    input?.addEventListener('input', refresh);

    // The suggestion only edits the field; the payload is always exactly
    // what the field holds.
    button?.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) return;
        input.value = `https://${value}`;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        input.setSelectionRange?.(input.value.length, input.value.length);
    });

    refresh();
    return { refresh };
}

/**
 * @description The SMS/Phone form: the message field only shows for SMS.
 */
function initSmsPhoneForm() {
    const radios = document.querySelectorAll('input[name="sms-phone-type"]');
    const messageGroup = document.getElementById('sms-message-group');
    const message = document.getElementById('sms-message');
    const counter = document.getElementById('sms-char-count');

    function refresh() {
        const selectedType = document.querySelector('input[name="sms-phone-type"]:checked')?.value;
        if (messageGroup) messageGroup.hidden = selectedType !== 'sms';
        updateCharCounter(message, counter, SMS_MESSAGE_MAX_LENGTH, 250);
    }

    radios.forEach(radio => radio.addEventListener('change', refresh));
    message?.addEventListener('input', () => updateCharCounter(message, counter, SMS_MESSAGE_MAX_LENGTH, 250));

    refresh();
    return { refresh };
}

/**
 * @description The WiFi form: the password follows the security type, and
 * the WPA3 and hidden network hints follow their controls.
 */
function initWifiForm() {
    const auth = document.getElementById('wifi-auth');
    const password = document.getElementById('wifi-password');
    const toggle = document.getElementById('wifi-password-toggle');
    const hidden = document.getElementById('wifi-hidden');
    const securityHelp = document.getElementById('wifi-security-help');
    const hiddenHelp = document.getElementById('wifi-hidden-help');

    function relabel() {
        if (!toggle || !password) return;
        toggle.textContent = t(password.type === 'password' ? 'actions.showPassword' : 'actions.hidePassword');
    }

    function refresh() {
        if (!auth || !password) return;
        const needsPassword = auth.value !== 'nopass';
        password.disabled = !needsPassword;
        if (toggle) toggle.disabled = !needsPassword;
        if (!needsPassword) {
            password.value = '';
            password.type = 'password';
        }
        if (securityHelp) securityHelp.hidden = auth.value !== 'WPA3';
        if (hiddenHelp) hiddenHelp.hidden = !hidden?.checked;
        relabel();
    }

    auth?.addEventListener('change', refresh);
    hidden?.addEventListener('change', refresh);
    toggle?.addEventListener('click', () => {
        password.type = password.type === 'password' ? 'text' : 'password';
        relabel();
    });

    refresh();
    return { refresh, relabel };
}

/**
 * @description The social media form: profile types per platform and the
 * live preview of the target URL.
 */
function initSocialForm() {
    const platform = document.getElementById('social-platform');
    const profileType = document.getElementById('social-profile-type');
    const profileTypeGroup = document.getElementById('social-profile-type-group');
    const handle = document.getElementById('social-handle');
    const preview = document.getElementById('social-preview-url');

    function refresh() {
        if (platform && profileType && profileTypeGroup) {
            const allowedTypes = platform.value === 'linkedin'
                ? ['person', 'company']
                : platform.value === 'reddit'
                    ? ['person', 'subreddit']
                    : ['person'];

            profileTypeGroup.hidden = allowedTypes.length < 2;
            Array.from(profileType.options).forEach(option => {
                // Safari ignores hidden on <option>, so disable it as well.
                const allowed = allowedTypes.includes(option.value);
                option.hidden = !allowed;
                option.disabled = !allowed;
            });
            if (!allowedTypes.includes(profileType.value)) profileType.value = 'person';
        }

        if (preview) {
            const result = globalThis.QRTurboPayloads?.build('SocialMedia', readContentValues('SocialMedia'));
            preview.textContent = result?.ok ? result.payload : '-';
        }
    }

    platform?.addEventListener('change', refresh);
    profileType?.addEventListener('change', refresh);
    handle?.addEventListener('input', refresh);

    refresh();
    return { refresh };
}

function padTwo(value) {
    return String(value).padStart(2, '0');
}

/**
 * @description 'YYYY-MM-DDTHH:MM' plus one hour of wall-clock time, or ''.
 */
function addOneHour(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || '');
    if (!match) return '';
    const date = new Date(0);
    date.setFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    date.setHours(Number(match[4]) + 1, Number(match[5]), 0, 0);
    return `${String(date.getFullYear()).padStart(4, '0')}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}` +
        `T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
}

function getDeviceTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
        return '';
    }
}

/**
 * @description The event form: the end time follows the start time until it
 * is edited, "All-day event" switches both fields to dates, and the time
 * zone list is filled on first use.
 */
function initCalendarForm(app) {
    const start = document.getElementById('event-start');
    const end = document.getElementById('event-end');
    const allDay = document.getElementById('event-all-day');
    const timeZone = document.getElementById('event-time-zone');
    const timeZoneGroup = timeZone?.closest('.input-group');
    const DEFAULT_TIMES = { start: '09:00', end: '10:00' };
    // True while the end holds a value the user picked. Script changes fire
    // no events, so the automatic end and the all-day switch never set it.
    let endEdited = false;

    function fillTimeZones() {
        if (!timeZone || timeZone.options.length) return;
        const deviceZone = getDeviceTimeZone();
        if (!deviceZone) {
            // Without a known device zone, times stay in device time.
            if (timeZoneGroup) timeZoneGroup.hidden = true;
            return;
        }

        let zones = [];
        try {
            if (typeof Intl.supportedValuesOf === 'function') zones = Intl.supportedValuesOf('timeZone');
        } catch {
            zones = [];
        }

        const fragment = document.createDocumentFragment();
        [...new Set([...zones, 'UTC', deviceZone])].sort().forEach(zone => {
            const option = document.createElement('option');
            option.value = zone;
            option.textContent = zone;
            fragment.appendChild(option);
        });
        timeZone.appendChild(fragment);
        timeZone.value = deviceZone;
    }

    function setAllDay(enabled) {
        [start, end].forEach(input => {
            if (!input) return;
            const value = input.value;
            if (enabled && input.type !== 'date') {
                input.dataset.time = value.slice(11, 16);
                input.type = 'date';
                input.value = value.slice(0, 10);
            } else if (!enabled && input.type !== 'datetime-local') {
                const time = input.dataset.time || (input === start ? DEFAULT_TIMES.start : DEFAULT_TIMES.end);
                input.type = 'datetime-local';
                input.value = value ? `${value.slice(0, 10)}T${time}` : '';
            }
        });
        if (timeZoneGroup && timeZone?.options.length) timeZoneGroup.hidden = enabled;
    }

    end?.addEventListener('change', () => {
        endEdited = Boolean(end.value);
    });

    // A new start moves an end that is empty or still the automatic one.
    start?.addEventListener('change', () => {
        if (!end || !start.value) return;
        if (end.value && endEdited) return;
        let nextEnd;
        if (allDay?.checked) {
            // An empty end already means one day; an automatic one follows.
            if (!end.value) return;
            nextEnd = start.value.slice(0, 10);
        } else {
            nextEnd = addOneHour(start.value);
        }
        if (!nextEnd || nextEnd === end.value) return;
        end.value = nextEnd;
        app.schedulePreview({ reason: 'discrete' });
    });

    allDay?.addEventListener('change', () => setAllDay(allDay.checked));

    // The browser may restore a checked box after a back navigation.
    if (allDay?.checked) setAllDay(true);

    return {
        refresh() {
            fillTimeZones();
            if (timeZoneGroup && timeZone?.options.length) timeZoneGroup.hidden = Boolean(allDay?.checked);
        }
    };
}

/**
 * @description The payment form: the byte counter, and IBAN and BIC tidied
 * up when the field is left.
 */
function initPaymentForm() {
    const panel = document.getElementById('Payment');
    const counter = document.getElementById('payment-bytes');
    const iban = document.getElementById('payment-iban');
    const bic = document.getElementById('payment-bic');
    const payloads = globalThis.QRTurboPayloads;

    function refresh() {
        if (!counter || !payloads) return;
        const used = payloads.paymentBytes(readContentValues('Payment'));
        counter.textContent = t('capacity.paymentLimit', { used });
        counter.classList.toggle('warning', used > 300);
    }

    panel?.addEventListener('input', refresh);

    iban?.addEventListener('change', () => {
        if (payloads?.iban.validate(iban.value)) iban.value = payloads.iban.format(iban.value);
    });
    bic?.addEventListener('change', () => {
        bic.value = bic.value.replace(/\s+/g, '').toUpperCase();
    });

    refresh();
    return { refresh };
}

/**
 * @description "Create many from a CSV file": shown only for batch-capable
 * types, and only where <dialog> exists.
 */
function initBatchButton(app) {
    const button = document.getElementById('batch-open-btn');
    const supported = typeof HTMLDialogElement === 'function';

    button?.addEventListener('click', () => {
        Promise.resolve()
            .then(() => app.openBatch())
            .catch(error => {
                console.error('Opening batch mode failed:', error);
                globalThis.QRTurboUI?.toast?.(t('toast.batchLoadFailed'), { tone: 'error' });
            });
    });

    return {
        update(tab) {
            if (!button) return;
            const batchTypes = globalThis.QRTurboPayloads?.BATCH_TYPES || [];
            button.hidden = !(supported && batchTypes.includes(tab));
        }
    };
}

function isDiscreteContentField(field) {
    return field.tagName === 'SELECT' || ['checkbox', 'radio', 'date', 'datetime-local'].includes(field.type);
}

/**
 * @description Wires the content forms: tabs (APG keyboard behavior), the
 * per-type helpers, the batch entry point, and a preview request for every
 * edit. Typing is debounced by the controller; calm validation (dirty fields,
 * idle reveal) is the controller's too.
 */
function initContentForms(app) {
    const tabsContainer = document.getElementById('tabs');
    const urlText = initUrlTextForm();
    const smsPhone = initSmsPhoneForm();
    const wifi = initWifiForm();
    const social = initSocialForm();
    const calendar = initCalendarForm(app);
    const payment = initPaymentForm();
    const batchButton = initBatchButton(app);
    const refreshers = {
        URLText: urlText.refresh,
        SMSPhone: smsPhone.refresh,
        Wifi: wifi.refresh,
        SocialMedia: social.refresh,
        CalendarEvent: calendar.refresh,
        Payment: payment.refresh
    };

    function refreshTab(tabName) {
        refreshers[tabName]?.();
        batchButton.update(tabName);
    }

    // Every content edit asks for a new preview: text fields after a typing
    // pause, checkboxes, radios, selects and dates at once.
    const contentRoot = document.querySelector('.tab-content')?.parentElement;
    contentRoot?.addEventListener('input', event => {
        const field = event.target;
        if (!field?.closest?.('.tab-content') || isDiscreteContentField(field)) return;
        app.schedulePreview({ reason: 'typing' });
    });
    contentRoot?.addEventListener('change', event => {
        const field = event.target;
        if (!field?.closest?.('.tab-content') || !isDiscreteContentField(field)) return;
        app.schedulePreview({ reason: 'discrete' });
    });

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
        // Only the tab row scrolls, so the chip clears the edge fade and
        // the page stays where it is.
        scrollTabChipIntoView(nextTab, true);

        // A tab the user has not touched yet never starts with an error.
        clearFormError();
        refreshTab(tabName);
        app.emit('tab', { tab: tabName });
        app.schedulePreview({ reason: 'discrete' });

        // The row is already scrolling to the chip; a focus scroll would
        // cut that short.
        if (focus) nextTab.focus({ preventScroll: true });
    }

    tabsContainer?.addEventListener('click', function(event) {
        activateTab(event.target.closest('.tab-link'));
    });

    tabsContainer?.addEventListener('keydown', function(event) {
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

    // The landing page of a type starts on its tab; show that chip too.
    const initialTab = tabsContainer?.querySelector('.tab-link.active');
    if (initialTab) scrollTabChipIntoView(initialTab, false);
    refreshTab(getActiveTabName());

    // translatePage() resets baked labels, so restore the stateful ones.
    app.on('i18n', () => {
        wifi.relabel();
        urlText.refresh();
        smsPhone.refresh();
        payment.refresh();
    });
}
