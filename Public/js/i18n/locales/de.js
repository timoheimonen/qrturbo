// German translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.de = {
    meta: {
      title:
        'Kostenloser QR-Code-Generator mit Logos & Farben | QRTurbo.app',
      description:
        'Erstellen Sie kostenlose individuelle QR-Codes für URLs, WLAN, vCards, SMS und Anrufe. Fügen Sie Logos, Farben und Stile direkt im Browser hinzu, ohne Tracking oder Daten-Uploads.'
    },
    app: {
      title: 'QRTurbo.app - Kostenloser QR-Code-Generator',
      subtitle:
        'Erstellen Sie anpassbare QR-Codes mit Logos, Farben und Stilen. Unterstützung für URLs, WiFi, vCards, SMS und Anrufe',
      selectLanguage: 'Sprache Auswählen'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi',
      email: 'E-Mail',
      calendarEvent: 'Termin',
      location: 'Standort',
      socialMedia: 'Soziale Medien',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-Link'
    },
    fields: {
      textOrUrl: 'Text oder URL',
      firstName: 'Vorname',
      lastName: 'Nachname',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbeit)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-Mail',
      website: 'Webseite',
      street: 'Straße',
      city: 'Stadt',
      state: 'Bundesland',
      zip: 'Postleitzahl',
      country: 'Land',
      ssid: 'Netzwerkname (SSID)',
      password: 'Passwort',
      authentication: 'Authentifizierung',
      hiddenNetwork: 'Dies ist ein verstecktes Netzwerk',
      phoneNumber: 'Telefonnummer',
      message: 'Nachricht (optional)',
      qrSize: 'QR-Code-Größe',
      foregroundColor: 'Vordergrundfarbe',
      backgroundColor: 'Hintergrundfarbe',
      errorCorrection: 'Fehlerkorrektur',
      downloadFormat: 'Download-Format',
      dotStyle: 'Punktstil',
      cornerSquare: 'Eckquadrat',
      cornerDot: 'Eckpunkt',
      quietZone: 'Ruhezone (Rand)',
      logoSize: 'Logo-Größe',
      logoMargin: 'Logo-Rand',
      logo: 'Logo (Optional)',
      styleOptions: 'Stiloptionen',
      emailTo: 'Empfänger-E-Mail',
      emailSubject: 'Betreff',
      emailBody: 'Nachricht',
      eventTitle: 'Termintitel',
      eventStart: 'Start',
      eventEnd: 'Ende',
      eventLocation: 'Standort',
      eventDescription: 'Beschreibung',
      locationAddress: 'Adresse oder Ort',
      latitude: 'Breitengrad',
      longitude: 'Längengrad',
      socialPlatform: 'Plattform',
      socialProfileType: 'Profiltyp',
      socialHandleOrUrl: 'Benutzername oder Profil-URL',
      whatsappPhone: 'WhatsApp-Nummer',
      whatsappMessage: 'Nachricht (optional)',
      mecardName: 'Name',
      address: 'Adresse',
      appWebUrl: 'Fallback-/Web-URL',
      appIosUrl: 'iOS App Store-URL',
      appAndroidUrl: 'Android Play Store-URL',
      appLinkTarget: 'Store-Fallback'
    },
    placeholders: {
      url: 'z.B., https://www.beispiel.com',
      firstName: 'Hans',
      lastName: 'Schmidt',
      organization: 'ACME GmbH',
      title: 'Entwickler',
      phoneWork: '+49-555-555-1234',
      phoneMobile: '+49-555-555-5678',
      email: 'hans.schmidt@beispiel.com',
      website: 'https://www.beispiel.com',
      street: 'Hauptstraße 123',
      city: 'Berlin',
      state: 'Berlin',
      zip: '10115',
      country: 'Deutschland',
      ssid: 'z.B., MeinHeimWiFi',
      wifiPassword: 'Ihr geheimes Passwort',
      phoneNumber: 'z.B., +49555123456',
      smsMessage: 'Ihre vorausgefüllte Nachricht hier...',
      emailTo: 'hallo@example.com',
      emailSubject: 'Hallo von QRTurbo.app',
      emailBody: 'Schreiben Sie hier Ihre E-Mail-Nachricht...',
      eventTitle: 'Teammeeting',
      eventLocation: 'Konferenzraum oder Adresse',
      eventDescription: 'Termindetails...',
      locationAddress: 'Brandenburger Tor, Berlin',
      latitude: '52.5163',
      longitude: '13.3777',
      socialHandle: '@benutzername oder https://...',
      whatsappPhone: 'z.B., +49555123456',
      whatsappMessage: 'Ihre WhatsApp-Nachricht hier...',
      mecardName: 'Max Mustermann',
      address: 'Hauptstraße 123, Berlin',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'QR-Code Erstellen',
      download: 'QR-Code Herunterladen',
      reset: 'Auf Standard Zurücksetzen',
      customize: 'Aussehen Anpassen (Optional)',
      chooseLogo: 'Bild Auswählen',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort ausblenden'
    },
    options: {
      sizeSmall: 'Klein (256px)',
      sizeMedium: 'Mittel (512px)',
      sizeLarge: 'Groß (1024px)',
      errorLow: 'L - Niedrig (7%)',
      errorMedium: 'M - Mittel (15%)',
      errorQuartile: 'Q - Quartil (25%)',
      errorHigh: 'H - Hoch (30%)',
      formatPng: 'PNG (Raster)',
      formatSvg: 'SVG (Vektor)',
      formatPdf: 'PDF (Dokument)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Keine',
      dotSquare: 'Quadratisch',
      dotRounded: 'Abgerundet',
      dotDots: 'Punkte',
      dotClassy: 'Elegant',
      dotClassyRounded: 'Elegant Abgerundet',
      dotExtraRounded: 'Extra Abgerundet',
      cornerSquare: 'Quadratisch',
      cornerExtraRounded: 'Extra Abgerundet',
      cornerDot: 'Punkt',
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
      socialOther: 'Andere URL',
      socialTypePerson: 'Person/Profil',
      socialTypeCompany: 'Unternehmen',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'iOS verwenden, wenn keine Web-URL vorhanden ist',
      appTargetAndroid: 'Android verwenden, wenn keine Web-URL vorhanden ist'
    },
    alerts: {
      enterText: 'Bitte geben Sie einen Text oder eine URL ein',
      vcardRequired:
        'Bitte füllen Sie mindestens eines aus: Vorname, Nachname, E-Mail oder Telefonnummer.',
      wifiSsidRequired: 'Bitte geben Sie den Netzwerknamen (SSID) ein.',
      wifiWpaPasswordInvalid:
        'WPA/WPA2-Passwörter müssen 8-63 druckbare Zeichen oder genau 64 hexadezimale Zeichen haben.',
      wifiWepPasswordInvalid:
        'WEP-Passwörter müssen 5 oder 13 druckbare Zeichen oder 10 oder 26 hexadezimale Zeichen haben.',
      phoneRequired: 'Bitte geben Sie eine Telefonnummer ein.',
      emailRequired: 'Bitte geben Sie mindestens ein E-Mail-Feld ein.',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      eventRequired: 'Bitte geben Sie einen Termintitel und eine Startzeit ein.',
      eventEndInvalid: 'Die Endzeit darf nicht vor der Startzeit liegen.',
      locationRequired: 'Bitte geben Sie eine Adresse oder beide Koordinaten ein.',
      locationCoordinatesInvalid: 'Bitte geben Sie gültige Breiten- und Längengrade ein.',
      socialRequired: 'Bitte geben Sie einen Social-Media-Benutzernamen oder eine Profil-URL ein.',
      socialHandleInvalid: 'Bitte geben Sie einen gültigen Benutzernamen mit Buchstaben, Zahlen, Punkten, Unterstrichen oder Bindestrichen ein.',
      socialUrlInvalid: 'Bitte geben Sie eine gültige Social-Profil-URL ein, die mit http:// oder https:// beginnt.',
      whatsappPhoneRequired: 'Bitte geben Sie eine WhatsApp-Telefonnummer mit Ländervorwahl ein.',
      mecardRequired: 'Bitte geben Sie mindestens eines ein: Name, Telefonnummer oder E-Mail.',
      appLinkRequired: 'Bitte geben Sie eine Web-, iOS- oder Android-App-URL ein.',
      urlInvalid: 'Bitte geben Sie eine gültige URL ein, die mit http:// oder https:// beginnt.',
      lowContrast:
        '⚠️ Niedriger Kontrast erkannt. Ihr QR-Code könnte schwer zu scannen sein. Erwägen Sie einen dunkleren Vordergrund oder helleren Hintergrund.',
      dataEmpty: 'QR-Code-Daten sind leer.',
      noData: 'Keine Daten für QR-Code angegeben.',
      libraryLoadFailed:
        'QR-Code-Bibliothek konnte nicht geladen werden. Bitte aktualisieren Sie die Seite.',
      generationError: 'Fehler beim Erstellen des QR-Codes',
      pdfExportFailed: 'PDF-Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
      generateFirst: 'Bitte erstellen Sie zuerst einen QR-Code.',
      resetSuccess: 'Anpassung auf Standard zurückgesetzt',
      largeImageWarning:
        '⚠️ Große Bilddatei ({{size}}MB). Erwägen Sie ein kleineres Bild für bessere Leistung.',
      invalidImageFile:
        'Bitte wählen Sie eine gültige Bilddatei (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} Zeichen'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonanruf'
    },
    footer: {
      privacy1: 'Dieser kostenlose QR-Code-Generator läuft vollständig in Ihrem Browser.',
      privacy2:
        'Keine Daten werden gespeichert oder irgendwohin gesendet. Kein Tracking, keine Werbung, kein Unsinn.',
      privacyPolicy: 'Datenschutzerklärung',
      termsOfUse: 'Nutzungsbedingungen',
      github: 'Quellcode auf GitHub ansehen'
    },
    helpers: {
      quietZoneHelper:
        'Platz um den QR-Code (empfohlen: 4-16px für zuverlässiges Scannen)',
      socialHandleHelper:
        'Geben Sie einen Benutzernamen wie @benutzername ein oder fügen Sie eine vollständige https:// Profil-URL ein.'
    },
    misc: {
      qrPlaceholder: 'QR-Code wird hier erscheinen',
      socialPreview: 'QR-Ziel'
    }
  };
})();
