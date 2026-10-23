// QRTurbo.app - QR payload builders (QRTurboPayloads)
// Pure: build(type, values) turns plain field values into a QR payload. It
// never reads the DOM; app.js maps form fields to values, and batch mode maps
// CSV columns to the same values. Errors come back as i18n keys plus the
// values key of the field to fix.
(function () {
    'use strict';

    const TYPES = Object.freeze([
        'URLText', 'VCard', 'Wifi', 'SMSPhone', 'Email', 'CalendarEvent', 'Location',
        'SocialMedia', 'WhatsApp', 'MeCard', 'AppLink', 'Payment'
    ]);
    const BATCH_TYPES = Object.freeze([
        'URLText', 'VCard', 'Wifi', 'SMSPhone', 'Email', 'Location', 'WhatsApp', 'MeCard', 'Payment'
    ]);

    const EPC_MAX_BYTES = 331;
    const EPC_NAME_MAX = 70;
    const EPC_MESSAGE_MAX = 140;
    const BIC_PATTERN = /^[A-Z0-9]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/;
    const IBAN_PATTERN = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
    const RF_PATTERN = /^RF[0-9]{2}[A-Z0-9]{1,21}$/;
    const FINNISH_REFERENCE_PATTERN = /^[0-9]{4,20}$/;
    const FINNISH_WEIGHTS = [7, 3, 1];
    const WIFI_WPA_PASSWORD = /^(?:[ -~]{8,63}|[0-9A-Fa-f]{64})$/;
    const WIFI_WEP_PASSWORD = /^(?:[ -~]{5}|[ -~]{13}|[0-9A-Fa-f]{10}|[0-9A-Fa-f]{26})$/;
    const WHATSAPP_USERNAME_PATTERN = /^@(?![0-9]{3,35}$)[a-z0-9._]{3,35}$/;
    const WHATSAPP_PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
    const BARE_DOMAIN_PATTERN = /^(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}(?::\d{1,5})?(?:[/?#]\S*)?$/i;
    const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?)?$/;
    const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
    const DAY_MS = 86400000;
    // RFC 5321: an address is at most 254 characters. The limit also keeps
    // the email pattern fast on crafted batch cells.
    const EMAIL_MAX_LENGTH = 254;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Longer amount text is never a valid amount ("EUR 999 999 999,99").
    const AMOUNT_MAX_LENGTH = 64;

    // User choices for the WiFi security type, matched case-insensitively.
    // Batch rows may use the common spellings; the form uses the first four.
    // Other text is read by its words (see wifiSecurity).
    const WIFI_SECURITY = {
        WPA: 'WPA',
        WPA3: 'WPA3',
        WEP: 'WEP',
        NOPASS: 'nopass',
        WPA2: 'WPA',
        'WPA/WPA2': 'WPA',
        'WPA2/WPA3': 'WPA',
        'WPA/WPA2/WPA3': 'WPA',
        PSK: 'WPA',
        SAE: 'WPA3',
        NONE: 'nopass',
        OPEN: 'nopass'
    };

    const SMS_MODES = {
        sms: 'sms',
        smsto: 'sms',
        text: 'sms',
        phone: 'phone',
        tel: 'phone',
        call: 'phone',
        voice: 'phone'
    };

    const SOCIAL_PLATFORMS = {
        instagram: { buildUrl: handle => `https://www.instagram.com/${handle}/` },
        tiktok: { buildUrl: handle => `https://www.tiktok.com/@${handle}` },
        youtube: { buildUrl: handle => `https://www.youtube.com/@${handle}` },
        facebook: { buildUrl: handle => `https://www.facebook.com/${handle}` },
        x: { buildUrl: handle => `https://x.com/${handle}` },
        linkedin: { buildUrl: (handle, type) => `https://www.linkedin.com/${type === 'company' ? 'company' : 'in'}/${handle}` },
        snapchat: { buildUrl: handle => `https://www.snapchat.com/add/${handle}` },
        pinterest: { buildUrl: handle => `https://www.pinterest.com/${handle}/` },
        reddit: { buildUrl: (handle, type) => `https://www.reddit.com/${type === 'subreddit' ? 'r' : 'user'}/${handle}` },
        threads: { buildUrl: handle => `https://www.threads.net/@${handle}` },
        bluesky: { buildUrl: handle => `https://bsky.app/profile/${handle}` },
        other: { requiresUrl: true }
    };

    // Letters that NFKD does not decompose, so slugify keeps them readable.
    const SLUG_LETTERS = { 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ł': 'l', 'ı': 'i' };

    // Batch mapping: one entry per values key. Headers are matched
    // case-insensitively against the aliases and the translated label.
    // generic: the field takes a column named by the shared base of several
    // labels ("Telefon" for "Telefon (Arbeit)" and "Telefon (mobil)").
    // keepSpaces: the cell is used untrimmed, as the form uses the field.
    const FIELDS = deepFreeze({
        URLText: [
            { key: 'text', labelKey: 'fields.textOrUrl', required: true, aliases: ['text', 'url', 'link', 'uri', 'website', 'content', 'data', 'value'] }
        ],
        VCard: [
            { key: 'firstName', labelKey: 'fields.firstName', aliases: ['first name', 'firstname', 'first', 'given name', 'givenname', 'forename', 'etunimi'] },
            { key: 'lastName', labelKey: 'fields.lastName', aliases: ['last name', 'lastname', 'last', 'surname', 'family name', 'familyname', 'sukunimi'] },
            { key: 'organization', labelKey: 'fields.organization', aliases: ['organization', 'organisation', 'org', 'company', 'employer', 'yritys'] },
            { key: 'department', labelKey: 'fields.department', aliases: ['department', 'dept', 'division', 'unit', 'osasto'] },
            { key: 'title', labelKey: 'fields.title', aliases: ['title', 'job title', 'jobtitle', 'position', 'role', 'titteli'] },
            { key: 'phoneWork', labelKey: 'fields.phoneWork', aliases: ['work phone', 'phone work', 'phone (work)', 'business phone', 'office phone', 'tel work'] },
            { key: 'phoneMobile', labelKey: 'fields.phoneMobile', generic: true, aliases: ['mobile', 'mobile phone', 'phone (mobile)', 'cell', 'cell phone', 'phone', 'tel', 'telephone', 'puhelin'] },
            { key: 'phoneHome', labelKey: 'fields.phoneHome', aliases: ['home phone', 'phone home', 'phone (home)', 'private phone'] },
            { key: 'email', labelKey: 'fields.email', aliases: ['email', 'e-mail', 'mail', 'email address', 'e-mail address', 'sähköposti'] },
            { key: 'website', labelKey: 'fields.website', aliases: ['website', 'web', 'url', 'homepage', 'site', 'www'] },
            { key: 'street', labelKey: 'fields.street', aliases: ['street', 'street address', 'address', 'address line 1', 'address1', 'katuosoite'] },
            { key: 'city', labelKey: 'fields.city', aliases: ['city', 'town', 'locality', 'kaupunki'] },
            { key: 'state', labelKey: 'fields.state', aliases: ['state', 'province', 'region', 'state/province', 'county'] },
            { key: 'zip', labelKey: 'fields.zip', aliases: ['zip', 'zip code', 'zipcode', 'postal code', 'postalcode', 'postcode', 'post code', 'postinumero'] },
            { key: 'country', labelKey: 'fields.country', aliases: ['country', 'country name', 'maa'] },
            { key: 'addressType', labelKey: 'fields.addressType', aliases: ['address type', 'addresstype', 'adr type'] },
            { key: 'birthday', labelKey: 'fields.birthday', aliases: ['birthday', 'birth date', 'birthdate', 'date of birth', 'dob', 'bday'] },
            { key: 'note', labelKey: 'fields.note', aliases: ['note', 'notes', 'comment', 'comments', 'remarks'] }
        ],
        Wifi: [
            { key: 'ssid', labelKey: 'fields.ssid', required: true, keepSpaces: true, aliases: ['ssid', 'network', 'network name', 'wifi', 'wifi name', 'name'] },
            { key: 'password', labelKey: 'fields.password', keepSpaces: true, aliases: ['password', 'pass', 'passphrase', 'key', 'psk', 'wifi password', 'salasana'] },
            { key: 'security', labelKey: 'fields.authentication', aliases: ['security', 'authentication', 'auth', 'encryption', 'security type', 'type'] },
            { key: 'hidden', labelKey: 'fields.hiddenNetwork', aliases: ['hidden', 'hidden network', 'hidden ssid'] }
        ],
        SMSPhone: [
            { key: 'mode', labelKey: 'fields.smsPhoneType', aliases: ['code type', 'mode', 'kind', 'type'] },
            { key: 'number', labelKey: 'fields.phoneNumber', required: true, aliases: ['phone number', 'phone', 'number', 'tel', 'telephone', 'mobile', 'cell', 'puhelin'] },
            { key: 'message', labelKey: 'fields.message', aliases: ['message', 'text', 'body', 'sms', 'sms text', 'viesti'] }
        ],
        Email: [
            { key: 'to', labelKey: 'fields.emailTo', aliases: ['email', 'e-mail', 'to', 'recipient', 'email address', 'mail', 'sähköposti'] },
            { key: 'subject', labelKey: 'fields.emailSubject', aliases: ['subject', 'title', 'topic', 'aihe'] },
            { key: 'body', labelKey: 'fields.emailBody', aliases: ['body', 'message', 'text', 'content', 'viesti'] }
        ],
        CalendarEvent: [
            { key: 'title', labelKey: 'fields.eventTitle', required: true, aliases: ['title', 'event', 'summary', 'name'] },
            { key: 'location', labelKey: 'fields.eventLocation', aliases: ['location', 'place', 'venue'] },
            { key: 'start', labelKey: 'fields.eventStart', required: true, aliases: ['start', 'start time', 'begin', 'from'] },
            { key: 'end', labelKey: 'fields.eventEnd', aliases: ['end', 'end time', 'finish', 'to'] },
            { key: 'description', labelKey: 'fields.eventDescription', aliases: ['description', 'details', 'notes'] },
            { key: 'allDay', labelKey: 'fields.allDay', aliases: ['all day', 'all-day', 'allday'] },
            { key: 'timeZone', labelKey: 'fields.timeZone', aliases: ['time zone', 'timezone', 'tz'] }
        ],
        Location: [
            { key: 'address', labelKey: 'fields.locationAddress', aliases: ['address', 'place', 'location', 'label', 'name', 'osoite'] },
            { key: 'latitude', labelKey: 'fields.latitude', aliases: ['latitude', 'lat'] },
            { key: 'longitude', labelKey: 'fields.longitude', aliases: ['longitude', 'lng', 'lon', 'long'] }
        ],
        SocialMedia: [
            { key: 'platform', labelKey: 'fields.socialPlatform', aliases: ['platform', 'network', 'service'] },
            { key: 'profileType', labelKey: 'fields.socialProfileType', aliases: ['profile type', 'type'] },
            { key: 'handle', labelKey: 'fields.socialHandleOrUrl', required: true, aliases: ['handle', 'username', 'user', 'profile', 'url'] }
        ],
        WhatsApp: [
            { key: 'phone', labelKey: 'fields.whatsappPhone', required: true, aliases: ['whatsapp', 'phone', 'phone number', 'number', 'mobile', 'username', 'puhelin'] },
            { key: 'message', labelKey: 'fields.whatsappMessage', aliases: ['message', 'text', 'body', 'viesti'] }
        ],
        MeCard: [
            { key: 'name', labelKey: 'fields.mecardName', aliases: ['name', 'full name', 'fullname', 'contact', 'nimi'] },
            { key: 'phone', labelKey: 'fields.phoneNumber', aliases: ['phone', 'phone number', 'tel', 'telephone', 'mobile', 'puhelin'] },
            { key: 'email', labelKey: 'fields.email', aliases: ['email', 'e-mail', 'mail', 'email address', 'sähköposti'] },
            { key: 'url', labelKey: 'fields.website', aliases: ['website', 'url', 'web', 'homepage', 'www'] },
            { key: 'address', labelKey: 'fields.address', aliases: ['address', 'street address', 'osoite'] }
        ],
        AppLink: [
            { key: 'webUrl', labelKey: 'fields.appWebUrl', aliases: ['web url', 'web page', 'redirect page', 'url', 'website', 'fallback', 'fallback / web url'] },
            { key: 'iosUrl', labelKey: 'fields.appIosUrl', aliases: ['ios', 'ios url', 'app store', 'apple'] },
            { key: 'androidUrl', labelKey: 'fields.appAndroidUrl', aliases: ['android', 'android url', 'play store', 'google play'] },
            { key: 'target', labelKey: 'fields.appLinkTarget', aliases: ['store fallback', 'store link', 'target'] }
        ],
        Payment: [
            { key: 'name', labelKey: 'fields.paymentName', required: true, aliases: ['name', 'recipient', 'recipient name', 'beneficiary', 'payee', 'creditor', 'saaja'] },
            { key: 'iban', labelKey: 'fields.iban', required: true, aliases: ['iban', 'account', 'account number', 'bank account', 'tilinumero'] },
            { key: 'bic', labelKey: 'fields.bic', aliases: ['bic', 'swift', 'bic/swift', 'swift code'] },
            { key: 'amount', labelKey: 'fields.amount', aliases: ['amount', 'sum', 'total', 'price', 'eur', 'euros', 'summa'] },
            { key: 'reference', labelKey: 'fields.paymentReference', aliases: ['reference', 'reference number', 'ref', 'rf', 'creditor reference', 'viite', 'viitenumero'] },
            { key: 'message', labelKey: 'fields.paymentMessage', aliases: ['message', 'remittance', 'description', 'memo', 'text', 'viesti'] },
            { key: 'dueDate', labelKey: 'fields.dueDate', aliases: ['due date', 'duedate', 'due', 'date', 'eräpäivä'] }
        ]
    });

    function deepFreeze(value) {
        if (value && typeof value === 'object') {
            Object.values(value).forEach(deepFreeze);
            Object.freeze(value);
        }
        return value;
    }

    // --- Small helpers ---

    function str(value) {
        return value === undefined || value === null ? '' : String(value);
    }

    /**
     * @description Reads a checkbox value: a boolean from the form, or a CSV
     * cell such as "true", "yes", "1" or "x".
     */
    function toBool(value) {
        if (typeof value === 'boolean') return value;
        return /^(?:1|true|yes|y|x|on)$/i.test(str(value).trim());
    }

    function utf8Length(text) {
        let length = 0;
        for (const char of str(text)) {
            const code = char.codePointAt(0);
            length += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
        }
        return length;
    }

    function charLength(text) {
        return Array.from(str(text)).length;
    }

    /**
     * @description Replaces lone surrogates with U+FFFD, so encodeURIComponent
     * never throws on broken pasted text.
     */
    function wellFormed(text) {
        const value = str(text);
        if (typeof value.toWellFormed === 'function') return value.toWellFormed();
        return value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, match => (match.length === 2 ? match : '\uFFFD'));
    }

    function encodeComponent(text) {
        return encodeURIComponent(wellFormed(text));
    }

    function singleLine(text) {
        return str(text).replace(/\r\n|\r|\n/g, ' ');
    }

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function isValidEmail(value) {
        const text = str(value);
        return text.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(text);
    }

    function isValidHttpUrl(value) {
        if (typeof URL !== 'function') return /^https?:\/\/[^\s/?#]+\S*$/i.test(value);
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    function hostnameOf(value) {
        if (typeof URL !== 'function') return '';
        try {
            return new URL(value).hostname.replace(/^www\./, '');
        } catch {
            return '';
        }
    }

    // vCard 3.0 and iCalendar TEXT values (RFC 2426, RFC 5545).
    function escapeText(value) {
        return str(value)
            .replace(/\\/g, '\\\\')
            .replace(/\r\n|\r|\n/g, '\\n')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,');
    }

    function escapeWifi(value) {
        return str(value).replace(/([\\;,":])/g, '\\$1');
    }

    function escapeMeCard(value) {
        return str(value)
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/\r\n|\r|\n/g, ' ');
    }

    function fail(errorKey, field, empty) {
        return { ok: false, errorKey, field: field || null, empty: Boolean(empty) };
    }

    function success(payload, filenameHint, isSensitive) {
        return { ok: true, payload, isSensitive: Boolean(isSensitive), filenameHint: str(filenameHint) };
    }

    // --- Dates and times ---

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function daysInMonth(year, month) {
        if (month === 2) return isLeapYear(year) ? 29 : 28;
        return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
    }

    /**
     * @description Parses 'YYYY-MM-DD' with an optional 'THH:MM[:SS]' part
     * into checked numeric fields, or returns null.
     */
    function parseLocalDateTime(value) {
        const match = LOCAL_DATE_TIME.exec(str(value).trim());
        if (!match) return null;
        const fields = {
            year: Number(match[1]),
            month: Number(match[2]),
            day: Number(match[3]),
            hour: Number(match[4] || 0),
            minute: Number(match[5] || 0),
            second: Number(match[6] || 0)
        };
        if (fields.month < 1 || fields.month > 12) return null;
        if (fields.day < 1 || fields.day > daysInMonth(fields.year, fields.month)) return null;
        if (fields.hour > 23 || fields.minute > 59 || fields.second > 59) return null;
        return fields;
    }

    function parseIsoDate(value) {
        const text = str(value).trim();
        return ISO_DATE.test(text) ? parseLocalDateTime(text) : null;
    }

    function utcFromFields(year, month, day, hour, minute, second) {
        const date = new Date(0);
        date.setUTCFullYear(year, month - 1, day);
        date.setUTCHours(hour, minute, second, 0);
        return date.getTime();
    }

    const zoneFormatters = new Map();

    function zoneFormatter(timeZone) {
        if (!zoneFormatters.has(timeZone)) {
            zoneFormatters.set(timeZone, new Intl.DateTimeFormat('en-US', {
                timeZone,
                hourCycle: 'h23',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
        }
        return zoneFormatters.get(timeZone);
    }

    function isKnownTimeZone(timeZone) {
        if (!timeZone || typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') return false;
        try {
            zoneFormatter(timeZone);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @description The offset of an IANA zone from UTC, in milliseconds, at
     * the given instant.
     */
    function zoneOffset(timeZone, utcMs) {
        const parts = {};
        zoneFormatter(timeZone).formatToParts(new Date(utcMs)).forEach(part => {
            parts[part.type] = part.value;
        });
        const wallClock = utcFromFields(
            Number(parts.year),
            Number(parts.month),
            Number(parts.day),
            Number(parts.hour) % 24,
            Number(parts.minute),
            Number(parts.second)
        );
        return wallClock - Math.floor(utcMs / 1000) * 1000;
    }

    /**
     * @description Converts a wall-clock time to a UTC instant. With an IANA
     * zone, the offsets a day before and after are tried and each result is
     * checked against the offset at that instant, which settles DST edges
     * the way new Date(localValue) does for the device zone: a time that
     * happens twice takes the earlier instant, and a time skipped by the
     * clock change moves forward. Without a zone, the device zone applies.
     * Returns NaN for an invalid value.
     */
    function localToUtcMs(localValue, timeZone) {
        const f = parseLocalDateTime(localValue);
        if (!f) return NaN;

        if (isKnownTimeZone(timeZone)) {
            const guess = utcFromFields(f.year, f.month, f.day, f.hour, f.minute, f.second);
            const offsetBefore = zoneOffset(timeZone, guess - DAY_MS);
            const offsetAfter = zoneOffset(timeZone, guess + DAY_MS);
            const matches = [offsetBefore, offsetAfter]
                .map(offset => guess - offset)
                .filter(utc => zoneOffset(timeZone, utc) === guess - utc);
            // No match: the time falls in a gap, so keep the earlier offset.
            return matches.length ? Math.min(...matches) : guess - offsetBefore;
        }

        const local = new Date(0);
        local.setFullYear(f.year, f.month - 1, f.day);
        local.setHours(f.hour, f.minute, f.second, 0);
        return local.getTime();
    }

    function formatUtcStamp(utcMs) {
        return new Date(utcMs).toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[-:]/g, '');
    }

    /**
     * @description 'YYYY-MM-DDTHH:MM' (in timeZone, or the device zone) to
     * the iCalendar UTC form 'YYYYMMDDTHHMMSSZ'.
     */
    function toICalUtc(localValue, timeZone) {
        const utc = localToUtcMs(localValue, timeZone);
        if (Number.isNaN(utc)) throw new RangeError('Invalid date');
        return formatUtcStamp(utc);
    }

    /**
     * @description 'YYYY-MM-DD' (a time part is ignored) plus addDays to the
     * iCalendar DATE form 'YYYYMMDD'.
     */
    function toICalDate(dateValue, addDays = 0) {
        const f = parseLocalDateTime(str(dateValue).trim().slice(0, 10));
        if (!f) throw new RangeError('Invalid date');
        const date = new Date(utcFromFields(f.year, f.month, f.day + (Number(addDays) || 0), 0, 0, 0));
        return `${String(date.getUTCFullYear()).padStart(4, '0')}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}`;
    }

    /**
     * @description A random event UID: crypto.randomUUID() when available,
     * otherwise a timestamp plus random base36 characters.
     */
    function createUid() {
        const cryptoApi = globalThis.crypto;
        if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
            try {
                return cryptoApi.randomUUID();
            } catch {
                // Falls through to the timestamp form.
            }
        }
        return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    }

    // --- Numbers, phones and addresses ---

    /**
     * @description Parses a decimal number written with ',' or '.' as the
     * separator. Returns NaN for anything else.
     */
    function parseDecimal(raw) {
        const text = str(raw).trim().replace(/\u2212/g, '-');
        if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) return NaN;
        return Number(text.replace(',', '.'));
    }

    /**
     * @description Six decimals at most, trailing zeros trimmed, never an
     * exponent, and no negative zero (RFC 5870 numbers).
     */
    function formatGeoNumber(n) {
        const value = Number(n);
        if (!Number.isFinite(value) || Math.abs(value) >= 1e21) throw new RangeError('Invalid coordinate');
        let text = value.toFixed(6);
        if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
        return text === '-0' ? '0' : text;
    }

    /**
     * @description Removes spaces, tabs, NBSP and '. - ( )'. Returns the
     * number when it is '+' and 2-20 digits, otherwise null (RFC 3966).
     */
    function normalizePhone(raw) {
        const compact = str(raw).replace(/[\s.()-]/g, '');
        return /^\+?[0-9]{2,20}$/.test(compact) ? compact : null;
    }

    function encodeMailtoAddress(addr) {
        return encodeComponent(addr).replace(/%40/g, '@');
    }

    function encodeMailtoValue(value) {
        return encodeComponent(str(value).replace(/\r\n|\r|\n/g, '\r\n'));
    }

    /**
     * @description True for values such as 'example.com' or
     * 'www.example.com/path' that have no scheme, no '@' and no whitespace.
     */
    function looksLikeBareDomain(text) {
        const value = str(text).trim();
        if (!value || /[\s@]/.test(value)) return false;
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return false;
        return BARE_DOMAIN_PATTERN.test(value);
    }

    /**
     * @description Lowercase ASCII file name part: NFKD, marks removed, every
     * other run of characters becomes '-', at most max characters.
     */
    function slugify(text, max = 40) {
        let value = str(text);
        if (typeof value.normalize === 'function') value = value.normalize('NFKD');
        value = value
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[ßæœøđðþłı]/g, letter => SLUG_LETTERS[letter])
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return value.slice(0, Math.max(0, Number(max) || 0)).replace(/-+$/g, '');
    }

    // --- Payment identifiers ---

    /**
     * @description ISO 7064 mod 97 of a string of digits and capital letters,
     * with A=10 to Z=35.
     */
    function mod97(text) {
        let remainder = 0;
        for (const char of text) {
            const code = char.charCodeAt(0);
            const digits = code >= 65 && code <= 90 ? String(code - 55) : char;
            for (const digit of digits) {
                remainder = (remainder * 10 + (digit.charCodeAt(0) - 48)) % 97;
            }
        }
        return remainder;
    }

    function normalizeIban(s) {
        return str(s).replace(/\s+/g, '').toUpperCase();
    }

    function validateIban(s) {
        const iban = normalizeIban(s);
        return IBAN_PATTERN.test(iban) && mod97(iban.slice(4) + iban.slice(0, 4)) === 1;
    }

    function formatIban(s) {
        return normalizeIban(s).replace(/(.{4})(?=.)/g, '$1 ');
    }

    function normalizeCode(s) {
        return str(s).replace(/\s+/g, '').toUpperCase();
    }

    function validateBic(s) {
        return BIC_PATTERN.test(normalizeCode(s));
    }

    function validateRf(s) {
        const ref = normalizeCode(s);
        return RF_PATTERN.test(ref) && mod97(ref.slice(4) + ref.slice(0, 4)) === 1;
    }

    /**
     * @description The Finnish reference check digit for a base number:
     * weights 7, 3, 1 from the right, check = (10 - sum mod 10) mod 10.
     */
    function finnishCheckDigit(base) {
        const digits = normalizeCode(base);
        if (!/^[0-9]+$/.test(digits)) throw new RangeError('Invalid reference base');
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            sum += Number(digits[digits.length - 1 - i]) * FINNISH_WEIGHTS[i % 3];
        }
        return (10 - (sum % 10)) % 10;
    }

    function validateFinnishReference(s) {
        const ref = normalizeCode(s);
        // Leading zeros carry no value, so a number of only zeros is no reference.
        return FINNISH_REFERENCE_PATTERN.test(ref) && /[1-9]/.test(ref) &&
            finnishCheckDigit(ref.slice(0, -1)) === Number(ref.slice(-1));
    }

    /**
     * @description A Finnish reference (with its check digit) in ISO 11649
     * RF form: '1232' becomes 'RF111232'.
     */
    function rfFromFinnish(ref) {
        const digits = normalizeCode(ref).replace(/^0+/, '');
        if (!/^[0-9]+$/.test(digits)) throw new RangeError('Invalid reference');
        return `RF${pad2(98 - mod97(`${digits}RF00`))}${digits}`;
    }

    /**
     * @description The EPC structured reference for a user value: a valid RF
     * reference as is, or a valid Finnish reference converted to RF. Returns
     * '' when the value is neither.
     */
    function structuredReference(raw) {
        const ref = normalizeCode(raw);
        if (ref.startsWith('RF')) return validateRf(ref) ? ref : '';
        return validateFinnishReference(ref) ? rfFromFinnish(ref) : '';
    }

    /**
     * @description An euro amount with ',' or '.' as the decimal separator to
     * '0.00' form, or '' when invalid or outside 0.01-999999999.99.
     */
    function formatAmount(raw) {
        const trimmed = str(raw).trim();
        if (trimmed.length > AMOUNT_MAX_LENGTH) return '';
        const text = trimmed
            .replace(/^(?:EUR|€)\s*|\s*(?:EUR|€)$/gi, '')
            .replace(/\s/g, '');
        const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(text);
        if (!match) return '';
        const whole = match[1].replace(/^0+(?=\d)/, '');
        if (whole.length > 9) return '';
        const cents = Number(whole) * 100 + Number((match[2] || '').padEnd(2, '0'));
        if (cents < 1) return '';
        return `${Math.floor(cents / 100)}.${pad2(cents % 100)}`;
    }

    function assembleEpc(parts) {
        const lines = [
            'BCD',
            parts.bic ? '001' : '002',
            '1',
            'SCT',
            parts.bic,
            parts.name,
            parts.iban,
            parts.amount ? `EUR${parts.amount}` : '',
            '',
            parts.reference,
            parts.message,
            parts.dueDate ? `ReqdExctnDt/${parts.dueDate}` : ''
        ];
        while (lines.length && lines[lines.length - 1] === '') lines.pop();
        return lines.join('\n');
    }

    function paymentParts(values) {
        return {
            name: singleLine(values.name).trim(),
            iban: normalizeIban(values.iban),
            bic: normalizeCode(values.bic),
            amountRaw: str(values.amount).trim(),
            referenceRaw: str(values.reference).trim(),
            message: singleLine(values.message).trim(),
            dueDate: str(values.dueDate).trim()
        };
    }

    /**
     * @description The UTF-8 size of the payment payload for the byte
     * counter. It also counts values that do not validate yet.
     */
    function paymentBytes(values) {
        const p = paymentParts(values && typeof values === 'object' ? values : {});
        return utf8Length(assembleEpc({
            bic: p.bic,
            name: p.name,
            iban: p.iban,
            amount: p.amountRaw ? (formatAmount(p.amountRaw) || p.amountRaw) : '',
            reference: p.referenceRaw ? (structuredReference(p.referenceRaw) || normalizeCode(p.referenceRaw)) : '',
            message: p.message,
            dueDate: p.dueDate
        }));
    }

    // --- Builders, one per type (SPEC D.1-D.9) ---

    function buildUrlText(v) {
        const text = str(v.text);
        const trimmed = text.trim();
        if (!trimmed) return fail('alerts.enterText', 'text', true);
        return success(text, (/^https?:\/\//i.test(trimmed) && hostnameOf(trimmed)) || Array.from(trimmed).slice(0, 30).join(''));
    }

    /**
     * @description The WiFi security type for a form value or a batch cell.
     * Known names come from WIFI_SECURITY. Other text is read by its words,
     * so the form's own option labels work in a CSV: WEP; WPA3 or SAE
     * without an older WPA (WPA3 only); any other WPA, PSK or SAE (WPA);
     * none, open or no password (an open network). Empty or unknown text
     * means WPA with a password and an open network without one.
     */
    function wifiSecurity(raw, password) {
        const key = str(raw).trim().toUpperCase();
        const fallback = password ? 'WPA' : 'nopass';
        if (!key) return fallback;
        if (Object.prototype.hasOwnProperty.call(WIFI_SECURITY, key)) return WIFI_SECURITY[key];

        const words = key.split(/[^A-Z0-9]+/).filter(Boolean);
        const has = word => words.includes(word);
        if (has('NONE') || has('OPEN') || has('NOPASS') || has('UNSECURED') ||
            (has('NO') && words.some(word => word.startsWith('PASS')))) {
            return 'nopass';
        }
        if (has('WEP')) return 'WEP';
        const modern = has('WPA3') || has('SAE');
        const older = words.some(word => word === 'WPA' || word === 'WPA1' || word === 'WPA2' || word === 'PSK');
        if (modern && !older) return 'WPA3';
        if (modern || older) return 'WPA';
        return fallback;
    }

    function buildWifi(v) {
        const ssid = str(v.ssid);
        const password = str(v.password);
        const security = wifiSecurity(v.security, password);

        if (!ssid.length) return fail('alerts.wifiSsidRequired', 'ssid', true);
        if (utf8Length(ssid) > 32) return fail('alerts.wifiSsidLengthInvalid', 'ssid');
        if ((security === 'WPA' || security === 'WPA3') && !WIFI_WPA_PASSWORD.test(password)) {
            return fail('alerts.wifiWpaPasswordInvalid', 'password');
        }
        if (security === 'WEP' && !WIFI_WEP_PASSWORD.test(password)) {
            return fail('alerts.wifiWepPasswordInvalid', 'password');
        }

        // WPA3 only is T:WPA plus the transition-disable flag R:1.
        let payload = `WIFI:S:${escapeWifi(ssid)};T:${security === 'WPA3' ? 'WPA' : security};`;
        if (security === 'WPA3') payload += 'R:1;';
        if (security !== 'nopass') payload += `P:${escapeWifi(password)};`;
        if (toBool(v.hidden)) payload += 'H:true;';

        // The SSID names the file. The password never does.
        return success(`${payload};`, ssid, security !== 'nopass');
    }

    function buildVCard(v) {
        const f = {};
        ['firstName', 'lastName', 'organization', 'department', 'title', 'phoneWork', 'phoneMobile', 'phoneHome',
            'email', 'website', 'street', 'city', 'state', 'zip', 'country', 'addressType', 'birthday', 'note']
            .forEach(key => {
                f[key] = str(v[key]).trim();
            });

        if (!f.firstName && !f.lastName && !f.email && !f.phoneMobile && !f.phoneWork && !f.phoneHome) {
            return fail('alerts.vcardRequired', 'firstName', true);
        }
        if (f.email && !isValidEmail(f.email)) return fail('alerts.emailInvalid', 'email');
        if (f.website && !isValidHttpUrl(f.website)) return fail('alerts.urlInvalid', 'website');
        if (f.birthday && !parseIsoDate(f.birthday)) return fail('alerts.dateInvalid', 'birthday');

        const fullName = `${f.firstName} ${f.lastName}`.trim();
        const displayName = fullName || f.email || f.phoneMobile || f.phoneWork || f.phoneHome || f.organization || 'Contact';
        const lines = ['BEGIN:VCARD', 'VERSION:3.0'];

        lines.push(`N:${escapeText(f.lastName)};${escapeText(f.firstName)};;;`);
        lines.push(`FN:${escapeText(displayName)}`);
        if (f.organization || f.department) {
            lines.push(`ORG:${escapeText(f.organization)}${f.department ? `;${escapeText(f.department)}` : ''}`);
        }
        if (f.title) lines.push(`TITLE:${escapeText(f.title)}`);
        if (f.phoneWork) lines.push(`TEL;TYPE=WORK,VOICE:${escapeText(f.phoneWork)}`);
        if (f.phoneMobile) lines.push(`TEL;TYPE=CELL,VOICE:${escapeText(f.phoneMobile)}`);
        if (f.phoneHome) lines.push(`TEL;TYPE=HOME,VOICE:${escapeText(f.phoneHome)}`);
        // EMAIL and URL are not TEXT values, so they are not escaped.
        if (f.email) lines.push(`EMAIL:${f.email}`);
        if (f.website) lines.push(`URL:${f.website.replace(/[\r\n]/g, '')}`);
        if (f.street || f.city || f.state || f.zip || f.country) {
            const explicitType = f.addressType.toLowerCase();
            const adrType = explicitType === 'work' || explicitType === 'home'
                ? explicitType.toUpperCase()
                : (f.organization || f.title ? 'WORK' : 'HOME');
            lines.push(`ADR;TYPE=${adrType}:;;${escapeText(f.street)};${escapeText(f.city)};${escapeText(f.state)};${escapeText(f.zip)};${escapeText(f.country)}`);
        }
        if (f.birthday) lines.push(`BDAY:${f.birthday}`);
        if (f.note) lines.push(`NOTE:${escapeText(f.note)}`);
        lines.push('END:VCARD');

        return success(lines.join('\r\n'), fullName || f.email.split('@')[0] || f.organization);
    }

    function buildSmsPhone(v) {
        const mode = SMS_MODES[str(v.mode).trim().toLowerCase()] || 'sms';
        const raw = str(v.number).trim();
        if (!raw) return fail('alerts.phoneRequired', 'number', true);

        const number = normalizePhone(raw);
        if (!number) return fail('alerts.phoneInvalid', 'number');
        if (mode === 'phone') return success(`tel:${number}`, number);

        const message = str(v.message);
        return success(message.trim() ? `SMSTO:${number}:${message}` : `SMSTO:${number}`, number);
    }

    function buildEmail(v) {
        const to = str(v.to).trim();
        const subject = str(v.subject).trim();
        const body = str(v.body);

        if (!to && !subject && !body.trim()) return fail('alerts.emailRequired', 'to', true);
        if (to && !isValidEmail(to)) return fail('alerts.emailInvalid', 'to');

        const params = [];
        if (subject) params.push(`subject=${encodeMailtoValue(subject)}`);
        if (body) params.push(`body=${encodeMailtoValue(body)}`);
        const query = params.join('&');
        return success(`mailto:${encodeMailtoAddress(to)}${query ? `?${query}` : ''}`, to.split('@')[0] || subject);
    }

    function buildCalendar(v, opts) {
        const title = str(v.title).trim();
        const location = str(v.location).trim();
        const start = str(v.start).trim();
        const end = str(v.end).trim();
        const description = str(v.description).trim();
        const timeZone = str(v.timeZone).trim();

        if (!title || !start) return fail('alerts.eventRequired', !title ? 'title' : 'start', true);

        const dateLines = [];
        if (toBool(v.allDay)) {
            const startDate = parseLocalDateTime(start.slice(0, 10));
            const endDate = end ? parseLocalDateTime(end.slice(0, 10)) : null;
            if (!startDate) return fail('alerts.dateInvalid', 'start');
            if (end && !endDate) return fail('alerts.dateInvalid', 'end');
            if (endDate && end.slice(0, 10) < start.slice(0, 10)) return fail('alerts.eventEndInvalid', 'end');
            // DTEND of an all-day event is exclusive: the day after the last day.
            dateLines.push(`DTSTART;VALUE=DATE:${toICalDate(start)}`);
            dateLines.push(`DTEND;VALUE=DATE:${toICalDate(end || start, 1)}`);
        } else {
            const startUtc = localToUtcMs(start, timeZone);
            const endUtc = end ? localToUtcMs(end, timeZone) : NaN;
            if (Number.isNaN(startUtc)) return fail('alerts.dateInvalid', 'start');
            if (end && Number.isNaN(endUtc)) return fail('alerts.dateInvalid', 'end');
            if (end && endUtc < startUtc) return fail('alerts.eventEndInvalid', 'end');
            dateLines.push(`DTSTART:${formatUtcStamp(startUtc)}`);
            if (end) dateLines.push(`DTEND:${formatUtcStamp(endUtc)}`);
        }

        const now = opts.now instanceof Date && !Number.isNaN(opts.now.getTime()) ? opts.now : new Date();
        const uid = str(opts.uid).replace(/[\r\n]/g, '') || createUid();
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//QRTurbo.app//QR Event//EN',
            'BEGIN:VEVENT',
            `UID:${uid}@qrturbo.app`,
            `DTSTAMP:${formatUtcStamp(Math.floor(now.getTime() / 1000) * 1000)}`,
            ...dateLines,
            `SUMMARY:${escapeText(title)}`
        ];
        if (location) lines.push(`LOCATION:${escapeText(location)}`);
        if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
        lines.push('END:VEVENT', 'END:VCALENDAR');
        return success(lines.join('\r\n'), title);
    }

    function buildLocation(v) {
        const address = str(v.address).trim();
        const latitude = str(v.latitude).trim();
        const longitude = str(v.longitude).trim();

        if (!address && !latitude && !longitude) return fail('alerts.locationRequired', 'address', true);

        if (latitude || longitude) {
            const lat = parseDecimal(latitude);
            const lng = parseDecimal(longitude);
            const latOk = Number.isFinite(lat) && lat >= -90 && lat <= 90;
            const lngOk = Number.isFinite(lng) && lng >= -180 && lng <= 180;
            if (!latOk || !lngOk) return fail('alerts.locationCoordinatesInvalid', !latOk ? 'latitude' : 'longitude');

            const coords = `${formatGeoNumber(lat)},${formatGeoNumber(lng)}`;
            if (!address) return success(`geo:${coords}`, coords);
            // Android map intents read the label in parentheses.
            const label = encodeComponent(address).replace(/\(/g, '%28').replace(/\)/g, '%29');
            return success(`geo:${coords}?q=${coords}(${label})`, address);
        }

        return success(`https://www.google.com/maps/search/?api=1&query=${encodeComponent(address)}`, address);
    }

    function cleanSocialHandle(value, platform, type) {
        let handle = str(value)
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

    function buildSocial(v) {
        const platform = str(v.platform).trim() || 'instagram';
        const profileType = str(v.profileType).trim() || 'person';
        const rawValue = str(v.handle).trim();
        const config = Object.prototype.hasOwnProperty.call(SOCIAL_PLATFORMS, platform)
            ? SOCIAL_PLATFORMS[platform]
            : SOCIAL_PLATFORMS.instagram;

        if (!rawValue) return fail('alerts.socialRequired', 'handle', true);

        let url;
        if (/^https?:\/\//i.test(rawValue)) {
            if (!isValidHttpUrl(rawValue)) return fail('alerts.socialUrlInvalid', 'handle');
            url = rawValue;
        } else if (config.requiresUrl) {
            return fail('alerts.socialUrlInvalid', 'handle');
        } else {
            const handle = cleanSocialHandle(rawValue, platform, profileType);
            if (!/^[A-Za-z0-9._-]+$/.test(handle)) return fail('alerts.socialHandleInvalid', 'handle');
            url = config.buildUrl(handle, profileType);
        }

        return success(url, `${platform} ${Array.from(rawValue.replace(/^https?:\/\//i, '')).slice(0, 30).join('')}`);
    }

    function buildWhatsApp(v) {
        const target = str(v.phone).trim();
        const message = str(v.message);
        const query = message ? `?text=${encodeComponent(message)}` : '';

        if (!target) return fail('alerts.whatsappPhoneRequired', 'phone', true);

        const hint = target.replace(/^@/, '');
        if (target.startsWith('@')) {
            if (!WHATSAPP_USERNAME_PATTERN.test(target)) return fail('alerts.whatsappPhoneRequired', 'phone');
            return success(`https://wa.me/${target.slice(1)}${query}`, hint);
        }

        if (!WHATSAPP_PHONE_PATTERN.test(target)) return fail('alerts.whatsappPhoneRequired', 'phone');
        const digits = target.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) return fail('alerts.whatsappPhoneRequired', 'phone');
        return success(`https://wa.me/${digits}${query}`, hint);
    }

    function buildMeCard(v) {
        const name = str(v.name).trim();
        const phone = str(v.phone).trim();
        const email = str(v.email).trim();
        const url = str(v.url).trim();
        const address = str(v.address).trim();

        if (!name && !phone && !email) return fail('alerts.mecardRequired', 'name', true);
        if (email && !isValidEmail(email)) return fail('alerts.emailInvalid', 'email');
        if (url && !isValidHttpUrl(url)) return fail('alerts.urlInvalid', 'url');

        let payload = 'MECARD:';
        if (name) payload += `N:${escapeMeCard(name)};`;
        if (phone) payload += `TEL:${escapeMeCard(phone)};`;
        if (email) payload += `EMAIL:${escapeMeCard(email)};`;
        if (url) payload += `URL:${escapeMeCard(url)};`;
        if (address) payload += `ADR:${escapeMeCard(address)};`;
        return success(`${payload};`, name || email.split('@')[0]);
    }

    function buildAppLink(v) {
        const webUrl = str(v.webUrl).trim();
        const iosUrl = str(v.iosUrl).trim();
        const androidUrl = str(v.androidUrl).trim();
        const target = str(v.target);

        if (!webUrl && !iosUrl && !androidUrl) return fail('alerts.appLinkRequired', 'webUrl', true);

        const invalid = [['webUrl', webUrl], ['iosUrl', iosUrl], ['androidUrl', androidUrl]]
            .find(([, url]) => url && !isValidHttpUrl(url));
        if (invalid) return fail('alerts.urlInvalid', invalid[0]);

        if (webUrl) return success(webUrl, hostnameOf(webUrl));

        const selected = target === 'ios' ? iosUrl : androidUrl;
        const fallback = target === 'ios' ? androidUrl : iosUrl;
        const storeUrl = selected || fallback;
        return success(storeUrl, hostnameOf(storeUrl));
    }

    function buildPayment(v) {
        const p = paymentParts(v);

        if (!p.name || !p.iban) return fail('alerts.paymentRequired', !p.name ? 'name' : 'iban', true);
        if (charLength(p.name) > EPC_NAME_MAX) return fail('alerts.paymentNameTooLong', 'name');
        if (!validateIban(p.iban)) return fail('alerts.ibanInvalid', 'iban');
        if (p.bic && !BIC_PATTERN.test(p.bic)) return fail('alerts.bicInvalid', 'bic');

        const amount = p.amountRaw ? formatAmount(p.amountRaw) : '';
        if (p.amountRaw && !amount) return fail('alerts.amountInvalid', 'amount');

        const reference = p.referenceRaw ? structuredReference(p.referenceRaw) : '';
        if (p.referenceRaw && !reference) return fail('alerts.referenceInvalid', 'reference');
        // EPC allows a structured or an unstructured remittance, not both.
        if (reference && p.message) return fail('alerts.referenceAndMessage', 'message');
        if (charLength(p.message) > EPC_MESSAGE_MAX) return fail('alerts.paymentMessageTooLong', 'message');
        if (p.dueDate && !parseIsoDate(p.dueDate)) return fail('alerts.dateInvalid', 'dueDate');

        const payload = assembleEpc({
            bic: p.bic,
            name: p.name,
            iban: p.iban,
            amount,
            reference,
            message: p.message,
            dueDate: p.dueDate
        });
        // 331 bytes is the capacity of version 13 at level M (EPC069-12).
        if (utf8Length(payload) > EPC_MAX_BYTES) return fail('alerts.paymentTooLong', p.message ? 'message' : 'name');

        // The recipient names the file (SPEC D.9). The IBAN never does.
        return success(payload, `payment ${p.name}`, false);
    }

    const BUILDERS = {
        URLText: buildUrlText,
        VCard: buildVCard,
        Wifi: buildWifi,
        SMSPhone: buildSmsPhone,
        Email: buildEmail,
        CalendarEvent: buildCalendar,
        Location: buildLocation,
        SocialMedia: buildSocial,
        WhatsApp: buildWhatsApp,
        MeCard: buildMeCard,
        AppLink: buildAppLink,
        Payment: buildPayment
    };

    /**
     * @description Builds the QR payload for a content type from plain
     * values (keys per SPEC D). Returns { ok: true, payload, isSensitive,
     * filenameHint } or { ok: false, errorKey, field, empty }, where field is
     * the values key to fix and empty means required content is missing.
     */
    function build(type, values, opts) {
        if (!Object.prototype.hasOwnProperty.call(BUILDERS, type)) return fail('alerts.noData', null, true);
        const safeValues = values && typeof values === 'object' ? values : {};
        const safeOpts = opts && typeof opts === 'object' ? opts : {};
        return BUILDERS[type](safeValues, safeOpts);
    }

    const api = {
        TYPES,
        BATCH_TYPES,
        FIELDS,
        build,
        looksLikeBareDomain,
        normalizePhone,
        parseDecimal,
        formatGeoNumber,
        toICalUtc,
        toICalDate,
        encodeMailtoAddress,
        slugify,
        // Extras beyond SPEC C.4: a stable UID for the event form, and the
        // byte counter of the payment form.
        createUid,
        paymentBytes,
        iban: Object.freeze({
            normalize: normalizeIban,
            validate: validateIban,
            format: formatIban
        }),
        bic: Object.freeze({
            validate: validateBic
        }),
        rf: Object.freeze({
            validate: validateRf,
            fromFinnish: rfFromFinnish
        }),
        finnishReference: Object.freeze({
            validate: validateFinnishReference,
            checkDigit: finnishCheckDigit
        })
    };

    globalThis.QRTurboPayloads = Object.freeze(api);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
