// Dutch translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.nl = {
    app: {
      selectLanguage: 'Kies taal'
    },
    aria: {
      themeGroup: 'Thema',
      lightTheme: 'Licht thema',
      darkTheme: 'Donker thema',
      language: 'Taal',
      qrTypes: 'Soorten QR-codes'
    },
    tabs: {
      urlText: 'URL/Tekst',
      vcard: 'vCard',
      smsPhone: 'SMS/Bellen',
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Evenement',
      location: 'Locatie',
      socialMedia: 'Social media',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-link'
    },
    fields: {
      textOrUrl: 'Tekst of URL',
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      organization: 'Organisatie',
      title: 'Functie',
      phoneWork: 'Telefoon (werk)',
      phoneMobile: 'Telefoon (mobiel)',
      email: 'E-mail',
      website: 'Website',
      street: 'Straat',
      city: 'Plaats',
      state: 'Provincie/staat',
      zip: 'Postcode',
      country: 'Land',
      ssid: 'Netwerknaam (SSID)',
      password: 'Wachtwoord',
      authentication: 'Beveiliging',
      hiddenNetwork: 'Dit is een verborgen netwerk',
      phoneNumber: 'Telefoonnummer',
      message: 'Bericht (optioneel)',
      qrSize: 'Formaat QR-code',
      foregroundColor: 'Voorgrondkleur',
      backgroundColor: 'Achtergrondkleur',
      transparentBackground: 'Transparante achtergrond',
      errorCorrection: 'Foutcorrectie',
      downloadFormat: 'Bestandsformaat',
      dotStyle: 'Stijl van de punten',
      cornerSquare: 'Hoekvierkant',
      cornerDot: 'Hoekpunt',
      quietZone: 'Witrand (marge)',
      logoSize: 'Formaat logo',
      logoMargin: 'Ruimte rond logo',
      logo: 'Logo (optioneel)',
      styleOptions: 'Stijlopties',
      emailTo: 'E-mailadres ontvanger',
      emailSubject: 'Onderwerp',
      emailBody: 'Bericht',
      eventTitle: 'Naam evenement',
      eventStart: 'Begin',
      eventEnd: 'Einde',
      eventLocation: 'Locatie',
      eventDescription: 'Beschrijving',
      locationAddress: 'Adres of plaats',
      latitude: 'Breedtegraad',
      longitude: 'Lengtegraad',
      socialPlatform: 'Platform',
      socialProfileType: 'Soort profiel',
      socialHandleOrUrl: 'Gebruikersnaam of profiel-URL',
      whatsappPhone: 'WhatsApp-nummer of @gebruikersnaam',
      whatsappMessage: 'Bericht (optioneel)',
      mecardName: 'Naam',
      address: 'Adres',
      appWebUrl: 'Web-URL (terugvaloptie)',
      appIosUrl: 'iOS App Store-URL',
      appAndroidUrl: 'Android Play Store-URL',
      appLinkTarget: 'Store als terugvaloptie',
      frame: 'Kader',
      frameText: 'Kadertekst',
      frameColor: 'Kaderkleur'
    },
    placeholders: {
      url: 'bijv. https://www.voorbeeld.nl',
      firstName: 'Jan',
      lastName: 'Jansen',
      organization: 'ACME B.V.',
      title: 'Ontwikkelaar',
      phoneWork: '+31 20 123 4567',
      phoneMobile: '+31 6 12345678',
      email: 'jan.jansen@voorbeeld.nl',
      website: 'https://www.voorbeeld.nl',
      street: 'Dorpsstraat 1',
      city: 'Amsterdam',
      state: 'Noord-Holland',
      zip: '1012 AB',
      country: 'Nederland',
      ssid: 'bijv. MijnThuisWiFi',
      wifiPassword: 'Je geheime wachtwoord',
      phoneNumber: 'bijv. +31612345678',
      smsMessage: 'Je vooraf ingevulde bericht...',
      emailTo: 'hallo@voorbeeld.nl',
      emailSubject: 'Hallo van QRTurbo.app',
      emailBody: 'Typ hier je e-mailbericht...',
      eventTitle: 'Teamoverleg',
      eventLocation: 'Vergaderzaal of adres',
      eventDescription: 'Details van het evenement...',
      locationAddress: 'Museumplein 6, Amsterdam',
      latitude: '52.358',
      longitude: '4.881',
      socialHandle: '@gebruikersnaam of https://...',
      whatsappPhone: 'bijv. +31612345678 of @gebruikersnaam',
      whatsappMessage: 'Je WhatsApp-bericht...',
      mecardName: 'Jan Jansen',
      address: 'Dorpsstraat 1, Amsterdam',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'QR-code maken',
      download: 'QR-code downloaden',
      reset: 'Standaardinstellingen herstellen',
      customize: 'Uiterlijk aanpassen (optioneel)',
      chooseLogo: 'Afbeelding kiezen',
      showPassword: 'Wachtwoord tonen',
      hidePassword: 'Wachtwoord verbergen',
      showPayload: 'QR-gegevens tonen',
      hidePayload: 'QR-gegevens verbergen'
    },
    options: {
      sizeMedium: 'Scherm (512 px)',
      sizeLarge: 'Groot (1024 px)',
      sizePrint: 'Drukwerk (2048 px)',
      sizePoster: 'Poster (4096 px)',
      frameNone: 'Geen kader',
      frameBannerBottom: 'Tekst onder',
      frameBannerTop: 'Tekst boven',
      frameOutline: 'Rand met tekst',
      errorLow: 'L - Laag (7%)',
      errorMedium: 'M - Gemiddeld (15%)',
      errorQuartile: 'Q - Kwartiel (25%)',
      errorHigh: 'H - Hoog (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vector)',
      formatPdf: 'PDF (document)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Geen',
      dotSquare: 'Vierkant',
      dotRounded: 'Afgerond',
      dotDots: 'Stippen',
      dotClassy: 'Klassiek',
      dotClassyRounded: 'Klassiek afgerond',
      dotExtraRounded: 'Extra afgerond',
      cornerSquare: 'Vierkant',
      cornerExtraRounded: 'Extra afgerond',
      cornerDot: 'Stip',
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
      socialTypePerson: 'Persoon/profiel',
      socialTypeCompany: 'Bedrijf',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'iOS gebruiken als er geen web-URL is',
      appTargetAndroid: 'Android gebruiken als er geen web-URL is'
    },
    alerts: {
      enterText: 'Vul een tekst of URL in',
      vcardRequired:
        'Vul minstens één van deze velden in: voornaam, achternaam, e-mail of telefoonnummer.',
      wifiSsidRequired: 'Vul de netwerknaam (SSID) in.',
      wifiSsidLengthInvalid: 'De naam van een wifinetwerk mag maximaal 32 UTF-8-bytes lang zijn.',
      wifiWpaPasswordInvalid:
        'Een WPA/WPA2-wachtwoord moet uit 8-63 afdrukbare tekens bestaan, of uit precies 64 hexadecimale tekens.',
      wifiWepPasswordInvalid:
        'Een WEP-wachtwoord moet uit 5 of 13 afdrukbare tekens bestaan, of uit 10 of 26 hexadecimale tekens.',
      phoneRequired: 'Vul een telefoonnummer in.',
      emailRequired: 'Vul minstens één e-mailveld in.',
      emailInvalid: 'Vul een geldig e-mailadres in.',
      eventRequired: 'Vul een naam en begintijd voor het evenement in.',
      eventEndInvalid: 'De eindtijd kan niet vóór de begintijd liggen.',
      locationRequired: 'Vul een adres of beide coördinaten in.',
      locationCoordinatesInvalid: 'Vul een geldige breedte- en lengtegraad in.',
      socialRequired: 'Vul een gebruikersnaam of profiel-URL in.',
      socialHandleInvalid: 'Vul een geldige gebruikersnaam in met letters, cijfers, punten, underscores of koppeltekens.',
      socialUrlInvalid: 'Vul een geldige profiel-URL in die begint met http:// of https://.',
      whatsappPhoneRequired: 'Vul een WhatsApp-nummer met landcode of een geldige @gebruikersnaam in.',
      mecardRequired: 'Vul minstens één van deze velden in: naam, telefoonnummer of e-mail.',
      appLinkRequired: 'Vul een web-URL of een URL voor de iOS- of Android-app in.',
      urlInvalid: 'Vul een geldige URL in die begint met http:// of https://.',
      lowContrast:
        '⚠️ Laag contrast gedetecteerd. Je QR-code is misschien lastig te scannen. Kies een donkerdere voorgrond of een lichtere achtergrond.',
      dataEmpty: 'De QR-code bevat geen gegevens.',
      noData: 'Geen gegevens opgegeven voor de QR-code.',
      libraryLoadFailed: 'De QR-codebibliotheek kon niet worden geladen. Vernieuw de pagina.',
      generationError: 'Fout bij het maken van de QR-code',
      dataTooLong: 'Deze inhoud is te groot voor het gekozen foutcorrectieniveau. Maak de inhoud korter of kies een lager niveau.',
      pdfExportFailed: 'Exporteren als PDF is mislukt. Probeer het opnieuw.',
      generateFirst: 'Maak eerst een QR-code.',
      resetSuccess: 'Aanpassingen teruggezet naar de standaardinstellingen',
      largeImageWarning:
        '⚠️ Groot afbeeldingsbestand ({{size}} MB). Gebruik een kleinere afbeelding voor betere prestaties.',
      invalidImageFile: 'Kies een geldig afbeeldingsbestand (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tekens'
    },
    units: {
      modules: '{{count}} modules'
    },
    labels: {
      sms: 'SMS',
      phone: 'Bellen'
    },
    warnings: {
      lowContrast:
        'Door het lage contrast is deze QR-code mogelijk lastig te scannen. Kies een donkerdere voorgrond of een lichtere achtergrond.',
      transparentBackground:
        'Of een transparante achtergrond goed werkt, hangt af van de ondergrond. Test de QR-code op precies die achtergrond voordat je hem publiceert.',
      quietZoneSmall:
        'De witrand is te smal. Gebruik minstens 4 modules voor betrouwbaar scannen.',
      denseData:
        'Deze QR-code bevat veel gegevens voor het gekozen formaat. Kies een groter formaat of maak de inhoud korter.',
      logoErrorCorrection:
        'Grote logo’s scannen betrouwbaarder met hoge (H) foutcorrectie.',
      logoLarge:
        'Het logo is groot en bedekt mogelijk te veel van de QR-code. Test de code voordat je hem print of deelt.'
    },
    brand: {
      tagline: 'jouw privéplek om QR-codes te maken'
    },
    trust: {
      local: 'Gemaakt in je browser',
      noUploads: 'Er wordt niets geüpload',
      noTracking: 'Geen tracking of cookies',
      offline: 'Werkt offline',
      openSource: 'Open source',
      noExpiry: 'Verloopt nooit',
      noSignup: 'Geen registratie'
    },
    workspace: {
      chooseType: 'Kies een type',
      addContent: 'Voeg je inhoud toe',
      adjustLook: 'Formaat en stijl'
    },
    preview: {
      title: 'Voorbeeld',
      localBadge: 'Gemaakt op dit apparaat'
    },
    how: {
      title: 'Zo werkt het',
      step1Title: 'Kies',
      step1Text: 'Bepaal wat de code moet doen: een link openen, verbinden met een wifinetwerk, een contact opslaan en meer.',
      step2Title: 'Vul in',
      step2Text: 'Typ je inhoud. Het voorbeeld wordt bijgewerkt terwijl je typt, gewoon hier in je browser.',
      step3Title: 'Download',
      step3Text: 'Sla de code op als PNG, SVG of PDF. Test of hij goed scant voordat je hem print of deelt.'
    },
    privacyInfo: {
      title: 'Privacy als uitgangspunt',
      intro: 'QR-codes bevatten vaak persoonlijke gegevens: een wifiwachtwoord, een telefoonnummer, een huisadres. QRTurbo.app is zo gebouwd dat niets daarvan ooit op een server terechtkomt.',
      localTitle: 'Blijft op je apparaat',
      localText: 'QR-codes en logo’s worden gemaakt door code die in je browser draait. Er is geen backend die zou kunnen ontvangen wat je typt.',
      staticTitle: 'Geen doorverwijzingen, verloopt nooit',
      staticText: 'Je inhoud staat rechtstreeks in de QR-code. Scans lopen nooit via ons, en de code verloopt nooit.',
      noTrackingTitle: 'Geen tracking',
      noTrackingText: 'Geen analytics, advertenties, cookies of accounts. Alleen je taal- en themakeuze worden bewaard, lokaal in je browser.',
      openSourceTitle: 'Open voor controle',
      openSourceText: 'De volledige broncode staat openbaar op GitHub, zodat iedereen deze beweringen kan controleren.'
    },
    footer: {
      privacy1: 'Deze gratis QR-code generator werkt volledig in je browser.',
      privacy2:
        'Er worden geen gegevens opgeslagen of verstuurd. Geen tracking, geen advertenties, geen gedoe.',
      privacyPolicy: 'Privacybeleid',
      termsOfUse: 'Gebruiksvoorwaarden',
      github: 'Bekijk de broncode op GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Lege ruimte rond de QR-code (minimaal 4 modules voor betrouwbaar scannen)',
      socialHandleHelper:
        'Vul een gebruikersnaam in, zoals @gebruikersnaam, of plak een volledige https://-profiel-URL.'
    },
    frame: {
      defaultText: 'SCAN MIJ'
    },
    misc: {
      qrPlaceholder: 'Hier verschijnt je QR-code',
      socialPreview: 'QR-doel',
      wifiPayloadHidden: 'Wifi-instellingen — wachtwoord verborgen'
    }
  };
})();
