// Japanese translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.ja = {
    meta: {
      title: 'ロゴと色を使える無料QRコードジェネレーター | QRTurbo.app',
      description:
        'URL、WiFi、vCard、SMS、電話用のカスタムQRコードを無料で作成。ロゴ、色、スタイルをブラウザ内で追加でき、追跡やデータアップロードはありません。'
    },
    app: {
      title: 'QRTurbo.app - 無料QRコードジェネレーター',
      subtitle:
        'ロゴ、色、スタイルを使用してカスタマイズ可能なQRコードを作成します。URL、WiFi、vCard、SMS、通話に対応',
      selectLanguage: '言語を選択'
    },
    tabs: {
      urlText: 'URL/テキスト',
      vcard: 'vCard',
      smsPhone: 'SMS/電話',
      wifi: 'WiFi',
      email: 'メール',
      calendarEvent: 'イベント',
      location: '位置情報',
      socialMedia: 'ソーシャルメディア',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'アプリリンク'
    },
    fields: {
      textOrUrl: 'テキストまたはURL',
      firstName: '名',
      lastName: '姓',
      organization: '組織',
      title: '役職',
      phoneWork: '電話（仕事）',
      phoneMobile: '電話（携帯）',
      email: 'メール',
      website: 'ウェブサイト',
      street: '番地',
      city: '市区町村',
      state: '都道府県',
      zip: '郵便番号',
      country: '国',
      ssid: 'ネットワーク名（SSID）',
      password: 'パスワード',
      authentication: '認証',
      hiddenNetwork: 'これは非表示ネットワークです',
      phoneNumber: '電話番号',
      message: 'メッセージ（任意）',
      qrSize: 'QRコードサイズ',
      foregroundColor: '前景色',
      backgroundColor: '背景色',
      errorCorrection: '誤り訂正',
      downloadFormat: 'ダウンロード形式',
      dotStyle: 'ドットスタイル',
      cornerSquare: 'コーナースクエア',
      cornerDot: 'コーナードット',
      quietZone: '静穏ゾーン（余白）',
      logoSize: 'ロゴサイズ',
      logoMargin: 'ロゴ余白',
      logo: 'ロゴ（任意）',
      styleOptions: 'スタイルオプション',
      emailTo: '宛先メール',
      emailSubject: '件名',
      emailBody: 'メッセージ',
      eventTitle: 'イベント名',
      eventStart: '開始',
      eventEnd: '終了',
      eventLocation: '場所',
      eventDescription: '説明',
      locationAddress: '住所または場所',
      latitude: '緯度',
      longitude: '経度',
      socialPlatform: 'プラットフォーム',
      socialProfileType: 'プロフィール種別',
      socialHandleOrUrl: 'ユーザー名またはプロフィールURL',
      whatsappPhone: 'WhatsApp番号または@ユーザー名',
      whatsappMessage: 'メッセージ（任意）',
      mecardName: '名前',
      address: '住所',
      appWebUrl: '予備 / Web URL',
      appIosUrl: 'iOS App Store URL',
      appAndroidUrl: 'Android Play Store URL',
      appLinkTarget: 'ストアの予備リンク'
    },
    placeholders: {
      url: '例：https://www.example.com',
      firstName: '太郎',
      lastName: '山田',
      organization: 'ACME株式会社',
      title: '開発者',
      phoneWork: '+81-3-5555-1234',
      phoneMobile: '+81-90-5555-5678',
      email: 'taro.yamada@example.com',
      website: 'https://www.example.com',
      street: '中央区123',
      city: '東京',
      state: '東京都',
      zip: '100-0001',
      country: '日本',
      ssid: '例：マイホームWiFi',
      wifiPassword: 'あなたの秘密のパスワード',
      phoneNumber: '例：+819012345678',
      smsMessage: 'あなたの事前入力メッセージをここに...',
      emailTo: 'hello@example.com',
      emailSubject: 'QRTurbo.appからこんにちは',
      emailBody: 'メール本文をここに入力...',
      eventTitle: 'チームミーティング',
      eventLocation: '会議室または住所',
      eventDescription: 'イベント詳細...',
      locationAddress: '東京駅, 東京',
      latitude: '35.6812',
      longitude: '139.7671',
      socialHandle: '@username または https://...',
      whatsappPhone: '例：+81555123456 または @username',
      whatsappMessage: 'WhatsAppメッセージをここに入力...',
      mecardName: '山田太郎',
      address: '東京都千代田区1-1',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'QRコードを作成',
      download: 'QRコードをダウンロード',
      reset: 'デフォルトにリセット',
      customize: '外観をカスタマイズ（任意）',
      chooseLogo: '画像を選択',
      showPassword: 'パスワードを表示',
      hidePassword: 'パスワードを非表示'
    },
    options: {
      sizeSmall: '小（256px）',
      sizeMedium: '中（512px）',
      sizeLarge: '大（1024px）',
      errorLow: 'L - 低（7%）',
      errorMedium: 'M - 中（15%）',
      errorQuartile: 'Q - 四分位（25%）',
      errorHigh: 'H - 高（30%）',
      formatPng: 'PNG（ラスター）',
      formatSvg: 'SVG（ベクター）',
      formatPdf: 'PDF（ドキュメント）',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'なし',
      dotSquare: '四角',
      dotRounded: '丸み',
      dotDots: 'ドット',
      dotClassy: 'クラシー',
      dotClassyRounded: 'クラシー丸み',
      dotExtraRounded: '超丸み',
      cornerSquare: '四角',
      cornerExtraRounded: '超丸み',
      cornerDot: 'ドット',
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
      socialOther: 'その他のURL',
      socialTypePerson: '個人/プロフィール',
      socialTypeCompany: '会社',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Web URLがない場合はiOSを使用',
      appTargetAndroid: 'Web URLがない場合はAndroidを使用'
    },
    alerts: {
      enterText: 'テキストまたはURLを入力してください',
      vcardRequired: '次のうち少なくとも1つを入力してください：名、姓、メール、または電話番号。',
      wifiSsidRequired: 'ネットワーク名（SSID）を入力してください。',
      wifiWpaPasswordInvalid:
        'WPA/WPA2パスワードは8〜63文字の印刷可能文字、または正確に64文字の16進数である必要があります。',
      wifiWepPasswordInvalid:
        'WEPパスワードは5文字または13文字の印刷可能文字、または10文字または26文字の16進数である必要があります。',
      phoneRequired: '電話番号を入力してください。',
      emailRequired: '少なくとも1つのメール項目を入力してください。',
      emailInvalid: '有効なメールアドレスを入力してください。',
      eventRequired: 'イベント名と開始時刻を入力してください。',
      eventEndInvalid: '終了時刻は開始時刻より前にできません。',
      locationRequired: '住所または両方の座標を入力してください。',
      locationCoordinatesInvalid: '有効な緯度と経度を入力してください。',
      socialRequired: 'ソーシャルメディアのユーザー名またはプロフィールURLを入力してください。',
      socialHandleInvalid: '英数字、ドット、アンダースコア、ハイフンを使った有効なユーザー名を入力してください。',
      socialUrlInvalid: 'http:// または https:// で始まる有効なソーシャルプロフィールURLを入力してください。',
      whatsappPhoneRequired: '国番号付きのWhatsApp電話番号、または有効な@ユーザー名を入力してください。',
      mecardRequired: '名前、電話番号、メールのいずれかを入力してください。',
      appLinkRequired: 'Web、iOS、またはAndroidアプリのURLを入力してください。',
      urlInvalid: 'http:// または https:// で始まる有効なURLを入力してください。',
      lowContrast:
        '⚠️ 低コントラストが検出されました。QRコードがスキャンしにくい可能性があります。より暗い前景色またはより明るい背景色の使用を検討してください。',
      dataEmpty: 'QRコードデータが空です。',
      noData: 'QRコードのデータが提供されていません。',
      libraryLoadFailed: 'QRコードライブラリの読み込みに失敗しました。ページを更新してください。',
      generationError: 'QRコード生成エラー',
      pdfExportFailed: 'PDFのエクスポートに失敗しました。もう一度お試しください。',
      generateFirst: '最初にQRコードを生成してください。',
      resetSuccess: 'カスタマイズがデフォルトにリセットされました',
      largeImageWarning:
        '⚠️ 大きな画像ファイル（{{size}}MB）。より良いパフォーマンスのために小さい画像の使用を検討してください。',
      invalidImageFile: '有効な画像ファイル（PNG、JPEG、SVG、GIF）を選択してください。'
    },
    counters: {
      characters: '{{current}} / {{max}} 文字'
    },
    labels: {
      sms: 'SMS',
      phone: '電話'
    },
    footer: {
      privacy1: 'この無料QRコードジェネレーターは完全にブラウザで実行されます。',
      privacy2: 'データは保存または送信されません。トラッキングなし、広告なし、ナンセンスなし。',
      privacyPolicy: 'プライバシーポリシー',
      termsOfUse: '利用規約',
      github: 'GitHubでソースコードを表示'
    },
    helpers: {
      quietZoneHelper: 'QRコード周辺のスペース（推奨：信頼性の高いスキャンのために4-16px）',
      socialHandleHelper:
        '@username のようなユーザー名を入力するか、完全な https:// プロフィールURLを貼り付けてください。'
    },
    misc: {
      qrPlaceholder: 'QRコードがここに表示されます',
      socialPreview: 'QRのリンク先'
    }
  };
})();
