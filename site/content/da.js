// Page content for the pre-rendered Danish pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR-kode til URL og tekst',
    title: 'Gratis QR-kode generator, der aldrig udløber | QRTurbo.app',
    description:
      'Lav gratis QR-koder til links, WiFi, vCards og meget mere. Ingen tilmelding, ingen prøveperiode, ingen sporing: koderne laves i browseren og virker for altid.',
    eyebrow: 'Gratis QR-kode generator',
    display: 'Gratis QR-koder, der bliver ved med at virke.',
    lead:
      'Lav QR-koder til links, WiFi, kontakter og meget mere direkte i din browser. Ingen tilmelding, ingen prøveperiode, ingen omdirigeringer: dit indhold ligger direkte i koden, så den virker for altid. Tilføj logo, farver og en »SCAN MIG«-ramme.'
  },
  types: {
    wifi: {
      name: 'WiFi QR-kode',
      title: 'Gratis WiFi QR-kode generator, privat og sikker | QRTurbo.app',
      description:
        'Lav en gratis WiFi QR-kode, så gæster kommer på netværket med én scanning. Adgangskoden bliver i din browser. Ingen tilmelding, ingen sporing, udløber aldrig.',
      eyebrow: 'WiFi QR-kode generator',
      display: 'Gæsterne kommer på WiFi med én scanning.',
      lead:
        'Indtast netværksnavn og adgangskode for at lave en WiFi QR-kode. Adgangskoden forlader aldrig din enhed, og koden virker, så længe dine netværksindstillinger er de samme.',
      aboutTitle: 'Sådan virker WiFi QR-koder',
      about: [
        'En WiFi QR-kode indeholder netværksnavnet (SSID), sikkerhedstypen og adgangskoden i et standardformat, som kamera-appen på både iPhone og Android forstår. Når koden scannes, tilbyder telefonen at oprette forbindelse, så ingen behøver at taste en lang adgangskode.',
        'Print koden til dit hjem, kontor, din café eller dit sommerhus, og sæt den op, hvor gæsterne kan se den. Hvis du skifter adgangskode eller netværksnavn, skal du lave en ny kode.',
        'Mange online generatorer sender din adgangskode til deres servere. QRTurbo.app laver koden i din browser, så adgangskoden aldrig bliver uploadet eller gemt nogen steder.'
      ]
    },
    vcard: {
      name: 'vCard QR-kode',
      title: 'Gratis vCard QR-kode generator til visitkort | QRTurbo.app',
      description:
        'Lav en gratis vCard QR-kode til dit visitkort. Én scanning gemmer navn, telefon, e-mail og adresse i kontakterne. Ingen tilmelding, udløber aldrig.',
      eyebrow: 'vCard QR-kode generator',
      display: 'Del dine kontaktoplysninger med én scanning.',
      lead:
        'Tilføj navn, telefonnummer, e-mail og adresse for at lave en vCard QR-kode til visitkort, navneskilte og e-mailsignaturer. Oplysningerne ligger i selve koden, ikke på en server.',
      aboutTitle: 'Sådan virker vCard QR-koder',
      about: [
        'En vCard QR-kode indeholder et digitalt visitkort i vCard-formatet. Når nogen scanner den, tilbyder telefonen at gemme oplysningerne som en ny kontakt, så intet skal tastes ind i hånden.',
        'Udfyld kun de felter, du vil dele. Jo flere oplysninger du tilføjer, jo tættere bliver koden, så print den mindst 2,5 cm bred, og test den, før du bestiller et stort oplag visitkort.',
        'Fordi oplysningerne er kodet direkte i koden, kan de ikke ændres bagefter. Hvis dit telefonnummer eller din jobtitel ændrer sig, laver du en ny kode til næste oplag.'
      ]
    },
    sms: {
      name: 'QR-kode til SMS og opkald',
      title: 'Gratis QR-kode generator til SMS og opkald | QRTurbo.app',
      description:
        'Lav en gratis QR-kode, der åbner en SMS eller ringer op. Tilføj en færdigskrevet besked. Laves i din browser, ingen tilmelding, udløber aldrig.',
      eyebrow: 'QR-kode generator til SMS og opkald',
      display: 'Start en SMS eller et opkald med én scanning.',
      lead:
        'Lav en QR-kode, der åbner en færdigskrevet SMS eller ringer til et telefonnummer. Den er oplagt til kundeservice, bookinger, konkurrencer og servicemærkater.',
      aboutTitle: 'Sådan virker QR-koder til SMS og opkald',
      about: [
        'En SMS QR-kode åbner beskedappen med telefonnummeret og din besked allerede udfyldt, så den, der scanner, blot skal trykke send. En QR-kode til opkald åbner telefonen med nummeret klar til at ringe op.',
        'Skriv altid nummeret i internationalt format, for eksempel +45 20 12 34 56, så koden også virker for folk med udenlandske telefoner.',
        'Telefonen sender aldrig beskeden eller ringer op af sig selv. Den, der scanner, skal altid bekræfte først.'
      ]
    },
    email: {
      name: 'E-mail QR-kode',
      title: 'Gratis QR-kode til e-mail med udfyldt besked | QRTurbo.app',
      description:
        'Lav en gratis e-mail QR-kode, der åbner en ny mail med modtager, emne og tekst udfyldt på forhånd. Ingen tilmelding, ingen sporing, udløber aldrig.',
      eyebrow: 'E-mail QR-kode generator',
      display: 'Åbn en færdigskrevet e-mail med én scanning.',
      lead:
        'Tilføj modtager, emne og besked for at lave en e-mail QR-kode til feedback, supporthenvendelser, bestillinger og tilmeldinger.',
      aboutTitle: 'Sådan virker e-mail QR-koder',
      about: [
        'En e-mail QR-kode indeholder et mailto-link. Når koden scannes, åbner mailappen med modtager, emne og besked allerede udfyldt, og den, der scanner, bestemmer selv, om mailen skal sendes.',
        'Hold den forudfyldte besked kort. Lange tekster gør koden tættere og sværere at scanne på afstand.',
        'Brug en tydelig emnelinje, for eksempel »Feedback: bord 12«, så du nemt kan sortere de beskeder, du modtager.'
      ]
    },
    event: {
      name: 'QR-kode til kalenderbegivenhed',
      title: 'Gratis QR-kode til begivenhed i kalenderen | QRTurbo.app',
      description:
        'Lav en gratis QR-kode til en kalenderbegivenhed. Én scanning tilføjer titel, tidspunkt, sted og detaljer til kalenderen. Laves i browseren, udløber aldrig.',
      eyebrow: 'QR-kode generator til kalenderbegivenheder',
      display: 'Sæt din begivenhed i deres kalender med én scanning.',
      lead:
        'Indtast titel, tidspunkt og sted for at lave en QR-kode til invitationer, plakater, billetter og mødelokaler.',
      aboutTitle: 'Sådan virker QR-koder til begivenheder',
      about: [
        'En QR-kode til en begivenhed indeholder en kalenderpost i iCalendar-formatet. Når koden scannes, kan man tilføje begivenheden til sin kalender med den rigtige dato, det rigtige tidspunkt og sted.',
        'Understøttelsen af kalender-QR-koder varierer mellem telefoner og scanner-apps. Test koden med både en iPhone og en Android-telefon, før du printer invitationerne.',
        'Udfyld feltet til placering, så gæsterne kan finde adressen direkte fra deres kalender.'
      ]
    },
    location: {
      name: 'QR-kode til placering',
      title: 'Gratis QR-kode til placering og kortapps | QRTurbo.app',
      description:
        'Lav en gratis QR-kode, der åbner en adresse eller koordinater i en kortapp. Perfekt til invitationer og skilte. Ingen tilmelding, udløber aldrig.',
      eyebrow: 'QR-kode generator til placeringer',
      display: 'Vis vejen med én scanning.',
      lead:
        'Indtast en adresse eller koordinater for at lave en QR-kode, der åbner stedet i en kortapp. Brug den på invitationer, flyers, skilte og leveringsinstruktioner.',
      aboutTitle: 'Sådan virker QR-koder til placeringer',
      about: [
        'En adresse giver en QR-kode med et søgelink til Google Maps, som åbner i browseren eller en kortapp på enhver telefon. Koordinater giver et geo-link, der åbner direkte i telefonens standard-kortapp.',
        'Koordinater er det mest præcise valg til steder uden en gadeadresse, for eksempel et sommerhus, starten på en vandrerute eller indgangen til et eventområde.',
        'Test koden på din egen telefon for at sikre, at den peger præcis det rigtige sted hen.'
      ]
    },
    social: {
      name: 'QR-kode til sociale medier',
      title: 'Gratis QR-kode til Instagram, TikTok og SoMe | QRTurbo.app',
      description:
        'Lav en gratis QR-kode til din profil på Instagram, TikTok, YouTube, LinkedIn eller andre sociale medier. Skriv dit brugernavn. Ingen tilmelding, ingen sporing.',
      eyebrow: 'QR-kode generator til sociale medier',
      display: 'Gør besøgende i den virkelige verden til følgere.',
      lead:
        'Vælg en platform, og indtast dit brugernavn for at lave en QR-kode, der åbner din profil. Den virker med Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky og flere.',
      aboutTitle: 'Sådan virker QR-koder til sociale medier',
      about: [
        'En QR-kode til sociale medier indeholder et link til din profil. Når koden scannes, åbner profilen i appen, hvis den er installeret, ellers i browseren.',
        'Skriv dit brugernavn, så laver QRTurbo.app den korrekte profiladresse til den valgte platform. Du kan også indsætte en fuld profil-URL.',
        'Sæt koden på emballage, visitkort, plakater og messestande. Tilføj en ramme med en kort opfordring, for eksempel »Følg os«, så folk ved, hvad de kan forvente.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR-kode',
      title: 'Gratis WhatsApp QR-kode til at starte en chat | QRTurbo.app',
      description:
        'Lav en gratis WhatsApp QR-kode, der åbner en chat med dit nummer og en færdigskrevet besked. Laves i din browser. Ingen tilmelding, udløber aldrig.',
      eyebrow: 'WhatsApp QR-kode generator',
      display: 'Start en WhatsApp-chat med én scanning.',
      lead:
        'Indtast dit telefonnummer eller WhatsApp-brugernavn og eventuelt en besked. Kunderne kan kontakte dig uden først at gemme dit nummer.',
      aboutTitle: 'Sådan virker WhatsApp QR-koder',
      about: [
        'En WhatsApp QR-kode indeholder et wa.me-link. Når koden scannes, åbner en chat med dig, og din forudfyldte besked er klar til at blive sendt.',
        'Indtast nummeret i internationalt format med landekode, for eksempel +45 20 12 34 56. Mellemrum og bindestreger fjernes automatisk.',
        'Koden indeholder selve wa.me-linket, ikke en omdirigering, så den virker, så længe nummeret bruger WhatsApp.'
      ]
    },
    app: {
      name: 'QR-kode til app-download',
      title: 'Gratis QR-kode til App Store og Google Play | QRTurbo.app',
      description:
        'Lav en gratis QR-kode til din apps downloadside, App Store- eller Google Play-link. Laves i din browser. Ingen tilmelding, ingen omdirigering, udløber aldrig.',
      eyebrow: 'QR-kode generator til app-download',
      display: 'Send folk direkte til din app.',
      lead:
        'Tilføj din apps webside, App Store-link og Google Play-link for at lave en QR-kode til app-download.',
      aboutTitle: 'Sådan virker QR-koder til app-download',
      about: [
        'En QR-kode indeholder ét link, og QRTurbo.app tilføjer aldrig en omdirigering. Har du en webside, der sender iPhone-brugere til App Store og Android-brugere til Google Play, så brug den som web-URL for det bedste resultat på alle telefoner.',
        'Uden sådan en side vælger du, hvilket butikslink koden skal åbne, eller du printer separate koder til App Store og Google Play.',
        'Kontrollér, at butikslinksene er offentlige og ikke indeholder sporingsparametre, du ikke ønsker at dele.'
      ]
    }
  },
  comparison: {
    title: 'Gratis QR-koder, der bliver ved med at virke',
    intro:
      'Mange »gratis« QR-kode generatorer laver dynamiske koder, der peger på deres egen omdirigeringsserver. Når prøveperioden slutter, bliver koden slået fra, ofte efter at den allerede er trykt på menukort, visitkort eller emballage. QRTurbo.app fungerer anderledes.',
    headers: {
      feature: 'Spørgsmål',
      dynamic: 'Typisk QR-kode med »gratis prøveperiode«',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Hvor gemmes dit indhold?',
        dynamic: 'På udbyderens server, bag et kort omdirigeringslink',
        qrturbo: 'I selve QR-koden'
      },
      {
        feature: 'Hvad sker der, når prøveperioden slutter?',
        dynamic: 'Koden deaktiveres, indtil du betaler',
        qrturbo: 'Ingenting. Der er ingen prøveperiode, og koden bliver ved med at virke'
      },
      {
        feature: 'Skal du have en konto?',
        dynamic: 'Som regel ja',
        qrturbo: 'Nej'
      },
      {
        feature: 'Hvem ser dine scanninger?',
        dynamic: 'Hver scanning går gennem udbyderen',
        qrturbo: 'Ingen. Scanninger når aldrig frem til os'
      },
      {
        feature: 'Hvad koster det?',
        dynamic: 'Et månedligt eller årligt abonnement',
        qrturbo: 'Ingenting, heller ikke til kommerciel brug'
      }
    ],
    note:
      'Den eneste ulempe: En statisk QR-kode kan ikke redigeres, efter den er printet. Hvis du måske skal ændre destinationen senere, så lav koden til en side, du selv styrer, og opdater i stedet den side.'
  },
  faq: {
    title: 'Ofte stillede spørgsmål',
    items: [
      {
        q: 'Udløber QR-koder lavet med QRTurbo.app?',
        a: 'Nej. QRTurbo.app laver statiske QR-koder: Dit link, din tekst eller dine kontaktoplysninger er kodet direkte i koden. Der er ingen server imellem, så der er intet, der kan udløbe eller blive slået fra. En kode virker, så længe indholdet er gyldigt, for eksempel så længe den hjemmeside, den linker til, findes.'
      },
      {
        q: 'Hvorfor holdt min QR-kode fra en anden hjemmeside op med at virke?',
        a: 'Mange generatorer laver som standard dynamiske QR-koder. De indeholder et kort link til udbyderens server, som sender hver scanning videre til din rigtige adresse. Når en gratis prøveperiode eller et abonnement udløber, slår udbyderen omdirigeringen fra, og den trykte kode holder op med at virke. Koder fra QRTurbo.app indeholder dit rigtige indhold og er aldrig afhængige af os.'
      },
      {
        q: 'Er QRTurbo.app virkelig gratis? Må jeg bruge koderne kommercielt?',
        a: 'Ja. Der er ingen tilmelding, ingen prøveperiode, intet vandmærke og ingen grænse for antal scanninger. Du må bruge de QR-koder, du laver, til både private og kommercielle formål, for eksempel visitkort, menukort, emballage og reklamer.'
      },
      {
        q: 'Kan jeg ændre en QR-kode, efter den er printet?',
        a: 'Nej. En statisk QR-kode kan ikke redigeres, fordi indholdet er en del af mønsteret. Hvis du regner med at ændre destinationen, så lav koden til en adresse, du selv styrer, for eksempel en side på din egen hjemmeside, og opdater i stedet den side.'
      },
      {
        q: 'Hvor stor skal en QR-kode printes?',
        a: 'Print den mindst 2 × 2 cm. En tommelfingerregel er, at koden skal være mindst en tiendedel af scanningsafstanden: En plakat, der læses fra 2 meters afstand, kræver en kode på cirka 20 cm. Til tryk skal du downloade en SVG eller en stor PNG og holde den rolige zone omkring koden tom.'
      },
      {
        q: 'Hvorfor kan min QR-kode ikke scannes?',
        a: 'De mest almindelige årsager er for lav kontrast mellem koden og baggrunden, en for lille rolig zone, et logo, der dækker for meget af koden, eller for meget indhold i forhold til den trykte størrelse. QRTurbo.app advarer dig om disse risici. Test altid koden med et par forskellige telefoner, før du printer.'
      },
      {
        q: 'Er mine data sikre? Kan I se min WiFi-adgangskode?',
        a: 'Dine data bliver på din enhed. QR-koden laves af kode, der kører i din browser, og intet af det, du skriver eller uploader, sendes til en server, så ingen kan se din WiFi-adgangskode eller dine kontaktoplysninger. Efter det første besøg virker generatoren også offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Gratis QR-kode generatorer'
  }
};
