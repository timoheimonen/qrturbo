// Page content for the pre-rendered Hungarian pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR-kód linkhez és szöveghez',
    title: 'Ingyenes QR-kód generátor, lejárat nélkül | QRTurbo.app',
    description:
      'Készíts ingyenes QR-kódot linkhez, WiFi-hez, vCardhoz és sok máshoz. Regisztráció és követés nélkül: a kód a böngésződben készül, és soha nem jár le.',
    eyebrow: 'Ingyenes QR-kód generátor',
    display: 'Ingyenes QR-kódok, amelyek örökre működnek.',
    lead:
      'Készíts QR-kódot linkhez, WiFi-hez, névjegyhez és sok máshoz, közvetlenül a böngésződben. Nincs regisztráció, próbaidő vagy átirányítás: a tartalom egyenesen a kódba kerül, így az örökre működik. Adj hozzá logót, színeket és „Olvass be” keretet.'
  },
  types: {
    wifi: {
      name: 'WiFi QR-kód',
      title: 'WiFi QR-kód generátor – ingyenes és biztonságos | QRTurbo.app',
      description:
        'Készíts ingyenes WiFi QR-kódot, hogy a vendégek egy beolvasással csatlakozhassanak. A jelszó a böngésződben marad. Regisztráció és követés nélkül, nem jár le.',
      eyebrow: 'WiFi QR-kód generátor',
      display: 'Egy beolvasás, és a vendégek már a WiFi-n vannak.',
      lead:
        'Add meg a hálózat nevét és jelszavát, és kész is a WiFi QR-kód. A jelszó soha nem hagyja el az eszközödet, a kód pedig addig működik, amíg a hálózat beállításai nem változnak.',
      aboutTitle: 'Hogyan működik a WiFi QR-kód?',
      about: [
        'A WiFi QR-kód szabványos formátumban tartalmazza a hálózat nevét (SSID), a titkosítás típusát és a jelszót, amelyet az iPhone és az Android kameraalkalmazása is felismer. Beolvasáskor a telefon felajánlja a csatlakozást, így senkinek sem kell hosszú jelszót begépelnie.',
        'Nyomtasd ki a kódot otthonra, az irodába, a kávézóba vagy a kiadó apartmanba, és tedd a vendégek számára jól látható helyre. Ha megváltoztatod a jelszót vagy a hálózat nevét, készíts új kódot.',
        'Sok online generátor elküldi a jelszavadat a saját szervereire. A QRTurbo.app a böngésződben készíti el a kódot, így a jelszavadat soha nem tölti fel és nem tárolja sehol.'
      ]
    },
    vcard: {
      name: 'vCard QR-kód',
      title: 'Ingyenes vCard QR-kód generátor névjegykártyára | QRTurbo.app',
      description:
        'Készíts ingyenes vCard QR-kódot a névjegykártyádra. Egy beolvasással neved, telefonszámod, e-mail-címed és címed a névjegyek közé kerül. Soha nem jár le.',
      eyebrow: 'vCard QR-kód generátor',
      display: 'Oszd meg az elérhetőségeidet egyetlen beolvasással.',
      lead:
        'Add meg a neved, telefonszámod, e-mail-címed és címed, és készíts vCard QR-kódot névjegykártyára, kitűzőre vagy e-mail-aláírásba. Az adatok magában a kódban vannak, nem egy szerveren.',
      aboutTitle: 'Hogyan működik a vCard QR-kód?',
      about: [
        'A vCard QR-kód egy digitális névjegykártyát tartalmaz vCard formátumban. Beolvasáskor a telefon felajánlja, hogy új névjegyként mentse az adatokat, így semmit sem kell kézzel begépelni.',
        'Csak azokat a mezőket töltsd ki, amelyeket meg szeretnél osztani. Minél több adatot adsz meg, annál sűrűbb lesz a kód, ezért legalább 2,5 cm szélesre nyomtasd, és teszteld, mielőtt nagyobb tétel névjegykártyát rendelsz.',
        'Mivel az adatok közvetlenül a kódban vannak, később nem módosíthatók. Ha megváltozik a telefonszámod vagy a beosztásod, a következő nyomtatáshoz készíts új kódot.'
      ]
    },
    sms: {
      name: 'QR-kód SMS-hez és híváshoz',
      title: 'Ingyenes QR-kód generátor SMS-hez és híváshoz | QRTurbo.app',
      description:
        'Készíts ingyenes QR-kódot, amely SMS-t nyit meg vagy hívást indít, akár előre megírt üzenettel. A böngésződben készül, regisztráció nélkül, és nem jár le.',
      eyebrow: 'QR-kód generátor SMS-hez és híváshoz',
      display: 'SMS vagy telefonhívás egyetlen beolvasással.',
      lead:
        'Készíts QR-kódot, amely előre kitöltött SMS-t nyit meg, vagy felhív egy telefonszámot. Remekül használható ügyfélszolgálathoz, foglaláshoz, nyereményjátékokhoz és szervizmatricákon.',
      aboutTitle: 'Hogyan működik a QR-kód SMS-hez és híváshoz?',
      about: [
        'Az SMS-es QR-kód megnyitja az üzenetküldő alkalmazást, amelyben már ki van töltve a telefonszám és az üzenet, így a beolvasónak csak a Küldés gombot kell megnyomnia. A telefonos QR-kód a tárcsázót nyitja meg, a szám pedig készen áll a hívásra.',
        'A számot mindig nemzetközi formátumban add meg, például +36 20 123 4567, hogy a kód külföldi SIM-kártyás telefonokon is működjön.',
        'A telefon soha nem küldi el magától az üzenetet, és nem indít automatikusan hívást. A beolvasónak mindig előbb jóvá kell hagynia.'
      ]
    },
    email: {
      name: 'E-mail QR-kód',
      title: 'Ingyenes e-mail QR-kód generátor kész üzenettel | QRTurbo.app',
      description:
        'Készíts ingyenes e-mail QR-kódot, amely új levelet nyit meg kitöltött címzettel, tárggyal és szöveggel. Regisztráció és követés nélkül, soha nem jár le.',
      eyebrow: 'E-mail QR-kód generátor',
      display: 'Küldésre kész e-mail egyetlen beolvasással.',
      lead:
        'Add meg a címzettet, a tárgyat és az üzenetet, és készíts e-mail QR-kódot visszajelzésekhez, ügyfélszolgálati kérésekhez, rendelésekhez és jelentkezésekhez.',
      aboutTitle: 'Hogyan működik az e-mail QR-kód?',
      about: [
        'Az e-mail QR-kód egy mailto linket tartalmaz. Beolvasáskor megnyílik a levelezőalkalmazás kitöltött címzettel, tárggyal és üzenettel, a beolvasó pedig eldönti, hogy elküldi-e.',
        'Az előre megírt üzenet legyen rövid. A hosszú szöveg sűrűbbé teszi a kódot, így távolról nehezebb beolvasni.',
        'Adj meg egyértelmű tárgyat, például „Visszajelzés: 12-es asztal”, hogy könnyen szét tudd válogatni a beérkező üzeneteket.'
      ]
    },
    event: {
      name: 'Naptáresemény QR-kód',
      title: 'Ingyenes QR-kód generátor naptáreseményekhez | QRTurbo.app',
      description:
        'Készíts ingyenes naptáresemény QR-kódot. Egy beolvasással az esemény neve, időpontja, helyszíne és részletei a naptárba kerülnek. Soha nem jár le.',
      eyebrow: 'Naptáresemény QR-kód generátor',
      display: 'Egy beolvasás, és az eseményed már a naptárukban van.',
      lead:
        'Add meg az esemény nevét, időpontját és helyszínét, és készíts QR-kódot meghívókra, plakátokra, jegyekre és tárgyalókba.',
      aboutTitle: 'Hogyan működik az esemény QR-kód?',
      about: [
        'Az esemény QR-kód iCalendar formátumú naptárbejegyzést tartalmaz. Beolvasás után az esemény a helyes dátummal, időponttal és helyszínnel vehető fel a naptárba.',
        'A naptáras QR-kódok támogatása telefononként és olvasóalkalmazásonként eltér. Mielőtt kinyomtatod a meghívókat, próbáld ki a kódot iPhone-on és androidos telefonon is.',
        'Töltsd ki a helyszín mezőt, hogy a vendégek közvetlenül a naptárukból megtalálják a címet.'
      ]
    },
    location: {
      name: 'Helyszín QR-kód',
      title: 'Ingyenes helyszín QR-kód generátor térképhez | QRTurbo.app',
      description:
        'Készíts ingyenes helyszín QR-kódot, amely címet vagy koordinátákat nyit meg a térképen. Ideális meghívókra és táblákra. Regisztráció nélkül, nem jár le.',
      eyebrow: 'Helyszín QR-kód generátor',
      display: 'Mutasd meg az utat egyetlen beolvasással.',
      lead:
        'Adj meg egy címet vagy koordinátákat, és készíts QR-kódot, amely térképalkalmazásban nyitja meg a helyszínt. Használd meghívókon, szórólapokon, táblákon és kiszállítási útmutatókban.',
      aboutTitle: 'Hogyan működik a helyszín QR-kód?',
      about: [
        'Címből olyan QR-kód készül, amely egy Google Maps-keresésre mutató linket tartalmaz; ez bármilyen telefonon megnyílik böngészőben vagy térképalkalmazásban. Koordinátákból geo link készül, amely közvetlenül a telefon alapértelmezett térképalkalmazásában nyílik meg.',
        'Utcacím nélküli helyekhez a koordináták a legpontosabbak, például egy hétvégi házhoz, egy túraútvonal kiindulópontjához vagy egy rendezvényterület bejáratához.',
        'Próbáld ki a kódot a saját telefonodon, hogy biztosan pontosan a jó helyre mutasson.'
      ]
    },
    social: {
      name: 'Közösségi média QR-kód',
      title: 'Ingyenes közösségi média QR-kód generátor | QRTurbo.app',
      description:
        'Készíts ingyenes QR-kódot Instagram-, TikTok-, YouTube-, LinkedIn- vagy más profilodhoz. Csak írd be a felhasználóneved. Követés nélkül, soha nem jár le.',
      eyebrow: 'Közösségi média QR-kód generátor',
      display: 'Az offline látogatókból is lehetnek követőid.',
      lead:
        'Válassz platformot, add meg a felhasználóneved, és kész a QR-kód, amely a profilodat nyitja meg. Támogatott platformok: Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky és még sok más.',
      aboutTitle: 'Hogyan működik a közösségi média QR-kód?',
      about: [
        'A közösségi média QR-kód a profilodra mutató linket tartalmaz. Beolvasáskor a profil az alkalmazásban nyílik meg, ha telepítve van, egyébként a böngészőben.',
        'Írd be a felhasználóneved, és a QRTurbo.app összeállítja a kiválasztott platformhoz tartozó helyes profilcímet. Teljes profil-URL-t is beilleszthetsz.',
        'Tedd a kódot csomagolásra, névjegykártyára, plakátra vagy rendezvénystandra. Adj hozzá keretet egy rövid felhívással, például „Kövess minket”, hogy mindenki tudja, mire számíthat.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR-kód',
      title: 'Ingyenes WhatsApp QR-kód generátor csevegéshez | QRTurbo.app',
      description:
        'Készíts ingyenes WhatsApp QR-kódot, amely csevegést nyit a számoddal és egy előre megírt üzenettel. A böngésződben készül. Regisztráció nélkül, nem jár le.',
      eyebrow: 'WhatsApp QR-kód generátor',
      display: 'WhatsApp-csevegés egyetlen beolvasással.',
      lead:
        'Add meg a telefonszámodat vagy WhatsApp-felhasználónevedet, és ha szeretnéd, egy üzenetet is. Az ügyfelek úgy írhatnak neked, hogy előbb el sem kell menteniük a számodat.',
      aboutTitle: 'Hogyan működik a WhatsApp QR-kód?',
      about: [
        'A WhatsApp QR-kód egy wa.me linket tartalmaz. Beolvasáskor megnyílik egy csevegés veled, az előre megírt üzenet pedig már küldésre készen áll.',
        'A számot nemzetközi formátumban, országkóddal add meg, például +36 20 123 4567. A szóközöket és a kötőjeleket automatikusan eltávolítjuk.',
        'A kód magát a wa.me linket tartalmazza, nem átirányítást, így addig működik, amíg a számhoz WhatsApp-fiók tartozik.'
      ]
    },
    app: {
      name: 'QR-kód alkalmazás letöltéséhez',
      title: 'Ingyenes App Store és Google Play QR-kód generátor | QRTurbo.app',
      description:
        'Készíts ingyenes QR-kódot az alkalmazásod letöltési oldalához, App Store- vagy Google Play-linkjéhez. A böngésződben készül. Nincs átirányítás, nem jár le.',
      eyebrow: 'QR-kód generátor app letöltéséhez',
      display: 'Vezesd a felhasználókat egyenesen az alkalmazásodhoz.',
      lead:
        'Add meg az alkalmazásod weboldalát, App Store- és Google Play-linkjét, és készíts QR-kódot az app letöltéséhez.',
      aboutTitle: 'Hogyan működik az app letöltési QR-kód?',
      about: [
        'Egy QR-kód egyetlen linket tartalmaz, és a QRTurbo.app soha nem tesz elé átirányítást. Ha van olyan weboldalad, amely az iPhone-felhasználókat az App Store-ba, az androidosokat pedig a Google Playre küldi, azt add meg webes URL-ként, így minden telefonon a legjobb eredményt kapod.',
        'Ha nincs ilyen oldalad, válaszd ki, melyik áruház linkjét nyissa meg a kód, vagy nyomtass külön kódot az App Store-hoz és a Google Playhez.',
        'Ellenőrizd, hogy az áruházlinkek nyilvánosak, és nem tartalmaznak olyan követési paramétereket, amelyeket nem szeretnél megosztani.'
      ]
    }
  },
  comparison: {
    title: 'Ingyenes QR-kódok, amelyek örökre működnek',
    intro:
      'Sok „ingyenes” QR-kód generátor dinamikus kódot készít, amely a saját átirányító szerverére mutat. A próbaidő lejártával a kódot kikapcsolják, gyakran azután, hogy már rákerült az étlapokra, a névjegykártyákra vagy a csomagolásra. A QRTurbo.app másképp működik.',
    headers: {
      feature: 'Kérdés',
      dynamic: 'Tipikus „ingyenes próbaidős” QR-kód',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Hol tárolódik a tartalom?',
        dynamic: 'A szolgáltató szerverén, egy rövid átirányító link mögött',
        qrturbo: 'Magában a QR-kódban'
      },
      {
        feature: 'Mi történik a próbaidő végén?',
        dynamic: 'A kódot kikapcsolják, amíg nem fizetsz',
        qrturbo: 'Semmi. Nincs próbaidő, a kód tovább működik'
      },
      {
        feature: 'Kell hozzá fiók?',
        dynamic: 'Általában igen',
        qrturbo: 'Nem'
      },
      {
        feature: 'Ki látja a beolvasásokat?',
        dynamic: 'Minden beolvasás a szolgáltatón keresztül fut',
        qrturbo: 'Senki. A beolvasások soha nem jutnak el hozzánk'
      },
      {
        feature: 'Mennyibe kerül?',
        dynamic: 'Havi vagy éves előfizetésbe',
        qrturbo: 'Semmibe, üzleti használatra sem'
      }
    ],
    note:
      'Egyetlen kompromisszum van: a statikus QR-kód nyomtatás után nem szerkeszthető. Ha később módosítanod kellhet a célcímet, olyan oldalra készítsd a kódot, amelyet te kezelsz, és inkább azt az oldalt frissítsd.'
  },
  faq: {
    title: 'Gyakori kérdések',
    items: [
      {
        q: 'Lejárnak a QRTurbo.app által készített QR-kódok?',
        a: 'Nem. A QRTurbo.app statikus QR-kódokat készít: a link, a szöveg vagy az elérhetőségek közvetlenül a kódba kerülnek. Nincs köztes szerver, így nincs semmi, ami lejárhatna, vagy amit ki lehetne kapcsolni. A kód addig működik, amíg a tartalma érvényes, például amíg létezik a weboldal, amelyre mutat.'
      },
      {
        q: 'Miért nem működik már a máshol készített QR-kódom?',
        a: 'Sok generátor alapértelmezetten dinamikus QR-kódot készít. Ez egy rövid linket tartalmaz a szolgáltató szerverére, amely minden beolvasást továbbirányít a valódi címre. Amikor az ingyenes próbaidő vagy az előfizetés lejár, a szolgáltató kikapcsolja az átirányítást, és a kinyomtatott kód többé nem működik. A QRTurbo.app kódjai a valódi tartalmat hordozzák, és soha nem függenek tőlünk.'
      },
      {
        q: 'Tényleg ingyenes a QRTurbo.app? Használhatom a kódokat üzleti célra?',
        a: 'Igen. Nincs regisztráció, próbaidő, vízjel és beolvasási korlát. Az elkészített QR-kódokat magáncélra és üzleti célra is felhasználhatod, például névjegykártyán, étlapon, csomagoláson és hirdetésekben.'
      },
      {
        q: 'Módosíthatom a QR-kódot nyomtatás után?',
        a: 'Nem. A statikus QR-kód nem szerkeszthető, mert a tartalom maga a mintázat része. Ha számítasz rá, hogy a célcím változhat, olyan címre készítsd a kódot, amelyet te kezelsz, például a saját weboldalad egyik aloldalára, és inkább azt az oldalt frissítsd.'
      },
      {
        q: 'Mekkorára nyomtassam a QR-kódot?',
        a: 'Legalább 2 × 2 cm-esre. Ökölszabály: a kód legyen legalább akkora, mint a beolvasási távolság tizede, vagyis egy 2 méterről olvasott plakátra nagyjából 20 cm-es kód kell. Nyomtatáshoz tölts le SVG-t vagy nagy méretű PNG-t, és hagyd üresen a kód körüli csendes zónát.'
      },
      {
        q: 'Miért nem olvasható be a QR-kódom?',
        a: 'A leggyakoribb okok: túl kicsi a kontraszt a kód és a háttér között, túl keskeny a csendes zóna, a logó túl nagy részt takar el a kódból, vagy túl sok a tartalom a nyomtatott mérethez képest. A QRTurbo.app figyelmeztet ezekre a kockázatokra. Nyomtatás előtt mindig teszteld a kódot néhány különböző telefonnal.'
      },
      {
        q: 'Biztonságban vannak az adataim? Láthatjátok a WiFi-jelszavamat?',
        a: 'Az adataid az eszközödön maradnak. A QR-kódot a böngésződben futó kód állítja elő, és semmi, amit beírsz vagy feltöltesz, nem jut el szerverre, így senki sem láthatja a WiFi-jelszavadat vagy az elérhetőségeidet. Az első látogatás után a generátor offline is működik.'
      }
    ]
  },
  typeLinks: {
    title: 'Ingyenes QR-kód generátorok'
  }
};
