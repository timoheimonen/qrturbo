// Swedish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.sv = {
    meta: {
      title:
        'Gratis QR-kodgenerator med logotyper och färger | QRTurbo.app',
      description:
        'Skapa gratis anpassade QR-koder för URL:er, WiFi, vCards, SMS och samtal. Lägg till logotyper, färger och stilar i webbläsaren utan spårning eller datauppladdningar.'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodgenerator',
      subtitle:
        'Skapa anpassningsbara QR-koder med logotyper, färger och stilar. Stöd för URL:er, WiFi, vCard, SMS och samtal',
      selectLanguage: 'Välj Språk'
    },
    aria: {
      themeGroup: 'Tema',
      lightTheme: 'Ljust tema',
      darkTheme: 'Mörkt tema',
      language: 'Språk',
      qrTypes: 'QR-kodtyper'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi',
      email: 'E-post',
      calendarEvent: 'Händelse',
      location: 'Plats',
      socialMedia: 'Sociala medier',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App-länk'
    },
    fields: {
      textOrUrl: 'Text eller URL',
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbete)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-post',
      website: 'Webbplats',
      street: 'Gata',
      city: 'Stad',
      state: 'Stat/Provins',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Nätverksnamn (SSID)',
      password: 'Lösenord',
      authentication: 'Autentisering',
      hiddenNetwork: 'Detta är ett dolt nätverk',
      phoneNumber: 'Telefonnummer',
      message: 'Meddelande (valfritt)',
      qrSize: 'QR-Kodstorlek',
      foregroundColor: 'Förgrundsfärg',
      backgroundColor: 'Bakgrundsfärg',
      transparentBackground: 'Transparent bakgrund',
      errorCorrection: 'Felkorrigering',
      downloadFormat: 'Nedladdningsformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hörnfyrkant',
      cornerDot: 'Hörnpunkt',
      quietZone: 'Tyst Zon (Marginal)',
      logoSize: 'Logotypstorlek',
      logoMargin: 'Logotypmarginal',
      logo: 'Logotyp (Valfritt)',
      styleOptions: 'Stilalternativ',
      emailTo: 'Mottagarens e-post',
      emailSubject: 'Ämne',
      emailBody: 'Meddelande',
      eventTitle: 'Händelsetitel',
      eventStart: 'Start',
      eventEnd: 'Slut',
      eventLocation: 'Plats',
      eventDescription: 'Beskrivning',
      locationAddress: 'Adress eller plats',
      latitude: 'Latitud',
      longitude: 'Longitud',
      socialPlatform: 'Plattform',
      socialProfileType: 'Profiltyp',
      socialHandleOrUrl: 'Användarnamn eller profil-URL',
      whatsappPhone: 'WhatsApp-nummer eller @användarnamn',
      whatsappMessage: 'Meddelande (valfritt)',
      mecardName: 'Namn',
      address: 'Adress',
      appWebUrl: 'Reserv-/webb-URL',
      appIosUrl: 'iOS App Store-URL',
      appAndroidUrl: 'Android Play Store-URL',
      appLinkTarget: 'Butiksreserv'
    },
    placeholders: {
      url: 't.ex., https://www.exempel.com',
      firstName: 'Anders',
      lastName: 'Andersson',
      organization: 'ACME AB',
      title: 'Utvecklare',
      phoneWork: '+46-555-555-1234',
      phoneMobile: '+46-555-555-5678',
      email: 'anders.andersson@exempel.com',
      website: 'https://www.exempel.com',
      street: 'Huvudgatan 123',
      city: 'Stockholm',
      state: 'Stockholm',
      zip: '11122',
      country: 'Sverige',
      ssid: 't.ex., MittHemWiFi',
      wifiPassword: 'Ditt hemliga lösenord',
      phoneNumber: 't.ex., +46555123456',
      smsMessage: 'Ditt förifyllda meddelande här...',
      emailTo: 'hej@example.com',
      emailSubject: 'Hej från QRTurbo.app',
      emailBody: 'Skriv ditt e-postmeddelande här...',
      eventTitle: 'Teammöte',
      eventLocation: 'Mötesrum eller adress',
      eventDescription: 'Händelsedetaljer...',
      locationAddress: 'Drottninggatan 1, Stockholm',
      latitude: '59.3293',
      longitude: '18.0686',
      socialHandle: '@anvandarnamn eller https://...',
      whatsappPhone: 't.ex., +46555123456 eller @anvandarnamn',
      whatsappMessage: 'Ditt WhatsApp-meddelande här...',
      mecardName: 'Anna Andersson',
      address: 'Storgatan 123, Stockholm',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Skapa QR-Kod',
      download: 'Ladda Ner QR-Kod',
      reset: 'Återställ till Standard',
      customize: 'Anpassa Utseende (Valfritt)',
      chooseLogo: 'Välj Bild',
      showPassword: 'Visa lösenord',
      hidePassword: 'Dölj lösenord',
      showPayload: 'Visa QR-data',
      hidePayload: 'Dölj QR-data'
    },
    options: {
      sizeSmall: 'Liten (256px)',
      sizeMedium: 'Medium (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Låg (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Hög (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      formatPdf: 'PDF (dokument)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Fyrkant',
      dotRounded: 'Rundad',
      dotDots: 'Punkter',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Rundad',
      dotExtraRounded: 'Extra Rundad',
      cornerSquare: 'Fyrkant',
      cornerExtraRounded: 'Extra Rundad',
      cornerDot: 'Punkt',
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
      socialOther: 'Annan URL',
      socialTypePerson: 'Person/Profil',
      socialTypeCompany: 'Företag',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Använd iOS om ingen webb-URL finns',
      appTargetAndroid: 'Använd Android om ingen webb-URL finns'
    },
    alerts: {
      enterText: 'Ange en text eller en URL',
      vcardRequired:
        'Fyll i minst en av: Förnamn, Efternamn, E-post eller Telefonnummer.',
      wifiSsidRequired: 'Ange Nätverksnamn (SSID).',
      wifiSsidLengthInvalid: 'WiFi-nätverkets namn får vara högst 32 UTF-8-byte.',
      wifiWpaPasswordInvalid:
        'WPA/WPA2-lösenord måste vara 8-63 utskrivbara tecken eller exakt 64 hexadecimala tecken.',
      wifiWepPasswordInvalid:
        'WEP-lösenord måste vara 5 eller 13 utskrivbara tecken, eller 10 eller 26 hexadecimala tecken.',
      phoneRequired: 'Ange ett telefonnummer.',
      emailRequired: 'Ange minst ett e-postfält.',
      emailInvalid: 'Ange en giltig e-postadress.',
      eventRequired: 'Ange en händelsetitel och starttid.',
      eventEndInvalid: 'Sluttiden kan inte vara före starttiden.',
      locationRequired: 'Ange en adress eller båda koordinaterna.',
      locationCoordinatesInvalid: 'Ange giltiga latitud- och longitudkoordinater.',
      socialRequired: 'Ange ett användarnamn för sociala medier eller en profil-URL.',
      socialHandleInvalid: 'Ange ett giltigt användarnamn med bokstäver, siffror, punkter, understreck eller bindestreck.',
      socialUrlInvalid: 'Ange en giltig social profil-URL som börjar med http:// eller https://.',
      whatsappPhoneRequired: 'Ange ett WhatsApp-telefonnummer med landskod eller ett giltigt @användarnamn.',
      mecardRequired: 'Ange minst ett av: Namn, Telefonnummer eller E-post.',
      appLinkRequired: 'Ange en webb-, iOS- eller Android-app-URL.',
      urlInvalid: 'Ange en giltig URL som börjar med http:// eller https://.',
      lowContrast:
        '⚠️ Låg kontrast upptäckt. Din QR-kod kan vara svår att skanna. Överväg att använda mörkare förgrund eller ljusare bakgrund.',
      dataEmpty: 'QR-koddata är tomma.',
      noData: 'Ingen data tillhandahållen för QR-kod.',
      libraryLoadFailed: 'QR-kodbiblioteket kunde inte laddas. Uppdatera sidan.',
      generationError: 'Fel vid generering av QR-kod',
      dataTooLong:
        'Innehållet är för stort för den valda QR-felkorrigeringsnivån. Förkorta innehållet eller välj en lägre nivå.',
      pdfExportFailed: 'PDF-export misslyckades. Försök igen.',
      generateFirst: 'Generera en QR-kod först.',
      resetSuccess: 'Anpassning återställd till standard',
      largeImageWarning:
        '⚠️ Stor bildfil ({{size}}MB). Överväg att använda en mindre bild för bättre prestanda.',
      invalidImageFile: 'Välj en giltig bildfil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tecken'
    },
    units: {
      modules: '{{count}} moduler'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonsamtal'
    },
    warnings: {
      lowContrast:
        'Låg kontrast kan göra QR-koden svår att skanna. Använd en mörkare förgrund eller ljusare bakgrund.',
      transparentBackground:
        'En transparent bakgrund beror på den slutliga ytan. Testa QR-koden mot den verkliga bakgrunden före publicering.',
      quietZoneSmall:
        'Den tysta zonen är för liten. Använd minst 4 moduler för tillförlitlig skanning.',
      denseData:
        'QR-koden innehåller mycket data för den valda storleken. Använd en större storlek eller förkorta innehållet.',
      logoErrorCorrection:
        'Stora logotyper fungerar mer tillförlitligt med hög felkorrigering (H).',
      logoLarge:
        'Logotypen är stor och kan täcka för mycket av QR-koden. Testa före utskrift eller delning.'
    },
    brand: {
      tagline: 'din privata plats för QR-koder'
    },
    hero: {
      display: 'QR-koder som aldrig lämnar din enhet.'
    },
    trust: {
      local: 'Skapas i din webbläsare',
      noUploads: 'Inget laddas upp',
      noTracking: 'Ingen spårning eller cookies',
      offline: 'Fungerar offline',
      openSource: 'Öppen källkod'
    },
    workspace: {
      chooseType: 'Välj typ',
      addContent: 'Lägg till innehåll',
      adjustLook: 'Storlek och stil'
    },
    preview: {
      title: 'Förhandsvisning',
      localBadge: 'Skapad på den här enheten'
    },
    how: {
      title: 'Så fungerar det',
      step1Title: 'Välj',
      step1Text: 'Bestäm vad koden ska göra: öppna en länk, ansluta till ett WiFi-nätverk, spara en kontakt och mycket mer.',
      step2Title: 'Fyll i',
      step2Text: 'Skriv ditt innehåll. Förhandsvisningen uppdateras medan du skriver, direkt i din webbläsare.',
      step3Title: 'Ladda ner',
      step3Text: 'Spara som PNG, SVG eller PDF. Testa skanningen innan du skriver ut eller delar koden.'
    },
    privacyInfo: {
      title: 'Privat från grunden',
      intro: 'QR-koder innehåller ofta personliga uppgifter: ett WiFi-lösenord, ett telefonnummer, en hemadress. QRTurbo.app är byggt så att inget av det någonsin når en server.',
      localTitle: 'Stannar på din enhet',
      localText: 'QR-koder och logotyper skapas av kod som körs i din webbläsare. Det finns ingen server som kan ta emot det du skriver.',
      staticTitle: 'Inga omdirigeringar, inget utgångsdatum',
      staticText: 'Innehållet kodas direkt i QR-koden. Skanningar går aldrig via oss, och koden slutar aldrig att fungera.',
      noTrackingTitle: 'Ingen spårning',
      noTrackingText: 'Ingen analys, inga annonser, cookies eller konton. Endast dina val av språk och tema sparas, lokalt i din webbläsare.',
      openSourceTitle: 'Öppen för granskning',
      openSourceText: 'Hela källkoden finns öppet på GitHub, så vem som helst kan kontrollera detta.'
    },
    footer: {
      privacy1: 'Denna gratis QR-kodgenerator körs helt i din webbläsare.',
      privacy2:
        'Ingen data lagras eller skickas någonstans. Ingen spårning, inga annonser, inget nonsens.',
      privacyPolicy: 'Integritetspolicy',
      termsOfUse: 'Användarvillkor',
      github: 'Visa källkod på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Utrymme runt QR-koden (minst 4 moduler för pålitlig skanning)',
      socialHandleHelper:
        'Ange ett användarnamn som @anvandarnamn eller klistra in en fullständig https:// profil-URL.'
    },
    misc: {
      qrPlaceholder: 'QR-koden kommer att visas här',
      socialPreview: 'QR-mål',
      wifiPayloadHidden: 'WiFi-konfiguration — lösenord dolt'
    }
  };
})();
