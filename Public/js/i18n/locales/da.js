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
        'Gratis QR-kodegenerator med logoer og farver | QRTurbo.app',
      description:
        'Opret gratis tilpassede QR-koder til URLer, WiFi, vCards, SMS og opkald. Tilføj logoer, farver og stilarter i browseren uden sporing eller datauploads.'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodegenerator',
      subtitle:
        'Opret tilpasselige QR-koder med logoer, farver og stilarter. Support til URL\'er, WiFi, vCard, SMS og opkald',
      selectLanguage: 'Vælg Sprog'
    },
    aria: {
      themeGroup: 'Tema',
      lightTheme: 'Lyst tema',
      darkTheme: 'Mørkt tema',
      language: 'Sprog',
      qrTypes: 'QR-kodetyper'
    },
    tabs: {
      urlText: 'URL/Tekst',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi',
      email: 'Email',
      calendarEvent: 'Begivenhed',
      location: 'Placering',
      socialMedia: 'Sociale medier',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-link'
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
      transparentBackground: 'Gennemsigtig baggrund',
      errorCorrection: 'Fejlrettelse',
      downloadFormat: 'Downloadformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hjørne Firkant',
      cornerDot: 'Hjørnepunkt',
      quietZone: 'Rolig Zone (Margen)',
      logoSize: 'Logostørrelse',
      logoMargin: 'Logomargen',
      logo: 'Logo (Valgfrit)',
      styleOptions: 'Stilindstillinger',
      emailTo: 'Modtagerens e-mail',
      emailSubject: 'Emne',
      emailBody: 'Besked',
      eventTitle: 'Begivenhedstitel',
      eventStart: 'Start',
      eventEnd: 'Slut',
      eventLocation: 'Placering',
      eventDescription: 'Beskrivelse',
      locationAddress: 'Adresse eller sted',
      latitude: 'Breddegrad',
      longitude: 'Længdegrad',
      socialPlatform: 'Platform',
      socialProfileType: 'Profiltype',
      socialHandleOrUrl: 'Brugernavn eller profil-URL',
      whatsappPhone: 'WhatsApp-nummer eller @brugernavn',
      whatsappMessage: 'Besked (valgfri)',
      mecardName: 'Navn',
      address: 'Adresse',
      appWebUrl: 'Fallback / web-URL',
      appIosUrl: 'iOS App Store-URL',
      appAndroidUrl: 'Android Play Store-URL',
      appLinkTarget: 'Butiksfallback'
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
      smsMessage: 'Din forudfyldte besked her...',
      emailTo: 'hej@example.com',
      emailSubject: 'Hej fra QRTurbo.app',
      emailBody: 'Skriv din e-mailbesked her...',
      eventTitle: 'Teammøde',
      eventLocation: 'Mødelokale eller adresse',
      eventDescription: 'Begivenhedsdetaljer...',
      locationAddress: 'Rådhuspladsen 1, København',
      latitude: '55.6761',
      longitude: '12.5683',
      socialHandle: '@brugernavn eller https://...',
      whatsappPhone: 'f.eks., +45555123456 eller @brugernavn',
      whatsappMessage: 'Din WhatsApp-besked her...',
      mecardName: 'Hans Hansen',
      address: 'Hovedgade 123, København',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Opret QR-Kode',
      download: 'Download QR-Kode',
      reset: 'Nulstil til Standard',
      customize: 'Tilpas Udseende (Valgfrit)',
      chooseLogo: 'Vælg Billede',
      showPassword: 'Vis adgangskode',
      hidePassword: 'Skjul adgangskode',
      showPayload: 'Vis QR-data',
      hidePayload: 'Skjul QR-data'
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
      formatPdf: 'PDF (dokument)',
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
      socialOther: 'Anden URL',
      socialTypePerson: 'Person/Profil',
      socialTypeCompany: 'Virksomhed',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Brug iOS hvis ingen web-URL',
      appTargetAndroid: 'Brug Android hvis ingen web-URL'
    },
    alerts: {
      enterText: 'Indtast venligst en tekst eller en URL',
      vcardRequired:
        'Udfyld venligst mindst én af: Fornavn, Efternavn, E-mail eller Telefonnummer.',
      wifiSsidRequired: 'Indtast venligst Netværksnavn (SSID).',
      wifiSsidLengthInvalid: 'Et WiFi-netværksnavn må højst fylde 32 UTF-8-bytes.',
      wifiWpaPasswordInvalid:
        'WPA/WPA2-adgangskoder skal være 8-63 udskrivbare tegn eller præcis 64 hexadecimale tegn.',
      wifiWepPasswordInvalid:
        'WEP-adgangskoder skal være 5 eller 13 udskrivbare tegn eller 10 eller 26 hexadecimale tegn.',
      phoneRequired: 'Indtast venligst et telefonnummer.',
      emailRequired: 'Indtast mindst ét e-mailfelt.',
      emailInvalid: 'Indtast en gyldig e-mailadresse.',
      eventRequired: 'Indtast en begivenhedstitel og starttid.',
      eventEndInvalid: 'Sluttidspunktet kan ikke være før starttidspunktet.',
      locationRequired: 'Indtast en adresse eller begge koordinater.',
      locationCoordinatesInvalid: 'Indtast gyldige bredde- og længdegrader.',
      socialRequired: 'Indtast et brugernavn til sociale medier eller en profil-URL.',
      socialHandleInvalid: 'Indtast et gyldigt brugernavn med bogstaver, tal, punktummer, understreger eller bindestreger.',
      socialUrlInvalid: 'Indtast en gyldig social profil-URL, der starter med http:// eller https://.',
      whatsappPhoneRequired: 'Indtast et WhatsApp-telefonnummer med landekode eller et gyldigt @brugernavn.',
      mecardRequired: 'Indtast mindst én af: Navn, telefonnummer eller e-mail.',
      appLinkRequired: 'Indtast en web-, iOS- eller Android-app-URL.',
      urlInvalid: 'Indtast en gyldig URL, der starter med http:// eller https://.',
      lowContrast:
        '⚠️ Lav kontrast registreret. Din QR-kode kan være svær at scanne. Overvej at bruge mørkere forgrund eller lysere baggrund.',
      dataEmpty: 'QR-kodedata er tomme.',
      noData: 'Ingen data angivet til QR-kode.',
      libraryLoadFailed: 'QR-kodebiblioteket kunne ikke indlæses. Opdater venligst siden.',
      generationError: 'Fejl ved generering af QR-kode',
      dataTooLong:
        'Dette indhold er for stort til det valgte QR-fejlrettelsesniveau. Forkort indholdet, eller vælg et lavere niveau.',
      pdfExportFailed: 'PDF-eksport mislykkedes. Prøv igen.',
      generateFirst: 'Generer venligst en QR-kode først.',
      resetSuccess: 'Tilpasning nulstillet til standard',
      largeImageWarning:
        '⚠️ Stor billedfil ({{size}}MB). Overvej at bruge et mindre billede for bedre ydeevne.',
      invalidImageFile: 'Vælg venligst en gyldig billedfil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tegn'
    },
    units: {
      modules: '{{count}} moduler'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonopkald'
    },
    warnings: {
      lowContrast:
        'Lav kontrast kan gøre denne QR-kode svær at scanne. Brug en mørkere forgrund eller en lysere baggrund.',
      transparentBackground:
        'Gennemsigtige baggrunde afhænger af den endelige overflade. Test QR-koden på præcis den baggrund, den skal bruges på, før udgivelse.',
      quietZoneSmall:
        'Den rolige zone er for lille. Brug mindst 4 moduler for pålidelig scanning.',
      denseData:
        'Denne QR-kode indeholder mange data i forhold til den valgte størrelse. Vælg en større størrelse, eller forkort indholdet.',
      logoErrorCorrection:
        'Store logoer scannes mere pålideligt med høj (H) fejlrettelse.',
      logoLarge:
        'Logoet er stort og kan dække for meget af QR-koden. Test koden, før du udskriver eller deler den.'
    },
    footer: {
      privacy1: 'Denne gratis QR-kodegenerator kører helt i din browser.',
      privacy2:
        'Ingen data gemmes eller sendes nogen steder. Ingen sporing, ingen annoncer, ingen vrøvl.',
      privacyPolicy: 'Privatlivspolitik',
      termsOfUse: 'Brugsvilkår',
      github: 'Se kildekode på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Plads omkring QR-koden (mindst 4 moduler for pålidelig scanning)',
      socialHandleHelper:
        'Indtast et brugernavn som @brugernavn, eller indsæt en fuld https:// profil-URL.'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil blive vist her',
      socialPreview: 'QR-mål',
      wifiPayloadHidden: 'WiFi-konfiguration — adgangskode skjult'
    }
  };
})();
