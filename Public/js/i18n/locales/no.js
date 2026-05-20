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
        'Gratis QR-kodegenerator med logoer og farger | QRTurbo.app',
      description:
        'Lag gratis tilpassede QR-koder for URL-er, WiFi, vCards, SMS og samtaler. Legg til logoer, farger og stiler i nettleseren uten sporing eller dataopplastinger.'
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
      wifi: 'WiFi',
      email: 'E-post',
      calendarEvent: 'Hendelse',
      location: 'Plassering',
      socialMedia: 'Sosiale medier',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-lenke'
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
      styleOptions: 'Stilalternativer',
      emailTo: 'Mottakerens e-post',
      emailSubject: 'Emne',
      emailBody: 'Melding',
      eventTitle: 'Hendelsestittel',
      eventStart: 'Start',
      eventEnd: 'Slutt',
      eventLocation: 'Plassering',
      eventDescription: 'Beskrivelse',
      locationAddress: 'Adresse eller sted',
      latitude: 'Breddegrad',
      longitude: 'Lengdegrad',
      socialPlatform: 'Plattform',
      socialProfileType: 'Profiltype',
      socialHandleOrUrl: 'Brukernavn eller profil-URL',
      whatsappPhone: 'WhatsApp-nummer',
      whatsappMessage: 'Melding (valgfritt)',
      mecardName: 'Navn',
      address: 'Adresse',
      appWebUrl: 'Fallback / web-URL',
      appIosUrl: 'iOS App Store-URL',
      appAndroidUrl: 'Android Play Store-URL',
      appLinkTarget: 'Butikkfallback'
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
      smsMessage: 'Din forhåndsutfylte melding her...',
      emailTo: 'hei@example.com',
      emailSubject: 'Hei fra QRTurbo.app',
      emailBody: 'Skriv e-postmeldingen din her...',
      eventTitle: 'Teammøte',
      eventLocation: 'Møterom eller adresse',
      eventDescription: 'Hendelsesdetaljer...',
      locationAddress: 'Karl Johans gate 1, Oslo',
      latitude: '59.9139',
      longitude: '10.7522',
      socialHandle: '@brukernavn eller https://...',
      whatsappPhone: 'f.eks., +47555123456',
      whatsappMessage: 'WhatsApp-meldingen din her...',
      mecardName: 'Ola Nordmann',
      address: 'Hovedgata 123, Oslo',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Lag QR-Kode',
      download: 'Last Ned QR-Kode',
      reset: 'Tilbakestill til Standard',
      customize: 'Tilpass Utseende (Valgfritt)',
      chooseLogo: 'Velg Bilde',
      showPassword: 'Vis passord',
      hidePassword: 'Skjul passord'
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
      socialOther: 'Annen URL',
      socialTypePerson: 'Person/Profil',
      socialTypeCompany: 'Bedrift',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Bruk iOS hvis ingen web-URL',
      appTargetAndroid: 'Bruk Android hvis ingen web-URL'
    },
    alerts: {
      enterText: 'Vennligst skriv inn en tekst eller en URL',
      vcardRequired:
        'Vennligst fyll ut minst én av: Fornavn, Etternavn, E-post eller Telefonnummer.',
      wifiSsidRequired: 'Vennligst skriv inn Nettverksnavn (SSID).',
      wifiWpaPasswordInvalid:
        'WPA/WPA2-passord må være 8-63 utskrivbare tegn eller nøyaktig 64 heksadesimale tegn.',
      wifiWepPasswordInvalid:
        'WEP-passord må være 5 eller 13 utskrivbare tegn, eller 10 eller 26 heksadesimale tegn.',
      phoneRequired: 'Vennligst skriv inn et telefonnummer.',
      emailRequired: 'Skriv inn minst ett e-postfelt.',
      emailInvalid: 'Skriv inn en gyldig e-postadresse.',
      eventRequired: 'Skriv inn en hendelsestittel og starttid.',
      eventEndInvalid: 'Sluttiden kan ikke være før starttiden.',
      locationRequired: 'Skriv inn en adresse eller begge koordinatene.',
      locationCoordinatesInvalid: 'Skriv inn gyldige bredde- og lengdegrader.',
      socialRequired: 'Skriv inn et brukernavn for sosiale medier eller en profil-URL.',
      socialHandleInvalid: 'Skriv inn et gyldig brukernavn med bokstaver, tall, punktum, understreker eller bindestreker.',
      socialUrlInvalid: 'Skriv inn en gyldig sosial profil-URL som starter med http:// eller https://.',
      whatsappPhoneRequired: 'Skriv inn et WhatsApp-telefonnummer med landskode.',
      mecardRequired: 'Skriv inn minst ett av: Navn, Telefonnummer eller E-post.',
      appLinkRequired: 'Skriv inn en web-, iOS- eller Android-app-URL.',
      urlInvalid: 'Skriv inn en gyldig URL som starter med http:// eller https://.',
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
      privacyPolicy: 'Personvernerklæring',
      termsOfUse: 'Bruksvilkår',
      github: 'Vis kildekode på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Plass rundt QR-koden (anbefalt: 4-16px for pålitelig skanning)',
      socialHandleHelper:
        'Skriv inn et brukernavn som @brukernavn, eller lim inn en full https:// profil-URL.'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil vises her',
      socialPreview: 'QR-mål'
    }
  };
})();
