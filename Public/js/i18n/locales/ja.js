// Japanese translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.ja = {
    meta: {
      title: '無料QRコードジェネレーター - 色、ロゴ、スタイルをカスタマイズ | QRTurbo.app',
      description:
        'QRTurbo.appで無料のカスタマイズ可能なQRコードを即座に生成します。ロゴ、カスタムカラー、スタイルを追加できます。URL、WiFiネットワーク、vCard、SMS、電話用のQRコードを作成します。広告なし、トラッキングなし – 完全にブラウザベースで安全です。',
      keywords:
        'QRコードジェネレーター, カスタムQRコード, ロゴ付きQRコード, カラーQRコード, 無料QRコード作成, WiFi QRコード, vCard QRコード, SMS QRコード, オンラインQRツール, トラッキングなしQRジェネレーター'
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
      wifi: 'WiFi'
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
      styleOptions: 'スタイルオプション'
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
      smsMessage: 'あなたの事前入力メッセージをここに...'
    },
    actions: {
      generate: 'QRコードを作成',
      download: 'QRコードをダウンロード',
      reset: 'デフォルトにリセット',
      customize: '外観をカスタマイズ（任意）',
      chooseLogo: '画像を選択'
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
      cornerDot: 'ドット'
    },
    alerts: {
      enterText: 'テキストまたはURLを入力してください',
      vcardRequired: '次のうち少なくとも1つを入力してください：名、姓、メール、または電話番号。',
      wifiSsidRequired: 'ネットワーク名（SSID）を入力してください。',
      phoneRequired: '電話番号を入力してください。',
      lowContrast:
        '⚠️ 低コントラストが検出されました。QRコードがスキャンしにくい可能性があります。より暗い前景色またはより明るい背景色の使用を検討してください。',
      dataEmpty: 'QRコードデータが空です。',
      noData: 'QRコードのデータが提供されていません。',
      libraryLoadFailed: 'QRコードライブラリの読み込みに失敗しました。ページを更新してください。',
      generationError: 'QRコード生成エラー',
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
      github: 'GitHubでソースコードを表示'
    },
    helpers: {
      quietZoneHelper: 'QRコード周辺のスペース（推奨：信頼性の高いスキャンのために4-16px）'
    },
    misc: {
      qrPlaceholder: 'QRコードがここに表示されます'
    }
  };
})();
