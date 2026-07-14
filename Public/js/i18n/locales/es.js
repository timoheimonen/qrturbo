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
        'Generador de Códigos QR Gratis con Logos y Colores | QRTurbo.app',
      description:
        'Crea códigos QR personalizados gratis para URLs, WiFi, vCards, SMS y llamadas. Agrega logos, colores y estilos en tu navegador, sin rastreo ni cargas de datos.'
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
      wifi: 'WiFi',
      email: 'Correo',
      calendarEvent: 'Evento',
      location: 'Ubicación',
      socialMedia: 'Redes sociales',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Enlace de app'
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
      styleOptions: 'Opciones de Estilo',
      emailTo: 'Correo del destinatario',
      emailSubject: 'Asunto',
      emailBody: 'Mensaje',
      eventTitle: 'Título del evento',
      eventStart: 'Inicio',
      eventEnd: 'Fin',
      eventLocation: 'Ubicación',
      eventDescription: 'Descripción',
      locationAddress: 'Dirección o lugar',
      latitude: 'Latitud',
      longitude: 'Longitud',
      socialPlatform: 'Plataforma',
      socialProfileType: 'Tipo de perfil',
      socialHandleOrUrl: 'Usuario o URL del perfil',
      whatsappPhone: 'Número de WhatsApp o @usuario',
      whatsappMessage: 'Mensaje (opcional)',
      mecardName: 'Nombre',
      address: 'Dirección',
      appWebUrl: 'URL web/de respaldo',
      appIosUrl: 'URL de iOS App Store',
      appAndroidUrl: 'URL de Android Play Store',
      appLinkTarget: 'Respaldo de tienda'
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
      smsMessage: 'Tu mensaje prellenado aquí...',
      emailTo: 'hola@example.com',
      emailSubject: 'Hola desde QRTurbo.app',
      emailBody: 'Escribe tu mensaje de correo aquí...',
      eventTitle: 'Reunión de equipo',
      eventLocation: 'Sala de reuniones o dirección',
      eventDescription: 'Detalles del evento...',
      locationAddress: 'Puerta del Sol, Madrid',
      latitude: '40.4169',
      longitude: '-3.7035',
      socialHandle: '@usuario o https://...',
      whatsappPhone: 'ej., +34555123456 o @usuario',
      whatsappMessage: 'Tu mensaje de WhatsApp aquí...',
      mecardName: 'Juan Pérez',
      address: 'Calle Principal 123, Madrid',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Crear Código QR',
      download: 'Descargar Código QR',
      reset: 'Restablecer a Predeterminados',
      customize: 'Personalizar Apariencia (Opcional)',
      chooseLogo: 'Elegir Imagen',
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña'
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
      formatPdf: 'PDF (documento)',
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
      cornerDot: 'Punto',
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
      socialOther: 'Otra URL',
      socialTypePerson: 'Persona/Perfil',
      socialTypeCompany: 'Empresa',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Usar iOS si no hay URL web',
      appTargetAndroid: 'Usar Android si no hay URL web'
    },
    alerts: {
      enterText: 'Por favor ingresa un texto o una URL',
      vcardRequired:
        'Por favor completa al menos uno de: Nombre, Apellido, Correo Electrónico o Número de Teléfono.',
      wifiSsidRequired: 'Por favor ingresa el Nombre de Red (SSID).',
      wifiWpaPasswordInvalid:
        'Las contraseñas WPA/WPA2 deben tener 8-63 caracteres imprimibles o exactamente 64 caracteres hexadecimales.',
      wifiWepPasswordInvalid:
        'Las contraseñas WEP deben tener 5 o 13 caracteres imprimibles, o 10 o 26 caracteres hexadecimales.',
      phoneRequired: 'Por favor ingresa un número de teléfono.',
      emailRequired: 'Por favor ingresa al menos un campo de correo.',
      emailInvalid: 'Por favor ingresa una dirección de correo válida.',
      eventRequired: 'Por favor ingresa un título de evento y hora de inicio.',
      eventEndInvalid: 'La hora de fin no puede ser anterior a la de inicio.',
      locationRequired: 'Por favor ingresa una dirección o ambas coordenadas.',
      locationCoordinatesInvalid: 'Por favor ingresa coordenadas válidas de latitud y longitud.',
      socialRequired: 'Por favor ingresa un usuario de red social o una URL de perfil.',
      socialHandleInvalid: 'Por favor ingresa un usuario válido con letras, números, puntos, guiones bajos o guiones.',
      socialUrlInvalid: 'Por favor ingresa una URL válida de perfil social que empiece con http:// o https://.',
      whatsappPhoneRequired: 'Por favor ingresa un número de WhatsApp con código de país o un @usuario válido.',
      mecardRequired: 'Por favor ingresa al menos uno de: Nombre, Número de teléfono o Correo.',
      appLinkRequired: 'Por favor ingresa una URL de app web, iOS o Android.',
      urlInvalid: 'Por favor ingresa una URL válida que empiece con http:// o https://.',
      lowContrast:
        '⚠️ Contraste bajo detectado. Tu código QR puede ser difícil de escanear. Considera usar un color principal más oscuro o un fondo más claro.',
      dataEmpty: 'Los datos del código QR están vacíos.',
      noData: 'No se proporcionaron datos para el código QR.',
      libraryLoadFailed:
        'La biblioteca de código QR no se pudo cargar. Por favor actualiza la página.',
      generationError: 'Error al generar el código QR',
      pdfExportFailed: 'No se pudo exportar el PDF. Inténtalo de nuevo.',
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
      privacyPolicy: 'Política de Privacidad',
      termsOfUse: 'Términos de Uso',
      github: 'Ver código fuente en GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Espacio alrededor del código QR (mínimo 4 módulos para un escaneo fiable)',
      socialHandleHelper:
        'Ingresa un usuario como @usuario o pega una URL completa de perfil https://.'
    },
    misc: {
      qrPlaceholder: 'El código QR aparecerá aquí',
      socialPreview: 'Destino del QR'
    }
  };
})();
