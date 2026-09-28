// Page content for the pre-rendered Norwegian pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR-kode for URL og tekst',
    title: 'Gratis QR-kode generator som aldri utløper | QRTurbo.app',
    description:
      'Lag gratis QR-koder for lenker, WiFi, vCard og mer. Ingen registrering, ingen prøveperiode, ingen sporing. Kodene lages i nettleseren og virker for alltid.',
    eyebrow: 'Gratis QR-kode generator',
    display: 'Gratis QR-koder som aldri slutter å virke.',
    lead:
      'Lag QR-koder for lenker, WiFi, kontakter og mer, rett i nettleseren. Ingen registrering, ingen prøveperiode, ingen omdirigeringer: innholdet legges rett inn i koden, så den virker for alltid. Legg til logo, farger og en «SKANN MEG»-ramme.'
  },
  types: {
    wifi: {
      name: 'WiFi QR-kode',
      title: 'Gratis WiFi QR-kode generator, privat og sikker | QRTurbo.app',
      description:
        'Lag en gratis WiFi QR-kode, så gjestene kobler seg på nettverket med én skanning. Passordet blir i nettleseren. Ingen registrering, ingen sporing.',
      eyebrow: 'WiFi QR-kode generator',
      display: 'Gjestene kobler seg på WiFi med én skanning.',
      lead:
        'Skriv inn nettverksnavn og passord for å lage en WiFi QR-kode. Passordet forlater aldri enheten din, og koden virker så lenge nettverksinnstillingene er de samme.',
      aboutTitle: 'Slik fungerer WiFi QR-koder',
      about: [
        'En WiFi QR-kode inneholder nettverksnavnet (SSID), sikkerhetstypen og passordet i et standardformat som kameraappene på iPhone og Android forstår. Når koden skannes, foreslår telefonen å koble til nettverket, så ingen trenger å taste inn et langt passord.',
        'Skriv ut koden til hjemmet, kontoret, kafeen eller utleiehytta, og heng den opp der gjestene ser den. Hvis du endrer passordet eller nettverksnavnet, må du lage en ny kode.',
        'Mange QR-kodegeneratorer på nett sender passordet ditt til sine servere. QRTurbo.app lager koden i nettleseren din, så passordet blir aldri lastet opp eller lagret noe sted.'
      ]
    },
    vcard: {
      name: 'vCard QR-kode',
      title: 'Gratis vCard QR-kode generator for visittkort | QRTurbo.app',
      description:
        'Lag en gratis vCard QR-kode til visittkortet ditt. Én skanning lagrer navn, telefon, e-post og adresse i kontaktene. Ingen registrering, utløper aldri.',
      eyebrow: 'vCard QR-kode generator',
      display: 'Del kontaktinformasjonen din med én skanning.',
      lead:
        'Legg inn navn, telefonnummer, e-post og adresse for å lage en vCard QR-kode til visittkort, navneskilt og e-postsignaturer. Opplysningene lagres i selve koden, ikke på en server.',
      aboutTitle: 'Slik fungerer vCard QR-koder',
      about: [
        'En vCard QR-kode inneholder et digitalt visittkort i vCard-formatet. Når noen skanner den, foreslår telefonen å lagre opplysningene som en ny kontakt, så ingenting må tastes inn for hånd.',
        'Fyll bare ut feltene du vil dele. Jo flere opplysninger du legger inn, desto tettere blir koden, så skriv den ut minst 2,5 cm bred og test den før du bestiller et stort opplag visittkort.',
        'Fordi opplysningene er kodet direkte i koden, kan de ikke endres i etterkant. Hvis telefonnummeret eller stillingstittelen din endres, lager du en ny kode til neste opplag.'
      ]
    },
    sms: {
      name: 'QR-kode for SMS og telefonsamtale',
      title: 'Gratis QR-kode generator for SMS og samtaler | QRTurbo.app',
      description:
        'Lag en gratis QR-kode som åpner en SMS eller ringer et nummer. Legg til ferdig utfylt SMS-tekst. Lages i nettleseren, ingen registrering, utløper aldri.',
      eyebrow: 'QR-kode generator for SMS og telefonsamtaler',
      display: 'Start en SMS eller en telefonsamtale med én skanning.',
      lead:
        'Lag en QR-kode som åpner en ferdig utfylt tekstmelding eller ringer et telefonnummer. Den passer godt til kundeservice, timebestilling, konkurranser og serviceklistremerker.',
      aboutTitle: 'Slik fungerer QR-koder for SMS og telefon',
      about: [
        'En SMS QR-kode åpner meldingsappen med telefonnummeret og meldingen allerede utfylt, så den som skanner, bare trenger å trykke send. En telefon-QR-kode åpner telefonappen med nummeret klart til å ringe.',
        'Skriv alltid inn nummeret i internasjonalt format, for eksempel +47 412 34 567, så fungerer koden også for folk med utenlandske telefoner.',
        'Telefonen sender aldri meldingen eller ringer automatisk. Den som skanner, må alltid bekrefte først.'
      ]
    },
    email: {
      name: 'QR-kode for e-post',
      title: 'Gratis QR-kode for e-post med ferdig utfylt tekst | QRTurbo.app',
      description:
        'Lag en gratis QR-kode som åpner en ny e-post med mottaker, emne og tekst ferdig utfylt. Ingen registrering, ingen sporing, utløper aldri.',
      eyebrow: 'QR-kode generator for e-post',
      display: 'Åpne en ferdig e-post med én skanning.',
      lead:
        'Legg inn mottaker, emne og melding for å lage en QR-kode for e-post til tilbakemeldinger, supporthenvendelser, bestillinger og påmeldinger.',
      aboutTitle: 'Slik fungerer QR-koder for e-post',
      about: [
        'En QR-kode for e-post inneholder en mailto-lenke. Når den skannes, åpnes e-postappen med mottaker, emne og melding allerede utfylt, og den som skanner, bestemmer selv om e-posten skal sendes.',
        'Hold den ferdig utfylte meldingen kort. Lange tekster gjør koden tettere og vanskeligere å skanne på avstand.',
        'Bruk en tydelig emnelinje, for eksempel «Tilbakemelding: bord 12», så blir det enkelt å sortere meldingene du får.'
      ]
    },
    event: {
      name: 'QR-kode for kalenderhendelse',
      title: 'Gratis QR-kode for hendelser i kalenderen | QRTurbo.app',
      description:
        'Lag en gratis QR-kode for en kalenderhendelse. Én skanning legger tittel, tid, sted og detaljer inn i kalenderen. Lages i nettleseren, utløper aldri.',
      eyebrow: 'QR-kode generator for kalenderhendelser',
      display: 'Få arrangementet ditt inn i kalenderen med én skanning.',
      lead:
        'Skriv inn tittel, tidspunkt og sted for å lage en QR-kode til invitasjoner, plakater, billetter og møterom.',
      aboutTitle: 'Slik fungerer QR-koder for hendelser',
      about: [
        'En QR-kode for hendelser inneholder en kalenderoppføring i iCalendar-formatet. Når den skannes, kan folk legge hendelsen inn i kalenderen med riktig dato, klokkeslett og sted.',
        'Støtten for kalender-QR-koder varierer mellom telefoner og skanneapper. Test koden med både en iPhone og en Android-telefon før du skriver ut invitasjonene.',
        'Fyll ut stedsfeltet, så finner gjestene adressen rett fra kalenderen.'
      ]
    },
    location: {
      name: 'QR-kode for sted',
      title: 'Gratis QR-kode generator for adresse og kart | QRTurbo.app',
      description:
        'Lag en gratis QR-kode som åpner en adresse eller koordinater i en kartapp. Perfekt til invitasjoner og skilt. Ingen registrering, utløper aldri.',
      eyebrow: 'QR-kode generator for sted',
      display: 'Vis veien med én skanning.',
      lead:
        'Skriv inn en adresse eller koordinater for å lage en QR-kode som åpner stedet i en kartapp. Bruk den på invitasjoner, flygeblader, skilt og leveringsinstrukser.',
      aboutTitle: 'Slik fungerer QR-koder for steder',
      about: [
        'En adresse gir en QR-kode med en søkelenke til Google Maps, som åpnes i en nettleser eller kartapp på alle telefoner. Koordinater gir en geo-lenke som åpnes direkte i telefonens standard kartapp.',
        'Koordinater er det mest presise valget for steder uten gateadresse, for eksempel en hytte, et startpunkt for en tur eller porten til et arrangementsområde.',
        'Test koden på din egen telefon for å sjekke at den peker nøyaktig til riktig sted.'
      ]
    },
    social: {
      name: 'QR-kode for sosiale medier',
      title: 'Gratis QR-kode for Instagram, TikTok og sosiale medier | QRTurbo.app',
      description:
        'Lag en gratis QR-kode til profilen din på Instagram, TikTok, YouTube, LinkedIn og mer. Skriv bare brukernavnet. Ingen registrering, utløper aldri.',
      eyebrow: 'QR-kode generator for sosiale medier',
      display: 'Gjør besøkende til følgere.',
      lead:
        'Velg en plattform og skriv inn brukernavnet ditt for å lage en QR-kode som åpner profilen din. Fungerer med Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky og flere.',
      aboutTitle: 'Slik fungerer QR-koder for sosiale medier',
      about: [
        'En QR-kode for sosiale medier inneholder en lenke til profilen din. Når den skannes, åpnes profilen i appen hvis den er installert, ellers i nettleseren.',
        'Skriv inn brukernavnet ditt, så lager QRTurbo.app riktig profiladresse for den valgte plattformen. Du kan også lime inn en full profil-URL.',
        'Sett koden på emballasje, visittkort, plakater og messestander. Legg til en ramme med en kort oppfordring, for eksempel «Følg oss», så folk vet hva de kan forvente.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR-kode',
      title: 'Gratis WhatsApp QR-kode generator for chat | QRTurbo.app',
      description:
        'Lag en gratis WhatsApp QR-kode som åpner en chat med nummeret ditt og en ferdig utfylt melding. Lages i nettleseren. Ingen registrering, utløper aldri.',
      eyebrow: 'WhatsApp QR-kode generator',
      display: 'Start en WhatsApp-chat med én skanning.',
      lead:
        'Skriv inn telefonnummeret eller WhatsApp-brukernavnet ditt og en valgfri melding. Kundene kan kontakte deg uten å lagre nummeret ditt først.',
      aboutTitle: 'Slik fungerer WhatsApp QR-koder',
      about: [
        'En WhatsApp QR-kode inneholder en wa.me-lenke. Når den skannes, åpnes en chat med deg, og den ferdig utfylte meldingen er klar til å sendes.',
        'Skriv inn nummeret i internasjonalt format med landskode, for eksempel +47 412 34 567. Mellomrom og bindestreker fjernes automatisk.',
        'Koden inneholder selve wa.me-lenken, ikke en omdirigering, så den virker så lenge nummeret bruker WhatsApp.'
      ]
    },
    app: {
      name: 'QR-kode for appnedlasting',
      title: 'Gratis QR-kode for App Store og Google Play | QRTurbo.app',
      description:
        'Lag en gratis QR-kode til appens nedlastingsside, App Store- eller Google Play-lenke. Lages i nettleseren. Ingen omdirigeringer, utløper aldri.',
      eyebrow: 'QR-kode generator for appnedlasting',
      display: 'Send folk rett til appen din.',
      lead:
        'Legg inn appens nettside, App Store-lenke og Google Play-lenke for å lage en QR-kode for nedlasting av appen.',
      aboutTitle: 'Slik fungerer QR-koder for appnedlasting',
      about: [
        'En QR-kode inneholder én lenke, og QRTurbo.app legger aldri til en omdirigering. Har du en nettside som sender iPhone-brukere til App Store og Android-brukere til Google Play, bruker du den som web-URL for best resultat på alle telefoner.',
        'Uten en slik side velger du hvilken butikklenke koden åpner, eller skriver ut separate koder for App Store og Google Play.',
        'Sjekk at butikklenkene er offentlige og ikke inneholder sporingsparametere du ikke vil dele.'
      ]
    }
  },
  comparison: {
    title: 'Gratis QR-koder som aldri slutter å virke',
    intro:
      'Mange «gratis» QR-kodegeneratorer lager dynamiske koder som peker til deres egen omdirigeringsserver. Når prøveperioden er over, slås koden av, ofte etter at den allerede er trykt på menyer, visittkort eller emballasje. QRTurbo.app fungerer annerledes.',
    headers: {
      feature: 'Spørsmål',
      dynamic: 'Typisk QR-kode med «gratis prøveperiode»',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Hvor lagres innholdet ditt?',
        dynamic: 'På leverandørens server, bak en kort omdirigeringslenke',
        qrturbo: 'I selve QR-koden'
      },
      {
        feature: 'Hva skjer når prøveperioden er over?',
        dynamic: 'Koden deaktiveres til du betaler',
        qrturbo: 'Ingenting. Det finnes ingen prøveperiode, og koden fortsetter å virke'
      },
      {
        feature: 'Trenger du en konto?',
        dynamic: 'Som regel ja',
        qrturbo: 'Nei'
      },
      {
        feature: 'Hvem ser skanningene dine?',
        dynamic: 'Hver skanning går via leverandøren',
        qrturbo: 'Ingen. Skanningene når aldri oss'
      },
      {
        feature: 'Hva koster det?',
        dynamic: 'Et månedlig eller årlig abonnement',
        qrturbo: 'Ingenting, heller ikke ved kommersiell bruk'
      }
    ],
    note:
      'Den eneste ulempen: en statisk QR-kode kan ikke endres etter at den er skrevet ut. Hvis du kanskje må endre målet senere, lager du koden for en side du selv styrer, og oppdaterer heller den siden.'
  },
  faq: {
    title: 'Ofte stilte spørsmål',
    items: [
      {
        q: 'Utløper QR-koder laget med QRTurbo.app?',
        a: 'Nei. QRTurbo.app lager statiske QR-koder: lenken, teksten eller kontaktinformasjonen din kodes direkte i koden. Det finnes ingen server i mellom, så det er ingenting som kan utløpe eller slås av. Koden virker så lenge innholdet er gyldig, for eksempel så lenge nettsiden den lenker til, finnes.'
      },
      {
        q: 'Hvorfor sluttet QR-koden min fra et annet nettsted å virke?',
        a: 'Mange generatorer lager dynamiske QR-koder som standard. De inneholder en kort lenke til leverandørens server, som videresender hver skanning til den egentlige adressen din. Når en gratis prøveperiode eller et abonnement utløper, slår leverandøren av videresendingen, og den trykte koden slutter å virke. Koder fra QRTurbo.app inneholder det faktiske innholdet ditt og er aldri avhengige av oss.'
      },
      {
        q: 'Er QRTurbo.app virkelig gratis? Kan jeg bruke kodene kommersielt?',
        a: 'Ja. Det er ingen registrering, ingen prøveperiode, intet vannmerke og ingen grense for antall skanninger. Du kan bruke QR-kodene du lager, både privat og kommersielt, for eksempel på visittkort, menyer, emballasje og reklame.'
      },
      {
        q: 'Kan jeg endre en QR-kode etter at den er skrevet ut?',
        a: 'Nei. En statisk QR-kode kan ikke redigeres, fordi innholdet er en del av mønsteret. Hvis du regner med å endre målet, lager du koden for en adresse du selv styrer, for eksempel en side på ditt eget nettsted, og oppdaterer heller den siden.'
      },
      {
        q: 'Hvor stor bør jeg skrive ut en QR-kode?',
        a: 'Skriv den ut i minst 2 × 2 cm. En tommelfingerregel er at koden bør være minst en tidel av skanneavstanden: en plakat som leses fra 2 meters avstand, trenger en kode på rundt 20 cm. Til trykk laster du ned en SVG eller en stor PNG og holder den rolige sonen rundt koden tom.'
      },
      {
        q: 'Hvorfor lar ikke QR-koden min seg skanne?',
        a: 'De vanligste årsakene er lav kontrast mellom koden og bakgrunnen, for liten rolig sone, en logo som dekker for mye av koden, eller for mye innhold i forhold til utskriftsstørrelsen. QRTurbo.app advarer deg om disse risikoene. Test alltid koden med noen forskjellige telefoner før du skriver den ut.'
      },
      {
        q: 'Er dataene mine trygge? Kan dere se WiFi-passordet mitt?',
        a: 'Dataene dine blir på enheten din. QR-koden lages av kode som kjører i nettleseren din, og ingenting du skriver eller laster opp, sendes til en server, så ingen kan se WiFi-passordet eller kontaktopplysningene dine. Etter første besøk fungerer generatoren også uten nett.'
      }
    ]
  },
  typeLinks: {
    title: 'Gratis QR-kode generatorer'
  }
};
