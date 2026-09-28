// Page content for the pre-rendered Dutch pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR-code voor URL en tekst',
    title: 'Gratis QR-code generator die nooit verloopt | QRTurbo.app',
    description:
      'Maak gratis QR-codes voor links, wifi, vCards en meer. Geen registratie, geen proefperiode, geen tracking: gemaakt in je browser en ze werken voor altijd.',
    eyebrow: 'Gratis QR-code generator',
    display: 'Gratis QR-codes die altijd blijven werken.',
    lead:
      'Maak QR-codes voor links, wifi, contactgegevens en meer, direct in je browser. Geen registratie, geen proefperiode, geen doorverwijzingen: je inhoud staat rechtstreeks in de code, dus die blijft voor altijd werken. Voeg een logo, kleuren en een ‘Scan mij’-kader toe.'
  },
  types: {
    wifi: {
      name: 'Wifi-QR-code',
      title: 'Gratis wifi-QR-code maken, veilig en privé | QRTurbo.app',
      description:
        'Maak gratis een wifi-QR-code: gasten verbinden met één scan met je netwerk. Je wachtwoord blijft in je browser. Geen registratie, geen tracking, verloopt nooit.',
      eyebrow: 'QR-code generator voor wifi',
      display: 'Met één scan zitten je gasten op je wifi.',
      lead:
        'Vul je netwerknaam en wachtwoord in om een wifi-QR-code te maken. Het wachtwoord verlaat je apparaat nooit, en de code blijft werken zolang je netwerkinstellingen hetzelfde blijven.',
      aboutTitle: 'Zo werkt een wifi-QR-code',
      about: [
        'Een wifi-QR-code bevat de netwerknaam (SSID), het beveiligingstype en het wachtwoord in een standaardformaat dat de camera-apps van iPhone en Android begrijpen. Na het scannen stelt de telefoon voor om verbinding te maken, zodat niemand een lang wachtwoord hoeft over te typen.',
        'Print de code voor je huis, kantoor, café of vakantiewoning en hang hem op een plek waar gasten hem zien. Verander je het wachtwoord of de netwerknaam, maak dan een nieuwe code.',
        'Veel online generators sturen je wachtwoord naar hun servers. QRTurbo.app maakt de code in je browser, dus je wachtwoord wordt nergens geüpload of opgeslagen.'
      ]
    },
    vcard: {
      name: 'vCard-QR-code',
      title: 'Gratis vCard-QR-code maken voor visitekaartjes | QRTurbo.app',
      description:
        'Maak gratis een vCard-QR-code voor je visitekaartje. Eén scan zet je naam, telefoon, e-mail en adres in de contacten. Geen registratie, verloopt nooit.',
      eyebrow: 'QR-code generator voor vCards',
      display: 'Deel je contactgegevens met één scan.',
      lead:
        'Vul je naam, telefoonnummer, e-mailadres en adres in om een vCard-QR-code te maken voor visitekaartjes, naambadges en e-mailhandtekeningen. De gegevens staan in de code zelf, niet op een server.',
      aboutTitle: 'Zo werkt een vCard-QR-code',
      about: [
        'Een vCard-QR-code bevat een digitaal visitekaartje in het vCard-formaat. Wie de code scant, krijgt op de telefoon de vraag of de gegevens als nieuw contact moeten worden opgeslagen. Overtypen is niet nodig.',
        'Vul alleen de velden in die je wilt delen. Hoe meer gegevens, hoe dichter de code wordt. Print hem daarom minstens 2,5 cm breed en test hem voordat je een grote oplage visitekaartjes bestelt.',
        'Omdat de gegevens rechtstreeks in de code staan, kun je ze later niet meer wijzigen. Verandert je telefoonnummer of functie, maak dan een nieuwe code voor je volgende oplage.'
      ]
    },
    sms: {
      name: 'QR-code voor sms en bellen',
      title: 'Gratis QR-code voor sms en bellen maken | QRTurbo.app',
      description:
        'Maak gratis een QR-code die een sms opent of een nummer belt, met een vooraf ingevuld bericht. Gemaakt in je browser, geen registratie, verloopt nooit.',
      eyebrow: 'QR-code generator voor sms en bellen',
      display: 'Met één scan een sms sturen of bellen.',
      lead:
        'Maak een QR-code die een vooraf ingevuld sms-bericht opent of een telefoonnummer belt. Handig voor klantenservice, reserveringen, winacties en servicestickers.',
      aboutTitle: 'Zo werkt een QR-code voor sms en bellen',
      about: [
        'Een sms-QR-code opent de berichten-app met het telefoonnummer en je bericht al ingevuld, zodat wie scant alleen nog op verzenden hoeft te tikken. Een bel-QR-code opent de telefoon-app met het nummer klaar om te bellen.',
        'Vul het nummer altijd in internationaal formaat in, bijvoorbeeld +31 6 12345678, zodat de code ook werkt voor mensen met een buitenlandse telefoon.',
        'De telefoon verstuurt het bericht of start het gesprek nooit automatisch. Wie scant, bevestigt altijd eerst.'
      ]
    },
    email: {
      name: 'QR-code voor e-mail',
      title: 'Gratis QR-code voor e-mail met ingevuld bericht | QRTurbo.app',
      description:
        'Maak gratis een QR-code die een nieuwe e-mail opent met ontvanger, onderwerp en tekst al ingevuld. Geen registratie, geen tracking, verloopt nooit.',
      eyebrow: 'QR-code generator voor e-mail',
      display: 'Open een kant-en-klare e-mail met één scan.',
      lead:
        'Vul een ontvanger, onderwerp en bericht in om een QR-code voor e-mail te maken, voor feedback, supportvragen, bestellingen en aanmeldingen.',
      aboutTitle: 'Zo werkt een QR-code voor e-mail',
      about: [
        'Een QR-code voor e-mail bevat een mailto-link. Na het scannen opent de e-mailapp met ontvanger, onderwerp en bericht al ingevuld, en wie scant beslist zelf of het bericht verstuurd wordt.',
        'Houd het vooraf ingevulde bericht kort. Lange teksten maken de code dichter en lastiger te scannen van een afstand.',
        'Gebruik een duidelijke onderwerpregel, zoals ‘Feedback: tafel 12’, zodat je de berichten die binnenkomen makkelijk kunt sorteren.'
      ]
    },
    event: {
      name: 'QR-code voor evenementen',
      title: 'Gratis QR-code voor evenementen in je agenda | QRTurbo.app',
      description:
        'Maak gratis een QR-code voor een evenement. Eén scan zet de titel, tijd, locatie en details in de agenda. Gemaakt in je browser, verloopt nooit.',
      eyebrow: 'QR-code generator voor evenementen',
      display: 'Met één scan staat je evenement in hun agenda.',
      lead:
        'Vul de naam, tijd en locatie van je evenement in om een QR-code te maken voor uitnodigingen, posters, tickets en vergaderruimtes.',
      aboutTitle: 'Zo werkt een QR-code voor evenementen',
      about: [
        'Een QR-code voor een evenement bevat een agenda-item in het iCalendar-formaat. Na het scannen kunnen mensen het evenement met de juiste datum, tijd en locatie aan hun agenda toevoegen.',
        'Niet elke telefoon of scanner-app ondersteunt agenda-QR-codes even goed. Test de code met zowel een iPhone als een Android-telefoon voordat je uitnodigingen laat drukken.',
        'Vul het locatieveld in, zodat gasten het adres direct vanuit hun agenda kunnen vinden.'
      ]
    },
    location: {
      name: 'Locatie-QR-code',
      title: 'Gratis locatie-QR-code maken, adres op de kaart | QRTurbo.app',
      description:
        'Maak gratis een locatie-QR-code die een adres of coördinaten opent in een navigatie-app. Ideaal voor uitnodigingen en borden. Geen registratie, verloopt nooit.',
      eyebrow: 'QR-code generator voor locaties',
      display: 'Wijs de weg met één scan.',
      lead:
        'Vul een adres of coördinaten in om een QR-code te maken die de locatie opent in een navigatie-app. Gebruik hem op uitnodigingen, flyers, borden en bezorginstructies.',
      aboutTitle: 'Zo werkt een locatie-QR-code',
      about: [
        'Een adres levert een QR-code op met een zoeklink naar Google Maps, die op elke telefoon opent in de browser of een navigatie-app. Coördinaten leveren een geo-link op, die direct opent in de standaard kaarten-app van de telefoon.',
        'Coördinaten zijn de meest nauwkeurige keuze voor plekken zonder adres, zoals een vakantiehuisje, het begin van een wandelroute of de ingang van een evenemententerrein.',
        'Test de code op je eigen telefoon om te controleren of hij precies naar de juiste plek wijst.'
      ]
    },
    social: {
      name: 'QR-code voor social media',
      title: 'Gratis QR-code voor Instagram, TikTok en meer | QRTurbo.app',
      description:
        'Maak gratis een QR-code voor je Instagram-, TikTok-, YouTube-, LinkedIn- of ander profiel. Typ gewoon je gebruikersnaam. Geen registratie, verloopt nooit.',
      eyebrow: 'QR-code generator voor social media',
      display: 'Maak van offline bezoekers online volgers.',
      lead:
        'Kies een platform en vul je gebruikersnaam in om een QR-code te maken die je profiel opent. Werkt met Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky en meer.',
      aboutTitle: 'Zo werkt een QR-code voor social media',
      about: [
        'Een QR-code voor social media bevat een link naar je profiel. Na het scannen opent het profiel in de app, als die geïnstalleerd is, of anders in de browser.',
        'Typ je gebruikersnaam en QRTurbo.app maakt het juiste profieladres voor het gekozen platform. Je kunt ook een volledige profiel-URL plakken.',
        'Zet de code op verpakkingen, visitekaartjes, posters en beursstands. Voeg een kader toe met een korte oproep, zoals ‘Volg ons’, zodat mensen weten wat ze kunnen verwachten.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp-QR-code',
      title: 'Gratis WhatsApp-QR-code maken, chat met één scan | QRTurbo.app',
      description:
        'Maak gratis een WhatsApp-QR-code die een chat opent met je nummer en een vooraf ingevuld bericht. Gemaakt in je browser. Geen registratie, verloopt nooit.',
      eyebrow: 'QR-code generator voor WhatsApp',
      display: 'Start een WhatsApp-chat met één scan.',
      lead:
        'Vul je telefoonnummer of WhatsApp-gebruikersnaam in, en eventueel een bericht. Klanten kunnen contact met je opnemen zonder eerst je nummer op te slaan.',
      aboutTitle: 'Zo werkt een WhatsApp-QR-code',
      about: [
        'Een WhatsApp-QR-code bevat een wa.me-link. Na het scannen opent een chat met jou, met je vooraf ingevulde bericht klaar om te versturen.',
        'Vul het nummer in internationaal formaat in, met landcode, bijvoorbeeld +31 6 12345678. Spaties en streepjes worden automatisch verwijderd.',
        'De code bevat de wa.me-link zelf, geen doorverwijzing, dus hij blijft werken zolang het nummer WhatsApp gebruikt.'
      ]
    },
    app: {
      name: 'QR-code voor app-downloads',
      title: 'Gratis QR-code voor App Store en Google Play | QRTurbo.app',
      description:
        'Maak gratis een QR-code voor de downloadpagina van je app in de App Store of Google Play. Gemaakt in je browser. Geen registratie of redirects, verloopt nooit.',
      eyebrow: 'QR-code generator voor app-downloads',
      display: 'Stuur mensen rechtstreeks naar je app.',
      lead:
        'Vul de webpagina van je app, de App Store-link en de Google Play-link in om een QR-code voor app-downloads te maken.',
      aboutTitle: 'Zo werkt een QR-code voor app-downloads',
      about: [
        'Een QR-code bevat één link, en QRTurbo.app voegt nooit een doorverwijzing toe. Heb je een webpagina die iPhone-gebruikers naar de App Store stuurt en Android-gebruikers naar Google Play? Gebruik die dan als web-URL voor het beste resultaat op elke telefoon.',
        'Zonder zo’n pagina kies je welke storelink de code opent, of print je aparte codes voor de App Store en Google Play.',
        'Controleer of de storelinks openbaar zijn en geen trackingparameters bevatten die je niet wilt delen.'
      ]
    }
  },
  comparison: {
    title: 'Gratis QR-codes die altijd blijven werken',
    intro:
      'Veel ‘gratis’ QR-code generators maken dynamische codes die naar hun eigen doorverwijsserver wijzen. Loopt de proefperiode af, dan wordt de code uitgeschakeld, vaak nadat hij al op menukaarten, visitekaartjes of verpakkingen is gedrukt. QRTurbo.app werkt anders.',
    headers: {
      feature: 'Vraag',
      dynamic: 'Typische QR-code met ‘gratis proefperiode’',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Waar wordt je inhoud opgeslagen?',
        dynamic: 'Op de server van de aanbieder, achter een korte doorverwijslink',
        qrturbo: 'In de QR-code zelf'
      },
      {
        feature: 'Wat gebeurt er als de proefperiode afloopt?',
        dynamic: 'De code wordt uitgeschakeld tot je betaalt',
        qrturbo: 'Niets. Er is geen proefperiode en de code blijft werken'
      },
      {
        feature: 'Heb je een account nodig?',
        dynamic: 'Meestal wel',
        qrturbo: 'Nee'
      },
      {
        feature: 'Wie ziet je scans?',
        dynamic: 'Elke scan loopt via de aanbieder',
        qrturbo: 'Niemand. Scans komen nooit bij ons terecht'
      },
      {
        feature: 'Wat kost het?',
        dynamic: 'Een maand- of jaarabonnement',
        qrturbo: 'Niets, ook niet bij commercieel gebruik'
      }
    ],
    note:
      'Het enige nadeel: een statische QR-code kun je na het drukken niet meer aanpassen. Wil je de bestemming later misschien wijzigen? Maak de code dan voor een pagina die je zelf beheert, en pas in plaats daarvan die pagina aan.'
  },
  faq: {
    title: 'Veelgestelde vragen',
    items: [
      {
        q: 'Verlopen QR-codes van QRTurbo.app?',
        a: 'Nee. QRTurbo.app maakt statische QR-codes: je link, tekst of contactgegevens staan rechtstreeks in de code. Er zit geen server tussen, dus er is niets wat kan verlopen of worden uitgeschakeld. Een code blijft werken zolang de inhoud geldig is, bijvoorbeeld zolang de website waarnaar hij linkt bestaat.'
      },
      {
        q: 'Waarom werkt mijn QR-code van een andere website niet meer?',
        a: 'Veel generators maken standaard dynamische QR-codes. Die bevatten een korte link naar de server van de aanbieder, die elke scan doorstuurt naar je echte adres. Loopt een gratis proefperiode of abonnement af, dan schakelt de aanbieder de doorverwijzing uit en werkt de gedrukte code niet meer. Codes van QRTurbo.app bevatten je echte inhoud en zijn nooit van ons afhankelijk.'
      },
      {
        q: 'Is QRTurbo.app echt gratis? Mag ik de codes commercieel gebruiken?',
        a: 'Ja. Er is geen registratie, geen proefperiode, geen watermerk en geen scanlimiet. Je mag de QR-codes die je maakt gebruiken voor privé- en zakelijke doeleinden, zoals visitekaartjes, menukaarten, verpakkingen en reclame.'
      },
      {
        q: 'Kan ik een QR-code na het drukken nog aanpassen?',
        a: 'Nee. Een statische QR-code kun je niet bewerken, omdat de inhoud deel uitmaakt van het patroon. Verwacht je dat de bestemming verandert? Maak de code dan voor een adres dat je zelf beheert, zoals een pagina op je eigen website, en pas in plaats daarvan die pagina aan.'
      },
      {
        q: 'Hoe groot moet ik een QR-code printen?',
        a: 'Print hem minstens 2 × 2 cm. Vuistregel: maak de code minstens een tiende van de scanafstand. Een poster die van 2 meter afstand wordt gescand, heeft dus een code van ongeveer 20 cm nodig. Download voor drukwerk een SVG of een grote PNG en houd de witrand rond de code leeg.'
      },
      {
        q: 'Waarom scant mijn QR-code niet?',
        a: 'De meest voorkomende oorzaken zijn te weinig contrast tussen de code en de achtergrond, een te smalle witrand, een logo dat te veel van de code bedekt, of te veel inhoud voor het formaat waarop je print. QRTurbo.app waarschuwt je voor deze risico’s. Test de code altijd met een paar verschillende telefoons voordat je hem laat drukken.'
      },
      {
        q: 'Zijn mijn gegevens veilig? Kunnen jullie mijn wifiwachtwoord zien?',
        a: 'Je gegevens blijven op je apparaat. De QR-code wordt gemaakt door code die in je browser draait, en niets wat je typt of uploadt wordt naar een server gestuurd. Niemand kan dus je wifiwachtwoord of contactgegevens zien. Na het eerste bezoek werkt de generator ook offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Gratis QR-code generators'
  }
};
