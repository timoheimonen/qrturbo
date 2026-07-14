// Finnish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.fi = {
    meta: {
      title:
        'Ilmainen QR-koodigeneraattori logoilla ja väreillä | QRTurbo.app',
      description:
        'Luo ilmaisia mukautettuja QR-koodeja URL-osoitteille, WiFi-verkoille, vCardeille, tekstiviesteille ja puheluille. Lisää logoja, värejä ja tyylejä selaimessa ilman seurantaa tai tiedostojen latausta palvelimelle.'
    },
    app: {
      title: 'QRTurbo.app - Ilmainen QR-Koodigeneraattori',
      subtitle:
        'Luo mukautettavia QR-koodeja logoilla, väreillä ja tyyleillä. Tuki URL-osoitteille, WiFi:lle, vCardeille, tekstiviesteille ja puheluille',
      selectLanguage: 'Valitse Kieli'
    },
    aria: {
      themeGroup: 'Teema',
      lightTheme: 'Vaalea teema',
      darkTheme: 'Tumma teema',
      language: 'Kieli',
      qrTypes: 'QR-koodityypit'
    },
    tabs: {
      urlText: 'URL/Teksti',
      vcard: 'vCard',
      smsPhone: 'SMS/Puhelu',
      wifi: 'WiFi',
      email: 'Sähköposti',
      calendarEvent: 'Tapahtuma',
      location: 'Sijainti',
      socialMedia: 'Sosiaalinen media',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-linkki'
    },
    fields: {
      textOrUrl: 'Teksti tai URL',
      firstName: 'Etunimi',
      lastName: 'Sukunimi',
      organization: 'Organisaatio',
      title: 'Titteli',
      phoneWork: 'Puhelin (Työ)',
      phoneMobile: 'Puhelin (Matkapuhelin)',
      email: 'Sähköposti',
      website: 'Verkkosivusto',
      street: 'Katu',
      city: 'Kaupunki',
      state: 'Osavaltio/Maakunta',
      zip: 'Postinumero',
      country: 'Maa',
      ssid: 'Verkon Nimi (SSID)',
      password: 'Salasana',
      authentication: 'Todennus',
      hiddenNetwork: 'Tämä on piilotettu verkko',
      phoneNumber: 'Puhelinnumero',
      message: 'Viesti (valinnainen)',
      qrSize: 'QR-Koodin Koko',
      foregroundColor: 'Edustaväri',
      backgroundColor: 'Taustaväri',
      transparentBackground: 'Läpinäkyvä tausta',
      errorCorrection: 'Virheen Korjaus',
      downloadFormat: 'Latausmuoto',
      dotStyle: 'Pisteen Tyyli',
      cornerSquare: 'Kulman Neliö',
      cornerDot: 'Kulman Piste',
      quietZone: 'Hiljainen Vyöhyke (Marginaali)',
      logoSize: 'Logon Koko',
      logoMargin: 'Logon Marginaali',
      logo: 'Logo (Valinnainen)',
      styleOptions: 'Tyylivaihtoehdot',
      emailTo: 'Vastaanottajan sähköposti',
      emailSubject: 'Aihe',
      emailBody: 'Viesti',
      eventTitle: 'Tapahtuman otsikko',
      eventStart: 'Alku',
      eventEnd: 'Loppu',
      eventLocation: 'Sijainti',
      eventDescription: 'Kuvaus',
      locationAddress: 'Osoite tai paikka',
      latitude: 'Leveysaste',
      longitude: 'Pituusaste',
      socialPlatform: 'Alusta',
      socialProfileType: 'Profiilityyppi',
      socialHandleOrUrl: 'Käyttäjänimi tai profiilin URL',
      whatsappPhone: 'WhatsApp-numero tai @käyttäjänimi',
      whatsappMessage: 'Viesti (valinnainen)',
      mecardName: 'Nimi',
      address: 'Osoite',
      appWebUrl: 'Varalla oleva / web-URL',
      appIosUrl: 'iOS App Store -URL',
      appAndroidUrl: 'Android Play Store -URL',
      appLinkTarget: 'Kauppalinkin varavalinta'
    },
    placeholders: {
      url: 'esim., https://www.esimerkki.com',
      firstName: 'Matti',
      lastName: 'Meikäläinen',
      organization: 'ACME Oy',
      title: 'Kehittäjä',
      phoneWork: '+358-555-555-1234',
      phoneMobile: '+358-555-555-5678',
      email: 'matti.meikalainen@esimerkki.com',
      website: 'https://www.esimerkki.com',
      street: 'Pääkatu 123',
      city: 'Helsinki',
      state: 'Uusimaa',
      zip: '00100',
      country: 'Suomi',
      ssid: 'esim., MinunKotiWiFi',
      wifiPassword: 'Sinun salainen salasanasi',
      phoneNumber: 'esim., +358555123456',
      smsMessage: 'Esitäytetty viestisi tähän...',
      emailTo: 'hei@example.com',
      emailSubject: 'Terveiset QRTurbo.appista',
      emailBody: 'Kirjoita sähköpostiviesti tähän...',
      eventTitle: 'Tiimipalaveri',
      eventLocation: 'Kokoushuone tai osoite',
      eventDescription: 'Tapahtuman tiedot...',
      locationAddress: 'Mannerheimintie 1, Helsinki',
      latitude: '60.1699',
      longitude: '24.9384',
      socialHandle: '@kayttajanimi tai https://...',
      whatsappPhone: 'esim., +358555123456 tai @kayttajanimi',
      whatsappMessage: 'WhatsApp-viestisi tähän...',
      mecardName: 'Matti Meikäläinen',
      address: 'Pääkatu 123, Helsinki',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Luo QR-Koodi',
      download: 'Lataa QR-Koodi',
      reset: 'Palauta Oletusasetukset',
      customize: 'Mukauta Ulkoasu (Valinnainen)',
      chooseLogo: 'Valitse Kuva',
      showPassword: 'Näytä salasana',
      hidePassword: 'Piilota salasana',
      showPayload: 'Näytä QR-tiedot',
      hidePayload: 'Piilota QR-tiedot'
    },
    options: {
      sizeSmall: 'Pieni (256px)',
      sizeMedium: 'Keskikokoinen (512px)',
      sizeLarge: 'Suuri (1024px)',
      errorLow: 'L - Matala (7%)',
      errorMedium: 'M - Keskitaso (15%)',
      errorQuartile: 'Q - Kvartiili (25%)',
      errorHigh: 'H - Korkea (30%)',
      formatPng: 'PNG (rasteri)',
      formatSvg: 'SVG (vektori)',
      formatPdf: 'PDF (dokumentti)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ei mitään',
      dotSquare: 'Neliö',
      dotRounded: 'Pyöristetty',
      dotDots: 'Pisteet',
      dotClassy: 'Tyylikäs',
      dotClassyRounded: 'Tyylikäs Pyöristetty',
      dotExtraRounded: 'Erittäin Pyöristetty',
      cornerSquare: 'Neliö',
      cornerExtraRounded: 'Erittäin Pyöristetty',
      cornerDot: 'Piste',
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
      socialOther: 'Muu URL',
      socialTypePerson: 'Henkilö/Profiili',
      socialTypeCompany: 'Yritys',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Käytä iOS-linkkiä, jos web-URL puuttuu',
      appTargetAndroid: 'Käytä Android-linkkiä, jos web-URL puuttuu'
    },
    alerts: {
      enterText: 'Anna teksti tai URL',
      vcardRequired: 'Täytä vähintään yksi: Etunimi, Sukunimi, Sähköposti tai Puhelinnumero.',
      wifiSsidRequired: 'Anna Verkon Nimi (SSID).',
      wifiSsidLengthInvalid: 'WiFi-verkon nimi voi olla enintään 32 UTF-8-tavua.',
      wifiWpaPasswordInvalid:
        'WPA/WPA2-salasanan on oltava 8-63 tulostettavaa merkkiä tai täsmälleen 64 heksadesimaalimerkkiä.',
      wifiWepPasswordInvalid:
        'WEP-salasanan on oltava 5 tai 13 tulostettavaa merkkiä tai 10 tai 26 heksadesimaalimerkkiä.',
      phoneRequired: 'Anna puhelinnumero.',
      emailRequired: 'Täytä vähintään yksi sähköpostikenttä.',
      emailInvalid: 'Anna kelvollinen sähköpostiosoite.',
      eventRequired: 'Anna tapahtuman otsikko ja aloitusaika.',
      eventEndInvalid: 'Loppuaika ei voi olla ennen aloitusaikaa.',
      locationRequired: 'Anna osoite tai molemmat koordinaatit.',
      locationCoordinatesInvalid: 'Anna kelvolliset leveys- ja pituusasteen koordinaatit.',
      socialRequired: 'Anna sosiaalisen median käyttäjänimi tai profiilin URL.',
      socialHandleInvalid: 'Anna kelvollinen käyttäjänimi, jossa on kirjaimia, numeroita, pisteitä, alaviivoja tai yhdysmerkkejä.',
      socialUrlInvalid: 'Anna kelvollinen sosiaalisen median profiilin URL, joka alkaa http:// tai https://.',
      whatsappPhoneRequired: 'Anna WhatsApp-puhelinnumero maakoodin kanssa tai kelvollinen @käyttäjänimi.',
      mecardRequired: 'Täytä vähintään yksi: Nimi, puhelinnumero tai sähköposti.',
      appLinkRequired: 'Anna web-, iOS- tai Android-sovelluksen URL.',
      urlInvalid: 'Anna kelvollinen URL, joka alkaa http:// tai https://.',
      lowContrast:
        '⚠️ Matala kontrasti havaittu. QR-koodisi saattaa olla vaikea skannata. Harkitse tummempaa etualaa tai vaaleampaa taustaa.',
      dataEmpty: 'QR-koodin tiedot ovat tyhjiä.',
      noData: 'Ei tietoja QR-koodille.',
      libraryLoadFailed: 'QR-koodikirjastoa ei voitu ladata. Päivitä sivu.',
      generationError: 'Virhe QR-koodin luomisessa',
      dataTooLong: 'Sisältö on liian suuri valitulle QR-virheenkorjaustasolle. Lyhennä sisältöä tai valitse matalampi taso.',
      pdfExportFailed: 'PDF-vienti epäonnistui. Yritä uudelleen.',
      generateFirst: 'Luo ensin QR-koodi.',
      resetSuccess: 'Mukautus palautettu oletusasetuksiin',
      largeImageWarning:
        '⚠️ Suuri kuvatiedosto ({{size}}MB). Harkitse pienemmän kuvan käyttöä parempaa suorituskykyä varten.',
      invalidImageFile: 'Valitse kelvollinen kuvatiedosto (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} merkkiä'
    },
    units: {
      modules: '{{count}} moduulia'
    },
    labels: {
      sms: 'SMS',
      phone: 'Puhelu'
    },
    warnings: {
      lowContrast:
        'Matala kontrasti voi tehdä QR-koodista vaikeasti skannattavan. Käytä tummempaa etualaa tai vaaleampaa taustaa.',
      transparentBackground:
        'Läpinäkyvä tausta riippuu lopullisesta pinnasta. Testaa QR-koodi oikealla taustalla ennen julkaisua.',
      quietZoneSmall:
        'Hiljainen vyöhyke on liian pieni. Käytä vähintään 4 moduulia luotettavaan skannaukseen.',
      denseData:
        'QR-koodissa on paljon dataa valittuun kokoon nähden. Käytä suurempaa kokoa tai lyhennä sisältöä.',
      logoErrorCorrection:
        'Suuret logot toimivat luotettavammin korkealla (H) virheenkorjauksella.',
      logoLarge:
        'Logo on suuri ja voi peittää liikaa QR-koodista. Testaa ennen painatusta tai jakamista.'
    },
    footer: {
      privacy1: 'Tämä ilmainen QR-koodigeneraattori toimii kokonaan selaimessasi.',
      privacy2:
        'Tietoja ei tallenneta tai lähetetä mihinkään. Ei seurantaa, ei mainoksia, ei hölynpölyä.',
      privacyPolicy: 'Tietosuojakäytäntö',
      termsOfUse: 'Käyttöehdot',
      github: 'Näytä lähdekoodi GitHubissa'
    },
    helpers: {
      quietZoneHelper:
        'Tila QR-koodin ympärillä (vähintään 4 moduulia luotettavaa skannausta varten)',
      socialHandleHelper:
        'Anna käyttäjänimi kuten @kayttajanimi tai liitä koko https://-profiili-URL.'
    },
    misc: {
      qrPlaceholder: 'QR-koodi näkyy tässä',
      socialPreview: 'QR-kohde',
      wifiPayloadHidden: 'WiFi-määritys — salasana piilotettu'
    }
  };
})();
