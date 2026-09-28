// Page content for the pre-rendered Turkish pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'URL ve metin QR kodu',
    title: 'Süresi Dolmayan Ücretsiz QR Kod Oluşturucu | QRTurbo.app',
    description:
      'Linkler, WiFi, vCard ve daha fazlası için ücretsiz QR kod oluştur. Üyelik, deneme süresi ve takip yok: kodlar tarayıcında oluşturulur, süresi hiç dolmaz.',
    eyebrow: 'Ücretsiz QR kod oluşturucu',
    display: 'Süresi hiç dolmayan ücretsiz QR kodlar.',
    lead:
      'Linkler, WiFi, kişi bilgileri ve daha fazlası için QR kodlarını doğrudan tarayıcında oluştur. Üyelik yok, deneme süresi yok, yönlendirme yok: içeriğin doğrudan kodun içine yazılır, bu yüzden kod sonsuza dek çalışır. Logo, renk ve “Tara beni” çerçevesi ekle.'
  },
  types: {
    wifi: {
      name: 'WiFi QR kodu',
      title: 'Ücretsiz WiFi QR Kod Oluşturucu, Güvenli ve Gizli | QRTurbo.app',
      description:
        'Misafirlerin ağına tek taramayla bağlanması için ücretsiz WiFi QR kodu oluştur. Şifren tarayıcında kalır. Üyelik yok, takip yok, süresi dolmaz.',
      eyebrow: 'WiFi QR kod oluşturucu',
      display: 'Misafirlerin WiFi ağına tek taramayla bağlansın.',
      lead:
        'Ağ adını ve şifreni girerek WiFi QR kodunu oluştur. Şifre cihazından hiç çıkmaz ve ağ ayarların değişmediği sürece kod çalışmaya devam eder.',
      aboutTitle: 'WiFi QR kodları nasıl çalışır?',
      about: [
        'WiFi QR kodu; ağ adını (SSID), güvenlik türünü ve şifreyi, iPhone ve Android kamera uygulamalarının anladığı standart bir biçimde içerir. Kod tarandığında telefon ağa katılmayı önerir, böylece kimsenin uzun bir şifre yazması gerekmez.',
        'Kodu evin, ofisin, kafen ya da kiraladığın tatil evi için yazdır ve misafirlerin görebileceği bir yere koy. Şifreyi veya ağ adını değiştirirsen yeni bir kod oluştur.',
        'Birçok çevrimiçi QR kod oluşturucu şifreni kendi sunucularına gönderir. QRTurbo.app kodu tarayıcında oluşturur, bu yüzden şifren hiçbir yere yüklenmez ve hiçbir yerde saklanmaz.'
      ]
    },
    vcard: {
      name: 'vCard QR kodu',
      title: 'Kartvizit İçin Ücretsiz vCard QR Kod Oluşturucu | QRTurbo.app',
      description:
        'Kartvizitin için ücretsiz vCard QR kodu oluştur. Tek tarama adını, telefonunu, e-postanı ve adresini rehbere kaydeder. Üyelik yok, süresi dolmaz.',
      eyebrow: 'vCard QR kod oluşturucu',
      display: 'İletişim bilgilerini tek taramayla paylaş.',
      lead:
        'Adını, telefon numaranı, e-postanı ve adresini ekleyerek kartvizitler, yaka kartları ve e-posta imzaları için vCard QR kodu oluştur. Bilgiler bir sunucuda değil, doğrudan kodun içinde saklanır.',
      aboutTitle: 'vCard QR kodları nasıl çalışır?',
      about: [
        'vCard QR kodu, vCard biçiminde dijital bir kartvizit içerir. Biri kodu taradığında telefonu bilgileri yeni bir kişi olarak kaydetmeyi önerir; hiçbir şeyi elle yazmak gerekmez.',
        'Yalnızca paylaşmak istediğin alanları doldur. Ne kadar çok bilgi eklersen kod o kadar yoğunlaşır; bu yüzden kodu en az 2,5 cm genişliğinde bas ve büyük bir kartvizit siparişi vermeden önce test et.',
        'Bilgiler doğrudan kodun içine yazıldığı için sonradan değiştirilemez. Telefon numaran veya unvanın değişirse bir sonraki baskı için yeni bir kod oluştur.'
      ]
    },
    sms: {
      name: 'SMS ve telefon araması QR kodu',
      title: 'Ücretsiz SMS ve Telefon Araması QR Kod Oluşturucu | QRTurbo.app',
      description:
        'Mesaj uygulamasını açan veya arama başlatan ücretsiz QR kod oluştur. Hazır bir SMS metni ekle. Tarayıcında oluşturulur, üyelik yok, süresi dolmaz.',
      eyebrow: 'SMS ve telefon QR kod oluşturucu',
      display: 'Tek taramayla SMS ya da telefon araması başlat.',
      lead:
        'Önceden doldurulmuş bir SMS açan veya bir numarayı arayan QR kod oluştur. Müşteri hizmetleri, rezervasyonlar, çekilişler ve servis etiketleri için idealdir.',
      aboutTitle: 'SMS ve telefon QR kodları nasıl çalışır?',
      about: [
        'SMS QR kodu, mesaj uygulamasını telefon numarası ve mesajın önceden doldurulmuş olarak açar; kodu tarayan kişinin yalnızca Gönder düğmesine basması yeterlidir. Telefon QR kodu ise numarayı arama ekranında aranmaya hazır şekilde açar.',
        'Numarayı her zaman uluslararası biçimde gir, örneğin +90 532 123 45 67; böylece kod yabancı hat kullananlarda da çalışır.',
        'Telefon mesajı asla otomatik olarak göndermez ve aramayı kendiliğinden başlatmaz. Kodu tarayan kişi her zaman önce onaylar.'
      ]
    },
    email: {
      name: 'E-posta QR kodu',
      title: 'Hazır Mesajlı Ücretsiz E-posta QR Kod Oluşturucu | QRTurbo.app',
      description:
        'Alıcısı, konusu ve metni önceden doldurulmuş yeni bir e-posta açan ücretsiz QR kod oluştur. Üyelik yok, takip yok, süresi hiç dolmaz.',
      eyebrow: 'E-posta QR kod oluşturucu',
      display: 'Gönderilmeye hazır bir e-postayı tek taramayla aç.',
      lead:
        'Alıcı, konu ve mesaj ekleyerek geri bildirimler, destek talepleri, siparişler ve kayıtlar için e-posta QR kodu oluştur.',
      aboutTitle: 'E-posta QR kodları nasıl çalışır?',
      about: [
        'E-posta QR kodu bir mailto bağlantısı içerir. Kod tarandığında e-posta uygulaması alıcı, konu ve mesaj önceden doldurulmuş olarak açılır; göndermeye kodu tarayan kişi karar verir.',
        'Hazır mesajı kısa tut. Uzun metinler kodu yoğunlaştırır ve uzaktan taranmasını zorlaştırır.',
        '“Geri bildirim: Masa 12” gibi net bir konu satırı kullan; böylece gelen mesajları kolayca ayırabilirsin.'
      ]
    },
    event: {
      name: 'Takvim etkinliği QR kodu',
      title: 'Ücretsiz Etkinlik QR Kod Oluşturucu, Takvime Ekle | QRTurbo.app',
      description:
        'Ücretsiz takvim etkinliği QR kodu oluştur. Tek tarama başlığı, saati, yeri ve ayrıntıları takvime ekler. Tarayıcında oluşturulur, süresi dolmaz.',
      eyebrow: 'Takvim etkinliği QR kod oluşturucu',
      display: 'Etkinliğin tek taramayla takvimlerinde.',
      lead:
        'Etkinliğin adını, saatini ve yerini girerek davetiyeler, afişler, biletler ve toplantı odaları için QR kod oluştur.',
      aboutTitle: 'Etkinlik QR kodları nasıl çalışır?',
      about: [
        'Etkinlik QR kodu, iCalendar biçiminde bir takvim kaydı içerir. Kodu tarayan kişi etkinliği doğru tarih, saat ve konumla takvimine ekleyebilir.',
        'Takvim QR kodu desteği telefona ve QR okuyucu uygulamasına göre değişir. Davetiyeleri bastırmadan önce kodu hem bir iPhone\'da hem de bir Android telefonda test et.',
        'Konum alanını doldur; böylece misafirler adresi doğrudan takvimlerinden bulabilir.'
      ]
    },
    location: {
      name: 'Konum QR kodu',
      title: 'Harita İçin Ücretsiz Konum QR Kod Oluşturucu | QRTurbo.app',
      description:
        'Bir adresi veya koordinatları harita uygulamasında açan ücretsiz konum QR kodu oluştur. Davetiye ve tabelalar için ideal. Üyelik yok, süresi dolmaz.',
      eyebrow: 'Konum QR kod oluşturucu',
      display: 'Tek taramayla yol göster.',
      lead:
        'Bir adres veya koordinat girerek konumu harita uygulamasında açan bir QR kod oluştur. Davetiyelerde, el ilanlarında, tabelalarda ve teslimat talimatlarında kullan.',
      aboutTitle: 'Konum QR kodları nasıl çalışır?',
      about: [
        'Adres girdiğinde, her telefonda tarayıcıda veya harita uygulamasında açılan bir Google Haritalar arama bağlantısı içeren bir QR kod oluşur. Koordinat girdiğinde ise doğrudan telefonun varsayılan harita uygulamasında açılan bir geo bağlantısı oluşur.',
        'Koordinatlar, sokak adresi olmayan yerler için en hassas seçenektir; örneğin bir dağ evi, bir yürüyüş parkurunun başlangıcı ya da bir etkinlik alanının giriş kapısı.',
        'Kodun tam olarak doğru yeri gösterdiğinden emin olmak için onu kendi telefonunla test et.'
      ]
    },
    social: {
      name: 'Sosyal medya QR kodu',
      title: 'Ücretsiz Sosyal Medya QR Kod Oluşturucu | QRTurbo.app',
      description:
        'Instagram, TikTok, YouTube, LinkedIn veya diğer profillerin için ücretsiz QR kod oluştur. Sadece kullanıcı adını yaz. Üyelik ve takip yok, süresi dolmaz.',
      eyebrow: 'Sosyal medya QR kod oluşturucu',
      display: 'Gerçek hayattaki ziyaretçileri takipçiye dönüştür.',
      lead:
        'Bir platform seç ve kullanıcı adını girerek profilini açan bir QR kod oluştur. Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky ve daha fazlasıyla çalışır.',
      aboutTitle: 'Sosyal medya QR kodları nasıl çalışır?',
      about: [
        'Sosyal medya QR kodu, profilinin bağlantısını içerir. Kod tarandığında profil, uygulama yüklüyse uygulamada, değilse tarayıcıda açılır.',
        'Kullanıcı adını yaz; QRTurbo.app seçtiğin platform için doğru profil adresini oluşturur. İstersen tam profil URL\'sini de yapıştırabilirsin.',
        'Kodu ambalajlara, kartvizitlere, afişlere ve fuar standlarına koy. İnsanlar ne ile karşılaşacaklarını bilsin diye çerçeveye “Bizi takip et” gibi kısa bir çağrı ekle.'
      ]
    },
    whatsapp: {
      name: 'WhatsApp QR kodu',
      title: 'Ücretsiz WhatsApp QR Kod Oluşturucu, Sohbet Başlat | QRTurbo.app',
      description:
        'Numaranla ve hazır bir mesajla sohbet açan ücretsiz WhatsApp QR kodu oluştur. Tarayıcında oluşturulur. Üyelik yok, süresi hiç dolmaz.',
      eyebrow: 'WhatsApp QR kod oluşturucu',
      display: 'Tek taramayla WhatsApp sohbeti başlat.',
      lead:
        'Telefon numaranı veya WhatsApp kullanıcı adını ve istersen bir mesaj gir. Müşterilerin, numaranı kaydetmeden sana ulaşabilir.',
      aboutTitle: 'WhatsApp QR kodları nasıl çalışır?',
      about: [
        'WhatsApp QR kodu bir wa.me bağlantısı içerir. Kod tarandığında seninle bir sohbet açılır ve önceden yazdığın mesaj gönderilmeye hazır olur.',
        'Numarayı ülke koduyla birlikte uluslararası biçimde gir, örneğin +90 532 123 45 67. Boşluklar ve tireler otomatik olarak kaldırılır.',
        'Kod bir yönlendirme değil, doğrudan wa.me bağlantısının kendisini içerir; bu yüzden numara WhatsApp kullandığı sürece çalışmaya devam eder.'
      ]
    },
    app: {
      name: 'Uygulama indirme QR kodu',
      title: 'Ücretsiz App Store ve Google Play QR Kod Oluşturucu | QRTurbo.app',
      description:
        'Uygulamanın indirme sayfası, App Store veya Google Play bağlantısı için ücretsiz QR kod oluştur. Üyelik yok, yönlendirme yok, süresi hiç dolmaz.',
      eyebrow: 'Uygulama indirme QR kod oluşturucu',
      display: 'İnsanları doğrudan uygulamana yönlendir.',
      lead:
        'Uygulamanın web sayfasını, App Store bağlantısını ve Google Play bağlantısını ekleyerek uygulama indirmeleri için QR kod oluştur.',
      aboutTitle: 'Uygulama indirme QR kodları nasıl çalışır?',
      about: [
        'Bir QR kod tek bir bağlantı taşır ve QRTurbo.app asla yönlendirme eklemez. iPhone kullanıcılarını App Store\'a, Android kullanıcılarını Google Play\'e gönderen bir web sayfan varsa, her telefonda en iyi sonuç için onu web URL\'si olarak kullan.',
        'Böyle bir sayfan yoksa kodun hangi mağaza bağlantısını açacağını seç ya da App Store ve Google Play için ayrı kodlar bastır.',
        'Mağaza bağlantılarının herkese açık olduğunu ve paylaşmak istemediğin takip parametreleri içermediğini kontrol et.'
      ]
    }
  },
  comparison: {
    title: 'Süresi hiç dolmayan ücretsiz QR kodlar',
    intro:
      'Birçok “ücretsiz” QR kod oluşturucu, kendi yönlendirme sunucusuna bağlanan dinamik kodlar üretir. Deneme süresi bittiğinde kod kapatılır, üstelik çoğu zaman menülere, kartvizitlere veya ambalajlara çoktan basılmışken. QRTurbo.app farklı çalışır.',
    headers: {
      feature: 'Soru',
      dynamic: 'Tipik “ücretsiz deneme” QR kodu',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'İçeriğin nerede saklanıyor?',
        dynamic: 'Sağlayıcının sunucusunda, kısa bir yönlendirme bağlantısının arkasında',
        qrturbo: 'Doğrudan QR kodun içinde'
      },
      {
        feature: 'Deneme süresi bitince ne oluyor?',
        dynamic: 'Ödeme yapana kadar kod devre dışı kalır',
        qrturbo: 'Hiçbir şey. Deneme süresi yok, kod çalışmaya devam eder'
      },
      {
        feature: 'Hesap açman gerekiyor mu?',
        dynamic: 'Genellikle evet',
        qrturbo: 'Hayır'
      },
      {
        feature: 'Taramalarını kim görüyor?',
        dynamic: 'Her tarama sağlayıcının üzerinden geçer',
        qrturbo: 'Hiç kimse. Taramalar bize asla ulaşmaz'
      },
      {
        feature: 'Ücreti ne kadar?',
        dynamic: 'Aylık veya yıllık abonelik',
        qrturbo: 'Ücretsiz, ticari kullanım da dahil'
      }
    ],
    note:
      'Tek ödün şu: Statik bir QR kod basıldıktan sonra düzenlenemez. Hedefi ileride değiştirmen gerekebilecekse kodu kendi yönettiğin bir sayfa için oluştur ve gerektiğinde o sayfayı güncelle.'
  },
  faq: {
    title: 'Sıkça sorulan sorular',
    items: [
      {
        q: 'QRTurbo.app ile oluşturulan QR kodların süresi dolar mı?',
        a: 'Hayır. QRTurbo.app statik QR kodlar oluşturur: linkin, metnin veya iletişim bilgilerin doğrudan kodun içine kodlanır. Arada bir sunucu olmadığından süresi dolabilecek ya da kapatılabilecek hiçbir şey yoktur. Kod, içeriği geçerli olduğu sürece çalışır; örneğin bağlantı verdiği web sitesi yayında olduğu sürece.'
      },
      {
        q: 'Başka bir siteden aldığım QR kod neden çalışmıyor?',
        a: 'Birçok QR kod oluşturucu varsayılan olarak dinamik QR kodlar üretir. Bu kodlar, sağlayıcının sunucusuna giden ve her taramayı asıl adresine yönlendiren kısa bir bağlantı içerir. Ücretsiz deneme veya abonelik sona erdiğinde sağlayıcı yönlendirmeyi kapatır ve basılı kod çalışmaz hâle gelir. QRTurbo.app\'in kodları ise gerçek içeriğini taşır ve hiçbir zaman bize bağlı değildir.'
      },
      {
        q: 'QRTurbo.app gerçekten ücretsiz mi? Kodları ticari amaçla kullanabilir miyim?',
        a: 'Evet. Üyelik, deneme süresi, filigran ve tarama sınırı yok. Oluşturduğun QR kodları kartvizit, menü, ambalaj ve reklam gibi kişisel ve ticari amaçlarla kullanabilirsin.'
      },
      {
        q: 'QR kodu bastıktan sonra değiştirebilir miyim?',
        a: 'Hayır. Statik bir QR kod düzenlenemez, çünkü içerik desenin bir parçasıdır. Hedefi ileride değiştirmeyi düşünüyorsan kodu, kendi web sitendeki bir sayfa gibi kontrolünde olan bir adres için oluştur ve gerektiğinde o sayfayı güncelle.'
      },
      {
        q: 'QR kodu hangi boyutta basmalıyım?',
        a: 'En az 2 × 2 cm boyutunda bas. Genel bir kural olarak kod, tarama mesafesinin en az onda biri kadar olmalı: 2 metreden okunacak bir afiş için yaklaşık 20 cm\'lik bir kod gerekir. Baskı için SVG veya büyük bir PNG indir ve kodun etrafındaki sessiz alanı boş bırak.'
      },
      {
        q: 'QR kodum neden taranmıyor?',
        a: 'En yaygın nedenler; kod ile arka planı arasındaki düşük kontrast, fazla küçük bir sessiz alan, kodun çok büyük bir kısmını kapatan bir logo veya baskı boyutuna göre fazla içeriktir. QRTurbo.app seni bu risklere karşı uyarır. Basmadan önce kodu her zaman birkaç farklı telefonla test et.'
      },
      {
        q: 'Verilerim güvende mi? WiFi şifremi görebiliyor musunuz?',
        a: 'Verilerin cihazında kalır. QR kod, tarayıcında çalışan kodla oluşturulur ve yazdığın ya da yüklediğin hiçbir şey bir sunucuya gönderilmez; bu yüzden WiFi şifreni veya iletişim bilgilerini kimse göremez. İlk ziyaretten sonra oluşturucu çevrimdışı da çalışır.'
      }
    ]
  },
  typeLinks: {
    title: 'Ücretsiz QR kod oluşturucular'
  }
};
