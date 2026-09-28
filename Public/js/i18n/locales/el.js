// Greek translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.el = {
    app: {
      selectLanguage: 'Επιλογή γλώσσας'
    },
    aria: {
      themeGroup: 'Θέμα',
      lightTheme: 'Φωτεινό θέμα',
      darkTheme: 'Σκούρο θέμα',
      language: 'Γλώσσα',
      qrTypes: 'Τύποι QR code'
    },
    tabs: {
      urlText: 'URL/Κείμενο',
      vcard: 'vCard',
      smsPhone: 'SMS/Κλήση',
      wifi: 'WiFi',
      email: 'Email',
      calendarEvent: 'Εκδήλωση',
      location: 'Τοποθεσία',
      socialMedia: 'Social media',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Εφαρμογή'
    },
    fields: {
      textOrUrl: 'Κείμενο ή URL',
      firstName: 'Όνομα',
      lastName: 'Επώνυμο',
      organization: 'Εταιρεία',
      title: 'Θέση',
      phoneWork: 'Τηλέφωνο (εργασία)',
      phoneMobile: 'Τηλέφωνο (κινητό)',
      email: 'Email',
      website: 'Ιστότοπος',
      street: 'Οδός',
      city: 'Πόλη',
      state: 'Νομός/Περιφέρεια',
      zip: 'Ταχυδρομικός κώδικας',
      country: 'Χώρα',
      ssid: 'Όνομα δικτύου (SSID)',
      password: 'Κωδικός πρόσβασης',
      authentication: 'Τύπος ασφαλείας',
      hiddenNetwork: 'Πρόκειται για κρυφό δίκτυο',
      phoneNumber: 'Αριθμός τηλεφώνου',
      message: 'Μήνυμα (προαιρετικό)',
      qrSize: 'Μέγεθος QR code',
      foregroundColor: 'Χρώμα προσκηνίου',
      backgroundColor: 'Χρώμα φόντου',
      transparentBackground: 'Διαφανές φόντο',
      errorCorrection: 'Διόρθωση σφαλμάτων',
      downloadFormat: 'Μορφή λήψης',
      dotStyle: 'Στυλ κουκκίδων',
      cornerSquare: 'Γωνιακό τετράγωνο',
      cornerDot: 'Γωνιακή κουκκίδα',
      quietZone: 'Περιθώριο (κενή ζώνη)',
      logoSize: 'Μέγεθος λογότυπου',
      logoMargin: 'Περιθώριο λογότυπου',
      logo: 'Λογότυπο (προαιρετικό)',
      styleOptions: 'Επιλογές στυλ',
      emailTo: 'Email παραλήπτη',
      emailSubject: 'Θέμα',
      emailBody: 'Μήνυμα',
      eventTitle: 'Τίτλος εκδήλωσης',
      eventStart: 'Έναρξη',
      eventEnd: 'Λήξη',
      eventLocation: 'Τοποθεσία',
      eventDescription: 'Περιγραφή',
      locationAddress: 'Διεύθυνση ή μέρος',
      latitude: 'Γεωγραφικό πλάτος',
      longitude: 'Γεωγραφικό μήκος',
      socialPlatform: 'Πλατφόρμα',
      socialProfileType: 'Τύπος προφίλ',
      socialHandleOrUrl: 'Όνομα χρήστη ή URL προφίλ',
      whatsappPhone: 'Αριθμός WhatsApp ή @username',
      whatsappMessage: 'Μήνυμα (προαιρετικό)',
      mecardName: 'Όνομα',
      address: 'Διεύθυνση',
      appWebUrl: 'Εναλλακτικό / web URL',
      appIosUrl: 'URL στο App Store (iOS)',
      appAndroidUrl: 'URL στο Play Store (Android)',
      appLinkTarget: 'Εναλλακτικό κατάστημα',
      frame: 'Πλαίσιο',
      frameText: 'Κείμενο πλαισίου',
      frameColor: 'Χρώμα πλαισίου'
    },
    placeholders: {
      url: 'π.χ. https://www.example.com',
      firstName: 'Γιώργος',
      lastName: 'Παπαδόπουλος',
      organization: 'Εταιρεία Α.Ε.',
      title: 'Προγραμματιστής',
      phoneWork: '+30 210 123 4567',
      phoneMobile: '+30 691 234 5678',
      email: 'giorgos.papadopoulos@example.com',
      website: 'https://www.example.com',
      street: 'Οδός Ερμού 12',
      city: 'Αθήνα',
      state: 'Αττική',
      zip: '105 63',
      country: 'Ελλάδα',
      ssid: 'π.χ. MyHomeWiFi',
      wifiPassword: 'Ο μυστικός σας κωδικός',
      phoneNumber: 'π.χ. +306912345678',
      smsMessage: 'Το έτοιμο μήνυμά σας εδώ...',
      emailTo: 'hello@example.com',
      emailSubject: 'Χαιρετισμούς από το QRTurbo.app',
      emailBody: 'Γράψτε εδώ το μήνυμά σας...',
      eventTitle: 'Συνάντηση ομάδας',
      eventLocation: 'Αίθουσα συσκέψεων ή διεύθυνση',
      eventDescription: 'Λεπτομέρειες εκδήλωσης...',
      locationAddress: 'Πλατεία Συντάγματος, Αθήνα',
      latitude: '37.975',
      longitude: '23.735',
      socialHandle: '@username ή https://...',
      whatsappPhone: 'π.χ. +306912345678 ή @username',
      whatsappMessage: 'Το μήνυμά σας στο WhatsApp...',
      mecardName: 'Γιώργος Παπαδόπουλος',
      address: 'Οδός Ερμού 12, Αθήνα',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Δημιουργία QR code',
      download: 'Λήψη QR code',
      reset: 'Επαναφορά προεπιλογών',
      customize: 'Προσαρμογή εμφάνισης (προαιρετικά)',
      chooseLogo: 'Επιλογή εικόνας',
      showPassword: 'Εμφάνιση κωδικού',
      hidePassword: 'Απόκρυψη κωδικού',
      showPayload: 'Εμφάνιση δεδομένων QR',
      hidePayload: 'Απόκρυψη δεδομένων QR'
    },
    options: {
      sizeMedium: 'Οθόνη (512 px)',
      sizeLarge: 'Μεγάλο (1024 px)',
      sizePrint: 'Εκτύπωση (2048 px)',
      sizePoster: 'Αφίσα (4096 px)',
      frameNone: 'Χωρίς πλαίσιο',
      frameBannerBottom: 'Ετικέτα από κάτω',
      frameBannerTop: 'Ετικέτα από πάνω',
      frameOutline: 'Περίγραμμα με ετικέτα',
      errorLow: 'L - Χαμηλή (7%)',
      errorMedium: 'M - Μεσαία (15%)',
      errorQuartile: 'Q - Αυξημένη (25%)',
      errorHigh: 'H - Υψηλή (30%)',
      formatPng: 'PNG (εικόνα)',
      formatSvg: 'SVG (διανυσματικό)',
      formatPdf: 'PDF (έγγραφο)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Καμία',
      dotSquare: 'Τετράγωνο',
      dotRounded: 'Στρογγυλεμένο',
      dotDots: 'Κουκκίδες',
      dotClassy: 'Κομψό',
      dotClassyRounded: 'Κομψό στρογγυλεμένο',
      dotExtraRounded: 'Πολύ στρογγυλεμένο',
      cornerSquare: 'Τετράγωνο',
      cornerExtraRounded: 'Πολύ στρογγυλεμένο',
      cornerDot: 'Κουκκίδα',
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
      socialOther: 'Άλλο URL',
      socialTypePerson: 'Άτομο/Προφίλ',
      socialTypeCompany: 'Εταιρεία',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'iOS αν λείπει το web URL',
      appTargetAndroid: 'Android αν λείπει το web URL'
    },
    alerts: {
      enterText: 'Εισαγάγετε κείμενο ή URL',
      vcardRequired:
        'Συμπληρώστε τουλάχιστον ένα από τα πεδία: Όνομα, Επώνυμο, Email ή Αριθμός τηλεφώνου.',
      wifiSsidRequired: 'Εισαγάγετε το όνομα του δικτύου (SSID).',
      wifiSsidLengthInvalid: 'Το όνομα ενός δικτύου WiFi μπορεί να έχει έως 32 byte UTF-8.',
      wifiWpaPasswordInvalid:
        'Ο κωδικός WPA/WPA2 πρέπει να έχει 8-63 εκτυπώσιμους χαρακτήρες ή ακριβώς 64 δεκαεξαδικούς χαρακτήρες.',
      wifiWepPasswordInvalid:
        'Ο κωδικός WEP πρέπει να έχει 5 ή 13 εκτυπώσιμους χαρακτήρες ή 10 ή 26 δεκαεξαδικούς χαρακτήρες.',
      phoneRequired: 'Εισαγάγετε έναν αριθμό τηλεφώνου.',
      emailRequired: 'Συμπληρώστε τουλάχιστον ένα πεδίο του email.',
      emailInvalid: 'Εισαγάγετε μια έγκυρη διεύθυνση email.',
      eventRequired: 'Εισαγάγετε τίτλο και ώρα έναρξης της εκδήλωσης.',
      eventEndInvalid: 'Η λήξη της εκδήλωσης δεν μπορεί να είναι πριν από την έναρξη.',
      locationRequired: 'Εισαγάγετε μια διεύθυνση ή και τις δύο συντεταγμένες.',
      locationCoordinatesInvalid: 'Εισαγάγετε έγκυρο γεωγραφικό πλάτος και μήκος.',
      socialRequired: 'Εισαγάγετε όνομα χρήστη ή URL προφίλ.',
      socialHandleInvalid: 'Εισαγάγετε έγκυρο όνομα χρήστη με γράμματα, αριθμούς, τελείες, κάτω παύλες ή παύλες.',
      socialUrlInvalid: 'Εισαγάγετε έγκυρο URL προφίλ που ξεκινά με http:// ή https://.',
      whatsappPhoneRequired: 'Εισαγάγετε αριθμό WhatsApp με κωδικό χώρας ή ένα έγκυρο @username.',
      mecardRequired: 'Συμπληρώστε τουλάχιστον ένα από τα πεδία: Όνομα, Αριθμός τηλεφώνου ή Email.',
      appLinkRequired: 'Εισαγάγετε ένα URL για web, iOS ή Android.',
      urlInvalid: 'Εισαγάγετε έγκυρο URL που ξεκινά με http:// ή https://.',
      lowContrast:
        '⚠️ Εντοπίστηκε χαμηλή αντίθεση. Το QR code ίσως σκανάρεται δύσκολα. Προτιμήστε πιο σκούρο προσκήνιο ή πιο ανοιχτό φόντο.',
      dataEmpty: 'Τα δεδομένα του QR code είναι κενά.',
      noData: 'Δεν δόθηκαν δεδομένα για το QR code.',
      libraryLoadFailed: 'Η βιβλιοθήκη QR code δεν φορτώθηκε. Ανανεώστε τη σελίδα.',
      generationError: 'Σφάλμα κατά τη δημιουργία του QR code',
      dataTooLong: 'Το περιεχόμενο είναι πολύ μεγάλο για το επιλεγμένο επίπεδο διόρθωσης σφαλμάτων. Συντομεύστε το ή επιλέξτε χαμηλότερο επίπεδο.',
      pdfExportFailed: 'Η εξαγωγή PDF απέτυχε. Δοκιμάστε ξανά.',
      generateFirst: 'Δημιουργήστε πρώτα ένα QR code.',
      resetSuccess: 'Έγινε επαναφορά των προεπιλογών',
      largeImageWarning:
        '⚠️ Μεγάλο αρχείο εικόνας ({{size}} MB). Για καλύτερη απόδοση, χρησιμοποιήστε μικρότερη εικόνα.',
      invalidImageFile: 'Επιλέξτε ένα έγκυρο αρχείο εικόνας (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} χαρακτήρες'
    },
    units: {
      modules: '{{count}} μονάδες'
    },
    labels: {
      sms: 'SMS',
      phone: 'Κλήση'
    },
    warnings: {
      lowContrast:
        'Η χαμηλή αντίθεση μπορεί να δυσκολέψει το σκανάρισμα. Χρησιμοποιήστε πιο σκούρο προσκήνιο ή πιο ανοιχτό φόντο.',
      transparentBackground:
        'Το διαφανές φόντο εξαρτάται από την τελική επιφάνεια. Δοκιμάστε το QR code πάνω στο ακριβές φόντο πριν το δημοσιεύσετε.',
      quietZoneSmall:
        'Η κενή ζώνη είναι πολύ μικρή. Για αξιόπιστο σκανάρισμα, χρησιμοποιήστε τουλάχιστον 4 μονάδες.',
      denseData:
        'Αυτό το QR code περιέχει πολλά δεδομένα για το επιλεγμένο μέγεθος. Επιλέξτε μεγαλύτερο μέγεθος ή συντομεύστε το περιεχόμενο.',
      logoErrorCorrection:
        'Τα μεγάλα λογότυπα σκανάρονται πιο αξιόπιστα με υψηλή (H) διόρθωση σφαλμάτων.',
      logoLarge:
        'Το λογότυπο είναι μεγάλο και ίσως καλύπτει μεγάλο μέρος του QR code. Δοκιμάστε το πριν το εκτυπώσετε ή το μοιραστείτε.'
    },
    brand: {
      tagline: 'ο ιδιωτικός σας χώρος για QR codes'
    },
    trust: {
      local: 'Στον browser σας',
      noUploads: 'Δεν ανεβαίνει τίποτα',
      noTracking: 'Χωρίς παρακολούθηση ή cookies',
      offline: 'Λειτουργεί offline',
      openSource: 'Ανοιχτός κώδικας',
      noExpiry: 'Δεν λήγει ποτέ',
      noSignup: 'Χωρίς εγγραφή'
    },
    workspace: {
      chooseType: 'Επιλέξτε τύπο',
      addContent: 'Προσθέστε περιεχόμενο',
      adjustLook: 'Μέγεθος και στυλ'
    },
    preview: {
      title: 'Προεπισκόπηση',
      localBadge: 'Σε αυτή τη συσκευή'
    },
    how: {
      title: 'Πώς λειτουργεί',
      step1Title: 'Επιλέξτε',
      step1Text: 'Διαλέξτε τι θα κάνει ο κωδικός: θα ανοίγει έναν σύνδεσμο, θα συνδέει σε δίκτυο WiFi, θα αποθηκεύει μια επαφή και άλλα.',
      step2Title: 'Συμπληρώστε',
      step2Text: 'Πληκτρολογήστε το περιεχόμενό σας. Η προεπισκόπηση ενημερώνεται καθώς γράφετε, εδώ, στον browser σας.',
      step3Title: 'Κατεβάστε',
      step3Text: 'Αποθηκεύστε το ως PNG, SVG ή PDF. Δοκιμάστε το σκανάρισμα πριν το εκτυπώσετε ή το μοιραστείτε.'
    },
    privacyInfo: {
      title: 'Ιδιωτικότητα εκ σχεδιασμού',
      intro: 'Τα QR codes συχνά περιέχουν προσωπικά στοιχεία: έναν κωδικό WiFi, έναν αριθμό τηλεφώνου, μια διεύθυνση κατοικίας. Το QRTurbo.app είναι φτιαγμένο έτσι ώστε τίποτα από αυτά να μη φτάνει ποτέ σε διακομιστή.',
      localTitle: 'Μένει στη συσκευή σας',
      localText: 'Τα QR codes και τα λογότυπα δημιουργούνται από κώδικα που εκτελείται στον browser σας. Δεν υπάρχει διακομιστής που θα μπορούσε να λάβει όσα πληκτρολογείτε.',
      staticTitle: 'Χωρίς ανακατευθύνσεις, χωρίς λήξη',
      staticText: 'Το περιεχόμενό σας κωδικοποιείται απευθείας στο QR code. Τα σκαναρίσματα δεν περνούν ποτέ από εμάς και το QR code δεν λήγει ποτέ.',
      noTrackingTitle: 'Χωρίς παρακολούθηση',
      noTrackingText: 'Χωρίς στατιστικά επισκεψιμότητας, διαφημίσεις, cookies ή λογαριασμούς. Αποθηκεύονται μόνο οι επιλογές γλώσσας και θέματος, τοπικά στον browser σας.',
      openSourceTitle: 'Ανοιχτό σε έλεγχο',
      openSourceText: 'Ο πλήρης πηγαίος κώδικας είναι δημόσιος στο GitHub, ώστε ο καθένας να μπορεί να επαληθεύσει όσα λέμε.'
    },
    footer: {
      privacy1: 'Αυτή η δωρεάν γεννήτρια QR code λειτουργεί εξ ολοκλήρου στον browser σας.',
      privacy2: 'Κανένα δεδομένο δεν αποθηκεύεται ούτε αποστέλλεται πουθενά. Χωρίς παρακολούθηση, χωρίς διαφημίσεις, χωρίς κόλπα.',
      privacyPolicy: 'Πολιτική απορρήτου',
      termsOfUse: 'Όροι χρήσης',
      github: 'Πηγαίος κώδικας στο GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Κενός χώρος γύρω από το QR code (τουλάχιστον 4 μονάδες για αξιόπιστο σκανάρισμα)',
      socialHandleHelper:
        'Εισαγάγετε όνομα χρήστη, π.χ. @username, ή επικολλήστε ολόκληρο το URL του προφίλ με https://.'
    },
    frame: {
      defaultText: 'ΣΚΑΝΑΡΕ ΜΕ'
    },
    misc: {
      qrPlaceholder: 'Το QR code θα εμφανιστεί εδώ',
      socialPreview: 'Προορισμός QR',
      wifiPayloadHidden: 'Ρυθμίσεις WiFi — ο κωδικός είναι κρυφός'
    }
  };
})();
