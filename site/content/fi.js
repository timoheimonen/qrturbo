// Page content for the pre-rendered Finnish pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'URL- ja teksti-QR-koodi',
    title: 'Ilmainen QR-koodigeneraattori, koodit eivät vanhene | QRTurbo.app',
    description:
      'Luo ilmaisia QR-koodeja linkeille, WiFi-verkoille, käyntikorteille ja muulle. Ei rekisteröitymistä eikä seurantaa: koodit toimivat ikuisesti.',
    eyebrow: 'Ilmainen QR-koodigeneraattori',
    display: 'Ilmaiset QR-koodit, jotka toimivat aina.',
    lead:
      'Luo QR-koodeja linkeille, WiFi-verkoille, yhteystiedoille ja muulle suoraan selaimessasi. Ei rekisteröitymistä, ei kokeilujaksoa, ei uudelleenohjauksia: sisältö tallentuu suoraan koodiin, joten se toimii ikuisesti. Lisää logo, värit ja ”SKANNAA MINUT” -kehys.'
  },
  types: {
    wifi: {
      name: 'WiFi-QR-koodi',
      title: 'Ilmainen WiFi-QR-koodi, turvallinen ja yksityinen | QRTurbo.app',
      description:
        'Luo ilmainen WiFi-QR-koodi, jolla vieraat pääsevät verkkoon yhdellä skannauksella. Salasana pysyy selaimessasi. Ei seurantaa, ei vanhene.',
      eyebrow: 'WiFi-QR-koodigeneraattori',
      display: 'Vieraat WiFi-verkkoon yhdellä skannauksella.',
      lead:
        'Syötä verkon nimi ja salasana, niin saat WiFi-QR-koodin. Salasana ei koskaan poistu laitteeltasi, ja koodi toimii niin kauan kuin verkon asetukset pysyvät samoina.',
      aboutTitle: 'Näin WiFi-QR-koodi toimii',
      about: [
        'WiFi-QR-koodi sisältää verkon nimen (SSID), suojaustyypin ja salasanan vakiomuodossa, jonka iPhonen ja Androidin kamerasovellukset tunnistavat. Skannattaessa puhelin tarjoutuu liittymään verkkoon, joten pitkää salasanaa ei tarvitse näppäillä.',
        'Tulosta koodi kotiin, toimistoon, kahvilaan tai vuokramökille ja sijoita se paikkaan, jossa vieraat näkevät sen. Jos vaihdat salasanan tai verkon nimen, luo uusi koodi.',
        'Monet verkon QR-generaattorit lähettävät salasanasi palvelimilleen. QRTurbo.app luo koodin selaimessasi, joten salasanaasi ei koskaan lähetetä tai tallenneta mihinkään.'
      ]
    },
    vcard: {
      name: 'vCard-QR-koodi',
      title: 'Ilmainen vCard-QR-koodi käyntikorttiin | QRTurbo.app',
      description:
        'Luo ilmainen vCard-QR-koodi käyntikorttiisi. Yksi skannaus tallentaa nimesi, numerosi, sähköpostisi ja osoitteesi yhteystietoihin. Ei vanhene.',
      eyebrow: 'vCard-QR-koodigeneraattori',
      display: 'Jaa yhteystietosi yhdellä skannauksella.',
      lead:
        'Lisää nimesi, puhelinnumerosi, sähköpostiosoitteesi ja osoitteesi, niin saat vCard-QR-koodin käyntikortteihin, nimikyltteihin ja sähköpostin allekirjoitukseen. Tiedot tallentuvat itse koodiin, eivät palvelimelle.',
      aboutTitle: 'Näin vCard-QR-koodi toimii',
      about: [
        'vCard-QR-koodi sisältää digitaalisen käyntikortin vCard-muodossa. Kun joku skannaa sen, puhelin tarjoutuu tallentamaan tiedot uudeksi yhteystiedoksi, joten mitään ei tarvitse kirjoittaa käsin.',
        'Täytä vain ne kentät, jotka haluat jakaa. Mitä enemmän tietoja lisäät, sitä tiheämpi koodista tulee, joten tulosta se vähintään 2,5 cm leveänä ja testaa se ennen kuin tilaat ison erän kortteja.',
        'Koska tiedot on koodattu suoraan koodiin, niitä ei voi muuttaa jälkikäteen. Jos puhelinnumerosi tai tehtävänimikkeesi vaihtuu, luo uusi koodi seuraavaan painokseen.'
      ]
    },
    sms: {
      name: 'Tekstiviesti- ja puhelu-QR-koodi',
      title: 'Ilmainen QR-koodi tekstiviestiin ja puheluun | QRTurbo.app',
      description:
        'Luo ilmainen QR-koodi, joka avaa tekstiviestin tai aloittaa puhelun. Lisää valmis viesti. Luodaan selaimessa, ei rekisteröitymistä, ei vanhene.',
      eyebrow: 'QR-koodi tekstiviestiin ja puheluun',
      display: 'Tekstiviesti tai puhelu yhdellä skannauksella.',
      lead:
        'Luo QR-koodi, joka avaa valmiiksi kirjoitetun tekstiviestin tai valitsee puhelinnumeron. Se sopii asiakaspalveluun, ajanvarauksiin, kilpailuihin ja huoltotarroihin.',
      aboutTitle: 'Näin tekstiviesti- ja puhelu-QR-koodit toimivat',
      about: [
        'Tekstiviesti-QR-koodi avaa viestisovelluksen, jossa puhelinnumero ja viestisi ovat jo valmiina, joten skannaajan tarvitsee vain painaa Lähetä. Puhelu-QR-koodi avaa puhelinsovelluksen numero valmiiksi näppäiltynä.',
        'Syötä numero aina kansainvälisessä muodossa, esimerkiksi +358 40 123 4567, jotta koodi toimii myös ulkomaisilla liittymillä.',
        'Puhelin ei koskaan lähetä viestiä tai soita puhelua automaattisesti. Skannaaja vahvistaa sen aina ensin.'
      ]
    },
    email: {
      name: 'Sähköposti-QR-koodi',
      title: 'Ilmainen sähköposti-QR-koodi valmiilla viestillä | QRTurbo.app',
      description:
        'Luo ilmainen sähköposti-QR-koodi, joka avaa uuden viestin, jossa vastaanottaja, aihe ja teksti ovat valmiina. Ei seurantaa, ei vanhene.',
      eyebrow: 'Sähköposti-QR-koodigeneraattori',
      display: 'Valmis sähköposti yhdellä skannauksella.',
      lead:
        'Lisää vastaanottaja, aihe ja viesti, niin saat sähköposti-QR-koodin palautteeseen, tukipyyntöihin, tilauksiin ja ilmoittautumisiin.',
      aboutTitle: 'Näin sähköposti-QR-koodi toimii',
      about: [
        'Sähköposti-QR-koodi sisältää mailto-linkin. Skannaus avaa sähköpostisovelluksen, jossa vastaanottaja, aihe ja viesti ovat valmiina, ja skannaaja päättää itse, lähettääkö viestin.',
        'Pidä valmis viesti lyhyenä. Pitkä teksti tekee koodista tiheämmän ja vaikeamman skannata kaukaa.',
        'Käytä selkeää aiheriviä, kuten ”Palaute: pöytä 12”, niin saapuneet viestit on helppo lajitella.'
      ]
    },
    event: {
      name: 'Kalenteritapahtuman QR-koodi',
      title: 'Ilmainen tapahtuma-QR-koodi kalenteriin | QRTurbo.app',
      description:
        'Luo ilmainen kalenteritapahtuman QR-koodi. Yksi skannaus lisää nimen, ajan, paikan ja lisätiedot kalenteriin. Luodaan selaimessa, ei vanhene.',
      eyebrow: 'Tapahtuma-QR-koodigeneraattori',
      display: 'Tapahtumasi kalenteriin yhdellä skannauksella.',
      lead:
        'Syötä tapahtuman nimi, aika ja paikka, niin saat QR-koodin kutsuihin, julisteisiin, lippuihin ja kokoushuoneisiin.',
      aboutTitle: 'Näin tapahtuma-QR-koodi toimii',
      about: [
        'Tapahtuma-QR-koodi sisältää kalenterimerkinnän iCalendar-muodossa. Skannaamalla sen tapahtuman voi lisätä kalenteriin oikealla päivämäärällä, kellonajalla ja paikalla.',
        'Kalenteri-QR-koodien tuki vaihtelee puhelimien ja skannaussovellusten välillä. Testaa koodi sekä iPhonella että Android-puhelimella ennen kuin tulostat kutsut.',
        'Täytä sijaintikenttä, jotta vieraat löytävät osoitteen suoraan kalenteristaan.'
      ]
    },
    location: {
      name: 'Sijainti-QR-koodi',
      title: 'Ilmainen sijainti-QR-koodi karttasovellukseen | QRTurbo.app',
      description:
        'Luo ilmainen sijainti-QR-koodi, joka avaa osoitteen tai koordinaatit karttasovelluksessa. Sopii kutsuihin ja kyltteihin. Ei vanhene koskaan.',
      eyebrow: 'Sijainti-QR-koodigeneraattori',
      display: 'Näytä tie yhdellä skannauksella.',
      lead:
        'Syötä osoite tai koordinaatit, niin saat QR-koodin, joka avaa sijainnin karttasovelluksessa. Käytä sitä kutsuissa, esitteissä, kylteissä ja toimitusohjeissa.',
      aboutTitle: 'Näin sijainti-QR-koodi toimii',
      about: [
        'Osoitteesta syntyy QR-koodi, jossa on Google Maps -hakulinkki. Se aukeaa selaimessa tai karttasovelluksessa millä tahansa puhelimella. Koordinaateista syntyy geo-linkki, joka aukeaa suoraan puhelimen oletuskarttasovelluksessa.',
        'Koordinaatit ovat tarkin vaihtoehto paikoille, joilla ei ole katuosoitetta, kuten mökille, retkeilyreitin lähtöpisteeseen tai tapahtuma-alueen portille.',
        'Testaa koodi omalla puhelimellasi ja varmista, että se osoittaa juuri oikeaan paikkaan.'
      ]
    },
    social: {
      name: 'Sosiaalisen median QR-koodi',
      title: 'Ilmainen some-QR-koodi Instagramiin ja TikTokiin | QRTurbo.app',
      description:
        'Luo ilmainen QR-koodi Instagram-, TikTok-, YouTube-, LinkedIn- tai muuhun profiiliisi. Kirjoita vain käyttäjänimesi. Ei seurantaa, ei vanhene.',
      eyebrow: 'Sosiaalisen median QR-koodigeneraattori',
      display: 'Muuta ohikulkijat seuraajiksi.',
      lead:
        'Valitse palvelu ja syötä käyttäjänimesi, niin saat QR-koodin, joka avaa profiilisi. Se toimii Instagramin, TikTokin, YouTuben, Facebookin, X:n, LinkedInin, Threadsin, Blueskyn ja monen muun kanssa.',
      aboutTitle: 'Näin sosiaalisen median QR-koodi toimii',
      about: [
        'Sosiaalisen median QR-koodi sisältää linkin profiiliisi. Skannaus avaa profiilin sovelluksessa, jos se on asennettu, ja muuten selaimessa.',
        'Kirjoita käyttäjänimesi, niin QRTurbo.app muodostaa valitulle palvelulle oikean profiiliosoitteen. Voit myös liittää profiilin koko URL-osoitteen.',
        'Laita koodi pakkauksiin, käyntikortteihin, julisteisiin ja messuosastoille. Lisää kehys ja lyhyt kehotus, kuten ”Seuraa meitä”, jotta ihmiset tietävät, mitä odottaa.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp-QR-koodi',
      title: 'Ilmainen WhatsApp-QR-koodi keskusteluun | QRTurbo.app',
      description:
        'Luo ilmainen WhatsApp-QR-koodi, joka avaa keskustelun kanssasi valmiin viestin kera. Luodaan selaimessa. Ei rekisteröitymistä, ei vanhene.',
      eyebrow: 'WhatsApp-QR-koodigeneraattori',
      display: 'Aloita WhatsApp-keskustelu yhdellä skannauksella.',
      lead:
        'Syötä puhelinnumerosi tai WhatsApp-käyttäjänimesi ja halutessasi viesti. Asiakkaat voivat ottaa yhteyttä tallentamatta numeroasi ensin.',
      aboutTitle: 'Näin WhatsApp-QR-koodi toimii',
      about: [
        'WhatsApp-QR-koodi sisältää wa.me-linkin. Skannaus avaa keskustelun kanssasi, ja valmis viestisi odottaa lähettämistä.',
        'Syötä numero kansainvälisessä muodossa maatunnuksen kanssa, esimerkiksi +358 40 123 4567. Välilyönnit ja väliviivat poistetaan automaattisesti.',
        'Koodi sisältää itse wa.me-linkin eikä uudelleenohjausta, joten se toimii niin kauan kuin numero on WhatsAppin käytössä.'
      ]
    },
    app: {
      name: 'Sovelluksen lataus-QR-koodi',
      title: 'Ilmainen QR-koodi App Storeen ja Google Playhin | QRTurbo.app',
      description:
        'Luo ilmainen QR-koodi sovelluksesi lataussivulle tai App Store- ja Google Play -linkkiin. Luodaan selaimessa. Ei uudelleenohjauksia, ei vanhene.',
      eyebrow: 'Sovelluksen lataus-QR-koodigeneraattori',
      display: 'Ohjaa ihmiset suoraan sovellukseesi.',
      lead:
        'Lisää sovelluksesi verkkosivu, App Store -linkki ja Google Play -linkki, niin saat QR-koodin sovelluksen lataamiseen.',
      aboutTitle: 'Näin sovelluksen lataus-QR-koodi toimii',
      about: [
        'QR-koodi sisältää yhden linkin, eikä QRTurbo.app koskaan lisää uudelleenohjausta. Jos sinulla on verkkosivu, joka ohjaa iPhonen käyttäjät App Storeen ja Androidin käyttäjät Google Playhin, käytä sitä web-URL-osoitteena, niin koodi toimii parhaiten kaikilla puhelimilla.',
        'Jos tällaista sivua ei ole, valitse, kumman kaupan linkin koodi avaa, tai tulosta erilliset koodit App Storelle ja Google Playlle.',
        'Tarkista, että kauppalinkit ovat julkisia eivätkä sisällä seurantaparametreja, joita et halua jakaa.'
      ]
    }
  },
  comparison: {
    title: 'Ilmaiset QR-koodit, jotka eivät lakkaa toimimasta',
    intro:
      'Monet ”ilmaiset” QR-koodigeneraattorit luovat dynaamisia koodeja, jotka osoittavat niiden omalle uudelleenohjauspalvelimelle. Kun kokeilujakso päättyy, koodi kytketään pois päältä, usein vasta kun se on jo painettu ruokalistoihin, käyntikortteihin tai pakkauksiin. QRTurbo.app toimii toisin.',
    headers: {
      feature: 'Kysymys',
      dynamic: 'Tyypillinen ”ilmaisen kokeilun” QR-koodi',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Missä sisältösi säilytetään?',
        dynamic: 'Palveluntarjoajan palvelimella lyhyen uudelleenohjauslinkin takana',
        qrturbo: 'Itse QR-koodissa'
      },
      {
        feature: 'Mitä tapahtuu, kun kokeilujakso päättyy?',
        dynamic: 'Koodi poistetaan käytöstä, kunnes maksat',
        qrturbo: 'Ei mitään. Kokeilujaksoa ei ole, ja koodi toimii edelleen'
      },
      {
        feature: 'Tarvitaanko käyttäjätili?',
        dynamic: 'Yleensä kyllä',
        qrturbo: 'Ei'
      },
      {
        feature: 'Kuka näkee skannauksesi?',
        dynamic: 'Jokainen skannaus kulkee palveluntarjoajan kautta',
        qrturbo: 'Ei kukaan. Skannaukset eivät koskaan kulje kauttamme'
      },
      {
        feature: 'Paljonko se maksaa?',
        dynamic: 'Kuukausi- tai vuosimaksu',
        qrturbo: 'Ei mitään, ei edes kaupallisessa käytössä'
      }
    ],
    note:
      'Ainoa kompromissi: staattista QR-koodia ei voi muokata painamisen jälkeen. Jos saatat myöhemmin haluta vaihtaa kohdetta, tee koodi sivulle, jota hallitset itse, ja päivitä sen sijaan sitä sivua.'
  },
  faq: {
    title: 'Usein kysytyt kysymykset',
    items: [
      {
        q: 'Vanhenevatko QRTurbo.appilla tehdyt QR-koodit?',
        a: 'Eivät. QRTurbo.app luo staattisia QR-koodeja: linkkisi, tekstisi tai yhteystietosi koodataan suoraan koodiin. Välissä ei ole palvelinta, joten mikään ei voi vanhentua tai kytkeytyä pois päältä. Koodi toimii niin kauan kuin sen sisältö on voimassa, esimerkiksi niin kauan kuin linkitetty verkkosivu on olemassa.'
      },
      {
        q: 'Miksi toisella sivustolla tehty QR-koodini lakkasi toimimasta?',
        a: 'Monet generaattorit luovat oletuksena dynaamisia QR-koodeja. Ne sisältävät lyhyen linkin palveluntarjoajan palvelimelle, joka ohjaa jokaisen skannauksen varsinaiseen osoitteeseesi. Kun ilmainen kokeilu tai tilaus päättyy, palveluntarjoaja katkaisee uudelleenohjauksen ja painettu koodi lakkaa toimimasta. QRTurbo.appin koodit sisältävät varsinaisen sisältösi eivätkä ole koskaan riippuvaisia meistä.'
      },
      {
        q: 'Onko QRTurbo.app oikeasti ilmainen? Saanko käyttää koodeja kaupallisesti?',
        a: 'On ja saat. Ei rekisteröitymistä, ei kokeilujaksoa, ei vesileimaa eikä skannausrajoja. Voit käyttää luomiasi QR-koodeja sekä henkilökohtaisiin että kaupallisiin tarkoituksiin, kuten käyntikortteihin, ruokalistoihin, pakkauksiin ja mainontaan.'
      },
      {
        q: 'Voinko muuttaa QR-koodia painamisen jälkeen?',
        a: 'Et. Staattista QR-koodia ei voi muokata, koska sisältö on osa kuviota. Jos arvelet kohteen muuttuvan, tee koodi osoitteelle, jota hallitset itse, kuten omalle verkkosivullesi, ja päivitä sen sijaan sitä sivua.'
      },
      {
        q: 'Kuinka suureksi QR-koodi kannattaa tulostaa?',
        a: 'Tulosta se vähintään 2 × 2 cm:n kokoisena. Nyrkkisääntönä koodin koon tulisi olla vähintään kymmenesosa skannausetäisyydestä: 2 metrin päästä luettava juliste tarvitsee noin 20 cm:n koodin. Lataa painatusta varten SVG tai suuri PNG ja jätä koodin ympärille tyhjä marginaali eli hiljainen vyöhyke.'
      },
      {
        q: 'Miksi QR-koodini ei skannaudu?',
        a: 'Yleisimmät syyt ovat heikko kontrasti koodin ja taustan välillä, liian pieni hiljainen vyöhyke, liian suuren osan koodista peittävä logo tai liian paljon sisältöä tulostuskokoon nähden. QRTurbo.app varoittaa näistä riskeistä. Testaa koodi aina muutamalla eri puhelimella ennen tulostamista.'
      },
      {
        q: 'Ovatko tietoni turvassa? Näettekö WiFi-salasanani?',
        a: 'Tietosi pysyvät laitteellasi. QR-koodi luodaan selaimessasi suoritettavalla koodilla, eikä mitään kirjoittamaasi tai lataamaasi lähetetä palvelimelle, joten kukaan ei näe WiFi-salasanaasi tai yhteystietojasi. Ensimmäisen käynnin jälkeen generaattori toimii myös ilman verkkoyhteyttä.'
      }
    ]
  },
  typeLinks: {
    title: 'Ilmaiset QR-koodigeneraattorit'
  }
};
