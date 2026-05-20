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
        'Générateur de QR Code Gratuit avec Logos et Couleurs | QRTurbo.app',
      description:
        'Créez gratuitement des QR codes personnalisés pour URLs, WiFi, vCards, SMS et appels. Ajoutez logos, couleurs et styles dans votre navigateur, sans suivi ni envoi de données.'
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
      wifi: 'WiFi',
      email: 'E-mail',
      calendarEvent: 'Événement',
      location: 'Lieu',
      socialMedia: 'Réseaux sociaux',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Lien d’app'
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
      styleOptions: 'Options de Style',
      emailTo: 'E-mail du destinataire',
      emailSubject: 'Objet',
      emailBody: 'Message',
      eventTitle: 'Titre de l’événement',
      eventStart: 'Début',
      eventEnd: 'Fin',
      eventLocation: 'Lieu',
      eventDescription: 'Description',
      locationAddress: 'Adresse ou lieu',
      latitude: 'Latitude',
      longitude: 'Longitude',
      socialPlatform: 'Plateforme',
      socialProfileType: 'Type de profil',
      socialHandleOrUrl: 'Identifiant ou URL du profil',
      whatsappPhone: 'Numéro WhatsApp',
      whatsappMessage: 'Message (optionnel)',
      mecardName: 'Nom',
      address: 'Adresse',
      appWebUrl: 'URL web/de secours',
      appIosUrl: 'URL iOS App Store',
      appAndroidUrl: 'URL Android Play Store',
      appLinkTarget: 'Secours de boutique'
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
      smsMessage: 'Votre message pré-rempli ici...',
      emailTo: 'bonjour@example.com',
      emailSubject: 'Bonjour depuis QRTurbo.app',
      emailBody: 'Écrivez votre e-mail ici...',
      eventTitle: 'Réunion d’équipe',
      eventLocation: 'Salle de réunion ou adresse',
      eventDescription: 'Détails de l’événement...',
      locationAddress: 'Tour Eiffel, Paris',
      latitude: '48.8584',
      longitude: '2.2945',
      socialHandle: '@identifiant ou https://...',
      whatsappPhone: 'ex., +33655123456',
      whatsappMessage: 'Votre message WhatsApp ici...',
      mecardName: 'Jean Dupont',
      address: '123 rue Principale, Paris',
      appWebUrl: 'https://example.com/app',
      appIosUrl: 'https://apps.apple.com/app/your-app',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Créer le Code QR',
      download: 'Télécharger le Code QR',
      reset: 'Réinitialiser aux Valeurs par Défaut',
      customize: 'Personnaliser l\'Apparence (Optionnel)',
      chooseLogo: 'Choisir une Image',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe'
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
      cornerDot: 'Point',
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
      socialOther: 'Autre URL',
      socialTypePerson: 'Personne/Profil',
      socialTypeCompany: 'Entreprise',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Utiliser iOS s’il n’y a pas d’URL web',
      appTargetAndroid: 'Utiliser Android s’il n’y a pas d’URL web'
    },
    alerts: {
      enterText: 'Veuillez saisir un texte ou une URL',
      vcardRequired:
        'Veuillez remplir au moins un de: Prénom, Nom, E-mail ou Numéro de Téléphone.',
      wifiSsidRequired: 'Veuillez saisir le Nom du Réseau (SSID).',
      wifiWpaPasswordInvalid:
        'Les mots de passe WPA/WPA2 doivent contenir 8 à 63 caractères imprimables ou exactement 64 caractères hexadécimaux.',
      wifiWepPasswordInvalid:
        'Les mots de passe WEP doivent contenir 5 ou 13 caractères imprimables, ou 10 ou 26 caractères hexadécimaux.',
      phoneRequired: 'Veuillez saisir un numéro de téléphone.',
      emailRequired: 'Veuillez remplir au moins un champ e-mail.',
      emailInvalid: 'Veuillez saisir une adresse e-mail valide.',
      eventRequired: 'Veuillez saisir un titre d’événement et une heure de début.',
      eventEndInvalid: 'L’heure de fin ne peut pas être antérieure à l’heure de début.',
      locationRequired: 'Veuillez saisir une adresse ou les deux coordonnées.',
      locationCoordinatesInvalid: 'Veuillez saisir des coordonnées de latitude et longitude valides.',
      socialRequired: 'Veuillez saisir un identifiant de réseau social ou une URL de profil.',
      socialHandleInvalid: 'Veuillez saisir un identifiant valide avec des lettres, chiffres, points, tirets bas ou tirets.',
      socialUrlInvalid: 'Veuillez saisir une URL de profil social valide commençant par http:// ou https://.',
      whatsappPhoneRequired: 'Veuillez saisir un numéro WhatsApp avec indicatif pays.',
      mecardRequired: 'Veuillez saisir au moins un de : Nom, numéro de téléphone ou e-mail.',
      appLinkRequired: 'Veuillez saisir une URL d’app web, iOS ou Android.',
      urlInvalid: 'Veuillez saisir une URL valide commençant par http:// ou https://.',
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
      privacyPolicy: 'Politique de Confidentialité',
      termsOfUse: 'Conditions d\'Utilisation',
      github: 'Voir le code source sur GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Espace autour du code QR (recommandé: 4-16px pour un scan fiable)',
      socialHandleHelper:
        'Saisissez un identifiant comme @identifiant ou collez une URL complète de profil https://.'
    },
    misc: {
      qrPlaceholder: 'Le code QR apparaîtra ici',
      socialPreview: 'Cible du QR'
    }
  };
})();
