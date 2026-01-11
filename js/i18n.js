// QRTurbo.app - Internationalization (i18n) System
// 100% client-side, cookie-free localization using localStorage

// Current language (default: English)
let currentLang = 'en';

// Translation database
const translations = {
  en: {
    meta: {
      title: 'Free QR Code Generator - Customize Colors, Logos & Styles | QRTurbo.app',
      description:
        'Generate free customizable QR codes instantly with QRTurbo.app. Add logos, custom colors, and styles. Create QR codes for URLs, WiFi networks, vCards, SMS, and phone calls. No ads, no tracking – fully browser-based and secure.',
      keywords:
        'QR code generator, custom QR code, QR code with logo, colored QR code, free QR code maker, WiFi QR code, vCard QR code, SMS QR code, online QR tool, no tracking QR generator'
    },
    app: {
      title: 'QRTurbo.app - Free QR Code Generator',
      subtitle:
        'Create customizable QR codes with logos, colors, and styles. Support for URLs, WiFi, vCards, SMS, and phone calls',
      selectLanguage: 'Select Language'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Phone',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Text or URL',
      firstName: 'First Name',
      lastName: 'Last Name',
      organization: 'Organization',
      title: 'Title',
      phoneWork: 'Phone (Work)',
      phoneMobile: 'Phone (Mobile)',
      email: 'Email',
      website: 'Website',
      street: 'Street',
      city: 'City',
      state: 'State/Province',
      zip: 'ZIP/Postal Code',
      country: 'Country',
      ssid: 'Network Name (SSID)',
      password: 'Password',
      authentication: 'Authentication',
      hiddenNetwork: 'This is a hidden network',
      phoneNumber: 'Phone Number',
      message: 'Message (optional)',
      qrSize: 'QR Code Size',
      foregroundColor: 'Foreground Color',
      backgroundColor: 'Background Color',
      errorCorrection: 'Error Correction',
      downloadFormat: 'Download Format',
      dotStyle: 'Dot Style',
      cornerSquare: 'Corner Square',
      cornerDot: 'Corner Dot',
      quietZone: 'Quiet Zone (Margin)',
      logoSize: 'Logo Size',
      logoMargin: 'Logo Margin',
      logo: 'Logo (Optional)'
    },
    placeholders: {
      url: 'e.g., https://www.example.com',
      firstName: 'John',
      lastName: 'Appleseed',
      organization: 'ACME Inc.',
      title: 'Developer',
      phoneWork: '+1-555-555-1234',
      phoneMobile: '+1-555-555-5678',
      email: 'john.appleseed@example.com',
      website: 'https://www.example.com',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '90210',
      country: 'USA',
      ssid: 'e.g., MyHomeWiFi',
      wifiPassword: 'Your secret password',
      phoneNumber: 'e.g., +15551234567',
      smsMessage: 'Your pre-filled message here...'
    },
    actions: {
      generate: 'Create QR Code',
      download: 'Download QR Code',
      reset: 'Reset to Defaults',
      customize: 'Customize Appearance (Optional)',
      chooseLogo: 'Choose Image'
    },
    options: {
      sizeSmall: 'Small (256px)',
      sizeMedium: 'Medium (512px)',
      sizeLarge: 'Large (1024px)',
      errorLow: 'L - Low (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - High (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vector)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'None',
      dotSquare: 'Square',
      dotRounded: 'Rounded',
      dotDots: 'Dots',
      dotClassy: 'Classy',
      dotClassyRounded: 'Classy Rounded',
      dotExtraRounded: 'Extra Rounded',
      cornerSquare: 'Square',
      cornerExtraRounded: 'Extra Rounded',
      cornerDot: 'Dot'
    },
    alerts: {
      enterText: 'Please enter some text or a URL',
      vcardRequired:
        'Please fill at least one of: First Name, Last Name, Email or Phone number.',
      wifiSsidRequired: 'Please enter the Network Name (SSID).',
      phoneRequired: 'Please enter a phone number.',
      lowContrast:
        '⚠️ Low contrast detected. Your QR code may be difficult to scan. Consider using darker foreground or lighter background.',
      dataEmpty: 'QR code data is empty.',
      noData: 'No data provided for QR code.',
      libraryLoadFailed: 'QR Code library failed to load. Please refresh the page.',
      generationError: 'Error generating QR code',
      generateFirst: 'Please generate a QR code first.',
      resetSuccess: 'Customization reset to defaults',
      largeImageWarning:
        '⚠️ Large image file ({{size}}MB). Consider using a smaller image for better performance.',
      invalidImageFile: 'Please select a valid image file (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} characters'
    },
    labels: {
      sms: 'SMS',
      phone: 'Phone Call'
    },
    footer: {
      privacy1: 'This free QR code generator runs entirely in your browser.',
      privacy2: 'No data is stored or sent anywhere. No tracking, no ads, no nonsense.',
      github: 'View source on GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Space around the QR code (recommended: 4-16px for reliable scanning)'
    },
    misc: {
      qrPlaceholder: 'QR Code will appear here'
    }
  },
  es: {
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
      logo: 'Logo (Opcional)'
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
  },
  fr: {
    meta: {
      title:
        'Générateur de Code QR Gratuit - Personnalisez Couleurs, Logos et Styles | QRTurbo.app',
      description:
        'Générez des codes QR personnalisables gratuitement et instantanément avec QRTurbo.app. Ajoutez des logos, des couleurs personnalisées et des styles. Créez des codes QR pour URLs, réseaux WiFi, vCards, SMS et appels téléphoniques. Sans publicités, sans suivi – entièrement dans le navigateur et sécurisé.',
      keywords:
        'générateur de code QR, code QR personnalisé, code QR avec logo, code QR coloré, créateur de code QR gratuit, code QR WiFi, code QR vCard, code QR SMS, outil QR en ligne, générateur QR sans suivi'
    },
    app: {
      title: 'QRTurbo.app - Générateur de Code QR Gratuit',
      subtitle:
        'Créez des codes QR personnalisables avec logos, couleurs et styles. Support pour URLs, WiFi, vCards, SMS et appels',
      selectLanguage: 'Sélectionner la Langue'
    },
    tabs: {
      urlText: 'URL/Texte',
      vcard: 'vCard',
      smsPhone: 'SMS/Téléphone',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Texte ou URL',
      firstName: 'Prénom',
      lastName: 'Nom',
      organization: 'Organisation',
      title: 'Titre',
      phoneWork: 'Téléphone (Travail)',
      phoneMobile: 'Téléphone (Mobile)',
      email: 'E-mail',
      website: 'Site Web',
      street: 'Rue',
      city: 'Ville',
      state: 'État/Province',
      zip: 'Code Postal',
      country: 'Pays',
      ssid: 'Nom du Réseau (SSID)',
      password: 'Mot de Passe',
      authentication: 'Authentification',
      hiddenNetwork: 'Ceci est un réseau caché',
      phoneNumber: 'Numéro de Téléphone',
      message: 'Message (optionnel)',
      qrSize: 'Taille du Code QR',
      foregroundColor: 'Couleur de Premier Plan',
      backgroundColor: 'Couleur de Fond',
      errorCorrection: 'Correction d\'Erreurs',
      downloadFormat: 'Format de Téléchargement',
      dotStyle: 'Style de Points',
      cornerSquare: 'Coin Carré',
      cornerDot: 'Point de Coin',
      quietZone: 'Zone Calme (Marge)',
      logoSize: 'Taille du Logo',
      logoMargin: 'Marge du Logo',
      logo: 'Logo (Optionnel)'
    },
    placeholders: {
      url: 'ex., https://www.exemple.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      organization: 'ACME Inc.',
      title: 'Développeur',
      phoneWork: '+33-1-55-55-12-34',
      phoneMobile: '+33-6-55-55-56-78',
      email: 'jean.dupont@exemple.com',
      website: 'https://www.exemple.com',
      street: '123 Rue Principale',
      city: 'Paris',
      state: 'Île-de-France',
      zip: '75001',
      country: 'France',
      ssid: 'ex., MonWiFiMaison',
      wifiPassword: 'Votre mot de passe secret',
      phoneNumber: 'ex., +33655123456',
      smsMessage: 'Votre message pré-rempli ici...'
    },
    actions: {
      generate: 'Créer le Code QR',
      download: 'Télécharger le Code QR',
      reset: 'Réinitialiser aux Valeurs par Défaut',
      customize: 'Personnaliser l\'Apparence (Optionnel)',
      chooseLogo: 'Choisir une Image'
    },
    options: {
      sizeSmall: 'Petit (256px)',
      sizeMedium: 'Moyen (512px)',
      sizeLarge: 'Grand (1024px)',
      errorLow: 'L - Faible (7%)',
      errorMedium: 'M - Moyen (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - Élevé (30%)',
      formatPng: 'PNG (matriciel)',
      formatSvg: 'SVG (vectoriel)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Aucun',
      dotSquare: 'Carré',
      dotRounded: 'Arrondi',
      dotDots: 'Points',
      dotClassy: 'Élégant',
      dotClassyRounded: 'Élégant Arrondi',
      dotExtraRounded: 'Extra Arrondi',
      cornerSquare: 'Carré',
      cornerExtraRounded: 'Extra Arrondi',
      cornerDot: 'Point'
    },
    alerts: {
      enterText: 'Veuillez saisir un texte ou une URL',
      vcardRequired:
        'Veuillez remplir au moins un de: Prénom, Nom, E-mail ou Numéro de Téléphone.',
      wifiSsidRequired: 'Veuillez saisir le Nom du Réseau (SSID).',
      phoneRequired: 'Veuillez saisir un numéro de téléphone.',
      lowContrast:
        '⚠️ Contraste faible détecté. Votre code QR peut être difficile à scanner. Envisagez d\'utiliser un premier plan plus foncé ou un fond plus clair.',
      dataEmpty: 'Les données du code QR sont vides.',
      noData: 'Aucune donnée fournie pour le code QR.',
      libraryLoadFailed:
        'La bibliothèque de code QR n\'a pas pu être chargée. Veuillez actualiser la page.',
      generationError: 'Erreur lors de la génération du code QR',
      generateFirst: 'Veuillez d\'abord générer un code QR.',
      resetSuccess: 'Personnalisation réinitialisée aux valeurs par défaut',
      largeImageWarning:
        '⚠️ Fichier image volumineux ({{size}}MB). Envisagez d\'utiliser une image plus petite pour de meilleures performances.',
      invalidImageFile:
        'Veuillez sélectionner un fichier image valide (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} caractères'
    },
    labels: {
      sms: 'SMS',
      phone: 'Appel Téléphonique'
    },
    footer: {
      privacy1: 'Ce générateur de code QR gratuit fonctionne entièrement dans votre navigateur.',
      privacy2:
        'Aucune donnée n\'est stockée ou envoyée nulle part. Pas de suivi, pas de publicités, pas de bêtises.',
      github: 'Voir le code source sur GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Espace autour du code QR (recommandé: 4-16px pour un scan fiable)'
    },
    misc: {
      qrPlaceholder: 'Le code QR apparaîtra ici'
    }
  },
  de: {
    meta: {
      title:
        'Kostenloser QR-Code-Generator - Farben, Logos & Stile Anpassen | QRTurbo.app',
      description:
        'Erstellen Sie sofort kostenlose anpassbare QR-Codes mit QRTurbo.app. Fügen Sie Logos, individuelle Farben und Stile hinzu. Erstellen Sie QR-Codes für URLs, WiFi-Netzwerke, vCards, SMS und Anrufe. Keine Werbung, kein Tracking – vollständig browserbasiert und sicher.',
      keywords:
        'QR-Code-Generator, individueller QR-Code, QR-Code mit Logo, farbiger QR-Code, kostenloser QR-Code-Ersteller, WiFi-QR-Code, vCard-QR-Code, SMS-QR-Code, Online-QR-Tool, Tracking-freier QR-Generator'
    },
    app: {
      title: 'QRTurbo.app - Kostenloser QR-Code-Generator',
      subtitle:
        'Erstellen Sie anpassbare QR-Codes mit Logos, Farben und Stilen. Unterstützung für URLs, WiFi, vCards, SMS und Anrufe',
      selectLanguage: 'Sprache Auswählen'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Text oder URL',
      firstName: 'Vorname',
      lastName: 'Nachname',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbeit)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-Mail',
      website: 'Webseite',
      street: 'Straße',
      city: 'Stadt',
      state: 'Bundesland',
      zip: 'Postleitzahl',
      country: 'Land',
      ssid: 'Netzwerkname (SSID)',
      password: 'Passwort',
      authentication: 'Authentifizierung',
      hiddenNetwork: 'Dies ist ein verstecktes Netzwerk',
      phoneNumber: 'Telefonnummer',
      message: 'Nachricht (optional)',
      qrSize: 'QR-Code-Größe',
      foregroundColor: 'Vordergrundfarbe',
      backgroundColor: 'Hintergrundfarbe',
      errorCorrection: 'Fehlerkorrektur',
      downloadFormat: 'Download-Format',
      dotStyle: 'Punktstil',
      cornerSquare: 'Eckquadrat',
      cornerDot: 'Eckpunkt',
      quietZone: 'Ruhezone (Rand)',
      logoSize: 'Logo-Größe',
      logoMargin: 'Logo-Rand',
      logo: 'Logo (Optional)'
    },
    placeholders: {
      url: 'z.B., https://www.beispiel.com',
      firstName: 'Hans',
      lastName: 'Schmidt',
      organization: 'ACME GmbH',
      title: 'Entwickler',
      phoneWork: '+49-555-555-1234',
      phoneMobile: '+49-555-555-5678',
      email: 'hans.schmidt@beispiel.com',
      website: 'https://www.beispiel.com',
      street: 'Hauptstraße 123',
      city: 'Berlin',
      state: 'Berlin',
      zip: '10115',
      country: 'Deutschland',
      ssid: 'z.B., MeinHeimWiFi',
      wifiPassword: 'Ihr geheimes Passwort',
      phoneNumber: 'z.B., +49555123456',
      smsMessage: 'Ihre vorausgefüllte Nachricht hier...'
    },
    actions: {
      generate: 'QR-Code Erstellen',
      download: 'QR-Code Herunterladen',
      reset: 'Auf Standard Zurücksetzen',
      customize: 'Aussehen Anpassen (Optional)',
      chooseLogo: 'Bild Auswählen'
    },
    options: {
      sizeSmall: 'Klein (256px)',
      sizeMedium: 'Mittel (512px)',
      sizeLarge: 'Groß (1024px)',
      errorLow: 'L - Niedrig (7%)',
      errorMedium: 'M - Mittel (15%)',
      errorQuartile: 'Q - Quartil (25%)',
      errorHigh: 'H - Hoch (30%)',
      formatPng: 'PNG (Raster)',
      formatSvg: 'SVG (Vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Keine',
      dotSquare: 'Quadratisch',
      dotRounded: 'Abgerundet',
      dotDots: 'Punkte',
      dotClassy: 'Elegant',
      dotClassyRounded: 'Elegant Abgerundet',
      dotExtraRounded: 'Extra Abgerundet',
      cornerSquare: 'Quadratisch',
      cornerExtraRounded: 'Extra Abgerundet',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Bitte geben Sie einen Text oder eine URL ein',
      vcardRequired:
        'Bitte füllen Sie mindestens eines aus: Vorname, Nachname, E-Mail oder Telefonnummer.',
      wifiSsidRequired: 'Bitte geben Sie den Netzwerknamen (SSID) ein.',
      phoneRequired: 'Bitte geben Sie eine Telefonnummer ein.',
      lowContrast:
        '⚠️ Niedriger Kontrast erkannt. Ihr QR-Code könnte schwer zu scannen sein. Erwägen Sie einen dunkleren Vordergrund oder helleren Hintergrund.',
      dataEmpty: 'QR-Code-Daten sind leer.',
      noData: 'Keine Daten für QR-Code angegeben.',
      libraryLoadFailed:
        'QR-Code-Bibliothek konnte nicht geladen werden. Bitte aktualisieren Sie die Seite.',
      generationError: 'Fehler beim Erstellen des QR-Codes',
      generateFirst: 'Bitte erstellen Sie zuerst einen QR-Code.',
      resetSuccess: 'Anpassung auf Standard zurückgesetzt',
      largeImageWarning:
        '⚠️ Große Bilddatei ({{size}}MB). Erwägen Sie ein kleineres Bild für bessere Leistung.',
      invalidImageFile:
        'Bitte wählen Sie eine gültige Bilddatei (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} Zeichen'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonanruf'
    },
    footer: {
      privacy1: 'Dieser kostenlose QR-Code-Generator läuft vollständig in Ihrem Browser.',
      privacy2:
        'Keine Daten werden gespeichert oder irgendwohin gesendet. Kein Tracking, keine Werbung, kein Unsinn.',
      github: 'Quellcode auf GitHub ansehen'
    },
    helpers: {
      quietZoneHelper:
        'Platz um den QR-Code (empfohlen: 4-16px für zuverlässiges Scannen)'
    },
    misc: {
      qrPlaceholder: 'QR-Code wird hier erscheinen'
    }
  },
  it: {
    meta: {
      title:
        'Generatore di Codici QR Gratuito - Personalizza Colori, Loghi e Stili | QRTurbo.app',
      description:
        'Genera codici QR personalizzabili gratuitamente e istantaneamente con QRTurbo.app. Aggiungi loghi, colori personalizzati e stili. Crea codici QR per URL, reti WiFi, vCard, SMS e chiamate telefoniche. Nessuna pubblicità, nessun tracciamento – completamente basato su browser e sicuro.',
      keywords:
        'generatore di codice QR, codice QR personalizzato, codice QR con logo, codice QR colorato, creatore di codice QR gratuito, codice QR WiFi, codice QR vCard, codice QR SMS, strumento QR online, generatore QR senza tracciamento'
    },
    app: {
      title: 'QRTurbo.app - Generatore di Codici QR Gratuito',
      subtitle:
        'Crea codici QR personalizzabili con loghi, colori e stili. Supporto per URL, WiFi, vCard, SMS e chiamate',
      selectLanguage: 'Seleziona Lingua'
    },
    tabs: {
      urlText: 'URL/Testo',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefono',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Testo o URL',
      firstName: 'Nome',
      lastName: 'Cognome',
      organization: 'Organizzazione',
      title: 'Titolo',
      phoneWork: 'Telefono (Lavoro)',
      phoneMobile: 'Telefono (Cellulare)',
      email: 'Email',
      website: 'Sito Web',
      street: 'Via',
      city: 'Città',
      state: 'Stato/Provincia',
      zip: 'CAP',
      country: 'Paese',
      ssid: 'Nome Rete (SSID)',
      password: 'Password',
      authentication: 'Autenticazione',
      hiddenNetwork: 'Questa è una rete nascosta',
      phoneNumber: 'Numero di Telefono',
      message: 'Messaggio (opzionale)',
      qrSize: 'Dimensione Codice QR',
      foregroundColor: 'Colore Primo Piano',
      backgroundColor: 'Colore Sfondo',
      errorCorrection: 'Correzione Errori',
      downloadFormat: 'Formato Download',
      dotStyle: 'Stile Punti',
      cornerSquare: 'Angolo Quadrato',
      cornerDot: 'Punto Angolo',
      quietZone: 'Zona Quieta (Margine)',
      logoSize: 'Dimensione Logo',
      logoMargin: 'Margine Logo',
      logo: 'Logo (Opzionale)'
    },
    placeholders: {
      url: 'es., https://www.esempio.com',
      firstName: 'Mario',
      lastName: 'Rossi',
      organization: 'ACME S.r.l.',
      title: 'Sviluppatore',
      phoneWork: '+39-555-555-1234',
      phoneMobile: '+39-555-555-5678',
      email: 'mario.rossi@esempio.com',
      website: 'https://www.esempio.com',
      street: 'Via Principale 123',
      city: 'Roma',
      state: 'Lazio',
      zip: '00100',
      country: 'Italia',
      ssid: 'es., MioWiFiCasa',
      wifiPassword: 'La tua password segreta',
      phoneNumber: 'es., +39555123456',
      smsMessage: 'Il tuo messaggio precompilato qui...'
    },
    actions: {
      generate: 'Crea Codice QR',
      download: 'Scarica Codice QR',
      reset: 'Ripristina Predefiniti',
      customize: 'Personalizza Aspetto (Opzionale)',
      chooseLogo: 'Scegli Immagine'
    },
    options: {
      sizeSmall: 'Piccolo (256px)',
      sizeMedium: 'Medio (512px)',
      sizeLarge: 'Grande (1024px)',
      errorLow: 'L - Basso (7%)',
      errorMedium: 'M - Medio (15%)',
      errorQuartile: 'Q - Quartile (25%)',
      errorHigh: 'H - Alto (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vettoriale)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Nessuno',
      dotSquare: 'Quadrato',
      dotRounded: 'Arrotondato',
      dotDots: 'Punti',
      dotClassy: 'Elegante',
      dotClassyRounded: 'Elegante Arrotondato',
      dotExtraRounded: 'Extra Arrotondato',
      cornerSquare: 'Quadrato',
      cornerExtraRounded: 'Extra Arrotondato',
      cornerDot: 'Punto'
    },
    alerts: {
      enterText: 'Inserisci un testo o un URL',
      vcardRequired:
        'Compila almeno uno di: Nome, Cognome, Email o Numero di Telefono.',
      wifiSsidRequired: 'Inserisci il Nome Rete (SSID).',
      phoneRequired: 'Inserisci un numero di telefono.',
      lowContrast:
        '⚠️ Contrasto basso rilevato. Il tuo codice QR potrebbe essere difficile da scansionare. Considera di usare un primo piano più scuro o uno sfondo più chiaro.',
      dataEmpty: 'I dati del codice QR sono vuoti.',
      noData: 'Nessun dato fornito per il codice QR.',
      libraryLoadFailed:
        'La libreria del codice QR non è riuscita a caricarsi. Ricarica la pagina.',
      generationError: 'Errore nella generazione del codice QR',
      generateFirst: 'Genera prima un codice QR.',
      resetSuccess: 'Personalizzazione ripristinata ai predefiniti',
      largeImageWarning:
        '⚠️ File immagine grande ({{size}}MB). Considera di usare un\'immagine più piccola per prestazioni migliori.',
      invalidImageFile: 'Seleziona un file immagine valido (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} caratteri'
    },
    labels: {
      sms: 'SMS',
      phone: 'Chiamata Telefonica'
    },
    footer: {
      privacy1: 'Questo generatore di codici QR gratuito funziona interamente nel tuo browser.',
      privacy2:
        'Nessun dato viene memorizzato o inviato da nessuna parte. Nessun tracciamento, nessuna pubblicità, nessuna sciocchezza.',
      github: 'Visualizza sorgente su GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Spazio attorno al codice QR (consigliato: 4-16px per scansione affidabile)'
    },
    misc: {
      qrPlaceholder: 'Il codice QR apparirà qui'
    }
  },
  fi: {
    meta: {
      title:
        'Ilmainen QR-Koodigeneraattori - Mukauta Värejä, Logoja ja Tyylejä | QRTurbo.app',
      description:
        'Luo ilmaisia mukautettavia QR-koodeja välittömästi QRTurbo.app:lla. Lisää logoja, mukautettuja värejä ja tyylejä. Luo QR-koodeja URL-osoitteille, WiFi-verkoille, vCardeille, tekstiviesteille ja puheluille. Ei mainoksia, ei seurantaa – täysin selainpohjainen ja turvallinen.',
      keywords:
        'QR-koodigeneraattori, mukautettu QR-koodi, QR-koodi logolla, värillinen QR-koodi, ilmainen QR-koodin luoja, WiFi QR-koodi, vCard QR-koodi, SMS QR-koodi, online QR-työkalu, seuraamaton QR-generaattori'
    },
    app: {
      title: 'QRTurbo.app - Ilmainen QR-Koodigeneraattori',
      subtitle:
        'Luo mukautettavia QR-koodeja logoilla, väreillä ja tyyleillä. Tuki URL-osoitteille, WiFi:lle, vCardeille, tekstiviesteille ja puheluille',
      selectLanguage: 'Valitse Kieli'
    },
    tabs: {
      urlText: 'URL/Teksti',
      vcard: 'vCard',
      smsPhone: 'SMS/Puhelu',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Teksti tai URL',
      firstName: 'Etunimi',
      lastName: 'Sukunimi',
      organization: 'Organisaatio',
      title: 'Titteli',
      phoneWork: 'Puhelin (Työ)',
      phoneMobile: 'Puhelin (Matkapuhelin)',
      email: 'Sähköposti',
      website: 'Verkkosivusto',
      street: 'Katu',
      city: 'Kaupunki',
      state: 'Osavaltio/Maakunta',
      zip: 'Postinumero',
      country: 'Maa',
      ssid: 'Verkon Nimi (SSID)',
      password: 'Salasana',
      authentication: 'Todennus',
      hiddenNetwork: 'Tämä on piilotettu verkko',
      phoneNumber: 'Puhelinnumero',
      message: 'Viesti (valinnainen)',
      qrSize: 'QR-Koodin Koko',
      foregroundColor: 'Edustaväri',
      backgroundColor: 'Taustaväri',
      errorCorrection: 'Virheen Korjaus',
      downloadFormat: 'Latausmuoto',
      dotStyle: 'Pisteen Tyyli',
      cornerSquare: 'Kulman Neliö',
      cornerDot: 'Kulman Piste',
      quietZone: 'Hiljainen Vyöhyke (Marginaali)',
      logoSize: 'Logon Koko',
      logoMargin: 'Logon Marginaali',
      logo: 'Logo (Valinnainen)'
    },
    placeholders: {
      url: 'esim., https://www.esimerkki.com',
      firstName: 'Matti',
      lastName: 'Meikäläinen',
      organization: 'ACME Oy',
      title: 'Kehittäjä',
      phoneWork: '+358-555-555-1234',
      phoneMobile: '+358-555-555-5678',
      email: 'matti.meikalainen@esimerkki.com',
      website: 'https://www.esimerkki.com',
      street: 'Pääkatu 123',
      city: 'Helsinki',
      state: 'Uusimaa',
      zip: '00100',
      country: 'Suomi',
      ssid: 'esim., MinunKotiWiFi',
      wifiPassword: 'Sinun salainen salasanasi',
      phoneNumber: 'esim., +358555123456',
      smsMessage: 'Esitäytetty viestisi tähän...'
    },
    actions: {
      generate: 'Luo QR-Koodi',
      download: 'Lataa QR-Koodi',
      reset: 'Palauta Oletusasetukset',
      customize: 'Mukauta Ulkoasu (Valinnainen)',
      chooseLogo: 'Valitse Kuva'
    },
    options: {
      sizeSmall: 'Pieni (256px)',
      sizeMedium: 'Keskikokoinen (512px)',
      sizeLarge: 'Suuri (1024px)',
      errorLow: 'L - Matala (7%)',
      errorMedium: 'M - Keskitaso (15%)',
      errorQuartile: 'Q - Kvartiili (25%)',
      errorHigh: 'H - Korkea (30%)',
      formatPng: 'PNG (rasteri)',
      formatSvg: 'SVG (vektori)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ei mitään',
      dotSquare: 'Neliö',
      dotRounded: 'Pyöristetty',
      dotDots: 'Pisteet',
      dotClassy: 'Tyylikäs',
      dotClassyRounded: 'Tyylikäs Pyöristetty',
      dotExtraRounded: 'Erittäin Pyöristetty',
      cornerSquare: 'Neliö',
      cornerExtraRounded: 'Erittäin Pyöristetty',
      cornerDot: 'Piste'
    },
    alerts: {
      enterText: 'Anna teksti tai URL',
      vcardRequired: 'Täytä vähintään yksi: Etunimi, Sukunimi, Sähköposti tai Puhelinnumero.',
      wifiSsidRequired: 'Anna Verkon Nimi (SSID).',
      phoneRequired: 'Anna puhelinnumero.',
      lowContrast:
        '⚠️ Matala kontrasti havaittu. QR-koodisi saattaa olla vaikea skannata. Harkitse tummempaa etualaa tai vaaleampaa taustaa.',
      dataEmpty: 'QR-koodin tiedot ovat tyhjiä.',
      noData: 'Ei tietoja QR-koodille.',
      libraryLoadFailed: 'QR-koodikirjastoa ei voitu ladata. Päivitä sivu.',
      generationError: 'Virhe QR-koodin luomisessa',
      generateFirst: 'Luo ensin QR-koodi.',
      resetSuccess: 'Mukautus palautettu oletusasetuksiin',
      largeImageWarning:
        '⚠️ Suuri kuvatiedosto ({{size}}MB). Harkitse pienemmän kuvan käyttöä parempaa suorituskykyä varten.',
      invalidImageFile: 'Valitse kelvollinen kuvatiedosto (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} merkkiä'
    },
    labels: {
      sms: 'SMS',
      phone: 'Puhelu'
    },
    footer: {
      privacy1: 'Tämä ilmainen QR-koodigeneraattori toimii kokonaan selaimessasi.',
      privacy2:
        'Tietoja ei tallenneta tai lähetetä mihinkään. Ei seurantaa, ei mainoksia, ei hölynpölyä.',
      github: 'Näytä lähdekoodi GitHubissa'
    },
    helpers: {
      quietZoneHelper:
        'Tila QR-koodin ympärillä (suositus: 4-16px luotettavaa skannausta varten)'
    },
    misc: {
      qrPlaceholder: 'QR-koodi näkyy tässä'
    }
  },
  sv: {
    meta: {
      title:
        'Gratis QR-Kodgenerator - Anpassa Färger, Logotyper & Stilar | QRTurbo.app',
      description:
        'Generera gratis anpassningsbara QR-koder direkt med QRTurbo.app. Lägg till logotyper, anpassade färger och stilar. Skapa QR-koder för URL:er, WiFi-nätverk, vCard, SMS och telefonsamtal. Inga annonser, ingen spårning – helt webbläsarbaserad och säker.',
      keywords:
        'QR-kodgenerator, anpassad QR-kod, QR-kod med logotyp, färgad QR-kod, gratis QR-kodskapare, WiFi QR-kod, vCard QR-kod, SMS QR-kod, online QR-verktyg, spårningsfri QR-generator'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodgenerator',
      subtitle:
        'Skapa anpassningsbara QR-koder med logotyper, färger och stilar. Stöd för URL:er, WiFi, vCard, SMS och samtal',
      selectLanguage: 'Välj Språk'
    },
    tabs: {
      urlText: 'URL/Text',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Text eller URL',
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbete)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-post',
      website: 'Webbplats',
      street: 'Gata',
      city: 'Stad',
      state: 'Stat/Provins',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Nätverksnamn (SSID)',
      password: 'Lösenord',
      authentication: 'Autentisering',
      hiddenNetwork: 'Detta är ett dolt nätverk',
      phoneNumber: 'Telefonnummer',
      message: 'Meddelande (valfritt)',
      qrSize: 'QR-Kodstorlek',
      foregroundColor: 'Förgrundsfärg',
      backgroundColor: 'Bakgrundsfärg',
      errorCorrection: 'Felkorrigering',
      downloadFormat: 'Nedladdningsformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hörnfyrkant',
      cornerDot: 'Hörnpunkt',
      quietZone: 'Tyst Zon (Marginal)',
      logoSize: 'Logotypstorlek',
      logoMargin: 'Logotypmarginal',
      logo: 'Logotyp (Valfritt)'
    },
    placeholders: {
      url: 't.ex., https://www.exempel.com',
      firstName: 'Anders',
      lastName: 'Andersson',
      organization: 'ACME AB',
      title: 'Utvecklare',
      phoneWork: '+46-555-555-1234',
      phoneMobile: '+46-555-555-5678',
      email: 'anders.andersson@exempel.com',
      website: 'https://www.exempel.com',
      street: 'Huvudgatan 123',
      city: 'Stockholm',
      state: 'Stockholm',
      zip: '11122',
      country: 'Sverige',
      ssid: 't.ex., MittHemWiFi',
      wifiPassword: 'Ditt hemliga lösenord',
      phoneNumber: 't.ex., +46555123456',
      smsMessage: 'Ditt förifyllda meddelande här...'
    },
    actions: {
      generate: 'Skapa QR-Kod',
      download: 'Ladda Ner QR-Kod',
      reset: 'Återställ till Standard',
      customize: 'Anpassa Utseende (Valfritt)',
      chooseLogo: 'Välj Bild'
    },
    options: {
      sizeSmall: 'Liten (256px)',
      sizeMedium: 'Medium (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Låg (7%)',
      errorMedium: 'M - Medium (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Hög (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Fyrkant',
      dotRounded: 'Rundad',
      dotDots: 'Punkter',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Rundad',
      dotExtraRounded: 'Extra Rundad',
      cornerSquare: 'Fyrkant',
      cornerExtraRounded: 'Extra Rundad',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Ange en text eller en URL',
      vcardRequired:
        'Fyll i minst en av: Förnamn, Efternamn, E-post eller Telefonnummer.',
      wifiSsidRequired: 'Ange Nätverksnamn (SSID).',
      phoneRequired: 'Ange ett telefonnummer.',
      lowContrast:
        '⚠️ Låg kontrast upptäckt. Din QR-kod kan vara svår att skanna. Överväg att använda mörkare förgrund eller ljusare bakgrund.',
      dataEmpty: 'QR-koddata är tomma.',
      noData: 'Ingen data tillhandahållen för QR-kod.',
      libraryLoadFailed: 'QR-kodbiblioteket kunde inte laddas. Uppdatera sidan.',
      generationError: 'Fel vid generering av QR-kod',
      generateFirst: 'Generera en QR-kod först.',
      resetSuccess: 'Anpassning återställd till standard',
      largeImageWarning:
        '⚠️ Stor bildfil ({{size}}MB). Överväg att använda en mindre bild för bättre prestanda.',
      invalidImageFile: 'Välj en giltig bildfil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tecken'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonsamtal'
    },
    footer: {
      privacy1: 'Denna gratis QR-kodgenerator körs helt i din webbläsare.',
      privacy2:
        'Ingen data lagras eller skickas någonstans. Ingen spårning, inga annonser, inget nonsens.',
      github: 'Visa källkod på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Utrymme runt QR-koden (rekommenderat: 4-16px för pålitlig skanning)'
    },
    misc: {
      qrPlaceholder: 'QR-koden kommer att visas här'
    }
  },
  no: {
    meta: {
      title:
        'Gratis QR-Kodegenerator - Tilpass Farger, Logoer & Stiler | QRTurbo.app',
      description:
        'Generer gratis tilpassbare QR-koder øyeblikkelig med QRTurbo.app. Legg til logoer, tilpassede farger og stiler. Lag QR-koder for URL-er, WiFi-nettverk, vCard, SMS og telefonsamtaler. Ingen annonser, ingen sporing – fullt nettleserbasert og trygt.',
      keywords:
        'QR-kodegenerator, tilpasset QR-kode, QR-kode med logo, farget QR-kode, gratis QR-kodeskaper, WiFi QR-kode, vCard QR-kode, SMS QR-kode, online QR-verktøy, sporingsfri QR-generator'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodegenerator',
      subtitle:
        'Lag tilpassbare QR-koder med logoer, farger og stiler. Støtte for URL-er, WiFi, vCard, SMS og samtaler',
      selectLanguage: 'Velg Språk'
    },
    tabs: {
      urlText: 'URL/Tekst',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Tekst eller URL',
      firstName: 'Fornavn',
      lastName: 'Etternavn',
      organization: 'Organisasjon',
      title: 'Tittel',
      phoneWork: 'Telefon (Arbeid)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-post',
      website: 'Nettsted',
      street: 'Gate',
      city: 'By',
      state: 'Stat/Fylke',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Nettverksnavn (SSID)',
      password: 'Passord',
      authentication: 'Autentisering',
      hiddenNetwork: 'Dette er et skjult nettverk',
      phoneNumber: 'Telefonnummer',
      message: 'Melding (valgfritt)',
      qrSize: 'QR-Kodestørrelse',
      foregroundColor: 'Forgrunnsfarge',
      backgroundColor: 'Bakgrunnsfarge',
      errorCorrection: 'Feilretting',
      downloadFormat: 'Nedlastingsformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hjørnefirkant',
      cornerDot: 'Hjørnepunkt',
      quietZone: 'Rolig Sone (Marg)',
      logoSize: 'Logostørrelse',
      logoMargin: 'Logomarg',
      logo: 'Logo (Valgfritt)'
    },
    placeholders: {
      url: 'f.eks., https://www.eksempel.com',
      firstName: 'Ola',
      lastName: 'Nordmann',
      organization: 'ACME AS',
      title: 'Utvikler',
      phoneWork: '+47-555-555-1234',
      phoneMobile: '+47-555-555-5678',
      email: 'ola.nordmann@eksempel.com',
      website: 'https://www.eksempel.com',
      street: 'Hovedgaten 123',
      city: 'Oslo',
      state: 'Oslo',
      zip: '0150',
      country: 'Norge',
      ssid: 'f.eks., MittHjemWiFi',
      wifiPassword: 'Ditt hemmelige passord',
      phoneNumber: 'f.eks., +47555123456',
      smsMessage: 'Din forhåndsutfylte melding her...'
    },
    actions: {
      generate: 'Lag QR-Kode',
      download: 'Last Ned QR-Kode',
      reset: 'Tilbakestill til Standard',
      customize: 'Tilpass Utseende (Valgfritt)',
      chooseLogo: 'Velg Bilde'
    },
    options: {
      sizeSmall: 'Liten (256px)',
      sizeMedium: 'Middels (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Lav (7%)',
      errorMedium: 'M - Middels (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Høy (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Firkant',
      dotRounded: 'Avrundet',
      dotDots: 'Punkter',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Avrundet',
      dotExtraRounded: 'Ekstra Avrundet',
      cornerSquare: 'Firkant',
      cornerExtraRounded: 'Ekstra Avrundet',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Vennligst skriv inn en tekst eller en URL',
      vcardRequired:
        'Vennligst fyll ut minst én av: Fornavn, Etternavn, E-post eller Telefonnummer.',
      wifiSsidRequired: 'Vennligst skriv inn Nettverksnavn (SSID).',
      phoneRequired: 'Vennligst skriv inn et telefonnummer.',
      lowContrast:
        '⚠️ Lav kontrast oppdaget. QR-koden din kan være vanskelig å skanne. Vurder å bruke mørkere forgrunn eller lysere bakgrunn.',
      dataEmpty: 'QR-kodedata er tomme.',
      noData: 'Ingen data oppgitt for QR-kode.',
      libraryLoadFailed: 'QR-kodebiblioteket kunne ikke lastes. Oppdater siden.',
      generationError: 'Feil ved generering av QR-kode',
      generateFirst: 'Vennligst generer en QR-kode først.',
      resetSuccess: 'Tilpasning tilbakestilt til standard',
      largeImageWarning:
        '⚠️ Stor bildefil ({{size}}MB). Vurder å bruke et mindre bilde for bedre ytelse.',
      invalidImageFile: 'Vennligst velg en gyldig bildefil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tegn'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonsamtale'
    },
    footer: {
      privacy1: 'Denne gratis QR-kodegeneratoren kjører helt i nettleseren din.',
      privacy2:
        'Ingen data lagres eller sendes noen steder. Ingen sporing, ingen annonser, ingen tull.',
      github: 'Vis kildekode på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Plass rundt QR-koden (anbefalt: 4-16px for pålitelig skanning)'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil vises her'
    }
  },
  da: {
    meta: {
      title:
        'Gratis QR-Kodegenerator - Tilpas Farver, Logoer & Stilarter | QRTurbo.app',
      description:
        'Generer gratis tilpasselige QR-koder øjeblikkeligt med QRTurbo.app. Tilføj logoer, tilpassede farver og stilarter. Opret QR-koder til URL\'er, WiFi-netværk, vCard, SMS og telefonopkald. Ingen annoncer, ingen sporing – fuldt browserbaseret og sikkert.',
      keywords:
        'QR-kodegenerator, tilpasset QR-kode, QR-kode med logo, farvet QR-kode, gratis QR-kodeskaber, WiFi QR-kode, vCard QR-kode, SMS QR-kode, online QR-værktøj, sporingsfri QR-generator'
    },
    app: {
      title: 'QRTurbo.app - Gratis QR-Kodegenerator',
      subtitle:
        'Opret tilpasselige QR-koder med logoer, farver og stilarter. Support til URL\'er, WiFi, vCard, SMS og opkald',
      selectLanguage: 'Vælg Sprog'
    },
    tabs: {
      urlText: 'URL/Tekst',
      vcard: 'vCard',
      smsPhone: 'SMS/Telefon',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: 'Tekst eller URL',
      firstName: 'Fornavn',
      lastName: 'Efternavn',
      organization: 'Organisation',
      title: 'Titel',
      phoneWork: 'Telefon (Arbejde)',
      phoneMobile: 'Telefon (Mobil)',
      email: 'E-mail',
      website: 'Hjemmeside',
      street: 'Gade',
      city: 'By',
      state: 'Stat/Provins',
      zip: 'Postnummer',
      country: 'Land',
      ssid: 'Netværksnavn (SSID)',
      password: 'Adgangskode',
      authentication: 'Godkendelse',
      hiddenNetwork: 'Dette er et skjult netværk',
      phoneNumber: 'Telefonnummer',
      message: 'Besked (valgfrit)',
      qrSize: 'QR-Kodestørrelse',
      foregroundColor: 'Forgrundsfarve',
      backgroundColor: 'Baggrundsfarve',
      errorCorrection: 'Fejlrettelse',
      downloadFormat: 'Downloadformat',
      dotStyle: 'Punktstil',
      cornerSquare: 'Hjørne Firkant',
      cornerDot: 'Hjørnepunkt',
      quietZone: 'Rolig Zone (Margen)',
      logoSize: 'Logostørrelse',
      logoMargin: 'Logomargen',
      logo: 'Logo (Valgfrit)'
    },
    placeholders: {
      url: 'f.eks., https://www.eksempel.com',
      firstName: 'Anders',
      lastName: 'Andersen',
      organization: 'ACME ApS',
      title: 'Udvikler',
      phoneWork: '+45-555-555-1234',
      phoneMobile: '+45-555-555-5678',
      email: 'anders.andersen@eksempel.com',
      website: 'https://www.eksempel.com',
      street: 'Hovedgaden 123',
      city: 'København',
      state: 'Hovedstaden',
      zip: '1000',
      country: 'Danmark',
      ssid: 'f.eks., MitHjemWiFi',
      wifiPassword: 'Din hemmelige adgangskode',
      phoneNumber: 'f.eks., +45555123456',
      smsMessage: 'Din forudfyldte besked her...'
    },
    actions: {
      generate: 'Opret QR-Kode',
      download: 'Download QR-Kode',
      reset: 'Nulstil til Standard',
      customize: 'Tilpas Udseende (Valgfrit)',
      chooseLogo: 'Vælg Billede'
    },
    options: {
      sizeSmall: 'Lille (256px)',
      sizeMedium: 'Mellem (512px)',
      sizeLarge: 'Stor (1024px)',
      errorLow: 'L - Lav (7%)',
      errorMedium: 'M - Mellem (15%)',
      errorQuartile: 'Q - Kvartil (25%)',
      errorHigh: 'H - Høj (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Ingen',
      dotSquare: 'Firkant',
      dotRounded: 'Afrundet',
      dotDots: 'Prikker',
      dotClassy: 'Klassisk',
      dotClassyRounded: 'Klassisk Afrundet',
      dotExtraRounded: 'Ekstra Afrundet',
      cornerSquare: 'Firkant',
      cornerExtraRounded: 'Ekstra Afrundet',
      cornerDot: 'Punkt'
    },
    alerts: {
      enterText: 'Indtast venligst en tekst eller en URL',
      vcardRequired:
        'Udfyld venligst mindst én af: Fornavn, Efternavn, E-mail eller Telefonnummer.',
      wifiSsidRequired: 'Indtast venligst Netværksnavn (SSID).',
      phoneRequired: 'Indtast venligst et telefonnummer.',
      lowContrast:
        '⚠️ Lav kontrast registreret. Din QR-kode kan være svær at scanne. Overvej at bruge mørkere forgrund eller lysere baggrund.',
      dataEmpty: 'QR-kodedata er tomme.',
      noData: 'Ingen data angivet til QR-kode.',
      libraryLoadFailed: 'QR-kodebiblioteket kunne ikke indlæses. Opdater venligst siden.',
      generationError: 'Fejl ved generering af QR-kode',
      generateFirst: 'Generer venligst en QR-kode først.',
      resetSuccess: 'Tilpasning nulstillet til standard',
      largeImageWarning:
        '⚠️ Stor billedfil ({{size}}MB). Overvej at bruge et mindre billede for bedre ydeevne.',
      invalidImageFile: 'Vælg venligst en gyldig billedfil (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} tegn'
    },
    labels: {
      sms: 'SMS',
      phone: 'Telefonopkald'
    },
    footer: {
      privacy1: 'Denne gratis QR-kodegenerator kører helt i din browser.',
      privacy2:
        'Ingen data gemmes eller sendes nogen steder. Ingen sporing, ingen annoncer, ingen vrøvl.',
      github: 'Se kildekode på GitHub'
    },
    helpers: {
      quietZoneHelper: 'Plads omkring QR-koden (anbefalet: 4-16px for pålidelig scanning)'
    },
    misc: {
      qrPlaceholder: 'QR-koden vil blive vist her'
    }
  },
  zh: {
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
      logo: '徽标（可选）'
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
  },
  ja: {
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
      logo: 'ロゴ（任意）'
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
  },
  ko: {
    meta: {
      title: '무료 QR 코드 생성기 - 색상, 로고 및 스타일 사용자 정의 | QRTurbo.app',
      description:
        'QRTurbo.app으로 무료로 사용자 정의 가능한 QR 코드를 즉시 생성하세요. 로고, 사용자 정의 색상 및 스타일을 추가하세요. URL, WiFi 네트워크, vCard, SMS 및 전화에 대한 QR 코드를 생성하세요. 광고 없음, 추적 없음 – 완전히 브라우저 기반이며 안전합니다.',
      keywords:
        'QR 코드 생성기, 사용자 정의 QR 코드, 로고가 있는 QR 코드, 컬러 QR 코드, 무료 QR 코드 제작자, WiFi QR 코드, vCard QR 코드, SMS QR 코드, 온라인 QR 도구, 추적 없는 QR 생성기'
    },
    app: {
      title: 'QRTurbo.app - 무료 QR 코드 생성기',
      subtitle: '로고, 색상 및 스타일로 사용자 정의 가능한 QR 코드를 만드세요. URL, WiFi, vCard, SMS 및 통화 지원',
      selectLanguage: '언어 선택'
    },
    tabs: {
      urlText: 'URL/텍스트',
      vcard: 'vCard',
      smsPhone: 'SMS/전화',
      wifi: 'WiFi'
    },
    fields: {
      textOrUrl: '텍스트 또는 URL',
      firstName: '이름',
      lastName: '성',
      organization: '조직',
      title: '직함',
      phoneWork: '전화（직장）',
      phoneMobile: '전화（휴대폰）',
      email: '이메일',
      website: '웹사이트',
      street: '거리',
      city: '도시',
      state: '주/도',
      zip: '우편번호',
      country: '국가',
      ssid: '네트워크 이름（SSID）',
      password: '비밀번호',
      authentication: '인증',
      hiddenNetwork: '숨겨진 네트워크입니다',
      phoneNumber: '전화번호',
      message: '메시지（선택 사항）',
      qrSize: 'QR 코드 크기',
      foregroundColor: '전경색',
      backgroundColor: '배경색',
      errorCorrection: '오류 수정',
      downloadFormat: '다운로드 형식',
      dotStyle: '점 스타일',
      cornerSquare: '모서리 사각형',
      cornerDot: '모서리 점',
      quietZone: '정적 영역（여백）',
      logoSize: '로고 크기',
      logoMargin: '로고 여백',
      logo: '로고（선택 사항）'
    },
    placeholders: {
      url: '예: https://www.example.com',
      firstName: '길동',
      lastName: '홍',
      organization: 'ACME 주식회사',
      title: '개발자',
      phoneWork: '+82-2-5555-1234',
      phoneMobile: '+82-10-5555-5678',
      email: 'gildong.hong@example.com',
      website: 'https://www.example.com',
      street: '중앙로 123',
      city: '서울',
      state: '서울특별시',
      zip: '04524',
      country: '대한민국',
      ssid: '예: 우리집WiFi',
      wifiPassword: '비밀 비밀번호',
      phoneNumber: '예: +821012345678',
      smsMessage: '미리 작성된 메시지를 여기에...'
    },
    actions: {
      generate: 'QR 코드 생성',
      download: 'QR 코드 다운로드',
      reset: '기본값으로 재설정',
      customize: '외관 사용자 정의（선택 사항）',
      chooseLogo: '이미지 선택'
    },
    options: {
      sizeSmall: '소（256px）',
      sizeMedium: '중（512px）',
      sizeLarge: '대（1024px）',
      errorLow: 'L - 낮음（7%）',
      errorMedium: 'M - 중간（15%）',
      errorQuartile: 'Q - 사분위（25%）',
      errorHigh: 'H - 높음（30%）',
      formatPng: 'PNG（래스터）',
      formatSvg: 'SVG（벡터）',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: '없음',
      dotSquare: '사각형',
      dotRounded: '둥근',
      dotDots: '점',
      dotClassy: '클래시',
      dotClassyRounded: '클래시 둥근',
      dotExtraRounded: '매우 둥근',
      cornerSquare: '사각형',
      cornerExtraRounded: '매우 둥근',
      cornerDot: '점'
    },
    alerts: {
      enterText: '텍스트 또는 URL을 입력하세요',
      vcardRequired: '다음 중 하나 이상을 입력하세요: 이름, 성, 이메일 또는 전화번호.',
      wifiSsidRequired: '네트워크 이름（SSID）을 입력하세요.',
      phoneRequired: '전화번호를 입력하세요.',
      lowContrast:
        '⚠️ 낮은 대비가 감지되었습니다. QR 코드가 스캔하기 어려울 수 있습니다. 더 어두운 전경색이나 더 밝은 배경색 사용을 고려하세요.',
      dataEmpty: 'QR 코드 데이터가 비어 있습니다.',
      noData: 'QR 코드에 대한 데이터가 제공되지 않았습니다.',
      libraryLoadFailed: 'QR 코드 라이브러리를 로드하지 못했습니다. 페이지를 새로 고침하세요.',
      generationError: 'QR 코드 생성 오류',
      generateFirst: '먼저 QR 코드를 생성하세요.',
      resetSuccess: '사용자 정의가 기본값으로 재설정되었습니다',
      largeImageWarning:
        '⚠️ 큰 이미지 파일（{{size}}MB）. 더 나은 성능을 위해 더 작은 이미지 사용을 고려하세요.',
      invalidImageFile: '유효한 이미지 파일（PNG, JPEG, SVG, GIF）을 선택하세요.'
    },
    counters: {
      characters: '{{current}} / {{max}} 자'
    },
    labels: {
      sms: 'SMS',
      phone: '전화'
    },
    footer: {
      privacy1: '이 무료 QR 코드 생성기는 브라우저에서 완전히 실행됩니다.',
      privacy2: '데이터가 저장되거나 전송되지 않습니다. 추적 없음, 광고 없음, 헛소리 없음.',
      github: 'GitHub에서 소스 코드 보기'
    },
    helpers: {
      quietZoneHelper: 'QR 코드 주변 공간（권장: 안정적인 스캔을 위해 4-16px）'
    },
    misc: {
      qrPlaceholder: 'QR 코드가 여기에 표시됩니다'
    }
  }
};

// Helper function to get nested value from object using dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// Helper function to replace variables in template strings
function replaceVars(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] || '');
}

// Main translation function
function t(key, vars = {}) {
  // Try current language first
  let value = getNestedValue(translations[currentLang], key);

  // Fallback to English if not found
  if (!value && currentLang !== 'en') {
    value = getNestedValue(translations.en, key);
  }

  // Return key if still not found (dev mode indicator)
  if (!value) {
    console.warn(`Translation missing: ${key} for language: ${currentLang}`);
    return key;
  }

  // Replace variables if present
  return replaceVars(value, vars);
}

// Detect browser language
function getBrowserLanguage() {
  const navLang = (navigator.language || navigator.userLanguage).toLowerCase();
  const langCode = navLang.split('-')[0];

  // Return if supported, otherwise default to English
  return translations[langCode] ? langCode : 'en';
}

// Set language and update UI
function setLanguage(langCode) {
  // Validate language code
  if (!translations[langCode]) {
    langCode = 'en';
  }

  // Update current language
  currentLang = langCode;

  // Set HTML lang attribute
  document.documentElement.setAttribute('lang', langCode);

  // Save to localStorage (cookie-free!)
  try {
    localStorage.setItem('qrturbo_lang', langCode);
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }

  // Translate all content
  translatePage();

  // Update meta tags
  updateMetaTags();
}

// Translate all elements on the page
function translatePage() {
  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // Translate option values (for select dropdowns)
  document.querySelectorAll('[data-i18n-option]').forEach((el) => {
    const key = el.getAttribute('data-i18n-option');
    el.textContent = t(key);
  });

  // Update dynamic content (character counters, etc.)
  updateDynamicTranslations();
}

// Update dynamic content that depends on current state
function updateDynamicTranslations() {
  // Character counters
  const qrTextInput = document.getElementById('qr-text');
  const charCountDisplay = document.getElementById('char-count');
  if (qrTextInput && charCountDisplay) {
    const currentLength = qrTextInput.value.length;
    charCountDisplay.textContent = t('counters.characters', {
      current: currentLength,
      max: 2000
    });
  }

  const smsMessageInput = document.getElementById('sms-message');
  const smsCharCountDisplay = document.getElementById('sms-char-count');
  if (smsMessageInput && smsCharCountDisplay) {
    const currentLength = smsMessageInput.value.length;
    smsCharCountDisplay.textContent = t('counters.characters', {
      current: currentLength,
      max: 300
    });
  }
}

// Update meta tags
function updateMetaTags() {
  document.title = t('meta.title');

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', t('meta.description'));
  }

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', t('meta.keywords'));
  }

  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', t('meta.title'));
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', t('meta.description'));
  }

  // Update Twitter Card tags
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', t('meta.title'));
  }

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) {
    twitterDesc.setAttribute('content', t('meta.description'));
  }
}

// Initialize i18n system
function initI18n() {
  let savedLang = null;

  // Try to load saved language from localStorage
  try {
    savedLang = localStorage.getItem('qrturbo_lang');

    // Validate it's a supported language
    if (savedLang && !translations[savedLang]) {
      savedLang = null;
      localStorage.removeItem('qrturbo_lang');
    }
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }

  // Determine language: saved > browser > default
  const browserLang = getBrowserLanguage();
  const initialLang = savedLang || browserLang || 'en';

  // Set the language
  setLanguage(initialLang);

  // Update language selector if it exists
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = currentLang;
  }
}

// Setup language selector event listener
function setupLanguageSelector() {
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);

      // Re-translate dynamic content
      updateDynamicTranslations();
    });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    setupLanguageSelector();
  });
} else {
  initI18n();
  setupLanguageSelector();
}
