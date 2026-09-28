// Page content for the pre-rendered Italian pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR code per URL e testo',
    title: 'Generatore di QR Code Gratis che Non Scade Mai | QRTurbo.app',
    description:
      'Crea QR code gratis per link, WiFi, vCard e altro. Senza registrazione, prove o tracciamento: i codici nascono nel browser e funzionano per sempre.',
    eyebrow: 'Generatore di codici QR gratis',
    display: 'QR code gratis che non smettono mai di funzionare.',
    lead:
      'Crea codici QR per link, WiFi, contatti e altro, direttamente nel browser. Niente registrazione, niente periodo di prova, niente reindirizzamenti: il contenuto finisce dritto nel codice, che quindi funziona per sempre. Aggiungi loghi, colori e una cornice «INQUADRAMI».'
  },
  types: {
    wifi: {
      name: 'QR code WiFi',
      title: 'QR Code WiFi Gratis: Generatore Privato e Sicuro | QRTurbo.app',
      description:
        'Crea gratis un QR code WiFi: gli ospiti si connettono alla rete con una scansione. La password resta nel browser. Niente registrazione né tracciamento.',
      eyebrow: 'Generatore di QR code WiFi',
      display: 'Gli ospiti si connettono al WiFi con una sola scansione.',
      lead:
        'Inserisci il nome della rete e la password per creare un QR code WiFi. La password non lascia mai il tuo dispositivo e il codice funziona finché le impostazioni della rete restano invariate.',
      aboutTitle: 'Come funzionano i QR code WiFi',
      about: [
        'Un QR code WiFi contiene il nome della rete (SSID), il tipo di sicurezza e la password in un formato standard riconosciuto dalle app fotocamera di iPhone e Android. Inquadrandolo, il telefono propone di connettersi alla rete, così nessuno deve digitare una password lunga.',
        'Stampa il codice per casa, ufficio, bar o casa vacanze e mettilo dove gli ospiti possano vederlo. Se cambi la password o il nome della rete, crea un nuovo codice.',
        'Molti generatori online inviano la tua password ai loro server. QRTurbo.app crea il codice nel browser, quindi la password non viene mai caricata né salvata da nessuna parte.'
      ]
    },
    vcard: {
      name: 'QR code vCard',
      title: 'QR Code vCard Gratis per Biglietti da Visita | QRTurbo.app',
      description:
        'Crea gratis un QR code vCard per il biglietto da visita. Con una scansione nome, telefono, email e indirizzo finiscono in rubrica. Non scade mai.',
      eyebrow: 'Generatore di QR code vCard',
      display: 'Condividi i tuoi contatti con una sola scansione.',
      lead:
        'Aggiungi nome, numero di telefono, email e indirizzo per creare un QR code vCard da usare su biglietti da visita, badge e firme email. I dati sono salvati nel codice stesso, non su un server.',
      aboutTitle: 'Come funzionano i QR code vCard',
      about: [
        'Un QR code vCard contiene un biglietto da visita digitale in formato vCard. Chi lo inquadra può salvare i dati come nuovo contatto sul telefono, senza digitare nulla a mano.',
        'Compila solo i campi che vuoi condividere. Più dati aggiungi, più il codice diventa fitto: stampalo largo almeno 2,5 cm e provalo prima di ordinare una grande tiratura di biglietti.',
        'Poiché i dati sono codificati direttamente nel codice, non possono essere modificati in seguito. Se cambiano il tuo numero di telefono o il tuo ruolo, crea un nuovo codice per la prossima ristampa.'
      ]
    },
    sms: {
      name: 'QR code per SMS e chiamate',
      title: 'QR Code per SMS e Chiamate Gratis | QRTurbo.app',
      description:
        'Crea gratis un QR code che apre un SMS o avvia una chiamata, con testo precompilato. Creato nel browser, senza registrazione, non scade mai.',
      eyebrow: 'Generatore di QR code per SMS e chiamate',
      display: 'Avvia un SMS o una chiamata con una sola scansione.',
      lead:
        'Crea un QR code che apre un SMS precompilato o compone un numero di telefono. È ideale per assistenza clienti, prenotazioni, concorsi e adesivi dell’assistenza tecnica.',
      aboutTitle: 'Come funzionano i QR code per SMS e chiamate',
      about: [
        'Un QR code SMS apre l’app dei messaggi con il numero e il testo già inseriti: a chi lo inquadra basta premere Invia. Un QR code telefonico apre il tastierino con il numero pronto da chiamare.',
        'Inserisci sempre il numero in formato internazionale, per esempio +39 312 345 6789, così il codice funziona anche con i telefoni stranieri.',
        'Il telefono non invia mai il messaggio né avvia la chiamata in automatico: chi scansiona deve sempre confermare.'
      ]
    },
    email: {
      name: 'QR code email',
      title: 'QR Code Email Gratis con Messaggio Precompilato | QRTurbo.app',
      description:
        'Crea gratis un QR code email che apre un nuovo messaggio con destinatario, oggetto e testo già compilati. Niente registrazione né tracciamento.',
      eyebrow: 'Generatore di QR code email',
      display: 'Apri un’email pronta da inviare con una sola scansione.',
      lead:
        'Aggiungi destinatario, oggetto e messaggio per creare un QR code email per feedback, richieste di assistenza, ordini e iscrizioni.',
      aboutTitle: 'Come funzionano i QR code email',
      about: [
        'Un QR code email contiene un link mailto. Inquadrandolo si apre l’app di posta con destinatario, oggetto e messaggio già compilati, e chi scansiona decide se inviarlo.',
        'Mantieni breve il messaggio precompilato. I testi lunghi rendono il codice più fitto e più difficile da leggere a distanza.',
        'Usa un oggetto chiaro, come «Feedback: tavolo 12», così potrai smistare facilmente i messaggi ricevuti.'
      ]
    },
    event: {
      name: 'QR code evento calendario',
      title: 'QR Code Evento Gratis: Aggiungi al Calendario | QRTurbo.app',
      description:
        'Crea gratis un QR code per eventi. Con una scansione titolo, orario, luogo e dettagli finiscono nel calendario. Creato nel browser, non scade mai.',
      eyebrow: 'Generatore di QR code per eventi',
      display: 'Porta il tuo evento nel loro calendario con una scansione.',
      lead:
        'Inserisci titolo, orario e luogo dell’evento per creare un QR code per inviti, locandine, biglietti e sale riunioni.',
      aboutTitle: 'Come funzionano i QR code per eventi',
      about: [
        'Un QR code evento contiene una voce di calendario in formato iCalendar. Inquadrandolo, si può aggiungere l’evento al calendario con data, ora e luogo corretti.',
        'Il supporto dei QR code per il calendario varia tra telefoni e app di scansione. Prova il codice sia con un iPhone sia con un telefono Android prima di stampare gli inviti.',
        'Compila il campo del luogo, così gli invitati troveranno l’indirizzo direttamente nel calendario.'
      ]
    },
    location: {
      name: 'QR code posizione',
      title: 'QR Code Posizione Gratis per Mappe | QRTurbo.app',
      description:
        'Crea gratis un QR code che apre un indirizzo o delle coordinate in un’app di mappe. Ideale per inviti e cartelli. Senza registrazione, non scade mai.',
      eyebrow: 'Generatore di QR code per posizioni',
      display: 'Indica la strada con una sola scansione.',
      lead:
        'Inserisci un indirizzo o delle coordinate per creare un QR code che apre la posizione in un’app di mappe. Usalo su inviti, volantini, cartelli e istruzioni di consegna.',
      aboutTitle: 'Come funzionano i QR code di posizione',
      about: [
        'Un indirizzo genera un QR code con un link di ricerca di Google Maps, che si apre nel browser o in un’app di mappe su qualsiasi telefono. Le coordinate generano un link geo che si apre direttamente nell’app di mappe predefinita del telefono.',
        'Le coordinate sono la scelta più precisa per i luoghi senza indirizzo, come una baita, l’inizio di un sentiero o l’ingresso dell’area di un evento.',
        'Prova il codice sul tuo telefono per verificare che punti esattamente al posto giusto.'
      ]
    },
    social: {
      name: 'QR code social',
      title: 'QR Code Social Gratis per Instagram e TikTok | QRTurbo.app',
      description:
        'Crea gratis un QR code per il tuo profilo Instagram, TikTok, YouTube, LinkedIn o altro. Basta il nome utente. Niente registrazione, non scade mai.',
      eyebrow: 'Generatore di QR code per i social',
      display: 'Trasforma chi ti incontra dal vivo in follower.',
      lead:
        'Scegli una piattaforma e inserisci il tuo nome utente per creare un QR code che apre il tuo profilo. Funziona con Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky e altri.',
      aboutTitle: 'Come funzionano i QR code per i social',
      about: [
        'Un QR code social contiene un link al tuo profilo. Inquadrandolo, il profilo si apre nell’app, se è installata, oppure nel browser.',
        'Scrivi il tuo nome utente e QRTurbo.app crea l’indirizzo corretto del profilo per la piattaforma selezionata. Puoi anche incollare l’URL completo del profilo.',
        'Metti il codice su confezioni, biglietti da visita, locandine e stand. Aggiungi una cornice con un breve invito all’azione, come «Seguici», così le persone sanno cosa aspettarsi.'
      ]
    },
    whatsapp: {
      name: 'QR code WhatsApp',
      title: 'QR Code WhatsApp Gratis per Avviare una Chat | QRTurbo.app',
      description:
        'Crea gratis un QR code WhatsApp che apre una chat con il tuo numero e un messaggio precompilato. Creato nel browser, senza registrazione, non scade.',
      eyebrow: 'Generatore di QR code WhatsApp',
      display: 'Avvia una chat WhatsApp con una sola scansione.',
      lead:
        'Inserisci il tuo numero di telefono o nome utente WhatsApp e, se vuoi, un messaggio. I clienti possono contattarti senza dover prima salvare il tuo numero.',
      aboutTitle: 'Come funzionano i QR code WhatsApp',
      about: [
        'Un QR code WhatsApp contiene un link wa.me. Inquadrandolo si apre una chat con te, con il messaggio precompilato pronto da inviare.',
        'Inserisci il numero in formato internazionale con il prefisso del paese, per esempio +39 312 345 6789. Spazi e trattini vengono rimossi automaticamente.',
        'Il codice contiene direttamente il link wa.me, non un reindirizzamento, quindi continua a funzionare finché il numero usa WhatsApp.'
      ]
    },
    app: {
      name: 'QR code per scaricare app',
      title: 'QR Code Gratis per App Store e Google Play | QRTurbo.app',
      description:
        'Crea gratis un QR code per la pagina di download della tua app o per App Store e Google Play. Creato nel browser, senza registrazione né redirect.',
      eyebrow: 'Generatore di QR code per app',
      display: 'Porta le persone dritte alla tua app.',
      lead:
        'Aggiungi la pagina web della tua app, il link all’App Store e quello a Google Play per creare un QR code per scaricare l’app.',
      aboutTitle: 'Come funzionano i QR code per scaricare app',
      about: [
        'Un QR code contiene un solo link e QRTurbo.app non aggiunge mai reindirizzamenti. Se hai una pagina web che manda gli utenti iPhone all’App Store e quelli Android a Google Play, usala come URL web per ottenere il risultato migliore su ogni telefono.',
        'Se non hai una pagina del genere, scegli quale link allo store aprirà il codice, oppure stampa codici separati per App Store e Google Play.',
        'Verifica che i link agli store siano pubblici e non contengano parametri di tracciamento che non vuoi condividere.'
      ]
    }
  },
  comparison: {
    title: 'QR code gratis che non smettono mai di funzionare',
    intro:
      'Molti generatori di QR code «gratuiti» creano codici dinamici che puntano al proprio server di reindirizzamento. Alla fine del periodo di prova il codice viene disattivato, spesso quando è già stato stampato su menu, biglietti da visita o confezioni. QRTurbo.app funziona in modo diverso.',
    headers: {
      feature: 'Domanda',
      dynamic: 'Tipico QR code «in prova gratuita»',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Dove è salvato il tuo contenuto?',
        dynamic: 'Sul server del fornitore, dietro un link breve di reindirizzamento',
        qrturbo: 'Dentro il QR code stesso'
      },
      {
        feature: 'Cosa succede alla fine della prova?',
        dynamic: 'Il codice viene disattivato finché non paghi',
        qrturbo: 'Niente. Non c’è alcuna prova e il codice continua a funzionare'
      },
      {
        feature: 'Serve un account?',
        dynamic: 'Di solito sì',
        qrturbo: 'No'
      },
      {
        feature: 'Chi vede le tue scansioni?',
        dynamic: 'Ogni scansione passa dal fornitore',
        qrturbo: 'Nessuno. Le scansioni non arrivano mai a noi'
      },
      {
        feature: 'Quanto costa?',
        dynamic: 'Un abbonamento mensile o annuale',
        qrturbo: 'Niente, anche per uso commerciale'
      }
    ],
    note:
      'L’unico compromesso: un QR code statico non si può modificare dopo la stampa. Se in futuro potresti dover cambiare la destinazione, crea il codice per una pagina che controlli tu e aggiorna quella pagina.'
  },
  faq: {
    title: 'Domande frequenti',
    items: [
      {
        q: 'I QR code creati con QRTurbo.app scadono?',
        a: 'No. QRTurbo.app crea QR code statici: link, testo o dati di contatto sono codificati direttamente nel codice. Non c’è nessun server in mezzo, quindi non c’è nulla che possa scadere o essere disattivato. Un codice funziona finché il suo contenuto è valido, per esempio finché esiste il sito a cui rimanda.'
      },
      {
        q: 'Perché il QR code creato su un altro sito ha smesso di funzionare?',
        a: 'Molti generatori creano QR code dinamici per impostazione predefinita. Questi contengono un link breve al server del fornitore, che reindirizza ogni scansione al tuo indirizzo reale. Quando la prova gratuita o l’abbonamento terminano, il fornitore disattiva il reindirizzamento e il codice stampato smette di funzionare. I codici di QRTurbo.app contengono il tuo contenuto reale e non dipendono mai da noi.'
      },
      {
        q: 'QRTurbo.app è davvero gratis? Posso usare i codici a scopo commerciale?',
        a: 'Sì. Niente registrazione, niente prova, niente filigrana e nessun limite di scansioni. Puoi usare i QR code che crei per scopi personali e commerciali, come biglietti da visita, menu, confezioni e pubblicità.'
      },
      {
        q: 'Posso modificare un QR code dopo averlo stampato?',
        a: 'No. Un QR code statico non si può modificare, perché il contenuto fa parte del disegno stesso. Se prevedi di cambiare la destinazione, crea il codice per un indirizzo che controlli tu, come una pagina del tuo sito, e aggiorna quella pagina.'
      },
      {
        q: 'Quanto deve essere grande un QR code stampato?',
        a: 'Stampalo almeno 2 × 2 cm. Come regola pratica, il codice dovrebbe misurare almeno un decimo della distanza di scansione: per una locandina letta da 2 metri serve un codice di circa 20 cm. Per la stampa scarica un SVG o un PNG grande e lascia libera la zona quieta attorno al codice.'
      },
      {
        q: 'Perché il mio QR code non viene letto?',
        a: 'Le cause più comuni sono un contrasto basso tra codice e sfondo, una zona quieta troppo piccola, un logo che copre troppo il codice o troppi dati per la dimensione di stampa. QRTurbo.app ti avvisa di questi rischi. Prova sempre il codice con alcuni telefoni diversi prima di stamparlo.'
      },
      {
        q: 'I miei dati sono al sicuro? Potete vedere la mia password WiFi?',
        a: 'I tuoi dati restano sul tuo dispositivo. Il QR code è generato da codice eseguito nel tuo browser e nulla di ciò che scrivi o carichi viene inviato a un server, quindi nessuno può vedere la tua password WiFi o i tuoi dati di contatto. Dopo la prima visita, il generatore funziona anche offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Generatori di QR code gratis'
  }
};
