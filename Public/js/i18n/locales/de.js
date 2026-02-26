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
        'Kostenloser QR-Code-Generator - Farben, Logos & Stile Anpassen | QRTurbo.app',
      description:
        'Erstellen Sie sofort kostenlose anpassbare QR-Codes mit QRTurbo.app. Fügen Sie Logos, individuelle Farben und Stile hinzu. Erstellen Sie QR-Codes für URLs, WiFi-Netzwerke, vCards, SMS und Anrufe. Keine Werbung, kein Tracking – vollständig browserbasiert und sicher.',
      keywords:
        'QR-Code-Generator, individueller QR-Code, QR-Code mit Logo, farbiger QR-Code, kostenloser QR-Code-Ersteller, WiFi-QR-Code, vCard-QR-Code, SMS-QR-Code, Online-QR-Tool, Tracking-freier QR-Generator'
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
      wifi: 'WiFi'
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
      styleOptions: 'Stiloptionen'
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
      smsMessage: 'Ihre vorausgefüllte Nachricht hier...'
    },
    actions: {
      generate: 'QR-Code Erstellen',
      download: 'QR-Code Herunterladen',
      reset: 'Auf Standard Zurücksetzen',
      customize: 'Aussehen Anpassen (Optional)',
      chooseLogo: 'Bild Auswählen'
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
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Bitte geben Sie einen Text oder eine URL ein',
      vcardRequired:
        'Bitte füllen Sie mindestens eines aus: Vorname, Nachname, E-Mail oder Telefonnummer.',
      wifiSsidRequired: 'Bitte geben Sie den Netzwerknamen (SSID) ein.',
      phoneRequired: 'Bitte geben Sie eine Telefonnummer ein.',
      lowContrast:
        '⚠️ Niedriger Kontrast erkannt. Ihr QR-Code könnte schwer zu scannen sein. Erwägen Sie einen dunkleren Vordergrund oder helleren Hintergrund.',
      dataEmpty: 'QR-Code-Daten sind leer.',
      noData: 'Keine Daten für QR-Code angegeben.',
      libraryLoadFailed:
        'QR-Code-Bibliothek konnte nicht geladen werden. Bitte aktualisieren Sie die Seite.',
      generationError: 'Fehler beim Erstellen des QR-Codes',
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
      github: 'Quellcode auf GitHub ansehen'
    },
    helpers: {
      quietZoneHelper:
        'Platz um den QR-Code (empfohlen: 4-16px für zuverlässiges Scannen)'
    },
    misc: {
      qrPlaceholder: 'QR-Code wird hier erscheinen'
    }
  };
})();
