// Norwegian translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.no = {
    app: {
      selectLanguage: 'Velg Språk'
    },
    aria: {
      themeGroup: 'Tema',
      lightTheme: 'Lyst tema',
      darkTheme: 'Mørkt tema',
      language: 'Språk',
      qrTypes: 'QR-kodetyper'
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
      transparentBackground: 'Gjennomsiktig bakgrunn',
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
      whatsappPhone: 'WhatsApp-nummer eller @brukernavn',
      whatsappMessage: 'Melding (valgfritt)',
      mecardName: 'Navn',
      address: 'Adresse',
      appWebUrl: 'Fallback / web-URL',
      appIosUrl: 'iOS App Store-URL',
      appAndroidUrl: 'Android Play Store-URL',
      appLinkTarget: 'Butikkfallback',
      frame: 'Ramme',
      frameText: 'Rammetekst',
      frameColor: 'Rammefarge'
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
      whatsappPhone: 'f.eks., +47555123456 eller @brukernavn',
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
      hidePassword: 'Skjul passord',
      showPayload: 'Vis QR-data',
      hidePayload: 'Skjul QR-data'
    },
    options: {
      sizeMedium: 'Skjerm (512 px)',
      sizeLarge: 'Stor (1024 px)',
      sizePrint: 'Utskrift (2048 px)',
      sizePoster: 'Plakat (4096 px)',
      frameNone: 'Ingen ramme',
      frameBannerBottom: 'Tekst under',
      frameBannerTop: 'Tekst over',
      frameOutline: 'Kantlinje med tekst',
      errorLow: 'L - Lav (7%)',
      errorMedium: 'M - Middels (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Høy (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      formatPdf: 'PDF (dokument)',
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
      wifiSsidLengthInvalid: 'Navnet på WiFi-nettverket kan være maksimalt 32 UTF-8-byte.',
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
      whatsappPhoneRequired: 'Skriv inn et WhatsApp-telefonnummer med landskode eller et gyldig @brukernavn.',
      mecardRequired: 'Skriv inn minst ett av: Navn, Telefonnummer eller E-post.',
      appLinkRequired: 'Skriv inn en web-, iOS- eller Android-app-URL.',
      urlInvalid: 'Skriv inn en gyldig URL som starter med http:// eller https://.',
      lowContrast:
        '⚠️ Lav kontrast oppdaget. QR-koden din kan være vanskelig å skanne. Vurder å bruke mørkere forgrunn eller lysere bakgrunn.',
      dataEmpty: 'QR-kodedata er tomme.',
      noData: 'Ingen data oppgitt for QR-kode.',
      libraryLoadFailed: 'QR-kodebiblioteket kunne ikke lastes. Oppdater siden.',
      generationError: 'Feil ved generering av QR-kode',
      dataTooLong:
        'Innholdet er for stort for valgt QR-feilrettingsnivå. Forkort innholdet eller velg et lavere nivå.',
      pdfExportFailed: 'PDF-eksport mislyktes. Prøv igjen.',
      generateFirst: 'Vennligst generer en QR-kode først.',
      resetSuccess: 'Tilpasning tilbakestilt til standard',
      largeImageWarning:
        '⚠️ Stor bildefil ({{size}}MB). Vurder å bruke et mindre bilde for bedre ytelse.',
      invalidImageFile: 'Vennligst velg en gyldig bildefil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tegn'
    },
    units: {
      modules: '{{count}} moduler'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonsamtale'
    },
    warnings: {
      lowContrast:
        'Lav kontrast kan gjøre QR-koden vanskelig å skanne. Bruk en mørkere forgrunn eller lysere bakgrunn.',
      transparentBackground:
        'En gjennomsiktig bakgrunn avhenger av den endelige flaten. Test QR-koden mot den faktiske bakgrunnen før publisering.',
      quietZoneSmall:
        'Den rolige sonen er for liten. Bruk minst 4 moduler for pålitelig skanning.',
      denseData:
        'QR-koden inneholder mye data for den valgte størrelsen. Bruk en større størrelse eller forkort innholdet.',
      logoErrorCorrection:
        'Store logoer fungerer mer pålitelig med høyt feilrettingsnivå (H).',
      logoLarge:
        'Logoen er stor og kan dekke for mye av QR-koden. Test før utskrift eller deling.'
    },
    brand: {
      tagline: 'ditt private sted for QR-koder'
    },
    trust: {
      local: 'Lages i nettleseren din',
      noUploads: 'Ingenting lastes opp',
      noTracking: 'Ingen sporing eller informasjonskapsler',
      offline: 'Fungerer uten nett',
      openSource: 'Åpen kildekode',
      noExpiry: 'Utløper aldri',
      noSignup: 'Ingen registrering'
    },
    workspace: {
      chooseType: 'Velg type',
      addContent: 'Legg til innhold',
      adjustLook: 'Størrelse og stil'
    },
    preview: {
      title: 'Forhåndsvisning',
      localBadge: 'Laget på denne enheten'
    },
    how: {
      title: 'Slik fungerer det',
      step1Title: 'Velg',
      step1Text: 'Bestem hva koden skal gjøre: åpne en lenke, koble til et WiFi-nettverk, lagre en kontakt og mye mer.',
      step2Title: 'Fyll ut',
      step2Text: 'Skriv inn innholdet. Forhåndsvisningen oppdateres mens du skriver, rett i nettleseren.',
      step3Title: 'Last ned',
      step3Text: 'Lagre som PNG, SVG eller PDF. Test skanningen før du skriver ut eller deler koden.'
    },
    privacyInfo: {
      title: 'Privat fra grunnen av',
      intro: 'QR-koder inneholder ofte personlige opplysninger: et WiFi-passord, et telefonnummer, en hjemmeadresse. QRTurbo.app er laget slik at ingenting av dette noen gang når en server.',
      localTitle: 'Blir på enheten din',
      localText: 'QR-koder og logoer lages av kode som kjører i nettleseren din. Det finnes ingen server som kan motta det du skriver.',
      staticTitle: 'Ingen omdirigeringer, ingen utløpsdato',
      staticText: 'Innholdet kodes direkte i QR-koden. Skanninger går aldri via oss, og koden utløper aldri.',
      noTrackingTitle: 'Ingen sporing',
      noTrackingText: 'Ingen analyse, annonser, informasjonskapsler eller kontoer. Bare språk- og temavalget ditt lagres, lokalt i nettleseren.',
      openSourceTitle: 'Åpen for innsyn',
      openSourceText: 'All kildekode er offentlig på GitHub, så hvem som helst kan kontrollere dette.'
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
      quietZoneHelper: 'Plass rundt QR-koden (minst 4 moduler for pålitelig skanning)',
      socialHandleHelper:
        'Skriv inn et brukernavn som @brukernavn, eller lim inn en full https:// profil-URL.'
    },
    frame: {
      defaultText: 'SKANN MEG'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil vises her',
      socialPreview: 'QR-mål',
      wifiPayloadHidden: 'WiFi-konfigurasjon — passord skjult'
    }
  };
})();
