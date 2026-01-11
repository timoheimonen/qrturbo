// Swedish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.sv = {
    meta: {
      title:
        'Gratis QR-Kodgenerator - Anpassa Färger, Logotyper & Stilar | QRTurbo.app',
      description:
        'Generera gratis anpassningsbara QR-koder direkt med QRTurbo.app. Lägg till logotyper, anpassade färger och stilar. Skapa QR-koder för URL:er, WiFi-nätverk, vCard, SMS och telefonsamtal. Inga annonser, ingen spårning – helt webbläsarbaserad och säker.',
      keywords:
        'QR-kodgenerator, anpassad QR-kod, QR-kod med logotyp, färgad QR-kod, gratis QR-kodskapare, WiFi QR-kod, vCard QR-kod, SMS QR-kod, online QR-verktyg, spårningsfri QR-generator'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodgenerator',
      subtitle:
        'Skapa anpassningsbara QR-koder med logotyper, färger och stilar. Stöd för URL:er, WiFi, vCard, SMS och samtal',
      selectLanguage: 'Välj Språk'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Text eller URL',
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbete)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-post',
      website: 'Webbplats',
      street: 'Gata',
      city: 'Stad',
      state: 'Stat/Provins',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Nätverksnamn (SSID)',
      password: 'Lösenord',
      authentication: 'Autentisering',
      hiddenNetwork: 'Detta är ett dolt nätverk',
      phoneNumber: 'Telefonnummer',
      message: 'Meddelande (valfritt)',
      qrSize: 'QR-Kodstorlek',
      foregroundColor: 'Förgrundsfärg',
      backgroundColor: 'Bakgrundsfärg',
      errorCorrection: 'Felkorrigering',
      downloadFormat: 'Nedladdningsformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hörnfyrkant',
      cornerDot: 'Hörnpunkt',
      quietZone: 'Tyst Zon (Marginal)',
      logoSize: 'Logotypstorlek',
      logoMargin: 'Logotypmarginal',
      logo: 'Logotyp (Valfritt)',
      styleOptions: 'Stilalternativ'
    },
    placeholders: {
      url: 't.ex., https://www.exempel.com',
      firstName: 'Anders',
      lastName: 'Andersson',
      organization: 'ACME AB',
      title: 'Utvecklare',
      phoneWork: '+46-555-555-1234',
      phoneMobile: '+46-555-555-5678',
      email: 'anders.andersson@exempel.com',
      website: 'https://www.exempel.com',
      street: 'Huvudgatan 123',
      city: 'Stockholm',
      state: 'Stockholm',
      zip: '11122',
      country: 'Sverige',
      ssid: 't.ex., MittHemWiFi',
      wifiPassword: 'Ditt hemliga lösenord',
      phoneNumber: 't.ex., +46555123456',
      smsMessage: 'Ditt förifyllda meddelande här...'
    },
    actions: {
      generate: 'Skapa QR-Kod',
      download: 'Ladda Ner QR-Kod',
      reset: 'Återställ till Standard',
      customize: 'Anpassa Utseende (Valfritt)',
      chooseLogo: 'Välj Bild'
    },
    options: {
      sizeSmall: 'Liten (256px)',
      sizeMedium: 'Medium (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Låg (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Hög (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Fyrkant',
      dotRounded: 'Rundad',
      dotDots: 'Punkter',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Rundad',
      dotExtraRounded: 'Extra Rundad',
      cornerSquare: 'Fyrkant',
      cornerExtraRounded: 'Extra Rundad',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Ange en text eller en URL',
      vcardRequired:
        'Fyll i minst en av: Förnamn, Efternamn, E-post eller Telefonnummer.',
      wifiSsidRequired: 'Ange Nätverksnamn (SSID).',
      phoneRequired: 'Ange ett telefonnummer.',
      lowContrast:
        '⚠️ Låg kontrast upptäckt. Din QR-kod kan vara svår att skanna. Överväg att använda mörkare förgrund eller ljusare bakgrund.',
      dataEmpty: 'QR-koddata är tomma.',
      noData: 'Ingen data tillhandahållen för QR-kod.',
      libraryLoadFailed: 'QR-kodbiblioteket kunde inte laddas. Uppdatera sidan.',
      generationError: 'Fel vid generering av QR-kod',
      generateFirst: 'Generera en QR-kod först.',
      resetSuccess: 'Anpassning återställd till standard',
      largeImageWarning:
        '⚠️ Stor bildfil ({{size}}MB). Överväg att använda en mindre bild för bättre prestanda.',
      invalidImageFile: 'Välj en giltig bildfil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tecken'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonsamtal'
    },
    footer: {
      privacy1: 'Denna gratis QR-kodgenerator körs helt i din webbläsare.',
      privacy2:
        'Ingen data lagras eller skickas någonstans. Ingen spårning, inga annonser, inget nonsens.',
      github: 'Visa källkod på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Utrymme runt QR-koden (rekommenderat: 4-16px för pålitlig skanning)'
    },
    misc: {
      qrPlaceholder: 'QR-koden kommer att visas här'
    }
  };
})();
