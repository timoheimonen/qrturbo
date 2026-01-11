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
        'Ilmainen QR-Koodigeneraattori - Mukauta Värejä, Logoja ja Tyylejä | QRTurbo.app',
      description:
        'Luo ilmaisia mukautettavia QR-koodeja välittömästi QRTurbo.app:lla. Lisää logoja, mukautettuja värejä ja tyylejä. Luo QR-koodeja URL-osoitteille, WiFi-verkoille, vCardeille, tekstiviesteille ja puheluille. Ei mainoksia, ei seurantaa – täysin selainpohjainen ja turvallinen.',
      keywords:
        'QR-koodigeneraattori, mukautettu QR-koodi, QR-koodi logolla, värillinen QR-koodi, ilmainen QR-koodin luoja, WiFi QR-koodi, vCard QR-koodi, SMS QR-koodi, online QR-työkalu, seuraamaton QR-generaattori'
    },
    app: {
      title: 'QRTurbo.app - Ilmainen QR-Koodigeneraattori',
      subtitle:
        'Luo mukautettavia QR-koodeja logoilla, väreillä ja tyyleillä. Tuki URL-osoitteille, WiFi:lle, vCardeille, tekstiviesteille ja puheluille',
      selectLanguage: 'Valitse Kieli'
    },
    tabs: {
      urlText: 'URL/Teksti',
      vcard: 'vCard',
      smsPhone: 'SMS/Puhelu',
      wifi: 'WiFi'
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
      errorCorrection: 'Virheen Korjaus',
      downloadFormat: 'Latausmuoto',
      dotStyle: 'Pisteen Tyyli',
      cornerSquare: 'Kulman Neliö',
      cornerDot: 'Kulman Piste',
      quietZone: 'Hiljainen Vyöhyke (Marginaali)',
      logoSize: 'Logon Koko',
      logoMargin: 'Logon Marginaali',
      logo: 'Logo (Valinnainen)',
      styleOptions: 'Tyylivaihtoehdot'
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
      smsMessage: 'Esitäytetty viestisi tähän...'
    },
    actions: {
      generate: 'Luo QR-Koodi',
      download: 'Lataa QR-Koodi',
      reset: 'Palauta Oletusasetukset',
      customize: 'Mukauta Ulkoasu (Valinnainen)',
      chooseLogo: 'Valitse Kuva'
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
      cornerDot: 'Piste'
    },
    alerts: {
      enterText: 'Anna teksti tai URL',
      vcardRequired: 'Täytä vähintään yksi: Etunimi, Sukunimi, Sähköposti tai Puhelinnumero.',
      wifiSsidRequired: 'Anna Verkon Nimi (SSID).',
      phoneRequired: 'Anna puhelinnumero.',
      lowContrast:
        '⚠️ Matala kontrasti havaittu. QR-koodisi saattaa olla vaikea skannata. Harkitse tummempaa etualaa tai vaaleampaa taustaa.',
      dataEmpty: 'QR-koodin tiedot ovat tyhjiä.',
      noData: 'Ei tietoja QR-koodille.',
      libraryLoadFailed: 'QR-koodikirjastoa ei voitu ladata. Päivitä sivu.',
      generationError: 'Virhe QR-koodin luomisessa',
      generateFirst: 'Luo ensin QR-koodi.',
      resetSuccess: 'Mukautus palautettu oletusasetuksiin',
      largeImageWarning:
        '⚠️ Suuri kuvatiedosto ({{size}}MB). Harkitse pienemmän kuvan käyttöä parempaa suorituskykyä varten.',
      invalidImageFile: 'Valitse kelvollinen kuvatiedosto (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} merkkiä'
    },
    labels: {
      sms: 'SMS',
      phone: 'Puhelu'
    },
    footer: {
      privacy1: 'Tämä ilmainen QR-koodigeneraattori toimii kokonaan selaimessasi.',
      privacy2:
        'Tietoja ei tallenneta tai lähetetä mihinkään. Ei seurantaa, ei mainoksia, ei hölynpölyä.',
      github: 'Näytä lähdekoodi GitHubissa'
    },
    helpers: {
      quietZoneHelper:
        'Tila QR-koodin ympärillä (suositus: 4-16px luotettavaa skannausta varten)'
    },
    misc: {
      qrPlaceholder: 'QR-koodi näkyy tässä'
    }
  };
})();
