// Page content for the pre-rendered German pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'QR-Code für URL und Text',
    title: 'QR-Code Generator kostenlos & ohne Ablaufdatum | QRTurbo.app',
    description:
      'QR-Codes kostenlos erstellen für Links, WLAN, vCards und mehr. Ohne Anmeldung, ohne Tracking: direkt im Browser erstellt und für immer gültig.',
    eyebrow: 'Kostenloser QR-Code Generator',
    display: 'Kostenlose QR-Codes, die für immer funktionieren.',
    lead:
      'Erstellen Sie QR-Codes für Links, WLAN, Kontakte und mehr, direkt in Ihrem Browser. Keine Anmeldung, keine Testphase, keine Weiterleitungen: Ihr Inhalt steckt direkt im Code und funktioniert deshalb dauerhaft. Mit Logo, Farben und „SCAN MICH“-Rahmen.'
  },
  types: {
    wifi: {
      name: 'WLAN QR-Code',
      title: 'WLAN QR-Code erstellen – kostenlos und sicher | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen WLAN QR-Code: Gäste verbinden sich per Scan. Ihr Passwort bleibt im Browser. Ohne Anmeldung, ohne Tracking, läuft nie ab.',
      eyebrow: 'WLAN QR-Code Generator',
      display: 'Gäste verbinden sich mit einem einzigen Scan mit Ihrem WLAN.',
      lead:
        'Geben Sie Netzwerkname und Passwort ein, um einen WLAN QR-Code zu erstellen. Das Passwort verlässt Ihr Gerät nie, und der Code funktioniert, solange Ihre WLAN-Einstellungen gleich bleiben.',
      aboutTitle: 'So funktionieren WLAN QR-Codes',
      about: [
        'Ein WLAN QR-Code enthält den Netzwerknamen (SSID), die Verschlüsselungsart und das Passwort in einem Standardformat, das die Kamera-Apps von iPhone und Android verstehen. Nach dem Scannen bietet das Handy an, sich mit dem Netzwerk zu verbinden. Niemand muss mehr ein langes Passwort abtippen.',
        'Drucken Sie den Code für Ihr Zuhause, Büro, Café oder Ihre Ferienwohnung aus und platzieren Sie ihn gut sichtbar für Ihre Gäste. Wenn Sie das Passwort oder den Netzwerknamen ändern, erstellen Sie einfach einen neuen Code.',
        'Viele Online-Generatoren senden Ihr Passwort an ihre Server. QRTurbo.app erstellt den Code in Ihrem Browser, sodass Ihr Passwort nirgendwo hochgeladen oder gespeichert wird.'
      ]
    },
    vcard: {
      name: 'vCard QR-Code',
      title: 'vCard QR-Code für Visitenkarten kostenlos | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen vCard QR-Code für Ihre Visitenkarte. Ein Scan speichert Name, Telefon, E-Mail und Adresse. Ohne Anmeldung, läuft nie ab.',
      eyebrow: 'vCard QR-Code Generator',
      display: 'Teilen Sie Ihre Kontaktdaten mit einem Scan.',
      lead:
        'Geben Sie Name, Telefonnummer, E-Mail und Adresse ein und erstellen Sie einen vCard QR-Code für Visitenkarten, Namensschilder und E-Mail-Signaturen. Die Daten stecken im Code selbst, nicht auf einem Server.',
      aboutTitle: 'So funktionieren vCard QR-Codes',
      about: [
        'Ein vCard QR-Code enthält eine digitale Visitenkarte im vCard-Format. Beim Scannen bietet das Handy an, die Daten als neuen Kontakt zu speichern, ganz ohne Abtippen.',
        'Füllen Sie nur die Felder aus, die Sie teilen möchten. Je mehr Angaben, desto dichter wird der Code. Drucken Sie ihn daher mindestens 2,5 cm breit und testen Sie ihn, bevor Sie eine große Auflage Visitenkarten bestellen.',
        'Da die Daten direkt im Code gespeichert sind, lassen sie sich später nicht ändern. Wenn sich Ihre Telefonnummer oder Ihre Position ändert, erstellen Sie für die nächste Auflage einen neuen Code.'
      ]
    },
    sms: {
      name: 'QR-Code für SMS und Anrufe',
      title: 'SMS & Anruf QR-Code Generator kostenlos | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen QR-Code, der eine SMS öffnet oder einen Anruf startet, auf Wunsch mit vorausgefülltem Text. Im Browser, ohne Anmeldung.',
      eyebrow: 'QR-Code Generator für SMS und Anrufe',
      display: 'SMS schreiben oder anrufen mit nur einem Scan.',
      lead:
        'Erstellen Sie einen QR-Code, der eine vorausgefüllte SMS öffnet oder eine Telefonnummer wählt. Ideal für Kundenservice, Reservierungen, Gewinnspiele und Service-Aufkleber.',
      aboutTitle: 'So funktionieren SMS- und Telefon-QR-Codes',
      about: [
        'Ein SMS QR-Code öffnet die Nachrichten-App mit bereits eingetragener Nummer und Nachricht. Wer scannt, muss nur noch auf Senden tippen. Ein Telefon-QR-Code öffnet die Telefon-App mit der gewählten Nummer.',
        'Geben Sie die Nummer immer im internationalen Format ein, zum Beispiel +49 151 23456789, damit der Code auch mit ausländischen Handys funktioniert.',
        'Das Handy sendet die Nachricht nie automatisch und startet auch keinen Anruf von selbst. Die Person, die scannt, bestätigt immer zuerst.'
      ]
    },
    email: {
      name: 'E-Mail QR-Code',
      title: 'E-Mail QR-Code Generator kostenlos | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen E-Mail QR-Code, der eine neue Nachricht mit Empfänger, Betreff und Text öffnet. Ohne Anmeldung, ohne Tracking, läuft nie ab.',
      eyebrow: 'E-Mail QR-Code Generator',
      display: 'Eine fertige E-Mail mit einem Scan öffnen.',
      lead:
        'Geben Sie Empfänger, Betreff und Nachricht ein und erstellen Sie einen E-Mail QR-Code für Feedback, Supportanfragen, Bestellungen und Anmeldungen.',
      aboutTitle: 'So funktionieren E-Mail QR-Codes',
      about: [
        'Ein E-Mail QR-Code enthält einen mailto-Link. Beim Scannen öffnet sich die E-Mail-App mit bereits ausgefülltem Empfänger, Betreff und Text, und die scannende Person entscheidet, ob sie die Nachricht sendet.',
        'Halten Sie den vorausgefüllten Text kurz. Lange Texte machen den Code dichter und aus der Entfernung schwerer lesbar.',
        'Verwenden Sie einen eindeutigen Betreff wie „Feedback: Tisch 12“, damit Sie eingehende Nachrichten leicht sortieren können.'
      ]
    },
    event: {
      name: 'QR-Code für Kalendertermine',
      title: 'Termin QR-Code erstellen für den Kalender | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen QR-Code für Kalendertermine. Ein Scan trägt Titel, Zeit, Ort und Details in den Kalender ein. Im Browser, läuft nie ab.',
      eyebrow: 'QR-Code Generator für Kalendertermine',
      display: 'Ihr Termin mit einem Scan im Kalender.',
      lead:
        'Geben Sie Titel, Zeit und Ort des Termins ein und erstellen Sie einen QR-Code für Einladungen, Plakate, Tickets und Besprechungsräume.',
      aboutTitle: 'So funktionieren Termin-QR-Codes',
      about: [
        'Ein Termin-QR-Code enthält einen Kalendereintrag im iCalendar-Format. Nach dem Scannen lässt sich der Termin mit dem richtigen Datum, der richtigen Uhrzeit und dem Ort in den Kalender übernehmen.',
        'Die Unterstützung für Kalender-QR-Codes ist je nach Handy und Scanner-App unterschiedlich. Testen Sie den Code mit einem iPhone und einem Android-Handy, bevor Sie Einladungen drucken.',
        'Füllen Sie das Feld für den Ort aus, damit Gäste die Adresse direkt im Kalender finden.'
      ]
    },
    location: {
      name: 'Standort QR-Code',
      title: 'Standort QR-Code Generator für Karten | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen Standort QR-Code, der eine Adresse oder Koordinaten in einer Karten-App öffnet. Ideal für Einladungen und Schilder.',
      eyebrow: 'Standort QR-Code Generator',
      display: 'Zeigen Sie den Weg mit einem Scan.',
      lead:
        'Geben Sie eine Adresse oder Koordinaten ein und erstellen Sie einen QR-Code, der den Ort in einer Karten-App öffnet. Für Einladungen, Flyer, Schilder und Lieferhinweise.',
      aboutTitle: 'So funktionieren Standort-QR-Codes',
      about: [
        'Aus einer Adresse entsteht ein QR-Code mit einem Google-Maps-Suchlink, der sich auf jedem Handy im Browser oder in einer Karten-App öffnet. Aus Koordinaten entsteht ein geo-Link, der direkt in der Standard-Karten-App des Handys geöffnet wird.',
        'Koordinaten sind die genaueste Wahl für Orte ohne Adresse, etwa eine Hütte, einen Wanderparkplatz oder die Einfahrt zu einem Veranstaltungsgelände.',
        'Testen Sie den Code mit Ihrem eigenen Handy, um sicherzugehen, dass er genau auf den richtigen Ort zeigt.'
      ]
    },
    social: {
      name: 'Social-Media QR-Code',
      title: 'QR-Code für Instagram, TikTok & Co. kostenlos | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen QR-Code für Ihr Instagram-, TikTok-, YouTube- oder LinkedIn-Profil. Nur Benutzernamen eingeben. Ohne Anmeldung und Tracking.',
      eyebrow: 'Social-Media QR-Code Generator',
      display: 'Machen Sie aus Besuchern Follower.',
      lead:
        'Wählen Sie eine Plattform und geben Sie Ihren Benutzernamen ein, um einen QR-Code zu Ihrem Profil zu erstellen. Funktioniert mit Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky und mehr.',
      aboutTitle: 'So funktionieren Social-Media QR-Codes',
      about: [
        'Ein Social-Media QR-Code enthält einen Link zu Ihrem Profil. Beim Scannen öffnet sich das Profil in der App, sofern sie installiert ist, oder im Browser.',
        'Geben Sie Ihren Benutzernamen ein, und QRTurbo.app erstellt die richtige Profiladresse für die gewählte Plattform. Sie können auch eine vollständige Profil-URL einfügen.',
        'Bringen Sie den Code auf Verpackungen, Visitenkarten, Plakaten und Messeständen an. Ein Rahmen mit einer kurzen Aufforderung wie „Folgt uns“ zeigt, was die Leute erwartet.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR-Code',
      title: 'WhatsApp QR-Code erstellen – Chat per Scan | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen WhatsApp QR-Code, der einen Chat mit Ihrer Nummer und einer vorausgefüllten Nachricht öffnet. Ohne Anmeldung, läuft nie ab.',
      eyebrow: 'WhatsApp QR-Code Generator',
      display: 'Einen WhatsApp-Chat mit einem Scan starten.',
      lead:
        'Geben Sie Ihre Telefonnummer oder Ihren WhatsApp-Benutzernamen und optional eine Nachricht ein. Kunden können Sie kontaktieren, ohne vorher Ihre Nummer zu speichern.',
      aboutTitle: 'So funktionieren WhatsApp QR-Codes',
      about: [
        'Ein WhatsApp QR-Code enthält einen wa.me-Link. Beim Scannen öffnet sich ein Chat mit Ihnen, und Ihre vorausgefüllte Nachricht ist sofort bereit zum Senden.',
        'Geben Sie die Nummer im internationalen Format mit Ländervorwahl ein, zum Beispiel +49 151 23456789. Leerzeichen und Bindestriche werden automatisch entfernt.',
        'Der Code enthält den wa.me-Link selbst, keine Weiterleitung. Er funktioniert also, solange die Nummer WhatsApp nutzt.'
      ]
    },
    app: {
      name: 'QR-Code für App-Downloads',
      title: 'App Store & Google Play QR-Code kostenlos | QRTurbo.app',
      description:
        'Erstellen Sie kostenlos einen QR-Code für die Download-Seite Ihrer App im App Store oder bei Google Play. Im Browser, ohne Anmeldung und Weiterleitung.',
      eyebrow: 'QR-Code Generator für App-Downloads',
      display: 'Schicken Sie Nutzer direkt zu Ihrer App.',
      lead:
        'Geben Sie die Webseite Ihrer App, den App-Store-Link und den Google-Play-Link ein und erstellen Sie einen QR-Code für App-Downloads.',
      aboutTitle: 'So funktionieren QR-Codes für App-Downloads',
      about: [
        'Ein QR-Code enthält genau einen Link, und QRTurbo.app fügt nie eine Weiterleitung hinzu. Wenn Sie eine Webseite haben, die iPhone-Nutzer zum App Store und Android-Nutzer zu Google Play schickt, verwenden Sie diese als Web-URL. So erzielen Sie auf jedem Handy das beste Ergebnis.',
        'Ohne eine solche Seite wählen Sie, welchen Store-Link der Code öffnet, oder drucken getrennte Codes für App Store und Google Play.',
        'Prüfen Sie, ob die Store-Links öffentlich sind und keine Tracking-Parameter enthalten, die Sie nicht weitergeben möchten.'
      ]
    }
  },
  comparison: {
    title: 'Kostenlose QR-Codes, die für immer funktionieren',
    intro:
      'Viele „kostenlose“ QR-Code Generatoren erstellen dynamische Codes, die auf ihren eigenen Weiterleitungsserver zeigen. Endet die Testphase, wird der Code abgeschaltet, oft erst nachdem er schon auf Speisekarten, Visitenkarten oder Verpackungen gedruckt wurde. QRTurbo.app funktioniert anders.',
    headers: {
      feature: 'Frage',
      dynamic: 'Typischer QR-Code mit „Gratis-Testphase“',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Wo wird Ihr Inhalt gespeichert?',
        dynamic: 'Auf dem Server des Anbieters, hinter einem kurzen Weiterleitungslink',
        qrturbo: 'Im QR-Code selbst'
      },
      {
        feature: 'Was passiert, wenn die Testphase endet?',
        dynamic: 'Der Code wird deaktiviert, bis Sie bezahlen',
        qrturbo: 'Nichts. Es gibt keine Testphase, und der Code funktioniert weiter'
      },
      {
        feature: 'Brauchen Sie ein Konto?',
        dynamic: 'Meistens ja',
        qrturbo: 'Nein'
      },
      {
        feature: 'Wer sieht Ihre Scans?',
        dynamic: 'Jeder Scan läuft über den Anbieter',
        qrturbo: 'Niemand. Scans erreichen uns nie'
      },
      {
        feature: 'Was kostet es?',
        dynamic: 'Ein Monats- oder Jahresabo',
        qrturbo: 'Nichts, auch nicht bei gewerblicher Nutzung'
      }
    ],
    note:
      'Der einzige Kompromiss: Ein statischer QR-Code lässt sich nach dem Druck nicht mehr ändern. Wenn Sie das Ziel später vielleicht anpassen möchten, erstellen Sie den Code für eine Seite, die Sie selbst verwalten, und ändern Sie stattdessen diese Seite.'
  },
  faq: {
    title: 'Häufig gestellte Fragen',
    items: [
      {
        q: 'Laufen QR-Codes von QRTurbo.app ab?',
        a: 'Nein. QRTurbo.app erstellt statische QR-Codes: Ihr Link, Text oder Ihre Kontaktdaten sind direkt im Code gespeichert. Dazwischen gibt es keinen Server, also nichts, was ablaufen oder abgeschaltet werden könnte. Ein Code funktioniert, solange sein Inhalt gültig ist, zum Beispiel solange die verlinkte Webseite existiert.'
      },
      {
        q: 'Warum funktioniert mein QR-Code von einer anderen Webseite nicht mehr?',
        a: 'Viele Generatoren erstellen standardmäßig dynamische QR-Codes. Diese enthalten einen Kurzlink zum Server des Anbieters, der jeden Scan an Ihre eigentliche Adresse weiterleitet. Endet die kostenlose Testphase oder das Abo, schaltet der Anbieter die Weiterleitung ab, und der gedruckte Code funktioniert nicht mehr. Codes von QRTurbo.app enthalten Ihren echten Inhalt und sind nie von uns abhängig.'
      },
      {
        q: 'Ist QRTurbo.app wirklich kostenlos? Darf ich die Codes gewerblich nutzen?',
        a: 'Ja. Es gibt keine Anmeldung, keine Testphase, kein Wasserzeichen und kein Scan-Limit. Sie dürfen die erstellten QR-Codes privat und gewerblich nutzen, etwa auf Visitenkarten, Speisekarten, Verpackungen und in der Werbung.'
      },
      {
        q: 'Kann ich einen QR-Code nach dem Druck noch ändern?',
        a: 'Nein. Ein statischer QR-Code lässt sich nicht bearbeiten, weil der Inhalt Teil des Musters ist. Wenn Sie das Ziel später ändern möchten, erstellen Sie den Code für eine Adresse, die Sie selbst verwalten, etwa eine Seite auf Ihrer eigenen Webseite, und ändern Sie stattdessen diese Seite.'
      },
      {
        q: 'Wie groß sollte ich einen QR-Code drucken?',
        a: 'Drucken Sie ihn mindestens 2 × 2 cm groß. Als Faustregel gilt: Der Code sollte mindestens ein Zehntel des Scanabstands messen. Ein Plakat, das aus 2 Metern Entfernung gescannt wird, braucht also einen Code von etwa 20 cm. Laden Sie für den Druck eine SVG-Datei oder ein großes PNG herunter und lassen Sie die Ruhezone um den Code frei.'
      },
      {
        q: 'Warum lässt sich mein QR-Code nicht scannen?',
        a: 'Die häufigsten Ursachen sind zu wenig Kontrast zwischen Code und Hintergrund, eine zu kleine Ruhezone, ein Logo, das zu viel vom Code verdeckt, oder zu viel Inhalt für die Druckgröße. QRTurbo.app warnt Sie vor diesen Risiken. Testen Sie den Code vor dem Druck immer mit mehreren Handys.'
      },
      {
        q: 'Sind meine Daten sicher? Können Sie mein WLAN-Passwort sehen?',
        a: 'Ihre Daten bleiben auf Ihrem Gerät. Der QR-Code wird von Code erzeugt, der in Ihrem Browser läuft, und nichts, was Sie eingeben oder hochladen, wird an einen Server gesendet. Niemand kann also Ihr WLAN-Passwort oder Ihre Kontaktdaten sehen. Nach dem ersten Besuch funktioniert der Generator auch offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Kostenlose QR-Code Generatoren'
  }
};
