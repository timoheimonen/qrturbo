// Indonesian translations for QRTurbo.app
// Auto-registers with global translations object

(function() {
  'use strict';

  if (typeof window.translations === 'undefined') {
    window.translations = {};
  }

  window.translations.id = {
    app: {
      selectLanguage: 'Pilih Bahasa'
    },
    aria: {
      themeGroup: 'Tema',
      lightTheme: 'Tema terang',
      darkTheme: 'Tema gelap',
      language: 'Bahasa',
      qrTypes: 'Jenis kode QR'
    },
    tabs: {
      urlText: 'URL/Teks',
      vcard: 'vCard',
      smsPhone: 'SMS/Telepon',
      wifi: 'WiFi',
      email: 'Email',
      calendarEvent: 'Acara',
      location: 'Lokasi',
      socialMedia: 'Media Sosial',
      whatsapp: 'WhatsApp',
      mecard: 'MeCard',
      appLink: 'Tautan Aplikasi'
    },
    fields: {
      textOrUrl: 'Teks atau URL',
      firstName: 'Nama Depan',
      lastName: 'Nama Belakang',
      organization: 'Organisasi',
      title: 'Jabatan',
      phoneWork: 'Telepon (Kantor)',
      phoneMobile: 'Telepon (Ponsel)',
      email: 'Email',
      website: 'Situs Web',
      street: 'Alamat Jalan',
      city: 'Kota',
      state: 'Provinsi',
      zip: 'Kode Pos',
      country: 'Negara',
      ssid: 'Nama Jaringan (SSID)',
      password: 'Kata Sandi',
      authentication: 'Autentikasi',
      hiddenNetwork: 'Ini jaringan tersembunyi',
      phoneNumber: 'Nomor Telepon',
      message: 'Pesan (opsional)',
      qrSize: 'Ukuran Kode QR',
      foregroundColor: 'Warna Latar Depan',
      backgroundColor: 'Warna Latar Belakang',
      transparentBackground: 'Latar belakang transparan',
      errorCorrection: 'Koreksi Kesalahan',
      downloadFormat: 'Format Unduhan',
      dotStyle: 'Gaya Titik',
      cornerSquare: 'Kotak Sudut',
      cornerDot: 'Titik Sudut',
      quietZone: 'Zona Tenang (Margin)',
      logoSize: 'Ukuran Logo',
      logoMargin: 'Margin Logo',
      logo: 'Logo (Opsional)',
      styleOptions: 'Opsi Gaya',
      emailTo: 'Email Penerima',
      emailSubject: 'Subjek',
      emailBody: 'Pesan',
      eventTitle: 'Nama Acara',
      eventStart: 'Mulai',
      eventEnd: 'Selesai',
      eventLocation: 'Lokasi',
      eventDescription: 'Deskripsi',
      locationAddress: 'Alamat atau Tempat',
      latitude: 'Lintang',
      longitude: 'Bujur',
      socialPlatform: 'Platform',
      socialProfileType: 'Jenis profil',
      socialHandleOrUrl: 'Nama pengguna atau URL profil',
      whatsappPhone: 'Nomor WhatsApp atau @nama_pengguna',
      whatsappMessage: 'Pesan (opsional)',
      mecardName: 'Nama',
      address: 'Alamat',
      appWebUrl: 'URL Web / Cadangan',
      appIosUrl: 'URL iOS App Store',
      appAndroidUrl: 'URL Android Play Store',
      appLinkTarget: 'Toko cadangan',
      frame: 'Bingkai',
      frameText: 'Teks bingkai',
      frameColor: 'Warna bingkai'
    },
    placeholders: {
      url: 'mis. https://www.contoh.com',
      firstName: 'Budi',
      lastName: 'Santoso',
      organization: 'PT Maju Jaya',
      title: 'Pengembang',
      phoneWork: '+62 21 1234 5678',
      phoneMobile: '+62 812-3456-7890',
      email: 'budi.santoso@contoh.com',
      website: 'https://www.contoh.com',
      street: 'Jl. Merdeka No. 10',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      zip: '10110',
      country: 'Indonesia',
      ssid: 'mis. WiFiRumahSaya',
      wifiPassword: 'Kata sandi rahasia Anda',
      phoneNumber: 'mis. +6281234567890',
      smsMessage: 'Tulis pesan yang sudah terisi di sini...',
      emailTo: 'halo@contoh.com',
      emailSubject: 'Salam dari QRTurbo.app',
      emailBody: 'Tulis isi email Anda di sini...',
      eventTitle: 'Rapat tim',
      eventLocation: 'Ruang rapat atau alamat',
      eventDescription: 'Detail acara...',
      locationAddress: 'Monas, Gambir, Jakarta Pusat',
      latitude: '-6.175',
      longitude: '106.827',
      socialHandle: '@nama_pengguna atau https://...',
      whatsappPhone: 'mis. +6281234567890 atau @nama_pengguna',
      whatsappMessage: 'Tulis pesan WhatsApp Anda di sini...',
      mecardName: 'Budi Santoso',
      address: 'Jl. Merdeka No. 10, Jakarta',
      appWebUrl: 'https://contoh.com/app',
      appIosUrl: 'https://apps.apple.com/app/...',
      appAndroidUrl: 'https://play.google.com/store/apps/details?id=...'
    },
    actions: {
      generate: 'Buat Kode QR',
      download: 'Unduh Kode QR',
      reset: 'Kembalikan ke Default',
      customize: 'Sesuaikan Tampilan (Opsional)',
      chooseLogo: 'Pilih Gambar',
      showPassword: 'Tampilkan kata sandi',
      hidePassword: 'Sembunyikan kata sandi',
      showPayload: 'Tampilkan data QR',
      hidePayload: 'Sembunyikan data QR'
    },
    options: {
      sizeMedium: 'Layar (512 px)',
      sizeLarge: 'Besar (1024 px)',
      sizePrint: 'Cetak (2048 px)',
      sizePoster: 'Poster (4096 px)',
      frameNone: 'Tanpa bingkai',
      frameBannerBottom: 'Label di bawah',
      frameBannerTop: 'Label di atas',
      frameOutline: 'Garis tepi dengan label',
      errorLow: 'L - Rendah (7%)',
      errorMedium: 'M - Sedang (15%)',
      errorQuartile: 'Q - Kuartil (25%)',
      errorHigh: 'H - Tinggi (30%)',
      formatPng: 'PNG (raster)',
      formatSvg: 'SVG (vektor)',
      formatPdf: 'PDF (dokumen)',
      authWpa: 'WPA/WPA2',
      authWep: 'WEP',
      authNone: 'Tanpa kata sandi',
      dotSquare: 'Kotak',
      dotRounded: 'Membulat',
      dotDots: 'Titik-titik',
      dotClassy: 'Elegan',
      dotClassyRounded: 'Elegan Membulat',
      dotExtraRounded: 'Sangat Membulat',
      cornerSquare: 'Kotak',
      cornerExtraRounded: 'Sangat Membulat',
      cornerDot: 'Titik',
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
      socialOther: 'URL lain',
      socialTypePerson: 'Pribadi/Profil',
      socialTypeCompany: 'Perusahaan',
      socialTypeSubreddit: 'Subreddit',
      appTargetIos: 'Pakai iOS jika tidak ada URL web',
      appTargetAndroid: 'Pakai Android jika tidak ada URL web'
    },
    alerts: {
      enterText: 'Masukkan teks atau URL',
      vcardRequired:
        'Isi setidaknya salah satu: Nama Depan, Nama Belakang, Email, atau Nomor Telepon.',
      wifiSsidRequired: 'Masukkan Nama Jaringan (SSID).',
      wifiSsidLengthInvalid: 'Nama jaringan WiFi maksimal 32 byte UTF-8.',
      wifiWpaPasswordInvalid:
        'Kata sandi WPA/WPA2 harus terdiri dari 8–63 karakter yang dapat dicetak, atau tepat 64 karakter heksadesimal.',
      wifiWepPasswordInvalid:
        'Kata sandi WEP harus terdiri dari 5 atau 13 karakter yang dapat dicetak, atau 10 atau 26 karakter heksadesimal.',
      phoneRequired: 'Masukkan nomor telepon.',
      emailRequired: 'Isi setidaknya satu kolom email.',
      emailInvalid: 'Masukkan alamat email yang valid.',
      eventRequired: 'Masukkan nama acara dan waktu mulai.',
      eventEndInvalid: 'Waktu selesai acara tidak boleh lebih awal dari waktu mulai.',
      locationRequired: 'Masukkan alamat atau kedua koordinat.',
      locationCoordinatesInvalid: 'Masukkan koordinat lintang dan bujur yang valid.',
      socialRequired: 'Masukkan nama pengguna atau URL profil media sosial.',
      socialHandleInvalid: 'Masukkan nama pengguna yang valid, hanya berisi huruf, angka, titik, garis bawah, atau tanda hubung.',
      socialUrlInvalid: 'Masukkan URL profil media sosial yang valid, diawali http:// atau https://.',
      whatsappPhoneRequired: 'Masukkan nomor WhatsApp beserta kode negara atau @nama_pengguna yang valid.',
      mecardRequired: 'Isi setidaknya salah satu: Nama, Nomor Telepon, atau Email.',
      appLinkRequired: 'Masukkan URL aplikasi web, iOS, atau Android.',
      urlInvalid: 'Masukkan URL yang valid, diawali http:// atau https://.',
      lowContrast:
        '⚠️ Kontras rendah terdeteksi. Kode QR Anda mungkin sulit dipindai. Coba gunakan latar depan yang lebih gelap atau latar belakang yang lebih terang.',
      dataEmpty: 'Data kode QR kosong.',
      noData: 'Tidak ada data untuk kode QR.',
      libraryLoadFailed: 'Pustaka kode QR gagal dimuat. Muat ulang halaman ini.',
      generationError: 'Terjadi kesalahan saat membuat kode QR',
      dataTooLong: 'Konten ini terlalu besar untuk tingkat koreksi kesalahan QR yang dipilih. Persingkat konten atau pilih tingkat yang lebih rendah.',
      pdfExportFailed: 'Ekspor PDF gagal. Silakan coba lagi.',
      generateFirst: 'Buat kode QR terlebih dahulu.',
      resetSuccess: 'Tampilan dikembalikan ke pengaturan default',
      largeImageWarning:
        '⚠️ File gambar berukuran besar ({{size}} MB). Sebaiknya gunakan gambar yang lebih kecil agar performa lebih baik.',
      invalidImageFile: 'Pilih file gambar yang valid (PNG, JPEG, SVG, GIF).'
    },
    counters: {
      characters: '{{current}} / {{max}} karakter'
    },
    units: {
      modules: '{{count}} modul'
    },
    labels: {
      sms: 'SMS',
      phone: 'Panggilan Telepon'
    },
    warnings: {
      lowContrast:
        'Kontras yang rendah dapat membuat kode QR ini sulit dipindai. Gunakan latar depan yang lebih gelap atau latar belakang yang lebih terang.',
      transparentBackground:
        'Latar belakang transparan bergantung pada permukaan akhirnya. Uji kode QR di atas latar yang sebenarnya sebelum dipublikasikan.',
      quietZoneSmall:
        'Zona tenang terlalu kecil. Gunakan minimal 4 modul agar pemindaian andal.',
      denseData:
        'Kode QR ini berisi banyak data untuk ukuran yang dipilih. Gunakan ukuran yang lebih besar atau persingkat kontennya.',
      logoErrorCorrection:
        'Logo berukuran besar lebih mudah dipindai dengan koreksi kesalahan Tinggi (H).',
      logoLarge:
        'Logo terlalu besar dan bisa menutupi terlalu banyak bagian kode QR. Uji dulu sebelum mencetak atau membagikannya.'
    },
    brand: {
      tagline: 'tempat pribadi Anda untuk membuat kode QR'
    },
    trust: {
      local: 'Dibuat di browser Anda',
      noUploads: 'Tidak ada yang diunggah',
      noTracking: 'Tanpa pelacakan atau cookie',
      offline: 'Bisa dipakai offline',
      openSource: 'Sumber terbuka',
      noExpiry: 'Tidak pernah kedaluwarsa',
      noSignup: 'Tanpa daftar akun'
    },
    workspace: {
      chooseType: 'Pilih jenis',
      addContent: 'Tambahkan konten',
      adjustLook: 'Ukuran dan gaya'
    },
    preview: {
      title: 'Pratinjau',
      localBadge: 'Dibuat di perangkat ini'
    },
    how: {
      title: 'Cara kerjanya',
      step1Title: 'Pilih',
      step1Text: 'Tentukan fungsi kodenya: membuka tautan, menyambung ke jaringan WiFi, menyimpan kontak, dan lainnya.',
      step2Title: 'Isi',
      step2Text: 'Ketik konten Anda. Pratinjau langsung diperbarui saat Anda mengetik, di browser Anda sendiri.',
      step3Title: 'Unduh',
      step3Text: 'Simpan sebagai PNG, SVG, atau PDF. Uji pindai dulu sebelum mencetak atau membagikannya.'
    },
    privacyInfo: {
      title: 'Privat sejak awal',
      intro: 'Kode QR sering berisi data pribadi: kata sandi WiFi, nomor telepon, atau alamat rumah. QRTurbo.app dirancang agar tidak satu pun dari data itu sampai ke server.',
      localTitle: 'Tetap di perangkat Anda',
      localText: 'Kode QR dan logo dibuat oleh kode yang berjalan di browser Anda. Tidak ada server backend yang bisa menerima apa yang Anda ketik.',
      staticTitle: 'Tanpa pengalihan, tanpa kedaluwarsa',
      staticText: 'Konten Anda disandikan langsung ke dalam kode QR. Pemindaian tidak pernah melewati server kami, dan kodenya tidak pernah kedaluwarsa.',
      noTrackingTitle: 'Tanpa pelacakan',
      noTrackingText: 'Tanpa analitik, iklan, cookie, atau akun. Hanya pilihan bahasa dan tema Anda yang disimpan, secara lokal di browser Anda.',
      openSourceTitle: 'Terbuka untuk diperiksa',
      openSourceText: 'Seluruh kode sumbernya terbuka untuk umum di GitHub, jadi siapa pun bisa memverifikasi klaim ini.'
    },
    footer: {
      privacy1: 'Pembuat kode QR gratis ini berjalan sepenuhnya di browser Anda.',
      privacy2: 'Tidak ada data yang disimpan atau dikirim ke mana pun. Tanpa pelacakan, tanpa iklan, tanpa ribet.',
      privacyPolicy: 'Kebijakan Privasi',
      termsOfUse: 'Ketentuan Penggunaan',
      github: 'Lihat kode sumber di GitHub'
    },
    helpers: {
      quietZoneHelper:
        'Ruang kosong di sekeliling kode QR (minimal 4 modul agar pemindaian andal)',
      socialHandleHelper:
        'Masukkan nama pengguna seperti @nama_pengguna atau tempel URL profil lengkap yang diawali https://.'
    },
    frame: {
      defaultText: 'PINDAI SAYA'
    },
    misc: {
      qrPlaceholder: 'Kode QR akan muncul di sini',
      socialPreview: 'Tujuan QR',
      wifiPayloadHidden: 'Konfigurasi WiFi — kata sandi disembunyikan'
    }
  };
})();
