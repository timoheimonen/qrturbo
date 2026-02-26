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
        'Generatore di Codici QR Gratuito - Personalizza Colori, Loghi e Stili | QRTurbo.app',
      description:
        'Genera codici QR personalizzabili gratuitamente e istantaneamente con QRTurbo.app. Aggiungi loghi, colori personalizzati e stili. Crea codici QR per URL, reti WiFi, vCard, SMS e chiamate telefoniche. Nessuna pubblicità, nessun tracciamento – completamente basato su browser e sicuro.',
      keywords:
        'generatore di codice QR, codice QR personalizzato, codice QR con logo, codice QR colorato, creatore di codice QR gratuito, codice QR WiFi, codice QR vCard, codice QR SMS, strumento QR online, generatore QR senza tracciamento'
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
      wifi: 'WiFi'
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
      styleOptions: 'Opzioni di Stile'
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
      smsMessage: 'Il tuo messaggio precompilato qui...'
    },
    actions: {
      generate: 'Crea Codice QR',
      download: 'Scarica Codice QR',
      reset: 'Ripristina Predefiniti',
      customize: 'Personalizza Aspetto (Opzionale)',
      chooseLogo: 'Scegli Immagine'
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
      cornerDot: 'Punto'
    },
    alerts: {
      enterText: 'Inserisci un testo o un URL',
      vcardRequired:
        'Compila almeno uno di: Nome, Cognome, Email o Numero di Telefono.',
      wifiSsidRequired: 'Inserisci il Nome Rete (SSID).',
      phoneRequired: 'Inserisci un numero di telefono.',
      lowContrast:
        '⚠️ Contrasto basso rilevato. Il tuo codice QR potrebbe essere difficile da scansionare. Considera di usare un primo piano più scuro o uno sfondo più chiaro.',
      dataEmpty: 'I dati del codice QR sono vuoti.',
      noData: 'Nessun dato fornito per il codice QR.',
      libraryLoadFailed:
        'La libreria del codice QR non è riuscita a caricarsi. Ricarica la pagina.',
      generationError: 'Errore nella generazione del codice QR',
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
      github: 'Visualizza sorgente su GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Spazio attorno al codice QR (consigliato: 4-16px per scansione affidabile)'
    },
    misc: {
      qrPlaceholder: 'Il codice QR apparirà qui'
    }
  };
})();
