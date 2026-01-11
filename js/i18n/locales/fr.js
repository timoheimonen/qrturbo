// French translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.fr = {
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
      logo: 'Logo (Optionnel)',
      styleOptions: 'Options de Style'
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
  };
})();
