// Page content for the pre-rendered Czech pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR kód pro odkaz a text',
    title: 'Generátor QR kódů zdarma – kódy, které nevyprší | QRTurbo.app',
    description:
      'Vytvoř si QR kód zdarma pro odkaz, WiFi, vizitku vCard a další. Bez registrace a sledování. Kódy vznikají v prohlížeči a fungují navždy.',
    eyebrow: 'Generátor QR kódů zdarma',
    display: 'QR kódy zdarma, které nikdy nepřestanou fungovat.',
    lead:
      'Vytvoř QR kód pro odkaz, WiFi, kontakt a další přímo v prohlížeči. Bez registrace, bez zkušební verze, bez přesměrování: obsah se uloží přímo do kódu, takže bude fungovat navždy. Přidej logo, barvy a rámeček „Naskenuj mě“.'
  },
  types: {
    wifi: {
      name: 'QR kód pro WiFi',
      title: 'QR kód pro WiFi zdarma – bezpečný generátor | QRTurbo.app',
      description:
        'Vytvoř QR kód pro WiFi zdarma – hosté se k síti připojí jedním naskenováním. Heslo zůstane v prohlížeči. Bez registrace a sledování, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro WiFi',
      display: 'Hosté se k tvé WiFi připojí jedním naskenováním.',
      lead:
        'Zadej název sítě a heslo a vytvoř QR kód pro WiFi. Heslo nikdy neopustí tvoje zařízení a kód funguje, dokud nezměníš nastavení sítě.',
      aboutTitle: 'Jak fungují QR kódy pro WiFi',
      about: [
        'QR kód pro WiFi obsahuje název sítě (SSID), typ zabezpečení a heslo ve standardním formátu, kterému rozumí aplikace fotoaparátu na iPhonu i Androidu. Po naskenování telefon nabídne připojení k síti, takže nikdo nemusí přepisovat dlouhé heslo.',
        'Vytiskni kód pro domácnost, kancelář, kavárnu nebo pronajímaný apartmán a umísti ho tam, kde ho hosté uvidí. Když změníš heslo nebo název sítě, vytvoř nový kód.',
        'Mnoho online generátorů posílá tvoje heslo na své servery. QRTurbo.app vytváří kód přímo ve tvém prohlížeči, takže se heslo nikam nenahrává ani neukládá.'
      ]
    },
    vcard: {
      name: 'QR kód s vizitkou vCard',
      title: 'QR kód vCard na vizitku – generátor zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód vCard na vizitku zdarma. Jedno naskenování uloží jméno, telefon, e-mail i adresu do kontaktů. Bez registrace, kód nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů vCard',
      display: 'Sdílej své kontaktní údaje jedním naskenováním.',
      lead:
        'Zadej jméno, telefonní číslo, e-mail a adresu a vytvoř QR kód vCard na vizitky, jmenovky i do e-mailového podpisu. Údaje jsou uložené přímo v kódu, ne na serveru.',
      aboutTitle: 'Jak fungují QR kódy vCard',
      about: [
        'QR kód vCard obsahuje digitální vizitku ve formátu vCard. Po naskenování telefon nabídne uložení údajů jako nového kontaktu, takže není potřeba nic ručně přepisovat.',
        'Vyplň jen ta pole, která chceš sdílet. Čím víc údajů přidáš, tím je kód hustší, proto ho tiskni aspoň 2,5 cm široký a před objednáním velkého nákladu vizitek ho otestuj.',
        'Protože jsou údaje zakódované přímo v kódu, nejdou později změnit. Pokud se změní tvoje telefonní číslo nebo pracovní pozice, vytvoř pro další tisk nový kód.'
      ]
    },
    sms: {
      name: 'QR kód pro SMS a hovor',
      title: 'QR kód pro SMS a hovor – generátor zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód zdarma, který otevře SMS zprávu nebo zahájí hovor. Přidej předvyplněný text SMS. Vzniká v prohlížeči, bez registrace, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro SMS a hovory',
      display: 'SMS nebo telefonát jedním naskenováním.',
      lead:
        'Vytvoř QR kód, který otevře předvyplněnou SMS nebo vytočí telefonní číslo. Hodí se pro zákaznickou podporu, rezervace, soutěže i servisní nálepky.',
      aboutTitle: 'Jak fungují QR kódy pro SMS a hovory',
      about: [
        'QR kód pro SMS otevře aplikaci pro zprávy s už vyplněným číslem i textem, takže stačí jen stisknout „Odeslat“. QR kód pro hovor otevře telefon s číslem připraveným k vytočení.',
        'Číslo vždy zadávej v mezinárodním formátu, například +420 601 234 567, aby kód fungoval i lidem se zahraniční SIM kartou.',
        'Telefon nikdy neodešle zprávu ani nezavolá automaticky. Ten, kdo kód naskenuje, to vždy nejdřív potvrdí.'
      ]
    },
    email: {
      name: 'QR kód pro e-mail',
      title: 'QR kód pro e-mail zdarma s předvyplněnou zprávou | QRTurbo.app',
      description:
        'Vytvoř QR kód pro e-mail zdarma. Otevře novou zprávu s vyplněným příjemcem, předmětem i textem. Bez registrace a sledování, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro e-mail',
      display: 'E-mail připravený k odeslání jedním naskenováním.',
      lead:
        'Zadej příjemce, předmět a text zprávy a vytvoř QR kód pro e-mail – na zpětnou vazbu, žádosti o podporu, objednávky i přihlášky.',
      aboutTitle: 'Jak fungují QR kódy pro e-mail',
      about: [
        'QR kód pro e-mail obsahuje odkaz mailto. Po naskenování se otevře e-mailová aplikace s vyplněným příjemcem, předmětem i textem a o odeslání rozhodne ten, kdo kód naskenoval.',
        'Předvyplněnou zprávu drž krátkou. Dlouhý text dělá kód hustším a z dálky se hůř skenuje.',
        'Použij jasný předmět, například „Zpětná vazba: stůl 12“, aby šly přijaté zprávy snadno roztřídit.'
      ]
    },
    event: {
      name: 'QR kód s událostí v kalendáři',
      title: 'QR kód pro událost v kalendáři zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód s událostí zdarma. Jedno naskenování přidá do kalendáře název, čas, místo i podrobnosti. Vzniká v prohlížeči, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro události v kalendáři',
      display: 'Jedno naskenování a tvoje akce je v kalendáři.',
      lead:
        'Zadej název, čas a místo události a vytvoř QR kód na pozvánky, plakáty, vstupenky i do zasedacích místností.',
      aboutTitle: 'Jak fungují QR kódy s událostmi',
      about: [
        'QR kód s událostí obsahuje záznam kalendáře ve formátu iCalendar. Po naskenování si lidé můžou událost přidat do kalendáře se správným datem, časem a místem.',
        'Podpora QR kódů s událostmi se liší podle telefonu a aplikace na skenování. Než vytiskneš pozvánky, otestuj kód na iPhonu i na telefonu s Androidem.',
        'Vyplň pole „Místo“, aby hosté našli adresu přímo v kalendáři.'
      ]
    },
    location: {
      name: 'QR kód s polohou',
      title: 'QR kód s polohou na mapě – generátor zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód s polohou zdarma. Otevře adresu nebo souřadnice v mapové aplikaci. Skvělý na pozvánky a cedule. Bez registrace, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů s polohou',
      display: 'Ukaž cestu jedním naskenováním.',
      lead:
        'Zadej adresu nebo souřadnice a vytvoř QR kód, který otevře místo v mapové aplikaci. Použij ho na pozvánkách, letácích, cedulích i v pokynech pro kurýry.',
      aboutTitle: 'Jak fungují QR kódy s polohou',
      about: [
        'Z adresy vznikne QR kód s odkazem na vyhledávání v Mapách Google, který se na každém telefonu otevře v prohlížeči nebo mapové aplikaci. Ze souřadnic vznikne odkaz geo, který se otevře přímo ve výchozí mapové aplikaci telefonu.',
        'Souřadnice jsou nejpřesnější volbou pro místa bez adresy, třeba chatu, začátek turistické trasy nebo vjezd do areálu akce.',
        'Otestuj kód na vlastním telefonu a ověř si, že ukazuje přesně na správné místo.'
      ]
    },
    social: {
      name: 'QR kód pro sociální sítě',
      title: 'Generátor QR kódů pro sociální sítě zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód zdarma pro svůj profil: Instagram, TikTok, YouTube, LinkedIn a další. Stačí uživatelské jméno. Bez registrace a sledování, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro sociální sítě',
      display: 'Proměň návštěvníky ve sledující.',
      lead:
        'Vyber platformu a zadej uživatelské jméno – vznikne QR kód, který otevře tvůj profil. Podporované jsou mimo jiné Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads a Bluesky.',
      aboutTitle: 'Jak fungují QR kódy pro sociální sítě',
      about: [
        'QR kód pro sociální sítě obsahuje odkaz na tvůj profil. Po naskenování se profil otevře v aplikaci, pokud je nainstalovaná, jinak v prohlížeči.',
        'Zadej uživatelské jméno a QRTurbo.app sestaví správnou adresu profilu pro zvolenou platformu. Můžeš také vložit celou URL profilu.',
        'Umísti kód na obaly, vizitky, plakáty a stánky na akcích. Přidej rámeček s krátkou výzvou, například „Sleduj nás“, aby lidé věděli, co je čeká.'
      ]
    },
    whatsapp: {
      name: 'QR kód pro WhatsApp',
      title: 'QR kód pro WhatsApp chat – generátor zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód pro WhatsApp zdarma. Otevře chat s tvým číslem a předvyplněnou zprávou. Vzniká v prohlížeči, bez registrace, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro WhatsApp',
      display: 'Chat přes WhatsApp jedním naskenováním.',
      lead:
        'Zadej telefonní číslo nebo uživatelské jméno pro WhatsApp a případně i zprávu. Zákazníci se ti ozvou, aniž by si museli nejdřív uložit tvoje číslo.',
      aboutTitle: 'Jak fungují QR kódy pro WhatsApp',
      about: [
        'QR kód pro WhatsApp obsahuje odkaz wa.me. Po naskenování se otevře chat s tebou a předvyplněná zpráva je připravená k odeslání.',
        'Zadej číslo v mezinárodním formátu s předvolbou země, například +420 601 234 567. Mezery a pomlčky se odstraní automaticky.',
        'Kód obsahuje přímo odkaz wa.me, ne přesměrování, takže funguje, dokud číslo používá WhatsApp.'
      ]
    },
    app: {
      name: 'QR kód pro stažení aplikace',
      title: 'QR kód pro App Store a Google Play zdarma | QRTurbo.app',
      description:
        'Vytvoř QR kód zdarma pro stránku ke stažení aplikace nebo odkaz do App Store či Google Play. Vzniká v prohlížeči. Bez registrace a přesměrování, nikdy nevyprší.',
      eyebrow: 'Generátor QR kódů pro stažení aplikace',
      display: 'Pošli lidi rovnou ke své aplikaci.',
      lead:
        'Přidej webovou stránku aplikace, odkaz do App Store a odkaz do Google Play a vytvoř QR kód pro stažení aplikace.',
      aboutTitle: 'Jak fungují QR kódy pro stažení aplikace',
      about: [
        'QR kód obsahuje jeden odkaz a QRTurbo.app nikdy nepřidává přesměrování. Pokud máš webovou stránku, která uživatele iPhonu pošle do App Store a uživatele Androidu do Google Play, zadej ji jako webovou adresu – tak dosáhneš nejlepšího výsledku na každém telefonu.',
        'Pokud takovou stránku nemáš, zvol, který obchod má kód otevřít, nebo vytiskni samostatné kódy pro App Store a Google Play.',
        'Zkontroluj, že odkazy do obchodů jsou veřejné a neobsahují sledovací parametry, které nechceš sdílet.'
      ]
    }
  },
  comparison: {
    title: 'QR kódy zdarma, které nikdy nepřestanou fungovat',
    intro:
      'Mnoho „bezplatných“ generátorů QR kódů vytváří dynamické kódy, které vedou přes jejich vlastní přesměrovací server. Když skončí zkušební doba, kód se vypne – často ve chvíli, kdy už je vytištěný na jídelních lístcích, vizitkách nebo obalech. QRTurbo.app funguje jinak.',
    headers: {
      feature: 'Otázka',
      dynamic: 'Typický QR kód „zdarma na zkoušku“',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Kde je uložený tvůj obsah?',
        dynamic: 'Na serveru poskytovatele, za krátkým přesměrovacím odkazem',
        qrturbo: 'Přímo v QR kódu'
      },
      {
        feature: 'Co se stane, když skončí zkušební doba?',
        dynamic: 'Kód se deaktivuje, dokud nezaplatíš',
        qrturbo: 'Nic. Žádná zkušební doba není a kód funguje dál'
      },
      {
        feature: 'Potřebuješ účet?',
        dynamic: 'Většinou ano',
        qrturbo: 'Ne'
      },
      {
        feature: 'Kdo vidí naskenování tvého kódu?',
        dynamic: 'Každé naskenování prochází přes poskytovatele',
        qrturbo: 'Nikdo. Naskenování se k nám nikdy nedostanou'
      },
      {
        feature: 'Kolik to stojí?',
        dynamic: 'Měsíční nebo roční předplatné',
        qrturbo: 'Nic, a to ani při komerčním použití'
      }
    ],
    note:
      'Jediný kompromis: statický QR kód nejde po vytištění upravit. Pokud budeš možná chtít cíl později změnit, vytvoř kód pro stránku, kterou máš pod kontrolou, a upravuj pak tuto stránku.'
  },
  faq: {
    title: 'Časté dotazy',
    items: [
      {
        q: 'Vyprší platnost QR kódů z QRTurbo.app?',
        a: 'Ne. QRTurbo.app vytváří statické QR kódy: tvůj odkaz, text nebo kontaktní údaje jsou zakódované přímo v kódu. Mezi tím není žádný server, takže nic nemůže vypršet ani být vypnuto. Kód funguje, dokud je jeho obsah platný – například dokud existuje web, na který odkazuje.'
      },
      {
        q: 'Proč mi přestal fungovat QR kód z jiného webu?',
        a: 'Mnoho generátorů ve výchozím nastavení vytváří dynamické QR kódy. Obsahují krátký odkaz na server poskytovatele, který každé naskenování přesměruje na tvou skutečnou adresu. Když skončí zkušební verze nebo předplatné, poskytovatel přesměrování vypne a vytištěný kód přestane fungovat. Kódy z QRTurbo.app obsahují tvůj skutečný obsah a nikdy na nás nezávisí.'
      },
      {
        q: 'Je QRTurbo.app opravdu zdarma? Můžu kódy používat komerčně?',
        a: 'Ano. Žádná registrace, žádná zkušební verze, žádný vodoznak ani limit naskenování. Vytvořené QR kódy můžeš používat k osobním i komerčním účelům, například na vizitkách, jídelních lístcích, obalech a v reklamě.'
      },
      {
        q: 'Můžu QR kód po vytištění změnit?',
        a: 'Ne. Statický QR kód nejde upravit, protože obsah je součástí jeho vzoru. Pokud počítáš se změnou cíle, vytvoř kód pro adresu, kterou máš pod kontrolou, například stránku na vlastním webu, a upravuj pak tuto stránku.'
      },
      {
        q: 'Jak velký QR kód mám vytisknout?',
        a: 'Tiskni ho aspoň 2 × 2 cm. Orientační pravidlo: strana kódu by měla mít aspoň desetinu vzdálenosti, ze které se bude skenovat – plakát čtený ze 2 metrů potřebuje kód o straně asi 20 cm. Pro tisk si stáhni SVG nebo velké PNG a nech kolem kódu prázdnou klidovou zónu.'
      },
      {
        q: 'Proč nejde můj QR kód naskenovat?',
        a: 'Nejčastější příčiny jsou nízký kontrast mezi kódem a pozadím, příliš malá klidová zóna, logo, které zakrývá příliš velkou část kódu, nebo příliš mnoho obsahu na danou velikost tisku. QRTurbo.app tě na tato rizika upozorní. Před tiskem kód vždy vyzkoušej na několika různých telefonech.'
      },
      {
        q: 'Jsou moje data v bezpečí? Vidíte moje heslo k WiFi?',
        a: 'Tvoje data zůstávají ve tvém zařízení. QR kód vytváří skript, který běží ve tvém prohlížeči, a nic, co napíšeš nebo nahraješ, se neodesílá na server – nikdo tedy neuvidí tvoje heslo k WiFi ani kontaktní údaje. Po první návštěvě funguje generátor i offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Generátory QR kódů zdarma'
  }
};
