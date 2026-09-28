// Page content for the pre-rendered Polish pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'Kod QR do linku i tekstu',
    title: 'Darmowy generator kodów QR, które nie wygasają | QRTurbo.app',
    description:
      'Twórz kody QR za darmo: do linków, WiFi, wizytówek vCard i nie tylko. Bez rejestracji i śledzenia. Kody powstają w przeglądarce i działają bez końca.',
    eyebrow: 'Darmowy generator kodów QR',
    display: 'Darmowe kody QR, które nigdy nie przestają działać.',
    lead:
      'Twórz kody QR do linków, sieci WiFi, kontaktów i nie tylko – bezpośrednio w przeglądarce. Bez rejestracji, bez okresu próbnego, bez przekierowań: treść trafia prosto do kodu, więc działa on zawsze. Dodaj logo, kolory i ramkę „Zeskanuj”.'
  },
  types: {
    wifi: {
      name: 'Kod QR do WiFi',
      title: 'Kod QR do WiFi za darmo – bezpieczny generator | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR do WiFi – goście połączą się z siecią jednym skanem. Hasło zostaje w przeglądarce. Bez rejestracji i śledzenia, nie wygasa.',
      eyebrow: 'Generator kodów QR do WiFi',
      display: 'Goście łączą się z Twoim WiFi jednym skanem.',
      lead:
        'Wpisz nazwę sieci i hasło, aby utworzyć kod QR do WiFi. Hasło nigdy nie opuszcza Twojego urządzenia, a kod działa, dopóki nie zmienisz ustawień sieci.',
      aboutTitle: 'Jak działają kody QR do WiFi',
      about: [
        'Kod QR do WiFi zawiera nazwę sieci (SSID), typ zabezpieczeń i hasło w standardowym formacie, który rozumieją aplikacje aparatu na iPhonie i Androidzie. Po zeskanowaniu telefon proponuje połączenie z siecią, więc nikt nie musi przepisywać długiego hasła.',
        'Wydrukuj kod do domu, biura, kawiarni lub mieszkania na wynajem i umieść go w miejscu widocznym dla gości. Jeśli zmienisz hasło lub nazwę sieci, utwórz nowy kod.',
        'Wiele generatorów online wysyła Twoje hasło na swoje serwery. QRTurbo.app tworzy kod w Twojej przeglądarce, więc hasło nigdy nie jest nigdzie przesyłane ani zapisywane.'
      ]
    },
    vcard: {
      name: 'Kod QR z wizytówką vCard',
      title: 'Kod QR vCard na wizytówkę – generator za darmo | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR vCard na wizytówkę. Jeden skan zapisuje imię, telefon, e-mail i adres w kontaktach. Bez rejestracji, kod nigdy nie wygasa.',
      eyebrow: 'Generator kodów QR vCard',
      display: 'Udostępnij swoje dane kontaktowe jednym skanem.',
      lead:
        'Wpisz imię i nazwisko, numer telefonu, e-mail i adres, aby utworzyć kod QR vCard na wizytówki, identyfikatory i do stopki e-mail. Dane są zapisane w samym kodzie, a nie na serwerze.',
      aboutTitle: 'Jak działają kody QR vCard',
      about: [
        'Kod QR vCard zawiera cyfrową wizytówkę w formacie vCard. Po zeskanowaniu telefon proponuje zapisanie danych jako nowego kontaktu, więc niczego nie trzeba przepisywać ręcznie.',
        'Wypełnij tylko te pola, które chcesz udostępnić. Im więcej danych, tym gęstszy kod, dlatego drukuj go w szerokości co najmniej 2,5 cm i przetestuj, zanim zamówisz duży nakład wizytówek.',
        'Dane są zakodowane bezpośrednio w kodzie, więc nie można ich później zmienić. Jeśli zmieni się Twój numer telefonu lub stanowisko, utwórz nowy kod przed kolejnym drukiem.'
      ]
    },
    sms: {
      name: 'Kod QR do SMS-a i połączenia',
      title: 'Kod QR do SMS-a i połączenia – generator za darmo | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR, który otwiera SMS-a lub rozpoczyna połączenie. Dodaj gotową treść wiadomości. Działa w przeglądarce, bez rejestracji, nie wygasa.',
      eyebrow: 'Generator kodów QR do SMS-ów i połączeń',
      display: 'SMS lub połączenie telefoniczne jednym skanem.',
      lead:
        'Utwórz kod QR, który otwiera gotową wiadomość SMS lub wybiera numer telefonu. Sprawdzi się w obsłudze klienta, przy rezerwacjach, w konkursach i na naklejkach serwisowych.',
      aboutTitle: 'Jak działają kody QR do SMS-ów i połączeń',
      about: [
        'Kod QR do SMS-a otwiera aplikację do wiadomości z wpisanym już numerem i treścią, więc osoba skanująca musi tylko nacisnąć „Wyślij”. Kod QR do połączenia otwiera aplikację telefonu z numerem gotowym do wybrania.',
        'Zawsze wpisuj numer w formacie międzynarodowym, np. +48 512 345 678, aby kod działał także na telefonach z zagranicznymi kartami SIM.',
        'Telefon nigdy nie wysyła wiadomości ani nie dzwoni automatycznie. Osoba skanująca zawsze najpierw to potwierdza.'
      ]
    },
    email: {
      name: 'Kod QR do e-maila',
      title: 'Kod QR do e-maila z gotową wiadomością – za darmo | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR do e-maila, który otwiera nową wiadomość z wpisanym odbiorcą, tematem i treścią. Bez rejestracji i śledzenia, nigdy nie wygasa.',
      eyebrow: 'Generator kodów QR do e-maili',
      display: 'Gotowy do wysłania e-mail po jednym skanie.',
      lead:
        'Wpisz odbiorcę, temat i treść, aby utworzyć kod QR do e-maila – do zbierania opinii, zgłoszeń do pomocy technicznej, zamówień i zapisów.',
      aboutTitle: 'Jak działają kody QR do e-maili',
      about: [
        'Kod QR do e-maila zawiera link mailto. Po zeskanowaniu otwiera się aplikacja pocztowa z wpisanym już odbiorcą, tematem i treścią, a osoba skanująca decyduje, czy wysłać wiadomość.',
        'Gotowa treść powinna być krótka. Długi tekst sprawia, że kod jest gęstszy i trudniej go zeskanować z daleka.',
        'Użyj jasnego tematu, np. „Opinia: stolik 12”, aby łatwo posortować otrzymane wiadomości.'
      ]
    },
    event: {
      name: 'Kod QR z wydarzeniem w kalendarzu',
      title: 'Kod QR do wydarzenia w kalendarzu – za darmo | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR z wydarzeniem. Jeden skan dodaje nazwę, termin, miejsce i szczegóły do kalendarza. Działa w przeglądarce, nigdy nie wygasa.',
      eyebrow: 'Generator kodów QR do wydarzeń',
      display: 'Jeden skan i wydarzenie jest w kalendarzu.',
      lead:
        'Wpisz nazwę, termin i miejsce wydarzenia, aby utworzyć kod QR na zaproszenia, plakaty, bilety i do sal konferencyjnych.',
      aboutTitle: 'Jak działają kody QR z wydarzeniami',
      about: [
        'Kod QR z wydarzeniem zawiera wpis kalendarza w formacie iCalendar. Po zeskanowaniu można dodać wydarzenie do kalendarza z właściwą datą, godziną i miejscem.',
        'Obsługa kodów QR z wydarzeniami zależy od telefonu i aplikacji do skanowania. Zanim wydrukujesz zaproszenia, przetestuj kod na iPhonie i na telefonie z Androidem.',
        'Wypełnij pole „Miejsce”, aby goście mogli znaleźć adres bezpośrednio w kalendarzu.'
      ]
    },
    location: {
      name: 'Kod QR z lokalizacją',
      title: 'Kod QR z lokalizacją na mapie – generator za darmo | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR z lokalizacją, który otwiera adres lub współrzędne w aplikacji z mapami. Idealny na zaproszenia i tablice. Bez rejestracji, nie wygasa.',
      eyebrow: 'Generator kodów QR z lokalizacją',
      display: 'Wskaż drogę jednym skanem.',
      lead:
        'Wpisz adres lub współrzędne, aby utworzyć kod QR, który otwiera lokalizację w aplikacji z mapami. Użyj go na zaproszeniach, ulotkach, tablicach i we wskazówkach dla kurierów.',
      aboutTitle: 'Jak działają kody QR z lokalizacją',
      about: [
        'Z adresu powstaje kod QR z linkiem wyszukiwania w Mapach Google, który na każdym telefonie otwiera się w przeglądarce lub aplikacji z mapami. Ze współrzędnych powstaje link geo, który otwiera się bezpośrednio w domyślnej aplikacji z mapami w telefonie.',
        'Współrzędne to najdokładniejszy wybór w przypadku miejsc bez adresu, takich jak domek letniskowy, początek szlaku czy wjazd na teren imprezy.',
        'Przetestuj kod na własnym telefonie, aby upewnić się, że wskazuje dokładnie właściwe miejsce.'
      ]
    },
    social: {
      name: 'Kod QR do mediów społecznościowych',
      title: 'Darmowy kod QR do mediów społecznościowych | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR do swojego profilu: Instagram, TikTok, YouTube, LinkedIn i inne. Wystarczy nazwa użytkownika. Bez rejestracji, nie wygasa.',
      eyebrow: 'Generator kodów QR do social mediów',
      display: 'Zamień odwiedzających w obserwujących.',
      lead:
        'Wybierz platformę i wpisz nazwę użytkownika, aby utworzyć kod QR, który otwiera Twój profil. Obsługiwane są m.in. Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads i Bluesky.',
      aboutTitle: 'Jak działają kody QR do mediów społecznościowych',
      about: [
        'Kod QR do mediów społecznościowych zawiera link do Twojego profilu. Po zeskanowaniu profil otwiera się w aplikacji, jeśli jest zainstalowana, albo w przeglądarce.',
        'Wpisz nazwę użytkownika, a QRTurbo.app utworzy prawidłowy adres profilu dla wybranej platformy. Możesz też wkleić pełny URL profilu.',
        'Umieść kod na opakowaniach, wizytówkach, plakatach i stoiskach targowych. Dodaj ramkę z krótkim wezwaniem do działania, np. „Obserwuj nas”, aby ludzie wiedzieli, czego się spodziewać.'
      ]
    },
    whatsapp: {
      name: 'Kod QR do czatu WhatsApp',
      title: 'Darmowy generator kodów QR do czatu WhatsApp | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR WhatsApp, który otwiera czat z Twoim numerem i gotową wiadomością. Działa w przeglądarce. Bez rejestracji, nigdy nie wygasa.',
      eyebrow: 'Generator kodów QR WhatsApp',
      display: 'Czat WhatsApp po jednym skanie.',
      lead:
        'Wpisz numer telefonu lub nazwę użytkownika WhatsApp i opcjonalną wiadomość. Klienci skontaktują się z Tobą bez zapisywania Twojego numeru.',
      aboutTitle: 'Jak działają kody QR WhatsApp',
      about: [
        'Kod QR WhatsApp zawiera link wa.me. Po zeskanowaniu otwiera się czat z Tobą, a gotowa wiadomość czeka na wysłanie.',
        'Wpisz numer w formacie międzynarodowym z kierunkowym kraju, np. +48 512 345 678. Spacje i myślniki są usuwane automatycznie.',
        'Kod zawiera sam link wa.me, a nie przekierowanie, więc działa tak długo, jak długo numer jest zarejestrowany w WhatsApp.'
      ]
    },
    app: {
      name: 'Kod QR do pobrania aplikacji',
      title: 'Kod QR do App Store i Google Play – za darmo | QRTurbo.app',
      description:
        'Utwórz darmowy kod QR do strony pobierania aplikacji w App Store lub Google Play. Działa w przeglądarce. Bez rejestracji i przekierowań, nie wygasa.',
      eyebrow: 'Generator kodów QR do pobierania aplikacji',
      display: 'Kieruj ludzi prosto do swojej aplikacji.',
      lead:
        'Dodaj stronę internetową aplikacji oraz linki do App Store i Google Play, aby utworzyć kod QR do pobierania aplikacji.',
      aboutTitle: 'Jak działają kody QR do pobierania aplikacji',
      about: [
        'Kod QR zawiera jeden link, a QRTurbo.app nigdy nie dodaje przekierowań. Jeśli masz stronę, która kieruje użytkowników iPhone’a do App Store, a użytkowników Androida do Google Play, podaj ją jako adres strony – to najlepsze rozwiązanie dla każdego telefonu.',
        'Jeśli nie masz takiej strony, wybierz, który sklep ma otwierać kod, albo wydrukuj osobne kody dla App Store i Google Play.',
        'Sprawdź, czy linki do sklepów są publiczne i nie zawierają parametrów śledzących, których nie chcesz udostępniać.'
      ]
    }
  },
  comparison: {
    title: 'Darmowe kody QR, które nigdy nie przestają działać',
    intro:
      'Wiele „darmowych” generatorów kodów QR tworzy kody dynamiczne, które prowadzą przez ich własny serwer przekierowań. Gdy kończy się okres próbny, kod zostaje wyłączony – często wtedy, gdy jest już wydrukowany w menu, na wizytówkach czy opakowaniach. QRTurbo.app działa inaczej.',
    headers: {
      feature: 'Pytanie',
      dynamic: 'Typowy kod QR z „darmowym okresem próbnym”',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Gdzie jest przechowywana Twoja treść?',
        dynamic: 'Na serwerze dostawcy, za krótkim linkiem przekierowującym',
        qrturbo: 'W samym kodzie QR'
      },
      {
        feature: 'Co się dzieje po zakończeniu okresu próbnego?',
        dynamic: 'Kod zostaje dezaktywowany, dopóki nie zapłacisz',
        qrturbo: 'Nic. Nie ma okresu próbnego, a kod działa dalej'
      },
      {
        feature: 'Czy potrzebujesz konta?',
        dynamic: 'Zwykle tak',
        qrturbo: 'Nie'
      },
      {
        feature: 'Kto widzi Twoje skany?',
        dynamic: 'Każdy skan przechodzi przez serwer dostawcy',
        qrturbo: 'Nikt. Skany nigdy do nas nie docierają'
      },
      {
        feature: 'Ile to kosztuje?',
        dynamic: 'Miesięczny lub roczny abonament',
        qrturbo: 'Nic, także przy użyciu komercyjnym'
      }
    ],
    note:
      'Jedyny kompromis: statycznego kodu QR nie da się edytować po wydrukowaniu. Jeśli cel może się później zmienić, utwórz kod prowadzący do strony, którą sam zarządzasz, i w razie potrzeby aktualizuj tę stronę.'
  },
  faq: {
    title: 'Najczęściej zadawane pytania',
    items: [
      {
        q: 'Czy kody QR z QRTurbo.app wygasają?',
        a: 'Nie. QRTurbo.app tworzy statyczne kody QR: Twój link, tekst lub dane kontaktowe są zakodowane bezpośrednio w kodzie. Nie ma pośredniczącego serwera, więc nic nie może wygasnąć ani zostać wyłączone. Kod działa tak długo, jak długo jego treść jest aktualna – na przykład dopóki istnieje strona, do której prowadzi.'
      },
      {
        q: 'Dlaczego mój kod QR z innej strony przestał działać?',
        a: 'Wiele generatorów domyślnie tworzy dynamiczne kody QR. Zawierają one krótki link do serwera dostawcy, który przekierowuje każdy skan na Twój właściwy adres. Gdy kończy się darmowy okres próbny lub abonament, dostawca wyłącza przekierowanie, a wydrukowany kod przestaje działać. Kody z QRTurbo.app zawierają Twoją prawdziwą treść i nigdy nie zależą od nas.'
      },
      {
        q: 'Czy QRTurbo.app jest naprawdę za darmo? Czy mogę używać kodów komercyjnie?',
        a: 'Tak. Bez rejestracji, bez okresu próbnego, bez znaku wodnego i bez limitu skanów. Utworzone kody QR możesz wykorzystywać zarówno prywatnie, jak i komercyjnie, np. na wizytówkach, w menu, na opakowaniach i w reklamach.'
      },
      {
        q: 'Czy mogę zmienić kod QR po wydrukowaniu?',
        a: 'Nie. Statycznego kodu QR nie da się edytować, ponieważ treść jest częścią jego wzoru. Jeśli spodziewasz się zmiany celu, utwórz kod prowadzący do adresu, którym sam zarządzasz, np. podstrony własnej witryny, i w razie potrzeby aktualizuj tę stronę.'
      },
      {
        q: 'Jak duży powinien być wydrukowany kod QR?',
        a: 'Drukuj go w rozmiarze co najmniej 2 × 2 cm. Praktyczna zasada: bok kodu powinien mieć co najmniej jedną dziesiątą odległości, z której będzie skanowany – plakat czytany z 2 metrów potrzebuje kodu o boku ok. 20 cm. Do druku pobierz plik SVG lub duży PNG i zostaw pustą strefę ciszy wokół kodu.'
      },
      {
        q: 'Dlaczego mój kod QR się nie skanuje?',
        a: 'Najczęstsze przyczyny to zbyt niski kontrast między kodem a tłem, za mała strefa ciszy, logo zasłaniające zbyt dużą część kodu lub zbyt dużo treści jak na rozmiar wydruku. QRTurbo.app ostrzega przed tymi problemami. Przed drukiem zawsze przetestuj kod na kilku różnych telefonach.'
      },
      {
        q: 'Czy moje dane są bezpieczne? Czy widzicie moje hasło do WiFi?',
        a: 'Twoje dane zostają na Twoim urządzeniu. Kod QR jest generowany przez skrypt działający w Twojej przeglądarce, a nic, co wpiszesz lub prześlesz, nie trafia na serwer – nikt więc nie zobaczy Twojego hasła do WiFi ani danych kontaktowych. Po pierwszej wizycie generator działa także offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Darmowe generatory kodów QR'
  }
};
