// Page content for the pre-rendered Swedish pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR-kod för länk och text',
    title: 'Gratis QR-kodgenerator som aldrig slutar fungera | QRTurbo.app',
    description:
      'Skapa QR-koder gratis för länkar, WiFi, vCard och mer. Ingen registrering, ingen provperiod, ingen spårning. Koderna skapas i webbläsaren och går aldrig ut.',
    eyebrow: 'Gratis QR-kodgenerator',
    display: 'Gratis QR-koder som aldrig slutar fungera.',
    lead:
      'Skapa QR-koder för länkar, WiFi, kontakter och mycket mer, direkt i webbläsaren. Ingen registrering, ingen provperiod, inga omdirigeringar: ditt innehåll läggs direkt i koden, så den fungerar för alltid. Lägg till logotyp, färger och en ram med ”SKANNA MIG”.'
  },
  types: {
    wifi: {
      name: 'WiFi QR-kod',
      title: 'Skapa WiFi QR-kod gratis – privat och säkert | QRTurbo.app',
      description:
        'Skapa en WiFi QR-kod gratis så att gäster ansluter till nätverket med en skanning. Lösenordet stannar i webbläsaren. Ingen registrering, går aldrig ut.',
      eyebrow: 'Generator för WiFi QR-kod',
      display: 'Gästerna ansluter till ditt WiFi med en enda skanning.',
      lead:
        'Ange nätverksnamn och lösenord för att skapa en WiFi QR-kod. Lösenordet lämnar aldrig din enhet, och koden fungerar så länge nätverksinställningarna är desamma.',
      aboutTitle: 'Så fungerar WiFi QR-koder',
      about: [
        'En WiFi QR-kod innehåller nätverksnamnet (SSID), säkerhetstypen och lösenordet i ett standardformat som kameraappen på iPhone och Android förstår. När koden skannas erbjuder telefonen att ansluta till nätverket, så ingen behöver skriva in ett långt lösenord.',
        'Skriv ut koden för hemmet, kontoret, kaféet eller hyrstugan och sätt upp den där gästerna ser den. Om du byter lösenord eller nätverksnamn skapar du en ny kod.',
        'Många QR-kodgeneratorer på nätet skickar ditt lösenord till sina servrar. QRTurbo.app skapar koden i webbläsaren, så lösenordet laddas aldrig upp och sparas ingenstans.'
      ]
    },
    vcard: {
      name: 'vCard QR-kod',
      title: 'Gratis vCard QR-kod för visitkort | QRTurbo.app',
      description:
        'Skapa en vCard QR-kod gratis till ditt visitkort. En skanning sparar namn, telefon, e-post och adress i kontakterna. Ingen registrering, går aldrig ut.',
      eyebrow: 'Generator för vCard QR-kod',
      display: 'Dela dina kontaktuppgifter med en skanning.',
      lead:
        'Lägg till namn, telefonnummer, e-post och adress för att skapa en vCard QR-kod till visitkort, namnbrickor och e-postsignaturer. Uppgifterna finns i själva koden, inte på en server.',
      aboutTitle: 'Så fungerar vCard QR-koder',
      about: [
        'En vCard QR-kod innehåller ett digitalt visitkort i vCard-format. När någon skannar koden erbjuder telefonen att spara uppgifterna som en ny kontakt, så ingenting behöver skrivas in för hand.',
        'Fyll bara i de fält du vill dela. Ju fler uppgifter du lägger till, desto tätare blir koden, så skriv ut den minst 2,5 cm bred och testa den innan du beställer en stor upplaga visitkort.',
        'Eftersom uppgifterna kodas direkt i koden kan de inte ändras i efterhand. Om ditt telefonnummer eller din titel ändras skapar du en ny kod till nästa tryckning.'
      ]
    },
    sms: {
      name: 'QR-kod för SMS och samtal',
      title: 'Gratis QR-kod för SMS och telefonsamtal | QRTurbo.app',
      description:
        'Skapa en QR-kod gratis som öppnar ett sms eller ringer ett samtal. Lägg till ett förifyllt meddelande. Skapas i webbläsaren, ingen registrering.',
      eyebrow: 'QR-kodgenerator för SMS och samtal',
      display: 'Skicka ett sms eller ring upp med en skanning.',
      lead:
        'Skapa en QR-kod som öppnar ett förifyllt sms eller ringer ett telefonnummer. Den passar bra för kundtjänst, bokningar, tävlingar och serviceetiketter.',
      aboutTitle: 'Så fungerar QR-koder för SMS och samtal',
      about: [
        'En SMS QR-kod öppnar meddelandeappen med telefonnumret och ditt meddelande redan ifyllda, så den som skannar behöver bara trycka på skicka. En QR-kod för samtal öppnar telefonappen med numret klart att ringa.',
        'Ange alltid numret i internationellt format, till exempel +46 70 123 45 67, så att koden även fungerar för den som har ett utländskt abonnemang.',
        'Telefonen skickar aldrig meddelandet eller ringer samtalet automatiskt. Den som skannar bekräftar alltid först.'
      ]
    },
    email: {
      name: 'QR-kod för e-post',
      title: 'Gratis QR-kod för e-post med färdigt meddelande | QRTurbo.app',
      description:
        'Skapa en QR-kod för e-post gratis som öppnar ett nytt meddelande med mottagare, ämne och text ifyllda. Ingen registrering, ingen spårning, går aldrig ut.',
      eyebrow: 'QR-kodgenerator för e-post',
      display: 'Öppna ett färdigt e-postmeddelande med en skanning.',
      lead:
        'Lägg till mottagare, ämne och meddelande för att skapa en QR-kod för e-post till synpunkter, supportärenden, beställningar och anmälningar.',
      aboutTitle: 'Så fungerar QR-koder för e-post',
      about: [
        'En QR-kod för e-post innehåller en mailto-länk. När den skannas öppnas e-postappen med mottagare, ämne och meddelande redan ifyllda, och den som skannar bestämmer själv om meddelandet ska skickas.',
        'Håll det förifyllda meddelandet kort. Långa texter gör koden tätare och svårare att skanna på avstånd.',
        'Använd en tydlig ämnesrad, till exempel ”Synpunkter: bord 12”, så att du enkelt kan sortera meddelandena du får.'
      ]
    },
    event: {
      name: 'QR-kod för kalenderhändelse',
      title: 'Gratis QR-kod för evenemang – lägg till i kalendern | QRTurbo.app',
      description:
        'Skapa en QR-kod för kalenderhändelser gratis. En skanning lägger in titel, tid, plats och detaljer i kalendern. Skapas i webbläsaren, går aldrig ut.',
      eyebrow: 'QR-kodgenerator för kalenderhändelser',
      display: 'Lägg in ditt evenemang i deras kalender med en skanning.',
      lead:
        'Ange evenemangets titel, tid och plats för att skapa en QR-kod till inbjudningar, affischer, biljetter och mötesrum.',
      aboutTitle: 'Så fungerar QR-koder för evenemang',
      about: [
        'En QR-kod för evenemang innehåller en kalenderpost i iCalendar-format. När koden skannas kan man lägga in evenemanget i kalendern med rätt datum, tid och plats.',
        'Stödet för kalender-QR-koder varierar mellan telefoner och skannerappar. Testa koden med både en iPhone och en Android-telefon innan du skriver ut inbjudningarna.',
        'Fyll i platsfältet så att gästerna hittar adressen direkt från kalendern.'
      ]
    },
    location: {
      name: 'QR-kod för plats',
      title: 'Gratis QR-kod för plats och karta | QRTurbo.app',
      description:
        'Skapa en QR-kod för en plats gratis som öppnar en adress eller koordinater i en kartapp. Perfekt för inbjudningar och skyltar. Ingen registrering.',
      eyebrow: 'QR-kodgenerator för platser',
      display: 'Visa vägen med en skanning.',
      lead:
        'Ange en adress eller koordinater för att skapa en QR-kod som öppnar platsen i en kartapp. Använd den på inbjudningar, flygblad, skyltar och leveransinstruktioner.',
      aboutTitle: 'Så fungerar QR-koder för platser',
      about: [
        'En adress ger en QR-kod med en sökning i Google Maps, som öppnas i webbläsaren eller en kartapp på alla telefoner. Koordinater ger en geo-länk som öppnas direkt i telefonens förvalda kartapp.',
        'Koordinater är det mest exakta valet för platser utan gatuadress, till exempel en sommarstuga, en vandringsled eller infarten till ett evenemangsområde.',
        'Testa koden med din egen telefon och kontrollera att den pekar på exakt rätt plats.'
      ]
    },
    social: {
      name: 'QR-kod för sociala medier',
      title: 'Gratis QR-kod för Instagram och TikTok | QRTurbo.app',
      description:
        'Skapa en QR-kod gratis till din profil på Instagram, TikTok, YouTube, LinkedIn med flera. Skriv bara ditt användarnamn. Ingen registrering, ingen spårning.',
      eyebrow: 'QR-kodgenerator för sociala medier',
      display: 'Gör besökare i verkligheten till följare.',
      lead:
        'Välj plattform och ange ditt användarnamn för att skapa en QR-kod som öppnar din profil. Fungerar med Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky med flera.',
      aboutTitle: 'Så fungerar QR-koder för sociala medier',
      about: [
        'En QR-kod för sociala medier innehåller en länk till din profil. När koden skannas öppnas profilen i appen, om den är installerad, annars i webbläsaren.',
        'Skriv ditt användarnamn så bygger QRTurbo.app rätt profiladress för den valda plattformen. Du kan också klistra in en fullständig profil-URL.',
        'Sätt koden på förpackningar, visitkort, affischer och mässmontrar. Lägg till en ram med en kort uppmaning, till exempel ”Följ oss”, så att folk vet vad de kan förvänta sig.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR-kod',
      title: 'Gratis WhatsApp QR-kod som startar en chatt | QRTurbo.app',
      description:
        'Skapa en WhatsApp QR-kod gratis som öppnar en chatt med ditt nummer och ett förifyllt meddelande. Skapas i webbläsaren. Ingen registrering.',
      eyebrow: 'Generator för WhatsApp QR-kod',
      display: 'Starta en WhatsApp-chatt med en skanning.',
      lead:
        'Ange ditt telefonnummer eller WhatsApp-användarnamn och ett valfritt meddelande. Kunderna kan kontakta dig utan att först spara ditt nummer.',
      aboutTitle: 'Så fungerar WhatsApp QR-koder',
      about: [
        'En WhatsApp QR-kod innehåller en wa.me-länk. När koden skannas öppnas en chatt med dig, och ditt förifyllda meddelande är klart att skicka.',
        'Ange numret i internationellt format med landsnummer, till exempel +46 70 123 45 67. Mellanslag och bindestreck tas bort automatiskt.',
        'Koden innehåller själva wa.me-länken, inte en omdirigering, så den fungerar så länge numret används för WhatsApp.'
      ]
    },
    app: {
      name: 'QR-kod för appnedladdning',
      title: 'Gratis QR-kod för App Store och Google Play | QRTurbo.app',
      description:
        'Skapa en QR-kod gratis till appens nedladdningssida på App Store eller Google Play. Skapas i webbläsaren. Ingen registrering, inga omdirigeringar.',
      eyebrow: 'QR-kodgenerator för appnedladdning',
      display: 'Skicka folk direkt till din app.',
      lead:
        'Lägg till appens webbsida, länken till App Store och länken till Google Play för att skapa en QR-kod för appnedladdning.',
      aboutTitle: 'Så fungerar QR-koder för appnedladdning',
      about: [
        'En QR-kod rymmer en enda länk, och QRTurbo.app lägger aldrig till någon omdirigering. Om du har en webbsida som skickar iPhone-användare till App Store och Android-användare till Google Play, ange den som webb-URL för bäst resultat på alla telefoner.',
        'Utan en sådan sida väljer du vilken butikslänk koden ska öppna, eller skriver ut separata koder för App Store och Google Play.',
        'Kontrollera att butikslänkarna är offentliga och inte innehåller spårningsparametrar som du inte vill dela.'
      ]
    }
  },
  comparison: {
    title: 'Gratis QR-koder som aldrig slutar fungera',
    intro:
      'Många ”gratis” QR-kodgeneratorer skapar dynamiska koder som pekar på deras egen omdirigeringsserver. När provperioden tar slut stängs koden av, ofta när den redan har tryckts på menyer, visitkort eller förpackningar. QRTurbo.app fungerar annorlunda.',
    headers: {
      feature: 'Fråga',
      dynamic: 'Typisk QR-kod med ”gratis provperiod”',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Var lagras ditt innehåll?',
        dynamic: 'På leverantörens server, bakom en kort omdirigeringslänk',
        qrturbo: 'I själva QR-koden'
      },
      {
        feature: 'Vad händer när provperioden tar slut?',
        dynamic: 'Koden stängs av tills du betalar',
        qrturbo: 'Ingenting. Det finns ingen provperiod, och koden fortsätter att fungera'
      },
      {
        feature: 'Behöver du ett konto?',
        dynamic: 'Oftast ja',
        qrturbo: 'Nej'
      },
      {
        feature: 'Vem ser dina skanningar?',
        dynamic: 'Varje skanning passerar leverantören',
        qrturbo: 'Ingen. Skanningarna når aldrig oss'
      },
      {
        feature: 'Vad kostar det?',
        dynamic: 'En månads- eller årsprenumeration',
        qrturbo: 'Ingenting, inte ens vid kommersiell användning'
      }
    ],
    note:
      'Den enda nackdelen: en statisk QR-kod kan inte ändras efter tryck. Om du kan behöva byta mål senare, skapa koden till en sida du själv kontrollerar och uppdatera den sidan i stället.'
  },
  faq: {
    title: 'Vanliga frågor',
    items: [
      {
        q: 'Går QR-koder från QRTurbo.app ut?',
        a: 'Nej. QRTurbo.app skapar statiska QR-koder: din länk, text eller dina kontaktuppgifter kodas direkt i koden. Det finns ingen server emellan, så det finns inget som kan gå ut eller stängas av. En kod fungerar så länge innehållet är giltigt, till exempel så länge webbplatsen den länkar till finns kvar.'
      },
      {
        q: 'Varför slutade min QR-kod från en annan webbplats att fungera?',
        a: 'Många generatorer skapar dynamiska QR-koder som standard. De innehåller en kort länk till leverantörens server, som skickar varje skanning vidare till din riktiga adress. När en gratis provperiod eller prenumeration tar slut stänger leverantören av omdirigeringen, och den tryckta koden slutar fungera. Koder från QRTurbo.app innehåller ditt riktiga innehåll och är aldrig beroende av oss.'
      },
      {
        q: 'Är QRTurbo.app verkligen gratis? Får jag använda koderna kommersiellt?',
        a: 'Ja. Det finns ingen registrering, ingen provperiod, ingen vattenstämpel och ingen gräns för antalet skanningar. Du får använda QR-koderna du skapar både privat och kommersiellt, till exempel på visitkort, menyer, förpackningar och i reklam.'
      },
      {
        q: 'Kan jag ändra en QR-kod efter att den har tryckts?',
        a: 'Nej. En statisk QR-kod kan inte ändras, eftersom innehållet är en del av mönstret. Om du tror att du behöver byta mål, skapa koden till en adress du själv kontrollerar, till exempel en sida på din egen webbplats, och uppdatera den sidan i stället.'
      },
      {
        q: 'Hur stor ska en QR-kod vara i tryck?',
        a: 'Skriv ut den minst 2 × 2 cm. En tumregel är att koden ska vara minst en tiondel av skanningsavståndet: en affisch som läses på 2 meters håll behöver en kod på ungefär 20 cm. För tryck, ladda ner en SVG eller en stor PNG och håll den tysta zonen runt koden tom.'
      },
      {
        q: 'Varför går det inte att skanna min QR-kod?',
        a: 'De vanligaste orsakerna är för låg kontrast mellan koden och bakgrunden, för liten tyst zon, en logotyp som täcker för mycket av koden eller för mycket innehåll för den tryckta storleken. QRTurbo.app varnar dig för dessa risker. Testa alltid koden med några olika telefoner innan du skriver ut den.'
      },
      {
        q: 'Är mina uppgifter säkra? Kan ni se mitt WiFi-lösenord?',
        a: 'Dina uppgifter stannar på din enhet. QR-koden skapas av kod som körs i din webbläsare, och inget du skriver eller laddar upp skickas till en server, så ingen kan se ditt WiFi-lösenord eller dina kontaktuppgifter. Efter första besöket fungerar generatorn även offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Gratis QR-kodgeneratorer'
  }
};
