// Page content for the pre-rendered Indonesian pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'Kode QR URL dan teks',
    title: 'Pembuat Kode QR Gratis, Tidak Pernah Kedaluwarsa | QRTurbo.app',
    description:
      'Buat kode QR gratis untuk tautan, WiFi, vCard, dan lainnya. Tanpa daftar, tanpa masa uji coba, tanpa pelacakan: dibuat di browser dan berlaku selamanya.',
    eyebrow: 'Pembuat kode QR gratis',
    display: 'Kode QR gratis yang tidak pernah berhenti berfungsi.',
    lead:
      'Buat kode QR untuk tautan, WiFi, kontak, dan lainnya, langsung di browser Anda. Tanpa daftar, tanpa masa uji coba, tanpa pengalihan: konten Anda masuk langsung ke dalam kode, jadi kodenya berfungsi selamanya. Tambahkan logo, warna, dan bingkai “Pindai saya”.'
  },
  types: {
    wifi: {
      name: 'Kode QR WiFi',
      title: 'Buat Kode QR WiFi Gratis, Privat dan Aman | QRTurbo.app',
      description:
        'Buat kode QR WiFi gratis agar tamu bisa tersambung ke jaringan Anda dengan sekali pindai. Kata sandi tetap di browser. Tanpa daftar, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR WiFi',
      display: 'Tamu tersambung ke WiFi Anda dengan sekali pindai.',
      lead:
        'Masukkan nama jaringan dan kata sandi untuk membuat kode QR WiFi. Kata sandi tidak pernah meninggalkan perangkat Anda, dan kodenya tetap berfungsi selama pengaturan jaringan Anda tidak berubah.',
      aboutTitle: 'Cara kerja kode QR WiFi',
      about: [
        'Kode QR WiFi berisi nama jaringan (SSID), jenis keamanan, dan kata sandi dalam format standar yang dipahami aplikasi kamera di iPhone dan Android. Saat dipindai, ponsel langsung menawarkan untuk tersambung ke jaringan, jadi tidak ada yang perlu mengetik kata sandi yang panjang.',
        'Cetak kodenya untuk rumah, kantor, kafe, atau penginapan Anda, lalu tempel di tempat yang mudah dilihat tamu. Jika Anda mengganti kata sandi atau nama jaringan, buat kode baru.',
        'Banyak generator online mengirim kata sandi Anda ke server mereka. QRTurbo.app membuat kode di browser Anda, jadi kata sandi Anda tidak pernah diunggah atau disimpan di mana pun.'
      ]
    },
    vcard: {
      name: 'Kode QR vCard',
      title: 'Kode QR vCard Gratis untuk Kartu Nama | QRTurbo.app',
      description:
        'Buat kode QR vCard gratis untuk kartu nama Anda. Sekali pindai, nama, telepon, email, dan alamat Anda tersimpan di kontak. Tanpa daftar, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR vCard',
      display: 'Bagikan kontak Anda dengan sekali pindai.',
      lead:
        'Tambahkan nama, nomor telepon, email, dan alamat untuk membuat kode QR vCard bagi kartu nama, tanda pengenal, dan tanda tangan email. Data tersimpan di dalam kode itu sendiri, bukan di server.',
      aboutTitle: 'Cara kerja kode QR vCard',
      about: [
        'Kode QR vCard berisi kartu nama digital dalam format vCard. Saat seseorang memindainya, ponselnya menawarkan untuk menyimpan data tersebut sebagai kontak baru, jadi tidak ada yang perlu diketik manual.',
        'Isi hanya kolom yang ingin Anda bagikan. Makin banyak data yang ditambahkan, makin padat kodenya, jadi cetak dengan lebar minimal 2,5 cm dan uji dulu sebelum memesan kartu nama dalam jumlah banyak.',
        'Karena data disandikan langsung ke dalam kode, data tersebut tidak bisa diubah belakangan. Jika nomor telepon atau jabatan Anda berubah, buat kode baru untuk cetakan berikutnya.'
      ]
    },
    sms: {
      name: 'Kode QR SMS dan telepon',
      title: 'Buat Kode QR SMS dan Telepon Gratis | QRTurbo.app',
      description:
        'Buat kode QR gratis yang membuka SMS atau memulai panggilan telepon. Tambahkan isi SMS yang sudah terisi. Dibuat di browser, tanpa daftar, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR SMS dan telepon',
      display: 'Kirim SMS atau mulai panggilan dengan sekali pindai.',
      lead:
        'Buat kode QR yang membuka SMS dengan pesan yang sudah terisi atau langsung memanggil nomor telepon. Cocok untuk layanan pelanggan, reservasi, kuis berhadiah, dan stiker servis.',
      aboutTitle: 'Cara kerja kode QR SMS dan telepon',
      about: [
        'Kode QR SMS membuka aplikasi pesan dengan nomor telepon dan pesan Anda yang sudah terisi, jadi orang yang memindainya tinggal menekan kirim. Kode QR telepon membuka aplikasi telepon dengan nomor yang siap dipanggil.',
        'Selalu masukkan nomor dalam format internasional, misalnya +62 812-3456-7890, agar kodenya juga berfungsi di ponsel dengan nomor luar negeri.',
        'Ponsel tidak pernah mengirim pesan atau melakukan panggilan secara otomatis. Orang yang memindai selalu mengonfirmasinya terlebih dahulu.'
      ]
    },
    email: {
      name: 'Kode QR email',
      title: 'Kode QR Email Gratis dengan Pesan Siap Kirim | QRTurbo.app',
      description:
        'Buat kode QR email gratis yang membuka pesan baru dengan penerima, subjek, dan isi yang sudah terisi. Tanpa daftar, tanpa pelacakan, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR email',
      display: 'Buka email yang siap dikirim dengan sekali pindai.',
      lead:
        'Tambahkan penerima, subjek, dan pesan untuk membuat kode QR email untuk masukan, permintaan bantuan, pesanan, dan pendaftaran.',
      aboutTitle: 'Cara kerja kode QR email',
      about: [
        'Kode QR email berisi tautan mailto. Saat dipindai, aplikasi email terbuka dengan penerima, subjek, dan pesan yang sudah terisi, lalu orang yang memindai memutuskan apakah akan mengirimnya.',
        'Buat pesan yang sudah terisi tetap singkat. Teks yang panjang membuat kode lebih padat dan lebih sulit dipindai dari jauh.',
        'Gunakan subjek yang jelas, misalnya “Masukan: meja 12”, agar pesan yang masuk mudah Anda pilah.'
      ]
    },
    event: {
      name: 'Kode QR acara kalender',
      title: 'Kode QR Acara Gratis, Langsung ke Kalender | QRTurbo.app',
      description:
        'Buat kode QR acara kalender gratis. Sekali pindai, nama acara, waktu, tempat, dan detailnya masuk ke kalender. Dibuat di browser, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR acara kalender',
      display: 'Masukkan acara Anda ke kalender mereka dengan sekali pindai.',
      lead:
        'Masukkan nama acara, waktu, dan tempat untuk membuat kode QR bagi undangan, poster, tiket, dan ruang rapat.',
      aboutTitle: 'Cara kerja kode QR acara',
      about: [
        'Kode QR acara berisi entri kalender dalam format iCalendar. Dengan memindainya, orang bisa menambahkan acara ke kalender mereka dengan tanggal, waktu, dan lokasi yang tepat.',
        'Dukungan untuk kode QR kalender berbeda-beda antara ponsel dan aplikasi pemindai. Uji kode dengan iPhone dan ponsel Android sebelum Anda mencetak undangan.',
        'Isi kolom lokasi agar tamu bisa menemukan alamatnya langsung dari kalender mereka.'
      ]
    },
    location: {
      name: 'Kode QR lokasi',
      title: 'Kode QR Lokasi Gratis untuk Aplikasi Peta | QRTurbo.app',
      description:
        'Buat kode QR lokasi gratis yang membuka alamat atau koordinat di aplikasi peta. Cocok untuk undangan dan papan petunjuk. Tanpa daftar, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR lokasi',
      display: 'Tunjukkan jalan dengan sekali pindai.',
      lead:
        'Masukkan alamat atau koordinat untuk membuat kode QR yang membuka lokasi di aplikasi peta. Gunakan di undangan, brosur, papan petunjuk, dan petunjuk pengiriman.',
      aboutTitle: 'Cara kerja kode QR lokasi',
      about: [
        'Alamat menghasilkan kode QR berisi tautan pencarian Google Maps, yang terbuka di browser atau aplikasi peta di ponsel apa pun. Koordinat menghasilkan tautan geo yang langsung terbuka di aplikasi peta bawaan ponsel.',
        'Koordinat adalah pilihan paling akurat untuk tempat tanpa alamat jalan, seperti vila, titik awal jalur pendakian, atau gerbang area acara.',
        'Uji kode di ponsel Anda sendiri untuk memastikan kode menunjuk ke tempat yang tepat.'
      ]
    },
    social: {
      name: 'Kode QR media sosial',
      title: 'Buat Kode QR Media Sosial Gratis | QRTurbo.app',
      description:
        'Buat kode QR gratis untuk profil Instagram, TikTok, YouTube, LinkedIn, atau lainnya. Cukup isi nama pengguna. Tanpa daftar, tanpa pelacakan, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR media sosial',
      display: 'Ubah pengunjung di dunia nyata menjadi pengikut.',
      lead:
        'Pilih platform dan masukkan nama pengguna Anda untuk membuat kode QR yang membuka profil Anda. Bisa untuk Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky, dan lainnya.',
      aboutTitle: 'Cara kerja kode QR media sosial',
      about: [
        'Kode QR media sosial berisi tautan ke profil Anda. Saat dipindai, profil terbuka di aplikasinya jika sudah terpasang, atau di browser.',
        'Ketik nama pengguna Anda, dan QRTurbo.app menyusun alamat profil yang benar untuk platform yang dipilih. Anda juga bisa menempelkan URL profil lengkap.',
        'Pasang kode di kemasan, kartu nama, poster, dan stan acara. Tambahkan bingkai dengan ajakan singkat, seperti “Ikuti kami”, agar orang tahu apa yang akan mereka dapatkan.'
      ]
    },
    whatsapp: {
      name: 'Kode QR WhatsApp',
      title: 'Kode QR WhatsApp Gratis untuk Mulai Chat | QRTurbo.app',
      description:
        'Buat kode QR WhatsApp gratis yang membuka chat dengan nomor Anda dan pesan yang sudah terisi. Dibuat di browser. Tanpa daftar, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR WhatsApp',
      display: 'Mulai chat WhatsApp dengan sekali pindai.',
      lead:
        'Masukkan nomor telepon atau nama pengguna WhatsApp Anda dan pesan opsional. Pelanggan bisa menghubungi Anda tanpa harus menyimpan nomor Anda terlebih dahulu.',
      aboutTitle: 'Cara kerja kode QR WhatsApp',
      about: [
        'Kode QR WhatsApp berisi tautan wa.me. Saat dipindai, chat dengan Anda langsung terbuka, dan pesan yang sudah terisi siap dikirim.',
        'Masukkan nomor dalam format internasional dengan kode negara, misalnya +62 812-3456-7890. Spasi dan tanda hubung dihapus secara otomatis.',
        'Kode ini berisi tautan wa.me itu sendiri, bukan pengalihan, jadi tetap berfungsi selama nomor tersebut memakai WhatsApp.'
      ]
    },
    app: {
      name: 'Kode QR unduh aplikasi',
      title: 'Kode QR App Store dan Google Play Gratis | QRTurbo.app',
      description:
        'Buat kode QR gratis untuk halaman unduhan aplikasi, tautan App Store, atau Google Play. Dibuat di browser. Tanpa daftar, tanpa pengalihan, tanpa kedaluwarsa.',
      eyebrow: 'Pembuat kode QR unduh aplikasi',
      display: 'Arahkan orang langsung ke aplikasi Anda.',
      lead:
        'Tambahkan halaman web aplikasi Anda, tautan App Store, dan tautan Google Play untuk membuat kode QR unduh aplikasi.',
      aboutTitle: 'Cara kerja kode QR unduh aplikasi',
      about: [
        'Satu kode QR hanya memuat satu tautan, dan QRTurbo.app tidak pernah menambahkan pengalihan. Jika Anda punya halaman web yang mengarahkan pengguna iPhone ke App Store dan pengguna Android ke Google Play, gunakan halaman itu sebagai URL web agar hasilnya optimal di semua ponsel.',
        'Jika tidak punya halaman seperti itu, pilih tautan toko mana yang dibuka oleh kode, atau cetak kode terpisah untuk App Store dan Google Play.',
        'Pastikan tautan toko bersifat publik dan tidak berisi parameter pelacakan yang tidak ingin Anda bagikan.'
      ]
    }
  },
  comparison: {
    title: 'Kode QR gratis yang tidak pernah berhenti berfungsi',
    intro:
      'Banyak pembuat kode QR “gratis” membuat kode dinamis yang mengarah ke server pengalihan milik mereka sendiri. Begitu masa uji coba berakhir, kode dinonaktifkan, sering kali setelah kode itu telanjur dicetak di menu, kartu nama, atau kemasan. QRTurbo.app bekerja dengan cara berbeda.',
    headers: {
      feature: 'Pertanyaan',
      dynamic: 'Kode QR “uji coba gratis” pada umumnya',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: 'Di mana konten Anda disimpan?',
        dynamic: 'Di server penyedia, di balik tautan pengalihan pendek',
        qrturbo: 'Di dalam kode QR itu sendiri'
      },
      {
        feature: 'Apa yang terjadi saat masa uji coba berakhir?',
        dynamic: 'Kode dinonaktifkan sampai Anda membayar',
        qrturbo: 'Tidak ada. Tidak ada masa uji coba, dan kode tetap berfungsi'
      },
      {
        feature: 'Apakah Anda perlu akun?',
        dynamic: 'Biasanya ya',
        qrturbo: 'Tidak'
      },
      {
        feature: 'Siapa yang melihat data pemindaian Anda?',
        dynamic: 'Setiap pemindaian melewati server penyedia',
        qrturbo: 'Tidak ada. Pemindaian tidak pernah sampai ke kami'
      },
      {
        feature: 'Berapa biayanya?',
        dynamic: 'Langganan bulanan atau tahunan',
        qrturbo: 'Gratis, termasuk untuk penggunaan komersial'
      }
    ],
    note:
      'Satu-satunya kekurangannya: kode QR statis tidak bisa diedit setelah dicetak. Jika Anda mungkin perlu mengubah tujuannya nanti, buat kode untuk halaman yang Anda kelola sendiri, lalu perbarui halaman itu saja.'
  },
  faq: {
    title: 'Pertanyaan yang sering diajukan',
    items: [
      {
        q: 'Apakah kode QR buatan QRTurbo.app bisa kedaluwarsa?',
        a: 'Tidak. QRTurbo.app membuat kode QR statis: tautan, teks, atau data kontak Anda disandikan langsung ke dalam kode. Tidak ada server perantara, jadi tidak ada yang bisa kedaluwarsa atau dimatikan. Kode tetap berfungsi selama kontennya masih valid, misalnya selama situs web yang ditautkan masih ada.'
      },
      {
        q: 'Mengapa kode QR saya dari situs lain berhenti berfungsi?',
        a: 'Banyak generator membuat kode QR dinamis secara default. Kode tersebut berisi tautan pendek ke server penyedia, yang mengalihkan setiap pemindaian ke alamat Anda yang sebenarnya. Saat uji coba gratis atau langganan berakhir, penyedia mematikan pengalihan itu dan kode yang sudah dicetak berhenti berfungsi. Kode dari QRTurbo.app berisi konten asli Anda dan tidak pernah bergantung pada kami.'
      },
      {
        q: 'Apakah QRTurbo.app benar-benar gratis? Bolehkah kodenya dipakai untuk keperluan komersial?',
        a: 'Ya. Tanpa daftar, tanpa masa uji coba, tanpa watermark, dan tanpa batas pemindaian. Anda boleh memakai kode QR yang Anda buat untuk keperluan pribadi maupun komersial, seperti kartu nama, menu, kemasan, dan iklan.'
      },
      {
        q: 'Bisakah saya mengubah kode QR setelah dicetak?',
        a: 'Tidak. Kode QR statis tidak bisa diedit, karena kontennya merupakan bagian dari polanya. Jika Anda memperkirakan tujuannya akan berubah, buat kode untuk alamat yang Anda kelola sendiri, misalnya halaman di situs web Anda, lalu perbarui halaman itu saja.'
      },
      {
        q: 'Seberapa besar ukuran cetak kode QR yang ideal?',
        a: 'Cetak minimal 2 × 2 cm. Sebagai patokan, ukuran kode setidaknya sepersepuluh dari jarak pemindaian: poster yang dipindai dari jarak 2 meter membutuhkan kode sekitar 20 cm. Untuk cetak, unduh file SVG atau PNG beresolusi besar dan biarkan zona tenang di sekitar kode tetap kosong.'
      },
      {
        q: 'Mengapa kode QR saya tidak bisa dipindai?',
        a: 'Penyebab paling umum adalah kontras yang rendah antara kode dan latar belakangnya, zona tenang yang terlalu kecil, logo yang menutupi terlalu banyak bagian kode, atau konten yang terlalu banyak untuk ukuran cetaknya. QRTurbo.app memperingatkan Anda tentang risiko ini. Selalu uji kode dengan beberapa ponsel yang berbeda sebelum mencetaknya.'
      },
      {
        q: 'Apakah data saya aman? Bisakah Anda melihat kata sandi WiFi saya?',
        a: 'Data Anda tetap di perangkat Anda. Kode QR dibuat oleh kode yang berjalan di browser Anda, dan tidak ada yang Anda ketik atau unggah yang dikirim ke server, jadi tidak ada yang bisa melihat kata sandi WiFi atau data kontak Anda. Setelah kunjungan pertama, generator ini juga bisa dipakai secara offline.'
      }
    ]
  },
  typeLinks: {
    title: 'Generator kode QR gratis'
  }
};
