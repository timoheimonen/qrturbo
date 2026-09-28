// Page content for the pre-rendered Romanian pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'Cod QR pentru URL și text',
    title: 'Generator de coduri QR gratuit care nu expiră | QRTurbo.app',
    description:
      'Creează gratuit coduri QR pentru linkuri, WiFi, vCard și altele. Fără cont, fără probă, fără urmărire: codurile se fac în browser și nu expiră niciodată.',
    eyebrow: 'Generator de coduri QR gratuit',
    display: 'Coduri QR gratuite care funcționează pentru totdeauna.',
    lead:
      'Creează coduri QR pentru linkuri, WiFi, contacte și multe altele, direct în browserul tău. Fără înregistrare, fără perioadă de probă, fără redirecționări: conținutul tău intră direct în cod, așa că acesta funcționează pentru totdeauna. Adaugă un logo, culori și un chenar „Scanează-mă”.'
  },
  types: {
    wifi: {
      name: 'Cod QR WiFi',
      title: 'Cod QR WiFi gratuit: generator privat și sigur | QRTurbo.app',
      description:
        'Creează gratuit un cod QR WiFi, ca oaspeții să se conecteze la rețea cu o scanare. Parola rămâne în browserul tău. Fără cont, fără urmărire, nu expiră.',
      eyebrow: 'Generator de coduri QR WiFi',
      display: 'Oaspeții se conectează la WiFi cu o singură scanare.',
      lead:
        'Introdu numele rețelei și parola ca să creezi un cod QR WiFi. Parola nu părăsește niciodată dispozitivul tău, iar codul funcționează cât timp setările rețelei rămân aceleași.',
      aboutTitle: 'Cum funcționează codurile QR WiFi',
      about: [
        'Un cod QR WiFi conține numele rețelei (SSID), tipul de securitate și parola într-un format standard, pe care aplicația Cameră de pe iPhone și Android îl recunoaște. La scanare, telefonul se oferă să se conecteze la rețea, așa că nimeni nu mai trebuie să tasteze o parolă lungă.',
        'Tipărește codul și pune-l la vedere acasă, la birou, în cafenea sau în pensiune, acolo unde oaspeții îl găsesc ușor. Dacă schimbi parola sau numele rețelei, creează un cod nou.',
        'Multe generatoare online îți trimit parola pe serverele lor. QRTurbo.app creează codul în browserul tău, așa că parola nu este niciodată încărcată sau stocată nicăieri.'
      ]
    },
    vcard: {
      name: 'Cod QR vCard',
      title: 'Cod QR vCard gratuit pentru cărți de vizită | QRTurbo.app',
      description:
        'Creează gratuit un cod QR vCard pentru cartea ta de vizită. O scanare salvează numele, telefonul, e-mailul și adresa în agendă. Fără cont, nu expiră.',
      eyebrow: 'Generator de coduri QR vCard',
      display: 'Datele tale de contact, salvate cu o singură scanare.',
      lead:
        'Adaugă numele, numărul de telefon, e-mailul și adresa ca să creezi un cod QR vCard pentru cărți de vizită, ecusoane și semnături de e-mail. Datele sunt stocate chiar în cod, nu pe un server.',
      aboutTitle: 'Cum funcționează codurile QR vCard',
      about: [
        'Un cod QR vCard conține o carte de vizită digitală în formatul vCard. Când cineva îl scanează, telefonul se oferă să salveze datele ca un contact nou, fără să fie nevoie să tasteze ceva de mână.',
        'Completează doar câmpurile pe care vrei să le împărtășești. Cu cât adaugi mai multe date, cu atât codul devine mai dens, așa că tipărește-l cu o lățime de cel puțin 2,5 cm și testează-l înainte să comanzi un tiraj mare de cărți de vizită.',
        'Pentru că datele sunt codificate direct în cod, nu mai pot fi modificate ulterior. Dacă ți se schimbă numărul de telefon sau funcția, creează un cod nou pentru următorul tiraj.'
      ]
    },
    sms: {
      name: 'Cod QR pentru SMS și apel',
      title: 'Generator gratuit de cod QR pentru SMS și apel | QRTurbo.app',
      description:
        'Creează gratuit un cod QR care deschide un SMS sau pornește un apel telefonic, cu textul precompletat. Creat în browser, fără cont, nu expiră.',
      eyebrow: 'Generator de coduri QR pentru SMS și apeluri',
      display: 'Un SMS sau un apel telefonic, cu o singură scanare.',
      lead:
        'Creează un cod QR care deschide un SMS precompletat sau formează un număr de telefon. Merge foarte bine pentru relații cu clienții, rezervări, concursuri și autocolante de service.',
      aboutTitle: 'Cum funcționează codurile QR pentru SMS și apeluri',
      about: [
        'Un cod QR pentru SMS deschide aplicația de mesaje cu numărul de telefon și mesajul tău deja completate, așa că persoana care scanează trebuie doar să apese pe trimite. Un cod QR pentru apel deschide tastatura telefonului cu numărul gata de apelat.',
        'Introdu întotdeauna numărul în format internațional, de exemplu +40 712 345 678, ca să funcționeze codul și pentru cei cu telefoane din alte țări.',
        'Telefonul nu trimite niciodată mesajul și nu inițiază apelul automat. Persoana care scanează confirmă întotdeauna mai întâi.'
      ]
    },
    email: {
      name: 'Cod QR pentru e-mail',
      title: 'Cod QR pentru e-mail cu mesaj precompletat | QRTurbo.app',
      description:
        'Creează gratuit un cod QR pentru e-mail care deschide un mesaj nou cu destinatarul, subiectul și textul deja completate. Fără cont, fără urmărire, nu expiră.',
      eyebrow: 'Generator de coduri QR pentru e-mail',
      display: 'Un e-mail gata de trimis, cu o singură scanare.',
      lead:
        'Adaugă destinatarul, subiectul și mesajul ca să creezi un cod QR de e-mail pentru feedback, cereri de asistență, comenzi și înscrieri.',
      aboutTitle: 'Cum funcționează codurile QR pentru e-mail',
      about: [
        'Un cod QR pentru e-mail conține un link mailto. La scanare se deschide aplicația de e-mail cu destinatarul, subiectul și mesajul deja completate, iar persoana care scanează decide dacă îl trimite.',
        'Păstrează scurt mesajul precompletat. Textele lungi fac codul mai dens și mai greu de scanat de la distanță.',
        'Folosește un subiect clar, de exemplu „Feedback: masa 12”, ca să poți sorta ușor mesajele primite.'
      ]
    },
    event: {
      name: 'Cod QR pentru eveniment în calendar',
      title: 'Cod QR gratuit pentru evenimente în calendar | QRTurbo.app',
      description:
        'Creează gratuit un cod QR pentru un eveniment. O scanare adaugă în calendar titlul, ora, locul și detaliile. Creat în browserul tău, nu expiră.',
      eyebrow: 'Generator de coduri QR pentru evenimente',
      display: 'Evenimentul tău, direct în calendarul lor, cu o singură scanare.',
      lead:
        'Introdu titlul, ora și locul evenimentului ca să creezi un cod QR pentru invitații, afișe, bilete și săli de ședințe.',
      aboutTitle: 'Cum funcționează codurile QR pentru evenimente',
      about: [
        'Un cod QR pentru eveniment conține o intrare de calendar în formatul iCalendar. La scanare, oamenii pot adăuga evenimentul în calendar cu data, ora și locul corecte.',
        'Suportul pentru codurile QR de calendar diferă de la un telefon la altul și de la o aplicație de scanare la alta. Testează codul atât pe un iPhone, cât și pe un telefon Android înainte să tipărești invitațiile.',
        'Completează câmpul pentru locație, ca oaspeții să găsească adresa direct din calendar.'
      ]
    },
    location: {
      name: 'Cod QR pentru locație',
      title: 'Cod QR gratuit pentru locație pe hartă | QRTurbo.app',
      description:
        'Creează gratuit un cod QR care deschide o adresă sau coordonate într-o aplicație de hărți. Ideal pentru invitații și indicatoare. Fără cont, nu expiră.',
      eyebrow: 'Generator de coduri QR pentru locație',
      display: 'Arată drumul cu o singură scanare.',
      lead:
        'Introdu o adresă sau coordonate ca să creezi un cod QR care deschide locația într-o aplicație de hărți. Folosește-l pe invitații, fluturași, indicatoare și instrucțiuni de livrare.',
      aboutTitle: 'Cum funcționează codurile QR pentru locație',
      about: [
        'O adresă creează un cod QR cu un link de căutare Google Maps, care se deschide în browser sau în aplicația de hărți pe orice telefon. Coordonatele creează un link geo, care se deschide direct în aplicația de hărți implicită a telefonului.',
        'Coordonatele sunt varianta cea mai precisă pentru locurile fără adresă poștală, cum ar fi o cabană, începutul unui traseu montan sau poarta de acces la un eveniment.',
        'Testează codul pe propriul telefon ca să verifici că indică exact locul potrivit.'
      ]
    },
    social: {
      name: 'Cod QR pentru rețele sociale',
      title: 'Generator de cod QR pentru rețele sociale | QRTurbo.app',
      description:
        'Creează gratuit un cod QR pentru profilul tău de Instagram, TikTok, YouTube, LinkedIn sau altă rețea. Scrie doar numele de utilizator. Fără cont, nu expiră.',
      eyebrow: 'Generator de coduri QR pentru rețele sociale',
      display: 'Transformă vizitatorii din lumea reală în urmăritori.',
      lead:
        'Alege o platformă și introdu numele de utilizator ca să creezi un cod QR care îți deschide profilul. Funcționează cu Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky și multe altele.',
      aboutTitle: 'Cum funcționează codurile QR pentru rețele sociale',
      about: [
        'Un cod QR pentru rețele sociale conține un link către profilul tău. La scanare, profilul se deschide în aplicație, dacă este instalată, sau în browser.',
        'Scrie numele de utilizator, iar QRTurbo.app construiește adresa corectă a profilului pentru platforma aleasă. Poți lipi și un URL complet de profil.',
        'Pune codul pe ambalaje, cărți de vizită, afișe și standuri la evenimente. Adaugă un chenar cu un îndemn scurt, de exemplu „Urmărește-ne”, ca oamenii să știe la ce să se aștepte.'
      ]
    },
    whatsapp: {
      name: 'Cod QR WhatsApp',
      title: 'Cod QR WhatsApp gratuit: pornește o conversație | QRTurbo.app',
      description:
        'Creează gratuit un cod QR WhatsApp care deschide o conversație cu numărul tău și un mesaj precompletat. Creat în browser. Fără cont, nu expiră.',
      eyebrow: 'Generator de coduri QR WhatsApp',
      display: 'O conversație pe WhatsApp, cu o singură scanare.',
      lead:
        'Introdu numărul de telefon sau numele de utilizator WhatsApp și, opțional, un mesaj. Clienții te pot contacta fără să-ți salveze mai întâi numărul.',
      aboutTitle: 'Cum funcționează codurile QR WhatsApp',
      about: [
        'Un cod QR WhatsApp conține un link wa.me. La scanare se deschide o conversație cu tine, iar mesajul tău precompletat este gata de trimis.',
        'Introdu numărul în format internațional, cu prefixul țării, de exemplu +40 712 345 678. Spațiile și cratimele sunt eliminate automat.',
        'Codul conține chiar linkul wa.me, nu o redirecționare, așa că funcționează cât timp numărul folosește WhatsApp.'
      ]
    },
    app: {
      name: 'Cod QR pentru descărcarea aplicației',
      title: 'Cod QR gratuit pentru App Store și Google Play | QRTurbo.app',
      description:
        'Creează gratuit un cod QR pentru pagina de descărcare a aplicației sau pentru linkul din App Store ori Google Play. Fără cont, fără redirecționări, nu expiră.',
      eyebrow: 'Generator de coduri QR pentru aplicații',
      display: 'Trimite oamenii direct la aplicația ta.',
      lead:
        'Adaugă pagina web a aplicației, linkul din App Store și linkul din Google Play ca să creezi un cod QR pentru descărcarea aplicației.',
      aboutTitle: 'Cum funcționează codurile QR pentru descărcarea aplicațiilor',
      about: [
        'Un cod QR conține un singur link, iar QRTurbo.app nu adaugă niciodată o redirecționare. Dacă ai o pagină web care trimite utilizatorii de iPhone în App Store și pe cei de Android în Google Play, folosește-o ca URL web pentru cel mai bun rezultat pe orice telefon.',
        'Fără o astfel de pagină, alege ce link de magazin deschide codul sau tipărește coduri separate pentru App Store și Google Play.',
        'Verifică dacă linkurile din magazine sunt publice și nu conțin parametri de urmărire pe care nu vrei să-i dezvălui.'
      ]
    }
  },
  comparison: {
    title: 'Coduri QR gratuite care funcționează pentru totdeauna',
    intro:
      'Multe generatoare de coduri QR „gratuite” creează coduri dinamice care trimit spre propriul server de redirecționare. Când se termină perioada de probă, codul este dezactivat, adesea după ce a fost deja tipărit pe meniuri, cărți de vizită sau ambalaje. QRTurbo.app funcționează altfel.',
    headers: {
      feature: 'Întrebare',
      dynamic: 'Cod QR tipic cu „probă gratuită”',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Unde este stocat conținutul tău?',
        dynamic: 'Pe serverul furnizorului, în spatele unui link scurt de redirecționare',
        qrturbo: 'Chiar în codul QR'
      },
      {
        feature: 'Ce se întâmplă când se termină perioada de probă?',
        dynamic: 'Codul este dezactivat până plătești',
        qrturbo: 'Nimic. Nu există perioadă de probă, iar codul funcționează în continuare'
      },
      {
        feature: 'Ai nevoie de un cont?',
        dynamic: 'De obicei, da',
        qrturbo: 'Nu'
      },
      {
        feature: 'Cine îți vede scanările?',
        dynamic: 'Fiecare scanare trece prin furnizor',
        qrturbo: 'Nimeni. Scanările nu ajung niciodată la noi'
      },
      {
        feature: 'Cât costă?',
        dynamic: 'Un abonament lunar sau anual',
        qrturbo: 'Nimic, inclusiv pentru uz comercial'
      }
    ],
    note:
      'Singurul compromis: un cod QR static nu poate fi modificat după tipărire. Dacă s-ar putea să vrei să schimbi destinația mai târziu, creează codul pentru o pagină pe care o controlezi și actualizează pagina respectivă.'
  },
  faq: {
    title: 'Întrebări frecvente',
    items: [
      {
        q: 'Codurile QR create cu QRTurbo.app expiră?',
        a: 'Nu. QRTurbo.app creează coduri QR statice: linkul, textul sau datele tale de contact sunt codificate direct în cod. Nu există niciun server intermediar, deci nu există nimic care să poată expira sau să fie dezactivat. Un cod funcționează cât timp conținutul lui este valabil, de exemplu cât timp există site-ul către care trimite.'
      },
      {
        q: 'De ce a încetat să funcționeze codul QR făcut pe alt site?',
        a: 'Multe generatoare creează implicit coduri QR dinamice. Acestea conțin un link scurt către serverul furnizorului, care redirecționează fiecare scanare către adresa ta reală. Când se termină perioada de probă gratuită sau abonamentul, furnizorul oprește redirecționarea, iar codul tipărit nu mai funcționează. Codurile create cu QRTurbo.app includ direct conținutul tău real și nu depind niciodată de noi.'
      },
      {
        q: 'QRTurbo.app este chiar gratuit? Pot folosi codurile în scop comercial?',
        a: 'Da. Nu există înregistrare, perioadă de probă, filigran sau limită de scanări. Poți folosi codurile QR pe care le creezi în scop personal și comercial, de exemplu pe cărți de vizită, meniuri, ambalaje și în reclame.'
      },
      {
        q: 'Pot modifica un cod QR după ce l-am tipărit?',
        a: 'Nu. Un cod QR static nu poate fi modificat, pentru că conținutul face parte din desenul codului. Dacă te aștepți să schimbi destinația, creează codul pentru o adresă pe care o controlezi, de exemplu o pagină de pe propriul site, și actualizează acea pagină.'
      },
      {
        q: 'Cât de mare trebuie tipărit un cod QR?',
        a: 'Tipărește-l la cel puțin 2 × 2 cm. Ca regulă generală, latura codului ar trebui să fie de cel puțin o zecime din distanța de scanare: un afiș citit de la 2 metri are nevoie de un cod de aproximativ 20 cm. Pentru tipar, descarcă un SVG sau un PNG mare și nu pune nimic în zona liberă din jurul codului.'
      },
      {
        q: 'De ce nu se scanează codul meu QR?',
        a: 'Cele mai frecvente cauze sunt contrastul slab dintre cod și fundal, o zonă liberă prea mică, un logo care acoperă prea mult din cod sau prea mult conținut pentru dimensiunea tipărită. QRTurbo.app te avertizează despre aceste riscuri. Testează întotdeauna codul cu câteva telefoane diferite înainte de tipărire.'
      },
      {
        q: 'Datele mele sunt în siguranță? Puteți vedea parola mea WiFi?',
        a: 'Datele tale rămân pe dispozitivul tău. Codul QR este generat de un program care rulează în browserul tău și nimic din ce scrii sau încarci nu este trimis la un server, așa că nimeni nu îți poate vedea parola WiFi sau datele de contact. După prima vizită, generatorul funcționează și offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Generatoare gratuite de coduri QR'
  }
};
