// Page content for the pre-rendered French pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR code URL et texte',
    title: 'Générateur de QR code gratuit et sans expiration | QRTurbo.app',
    description:
      'Créez des QR codes gratuits pour liens, WiFi, vCard et plus. Sans inscription ni pistage : générés dans votre navigateur, ils n’expirent jamais.',
    eyebrow: 'Générateur de QR code gratuit',
    display: 'Des QR codes gratuits qui fonctionnent pour toujours.',
    lead:
      'Créez des QR codes pour vos liens, votre WiFi, vos contacts et bien plus, directement dans votre navigateur. Sans inscription, sans essai, sans redirection : votre contenu est inscrit dans le code lui-même, qui fonctionne donc pour toujours. Ajoutez un logo, des couleurs et un cadre « SCANNEZ-MOI ».'
  },
  types: {
    wifi: {
      name: 'QR code WiFi',
      title: 'Générateur de QR code WiFi gratuit et sécurisé | QRTurbo.app',
      description:
        'Créez un QR code WiFi gratuit : vos invités se connectent en un scan. Le mot de passe reste dans votre navigateur. Sans inscription, sans expiration.',
      eyebrow: 'Générateur de QR code WiFi',
      display: 'Vos invités se connectent au WiFi en un seul scan.',
      lead:
        'Saisissez le nom du réseau et le mot de passe pour créer un QR code WiFi. Le mot de passe ne quitte jamais votre appareil, et le code fonctionne tant que les paramètres de votre réseau restent les mêmes.',
      aboutTitle: 'Comment fonctionne un QR code WiFi',
      about: [
        'Un QR code WiFi contient le nom du réseau (SSID), le type de sécurité et le mot de passe, dans un format standard que reconnaît l’appareil photo des iPhone et des téléphones Android. Il suffit de le scanner pour se voir proposer la connexion au réseau : plus besoin de recopier un long mot de passe.',
        'Imprimez le code pour votre maison, votre bureau, votre café ou votre location saisonnière, et placez-le bien en vue de vos invités. Si vous changez le mot de passe ou le nom du réseau, créez un nouveau code.',
        'Beaucoup de générateurs en ligne envoient votre mot de passe à leurs serveurs. QRTurbo.app crée le code dans votre navigateur : votre mot de passe n’est jamais envoyé ni stocké nulle part.'
      ]
    },
    vcard: {
      name: 'QR code vCard',
      title: 'QR code vCard gratuit pour vos cartes de visite | QRTurbo.app',
      description:
        'Créez un QR code vCard gratuit pour votre carte de visite. Un scan enregistre nom, téléphone, e-mail et adresse dans les contacts. Sans inscription.',
      eyebrow: 'Générateur de QR code vCard',
      display: 'Partagez vos coordonnées en un seul scan.',
      lead:
        'Ajoutez votre nom, votre numéro de téléphone, votre e-mail et votre adresse pour créer un QR code vCard destiné à vos cartes de visite, badges et signatures e-mail. Les informations sont stockées dans le code lui-même, pas sur un serveur.',
      aboutTitle: 'Comment fonctionne un QR code vCard',
      about: [
        'Un QR code vCard contient une carte de visite numérique au format vCard. Lorsqu’on le scanne, le téléphone propose d’enregistrer les informations comme nouveau contact : rien à saisir à la main.',
        'Ne remplissez que les champs que vous souhaitez partager. Plus vous ajoutez d’informations, plus le code devient dense : imprimez-le donc sur au moins 2,5 cm de large et testez-le avant de commander un grand lot de cartes.',
        'Comme les informations sont encodées directement dans le code, elles ne peuvent pas être modifiées par la suite. Si votre numéro ou votre fonction change, créez un nouveau code pour votre prochaine impression.'
      ]
    },
    sms: {
      name: 'QR code SMS et appel',
      title: 'Générateur de QR code SMS et appel gratuit | QRTurbo.app',
      description:
        'Créez un QR code gratuit qui ouvre un SMS ou lance un appel, avec un message pré-rempli. Généré dans votre navigateur, sans inscription ni expiration.',
      eyebrow: 'Générateur de QR code SMS et appel',
      display: 'Un SMS ou un appel en un seul scan.',
      lead:
        'Créez un QR code qui ouvre un SMS pré-rempli ou compose un numéro de téléphone. Idéal pour le service client, les réservations, les jeux-concours et les autocollants de maintenance.',
      aboutTitle: 'Comment fonctionnent les QR codes SMS et appel',
      about: [
        'Un QR code SMS ouvre l’application de messagerie avec le numéro et votre message déjà saisis : la personne qui scanne n’a plus qu’à appuyer sur Envoyer. Un QR code d’appel ouvre le clavier du téléphone avec le numéro prêt à être composé.',
        'Saisissez toujours le numéro au format international, par exemple +33 6 12 34 56 78, pour que le code fonctionne aussi avec les téléphones étrangers.',
        'Le téléphone n’envoie jamais le message et ne lance jamais l’appel automatiquement : la personne qui scanne doit toujours confirmer.'
      ]
    },
    email: {
      name: 'QR code e-mail',
      title: 'QR code e-mail gratuit avec message pré-rempli | QRTurbo.app',
      description:
        'Créez un QR code e-mail gratuit qui ouvre un nouveau message avec destinataire, objet et texte déjà remplis. Sans inscription, sans pistage, sans expiration.',
      eyebrow: 'Générateur de QR code e-mail',
      display: 'Un e-mail prêt à envoyer en un seul scan.',
      lead:
        'Ajoutez un destinataire, un objet et un message pour créer un QR code e-mail destiné aux avis clients, demandes d’assistance, commandes et inscriptions.',
      aboutTitle: 'Comment fonctionne un QR code e-mail',
      about: [
        'Un QR code e-mail contient un lien mailto. Le scanner ouvre l’application de messagerie avec le destinataire, l’objet et le message déjà remplis, et c’est la personne qui scanne qui décide de l’envoyer.',
        'Gardez le message pré-rempli court. Un long texte rend le code plus dense et plus difficile à scanner à distance.',
        'Choisissez un objet explicite, comme « Avis : table 12 », pour trier facilement les messages reçus.'
      ]
    },
    event: {
      name: 'QR code événement',
      title: 'QR code événement gratuit, ajout à l’agenda | QRTurbo.app',
      description:
        'Créez un QR code d’événement gratuit : un scan ajoute le titre, l’horaire, le lieu et les détails à l’agenda. Généré dans votre navigateur, sans expiration.',
      eyebrow: 'Générateur de QR code événement',
      display: 'Votre événement dans leur agenda en un seul scan.',
      lead:
        'Saisissez le titre, l’horaire et le lieu de l’événement pour créer un QR code pour vos invitations, affiches, billets et salles de réunion.',
      aboutTitle: 'Comment fonctionne un QR code événement',
      about: [
        'Un QR code événement contient une entrée d’agenda au format iCalendar. En le scannant, on peut ajouter l’événement à son agenda avec la bonne date, la bonne heure et le bon lieu.',
        'La prise en charge des QR codes d’agenda varie selon les téléphones et les applications de lecture. Testez le code avec un iPhone et un téléphone Android avant d’imprimer vos invitations.',
        'Remplissez le champ du lieu pour que vos invités retrouvent l’adresse directement depuis leur agenda.'
      ]
    },
    location: {
      name: 'QR code de localisation',
      title: 'QR code de localisation gratuit vers une carte | QRTurbo.app',
      description:
        'Créez un QR code de localisation gratuit qui ouvre une adresse ou des coordonnées dans une appli de cartes. Idéal pour invitations et panneaux.',
      eyebrow: 'Générateur de QR code de localisation',
      display: 'Montrez le chemin en un seul scan.',
      lead:
        'Saisissez une adresse ou des coordonnées pour créer un QR code qui ouvre le lieu dans une application de cartes. Utilisez-le sur vos invitations, flyers, panneaux et consignes de livraison.',
      aboutTitle: 'Comment fonctionne un QR code de localisation',
      about: [
        'Une adresse crée un QR code contenant un lien de recherche Google Maps, qui s’ouvre dans le navigateur ou dans une application de cartes sur n’importe quel téléphone. Des coordonnées créent un lien geo qui s’ouvre directement dans l’application de cartes par défaut du téléphone.',
        'Les coordonnées sont le choix le plus précis pour les lieux sans adresse postale, comme un chalet, un départ de randonnée ou l’entrée d’un site d’événement.',
        'Testez le code sur votre propre téléphone pour vérifier qu’il indique exactement le bon endroit.'
      ]
    },
    social: {
      name: 'QR code réseaux sociaux',
      title: 'QR code réseaux sociaux gratuit : Instagram, TikTok | QRTurbo.app',
      description:
        'Créez un QR code gratuit vers votre profil Instagram, TikTok, YouTube, LinkedIn ou autre. Saisissez simplement votre nom d’utilisateur. Sans inscription.',
      eyebrow: 'Générateur de QR code réseaux sociaux',
      display: 'Transformez vos visiteurs en abonnés.',
      lead:
        'Choisissez une plateforme et saisissez votre nom d’utilisateur pour créer un QR code qui ouvre votre profil. Compatible avec Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky et bien d’autres.',
      aboutTitle: 'Comment fonctionne un QR code réseaux sociaux',
      about: [
        'Un QR code réseaux sociaux contient un lien vers votre profil. Le scanner ouvre le profil dans l’application si elle est installée, sinon dans le navigateur.',
        'Saisissez votre nom d’utilisateur et QRTurbo.app construit la bonne adresse de profil pour la plateforme choisie. Vous pouvez aussi coller l’URL complète de votre profil.',
        'Placez le code sur vos emballages, cartes de visite, affiches et stands. Ajoutez un cadre avec un court appel à l’action, comme « Suivez-nous », pour que chacun sache à quoi s’attendre.'
      ]
    },
    whatsapp: {
      name: 'QR code WhatsApp',
      title: 'QR code WhatsApp gratuit pour lancer une discussion | QRTurbo.app',
      description:
        'Créez un QR code WhatsApp gratuit qui ouvre une discussion avec votre numéro et un message pré-rempli. Généré dans votre navigateur, sans inscription.',
      eyebrow: 'Générateur de QR code WhatsApp',
      display: 'Une discussion WhatsApp en un seul scan.',
      lead:
        'Saisissez votre numéro de téléphone ou votre nom d’utilisateur WhatsApp, ainsi qu’un message facultatif. Vos clients peuvent vous contacter sans enregistrer votre numéro au préalable.',
      aboutTitle: 'Comment fonctionne un QR code WhatsApp',
      about: [
        'Un QR code WhatsApp contient un lien wa.me. Le scanner ouvre une discussion avec vous, et votre message pré-rempli est prêt à être envoyé.',
        'Saisissez le numéro au format international avec l’indicatif du pays, par exemple +33 6 12 34 56 78. Les espaces et les tirets sont supprimés automatiquement.',
        'Le code contient directement le lien wa.me, et non une redirection : il fonctionne tant que le numéro est associé à WhatsApp.'
      ]
    },
    app: {
      name: 'QR code de téléchargement d’app',
      title: 'QR code App Store et Google Play gratuit | QRTurbo.app',
      description:
        'Créez un QR code gratuit vers la page de téléchargement de votre app, l’App Store ou Google Play. Généré dans votre navigateur, sans redirection.',
      eyebrow: 'Générateur de QR code pour application',
      display: 'Menez vos utilisateurs droit à votre app.',
      lead:
        'Ajoutez la page web de votre app, son lien App Store et son lien Google Play pour créer un QR code de téléchargement.',
      aboutTitle: 'Comment fonctionne un QR code de téléchargement d’app',
      about: [
        'Un QR code ne contient qu’un seul lien, et QRTurbo.app n’ajoute jamais de redirection. Si vous avez une page web qui envoie les utilisateurs d’iPhone vers l’App Store et ceux d’Android vers Google Play, indiquez-la comme URL web : c’est la meilleure solution pour tous les téléphones.',
        'Sans une telle page, choisissez le lien de boutique que le code ouvrira, ou imprimez des codes distincts pour l’App Store et Google Play.',
        'Vérifiez que les liens des boutiques sont publics et ne contiennent pas de paramètres de suivi que vous ne souhaitez pas partager.'
      ]
    }
  },
  comparison: {
    title: 'Des QR codes gratuits qui fonctionnent pour toujours',
    intro:
      'Beaucoup de générateurs de QR code « gratuits » créent des codes dynamiques qui pointent vers leur propre serveur de redirection. À la fin de l’essai, le code est désactivé, souvent alors qu’il est déjà imprimé sur des menus, des cartes de visite ou des emballages. QRTurbo.app fonctionne autrement.',
    headers: {
      feature: 'Question',
      dynamic: 'QR code « essai gratuit » classique',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Où votre contenu est-il stocké ?',
        dynamic: 'Sur le serveur du fournisseur, derrière un lien de redirection court',
        qrturbo: 'Dans le QR code lui-même'
      },
      {
        feature: 'Que se passe-t-il à la fin de l’essai ?',
        dynamic: 'Le code est désactivé jusqu’à ce que vous payiez',
        qrturbo: 'Rien. Il n’y a pas d’essai, et le code continue de fonctionner'
      },
      {
        feature: 'Faut-il créer un compte ?',
        dynamic: 'Généralement oui',
        qrturbo: 'Non'
      },
      {
        feature: 'Qui voit vos scans ?',
        dynamic: 'Chaque scan passe par le fournisseur',
        qrturbo: 'Personne. Les scans ne passent jamais par nous'
      },
      {
        feature: 'Combien ça coûte ?',
        dynamic: 'Un abonnement mensuel ou annuel',
        qrturbo: 'Rien, y compris pour un usage commercial'
      }
    ],
    note:
      'Seule contrepartie : un QR code statique ne peut pas être modifié après impression. Si la destination risque de changer, créez le code vers une page que vous contrôlez, et mettez plutôt cette page à jour.'
  },
  faq: {
    title: 'Questions fréquentes',
    items: [
      {
        q: 'Les QR codes créés avec QRTurbo.app expirent-ils ?',
        a: 'Non. QRTurbo.app crée des QR codes statiques : votre lien, votre texte ou vos coordonnées sont encodés directement dans le code. Il n’y a aucun serveur intermédiaire, donc rien ne peut expirer ni être désactivé. Un code fonctionne tant que son contenu reste valide, par exemple tant que le site vers lequel il pointe existe.'
      },
      {
        q: 'Pourquoi mon QR code créé sur un autre site ne fonctionne-t-il plus ?',
        a: 'De nombreux générateurs créent par défaut des QR codes dynamiques. Ceux-ci contiennent un lien court vers le serveur du fournisseur, qui redirige chaque scan vers votre véritable adresse. À la fin de l’essai gratuit ou de l’abonnement, le fournisseur coupe la redirection et le code imprimé cesse de fonctionner. Les codes de QRTurbo.app contiennent votre vrai contenu et ne dépendent jamais de nous.'
      },
      {
        q: 'QRTurbo.app est-il vraiment gratuit ? Puis-je utiliser les codes à des fins commerciales ?',
        a: 'Oui. Pas d’inscription, pas d’essai, pas de filigrane et pas de limite de scans. Vous pouvez utiliser les QR codes que vous créez à des fins personnelles comme commerciales, par exemple sur des cartes de visite, des menus, des emballages ou de la publicité.'
      },
      {
        q: 'Puis-je modifier un QR code après l’avoir imprimé ?',
        a: 'Non. Un QR code statique ne peut pas être modifié, car le contenu fait partie du motif. Si vous pensez changer la destination, créez le code vers une adresse que vous contrôlez, comme une page de votre propre site, et mettez plutôt cette page à jour.'
      },
      {
        q: 'À quelle taille faut-il imprimer un QR code ?',
        a: 'Imprimez-le sur au moins 2 × 2 cm. En règle générale, le code doit mesurer au moins un dixième de la distance de lecture : une affiche lue à 2 mètres nécessite un code d’environ 20 cm. Pour l’impression, téléchargez un SVG ou un grand PNG, et laissez vide la zone calme (marge) autour du code.'
      },
      {
        q: 'Pourquoi mon QR code ne se scanne-t-il pas ?',
        a: 'Les causes les plus fréquentes sont un contraste trop faible entre le code et son fond, une zone calme trop petite, un logo qui masque une trop grande partie du code, ou trop de contenu pour la taille d’impression. QRTurbo.app vous avertit de ces risques. Testez toujours le code avec plusieurs téléphones avant de l’imprimer.'
      },
      {
        q: 'Mes données sont-elles en sécurité ? Pouvez-vous voir mon mot de passe WiFi ?',
        a: 'Vos données restent sur votre appareil. Le QR code est généré par du code exécuté dans votre navigateur, et rien de ce que vous saisissez ou importez n’est envoyé à un serveur : personne ne peut voir votre mot de passe WiFi ni vos coordonnées. Après la première visite, le générateur fonctionne aussi hors ligne.'
      }
    ]
  },
  typeLinks: {
    title: 'Générateurs de QR code gratuits'
  }
};
