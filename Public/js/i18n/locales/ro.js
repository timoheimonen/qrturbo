// Romanian translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.ro = {
    app: {
      selectLanguage: 'Alege limba'
    },
    aria: {
      themeGroup: 'Temă',
      lightTheme: 'Temă luminoasă',
      darkTheme: 'Temă întunecată',
      language: 'Limbă',
      qrTypes: 'Tipuri de coduri QR'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Apel',
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Eveniment',
      location: 'Locație',
      socialMedia: 'Rețele sociale',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Link aplicație'
    },
    fields: {
      textOrUrl: 'Text sau URL',
      firstName: 'Prenume',
      lastName: 'Nume',
      organization: 'Organizație',
      title: 'Funcție',
      phoneWork: 'Telefon (serviciu)',
      phoneMobile: 'Telefon (mobil)',
      email: 'E-mail',
      website: 'Site web',
      street: 'Stradă',
      city: 'Oraș',
      state: 'Județ/Sector',
      zip: 'Cod poștal',
      country: 'Țară',
      ssid: 'Numele rețelei (SSID)',
      password: 'Parolă',
      authentication: 'Autentificare',
      hiddenNetwork: 'Aceasta este o rețea ascunsă',
      phoneNumber: 'Număr de telefon',
      message: 'Mesaj (opțional)',
      qrSize: 'Dimensiunea codului QR',
      foregroundColor: 'Culoare prim-plan',
      backgroundColor: 'Culoare fundal',
      transparentBackground: 'Fundal transparent',
      errorCorrection: 'Corecția erorilor',
      downloadFormat: 'Format de descărcare',
      dotStyle: 'Stilul punctelor',
      cornerSquare: 'Pătrat de colț',
      cornerDot: 'Punct de colț',
      quietZone: 'Zonă liberă (margine)',
      logoSize: 'Dimensiunea logoului',
      logoMargin: 'Marginea logoului',
      logo: 'Logo (opțional)',
      styleOptions: 'Opțiuni de stil',
      emailTo: 'E-mailul destinatarului',
      emailSubject: 'Subiect',
      emailBody: 'Mesaj',
      eventTitle: 'Titlul evenimentului',
      eventStart: 'Început',
      eventEnd: 'Sfârșit',
      eventLocation: 'Locație',
      eventDescription: 'Descriere',
      locationAddress: 'Adresă sau loc',
      latitude: 'Latitudine',
      longitude: 'Longitudine',
      socialPlatform: 'Platformă',
      socialProfileType: 'Tip de profil',
      socialHandleOrUrl: 'Nume de utilizator sau URL de profil',
      whatsappPhone: 'Număr WhatsApp sau @utilizator',
      whatsappMessage: 'Mesaj (opțional)',
      mecardName: 'Nume',
      address: 'Adresă',
      appWebUrl: 'URL web / de rezervă',
      appIosUrl: 'URL App Store (iOS)',
      appAndroidUrl: 'URL Play Store (Android)',
      appLinkTarget: 'Magazin de rezervă',
      frame: 'Chenar',
      frameText: 'Textul chenarului',
      frameColor: 'Culoarea chenarului'
    },
    placeholders: {
      url: 'ex.: https://www.example.com',
      firstName: 'Andrei',
      lastName: 'Popescu',
      organization: 'ACME SRL',
      title: 'Programator',
      phoneWork: '+40 21 123 4567',
      phoneMobile: '+40 712 345 678',
      email: 'andrei.popescu@example.com',
      website: 'https://www.example.com',
      street: 'Str. Florilor nr. 12',
      city: 'București',
      state: 'Sector 1',
      zip: '010011',
      country: 'România',
      ssid: 'ex.: WiFi-Acasa',
      wifiPassword: 'Parola ta secretă',
      phoneNumber: 'ex.: +40712345678',
      smsMessage: 'Mesajul tău precompletat aici...',
      emailTo: 'salut@example.com',
      emailSubject: 'Salut de la QRTurbo.app',
      emailBody: 'Scrie aici mesajul e-mailului...',
      eventTitle: 'Ședința echipei',
      eventLocation: 'Sală de ședințe sau adresă',
      eventDescription: 'Detaliile evenimentului...',
      locationAddress: 'Piața Revoluției, București',
      latitude: '44.439',
      longitude: '26.097',
      socialHandle: '@utilizator sau https://...',
      whatsappPhone: 'ex.: +40712345678 sau @utilizator',
      whatsappMessage: 'Mesajul tău WhatsApp aici...',
      mecardName: 'Andrei Popescu',
      address: 'Str. Florilor nr. 12, București',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Creează codul QR',
      download: 'Descarcă codul QR',
      reset: 'Revino la setările implicite',
      customize: 'Personalizează aspectul (opțional)',
      chooseLogo: 'Alege o imagine',
      showPassword: 'Arată parola',
      hidePassword: 'Ascunde parola',
      showPayload: 'Arată datele QR',
      hidePayload: 'Ascunde datele QR'
    },
    options: {
      sizeMedium: 'Ecran (512 px)',
      sizeLarge: 'Mare (1024 px)',
      sizePrint: 'Tipar (2048 px)',
      sizePoster: 'Afiș (4096 px)',
      frameNone: 'Fără chenar',
      frameBannerBottom: 'Text dedesubt',
      frameBannerTop: 'Text deasupra',
      frameOutline: 'Contur cu text',
      errorLow: 'L - Scăzută (7%)',
      errorMedium: 'M - Medie (15%)',
      errorQuartile: 'Q - Cuartilă (25%)',
      errorHigh: 'H - Ridicată (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vectorial)',
      formatPdf: 'PDF (document)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Fără',
      dotSquare: 'Pătrat',
      dotRounded: 'Rotunjit',
      dotDots: 'Puncte',
      dotClassy: 'Elegant',
      dotClassyRounded: 'Elegant rotunjit',
      dotExtraRounded: 'Foarte rotunjit',
      cornerSquare: 'Pătrat',
      cornerExtraRounded: 'Foarte rotunjit',
      cornerDot: 'Punct',
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
      socialOther: 'Alt URL',
      socialTypePerson: 'Persoană/Profil',
      socialTypeCompany: 'Companie',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Folosește iOS dacă nu există URL web',
      appTargetAndroid: 'Folosește Android dacă nu există URL web'
    },
    alerts: {
      enterText: 'Introdu un text sau un URL',
      vcardRequired:
        'Completează cel puțin unul dintre câmpurile: Prenume, Nume, E-mail sau Număr de telefon.',
      wifiSsidRequired: 'Introdu numele rețelei (SSID).',
      wifiSsidLengthInvalid: 'Numele unei rețele WiFi poate avea cel mult 32 de octeți UTF-8.',
      wifiWpaPasswordInvalid:
        'Parolele WPA/WPA2 trebuie să aibă între 8 și 63 de caractere imprimabile sau exact 64 de caractere hexazecimale.',
      wifiWepPasswordInvalid:
        'Parolele WEP trebuie să aibă 5 sau 13 caractere imprimabile ori 10 sau 26 de caractere hexazecimale.',
      phoneRequired: 'Introdu un număr de telefon.',
      emailRequired: 'Completează cel puțin un câmp de e-mail.',
      emailInvalid: 'Introdu o adresă de e-mail validă.',
      eventRequired: 'Introdu titlul evenimentului și ora de început.',
      eventEndInvalid: 'Ora de sfârșit nu poate fi înaintea orei de început.',
      locationRequired: 'Introdu o adresă sau ambele coordonate.',
      locationCoordinatesInvalid: 'Introdu coordonate valide de latitudine și longitudine.',
      socialRequired: 'Introdu un nume de utilizator sau un URL de profil.',
      socialHandleInvalid: 'Introdu un nume de utilizator valid, format din litere, cifre, puncte, liniuțe de subliniere sau cratime.',
      socialUrlInvalid: 'Introdu un URL de profil valid, care începe cu http:// sau https://.',
      whatsappPhoneRequired: 'Introdu un număr de telefon WhatsApp cu prefixul țării sau un @utilizator valid.',
      mecardRequired: 'Completează cel puțin unul dintre câmpurile: Nume, Număr de telefon sau E-mail.',
      appLinkRequired: 'Introdu un URL web, iOS sau Android pentru aplicație.',
      urlInvalid: 'Introdu un URL valid, care începe cu http:// sau https://.',
      lowContrast:
        '⚠️ Contrast scăzut. Codul tău QR poate fi greu de scanat. Încearcă o culoare de prim-plan mai închisă sau un fundal mai deschis.',
      dataEmpty: 'Datele codului QR sunt goale.',
      noData: 'Nu există date pentru codul QR.',
      libraryLoadFailed: 'Biblioteca pentru coduri QR nu s-a putut încărca. Reîncarcă pagina.',
      generationError: 'Eroare la generarea codului QR',
      dataTooLong: 'Conținutul este prea mare pentru nivelul de corecție a erorilor ales. Scurtează-l sau alege un nivel mai scăzut.',
      pdfExportFailed: 'Exportul PDF a eșuat. Încearcă din nou.',
      generateFirst: 'Creează mai întâi un cod QR.',
      resetSuccess: 'Personalizarea a revenit la setările implicite',
      largeImageWarning:
        '⚠️ Fișier imagine mare ({{size}} MB). Folosește o imagine mai mică pentru o performanță mai bună.',
      invalidImageFile: 'Alege un fișier imagine valid (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} de caractere'
    },
    units: {
      modules: '{{count}} module'
    },
    labels: {
      sms: 'SMS',
      phone: 'Apel telefonic'
    },
    warnings: {
      lowContrast:
        'Contrastul scăzut poate face acest cod QR greu de scanat. Folosește o culoare de prim-plan mai închisă sau un fundal mai deschis.',
      transparentBackground:
        'Un fundal transparent depinde de suprafața finală. Testează codul QR exact pe fundalul pe care îl vei folosi, înainte de publicare.',
      quietZoneSmall:
        'Zona liberă este prea mică. Folosește cel puțin 4 module pentru o scanare fiabilă.',
      denseData:
        'Acest cod QR conține multe date pentru dimensiunea aleasă. Alege o dimensiune mai mare sau scurtează conținutul.',
      logoErrorCorrection:
        'Logourile mari se scanează mai sigur cu nivelul ridicat (H) de corecție a erorilor.',
      logoLarge:
        'Logoul este mare și poate acoperi prea mult din codul QR. Testează-l înainte să-l tipărești sau să-l distribui.'
    },
    brand: {
      tagline: 'locul tău privat pentru coduri QR'
    },
    trust: {
      local: 'Generat în browserul tău',
      noUploads: 'Nimic nu este încărcat',
      noTracking: 'Fără urmărire și fără cookie-uri',
      offline: 'Funcționează offline',
      openSource: 'Open source',
      noExpiry: 'Nu expiră niciodată',
      noSignup: 'Fără înregistrare'
    },
    workspace: {
      chooseType: 'Alege tipul',
      addContent: 'Adaugă conținutul',
      adjustLook: 'Dimensiune și stil'
    },
    preview: {
      title: 'Previzualizare',
      localBadge: 'Creat pe acest dispozitiv'
    },
    how: {
      title: 'Cum funcționează',
      step1Title: 'Alege',
      step1Text: 'Decide ce face codul: deschide un link, conectează la o rețea WiFi, salvează un contact și multe altele.',
      step2Title: 'Completează',
      step2Text: 'Scrie conținutul. Previzualizarea se actualizează pe măsură ce scrii, chiar aici, în browserul tău.',
      step3Title: 'Descarcă',
      step3Text: 'Salvează-l ca PNG, SVG sau PDF. Testează scanarea înainte să-l tipărești sau să-l distribui.'
    },
    privacyInfo: {
      title: 'Privat de la bun început',
      intro: 'Codurile QR conțin adesea date personale: o parolă WiFi, un număr de telefon, o adresă de domiciliu. QRTurbo.app este construit astfel încât niciuna dintre ele să nu ajungă vreodată pe un server.',
      localTitle: 'Rămâne pe dispozitivul tău',
      localText: 'Codurile QR și logourile sunt generate de un program care rulează în browserul tău. Nu există niciun server care să poată primi ce scrii.',
      staticTitle: 'Fără redirecționări, fără expirare',
      staticText: 'Conținutul tău este codificat direct în codul QR. Scanările nu trec niciodată prin noi, iar codul nu expiră niciodată.',
      noTrackingTitle: 'Fără urmărire',
      noTrackingText: 'Fără statistici, reclame, cookie-uri sau conturi. Doar limba și tema alese sunt salvate, local, în browserul tău.',
      openSourceTitle: 'Deschis verificării',
      openSourceText: 'Întregul cod sursă este public pe GitHub, așa că oricine poate verifica aceste afirmații.'
    },
    footer: {
      privacy1: 'Acest generator gratuit de coduri QR funcționează în întregime în browserul tău.',
      privacy2:
        'Nicio dată nu este stocată sau trimisă nicăieri. Fără urmărire, fără reclame, fără bătăi de cap.',
      privacyPolicy: 'Politica de confidențialitate',
      termsOfUse: 'Termeni de utilizare',
      github: 'Vezi codul sursă pe GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Spațiul din jurul codului QR (minimum 4 module pentru o scanare fiabilă)',
      socialHandleHelper:
        'Introdu un nume de utilizator, de exemplu @utilizator, sau lipește un URL complet de profil cu https://.'
    },
    frame: {
      defaultText: 'SCANEAZĂ-MĂ'
    },
    misc: {
      qrPlaceholder: 'Codul QR va apărea aici',
      socialPreview: 'Destinația codului QR',
      wifiPayloadHidden: 'Configurație WiFi — parolă ascunsă'
    }
  };
})();
