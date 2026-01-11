// Chinese translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.zh = {
    meta: {
      title: '免费二维码生成器 - 自定义颜色、徽标和样式 | QRTurbo.app',
      description:
        '使用 QRTurbo.app 即时生成免费的可定制二维码。添加徽标、自定义颜色和样式。为网址、WiFi网络、电子名片、短信和电话创建二维码。无广告、无跟踪 – 完全基于浏览器且安全。',
      keywords:
        '二维码生成器, 自定义二维码, 带徽标的二维码, 彩色二维码, 免费二维码制作器, WiFi二维码, 电子名片二维码, 短信二维码, 在线二维码工具, 无跟踪二维码生成器'
    },
    app: {
      title: 'QRTurbo.app - 免费二维码生成器',
      subtitle: '创建带有徽标、颜色和样式的可定制二维码。支持网址、WiFi、电子名片、短信和电话',
      selectLanguage: '选择语言'
    },
    tabs: {
      urlText: '网址/文本',
      vcard: '电子名片',
      smsPhone: '短信/电话',
      wifi: 'WiFi'
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
      errorCorrection: '纠错级别',
      downloadFormat: '下载格式',
      dotStyle: '点样式',
      cornerSquare: '角方块',
      cornerDot: '角点',
      quietZone: '静区（边距）',
      logoSize: '徽标大小',
      logoMargin: '徽标边距',
      logo: '徽标（可选）',
      styleOptions: '样式选项'
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
      smsMessage: '您预填的消息在此...'
    },
    actions: {
      generate: '创建二维码',
      download: '下载二维码',
      reset: '重置为默认',
      customize: '自定义外观（可选）',
      chooseLogo: '选择图像'
    },
    options: {
      sizeSmall: '小（256像素）',
      sizeMedium: '中（512像素）',
      sizeLarge: '大（1024像素）',
      errorLow: 'L - 低（7%）',
      errorMedium: 'M - 中（15%）',
      errorQuartile: 'Q - 四分位（25%）',
      errorHigh: 'H - 高（30%）',
      formatPng: 'PNG（栅格）',
      formatSvg: 'SVG（矢量）',
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
      cornerDot: '点'
    },
    alerts: {
      enterText: '请输入文本或网址',
      vcardRequired: '请至少填写以下之一：名、姓、电子邮件或电话号码。',
      wifiSsidRequired: '请输入网络名称（SSID）。',
      phoneRequired: '请输入电话号码。',
      lowContrast: '⚠️ 检测到低对比度。您的二维码可能难以扫描。请考虑使用更深的前景色或更浅的背景色。',
      dataEmpty: '二维码数据为空。',
      noData: '未提供二维码数据。',
      libraryLoadFailed: '二维码库加载失败。请刷新页面。',
      generationError: '生成二维码时出错',
      generateFirst: '请先生成二维码。',
      resetSuccess: '自定义已重置为默认值',
      largeImageWarning: '⚠️ 图像文件较大（{{size}}MB）。请考虑使用较小的图像以获得更好的性能。',
      invalidImageFile: '请选择有效的图像文件（PNG、JPEG、SVG、GIF）。'
    },
    counters: {
      characters: '{{current}} / {{max}} 个字符'
    },
    labels: {
      sms: '短信',
      phone: '电话'
    },
    footer: {
      privacy1: '此免费二维码生成器完全在您的浏览器中运行。',
      privacy2: '不存储或发送任何数据。无跟踪、无广告、无废话。',
      github: '在 GitHub 上查看源代码'
    },
    helpers: {
      quietZoneHelper: '二维码周围的空间（推荐：4-16像素以确保可靠扫描）'
    },
    misc: {
      qrPlaceholder: '二维码将显示在此处'
    }
  };
})();
