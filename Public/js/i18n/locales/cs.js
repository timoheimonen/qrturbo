// Czech translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.cs = {
    app: {
      selectLanguage: 'Vyber jazyk'
    },
    aria: {
      themeGroup: 'Motiv',
      lightTheme: 'Světlý motiv',
      darkTheme: 'Tmavý motiv',
      language: 'Jazyk',
      qrTypes: 'Typy QR kódů'
    },
    tabs: {
      urlText: 'URL/text',
      vcard: 'vCard',
      smsPhone: 'SMS/telefon',
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Událost',
      location: 'Poloha',
      socialMedia: 'Sociální sítě',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Aplikace'
    },
    fields: {
      textOrUrl: 'Text nebo URL',
      firstName: 'Jméno',
      lastName: 'Příjmení',
      organization: 'Firma',
      title: 'Pracovní pozice',
      phoneWork: 'Telefon (pracovní)',
      phoneMobile: 'Telefon (mobilní)',
      email: 'E-mail',
      website: 'Web',
      street: 'Ulice',
      city: 'Město',
      state: 'Kraj/region',
      zip: 'PSČ',
      country: 'Země',
      ssid: 'Název sítě (SSID)',
      password: 'Heslo',
      authentication: 'Zabezpečení',
      hiddenNetwork: 'Toto je skrytá síť',
      phoneNumber: 'Telefonní číslo',
      message: 'Zpráva (volitelné)',
      qrSize: 'Velikost QR kódu',
      foregroundColor: 'Barva kódu',
      backgroundColor: 'Barva pozadí',
      transparentBackground: 'Průhledné pozadí',
      errorCorrection: 'Korekce chyb',
      downloadFormat: 'Formát souboru',
      dotStyle: 'Styl modulů',
      cornerSquare: 'Rohový čtverec',
      cornerDot: 'Rohová tečka',
      quietZone: 'Klidová zóna (okraj)',
      logoSize: 'Velikost loga',
      logoMargin: 'Okraj loga',
      logo: 'Logo (volitelné)',
      styleOptions: 'Možnosti stylu',
      emailTo: 'E-mail příjemce',
      emailSubject: 'Předmět',
      emailBody: 'Text zprávy',
      eventTitle: 'Název události',
      eventStart: 'Začátek',
      eventEnd: 'Konec',
      eventLocation: 'Místo',
      eventDescription: 'Popis',
      locationAddress: 'Adresa nebo místo',
      latitude: 'Zeměpisná šířka',
      longitude: 'Zeměpisná délka',
      socialPlatform: 'Platforma',
      socialProfileType: 'Typ profilu',
      socialHandleOrUrl: 'Uživatelské jméno nebo URL profilu',
      whatsappPhone: 'Číslo WhatsApp nebo @uživatelské jméno',
      whatsappMessage: 'Zpráva (volitelné)',
      mecardName: 'Jméno a příjmení',
      address: 'Adresa',
      appWebUrl: 'Webová adresa (záložní)',
      appIosUrl: 'URL v App Store (iOS)',
      appAndroidUrl: 'URL v Google Play (Android)',
      appLinkTarget: 'Záložní obchod',
      frame: 'Rámeček',
      frameText: 'Text rámečku',
      frameColor: 'Barva rámečku'
    },
    placeholders: {
      url: 'např. https://www.example.com',
      firstName: 'Jan',
      lastName: 'Novák',
      organization: 'ACME s.r.o.',
      title: 'Vývojář',
      phoneWork: '+420 222 123 456',
      phoneMobile: '+420 601 234 567',
      email: 'jan.novak@example.com',
      website: 'https://www.example.com',
      street: 'Květinová 12',
      city: 'Praha',
      state: 'Hlavní město Praha',
      zip: '110 00',
      country: 'Česko',
      ssid: 'např. MojeWiFi',
      wifiPassword: 'Tvoje tajné heslo',
      phoneNumber: 'např. +420601234567',
      smsMessage: 'Sem napiš předvyplněnou zprávu...',
      emailTo: 'ahoj@example.com',
      emailSubject: 'Pozdrav z QRTurbo.app',
      emailBody: 'Sem napiš text e-mailu...',
      eventTitle: 'Týmová porada',
      eventLocation: 'Zasedací místnost nebo adresa',
      eventDescription: 'Podrobnosti o události...',
      locationAddress: 'Staroměstské náměstí 1, Praha',
      latitude: '50.087',
      longitude: '14.421',
      socialHandle: '@uzivatel nebo https://...',
      whatsappPhone: 'např. +420601234567 nebo @uzivatel',
      whatsappMessage: 'Sem napiš zprávu pro WhatsApp...',
      mecardName: 'Jan Novák',
      address: 'Květinová 12, Praha',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Vytvořit QR kód',
      download: 'Stáhnout QR kód',
      reset: 'Obnovit výchozí',
      customize: 'Upravit vzhled (volitelné)',
      chooseLogo: 'Vybrat obrázek',
      showPassword: 'Zobrazit heslo',
      hidePassword: 'Skrýt heslo',
      showPayload: 'Zobrazit data QR kódu',
      hidePayload: 'Skrýt data QR kódu'
    },
    options: {
      sizeMedium: 'Obrazovka (512 px)',
      sizeLarge: 'Velký (1024 px)',
      sizePrint: 'Tisk (2048 px)',
      sizePoster: 'Plakát (4096 px)',
      frameNone: 'Bez rámečku',
      frameBannerBottom: 'Popisek pod kódem',
      frameBannerTop: 'Popisek nad kódem',
      frameOutline: 'Obrys s popiskem',
      errorLow: 'L - nízká (7 %)',
      errorMedium: 'M - střední (15 %)',
      errorQuartile: 'Q - vyšší (25 %)',
      errorHigh: 'H - vysoká (30 %)',
      formatPng: 'PNG (rastrový obrázek)',
      formatSvg: 'SVG (vektorový obrázek)',
      formatPdf: 'PDF (dokument)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Žádné',
      dotSquare: 'Čtverce',
      dotRounded: 'Zaoblené',
      dotDots: 'Tečky',
      dotClassy: 'Elegantní',
      dotClassyRounded: 'Elegantní zaoblené',
      dotExtraRounded: 'Výrazně zaoblené',
      cornerSquare: 'Čtverec',
      cornerExtraRounded: 'Výrazně zaoblený',
      cornerDot: 'Tečka',
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
      socialOther: 'Jiná URL adresa',
      socialTypePerson: 'Osoba/profil',
      socialTypeCompany: 'Firma',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Použít iOS, pokud chybí webová adresa',
      appTargetAndroid: 'Použít Android, pokud chybí webová adresa'
    },
    alerts: {
      enterText: 'Zadej text nebo URL adresu.',
      vcardRequired:
        'Vyplň aspoň jedno z polí: jméno, příjmení, e-mail nebo telefonní číslo.',
      wifiSsidRequired: 'Zadej název sítě (SSID).',
      wifiSsidLengthInvalid: 'Název sítě WiFi může mít nejvýše 32 bajtů v kódování UTF-8.',
      wifiWpaPasswordInvalid:
        'Heslo WPA/WPA2 musí mít 8 až 63 tisknutelných znaků, nebo přesně 64 hexadecimálních znaků.',
      wifiWepPasswordInvalid:
        'Heslo WEP musí mít 5 nebo 13 tisknutelných znaků, nebo 10 či 26 hexadecimálních znaků.',
      phoneRequired: 'Zadej telefonní číslo.',
      emailRequired: 'Vyplň aspoň jedno pole e-mailu.',
      emailInvalid: 'Zadej platnou e-mailovou adresu.',
      eventRequired: 'Zadej název události a čas začátku.',
      eventEndInvalid: 'Konec události nemůže být dřív než její začátek.',
      locationRequired: 'Zadej adresu nebo obě souřadnice.',
      locationCoordinatesInvalid: 'Zadej platnou zeměpisnou šířku a délku.',
      socialRequired: 'Zadej uživatelské jméno nebo URL profilu na sociální síti.',
      socialHandleInvalid: 'Zadej platné uživatelské jméno. Povolená jsou písmena, číslice, tečky, podtržítka a pomlčky.',
      socialUrlInvalid: 'Zadej platnou URL profilu začínající http:// nebo https://.',
      whatsappPhoneRequired: 'Zadej číslo WhatsApp s předvolbou země nebo platné @uživatelské jméno.',
      mecardRequired: 'Vyplň aspoň jedno z polí: jméno, telefonní číslo nebo e-mail.',
      appLinkRequired: 'Zadej webovou adresu nebo URL aplikace pro iOS či Android.',
      urlInvalid: 'Zadej platnou URL adresu začínající http:// nebo https://.',
      lowContrast:
        '⚠️ Zjištěn nízký kontrast. QR kód může jít špatně naskenovat. Použij tmavší barvu kódu nebo světlejší pozadí.',
      dataEmpty: 'Data QR kódu jsou prázdná.',
      noData: 'Pro QR kód nebyla zadána žádná data.',
      libraryLoadFailed: 'Knihovnu pro QR kódy se nepodařilo načíst. Obnov stránku.',
      generationError: 'Chyba při vytváření QR kódu',
      dataTooLong: 'Obsah je pro zvolenou úroveň korekce chyb příliš dlouhý. Zkrať ho nebo zvol nižší úroveň.',
      pdfExportFailed: 'Export do PDF se nezdařil. Zkus to znovu.',
      generateFirst: 'Nejdřív vytvoř QR kód.',
      resetSuccess: 'Vzhled byl obnoven na výchozí',
      largeImageWarning:
        '⚠️ Velký obrázek ({{size}} MB). Pro lepší výkon použij menší obrázek.',
      invalidImageFile: 'Vyber platný obrázek (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} znaků'
    },
    units: {
      modules: 'Moduly: {{count}}'
    },
    labels: {
      sms: 'SMS',
      phone: 'Hovor'
    },
    warnings: {
      lowContrast:
        'Nízký kontrast může ztížit skenování QR kódu. Použij tmavší barvu kódu nebo světlejší pozadí.',
      transparentBackground:
        'U průhledného pozadí záleží na podkladu. Před zveřejněním otestuj QR kód přímo na cílovém pozadí.',
      quietZoneSmall:
        'Klidová zóna je příliš malá. Pro spolehlivé skenování nastav aspoň 4 moduly.',
      denseData:
        'Tento QR kód obsahuje na zvolenou velikost hodně dat. Zvol větší velikost nebo zkrať obsah.',
      logoErrorCorrection:
        'Kódy s velkým logem se spolehlivěji skenují s vysokou (H) korekcí chyb.',
      logoLarge:
        'Logo je velké a může zakrývat příliš velkou část QR kódu. Před tiskem nebo sdílením kód otestuj.'
    },
    brand: {
      tagline: 'Tvoje soukromé místo pro tvorbu QR kódů'
    },
    trust: {
      local: 'Vzniká v prohlížeči',
      noUploads: 'Nic se nenahrává',
      noTracking: 'Bez sledování a cookies',
      offline: 'Funguje offline',
      openSource: 'Otevřený zdrojový kód',
      noExpiry: 'Nikdy nevyprší',
      noSignup: 'Bez registrace'
    },
    workspace: {
      chooseType: 'Vyber typ',
      addContent: 'Přidej obsah',
      adjustLook: 'Velikost a styl'
    },
    preview: {
      title: 'Náhled',
      localBadge: 'Vytvořeno na tomto zařízení'
    },
    how: {
      title: 'Jak to funguje',
      step1Title: 'Vyber',
      step1Text: 'Rozhodni, co má kód dělat: otevřít odkaz, připojit k WiFi, uložit kontakt a další.',
      step2Title: 'Vyplň',
      step2Text: 'Napiš obsah. Náhled se aktualizuje už při psaní, přímo v tvém prohlížeči.',
      step3Title: 'Stáhni',
      step3Text: 'Ulož kód jako PNG, SVG nebo PDF. Před tiskem nebo sdílením vyzkoušej, že jde naskenovat.'
    },
    privacyInfo: {
      title: 'Soukromí v základu',
      intro: 'QR kódy často obsahují osobní údaje: heslo k WiFi, telefonní číslo, adresu bydliště. QRTurbo.app funguje tak, že se nic z toho nikdy nedostane na server.',
      localTitle: 'Zůstává ve tvém zařízení',
      localText: 'QR kódy i loga vytváří skript, který běží ve tvém prohlížeči. Neexistuje žádný server, který by mohl přijmout, co píšeš.',
      staticTitle: 'Bez přesměrování a bez expirace',
      staticText: 'Obsah je zakódovaný přímo v QR kódu. Naskenování nikdy neprochází přes nás a kód nikdy nevyprší.',
      noTrackingTitle: 'Bez sledování',
      noTrackingText: 'Žádná analytika, reklamy, cookies ani účty. Ukládá se jen zvolený jazyk a motiv, a to lokálně v tvém prohlížeči.',
      openSourceTitle: 'Kdokoli si to může ověřit',
      openSourceText: 'Celý zdrojový kód je veřejně dostupný na GitHubu, takže si tato tvrzení může ověřit kdokoli.'
    },
    footer: {
      privacy1: 'Tento generátor QR kódů zdarma běží celý ve tvém prohlížeči.',
      privacy2: 'Žádná data se neukládají ani nikam neodesílají. Bez sledování, bez reklam, bez triků.',
      privacyPolicy: 'Ochrana soukromí',
      termsOfUse: 'Podmínky použití',
      github: 'Zdrojový kód na GitHubu'
    },
    helpers: {
      quietZoneHelper:
        'Prázdné místo kolem QR kódu (pro spolehlivé skenování aspoň 4 moduly)',
      socialHandleHelper:
        'Zadej uživatelské jméno, např. @uzivatel, nebo vlož celou adresu profilu začínající https://.'
    },
    frame: {
      defaultText: 'NASKENUJ MĚ'
    },
    misc: {
      qrPlaceholder: 'Tady se zobrazí QR kód',
      socialPreview: 'Cíl QR kódu',
      wifiPayloadHidden: 'Nastavení WiFi — heslo skryto'
    }
  };
})();
