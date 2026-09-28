// Japanese translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.ja = {
    app: {
      selectLanguage: '言語を選択'
    },
    aria: {
      themeGroup: 'テーマ',
      lightTheme: 'ライトテーマ',
      darkTheme: 'ダークテーマ',
      language: '言語',
      qrTypes: 'QRコードの種類'
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
      transparentBackground: '透明な背景',
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
      appLinkTarget: 'ストアの予備リンク',
      frame: 'フレーム',
      frameText: 'フレームの文字',
      frameColor: 'フレームの色'
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
      hidePassword: 'パスワードを非表示',
      showPayload: 'QRデータを表示',
      hidePayload: 'QRデータを非表示'
    },
    options: {
      sizeMedium: '画面用（512px）',
      sizeLarge: '大（1024px）',
      sizePrint: '印刷用（2048px）',
      sizePoster: 'ポスター用（4096px）',
      frameNone: 'フレームなし',
      frameBannerBottom: '下にラベル',
      frameBannerTop: '上にラベル',
      frameOutline: '枠線とラベル',
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
      wifiSsidLengthInvalid: 'WiFiネットワーク名はUTF-8で32バイト以内にしてください。',
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
      dataTooLong:
        '選択したQR誤り訂正レベルではデータが大きすぎます。内容を短くするか、より低いレベルを選択してください。',
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
    units: {
      modules: '{{count}}モジュール'
    },
    labels: {
      sms: 'SMS',
      phone: '電話'
    },
    warnings: {
      lowContrast:
        'コントラストが低いとQRコードをスキャンしにくくなることがあります。前景色を暗くするか、背景色を明るくしてください。',
      transparentBackground:
        '透明な背景の見え方は配置先の背景によって変わります。公開前に実際の背景でQRコードをテストしてください。',
      quietZoneSmall:
        '静穏ゾーンが小さすぎます。確実にスキャンできるよう、4モジュール以上に設定してください。',
      denseData:
        '選択したサイズに対してQRコードのデータ量が多すぎます。サイズを大きくするか、内容を短くしてください。',
      logoErrorCorrection:
        '大きなロゴは、高い（H）誤り訂正レベルを使用するとより確実に機能します。',
      logoLarge:
        'ロゴが大きいため、QRコードを覆いすぎる可能性があります。印刷または共有する前にテストしてください。'
    },
    brand: {
      tagline: 'QRコードをプライベートに作れる場所'
    },
    trust: {
      local: 'ブラウザ内で生成',
      noUploads: 'アップロードなし',
      noTracking: 'トラッキング・Cookieなし',
      offline: 'オフラインで動作',
      openSource: 'オープンソース',
      noExpiry: '有効期限なし',
      noSignup: '登録不要'
    },
    workspace: {
      chooseType: '種類を選択',
      addContent: '内容を入力',
      adjustLook: 'サイズとスタイル'
    },
    preview: {
      title: 'プレビュー',
      localBadge: 'このデバイスで作成'
    },
    how: {
      title: '使い方',
      step1Title: '選ぶ',
      step1Text: 'コードの用途を選びます。リンクを開く、WiFiに接続する、連絡先を保存するなど。',
      step2Title: '入力する',
      step2Text: '内容を入力すると、ブラウザ内でプレビューがすぐに更新されます。',
      step3Title: 'ダウンロード',
      step3Text: 'PNG、SVG、PDFで保存できます。印刷や共有の前にスキャンをテストしてください。'
    },
    privacyInfo: {
      title: '設計からプライベート',
      intro: 'QRコードにはWiFiのパスワード、電話番号、住所などの個人情報が含まれることがよくあります。QRTurbo.appは、それらが決してサーバーに届かないように作られています。',
      localTitle: 'デバイス内にとどまる',
      localText: 'QRコードとロゴはブラウザ内で動作するコードで生成されます。入力内容を受け取るサーバーは存在しません。',
      staticTitle: 'リダイレクトなし・期限なし',
      staticText: '内容はQRコードに直接エンコードされます。スキャンが当サイトを経由することはなく、コードが期限切れになることもありません。',
      noTrackingTitle: 'トラッキングなし',
      noTrackingText: '分析、広告、Cookie、アカウントは一切ありません。言語とテーマの設定だけがブラウザ内に保存されます。',
      openSourceTitle: '誰でも検証可能',
      openSourceText: 'ソースコードはすべてGitHubで公開されているため、誰でもこれらの内容を確認できます。'
    },
    footer: {
      privacy1: 'この無料QRコードジェネレーターは完全にブラウザで実行されます。',
      privacy2: 'データは保存または送信されません。トラッキングなし、広告なし、ナンセンスなし。',
      privacyPolicy: 'プライバシーポリシー',
      termsOfUse: '利用規約',
      github: 'GitHubでソースコードを表示'
    },
    helpers: {
      quietZoneHelper: 'QRコード周辺のスペース（確実な読み取りには最低4モジュール）',
      socialHandleHelper:
        '@username のようなユーザー名を入力するか、完全な https:// プロフィールURLを貼り付けてください。'
    },
    frame: {
      defaultText: 'スマホで読み取り'
    },
    misc: {
      qrPlaceholder: 'QRコードがここに表示されます',
      socialPreview: 'QRのリンク先',
      wifiPayloadHidden: 'WiFi設定 — パスワードは非表示'
    }
  };
})();
