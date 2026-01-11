// Danish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.da = {
    meta: {
      title:
        'Gratis QR-Kodegenerator - Tilpas Farver, Logoer & Stilarter | QRTurbo.app',
      description:
        'Generer gratis tilpasselige QR-koder øjeblikkeligt med QRTurbo.app. Tilføj logoer, tilpassede farver og stilarter. Opret QR-koder til URL\'er, WiFi-netværk, vCard, SMS og telefonopkald. Ingen annoncer, ingen sporing – fuldt browserbaseret og sikkert.',
      keywords:
        'QR-kodegenerator, tilpasset QR-kode, QR-kode med logo, farvet QR-kode, gratis QR-kodeskaber, WiFi QR-kode, vCard QR-kode, SMS QR-kode, online QR-værktøj, sporingsfri QR-generator'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodegenerator',
      subtitle:
        'Opret tilpasselige QR-koder med logoer, farver og stilarter. Support til URL\'er, WiFi, vCard, SMS og opkald',
      selectLanguage: 'Vælg Sprog'
    },
    tabs: {
      urlText: 'URL/Tekst',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Tekst eller URL',
      firstName: 'Fornavn',
      lastName: 'Efternavn',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbejde)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-mail',
      website: 'Hjemmeside',
      street: 'Gade',
      city: 'By',
      state: 'Stat/Provins',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Netværksnavn (SSID)',
      password: 'Adgangskode',
      authentication: 'Godkendelse',
      hiddenNetwork: 'Dette er et skjult netværk',
      phoneNumber: 'Telefonnummer',
      message: 'Besked (valgfrit)',
      qrSize: 'QR-Kodestørrelse',
      foregroundColor: 'Forgrundsfarve',
      backgroundColor: 'Baggrundsfarve',
      errorCorrection: 'Fejlrettelse',
      downloadFormat: 'Downloadformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hjørne Firkant',
      cornerDot: 'Hjørnepunkt',
      quietZone: 'Rolig Zone (Margen)',
      logoSize: 'Logostørrelse',
      logoMargin: 'Logomargen',
      logo: 'Logo (Valgfrit)',
      styleOptions: 'Stilindstillinger'
    },
    placeholders: {
      url: 'f.eks., https://www.eksempel.com',
      firstName: 'Anders',
      lastName: 'Andersen',
      organization: 'ACME ApS',
      title: 'Udvikler',
      phoneWork: '+45-555-555-1234',
      phoneMobile: '+45-555-555-5678',
      email: 'anders.andersen@eksempel.com',
      website: 'https://www.eksempel.com',
      street: 'Hovedgaden 123',
      city: 'København',
      state: 'Hovedstaden',
      zip: '1000',
      country: 'Danmark',
      ssid: 'f.eks., MitHjemWiFi',
      wifiPassword: 'Din hemmelige adgangskode',
      phoneNumber: 'f.eks., +45555123456',
      smsMessage: 'Din forudfyldte besked her...'
    },
    actions: {
      generate: 'Opret QR-Kode',
      download: 'Download QR-Kode',
      reset: 'Nulstil til Standard',
      customize: 'Tilpas Udseende (Valgfrit)',
      chooseLogo: 'Vælg Billede'
    },
    options: {
      sizeSmall: 'Lille (256px)',
      sizeMedium: 'Mellem (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Lav (7%)',
      errorMedium: 'M - Mellem (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Høj (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Firkant',
      dotRounded: 'Afrundet',
      dotDots: 'Prikker',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Afrundet',
      dotExtraRounded: 'Ekstra Afrundet',
      cornerSquare: 'Firkant',
      cornerExtraRounded: 'Ekstra Afrundet',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Indtast venligst en tekst eller en URL',
      vcardRequired:
        'Udfyld venligst mindst én af: Fornavn, Efternavn, E-mail eller Telefonnummer.',
      wifiSsidRequired: 'Indtast venligst Netværksnavn (SSID).',
      phoneRequired: 'Indtast venligst et telefonnummer.',
      lowContrast:
        '⚠️ Lav kontrast registreret. Din QR-kode kan være svær at scanne. Overvej at bruge mørkere forgrund eller lysere baggrund.',
      dataEmpty: 'QR-kodedata er tomme.',
      noData: 'Ingen data angivet til QR-kode.',
      libraryLoadFailed: 'QR-kodebiblioteket kunne ikke indlæses. Opdater venligst siden.',
      generationError: 'Fejl ved generering af QR-kode',
      generateFirst: 'Generer venligst en QR-kode først.',
      resetSuccess: 'Tilpasning nulstillet til standard',
      largeImageWarning:
        '⚠️ Stor billedfil ({{size}}MB). Overvej at bruge et mindre billede for bedre ydeevne.',
      invalidImageFile: 'Vælg venligst en gyldig billedfil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tegn'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonopkald'
    },
    footer: {
      privacy1: 'Denne gratis QR-kodegenerator kører helt i din browser.',
      privacy2:
        'Ingen data gemmes eller sendes nogen steder. Ingen sporing, ingen annoncer, ingen vrøvl.',
      github: 'Se kildekode på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Plads omkring QR-koden (anbefalet: 4-16px for pålidelig scanning)'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil blive vist her'
    }
  };
})();
