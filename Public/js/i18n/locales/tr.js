// Turkish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.tr = {
    app: {
      selectLanguage: 'Dil Seç'
    },
    aria: {
      themeGroup: 'Tema',
      lightTheme: 'Açık tema',
      darkTheme: 'Koyu tema',
      language: 'Dil',
      qrTypes: 'QR kod türleri'
    },
    tabs: {
      urlText: 'URL/Metin',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi',
      email: 'E-posta',
      calendarEvent: 'Etkinlik',
      location: 'Konum',
      socialMedia: 'Sosyal Medya',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Uygulama Linki'
    },
    fields: {
      textOrUrl: 'Metin veya URL',
      firstName: 'Ad',
      lastName: 'Soyad',
      organization: 'Kurum/Şirket',
      title: 'Unvan',
      phoneWork: 'Telefon (İş)',
      phoneMobile: 'Telefon (Cep)',
      email: 'E-posta',
      website: 'Web sitesi',
      street: 'Cadde/Sokak',
      city: 'Şehir',
      state: 'İlçe/Bölge',
      zip: 'Posta kodu',
      country: 'Ülke',
      ssid: 'Ağ adı (SSID)',
      password: 'Şifre',
      authentication: 'Güvenlik türü',
      hiddenNetwork: 'Bu gizli bir ağ',
      phoneNumber: 'Telefon numarası',
      message: 'Mesaj (isteğe bağlı)',
      qrSize: 'QR kod boyutu',
      foregroundColor: 'Ön plan rengi',
      backgroundColor: 'Arka plan rengi',
      transparentBackground: 'Şeffaf arka plan',
      errorCorrection: 'Hata düzeltme',
      downloadFormat: 'İndirme biçimi',
      dotStyle: 'Nokta stili',
      cornerSquare: 'Köşe karesi',
      cornerDot: 'Köşe noktası',
      quietZone: 'Sessiz alan (kenar boşluğu)',
      logoSize: 'Logo boyutu',
      logoMargin: 'Logo kenar boşluğu',
      logo: 'Logo (isteğe bağlı)',
      styleOptions: 'Stil seçenekleri',
      emailTo: 'Alıcının e-posta adresi',
      emailSubject: 'Konu',
      emailBody: 'Mesaj',
      eventTitle: 'Etkinlik adı',
      eventStart: 'Başlangıç',
      eventEnd: 'Bitiş',
      eventLocation: 'Konum',
      eventDescription: 'Açıklama',
      locationAddress: 'Adres veya yer',
      latitude: 'Enlem',
      longitude: 'Boylam',
      socialPlatform: 'Platform',
      socialProfileType: 'Profil türü',
      socialHandleOrUrl: 'Kullanıcı adı veya profil URL\'si',
      whatsappPhone: 'WhatsApp numarası veya @kullanıcıadı',
      whatsappMessage: 'Mesaj (isteğe bağlı)',
      mecardName: 'Ad Soyad',
      address: 'Adres',
      appWebUrl: 'Yedek / web URL\'si',
      appIosUrl: 'iOS App Store URL\'si',
      appAndroidUrl: 'Android Play Store URL\'si',
      appLinkTarget: 'Yedek mağaza',
      frame: 'Çerçeve',
      frameText: 'Çerçeve metni',
      frameColor: 'Çerçeve rengi'
    },
    placeholders: {
      url: 'örn. https://www.ornek.com',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      organization: 'ACME A.Ş.',
      title: 'Yazılım Geliştirici',
      phoneWork: '+90 212 123 45 67',
      phoneMobile: '+90 532 123 45 67',
      email: 'ahmet.yilmaz@ornek.com',
      website: 'https://www.ornek.com',
      street: 'Atatürk Cad. No: 12',
      city: 'İstanbul',
      state: 'Kadıköy',
      zip: '34710',
      country: 'Türkiye',
      ssid: 'örn. EvimWiFi',
      wifiPassword: 'Gizli şifren',
      phoneNumber: 'örn. +905321234567',
      smsMessage: 'Hazır mesajını buraya yaz...',
      emailTo: 'merhaba@ornek.com',
      emailSubject: 'QRTurbo.app\'ten merhaba',
      emailBody: 'E-posta mesajını buraya yaz...',
      eventTitle: 'Ekip toplantısı',
      eventLocation: 'Toplantı odası veya adres',
      eventDescription: 'Etkinlik ayrıntıları...',
      locationAddress: 'Sultanahmet Meydanı, Fatih, İstanbul',
      latitude: '41.006',
      longitude: '28.976',
      socialHandle: '@kullaniciadi veya https://...',
      whatsappPhone: 'örn. +905321234567 veya @kullaniciadi',
      whatsappMessage: 'WhatsApp mesajını buraya yaz...',
      mecardName: 'Ahmet Yılmaz',
      address: 'Atatürk Cad. No: 12, Kadıköy/İstanbul',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'QR kod oluştur',
      download: 'QR kodu indir',
      reset: 'Varsayılanlara sıfırla',
      customize: 'Görünümü özelleştir (isteğe bağlı)',
      chooseLogo: 'Görsel seç',
      showPassword: 'Şifreyi göster',
      hidePassword: 'Şifreyi gizle',
      showPayload: 'QR verisini göster',
      hidePayload: 'QR verisini gizle'
    },
    options: {
      sizeMedium: 'Ekran (512 px)',
      sizeLarge: 'Büyük (1024 px)',
      sizePrint: 'Baskı (2048 px)',
      sizePoster: 'Poster (4096 px)',
      frameNone: 'Çerçeve yok',
      frameBannerBottom: 'Yazı altta',
      frameBannerTop: 'Yazı üstte',
      frameOutline: 'Kenarlık ve yazı',
      errorLow: 'L - Düşük (%7)',
      errorMedium: 'M - Orta (%15)',
      errorQuartile: 'Q - Çeyrek (%25)',
      errorHigh: 'H - Yüksek (%30)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektör)',
      formatPdf: 'PDF (belge)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Yok',
      dotSquare: 'Kare',
      dotRounded: 'Yuvarlak',
      dotDots: 'Noktalar',
      dotClassy: 'Şık',
      dotClassyRounded: 'Şık yuvarlak',
      dotExtraRounded: 'Ekstra yuvarlak',
      cornerSquare: 'Kare',
      cornerExtraRounded: 'Ekstra yuvarlak',
      cornerDot: 'Nokta',
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
      socialOther: 'Diğer URL',
      socialTypePerson: 'Kişi/Profil',
      socialTypeCompany: 'Şirket',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Web URL\'si yoksa iOS bağlantısını kullan',
      appTargetAndroid: 'Web URL\'si yoksa Android bağlantısını kullan'
    },
    alerts: {
      enterText: 'Lütfen bir metin veya URL gir',
      vcardRequired: 'Lütfen şunlardan en az birini doldur: Ad, Soyad, E-posta veya Telefon numarası.',
      wifiSsidRequired: 'Lütfen ağ adını (SSID) gir.',
      wifiSsidLengthInvalid: 'WiFi ağ adı en fazla 32 UTF-8 bayt olabilir.',
      wifiWpaPasswordInvalid:
        'WPA/WPA2 şifreleri 8-63 yazdırılabilir karakter ya da tam olarak 64 onaltılık (hex) karakter olmalıdır.',
      wifiWepPasswordInvalid:
        'WEP şifreleri 5 veya 13 yazdırılabilir karakter ya da 10 veya 26 onaltılık (hex) karakter olmalıdır.',
      phoneRequired: 'Lütfen bir telefon numarası gir.',
      emailRequired: 'Lütfen en az bir e-posta alanını doldur.',
      emailInvalid: 'Lütfen geçerli bir e-posta adresi gir.',
      eventRequired: 'Lütfen etkinlik adını ve başlangıç zamanını gir.',
      eventEndInvalid: 'Bitiş zamanı başlangıç zamanından önce olamaz.',
      locationRequired: 'Lütfen bir adres veya her iki koordinatı da gir.',
      locationCoordinatesInvalid: 'Lütfen geçerli enlem ve boylam koordinatları gir.',
      socialRequired: 'Lütfen bir sosyal medya kullanıcı adı veya profil URL\'si gir.',
      socialHandleInvalid: 'Lütfen yalnızca harf, rakam, nokta, alt çizgi veya kısa çizgi içeren geçerli bir kullanıcı adı gir.',
      socialUrlInvalid: 'Lütfen http:// veya https:// ile başlayan geçerli bir sosyal medya profil URL\'si gir.',
      whatsappPhoneRequired: 'Lütfen ülke koduyla birlikte bir WhatsApp telefon numarası veya geçerli bir @kullanıcıadı gir.',
      mecardRequired: 'Lütfen şunlardan en az birini gir: Ad, Telefon numarası veya E-posta.',
      appLinkRequired: 'Lütfen bir web, iOS veya Android uygulama URL\'si gir.',
      urlInvalid: 'Lütfen http:// veya https:// ile başlayan geçerli bir URL gir.',
      lowContrast:
        '⚠️ Düşük kontrast algılandı. QR kodun zor taranabilir. Daha koyu bir ön plan veya daha açık bir arka plan kullanmayı düşün.',
      dataEmpty: 'QR kod verisi boş.',
      noData: 'QR kod için veri girilmedi.',
      libraryLoadFailed: 'QR kod kütüphanesi yüklenemedi. Lütfen sayfayı yenile.',
      generationError: 'QR kod oluşturulurken bir hata oluştu',
      dataTooLong: 'Bu içerik, seçilen hata düzeltme seviyesi için çok uzun. İçeriği kısalt veya daha düşük bir seviye seç.',
      pdfExportFailed: 'PDF dışa aktarılamadı. Lütfen tekrar dene.',
      generateFirst: 'Lütfen önce bir QR kod oluştur.',
      resetSuccess: 'Özelleştirmeler varsayılanlara sıfırlandı',
      largeImageWarning:
        '⚠️ Büyük görsel dosyası ({{size}} MB). Daha iyi performans için daha küçük bir görsel kullanmayı düşün.',
      invalidImageFile: 'Lütfen geçerli bir görsel dosyası seç (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} karakter'
    },
    units: {
      modules: '{{count}} modül'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefon araması'
    },
    warnings: {
      lowContrast:
        'Düşük kontrast, bu QR kodun taranmasını zorlaştırabilir. Daha koyu bir ön plan veya daha açık bir arka plan kullan.',
      transparentBackground:
        'Şeffaf arka planın nasıl görüneceği, kodun yer alacağı yüzeye bağlıdır. Yayınlamadan önce QR kodu tam o arka plan üzerinde test et.',
      quietZoneSmall:
        'Sessiz alan çok küçük. Güvenilir tarama için en az 4 modül kullan.',
      denseData:
        'Bu QR kod, seçilen boyut için çok fazla veri içeriyor. Daha büyük bir boyut seç veya içeriği kısalt.',
      logoErrorCorrection:
        'Büyük logolar, Yüksek (H) hata düzeltmeyle daha güvenilir taranır.',
      logoLarge:
        'Logo büyük ve QR kodun çok fazla kısmını kapatabilir. Basmadan veya paylaşmadan önce test et.'
    },
    brand: {
      tagline: 'QR kod oluşturmak için sana özel alan'
    },
    trust: {
      local: 'Tarayıcında oluşturulur',
      noUploads: 'Hiçbir şey yüklenmez',
      noTracking: 'Takip yok, çerez yok',
      offline: 'Çevrimdışı çalışır',
      openSource: 'Açık kaynak',
      noExpiry: 'Süresi hiç dolmaz',
      noSignup: 'Üyelik gerekmez'
    },
    workspace: {
      chooseType: 'Bir tür seç',
      addContent: 'İçeriğini ekle',
      adjustLook: 'Boyut ve stil'
    },
    preview: {
      title: 'Önizleme',
      localBadge: 'Bu cihazda oluşturuldu'
    },
    how: {
      title: 'Nasıl çalışır?',
      step1Title: 'Seç',
      step1Text: 'Kodun ne yapacağını seç: bir link açsın, WiFi ağına bağlasın, kişi kaydetsin ve daha fazlası.',
      step2Title: 'Doldur',
      step2Text: 'İçeriğini yaz. Önizleme, sen yazdıkça doğrudan tarayıcında güncellenir.',
      step3Title: 'İndir',
      step3Text: 'PNG, SVG veya PDF olarak kaydet. Basmadan ya da paylaşmadan önce taramayı test et.'
    },
    privacyInfo: {
      title: 'Baştan gizlilik odaklı',
      intro: 'QR kodlar çoğu zaman kişisel bilgiler taşır: bir WiFi şifresi, bir telefon numarası, bir ev adresi. QRTurbo.app, bunların hiçbiri bir sunucuya ulaşmayacak şekilde tasarlandı.',
      localTitle: 'Cihazında kalır',
      localText: 'QR kodlar ve logolar, tarayıcında çalışan kodla oluşturulur. Yazdıklarını alabilecek bir sunucu yok.',
      staticTitle: 'Yönlendirme yok, süre sınırı yok',
      staticText: 'İçeriğin doğrudan QR kodun içine kodlanır. Taramalar asla bizim üzerimizden geçmez ve kodun süresi hiç dolmaz.',
      noTrackingTitle: 'Takip yok',
      noTrackingText: 'Analitik, reklam, çerez veya hesap yok. Yalnızca dil ve tema tercihlerin, yerel olarak tarayıcında saklanır.',
      openSourceTitle: 'Denetime açık',
      openSourceText: 'Kaynak kodun tamamı GitHub\'da herkese açık; böylece bu iddiaları herkes doğrulayabilir.'
    },
    footer: {
      privacy1: 'Bu ücretsiz QR kod oluşturucu tamamen tarayıcında çalışır.',
      privacy2:
        'Hiçbir veri saklanmaz veya bir yere gönderilmez. Takip yok, reklam yok, saçmalık yok.',
      privacyPolicy: 'Gizlilik Politikası',
      termsOfUse: 'Kullanım Koşulları',
      github: 'Kaynak kodu GitHub\'da görüntüle'
    },
    helpers: {
      quietZoneHelper:
        'QR kodun etrafındaki boşluk (güvenilir tarama için en az 4 modül)',
      socialHandleHelper:
        '@kullaniciadi gibi bir kullanıcı adı gir veya https:// ile başlayan tam profil URL\'sini yapıştır.'
    },
    frame: {
      defaultText: 'TARA BENİ'
    },
    misc: {
      qrPlaceholder: 'QR kod burada görünecek',
      socialPreview: 'QR hedefi',
      wifiPayloadHidden: 'WiFi yapılandırması — şifre gizli'
    }
  };
})();
