// Hungarian translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.hu = {
    app: {
      selectLanguage: 'Nyelv kiválasztása'
    },
    aria: {
      themeGroup: 'Téma',
      lightTheme: 'Világos téma',
      darkTheme: 'Sötét téma',
      language: 'Nyelv',
      qrTypes: 'QR-kód-típusok'
    },
    tabs: {
      urlText: 'URL/Szöveg',
      vcard: 'vCard',
      smsPhone: 'SMS/Hívás',
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Esemény',
      location: 'Helyszín',
      socialMedia: 'Közösségi média',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-link'
    },
    fields: {
      textOrUrl: 'Szöveg vagy URL',
      firstName: 'Keresztnév',
      lastName: 'Vezetéknév',
      organization: 'Cég/szervezet',
      title: 'Beosztás',
      phoneWork: 'Telefon (munkahelyi)',
      phoneMobile: 'Telefon (mobil)',
      email: 'E-mail',
      website: 'Weboldal',
      street: 'Utca, házszám',
      city: 'Település',
      state: 'Megye/régió',
      zip: 'Irányítószám',
      country: 'Ország',
      ssid: 'Hálózat neve (SSID)',
      password: 'Jelszó',
      authentication: 'Titkosítás',
      hiddenNetwork: 'Ez egy rejtett hálózat',
      phoneNumber: 'Telefonszám',
      message: 'Üzenet (nem kötelező)',
      qrSize: 'QR-kód mérete',
      foregroundColor: 'Előtér színe',
      backgroundColor: 'Háttér színe',
      transparentBackground: 'Átlátszó háttér',
      errorCorrection: 'Hibajavítás',
      downloadFormat: 'Letöltési formátum',
      dotStyle: 'Pontok stílusa',
      cornerSquare: 'Saroknégyzet',
      cornerDot: 'Sarokpont',
      quietZone: 'Csendes zóna (margó)',
      logoSize: 'Logó mérete',
      logoMargin: 'Logó margója',
      logo: 'Logó (nem kötelező)',
      styleOptions: 'Stílusbeállítások',
      emailTo: 'Címzett e-mail-címe',
      emailSubject: 'Tárgy',
      emailBody: 'Üzenet',
      eventTitle: 'Esemény neve',
      eventStart: 'Kezdés',
      eventEnd: 'Befejezés',
      eventLocation: 'Helyszín',
      eventDescription: 'Leírás',
      locationAddress: 'Cím vagy hely',
      latitude: 'Szélesség',
      longitude: 'Hosszúság',
      socialPlatform: 'Platform',
      socialProfileType: 'Profiltípus',
      socialHandleOrUrl: 'Felhasználónév vagy profil-URL',
      whatsappPhone: 'WhatsApp-szám vagy @felhasználónév',
      whatsappMessage: 'Üzenet (nem kötelező)',
      mecardName: 'Név',
      address: 'Cím',
      appWebUrl: 'Tartalék / webes URL',
      appIosUrl: 'App Store-link (iOS)',
      appAndroidUrl: 'Google Play-link (Android)',
      appLinkTarget: 'Tartalék áruházlink',
      frame: 'Keret',
      frameText: 'Keret szövege',
      frameColor: 'Keret színe'
    },
    placeholders: {
      url: 'pl. https://www.example.com',
      firstName: 'János',
      lastName: 'Kovács',
      organization: 'Minta Kft.',
      title: 'Fejlesztő',
      phoneWork: '+36 1 234 5678',
      phoneMobile: '+36 20 123 4567',
      email: 'kovacs.janos@example.com',
      website: 'https://www.example.com',
      street: 'Virág utca 12.',
      city: 'Budapest',
      state: 'Budapest',
      zip: '1051',
      country: 'Magyarország',
      ssid: 'pl. OtthoniWiFi',
      wifiPassword: 'A titkos jelszavad',
      phoneNumber: 'pl. +36201234567',
      smsMessage: 'Ide írd az előre megírt üzenetet...',
      emailTo: 'hello@example.com',
      emailSubject: 'Üdvözlet a QRTurbo.appról',
      emailBody: 'Ide írd az e-mail szövegét...',
      eventTitle: 'Csapatmegbeszélés',
      eventLocation: 'Tárgyaló vagy cím',
      eventDescription: 'Az esemény részletei...',
      locationAddress: 'Hősök tere, Budapest',
      latitude: '47.515',
      longitude: '19.078',
      socialHandle: '@felhasznalonev vagy https://...',
      whatsappPhone: 'pl. +36201234567 vagy @felhasznalonev',
      whatsappMessage: 'Ide írd a WhatsApp-üzenetet...',
      mecardName: 'Kovács János',
      address: 'Virág utca 12., Budapest',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'QR-kód készítése',
      download: 'QR-kód letöltése',
      reset: 'Visszaállítás',
      customize: 'Megjelenés (nem kötelező)',
      chooseLogo: 'Kép kiválasztása',
      showPassword: 'Jelszó mutatása',
      hidePassword: 'Jelszó elrejtése',
      showPayload: 'QR-adatok mutatása',
      hidePayload: 'QR-adatok elrejtése'
    },
    options: {
      sizeMedium: 'Képernyő (512 px)',
      sizeLarge: 'Nagy (1024 px)',
      sizePrint: 'Nyomtatás (2048 px)',
      sizePoster: 'Plakát (4096 px)',
      frameNone: 'Nincs keret',
      frameBannerBottom: 'Felirat alul',
      frameBannerTop: 'Felirat felül',
      frameOutline: 'Keret felirattal',
      errorLow: 'L - Alacsony (7%)',
      errorMedium: 'M - Közepes (15%)',
      errorQuartile: 'Q - Kvartilis (25%)',
      errorHigh: 'H - Magas (30%)',
      formatPng: 'PNG (raszteres)',
      formatSvg: 'SVG (vektoros)',
      formatPdf: 'PDF (dokumentum)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Nincs',
      dotSquare: 'Négyzet',
      dotRounded: 'Lekerekített',
      dotDots: 'Pöttyök',
      dotClassy: 'Elegáns',
      dotClassyRounded: 'Elegáns, kerek',
      dotExtraRounded: 'Nagyon kerek',
      cornerSquare: 'Négyzet',
      cornerExtraRounded: 'Nagyon kerek',
      cornerDot: 'Pont',
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
      socialOther: 'Egyéb URL',
      socialTypePerson: 'Személy/profil',
      socialTypeCompany: 'Cég',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'iOS, ha nincs webes URL',
      appTargetAndroid: 'Android, ha nincs webes URL'
    },
    alerts: {
      enterText: 'Adj meg egy szöveget vagy URL-t',
      vcardRequired: 'Tölts ki legalább egyet: keresztnév, vezetéknév, e-mail vagy telefonszám.',
      wifiSsidRequired: 'Add meg a hálózat nevét (SSID).',
      wifiSsidLengthInvalid: 'A WiFi-hálózat neve legfeljebb 32 UTF-8 bájt lehet.',
      wifiWpaPasswordInvalid:
        'A WPA/WPA2-jelszó 8–63 nyomtatható karakterből vagy pontosan 64 hexadecimális karakterből állhat.',
      wifiWepPasswordInvalid:
        'A WEP-jelszó 5 vagy 13 nyomtatható karakterből, illetve 10 vagy 26 hexadecimális karakterből állhat.',
      phoneRequired: 'Adj meg egy telefonszámot.',
      emailRequired: 'Tölts ki legalább egy e-mail-mezőt.',
      emailInvalid: 'Adj meg egy érvényes e-mail-címet.',
      eventRequired: 'Add meg az esemény nevét és kezdési időpontját.',
      eventEndInvalid: 'Az esemény vége nem lehet korábban, mint a kezdése.',
      locationRequired: 'Adj meg egy címet vagy mindkét koordinátát.',
      locationCoordinatesInvalid: 'Adj meg érvényes szélességi és hosszúsági koordinátákat.',
      socialRequired: 'Adj meg egy közösségimédia-felhasználónevet vagy profil-URL-t.',
      socialHandleInvalid: 'Adj meg érvényes felhasználónevet. Betűk, számok, pontok, aláhúzásjelek és kötőjelek használhatók.',
      socialUrlInvalid: 'Adj meg érvényes profil-URL-t, amely http:// vagy https:// előtaggal kezdődik.',
      whatsappPhoneRequired: 'Adj meg egy WhatsApp-telefonszámot országkóddal, vagy egy érvényes @felhasználónevet.',
      mecardRequired: 'Tölts ki legalább egyet: név, telefonszám vagy e-mail.',
      appLinkRequired: 'Adj meg legalább egy webes, iOS vagy Android URL-t.',
      urlInvalid: 'Adj meg érvényes URL-t, amely http:// vagy https:// előtaggal kezdődik.',
      lowContrast:
        '⚠️ Alacsony a kontraszt. A QR-kódot nehéz lehet beolvasni. Próbálj sötétebb előteret vagy világosabb hátteret.',
      dataEmpty: 'A QR-kód tartalma üres.',
      noData: 'Nincs megadva adat a QR-kódhoz.',
      libraryLoadFailed: 'Nem sikerült betölteni a QR-kódoló könyvtárat. Frissítsd az oldalt.',
      generationError: 'Hiba történt a QR-kód készítésekor',
      dataTooLong: 'Ez a tartalom túl hosszú a választott hibajavítási szinthez. Rövidítsd le, vagy válassz alacsonyabb szintet.',
      pdfExportFailed: 'A PDF-exportálás nem sikerült. Próbáld újra.',
      generateFirst: 'Előbb készíts egy QR-kódot.',
      resetSuccess: 'A megjelenés visszaállt az alapértékekre',
      largeImageWarning:
        '⚠️ Nagy képfájl ({{size}} MB). A jobb teljesítményért használj kisebb képet.',
      invalidImageFile: 'Válassz érvényes képfájlt (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} karakter'
    },
    units: {
      modules: '{{count}} modul'
    },
    labels: {
      sms: 'SMS',
      phone: 'Hívás'
    },
    warnings: {
      lowContrast:
        'Alacsony kontraszt mellett a QR-kódot nehéz lehet beolvasni. Használj sötétebb előteret vagy világosabb hátteret.',
      transparentBackground:
        'Az átlátszó háttér hatása a végső felülettől függ. Közzététel előtt teszteld a QR-kódot a tényleges háttéren.',
      quietZoneSmall:
        'Túl kicsi a csendes zóna. A megbízható beolvasáshoz legalább 4 modul kell.',
      denseData:
        'A QR-kód sok adatot tartalmaz a választott mérethez képest. Válassz nagyobb méretet, vagy rövidítsd a tartalmat.',
      logoErrorCorrection:
        'Nagy logóval a kód magas (H) hibajavítással olvasható be megbízhatóbban.',
      logoLarge:
        'A logó nagy, és a QR-kód túl nagy részét takarhatja el. Nyomtatás vagy megosztás előtt teszteld.'
    },
    brand: {
      tagline: 'a te privát helyed QR-kódok készítéséhez'
    },
    trust: {
      local: 'A böngésződben készül',
      noUploads: 'Nincs feltöltés',
      noTracking: 'Nincs követés, nincs süti',
      offline: 'Offline is működik',
      openSource: 'Nyílt forráskód',
      noExpiry: 'Soha nem jár le',
      noSignup: 'Nincs regisztráció'
    },
    workspace: {
      chooseType: 'Válassz típust',
      addContent: 'Add meg a tartalmat',
      adjustLook: 'Méret és stílus'
    },
    preview: {
      title: 'Előnézet',
      localBadge: 'Ezen az eszközön készült'
    },
    how: {
      title: 'Így működik',
      step1Title: 'Válassz',
      step1Text: 'Döntsd el, mit tegyen a kód: nyisson meg egy linket, csatlakoztasson WiFi-hálózathoz, mentsen el egy névjegyet, és még sok mást.',
      step2Title: 'Töltsd ki',
      step2Text: 'Írd be a tartalmat. Az előnézet gépelés közben frissül, itt, a böngésződben.',
      step3Title: 'Töltsd le',
      step3Text: 'Mentsd el PNG, SVG vagy PDF formátumban. Nyomtatás vagy megosztás előtt próbáld ki a beolvasást.'
    },
    privacyInfo: {
      title: 'Alapból privát',
      intro: 'A QR-kódok gyakran személyes adatokat hordoznak: WiFi-jelszót, telefonszámot, lakcímet. A QRTurbo.app úgy készült, hogy ezekből semmi ne jusson el egy szerverre.',
      localTitle: 'Az eszközödön marad',
      localText: 'A QR-kódokat és a logókat a böngésződben futó kód állítja elő. Nincs háttérszerver, amely megkaphatná, amit beírsz.',
      staticTitle: 'Nincs átirányítás, nincs lejárat',
      staticText: 'A tartalom közvetlenül a QR-kódba kerül. A beolvasások soha nem futnak át rajtunk, és a kód soha nem jár le.',
      noTrackingTitle: 'Nincs követés',
      noTrackingText: 'Nincs analitika, hirdetés, süti és fiók. Csak a választott nyelvet és témát mentjük, helyben, a böngésződben.',
      openSourceTitle: 'Bárki ellenőrizheti',
      openSourceText: 'A teljes forráskód nyilvános a GitHubon, így bárki meggyőződhet arról, hogy ezek az állítások igazak.'
    },
    footer: {
      privacy1: 'Ez az ingyenes QR-kód generátor teljes egészében a böngésződben fut.',
      privacy2: 'Semmilyen adatot nem tárolunk és nem küldünk sehová. Nincs követés, nincs reklám, nincs hókuszpókusz.',
      privacyPolicy: 'Adatvédelmi tájékoztató',
      termsOfUse: 'Felhasználási feltételek',
      github: 'Forráskód a GitHubon'
    },
    helpers: {
      quietZoneHelper:
        'Üres terület a QR-kód körül (a megbízható beolvasáshoz legalább 4 modul)',
      socialHandleHelper:
        'Adj meg egy felhasználónevet (pl. @felhasznalonev), vagy illessz be egy teljes https:// profil-URL-t.'
    },
    frame: {
      defaultText: 'OLVASS BE'
    },
    misc: {
      qrPlaceholder: 'Itt jelenik meg a QR-kód',
      socialPreview: 'QR-cél',
      wifiPayloadHidden: 'WiFi-beállítás — jelszó elrejtve'
    }
  };
})();
