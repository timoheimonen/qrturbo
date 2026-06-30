// Italian translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.it = {
    meta: {
      title:
        'Generatore di Codici QR Gratis con Loghi e Colori | QRTurbo.app',
      description:
        'Crea codici QR personalizzati gratuiti per URL, WiFi, vCard, SMS e chiamate. Aggiungi loghi, colori e stili nel browser, senza tracciamento o caricamenti di dati.'
    },
    app: {
      title: 'QRTurbo.app - Generatore di Codici QR Gratuito',
      subtitle:
        'Crea codici QR personalizzabili con loghi, colori e stili. Supporto per URL, WiFi, vCard, SMS e chiamate',
      selectLanguage: 'Seleziona Lingua'
    },
    tabs: {
      urlText: 'URL/Testo',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefono',
      wifi: 'WiFi',
      email: 'Email',
      calendarEvent: 'Evento',
      location: 'Posizione',
      socialMedia: 'Social media',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Link app'
    },
    fields: {
      textOrUrl: 'Testo o URL',
      firstName: 'Nome',
      lastName: 'Cognome',
      organization: 'Organizzazione',
      title: 'Titolo',
      phoneWork: 'Telefono (Lavoro)',
      phoneMobile: 'Telefono (Cellulare)',
      email: 'Email',
      website: 'Sito Web',
      street: 'Via',
      city: 'Città',
      state: 'Stato/Provincia',
      zip: 'CAP',
      country: 'Paese',
      ssid: 'Nome Rete (SSID)',
      password: 'Password',
      authentication: 'Autenticazione',
      hiddenNetwork: 'Questa è una rete nascosta',
      phoneNumber: 'Numero di Telefono',
      message: 'Messaggio (opzionale)',
      qrSize: 'Dimensione Codice QR',
      foregroundColor: 'Colore Primo Piano',
      backgroundColor: 'Colore Sfondo',
      errorCorrection: 'Correzione Errori',
      downloadFormat: 'Formato Download',
      dotStyle: 'Stile Punti',
      cornerSquare: 'Angolo Quadrato',
      cornerDot: 'Punto Angolo',
      quietZone: 'Zona Quieta (Margine)',
      logoSize: 'Dimensione Logo',
      logoMargin: 'Margine Logo',
      logo: 'Logo (Opzionale)',
      styleOptions: 'Opzioni di Stile',
      emailTo: 'Email destinatario',
      emailSubject: 'Oggetto',
      emailBody: 'Messaggio',
      eventTitle: 'Titolo evento',
      eventStart: 'Inizio',
      eventEnd: 'Fine',
      eventLocation: 'Posizione',
      eventDescription: 'Descrizione',
      locationAddress: 'Indirizzo o luogo',
      latitude: 'Latitudine',
      longitude: 'Longitudine',
      socialPlatform: 'Piattaforma',
      socialProfileType: 'Tipo di profilo',
      socialHandleOrUrl: 'Nome utente o URL profilo',
      whatsappPhone: 'Numero WhatsApp o @utente',
      whatsappMessage: 'Messaggio (opzionale)',
      mecardName: 'Nome',
      address: 'Indirizzo',
      appWebUrl: 'URL web/di fallback',
      appIosUrl: 'URL iOS App Store',
      appAndroidUrl: 'URL Android Play Store',
      appLinkTarget: 'Fallback store'
    },
    placeholders: {
      url: 'es., https://www.esempio.com',
      firstName: 'Mario',
      lastName: 'Rossi',
      organization: 'ACME S.r.l.',
      title: 'Sviluppatore',
      phoneWork: '+39-555-555-1234',
      phoneMobile: '+39-555-555-5678',
      email: 'mario.rossi@esempio.com',
      website: 'https://www.esempio.com',
      street: 'Via Principale 123',
      city: 'Roma',
      state: 'Lazio',
      zip: '00100',
      country: 'Italia',
      ssid: 'es., MioWiFiCasa',
      wifiPassword: 'La tua password segreta',
      phoneNumber: 'es., +39555123456',
      smsMessage: 'Il tuo messaggio precompilato qui...',
      emailTo: 'ciao@example.com',
      emailSubject: 'Ciao da QRTurbo.app',
      emailBody: 'Scrivi qui il messaggio email...',
      eventTitle: 'Riunione del team',
      eventLocation: 'Sala riunioni o indirizzo',
      eventDescription: 'Dettagli evento...',
      locationAddress: 'Colosseo, Roma',
      latitude: '41.8902',
      longitude: '12.4922',
      socialHandle: '@nomeutente o https://...',
      whatsappPhone: 'es., +39555123456 o @utente',
      whatsappMessage: 'Il tuo messaggio WhatsApp qui...',
      mecardName: 'Mario Rossi',
      address: 'Via Principale 123, Roma',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Crea Codice QR',
      download: 'Scarica Codice QR',
      reset: 'Ripristina Predefiniti',
      customize: 'Personalizza Aspetto (Opzionale)',
      chooseLogo: 'Scegli Immagine',
      showPassword: 'Mostra password',
      hidePassword: 'Nascondi password'
    },
    options: {
      sizeSmall: 'Piccolo (256px)',
      sizeMedium: 'Medio (512px)',
      sizeLarge: 'Grande (1024px)',
      errorLow: 'L - Basso (7%)',
      errorMedium: 'M - Medio (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - Alto (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vettoriale)',
      formatPdf: 'PDF (documento)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Nessuno',
      dotSquare: 'Quadrato',
      dotRounded: 'Arrotondato',
      dotDots: 'Punti',
      dotClassy: 'Elegante',
      dotClassyRounded: 'Elegante Arrotondato',
      dotExtraRounded: 'Extra Arrotondato',
      cornerSquare: 'Quadrato',
      cornerExtraRounded: 'Extra Arrotondato',
      cornerDot: 'Punto',
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
      socialOther: 'Altro URL',
      socialTypePerson: 'Persona/Profilo',
      socialTypeCompany: 'Azienda',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Usa iOS se non c’è URL web',
      appTargetAndroid: 'Usa Android se non c’è URL web'
    },
    alerts: {
      enterText: 'Inserisci un testo o un URL',
      vcardRequired:
        'Compila almeno uno di: Nome, Cognome, Email o Numero di Telefono.',
      wifiSsidRequired: 'Inserisci il Nome Rete (SSID).',
      wifiWpaPasswordInvalid:
        'Le password WPA/WPA2 devono avere 8-63 caratteri stampabili o esattamente 64 caratteri esadecimali.',
      wifiWepPasswordInvalid:
        'Le password WEP devono avere 5 o 13 caratteri stampabili, oppure 10 o 26 caratteri esadecimali.',
      phoneRequired: 'Inserisci un numero di telefono.',
      emailRequired: 'Inserisci almeno un campo email.',
      emailInvalid: 'Inserisci un indirizzo email valido.',
      eventRequired: 'Inserisci un titolo evento e un orario di inizio.',
      eventEndInvalid: 'L’orario di fine non può essere precedente all’inizio.',
      locationRequired: 'Inserisci un indirizzo o entrambe le coordinate.',
      locationCoordinatesInvalid: 'Inserisci coordinate valide di latitudine e longitudine.',
      socialRequired: 'Inserisci un nome utente social o un URL profilo.',
      socialHandleInvalid: 'Inserisci un nome utente valido con lettere, numeri, punti, trattini bassi o trattini.',
      socialUrlInvalid: 'Inserisci un URL profilo social valido che inizi con http:// o https://.',
      whatsappPhoneRequired: 'Inserisci un numero WhatsApp con prefisso internazionale o un @utente valido.',
      mecardRequired: 'Inserisci almeno uno tra: Nome, Numero di telefono o Email.',
      appLinkRequired: 'Inserisci un URL app web, iOS o Android.',
      urlInvalid: 'Inserisci un URL valido che inizi con http:// o https://.',
      lowContrast:
        '⚠️ Contrasto basso rilevato. Il tuo codice QR potrebbe essere difficile da scansionare. Considera di usare un primo piano più scuro o uno sfondo più chiaro.',
      dataEmpty: 'I dati del codice QR sono vuoti.',
      noData: 'Nessun dato fornito per il codice QR.',
      libraryLoadFailed:
        'La libreria del codice QR non è riuscita a caricarsi. Ricarica la pagina.',
      generationError: 'Errore nella generazione del codice QR',
      pdfExportFailed: 'Esportazione PDF non riuscita. Riprova.',
      generateFirst: 'Genera prima un codice QR.',
      resetSuccess: 'Personalizzazione ripristinata ai predefiniti',
      largeImageWarning:
        '⚠️ File immagine grande ({{size}}MB). Considera di usare un\'immagine più piccola per prestazioni migliori.',
      invalidImageFile: 'Seleziona un file immagine valido (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} caratteri'
    },
    labels: {
      sms: 'SMS',
      phone: 'Chiamata Telefonica'
    },
    footer: {
      privacy1: 'Questo generatore di codici QR gratuito funziona interamente nel tuo browser.',
      privacy2:
        'Nessun dato viene memorizzato o inviato da nessuna parte. Nessun tracciamento, nessuna pubblicità, nessuna sciocchezza.',
      privacyPolicy: 'Informativa sulla Privacy',
      termsOfUse: 'Termini di Utilizzo',
      github: 'Visualizza sorgente su GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Spazio attorno al codice QR (consigliato: 4-16px per scansione affidabile)',
      socialHandleHelper:
        'Inserisci un nome utente come @nomeutente o incolla un URL profilo completo https://.'
    },
    misc: {
      qrPlaceholder: 'Il codice QR apparirà qui',
      socialPreview: 'Destinazione QR'
    }
  };
})();
