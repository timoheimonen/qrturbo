// Polish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.pl = {
    app: {
      selectLanguage: 'Wybierz język'
    },
    aria: {
      themeGroup: 'Motyw',
      lightTheme: 'Jasny motyw',
      darkTheme: 'Ciemny motyw',
      language: 'Język',
      qrTypes: 'Typy kodów QR'
    },
    tabs: {
      urlText: 'URL/tekst',
      vcard: 'vCard',
      smsPhone: 'SMS/telefon',
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Wydarzenie',
      location: 'Lokalizacja',
      socialMedia: 'Social media',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Aplikacja'
    },
    fields: {
      textOrUrl: 'Tekst lub URL',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      organization: 'Firma',
      title: 'Stanowisko',
      phoneWork: 'Telefon (służbowy)',
      phoneMobile: 'Telefon (komórkowy)',
      email: 'E-mail',
      website: 'Strona internetowa',
      street: 'Ulica',
      city: 'Miasto',
      state: 'Województwo/region',
      zip: 'Kod pocztowy',
      country: 'Kraj',
      ssid: 'Nazwa sieci (SSID)',
      password: 'Hasło',
      authentication: 'Zabezpieczenia',
      hiddenNetwork: 'To jest sieć ukryta',
      phoneNumber: 'Numer telefonu',
      message: 'Wiadomość (opcjonalnie)',
      qrSize: 'Rozmiar kodu QR',
      foregroundColor: 'Kolor kodu',
      backgroundColor: 'Kolor tła',
      transparentBackground: 'Przezroczyste tło',
      errorCorrection: 'Korekcja błędów',
      downloadFormat: 'Format pliku',
      dotStyle: 'Styl modułów',
      cornerSquare: 'Kwadrat narożny',
      cornerDot: 'Punkt narożny',
      quietZone: 'Strefa ciszy (margines)',
      logoSize: 'Rozmiar logo',
      logoMargin: 'Margines logo',
      logo: 'Logo (opcjonalnie)',
      styleOptions: 'Opcje stylu',
      emailTo: 'Adres e-mail odbiorcy',
      emailSubject: 'Temat',
      emailBody: 'Treść wiadomości',
      eventTitle: 'Nazwa wydarzenia',
      eventStart: 'Początek',
      eventEnd: 'Koniec',
      eventLocation: 'Miejsce',
      eventDescription: 'Opis',
      locationAddress: 'Adres lub miejsce',
      latitude: 'Szerokość geograficzna',
      longitude: 'Długość geograficzna',
      socialPlatform: 'Platforma',
      socialProfileType: 'Typ profilu',
      socialHandleOrUrl: 'Nazwa użytkownika lub URL profilu',
      whatsappPhone: 'Numer WhatsApp lub @nazwa użytkownika',
      whatsappMessage: 'Wiadomość (opcjonalnie)',
      mecardName: 'Imię i nazwisko',
      address: 'Adres',
      appWebUrl: 'Adres strony (zapasowy)',
      appIosUrl: 'URL w App Store (iOS)',
      appAndroidUrl: 'URL w Google Play (Android)',
      appLinkTarget: 'Sklep zapasowy',
      frame: 'Ramka',
      frameText: 'Tekst ramki',
      frameColor: 'Kolor ramki'
    },
    placeholders: {
      url: 'np. https://www.example.com',
      firstName: 'Jan',
      lastName: 'Kowalski',
      organization: 'ACME sp. z o.o.',
      title: 'Programista',
      phoneWork: '+48 22 123 45 67',
      phoneMobile: '+48 512 345 678',
      email: 'jan.kowalski@example.com',
      website: 'https://www.example.com',
      street: 'ul. Kwiatowa 12',
      city: 'Warszawa',
      state: 'mazowieckie',
      zip: '00-001',
      country: 'Polska',
      ssid: 'np. MojeWiFi',
      wifiPassword: 'Twoje tajne hasło',
      phoneNumber: 'np. +48512345678',
      smsMessage: 'Wpisz tu gotową treść wiadomości...',
      emailTo: 'kontakt@example.com',
      emailSubject: 'Pozdrowienia z QRTurbo.app',
      emailBody: 'Wpisz tu treść wiadomości e-mail...',
      eventTitle: 'Spotkanie zespołu',
      eventLocation: 'Sala konferencyjna lub adres',
      eventDescription: 'Szczegóły wydarzenia...',
      locationAddress: 'plac Zamkowy 4, Warszawa',
      latitude: '52.248',
      longitude: '21.015',
      socialHandle: '@nazwa lub https://...',
      whatsappPhone: 'np. +48512345678 lub @nazwa',
      whatsappMessage: 'Wpisz tu wiadomość WhatsApp...',
      mecardName: 'Jan Kowalski',
      address: 'ul. Kwiatowa 12, Warszawa',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Utwórz kod QR',
      download: 'Pobierz kod QR',
      reset: 'Przywróć domyślne',
      customize: 'Dostosuj wygląd (opcjonalnie)',
      chooseLogo: 'Wybierz obraz',
      showPassword: 'Pokaż hasło',
      hidePassword: 'Ukryj hasło',
      showPayload: 'Pokaż dane kodu QR',
      hidePayload: 'Ukryj dane kodu QR'
    },
    options: {
      sizeMedium: 'Ekran (512 px)',
      sizeLarge: 'Duży (1024 px)',
      sizePrint: 'Druk (2048 px)',
      sizePoster: 'Plakat (4096 px)',
      frameNone: 'Bez ramki',
      frameBannerBottom: 'Napis pod kodem',
      frameBannerTop: 'Napis nad kodem',
      frameOutline: 'Obramowanie z napisem',
      errorLow: 'L - niski (7%)',
      errorMedium: 'M - średni (15%)',
      errorQuartile: 'Q - podwyższony (25%)',
      errorHigh: 'H - wysoki (30%)',
      formatPng: 'PNG (grafika rastrowa)',
      formatSvg: 'SVG (grafika wektorowa)',
      formatPdf: 'PDF (dokument)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Brak',
      dotSquare: 'Kwadraty',
      dotRounded: 'Zaokrąglone',
      dotDots: 'Kropki',
      dotClassy: 'Eleganckie',
      dotClassyRounded: 'Eleganckie zaokrąglone',
      dotExtraRounded: 'Mocno zaokrąglone',
      cornerSquare: 'Kwadrat',
      cornerExtraRounded: 'Mocno zaokrąglony',
      cornerDot: 'Kropka',
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
      socialOther: 'Inny URL',
      socialTypePerson: 'Osoba/profil',
      socialTypeCompany: 'Firma',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Użyj iOS, jeśli nie ma adresu strony',
      appTargetAndroid: 'Użyj Androida, jeśli nie ma adresu strony'
    },
    alerts: {
      enterText: 'Wpisz tekst lub adres URL.',
      vcardRequired:
        'Wypełnij co najmniej jedno z pól: imię, nazwisko, e-mail lub numer telefonu.',
      wifiSsidRequired: 'Wpisz nazwę sieci (SSID).',
      wifiSsidLengthInvalid: 'Nazwa sieci WiFi może mieć maksymalnie 32 bajty UTF-8.',
      wifiWpaPasswordInvalid:
        'Hasło WPA/WPA2 musi mieć od 8 do 63 znaków drukowalnych lub dokładnie 64 znaki szesnastkowe.',
      wifiWepPasswordInvalid:
        'Hasło WEP musi mieć 5 lub 13 znaków drukowalnych albo 10 lub 26 znaków szesnastkowych.',
      phoneRequired: 'Wpisz numer telefonu.',
      emailRequired: 'Wypełnij co najmniej jedno pole wiadomości e-mail.',
      emailInvalid: 'Wpisz prawidłowy adres e-mail.',
      eventRequired: 'Wpisz nazwę wydarzenia i czas rozpoczęcia.',
      eventEndInvalid: 'Koniec wydarzenia nie może być wcześniej niż jego początek.',
      locationRequired: 'Wpisz adres lub obie współrzędne.',
      locationCoordinatesInvalid: 'Wpisz prawidłową szerokość i długość geograficzną.',
      socialRequired: 'Wpisz nazwę użytkownika lub URL profilu w mediach społecznościowych.',
      socialHandleInvalid: 'Wpisz prawidłową nazwę użytkownika. Dozwolone są litery, cyfry, kropki, podkreślenia i łączniki.',
      socialUrlInvalid: 'Wpisz prawidłowy URL profilu zaczynający się od http:// lub https://.',
      whatsappPhoneRequired: 'Wpisz numer WhatsApp z kierunkowym kraju lub prawidłową @nazwę użytkownika.',
      mecardRequired: 'Wypełnij co najmniej jedno z pól: imię i nazwisko, numer telefonu lub e-mail.',
      appLinkRequired: 'Wpisz adres strony albo URL aplikacji na iOS lub Androida.',
      urlInvalid: 'Wpisz prawidłowy URL zaczynający się od http:// lub https://.',
      lowContrast:
        '⚠️ Wykryto niski kontrast. Kod QR może być trudny do zeskanowania. Użyj ciemniejszego koloru kodu lub jaśniejszego tła.',
      dataEmpty: 'Dane kodu QR są puste.',
      noData: 'Nie podano danych do kodu QR.',
      libraryLoadFailed: 'Nie udało się wczytać biblioteki kodów QR. Odśwież stronę.',
      generationError: 'Błąd podczas tworzenia kodu QR',
      dataTooLong: 'Ta treść jest za długa dla wybranego poziomu korekcji błędów. Skróć ją lub wybierz niższy poziom.',
      pdfExportFailed: 'Nie udało się wyeksportować pliku PDF. Spróbuj ponownie.',
      generateFirst: 'Najpierw utwórz kod QR.',
      resetSuccess: 'Przywrócono domyślny wygląd',
      largeImageWarning:
        '⚠️ Duży plik obrazu ({{size}} MB). Dla lepszej wydajności użyj mniejszego obrazu.',
      invalidImageFile: 'Wybierz prawidłowy plik obrazu (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} znaków'
    },
    units: {
      modules: 'Moduły: {{count}}'
    },
    labels: {
      sms: 'SMS',
      phone: 'Połączenie'
    },
    warnings: {
      lowContrast:
        'Niski kontrast może utrudnić skanowanie kodu QR. Użyj ciemniejszego koloru kodu lub jaśniejszego tła.',
      transparentBackground:
        'Przy przezroczystym tle wiele zależy od podłoża. Przed publikacją przetestuj kod QR na docelowym tle.',
      quietZoneSmall:
        'Strefa ciszy jest za mała. Aby kod skanował się niezawodnie, ustaw co najmniej 4 moduły.',
      denseData:
        'Ten kod QR zawiera dużo danych jak na wybrany rozmiar. Wybierz większy rozmiar lub skróć treść.',
      logoErrorCorrection:
        'Kody z dużym logo skanują się pewniej przy wysokiej (H) korekcji błędów.',
      logoLarge:
        'Logo jest duże i może zasłaniać zbyt dużą część kodu QR. Przetestuj kod przed drukiem lub udostępnieniem.'
    },
    brand: {
      tagline: 'Twoje prywatne miejsce do tworzenia kodów QR'
    },
    trust: {
      local: 'Tworzone w przeglądarce',
      noUploads: 'Nic nie jest wysyłane',
      noTracking: 'Bez śledzenia i cookies',
      offline: 'Działa offline',
      openSource: 'Otwarty kod źródłowy',
      noExpiry: 'Nigdy nie wygasa',
      noSignup: 'Bez rejestracji'
    },
    workspace: {
      chooseType: 'Wybierz typ',
      addContent: 'Dodaj treść',
      adjustLook: 'Rozmiar i styl'
    },
    preview: {
      title: 'Podgląd',
      localBadge: 'Utworzono na tym urządzeniu'
    },
    how: {
      title: 'Jak to działa',
      step1Title: 'Wybierz',
      step1Text: 'Zdecyduj, co ma robić kod: otwierać link, łączyć z siecią WiFi, zapisywać kontakt i nie tylko.',
      step2Title: 'Uzupełnij',
      step2Text: 'Wpisz treść. Podgląd aktualizuje się na bieżąco, bezpośrednio w Twojej przeglądarce.',
      step3Title: 'Pobierz',
      step3Text: 'Zapisz kod jako PNG, SVG lub PDF. Przed drukiem lub udostępnieniem sprawdź, czy się skanuje.'
    },
    privacyInfo: {
      title: 'Prywatność w standardzie',
      intro: 'Kody QR często zawierają dane osobowe: hasło do WiFi, numer telefonu, adres domowy. QRTurbo.app działa tak, że żadna z tych informacji nigdy nie trafia na serwer.',
      localTitle: 'Zostaje na Twoim urządzeniu',
      localText: 'Kody QR i logo są tworzone przez skrypt działający w Twojej przeglądarce. Nie ma serwera, który mógłby odebrać to, co wpisujesz.',
      staticTitle: 'Bez przekierowań i daty ważności',
      staticText: 'Treść jest zakodowana bezpośrednio w kodzie QR. Skany nigdy nie przechodzą przez nasze serwery, a kod nigdy nie wygasa.',
      noTrackingTitle: 'Bez śledzenia',
      noTrackingText: 'Bez analityki, reklam, plików cookie i kont. Zapisywane są tylko wybrany język i motyw, lokalnie w Twojej przeglądarce.',
      openSourceTitle: 'Każdy może to sprawdzić',
      openSourceText: 'Pełny kod źródłowy jest publicznie dostępny na GitHubie, więc każdy może zweryfikować te zapewnienia.'
    },
    footer: {
      privacy1: 'Ten darmowy generator kodów QR działa w całości w Twojej przeglądarce.',
      privacy2: 'Żadne dane nie są zapisywane ani nigdzie wysyłane. Bez śledzenia, bez reklam, bez kombinowania.',
      privacyPolicy: 'Polityka prywatności',
      termsOfUse: 'Warunki korzystania',
      github: 'Zobacz kod źródłowy na GitHubie'
    },
    helpers: {
      quietZoneHelper:
        'Pusta przestrzeń wokół kodu QR (minimum 4 moduły dla niezawodnego skanowania)',
      socialHandleHelper:
        'Wpisz nazwę użytkownika, np. @nazwa, lub wklej pełny adres profilu zaczynający się od https://.'
    },
    frame: {
      defaultText: 'ZESKANUJ'
    },
    misc: {
      qrPlaceholder: 'Tu pojawi się kod QR',
      socialPreview: 'Kod QR prowadzi do',
      wifiPayloadHidden: 'Konfiguracja WiFi — hasło ukryte'
    }
  };
})();
