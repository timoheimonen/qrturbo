// Chinese translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.zh = {
    app: {
      selectLanguage: '选择语言'
    },
    aria: {
      themeGroup: '主题',
      lightTheme: '浅色主题',
      darkTheme: '深色主题',
      language: '语言',
      qrTypes: '二维码类型'
    },
    tabs: {
      urlText: '网址/文本',
      vcard: '电子名片',
      smsPhone: '短信/电话',
      wifi: 'WiFi',
      email: '电子邮件',
      calendarEvent: '活动',
      location: '位置',
      socialMedia: '社交媒体',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: '应用链接'
    },
    fields: {
      textOrUrl: '文本或网址',
      firstName: '名',
      lastName: '姓',
      organization: '组织',
      title: '职位',
      phoneWork: '电话（工作）',
      phoneMobile: '电话（手机）',
      email: '电子邮件',
      website: '网站',
      street: '街道',
      city: '城市',
      state: '省/州',
      zip: '邮政编码',
      country: '国家',
      ssid: '网络名称（SSID）',
      password: '密码',
      authentication: '认证',
      hiddenNetwork: '这是隐藏网络',
      phoneNumber: '电话号码',
      message: '消息（可选）',
      qrSize: '二维码大小',
      foregroundColor: '前景色',
      backgroundColor: '背景色',
      transparentBackground: '透明背景',
      errorCorrection: '纠错级别',
      downloadFormat: '下载格式',
      dotStyle: '点样式',
      cornerSquare: '角方块',
      cornerDot: '角点',
      quietZone: '静区（边距）',
      logoSize: '徽标大小',
      logoMargin: '徽标边距',
      logo: '徽标（可选）',
      styleOptions: '样式选项',
      emailTo: '收件人邮箱',
      emailSubject: '主题',
      emailBody: '消息',
      eventTitle: '活动标题',
      eventStart: '开始',
      eventEnd: '结束',
      eventLocation: '位置',
      eventDescription: '描述',
      locationAddress: '地址或地点',
      latitude: '纬度',
      longitude: '经度',
      socialPlatform: '平台',
      socialProfileType: '资料类型',
      socialHandleOrUrl: '用户名或资料 URL',
      whatsappPhone: 'WhatsApp 号码或 @用户名',
      whatsappMessage: '消息（可选）',
      mecardName: '姓名',
      address: '地址',
      appWebUrl: '备用 / Web URL',
      appIosUrl: 'iOS App Store URL',
      appAndroidUrl: 'Android Play Store URL',
      appLinkTarget: '商店备用链接',
      frame: '边框',
      frameText: '边框文字',
      frameColor: '边框颜色'
    },
    placeholders: {
      url: '例如，https://www.example.com',
      firstName: '小明',
      lastName: '王',
      organization: 'ACME 公司',
      title: '开发人员',
      phoneWork: '+86-555-555-1234',
      phoneMobile: '+86-555-555-5678',
      email: 'xiaoming.wang@example.com',
      website: 'https://www.example.com',
      street: '主街 123 号',
      city: '北京',
      state: '北京',
      zip: '100000',
      country: '中国',
      ssid: '例如，我的家庭WiFi',
      wifiPassword: '您的密码',
      phoneNumber: '例如，+86555123456',
      smsMessage: '您预填的消息在此...',
      emailTo: 'hello@example.com',
      emailSubject: '来自 QRTurbo.app 的问候',
      emailBody: '在这里输入邮件内容...',
      eventTitle: '团队会议',
      eventLocation: '会议室或地址',
      eventDescription: '活动详情...',
      locationAddress: '北京天安门, 北京',
      latitude: '39.9087',
      longitude: '116.3975',
      socialHandle: '@username 或 https://...',
      whatsappPhone: '例如，+86555123456 或 @username',
      whatsappMessage: '在这里输入 WhatsApp 消息...',
      mecardName: '张三',
      address: '北京市东城区长安街1号',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: '创建二维码',
      download: '下载二维码',
      reset: '重置为默认',
      customize: '自定义外观（可选）',
      chooseLogo: '选择图像',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',
      showPayload: '显示二维码数据',
      hidePayload: '隐藏二维码数据'
    },
    options: {
      sizeMedium: '屏幕（512 像素）',
      sizeLarge: '大（1024 像素）',
      sizePrint: '打印（2048 像素）',
      sizePoster: '海报（4096 像素）',
      frameNone: '无边框',
      frameBannerBottom: '文字在下方',
      frameBannerTop: '文字在上方',
      frameOutline: '外框加文字',
      errorLow: 'L - 低（7%）',
      errorMedium: 'M - 中（15%）',
      errorQuartile: 'Q - 四分位（25%）',
      errorHigh: 'H - 高（30%）',
      formatPng: 'PNG（栅格）',
      formatSvg: 'SVG（矢量）',
      formatPdf: 'PDF（文档）',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: '无',
      dotSquare: '方形',
      dotRounded: '圆角',
      dotDots: '点',
      dotClassy: '优雅',
      dotClassyRounded: '优雅圆角',
      dotExtraRounded: '超圆角',
      cornerSquare: '方形',
      cornerExtraRounded: '超圆角',
      cornerDot: '点',
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
      socialOther: '其他 URL',
      socialTypePerson: '个人/资料',
      socialTypeCompany: '公司',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: '没有 Web URL 时使用 iOS',
      appTargetAndroid: '没有 Web URL 时使用 Android'
    },
    alerts: {
      enterText: '请输入文本或网址',
      vcardRequired: '请至少填写以下之一：名、姓、电子邮件或电话号码。',
      wifiSsidRequired: '请输入网络名称（SSID）。',
      wifiSsidLengthInvalid: 'WiFi 网络名称最多可包含 32 个 UTF-8 字节。',
      wifiWpaPasswordInvalid:
        'WPA/WPA2 密码必须为 8-63 个可打印字符，或正好 64 个十六进制字符。',
      wifiWepPasswordInvalid:
        'WEP 密码必须为 5 或 13 个可打印字符，或 10 或 26 个十六进制字符。',
      phoneRequired: '请输入电话号码。',
      emailRequired: '请至少填写一个电子邮件字段。',
      emailInvalid: '请输入有效的电子邮件地址。',
      eventRequired: '请输入活动标题和开始时间。',
      eventEndInvalid: '结束时间不能早于开始时间。',
      locationRequired: '请输入地址或完整坐标。',
      locationCoordinatesInvalid: '请输入有效的纬度和经度坐标。',
      socialRequired: '请输入社交媒体用户名或资料 URL。',
      socialHandleInvalid: '请输入有效用户名，可使用字母、数字、点、下划线或连字符。',
      socialUrlInvalid: '请输入以 http:// 或 https:// 开头的有效社交资料 URL。',
      whatsappPhoneRequired: '请输入带国家/地区代码的 WhatsApp 电话号码，或有效的 @用户名。',
      mecardRequired: '请至少填写以下之一：姓名、电话号码或电子邮件。',
      appLinkRequired: '请输入 Web、iOS 或 Android 应用 URL。',
      urlInvalid: '请输入以 http:// 或 https:// 开头的有效 URL。',
      lowContrast: '⚠️ 检测到低对比度。您的二维码可能难以扫描。请考虑使用更深的前景色或更浅的背景色。',
      dataEmpty: '二维码数据为空。',
      noData: '未提供二维码数据。',
      libraryLoadFailed: '二维码库加载失败。请刷新页面。',
      generationError: '生成二维码时出错',
      dataTooLong: '内容对于所选的二维码纠错级别过大。请缩短内容或选择较低的级别。',
      pdfExportFailed: 'PDF 导出失败。请重试。',
      generateFirst: '请先生成二维码。',
      resetSuccess: '自定义已重置为默认值',
      largeImageWarning: '⚠️ 图像文件较大（{{size}}MB）。请考虑使用较小的图像以获得更好的性能。',
      invalidImageFile: '请选择有效的图像文件（PNG、JPEG、SVG、GIF）。'
    },
    counters: {
      characters: '{{current}} / {{max}} 个字符'
    },
    units: {
      modules: '{{count}} 个模块'
    },
    labels: {
      sms: '短信',
      phone: '电话'
    },
    warnings: {
      lowContrast: '低对比度可能会使二维码难以扫描。请使用更深的前景色或更浅的背景色。',
      transparentBackground:
        '透明背景的效果取决于最终承载表面。发布前请在实际背景上测试二维码。',
      quietZoneSmall: '静区太小。请至少保留 4 个模块，以确保可靠扫描。',
      denseData: '所选尺寸的二维码包含过多数据。请使用更大尺寸或缩短内容。',
      logoErrorCorrection: '大尺寸徽标在高（H）纠错级别下更可靠。',
      logoLarge: '徽标较大，可能会遮挡过多二维码。请在打印或分享前进行测试。'
    },
    brand: {
      tagline: '私密制作二维码的地方'
    },
    trust: {
      local: '在浏览器中生成',
      noUploads: '不上传任何内容',
      noTracking: '无跟踪、无 Cookie',
      offline: '可离线使用',
      openSource: '开源',
      noExpiry: '永不过期',
      noSignup: '无需注册'
    },
    workspace: {
      chooseType: '选择类型',
      addContent: '填写内容',
      adjustLook: '尺寸与样式'
    },
    preview: {
      title: '预览',
      localBadge: '在此设备上生成'
    },
    how: {
      title: '使用方法',
      step1Title: '选择',
      step1Text: '决定二维码的用途：打开链接、连接 WiFi、保存联系人等。',
      step2Title: '填写',
      step2Text: '输入内容，预览会在浏览器中随输入实时更新。',
      step3Title: '下载',
      step3Text: '保存为 PNG、SVG 或 PDF。打印或分享前请先测试扫描。'
    },
    privacyInfo: {
      title: '隐私优先的设计',
      intro: '二维码常常包含个人信息：WiFi 密码、电话号码、家庭住址。QRTurbo.app 的设计确保这些信息永远不会到达任何服务器。',
      localTitle: '留在您的设备上',
      localText: '二维码和徽标由在您浏览器中运行的代码生成。没有任何服务器可以接收您输入的内容。',
      staticTitle: '无跳转、不过期',
      staticText: '内容直接编码在二维码中。扫描不会经过我们，二维码也永不过期。',
      noTrackingTitle: '无跟踪',
      noTrackingText: '没有分析、广告、Cookie 或账户。只有语言和主题选择会保存在您的浏览器本地。',
      openSourceTitle: '公开可查',
      openSourceText: '完整源代码在 GitHub 上公开，任何人都可以验证这些说法。'
    },
    footer: {
      privacy1: '此免费二维码生成器完全在您的浏览器中运行。',
      privacy2: '不存储或发送任何数据。无跟踪、无广告、无废话。',
      privacyPolicy: '隐私政策',
      termsOfUse: '使用条款',
      github: '在 GitHub 上查看源代码'
    },
    helpers: {
      quietZoneHelper: '二维码周围的空白区域（可靠扫描至少需要4个模块）',
      socialHandleHelper: '输入 @username 这样的用户名，或粘贴完整的 https:// 资料 URL。'
    },
    frame: {
      defaultText: '扫一扫'
    },
    misc: {
      qrPlaceholder: '二维码将显示在此处',
      socialPreview: '二维码目标',
      wifiPayloadHidden: 'WiFi 配置 — 密码已隐藏'
    }
  };
})();
