// Norwegian translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.no = {
    meta: {
      title:
        'Gratis QR-Kodegenerator - Tilpass Farger, Logoer & Stiler | QRTurbo.app',
      description:
        'Generer gratis tilpassbare QR-koder øyeblikkelig med QRTurbo.app. Legg til logoer, tilpassede farger og stiler. Lag QR-koder for URL-er, WiFi-nettverk, vCard, SMS og telefonsamtaler. Ingen annonser, ingen sporing – fullt nettleserbasert og trygt.',
      keywords:
        'QR-kodegenerator, tilpasset QR-kode, QR-kode med logo, farget QR-kode, gratis QR-kodeskaper, WiFi QR-kode, vCard QR-kode, SMS QR-kode, online QR-verktøy, sporingsfri QR-generator'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodegenerator',
      subtitle:
        'Lag tilpassbare QR-koder med logoer, farger og stiler. Støtte for URL-er, WiFi, vCard, SMS og samtaler',
      selectLanguage: 'Velg Språk'
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
      lastName: 'Etternavn',
      organization: 'Organisasjon',
      title: 'Tittel',
      phoneWork: 'Telefon (Arbeid)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-post',
      website: 'Nettsted',
      street: 'Gate',
      city: 'By',
      state: 'Stat/Fylke',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Nettverksnavn (SSID)',
      password: 'Passord',
      authentication: 'Autentisering',
      hiddenNetwork: 'Dette er et skjult nettverk',
      phoneNumber: 'Telefonnummer',
      message: 'Melding (valgfritt)',
      qrSize: 'QR-Kodestørrelse',
      foregroundColor: 'Forgrunnsfarge',
      backgroundColor: 'Bakgrunnsfarge',
      errorCorrection: 'Feilretting',
      downloadFormat: 'Nedlastingsformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hjørnefirkant',
      cornerDot: 'Hjørnepunkt',
      quietZone: 'Rolig Sone (Marg)',
      logoSize: 'Logostørrelse',
      logoMargin: 'Logomarg',
      logo: 'Logo (Valgfritt)',
      styleOptions: 'Stilalternativer'
    },
    placeholders: {
      url: 'f.eks., https://www.eksempel.com',
      firstName: 'Ola',
      lastName: 'Nordmann',
      organization: 'ACME AS',
      title: 'Utvikler',
      phoneWork: '+47-555-555-1234',
      phoneMobile: '+47-555-555-5678',
      email: 'ola.nordmann@eksempel.com',
      website: 'https://www.eksempel.com',
      street: 'Hovedgaten 123',
      city: 'Oslo',
      state: 'Oslo',
      zip: '0150',
      country: 'Norge',
      ssid: 'f.eks., MittHjemWiFi',
      wifiPassword: 'Ditt hemmelige passord',
      phoneNumber: 'f.eks., +47555123456',
      smsMessage: 'Din forhåndsutfylte melding her...'
    },
    actions: {
      generate: 'Lag QR-Kode',
      download: 'Last Ned QR-Kode',
      reset: 'Tilbakestill til Standard',
      customize: 'Tilpass Utseende (Valgfritt)',
      chooseLogo: 'Velg Bilde'
    },
    options: {
      sizeSmall: 'Liten (256px)',
      sizeMedium: 'Middels (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Lav (7%)',
      errorMedium: 'M - Middels (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Høy (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Firkant',
      dotRounded: 'Avrundet',
      dotDots: 'Punkter',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Avrundet',
      dotExtraRounded: 'Ekstra Avrundet',
      cornerSquare: 'Firkant',
      cornerExtraRounded: 'Ekstra Avrundet',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Vennligst skriv inn en tekst eller en URL',
      vcardRequired:
        'Vennligst fyll ut minst én av: Fornavn, Etternavn, E-post eller Telefonnummer.',
      wifiSsidRequired: 'Vennligst skriv inn Nettverksnavn (SSID).',
      phoneRequired: 'Vennligst skriv inn et telefonnummer.',
      lowContrast:
        '⚠️ Lav kontrast oppdaget. QR-koden din kan være vanskelig å skanne. Vurder å bruke mørkere forgrunn eller lysere bakgrunn.',
      dataEmpty: 'QR-kodedata er tomme.',
      noData: 'Ingen data oppgitt for QR-kode.',
      libraryLoadFailed: 'QR-kodebiblioteket kunne ikke lastes. Oppdater siden.',
      generationError: 'Feil ved generering av QR-kode',
      generateFirst: 'Vennligst generer en QR-kode først.',
      resetSuccess: 'Tilpasning tilbakestilt til standard',
      largeImageWarning:
        '⚠️ Stor bildefil ({{size}}MB). Vurder å bruke et mindre bilde for bedre ytelse.',
      invalidImageFile: 'Vennligst velg en gyldig bildefil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tegn'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonsamtale'
    },
    footer: {
      privacy1: 'Denne gratis QR-kodegeneratoren kjører helt i nettleseren din.',
      privacy2:
        'Ingen data lagres eller sendes noen steder. Ingen sporing, ingen annonser, ingen tull.',
      github: 'Vis kildekode på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Plass rundt QR-koden (anbefalt: 4-16px for pålitelig skanning)'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil vises her'
    }
  };
})();
