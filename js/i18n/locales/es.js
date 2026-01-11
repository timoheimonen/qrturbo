// Spanish translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.es = {
    meta: {
      title:
        'Generador de Códigos QR Gratis - Personaliza Colores, Logos y Estilos | QRTurbo.app',
      description:
        'Genera códigos QR personalizables gratis al instante con QRTurbo.app. Añade logos, colores personalizados y estilos. Crea códigos QR para URLs, redes WiFi, vCards, SMS y llamadas. Sin anuncios, sin seguimiento – completamente en el navegador y seguro.',
      keywords:
        'generador de código QR, código QR personalizado, código QR con logo, código QR de colores, creador de código QR gratis, código QR WiFi, código QR vCard, código QR SMS, herramienta QR en línea, generador QR sin seguimiento'
    },
    app: {
      title: 'QRTurbo.app - Generador de Códigos QR Gratis',
      subtitle:
        'Crea códigos QR personalizables con logos, colores y estilos. Compatible con URLs, WiFi, vCards, SMS y llamadas',
      selectLanguage: 'Seleccionar Idioma'
    },
    tabs: {
      urlText: 'URL/Texto',
      vcard: 'vCard',
      smsPhone: 'SMS/Teléfono',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Texto o URL',
      firstName: 'Nombre',
      lastName: 'Apellido',
      organization: 'Organización',
      title: 'Título',
      phoneWork: 'Teléfono (Trabajo)',
      phoneMobile: 'Teléfono (Móvil)',
      email: 'Correo Electrónico',
      website: 'Sitio Web',
      street: 'Calle',
      city: 'Ciudad',
      state: 'Estado/Provincia',
      zip: 'Código Postal',
      country: 'País',
      ssid: 'Nombre de Red (SSID)',
      password: 'Contraseña',
      authentication: 'Autenticación',
      hiddenNetwork: 'Esta es una red oculta',
      phoneNumber: 'Número de Teléfono',
      message: 'Mensaje (opcional)',
      qrSize: 'Tamaño del Código QR',
      foregroundColor: 'Color Principal',
      backgroundColor: 'Color de Fondo',
      errorCorrection: 'Corrección de Errores',
      downloadFormat: 'Formato de Descarga',
      dotStyle: 'Estilo de Puntos',
      cornerSquare: 'Esquina Cuadrada',
      cornerDot: 'Punto de Esquina',
      quietZone: 'Zona Tranquila (Margen)',
      logoSize: 'Tamaño del Logo',
      logoMargin: 'Margen del Logo',
      logo: 'Logo (Opcional)',
      styleOptions: 'Opciones de Estilo'
    },
    placeholders: {
      url: 'ej., https://www.ejemplo.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      organization: 'ACME Inc.',
      title: 'Desarrollador',
      phoneWork: '+34-555-555-1234',
      phoneMobile: '+34-555-555-5678',
      email: 'juan.perez@ejemplo.com',
      website: 'https://www.ejemplo.com',
      street: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28001',
      country: 'España',
      ssid: 'ej., MiWiFiCasa',
      wifiPassword: 'Tu contraseña secreta',
      phoneNumber: 'ej., +34555123456',
      smsMessage: 'Tu mensaje prellenado aquí...'
    },
    actions: {
      generate: 'Crear Código QR',
      download: 'Descargar Código QR',
      reset: 'Restablecer a Predeterminados',
      customize: 'Personalizar Apariencia (Opcional)',
      chooseLogo: 'Elegir Imagen'
    },
    options: {
      sizeSmall: 'Pequeño (256px)',
      sizeMedium: 'Mediano (512px)',
      sizeLarge: 'Grande (1024px)',
      errorLow: 'L - Bajo (7%)',
      errorMedium: 'M - Medio (15%)',
      errorQuartile: 'Q - Cuartil (25%)',
      errorHigh: 'H - Alto (30%)',
      formatPng: 'PNG (ráster)',
      formatSvg: 'SVG (vector)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ninguno',
      dotSquare: 'Cuadrado',
      dotRounded: 'Redondeado',
      dotDots: 'Puntos',
      dotClassy: 'Elegante',
      dotClassyRounded: 'Elegante Redondeado',
      dotExtraRounded: 'Extra Redondeado',
      cornerSquare: 'Cuadrado',
      cornerExtraRounded: 'Extra Redondeado',
      cornerDot: 'Punto'
    },
    alerts: {
      enterText: 'Por favor ingresa un texto o una URL',
      vcardRequired:
        'Por favor completa al menos uno de: Nombre, Apellido, Correo Electrónico o Número de Teléfono.',
      wifiSsidRequired: 'Por favor ingresa el Nombre de Red (SSID).',
      phoneRequired: 'Por favor ingresa un número de teléfono.',
      lowContrast:
        '⚠️ Contraste bajo detectado. Tu código QR puede ser difícil de escanear. Considera usar un color principal más oscuro o un fondo más claro.',
      dataEmpty: 'Los datos del código QR están vacíos.',
      noData: 'No se proporcionaron datos para el código QR.',
      libraryLoadFailed:
        'La biblioteca de código QR no se pudo cargar. Por favor actualiza la página.',
      generationError: 'Error al generar el código QR',
      generateFirst: 'Por favor genera primero un código QR.',
      resetSuccess: 'Personalización restablecida a predeterminados',
      largeImageWarning:
        '⚠️ Archivo de imagen grande ({{size}}MB). Considera usar una imagen más pequeña para un mejor rendimiento.',
      invalidImageFile:
        'Por favor selecciona un archivo de imagen válido (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} caracteres'
    },
    labels: {
      sms: 'SMS',
      phone: 'Llamada Telefónica'
    },
    footer: {
      privacy1: 'Este generador de códigos QR gratuito se ejecuta completamente en tu navegador.',
      privacy2:
        'No se almacenan ni envían datos a ningún lugar. Sin seguimiento, sin anuncios, sin tonterías.',
      github: 'Ver código fuente en GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Espacio alrededor del código QR (recomendado: 4-16px para escaneo confiable)'
    },
    misc: {
      qrPlaceholder: 'El código QR aparecerá aquí'
    }
  };
})();
