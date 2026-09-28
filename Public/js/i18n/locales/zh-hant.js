// Traditional Chinese (Taiwan) translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations['zh-hant'] = {
    app: {
      selectLanguage: '選擇語言'
    },
    aria: {
      themeGroup: '主題',
      lightTheme: '淺色主題',
      darkTheme: '深色主題',
      language: '語言',
      qrTypes: 'QR Code 類型'
    },
    tabs: {
      urlText: '網址/文字',
      vcard: 'vCard 名片',
      smsPhone: '簡訊/電話',
      wifi: 'WiFi',
      email: '電子郵件',
      calendarEvent: '活動',
      location: '位置',
      socialMedia: '社群媒體',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'App 連結'
    },
    fields: {
      textOrUrl: '文字或網址',
      firstName: '名字',
      lastName: '姓氏',
      organization: '公司/組織',
      title: '職稱',
      phoneWork: '電話（公司）',
      phoneMobile: '電話（手機）',
      email: '電子郵件',
      website: '網站',
      street: '街道地址',
      city: '縣市',
      state: '鄉鎮市區',
      zip: '郵遞區號',
      country: '國家/地區',
      ssid: '網路名稱（SSID）',
      password: '密碼',
      authentication: '加密方式',
      hiddenNetwork: '這是隱藏網路',
      phoneNumber: '電話號碼',
      message: '訊息（選填）',
      qrSize: 'QR Code 尺寸',
      foregroundColor: '前景色',
      backgroundColor: '背景色',
      transparentBackground: '透明背景',
      errorCorrection: '容錯等級',
      downloadFormat: '下載格式',
      dotStyle: '碼點樣式',
      cornerSquare: '定位框外框',
      cornerDot: '定位框中心點',
      quietZone: '靜區（邊界）',
      logoSize: 'Logo 大小',
      logoMargin: 'Logo 邊距',
      logo: 'Logo（選填）',
      styleOptions: '樣式選項',
      emailTo: '收件人電子郵件',
      emailSubject: '主旨',
      emailBody: '內文',
      eventTitle: '活動名稱',
      eventStart: '開始',
      eventEnd: '結束',
      eventLocation: '地點',
      eventDescription: '說明',
      locationAddress: '地址或地點',
      latitude: '緯度',
      longitude: '經度',
      socialPlatform: '平台',
      socialProfileType: '帳號類型',
      socialHandleOrUrl: '帳號或個人檔案網址',
      whatsappPhone: 'WhatsApp 號碼或 @使用者名稱',
      whatsappMessage: '訊息（選填）',
      mecardName: '姓名',
      address: '地址',
      appWebUrl: '備用/網頁網址',
      appIosUrl: 'iOS App Store 網址',
      appAndroidUrl: 'Android Google Play 網址',
      appLinkTarget: '備用商店連結',
      frame: '外框',
      frameText: '外框文字',
      frameColor: '外框顏色'
    },
    placeholders: {
      url: '例如：https://www.example.com',
      firstName: '小明',
      lastName: '王',
      organization: 'ACME 股份有限公司',
      title: '工程師',
      phoneWork: '+886 2 2345 6789',
      phoneMobile: '+886 912 345 678',
      email: 'xiaoming.wang@example.com',
      website: 'https://www.example.com',
      street: '忠孝東路一段 1 號',
      city: '台北市',
      state: '中正區',
      zip: '100',
      country: '台灣',
      ssid: '例如：我家的 WiFi',
      wifiPassword: '您的 WiFi 密碼',
      phoneNumber: '例如：+886912345678',
      smsMessage: '在此輸入預先填好的簡訊內容…',
      emailTo: 'hello@example.com',
      emailSubject: '來自 QRTurbo.app 的問候',
      emailBody: '在此輸入郵件內文…',
      eventTitle: '團隊會議',
      eventLocation: '會議室或地址',
      eventDescription: '活動詳情…',
      locationAddress: '台北 101，台北市信義區信義路五段 7 號',
      latitude: '25.034',
      longitude: '121.565',
      socialHandle: '@username 或 https://...',
      whatsappPhone: '例如：+886912345678 或 @username',
      whatsappMessage: '在此輸入 WhatsApp 訊息…',
      mecardName: '王小明',
      address: '台北市中正區忠孝東路一段 1 號',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: '產生 QR Code',
      download: '下載 QR Code',
      reset: '恢復預設值',
      customize: '自訂外觀（選填）',
      chooseLogo: '選擇圖片',
      showPassword: '顯示密碼',
      hidePassword: '隱藏密碼',
      showPayload: '顯示 QR Code 資料',
      hidePayload: '隱藏 QR Code 資料'
    },
    options: {
      sizeMedium: '螢幕（512 px）',
      sizeLarge: '大（1024 px）',
      sizePrint: '列印（2048 px）',
      sizePoster: '海報（4096 px）',
      frameNone: '無外框',
      frameBannerBottom: '文字在下方',
      frameBannerTop: '文字在上方',
      frameOutline: '外框加文字',
      errorLow: 'L - 低（7%）',
      errorMedium: 'M - 中（15%）',
      errorQuartile: 'Q - 中高（25%）',
      errorHigh: 'H - 高（30%）',
      formatPng: 'PNG（點陣圖）',
      formatSvg: 'SVG（向量圖）',
      formatPdf: 'PDF（文件）',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: '無',
      dotSquare: '方形',
      dotRounded: '圓角',
      dotDots: '圓點',
      dotClassy: '典雅',
      dotClassyRounded: '典雅圓角',
      dotExtraRounded: '超圓角',
      cornerSquare: '方形',
      cornerExtraRounded: '超圓角',
      cornerDot: '圓點',
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
      socialOther: '其他網址',
      socialTypePerson: '個人/個人檔案',
      socialTypeCompany: '公司',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: '沒有網頁網址時使用 iOS',
      appTargetAndroid: '沒有網頁網址時使用 Android'
    },
    alerts: {
      enterText: '請輸入文字或網址',
      vcardRequired: '請至少填寫以下其中一項：名字、姓氏、電子郵件或電話號碼。',
      wifiSsidRequired: '請輸入網路名稱（SSID）。',
      wifiSsidLengthInvalid: 'WiFi 網路名稱最多只能有 32 個 UTF-8 位元組。',
      wifiWpaPasswordInvalid:
        'WPA/WPA2 密碼必須是 8–63 個可列印字元，或剛好 64 個十六進位字元。',
      wifiWepPasswordInvalid:
        'WEP 密碼必須是 5 或 13 個可列印字元，或 10 或 26 個十六進位字元。',
      phoneRequired: '請輸入電話號碼。',
      emailRequired: '請至少填寫一個電子郵件欄位。',
      emailInvalid: '請輸入有效的電子郵件地址。',
      eventRequired: '請輸入活動名稱和開始時間。',
      eventEndInvalid: '活動結束時間不能早於開始時間。',
      locationRequired: '請輸入地址，或同時輸入緯度和經度。',
      locationCoordinatesInvalid: '請輸入有效的緯度和經度座標。',
      socialRequired: '請輸入社群媒體帳號或個人檔案網址。',
      socialHandleInvalid: '請輸入有效的帳號，只能使用英文字母、數字、點、底線或連字號。',
      socialUrlInvalid: '請輸入以 http:// 或 https:// 開頭的有效個人檔案網址。',
      whatsappPhoneRequired: '請輸入含國碼的 WhatsApp 電話號碼，或有效的 @使用者名稱。',
      mecardRequired: '請至少填寫以下其中一項：姓名、電話號碼或電子郵件。',
      appLinkRequired: '請輸入網頁、iOS 或 Android App 的網址。',
      urlInvalid: '請輸入以 http:// 或 https:// 開頭的有效網址。',
      lowContrast: '⚠️ 偵測到對比度過低，QR Code 可能不易掃描。建議使用較深的前景色或較淺的背景色。',
      dataEmpty: 'QR Code 資料是空的。',
      noData: '未提供 QR Code 資料。',
      libraryLoadFailed: 'QR Code 程式庫載入失敗，請重新整理頁面。',
      generationError: '產生 QR Code 時發生錯誤',
      dataTooLong: '內容太多，超出所選容錯等級可容納的範圍。請縮短內容或選擇較低的等級。',
      pdfExportFailed: 'PDF 匯出失敗，請再試一次。',
      generateFirst: '請先產生 QR Code。',
      resetSuccess: '已將自訂設定恢復為預設值',
      largeImageWarning: '⚠️ 圖片檔案較大（{{size}}MB），建議使用較小的圖片以提升效能。',
      invalidImageFile: '請選擇有效的圖片檔案（PNG、JPEG、SVG、GIF）。'
    },
    counters: {
      characters: '{{current}} / {{max}} 個字元'
    },
    units: {
      modules: '{{count}} 個模組'
    },
    labels: {
      sms: '簡訊',
      phone: '撥打電話'
    },
    warnings: {
      lowContrast: '對比度過低可能導致 QR Code 不易掃描。請使用較深的前景色或較淺的背景色。',
      transparentBackground:
        '透明背景的效果取決於最終印製或顯示的表面。發布前，請在實際的背景上測試 QR Code。',
      quietZoneSmall: '靜區太小。請至少保留 4 個模組，才能穩定掃描。',
      denseData: '以目前的尺寸來說，這個 QR Code 的資料量太多。請加大尺寸或縮短內容。',
      logoErrorCorrection: '使用大尺寸 Logo 時，搭配高（H）容錯等級較能穩定掃描。',
      logoLarge: 'Logo 太大，可能遮住過多 QR Code。列印或分享前請先測試。'
    },
    brand: {
      tagline: '您的私密 QR Code 製作空間'
    },
    trust: {
      local: '在瀏覽器中產生',
      noUploads: '不上傳任何資料',
      noTracking: '無追蹤、無 Cookie',
      offline: '可離線使用',
      openSource: '開放原始碼',
      noExpiry: '永不過期',
      noSignup: '免註冊'
    },
    workspace: {
      chooseType: '選擇類型',
      addContent: '輸入內容',
      adjustLook: '尺寸與樣式'
    },
    preview: {
      title: '預覽',
      localBadge: '在此裝置上產生'
    },
    how: {
      title: '使用方式',
      step1Title: '選擇',
      step1Text: '決定 QR Code 的用途：開啟連結、連上 WiFi、儲存聯絡人等。',
      step2Title: '填寫',
      step2Text: '輸入內容，預覽會隨著輸入即時更新，全程都在您的瀏覽器中進行。',
      step3Title: '下載',
      step3Text: '儲存為 PNG、SVG 或 PDF。列印或分享前，請先測試掃描。'
    },
    privacyInfo: {
      title: '隱私至上的設計',
      intro: 'QR Code 經常包含個人資料：WiFi 密碼、電話號碼、住家地址。QRTurbo.app 的設計確保這些資料絕不會傳到任何伺服器。',
      localTitle: '資料留在您的裝置上',
      localText: 'QR Code 和 Logo 都由在您瀏覽器中執行的程式碼產生，沒有任何後端伺服器能接收您輸入的內容。',
      staticTitle: '不轉址、不過期',
      staticText: '內容直接編碼在 QR Code 中。掃描時不會經過我們，QR Code 也永不過期。',
      noTrackingTitle: '無追蹤',
      noTrackingText: '沒有分析工具、廣告、Cookie 或帳號。只有您選擇的語言和主題會儲存在瀏覽器本機。',
      openSourceTitle: '公開透明',
      openSourceText: '完整原始碼公開在 GitHub 上，任何人都能驗證這些說法。'
    },
    footer: {
      privacy1: '這個免費 QR Code 產生器完全在您的瀏覽器中執行。',
      privacy2: '不儲存、也不傳送任何資料。沒有追蹤、沒有廣告，也沒有多餘的花招。',
      privacyPolicy: '隱私權政策',
      termsOfUse: '使用條款',
      github: '在 GitHub 上查看原始碼'
    },
    helpers: {
      quietZoneHelper: 'QR Code 周圍的留白（至少 4 個模組才能穩定掃描）',
      socialHandleHelper: '輸入帳號（例如 @username），或貼上完整的 https:// 個人檔案網址。'
    },
    frame: {
      defaultText: '掃一掃'
    },
    misc: {
      qrPlaceholder: 'QR Code 會顯示在這裡',
      socialPreview: 'QR Code 目標',
      wifiPayloadHidden: 'WiFi 設定 — 密碼已隱藏'
    }
  };
})();
