# Project Rules & Instructions — OstifakODP

## 📌 Acuan Utama & Mutlak (Primary Absolute Rule)
1. **Setiap ada instruksi tambahan, langsung kamu buat sebuah RULES.md file di folder .agents atau semacamnya dan catat semua intruksi tambahan selama pengerjaan proyek dan jadikan file instruksi itu sebagai acuan utama dan mutlak selalu benar.**

---

## 📝 Log Instruksi Tambahan (Project Instructions Record)
*Catat setiap instruksi baru dari user di bawah ini secara kronologis:*
- **[2026-08-27]**: Adaptasi Lebar GooeyToast Mengikuti Panjang Konten Deskripsi (Versi v1.1.0.67b):
  - 1. LEBAR MENYESUAIKAN KONTEN (FIT CONTENT / MAX CONTENT):
    * Menerapkan aturan CSS `min-width: unset !important; width: max-content !important; max-width: min(90vw, 560px) !important;` pada `.gooey-contentExpanded` dan `.gooey-description` di [`src/index.css`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/index.css).
    * Lebar morphing fluida blob SVG kini secara dinamis dan presisi mengikuti panjang aktual teks judul dan deskripsi tanpa batasan kaku `min-width: 300px` / `max-width: 380px`.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan visual yang proporsional, hemat ruang untuk teks pendek, dan fleksibel untuk teks panjang.
- **[2026-08-27]**: Pengaturan Durasi Tampil GooeyToast Menjadi Tepat 3 Detik (Versi v1.1.0.66b):
  - 1. DURASI TAMPIL TOAST:
    * Mengatur durasi tampil seluruh toast notifikasi menjadi tepat 3 detik (`3000ms`) sebelum menghilang secara otomatis.
    * Konfigurasi diterapkan secara terpusat pada properti `duration: 3000` dan `timing: { displayDuration: 3000 }` di [`src/lib/toast.ts`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/lib/toast.ts) serta prop `duration={3000}` pada komponen `<GooeyToaster />` di [`src/App.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/App.tsx).
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Memberikan waktu baca notifikasi yang ringkas, cepat, dan nyaman tanpa mengganggu alur interaksi pengguna.
- **[2026-08-27]**: Penghapusan Border Kotak Pembungkus Luar pada GooeyToast (Versi v1.1.0.65b):
  - 1. ELIMINASI BORDER KOTAK (RECTANGULAR WRAPPER):
    * Menghapus properti `toastOptions.style` pada komponen `<GooeyToaster />` di [`App.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/App.tsx) yang sebelumnya menempelkan garis tepi kotak kaku pada elemen pembungkus luar (`[data-sonner-toast]`).
    * Menambahkan reset CSS eksplisit `border: none !important; background: transparent !important; box-shadow: none !important;` pada `[data-sonner-toast]`, `[data-sonner-toaster]`, dan `.gooey-wrapper` di [`index.css`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/index.css).
    * Garis tepi (#E0E0E0, 1.5px) kini murni mengikuti lengkungan organik fluida blob SVG (`.gooey-blobSvg path`) tanpa ada kotak pembungkus kaku di luarnya.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan keaslian estetika morphing organik clean-flat tanpa kontainer bertumpuk (*unboxed*).
- **[2026-08-27]**: Pemberian Border Terlihat (#E0E0E0, 1.5px) pada Seluruh Komponen GooeyToast (Versi v1.1.0.64b):
  - 1. VISIBILITAS BORDER GOOEYTOAST:
    * Dibuat modul pembungkus terpusat [`src/lib/toast.ts`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/lib/toast.ts) yang secara otomatis menyuntikkan properti `borderColor: '#E0E0E0'`, `borderWidth: 1.5`, `bounce: 0.05`, dan `showTimestamp: false` ke seluruh panggilan `gooeyToast` (success, error, warning, info, promise, default).
    * Ditambahkan aturan CSS eksplisit pada `.gooey-blobSvg path` (`stroke: #E0E0E0 !important; stroke-width: 1.5px !important; paint-order: stroke fill !important;`) dan `.gooey-closeButton` di [`index.css`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/index.css) sehingga garis pembatas selalu tampak tegas dan kontras di latar belakang apa pun.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan estetika *clean-flat* dengan batas garis tipis yang presisi.
- **[2026-08-27]**: Perbaikan Bug Posisi & Transformasi GooeyToast saat Muncul (Versi v1.1.0.63b):
  - 1. PERBAIKAN BUG POSISI & TRANSFORM:
    * Menghapus seluruh override CSS `transform: scale(...)` dan `transform-origin` pada `.gooey-wrapper` dan `[data-sonner-toast]` di [`index.css`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/index.css) yang sebelumnya merusak perhitungan rotasi cermin horizontal `scaleX(-1)` internal goey-toast untuk alignment kanan.
    * Mengembalikan kontrol posisi dan stacking toast ke Sonner murni dengan prop `offset="24px"` dan `gap={12}` pada [`App.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/App.tsx).
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Memastikan posisi toast di sudut kanan bawah muncul mulus, stabil, dan presisi tanpa loncatan visual (*visual jump/glitch*) atau teks terdistorsi.
- **[2026-08-27]**: Pembaruan Konfigurasi Komponen GooeyToaster (Versi v1.1.0.62b):
  - 1. KONFIGURASI GOOEYTOASTER:
    * Posisi toaster dipindahkan ke sudut kanan bawah: `position="bottom-right"`.
    * Penutupan toast via tombol keyboard Escape dinonaktifkan: `closeOnEscape={false}`.
    * Properti styling dan animasi dikonfigurasi presisi:
      - `borderColor: '#E0E0E0'`
      - `borderWidth: 1.5`
      - `bounce: 0.05`
      - `showTimestamp: false`
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan toast notification morphing yang rapi, minimalis, dan selaras dengan standar *clean-flat* tanpa kontainer bertumpuk kaku.
- **[2026-08-27]**: Pemutusan Total Koneksi/Sinkronisasi Cloud & Penghapusan Bar Hijau Sinkronisasi pada Mode Offline (Versi v1.1.0.61b):
  - 1. PEMUTUSAN TOTAL KONEKSI & SINKRONISASI DATABASE CLOUD:
    * Seluruh proses otomatis yang mendeteksi koneksi atau mencoba melakukan sinkronisasi/fetching ke database cloud dinonaktifkan total saat bendera status mode offline aktif (`localStorage.getItem('ostifak_offline_mode') === 'true'`).
    * Bar indikator hijau sinkronisasi database di bagian bawah layar dihapus dan disembunyikan secara permanen selama mode offline berjalan.
    * Seluruh listener real-time Firestore (`asrama`, `kelas`, `pelanggaran`, `proposal`, `santri`, `directives`, `sessions`) dicegah menginisialisasi query snapshot cloud saat mode offline aktif.
  - 2. PENGALIHAN PENUH KE LOCALSTORAGE:
    * Seluruh fungsi baca data (fetch), buat (create), ubah (update), dan hapus (delete) di seluruh modul dialihkan 100% membaca dan menulis secara mandiri ke dalam `localStorage` via [`offlineManager.ts`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/lib/offlineManager.ts).
    * Ikon no-internet berwarna merah di pojok kanan atas header aktif sebagai indikator visual bahwa sistem berjalan 100% lokal dan terisolasi.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan antarmuka, bebas dari popup/bar sinkronisasi yang mengganggu estetika minimalis *clean-flat*.
- **[2026-08-27]**: Penyesuaian Gaya Ikon Putih Murni & Eliminasi Kontainer Lingkaran Dialog Mode Offline (Versi v1.1.0.60b):
  - 1. IKON PUTIH MURNI & TANPA LINGKARAN PENGHALANG:
    * Seluruh ikon pada halaman dialog konfirmasi mode offline ([`LoginPage.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/components/views/LoginPage.tsx)) diubah menjadi **warna putih murni (`text-white`)**, baik ikon utama tanpa internet/wifi di bagian atas maupun ikon-ikon pada daftar informasi rincian izin (HardDrive, ShieldCheck, Zap).
    * Pembungkus lingkaran (*circle wrapper / background*) pada ikon utama tanpa internet/wifi di bagian atas dihapus sepenuhnya, sehingga ikon berdiri sendiri secara bersih dan lapang tanpa kontainer lingkaran penghalang.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan tata letak dialog yang bersih, lapang, unboxed (tanpa kontainer card bertumpuk kaku), menggunakan pemisah garis tipis (*divider* `divide-y divide-white/10`), serta selaras dengan estetika minimalis *clean-flat*.
- **[2026-08-27]**: Implementasi Fitur Mode Offline Lengkap (Halaman Login, Header, & Isolasi LocalStorage 100 MB) (Versi v1.1.0.59b):
  - 1. TOMBOL & DIALOG KONFIRMASI MODE OFFLINE DI HALAMAN LOGIN:
    * Pada halaman login ([`LoginPage.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/components/views/LoginPage.tsx)), ditambahkan sebuah *icon button* di pojok kanan bawah menggunakan ikon tidak ada internet / Wi-Fi disilang (`WifiOff`).
    * Ketika tombol tersebut diklik, menampilkan dialog konfirmasi di tengah halaman yang menyembunyikan seluruh elemen form login, logo, dan tombol utama di belakangnya.
    * Dialog konfirmasi tampil *unboxed* (tidak dibungkus kontainer box kaku) dengan garis pemisah tipis (*thin divider*), meminta persetujuan pengguna untuk masuk ke mode offline dengan alokasi penyimpanan lokal sebesar **100 MB**.
  - 2. ISOLASI TOTAL & PENYIMPANAN LOCALSTORAGE:
    * Ketika mode offline diaktifkan, aplikasi sepenuhnya terisolasi dari internet. Seluruh data sama sekali tidak mengambil atau mengirim dari/ke database cloud Firebase Firestore.
    * Seluruh mekanisme CRUD dan penyimpanan data (santri, pelanggaran, mahkamah, prestasi, asrama, kelas, dan program kerja) dialihkan sepenuhnya ke dalam `localStorage` via [`offlineManager.ts`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/lib/offlineManager.ts).
    * Dipastikan nol perubahan data yang menyentuh server atau database cloud selama mode offline aktif.
  - 3. INDIKATOR VISUAL DI HEADER UTAMA:
    * Pada header pojok kanan atas ([`Header.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/components/layout/Header.tsx)), area tombol avatar profil/akun digantikan dengan ikon **No-Internet berwarna merah** (`WifiOff text-[#EF4444]`) sebagai penanda visual jelas bahwa aplikasi sedang beroperasi dalam mode offline.
    * Pengetukan ikon membuka status popover informasi mode offline dan opsi untuk keluar dari mode offline.
  - 4. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan estetika minimalis *clean-flat*, tanpa kontainer card bertumpuk berlebihan, divider tipis, dan responsif baik di desktop maupun seluler.
- **[2026-08-27]**: Penyesuaian Judul & Format Nilai Leaderboard Prestasi (Versi v1.1.0.58b):
  - 1. PENYESUAIAN JUDUL LEADERBOARD:
    * Pada halaman **'Rekam Jejak Prestasi & Poin Penghargaan'** ([`AchievementsView.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/components/views/AchievementsView.tsx)), judul section *"Top 5 Santri Akumulasi Poin Prestasi (PP)"* diubah menjadi *"Top 5 Santri Akumulasi Poin Prestasi"*.
  - 2. FORMAT NILAI +N PP PADA KARTU:
    * Format nilai poin prestasi pada setiap kartu leaderboard santri ditambahkan tanda tambah `+` sehingga menjadi `+N PP` (menggunakan angka tebal berdampingan dengan ikon `<PPIcon />`).
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan hierarki tipografi clean-flat dan keselarasan visual ikon SVG dinamis.
- **[2026-08-27]**: Perbaikan Bug Teks 'undefined' pada Right Panel ODP (Versi v1.1.0.57b):
  - 1. ELIMINASI BUG 'UNDEFINED' DAN FALLBACK ROBUST:
    * Memperbaiki pemanggilan properti nama santri pada feed aktivitas Right Panel ([`RightPanel.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/components/layout/RightPanel.tsx)) dari `s.nama` menjadi `s.studentName || (s as any).nama || 'Santri'`, mencegah teks `undefined meraih ...` atau `undefined setor ...`.
    * Memastikan seluruh properti dinamis (nama surah, kategori prestasi, prioritas instruksi, progres program kerja, dan nilai kamar) memiliki proteksi null-safety dan fallback default string yang aman.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan rendering teks riil tanpa glitch nilai null/undefined di seluruh modul.
- **[2026-08-27]**: Input Field Nama Santri Form Catat Prestasi Baru Menjadi Searchable Combobox (Versi v1.1.0.56b):
  - 1. SEARCHABLE COMBOBOX SANTRI (NAMA, KAMAR, NIS, KELAS):
    * Pada modal form **'Catat Rekam Jejak Prestasi Baru'** ([`AchievementsView.tsx`](file:///media/fatihfarhat/New%20Volume/PROJECTS/OstifakODP-Verdana/src/components/views/AchievementsView.tsx)), input field nama santri diubah dari `<select>` biasa menjadi **Searchable Combobox**.
    * Pencarian mendukung multi-kriteria: **Nama Santri**, **Kamar**, **NIS**, dan **Kelas**.
    * Hasil pencarian menampilkan nama lengkap, NIS, kelas, dan kamar santri secara jelas dengan scrollable overlay popover, serta mendukung penutupan klik di luar (*outside click*) dan shortcut tombol Escape/Enter.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Desain clean-flat, tanpa ikon dekoratif berlebih, divider tipis, dan responsif di seluler maupun desktop.
- **[2026-08-27]**: Larangan Menampilkan Entitas dengan Nilai PP = 0 dalam Daftar Prestasi Manapun (Versi v1.1.0.55b):
  - 1. FILTERING MUTLAK PP > 0 PADA SELURUH DAFTAR PRESTASI:
    * Seluruh entitas (santri, kamar, asrama, penghargaan, atau entitas lainnya) yang memiliki nilai **PP (Poin Prestasi) = 0** dilarang keras untuk dimunculkan pada daftar/tabel/leaderboard/peringkat prestasi manapun di seluruh aplikasi.
    * **Leaderboard & Direktori Prestasi (`AchievementsView`)**: Top 5 Santri Akumulasi PP dan Tabel Rekam Jejak Prestasi hanya menampilkan santri dan catatan yang memiliki `PP > 0`. Entitas atau catatan dengan 0 PP otomatis terfilter keluar.
    * **Top 5 Santri Teladan & Top 5 Kamar Terbaik (`DashboardView`)**: Santri dengan akumulasi 0 PP atau kamar dengan total nilai 0 PP tidak akan dirender dalam daftar Top Prestasi Dashboard.
    * **Right Panel (`RightPanel`)**: Top Kamar Terbaik dan Activity Feed Prestasi hanya menampilkan kamar dan prestasi dengan `PP > 0`.
    * **Tab Prestasi Profil Santri (`StudentDetailModal`)**: Daftar riwayat penghargaan hanya menampilkan entitas dengan bobot `PP > 0`.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan tampilan clean-flat, divider garis tipis, bebas dari kartu kosong atau data bernilai 0 PP yang tidak relevan.
- **[2026-08-27]**: Integrasi Data Riil Database pada Right Panel 'Info Panel ODP' (Versi v1.1.0.54b):
  - 1. SINKRONISASI 100% DATA RIIL DATABASE:
    * Seluruh data yang ditampilkan pada panel samping kanan (**Info Panel ODP**) bersumber langsung secara real-time dari database Firestore dan bukan data dummy/demo yang hardcoded.
    * **AI ODP Assistant**: Ringkasan eksekutif dan status kedisiplinan dihitung secara dinamis dari data agregat santri, kasus pelanggaran aktif, capaian prestasi, serta riwayat mutaba'ah tahfizh riil di database.
    * **Instruksi Mudir**: Terhubung langsung secara real-time dengan listener koleksi Firestore `directives` (`subscribeToDirectives`), menampilkan instruksi aktif dengan prioritas, tanggal terbit, dan target divisi.
    * **Top Kamar Terbaik / Bersih**: Dihitung dari koleksi data master kamar riil (`rooms`) berdasarkan akumulasi nilai Indah, Rapi, Bersih dengan ikon PP (`<PPIcon />`).
    * **Catatan Aktivitas**: Menampilkan feed riwayat aktivitas riil terbaru yang diagregasikan secara kronologis dari database (kasus pelanggaran baru, perolehan prestasi santri, setoran hafalan mutaba'ah, instruksi mudir, dan program kerja divisi).
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Desain clean-flat, divider garis tipis (`border-b border-[#E2E8F0]`), bebas dari container box bertumpuk, penggantian teks satuan PP/PK dengan ikon SVG (`<PPIcon />`, `<PKIcon />`), dan responsif.
- **[2026-08-27]**: Penggantian Teks Satuan "PP" dan "PK" dengan Ikon SVG Asli (pp.svg & pk.svg) (Versi v1.1.0.53b):
  - 1. PENGGANTIAN SIMBOL PP & PK DENGAN FILE SVG:
    * Mengganti seluruh teks/string satuan "PP" (Poin Prestasi) di kartu ringkasan, tabel, profil santri, dan laporan dengan file ikon SVG **'pp.svg'** (komponen `<PPIcon />`).
    * Mengganti seluruh teks/string satuan "PK" (Poin Pelanggaran) dengan file ikon SVG **'pk.svg'** (komponen `<PKIcon />`).
    * Menyelaraskan ukuran proporsional (inline-block align-baseline/align-middle) langsung berdampingan dengan angka poin.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Menjaga tampilan clean-flat, bebas dari kontainer card bertumpuk, dan konsisten di seluruh perangkat.
- **[2026-08-27]**: Penyesuaian Menu Aksi Kontekstual Responsif Mobile (Action Sheet / Bottom Sheet) (Versi v1.1.0.52b):
  - 1. BOTTOM SHEET / ACTION SHEET KHUSUS MOBILE:
    * Pada perangkat mobile (layar < 768px), pengetukan menu titik tiga (*three-dot*) maupun sentuh-tahan (*tap and hold/contextmenu*) pada baris tabel kasus pelanggaran, prestasi, dan riwayat setoran otomatis memunculkan panel **Bottom Sheet (Action Sheet)** yang meluncur mulus dari bawah layar.
    * Opsi tindakan menggunakan ikon monokrom tunggal berwarna hitam (`text-black`), tipografi clean-flat yang thumb-friendly, dan garis pemisah tipis (*divider* `divide-y divide-[#E2E8F0]`).
  - 2. KEBIJAKAN PLATFORM (DESKTOP VS MOBILE):
    * Tetap mempertahankan floating contextual menu mengambang di samping kursor/tombol pada perangkat desktop, dan otomatis beralih menjadi Bottom Sheet saat diakses melalui perangkat mobile.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Desain Bottom Sheet bersih, backdrop semi-transparan yang responsif terhadap klik untuk menutup, tombol 'Batal' di bagian bawah, dan drag handle indicator di bagian atas.
- **[2026-08-27]**: Rekonstruksi Halaman Login Utama & Halaman Pilih Akun (Versi v1.1.0.51b):
  - 1. REKONSTRUKSI HALAMAN LOGIN UTAMA:
    * **Tombol Pilih Akun**: Dipindahkan ke bagian bawah halaman sebagai *secondary button* berupa teks bersih tanpa kotak pembungkus (*box*).
    * **Form Input Kosong**: Nilai field input username/email dan password secara default kosong saat halaman pertama kali dimuat.
  - 2. REKONSTRUKSI HALAMAN PILIH AKUN:
    * **Tanpa Kontainer & Pemisah Divider**: Menghapus seluruh kontainer kotak/box pembungkus kartu akun; menyusun akun-akun secara lapang hanya dengan garis pemisah tipis (*divider* `divide-y divide-white/10`).
    * **Pembersihan Elemen**: Menghapus seluruh badge/tag, label role pojok kanan bawah ("MUDIR", "PEMBINA", dll.), serta menghapus teks developer dan versi aplikasi di pojok kanan atas.
    * **Informasi Kartu Minimalis**: Setiap entri akun hanya menampilkan **nama akun** dan **email saja**, disertai tanda centang (*checkmark*) pada akun yang aktif dipilih.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan estetika minimalis clean-flat yang bersih, responsif di seluler, dan bebas elemen visual berlebih.
- **[2026-08-27]**: Pembaruan Format Satuan Nilai Metrik "N Juz, N Lbr, N Hal" pada Top Lists Dashboard (Versi v1.1.0.50b):
  - 1. PEMBARUAN FORMAT NILAI METRIK:
    * Mengganti label keterangan lama ("N Halaman Tercatat", "Mutabaah Aktif", "N Halaman Mutqin") pada 5 kartu matriks (Top 5 Hafalan Terbanyak, Top 5 Murojaah Terbanyak Bulan Ini, Top 5 Setoran Terbanyak Bulan Ini, Top 5 Ziyadah Terbanyak Bulan Kemarin, dan Top 5 Muroja'ah Terbanyak Bulan Kemarin) dengan format satuan baku: **"N Juz, N Lbr, N Hal"**.
    * Angka kuantitas (**N**) pada setiap satuan dicetak tebal (**bold**) menggunakan font headline berbobot kuat untuk hierarki visual yang jelas dan konsisten.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan tampilan minimalis clean-flat tanpa kontainer card bertumpuk, divider tipis, dan responsif.
- **[2026-08-27]**: Pembaruan Sistem Perhitungan Poin Prestasi (PP) Kamar, Asrama, Kelas & Rekonstruksi Total Metrik Dashboard (Versi v1.1.0.49b):
  - 1. PEMBARUAN LOGIKA POIN PRESTASI (KAMAR, ASRAMA, & KELAS):
    * **Kategori Kamar**: Setiap kamar memiliki 3 kategori prestasi (**Indah**, **Rapi**, **Bersih**), masing-masing rentang 0-100 PP. Total PP Kamar = Indah + Rapi + Bersih.
    * **Kategori Asrama**: Asrama memiliki 3 kategori prestasi yang sama yang merupakan hasil akumulasi total nilai dari seluruh kamar di asrama tersebut (Total PP Asrama = total Indah + total Rapi + total Bersih seluruh kamar).
    * **Kelas (IPA & IPS)**: Sistem penilaian PP dan PK berlaku untuk kelas 1 sampai 6, di mana kelas IPA dan IPS digabungkan sebagai satu kesatuan kelas yang sama (nilai PK dan PP tidak terpisah).
  - 2. REKONSTRUKSI METRIK & KARTU DI DASHBOARD:
    * **Top 5 Kamar Terbaik**: Menampilkan total akumulasi nilai N PP kamar dari ketiga kategori, disertai rincian nilai PP masing-masing kategori di bawahnya tanpa label tambahan (`indah • rapi • bersih`). Menghapus label lama "Rata-rata... PK / Juz".
    * **Top 5 Santri Teladan**: Nilai metrik yang ditampilkan adalah nilai **PP (Poin Prestasi)** (`+{s.poinPrestasi} PP`), bukan lagi PK.
    * **Top 5 Hafalan Terbanyak & Para Huffazh**: Santri dengan hafalan 30 Juz **tidak ditampilkan** di Top 5 Hafalan Terbanyak, melainkan khusus ditampilkan pada matriks **Para Huffazh**.
    * **Matriks Baru**: Menambahkan dua matriks baru: **'Top 5 Ziyadah Terbanyak Bulan Kemarin'** dan **'Top 5 Muroja'ah Terbanyak Bulan Kemarin'**.
    * **Rekapan & Program Kerja**: Menghapus tombol tersegmentasi (*segmented button*) rekapan, menampilkan langsung matriks **'Rekapitulasi Pelanggaran Santri Terbaru'** dan **'Program Kerja OSTIFAK'** secara berurutan.
    * **Tampilan Program Kerja OSTIFAK**: Mengganti tabel dengan elemen kartu dari halaman tab 'Program Kerja & Proposal Kegiatan', hanya menampilkan **5 teratas dengan progress terbanyak**, tanpa label keterangan/helper tambahan.
  - 3. STATUS PENCATATAN PELANGGARAN / MAHKAMAH:
    * Setiap pencatatan pelanggaran atau sidang mahkamah baru, statusnya default adalah **PROSES** dengan ikon jam (*clock icon*) murni **tanpa label teks**.
  - 4. KEPATUHAN PRINSIP DATA & DESAIN (ANTI-GRAVITY UI):
    * Seluruh data yang dirender pada semua matriks bersumber dari data asli database, desain clean-flat, divider tipis, dan responsif.
- **[2026-08-27]**: Penyesuaian Tipografi Satuan Juz, Lbr., Hal. Menjadi Lebih Kecil & Lebih Transparan (Versi v1.1.0.48b):
  - 1. REFINEMENT TIPOGRAFI SATUAN:
    * Mengubah gaya teks satuan (`Juz`, `Lbr.`, `Hal.`) pada kartu metrik **Capaian Hafalan** dan **Capaian Murojaah** (serta kartu ringkasan setoran) menjadi lebih kecil dan bernuansa transparan / subtle (`text-xs font-normal text-slate-400 font-body`).
    * Angka metrik tetap tebal, kontras tinggi, dan tegas (`text-xl font-bold text-slate-900 font-headline`), menciptakan hierarki visual yang seimbang, nyaman dipandang, dan elegan.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan visual minimalis, whitespace proporsional, dan tata letak responsif.
- **[2026-08-27]**: Pembaruan Logika Perhitungan Capaian Hafalan Otomatis & Rekonstruksi Kartu Metrik "N Juz N Lbr. N Hal." (Versi v1.1.0.47b):
  - 1. PEMBARUAN LOGIKA PENGHITUNGAN CAPAIAN HAFALAN:
    * Setiap catatan setoran dengan kategori **Ziyadah** (Hafalan Baru) dihitung dan dimasukkan secara otomatis ke dalam total **Capaian Hafalan** santri (baik saat menambah setoran baru, mengedit, maupun menghapus setoran).
    * Penghitungan berbasis konversi presisi Mushaf Standar: 1 Juz = 20 Halaman (10 Lembar), 1 Lembar = 2 Halaman.
  - 2. REKONSTRUKSI KARTU METRIK CAPAIAN HAFALAN:
    * Menampilkan rincian lengkap dan akurat dengan format: **"N Juz N Lbr. N Hal."** (contoh: `12 Juz 0 Lbr. 0 Hal.`, `2 Juz 3 Lbr. 1 Hal.`) pada kartu metrik Capaian Hafalan di Tab Hafalan profil santri.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan desain clean-flat 1-row metric cards tanpa kotak card bertumpuk, bebas ikon dekoratif, divider tipis, dan responsif di seluruh resolusi layar.
- **[2026-08-27]**: Pembaruan Sistem Pencatatan Hafalan, Mutaba'ah, Otomatisasi Setoran & Rekonstruksi UI Segmen Hafalan Santri (Versi v1.1.0.46b):
  - 1. PEMBARUAN LOGIKA PENCATATAN & OTOMATISASI SETORAN:
    * **Murojaah Otomatis**: Jika santri menyetorkan ayat yang sebelumnya sudah pernah disetorkan sebagai Ziyadah (Hafalan Baru), sistem secara otomatis mengategorikannya sebagai Murojaah.
    * **Setoran Campuran (Ziyadah + Murojaah)**: Jika santri menyetorkan ayat yang sebagian sudah pernah disetor dan berlanjut ke ayat baru yang belum pernah disetor, opsi jenis setoran otomatis terpilih keduanya pada form dan sistem otomatis memecahnya menjadi 2 entri/aktivitas setoran terpisah (satu Murojaah dan satu Ziyadah).
    * **Validasi Kelulusan Tahsin**: Jika santri belum lulus uji tahsin (`!isTahsinPassed`), tombol tambah catatan mutaba'ah dinonaktifkan (`disabled`) dan menampilkan tooltip "Santri ini belum lulus tahsin".
    * **Rentang Juz Lintas Juz**: Jika ayat yang disetorkan mencakup 2 juz berbeda, menampilkan informasi rentang juz riil dengan format "Juz N-N" (contoh: "Juz 1-2").
  - 2. REKONSTRUKSI METRIC CARDS DI TAB HAFALAN:
    * Menambahkan kartu metrik baru di baris atas dengan judul **"CAPAIAN MUROJAAH"** (akumulasi total yang dimurojaahkan sepanjang waktu sejak masuk pondok). Hanya menampilkan title dan nilai dengan format `N Juz | N.n Lbr` tanpa elemen dekoratif lainnya.
  - 3. FITUR EDIT & HAPUS REKAM SETORAN (CONTEXTUAL MENU & DIALOG):
    * Menambahkan fitur Edit dan Hapus pada kartu record setoran: klik kanan (`onContextMenu`) pada kartu record memunculkan menu opsi kontekstual mengambang (*floating*) tepat di ujung kursor pointer tanpa terpotong batas overflow parent.
    * Menggunakan ikon pensil monokrom tunggal hitam untuk opsi **EDIT** dan ikon tempat sampah monokrom tunggal hitam untuk opsi **HAPUS**, serta menyertakan dialog konfirmasi sebelum mengeksekusi penghapusan setoran.
  - 4. PENYESUAIAN STYLING & CLEAN-FLAT UI:
    * **Kapsul Rekor**: Mengubah gaya kapsul di bawah nama surat pada kartu record setoran menjadi teks biasa dengan gaya tebal (*plain text bold*).
    * **Modul Form Catatan Mutabaah**: Mengeluarkan seluruh elemen form *(Rentang Ayat, Nomor Halaman, Tingkat Kelancaran & Mutaba'ah)* dari kontainer pembungkusnya (*nested-container*) dan menggantinya dengan pembatas garis tipis (*divider*).
    * Mengubah label form **'Nomor Halaman (Mushaf Standar)'** menjadi **'Nomor Halaman'**, serta mengganti info total halaman menjadi teks polos (contoh: `N Hal.`) tanpa dibungkus kapsul.
    * Pada bagian tingkat kelancaran, menghapus elemen kapsul warna kelancaran.
    * Mengubah label form **'Surah Al-Qur'an (114 Surah)'** menjadi **'Nama Surah'**.
    * Mempertahankan prinsip desain minimalis *clean-flat* aplikasi secara keseluruhan.
- **[2026-08-27]**: Header Selalu Tampil Statis Fixed Saat Halaman Detail Santri Terbuka di Mobile (Versi v1.1.0.45b):
  - 1. PERMANEN FIXED TOPBAR HEADER:
    * Mengubah positioning `Header.tsx` menjadi `fixed top-0 inset-x-0 lg:left-[260px] z-40 h-16` dan memberikan offset `mt-16` pada elemen `<main>` di `App.tsx`.
    * Memastikan header utama (OSDIGI, toggle menu hamburger, profil, dan navigasi) selalu tampil permanen di bagian atas layar *mobile* dan tidak pernah tersembunyi atau tertutup saat halaman detail santri dibuka.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Layer detail santri tetap meluncur di area konten tepat di bawah header (`top: 64px`), mempertahankan estetika *clean-flat* yang rapi dan konsisten.
- **[2026-08-27]**: Penggantian Ikon Tombol Penutup Detail Santri Menjadi Ikon Close Tanda Silang (Versi v1.1.0.44b):
  - 1. GAYA IKON CLOSE / TANDA SILANG (ICON-ONLY):
    * Mengganti ikon panah kembali (`ArrowLeft`) pada tombol penutup halaman detail santri di `StudentDetailModal.tsx` menjadi ikon close / tanda silang (`X` dari `lucide-react`).
    * Mempertahankan tombol berbentuk icon-only kotak minimalis hitam (`bg-[#0F172A] text-white`) di samping nama santri yang bersih dan tegas.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Tampilan konsisten, transisi slide responsif keluar tetap berjalan mulus, bebas dari border/card container bertumpuk.
- **[2026-08-27]**: Isolasi Scroll & Posisi Fixed Viewport Transisi Detail Santri Mobile (Versi v1.1.0.43b):
  - 1. ISOLASI SCROLL & POSISI FIXED VIEWPORT MANDIRI:
    * Mengubah kontainer layer detail santri di `StudentsView.tsx`, `DormitoryView.tsx`, dan `ClassesView.tsx` menjadi `fixed inset-x-0 bottom-0 top-16 lg:left-[260px] z-30 bg-[#F8FAFC] overflow-y-auto overscroll-contain data-lenis-prevent`.
    * Kontainer menempel tepat di dalam viewport di bawah header (`top: 64px`), bergerak naik dari luar bawah layar (`translate-y-full` ke `translate-y-0`) secara independen tanpa memengaruhi atau menggeser posisi scroll halaman direktori di latar belakang.
    * Tombol kembali dan seluruh header detail santri langsung berada di bagian atas layar viewport dan mudah diakses.
  - 2. TRANSISI KELUAR & KEPATUHAN DESAIN (ANTI-GRAVITY UI):
    * Saat ditutup, halaman detail bergerak turun (`translate-y-0` ke `translate-y-full`) keluar viewport dengan mulus (650ms, `cubic-bezier(0.4, 0, 0.2, 1)`) tanpa menggeser halaman utama.
    * Header dan sidebar tetap diam di posisinya, bebas efek fading/opacity.
- **[2026-08-26]**: Penyesuaian Durasi 650ms & Arah Transisi Responsif (Desktop Horizontal vs Mobile Vertikal) (Versi v1.1.0.42b):
  - 1. PENYESUAIAN DURASI ANIMASI (+50% LEBIH LAMBAT & HALUS):
    * Memperlambat durasi pergeseran menjadi 650ms (0.65s) dengan kurva *smooth easing* `cubic-bezier(0.4, 0, 0.2, 1)` agar gerakan transisi terasa jauh lebih elegan, tenang, dan santai.
  - 2. RESPONSIVE DIRECTION (DESKTOP HORIZONTAL VS MOBILE VERTICAL):
    * **Desktop / Layar Lebar (>= 768px):** Transisi meluncur dari arah kanan ke kiri (`initial={{ x: '100%', y: 0 }}`) dan kembali ke kanan saat keluar tanpa efek *fading*.
    * **Mobile / Layar Kecil (< 768px):** Transisi meluncur dari arah bawah ke atas (`initial={{ y: '100%', x: 0 }}`) dan meluncur turun kembali ke bawah saat keluar.
  - 3. KEPATUHAN PRINSIP DESAIN & SIMULTANEOUS DUAL-LAYER:
    * Diterapkan secara seragam pada `StudentsView.tsx`, `DormitoryView.tsx`, dan `ClassesView.tsx` menggunakan custom hook `useIsMobile`, menjaga header dan sidebar tetap diam di posisinya.
- **[2026-08-26]**: Optimalisasi Transisi Slide Bebas Blank Screen dengan Render Simultan Dua Layer & Easing 400ms (Versi v1.1.0.41b):
  - 1. PENYESUAIAN DURASI & EASING ANIMASI ALAMI:
    * Mengatur durasi pergeseran (*slide*) menjadi 400ms (0.4s) dengan kurva *smooth easing* `cubic-bezier(0.4, 0, 0.2, 1)` agar transisi terasa sangat halus, natural, dan tidak terburu-buru.
  - 2. SIMULTANEOUS DUAL-LAYER RENDERING (ZERO BLANK SCREEN):
    * Merekonstruksi sistem transisi di `StudentsView.tsx`, `DormitoryView.tsx`, dan `ClassesView.tsx` menjadi arsitektur dua layer yang dirender bersamaan di dalam DOM.
    * Layer direktori dasar selalu aktif terpasang di latar belakang, sementara layer detail santri meluncur di atasnya (`absolute inset-x-0 top-0 z-20 min-h-full bg-[#F8FAFC]`), sehingga saat bergeser masuk maupun keluar tidak ada jeda layar kosong (*blank screen*) walau sepersekian detik.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Header dan sidebar tetap statis, tanpa efek *fading/opacity* sama sekali, dan mempertahankan scroll position direktori secara presisi.
- **[2026-08-26]**: Animasi Transisi Halaman Penuh Slide Masuk & Keluar Detail Santri Tanpa Fading (Versi v1.1.0.40b):
  - 1. ANIMASI MASUK (SLIDE FROM RIGHT, TANPA FADING):
    * Saat kartu santri diklik untuk membuka halaman detail, halaman detail santri meluncur masuk dari luar batas kanan layar (`initial={{ x: '100%' }}` menuju `animate={{ x: 0 }}`) ke dalam area konten utama dengan kurva Apple fluid ease-out (`[0.16, 1, 0.3, 1]`, duration 0.35s) secara tegas dan solid tanpa ada fading/opacity transparan.
    * Header utama di atas dan Sidebar di sebelah kiri tetap diam pada posisinya (hanya area konten `<main>` di sebelah kanan sidebar dan di bawah header yang mengalami pergeseran).
  - 2. ANIMASI KELUAR (SLIDE TO RIGHT, TANPA FADING):
    * Saat tombol kembali diklik, halaman detail santri bergeser keluar menuju ke arah kanan (`exit={{ x: '100%' }}`) dengan mulus dan tegas tanpa fading/opacity sebelum kembali ke direktori santri.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Diimplementasikan konsisten di `StudentsView.tsx`, `DormitoryView.tsx`, dan `ClassesView.tsx`, mempertahankan kebersihan clean-flat tanpa kontainer bertumpuk.
- **[2026-08-26]**: Eliminasi Backdrop Blur & Animasi Diagonal Arrow Shutter pada Tombol Bulat Kartu Santri (Versi v1.1.0.39b):
  - 1. PENGHAPUSAN TOTAL OVERLAY HITAM BLUR:
    * Menghapus total lapisan backdrop hitam blur (`bg-slate-950/60 backdrop-blur-[2px]`) dari seluruh kartu santri di `StudentsView.tsx`, `DormitoryView.tsx`, dan `ClassesView.tsx` agar permukaan kartu tetap bersih dan dapat terbaca langsung saat kursor diarahkan ke kartu.
  - 2. ANIMASI PERGERAKAN IKON DIAGONAL PADA TOMBOL BULAT:
    * Saat kursor mengarah ke kartu (*card hover*), tombol bulat di pojok kanan atas bertransformasi warna menjadi hijau (`group-hover:bg-[#059669] group-hover:border-[#059669] group-hover:text-white`).
    * Menerapkan animasi pergerakan diagonal: ikon panah aktif meluncur keluar ke arah atas-kanan (`translate-x-4 -translate-y-4`), dan secara bersamaan ikon panah baru meluncur masuk dari arah diagonal bawah-kiri (`group-hover:translate-x-0 group-hover:translate-y-0`) dengan masking rapi di dalam lingkaran `overflow-hidden`.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Desain kartu kembali ke format minimalis clean-flat murni tanpa penutup pandangan, transisi sangat halus dan elegan.
- **[2026-08-26]**: Penyesuaian Posisi Absolut Overlay Kartu Santri Full Bounding Box Bebas Hambatan Padding (Versi v1.1.0.38b):
  - 1. PENYESUAIAN POSISI ABSOLUT OVERLAY (FULL BOUNDING BOX):
    * Merekonstruksi hierarki DOM kartu santri di `StudentsView.tsx`, `DormitoryView.tsx`, dan `ClassesView.tsx` dengan memisahkan kontainer terluar `relative overflow-hidden p-0` dari pembungkus konten dalam yang memiliki padding (`p-6` / `p-3`).
    * Menetapkan posisi overlay hover secara absolut langsung terhadap kontainer terluar dengan `inset: 0` (`top: 0, bottom: 0, left: 0, right: 0`), sehingga backdrop menutup 100% permukaan kartu santri secara rapat hingga ke border dan sudut terbawah tanpa terpotong padding kontainer.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Efek hover shutter transisi tetap mulus, presisi, bebas artefak visual, dan selaras dengan estetika minimalis clean-flat.
- **[2026-08-26]**: Penutupan Penuh Backdrop Card Hover Santri Tanpa Celah Bawah (Versi v1.1.0.37b):
  - 1. PENUTUPAN BACKDROP CARD SEPENUHNYA:
    * Mengatasi celah kosong di bawah kartu santri saat hover dengan menerapkan `-inset-1 rounded-[inherit]` dan penyesuaian flex layout `flex flex-col justify-between h-full` pada kartu santri (`StudentsView.tsx`, `DormitoryView.tsx`, `ClassesView.tsx`).
    * Lapisan penutup semi-transparan (`bg-slate-950/60 backdrop-blur-[2px]`) kini menutupi seluruh permukaan kartu secara presisi hingga ke sudut dan batas border terluar dengan masking `overflow-hidden` yang mulus.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan kebersihan visual minimalis, responsif, dan interaksi shutter hover tombol "Buka Detail Santri" yang elegan tanpa merusak konsistensi layout.
- **[2026-08-26]**: Penambahan Tiga Metrik Kartu Santri (Hafalan | Prestasi | Pelanggaran) & Fleksibilitas Filter/Sorting PP & PK (Versi v1.1.0.36b):
  - 1. PENAMBAHAN METRIK PRESTASI PADA KARTU SANTRI:
    * Memperbarui kartu ringkasan santri di direktori (`StudentsView.tsx`) menjadi 3 kolom metrik simetris dengan garis pemisah tipis (*divider*): **Hafalan | Prestasi | Pelanggaran** (menampilkan kuantitas Juz Hafalan, akumulasi Poin Prestasi `+X PP`, dan akumulasi Poin Pelanggaran `X PK`).
  - 2. PEMBARUAN FILTERING & SORTING KOMPREHENSIF (PP & PK):
    * Menambahkan opsi *sorting* baru: `Prestasi (Tertinggi / Max PP)` dan `Prestasi (Terendah / Min PP)` melengkapi pengurutan nama, kelas, hafalan, dan pelanggaran (PK).
    * Menambahkan filter rentang nilai `Prestasi (PP): Min - Maks` di samping filter `Hafalan (Juz)` dan `Pelanggaran (PK)`.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Desain clean-flat tanpa kontainer card bertumpuk, divider garis tipis yang simetris, bebas ikon dekoratif, dan anti-text-wrapping di perangkat mobile.
- **[2026-08-26]**: Fitur Edit & Hapus Rekam Prestasi serta Pelanggaran dengan Menu Kontekstual & Sinkronisasi Poin (Versi v1.1.0.35b):
  - 1. KOLOM AKSI & MENU KONTEKSTUAL (TITIK TIGA & KLIK KANAN):
    * Menambahkan kolom resmi **AKSI** pada tabel rekam prestasi (`AchievementsView.tsx`) dan tabel rekam pelanggaran (`ViolationsView.tsx`).
    * Menyediakan tombol interaktif titik tiga (`MoreHorizontal`) di setiap baris serta listener klik kanan (`onContextMenu`) yang memicu popover menu opsi kontekstual (Edit dan Hapus) secara presisi dengan boundary guard layar.
  - 2. MODAL FORM EDIT & LOGIKA HAPUS DATA SINKRON:
    * Modal edit data prestasi terhubung langsung dengan pre-fill data awal yang lengkap (judul, kategori, peringkat, bobot PP, tanggal, penyelenggara, keterangan) dan otomatis mengupdate akumulasi poin PP santri di database.
    * Konfirmasi hapus data prestasi dan pelanggaran terhubung langsung secara sinkron dengan database dan otomatis mengalkulasi ulang total poin (**PP** dan **PK**) santri.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan estetika clean-flat murni berbasis divider tipis, anti-text-wrapping (marquee tickers), dan responsif di perangkat mobile.
- **[2026-08-26]**: Penyesuaian Logika Otomasi PP: Pengecualian Santri 30 Juz dari Kategori Hafalan Terbanyak (Versi v1.1.0.34b):
  - 1. PENGECUALIAN UNTUK SANTRI 30 JUZ:
    * Memperbarui fungsi evaluasi predikat bulanan (`calculateMonthlyAwards` pada `achievementAutomationService.ts`) agar santri yang sudah tuntas 30 Juz (Para Huffazh) dikecualikan dari perolehan otomatis poin PP pada kategori "Hafalan Terbanyak" (`juz > 0 && juz < 30`).
    * Kategori "Hafalan Terbanyak" difokuskan secara eksklusif bagi santri yang sedang dalam proses tahfizh aktif yang belum mencapai 30 juz.
  - 2. JADWAL & KETENTUAN OTOMASI BERKALA:
    * Mempertahankan jadwal otomatisasi resmi pada tanggal terakhir setiap bulan pukul 21:00 WIB untuk seluruh predikat prestasi lainnya (Santri Teladan, Setoran Terbanyak, dan Murojaah Terbanyak).
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan gaya tampilan clean-flat, divider tipis, bebas ikon dekoratif, dan anti-text-wrapping di seluruh resolusi layar.
- **[2026-08-26]**: Standardisasi Satuan Poin Pelanggaran (PK), Halaman & Sistem Poin Prestasi Santri (PP), serta Otomasi Poin Bulanan (Versi v1.1.0.33b):
  - 1. STANDARDISASI SATUAN POIN PELANGGARAN ("PK"):
    * Mengganti seluruh teks/string satuan poin penalti pelanggaran dari "Pts" / "Poin" menjadi "PK" (contoh: "10 PK", "20 PK", "0 PK") di seluruh tabel, kartu metrik, toast, modal rekam kasus, dan direktori santri.
  - 2. HALAMAN & SISTEM POIN PRESTASI SANTRI ("PP"):
    * Menambahkan halaman dan tab baru **PRESTASI** (`AchievementsView.tsx`) terintegrasi pada navigasi Sidebar, memuat rekam jejak penghargaan, tabel prestasi clean-flat, dan leaderboard akumulasi Poin Prestasi (**PP**).
    * Mengubah dan menyelaraskan satuan penghargaan seluruh santri menggunakan format resmi **"PP"** (contoh: "10 PP", "20 PP", "25 PP").
  - 3. SISTEM OTOMASI PENAMBAHAN POIN PP BERKALA:
    * Mengimplementasikan modul otomatisasi (`achievementAutomationService.ts`) yang menjadwalkan penambahan poin PP pada tanggal terakhir di setiap bulan pukul 21:00 WIB.
    * Kriteria otomatisasi predikat:
      - **Santri Teladan**: Top 5 (0 PK + hafalan tertinggi) mendapat +25 PP (Juara 1) dan +20 PP (#2-5).
      - **Hafalan Terbanyak**: Top 5 hafalan tertinggi mendapat +20 PP.
      - **Setoran Terbanyak Bulan Ini**: Top 5 akumulasi setoran mendapat +15 PP.
      - **Murojaah Terbanyak Bulan Ini**: Top 5 akumulasi murojaah mendapat +15 PP.
  - 4. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Desain tabel minimalis clean-flat berbasis garis pemisah vertikal/horizontal tipis, tanpa border kotak bertumpuk, bebas ikon dekoratif, dan anti-text-wrapping di perangkat seluler.
- **[2026-08-26]**: Penataan Tombol Kembali (Icon-Only Back Button) Sejajar Nama Santri (Versi v1.1.0.32b):
  - 1. POSISI DI SAMPING KIRI NAMA SANTRI & GAYA ICON-ONLY:
    * Memindahkan tombol kembali dari baris navigasi atas menjadi sejajar tepat di sebelah kiri nama utama santri pada header halaman detail santri.
    * Mengubah tampilan tombol kembali menjadi **icon-only** minimalis berwarna hitam pekat (`bg-[#0F172A] text-white hover:bg-[#1E293B]`) dengan ikon panah kiri (`ArrowLeft`) tanpa teks tambahan, lengkap dengan `aria-label` dan `title` aksesibilitas.
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Menghilangkan baris navigasi atas yang terpisah sehingga tata letak header menjadi jauh lebih ramping, menyatu secara langsung dengan nama santri dan tombol aksi (Rekam Izin, Pindah Kamar, Pindah Kelas), serta responsif dan anti-text-wrapping di perangkat mobile.
- **[2026-08-26]**: Standarisasi Perataan & Responsivitas Layout Mobile Metric Cards (Versi v1.1.0.31b):
  - 1. RESPONSIVITAS & PERATAAN MOBILE (GRID & DIVIDERS):
    * Merekonstruksi tata letak seluruh barisan Metric Cards pada seluruh halaman aplikasi (`DashboardView`, `StudentsView`, `DormitoryView`, `ViolationsView`, `WorkProgramsView`, `TreasuryView`, `ClassesView`, `DirectivesView`).
    * Pada layar mobile (<768px), metrik otomatis tertata dalam grid simetris 2x2 (dan baris penutup 1 kolom untuk 5 metrik) dengan pembatas garis vertikal dan horizontal (*cross-border dividers*) yang rapi tanpa border patah/terpotong, padding proporsional (`p-3.5 sm:px-5 sm:py-4`), dan angka metrik yang sejajar serta terbaca jelas dalam satu pandangan.
    * Pada layar tablet & desktop (≥768px / ≥1024px), barisan metrik otomatis menyatu menjadi 1 baris kontinum dengan garis pemisah vertikal tipis yang elegan.
  - 2. KEPATUHAN PRINSIP KONSISTENSI (ANTI-GRAVITY UI):
    * Mempertahankan desain minimalis clean-flat murni tanpa kontainer card bertumpuk, bebas dari ikon dekoratif, dan anti-text-wrapping di seluruh ukuran layar ponsel.
- **[2026-08-26]**: Sinkronisasi 100% Real-Time Data Riil Database pada Seluruh Metrik & Peringkat Dashboard (Versi v1.1.0.30b):
  - 1. SINKRONISASI DATA RIIL DATABASE:
    * Memverifikasi dan menyempurnakan seluruh agregasi data pada halaman Dashboard (Metric Cards: Total Santri Aktif, Master Asrama & Kamar, Pelanggaran Pekan Ini, Proposal & Program, dan Rata-rata Hafalan; Peringkat: Top 5 Santri Teladan, Top 5 Kamar Terbaik, Para Huffazh 30 Juz, Top 5 Hafalan Terbanyak, Top 5 Setoran Terbanyak Bulan Ini, serta Top 5 Murojaah Terbanyak Bulan Ini).
    * Menghapus seluruh estimasi formula atau fallback tiruan sehingga seluruh angka, peringkat, dan akumulasi halaman/setoran disinkronkan 100% secara presisi dan real-time dari tabel koleksi Firestore (`santri`, `pelanggaran`, `proposals`, `dormitories`, `rooms`).
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan tata letak clean-flat dengan divider garis vertikal pada barisan metrik, tipografi tebal tanpa ikon dekoratif, dan anti-text-wrapping dengan teks dinamis.
- **[2026-08-26]**: Rekonstruksi Komponen Detail Santri Menjadi Halaman Penuh (Full Page View) (Versi v1.1.0.29b):
  - 1. UBAH JADI HALAMAN PENUH (FULL PAGE VIEW):
    * Menghapus seluruh kontainer modal pop-up mengapung, backdrop overlay gelap transparan, batas tinggi modal kaku, dan tombol tutup "Tutup Detail".
    * Merender tampilan profil dan seluruh tab rekam jejak santri (Bio, Hafalan, Pelanggaran, Rekam Mahkamah, Prestasi, dan Riwayat Izin) langsung sebagai halaman penuh (*full view page*) yang aktif di bawah layout navigasi aplikasi.
  - 2. PENYESUAIAN TOMBOL KEMBALI & AKSI:
    * Menyediakan bilah navigasi kembali (*back button*) yang bersih di bagian atas halaman (`← Kembali ke Direktori Santri`) untuk mengarahkan pengguna kembali ke tabel/direktori daftar santri secara instan.
    * Memindahkan aksi fungsional (Rekam Izin, Pindah Kamar, Pindah Kelas) ke bilah aksi header bagian atas secara rapi.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Mempertahankan gaya minimalis clean-flat (tanpa ikon dekoratif di header, garis pemisah tipis *divider*, bebas dari kontainer card bertumpuk, dan responsif anti-text-wrapping di perangkat mobile).
- **[2026-08-26]**: Fitur Interaktif Mouse Wheel Scroll pada Field Angka Hafalan, Poin, & Dropdown Select (Versi v1.1.0.28b):
  - 1. SCROLL WHEEL UNTUK FIELD HAFALAN & ANGKA:
    * Pada field input hafalan juz, filter range angka, poin takzir, serta nomor ayat/halaman, menambahkan event handler `onWheel` dan global wheel dispatcher untuk menaikkan (scroll up / delta < 0) atau menurunkan (scroll down / delta > 0) nilai secara instan saat kursor hover di atas field input numerik, serta mencegah scroll jendela halaman window (`preventDefault`).
  - 2. SCROLL WHEEL UNTUK COMBOBOX & DROPDOWN:
    * Menerapkan fungsionalitas interaksi mouse scroll pada seluruh elemen `<select>` dropdown dan combobox (`App.tsx`) sehingga opsi di dalamnya dapat digeser atau dipilih dengan cepat menggunakan scroll wheel tanpa harus mengklik panah select terlebih dahulu.
  - 3. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Tetap mematuhi standar desain minimalis clean-flat (bebas ikon berlebih, tanpa kontainer card bertumpuk, dan tetap responsif).
- **[2026-08-26]**: Global Anti-Scroll Wheel on Dropdowns & Number Inputs + Global Bottom Loading Bar Overlay (Versi v1.1.0.27b):
  - 1. MATIKAN SCROLL WHEEL GLOBAL PADA DROPDOWN & INPUT NUMERIK:
    * Menerapkan event listener wheel global di level window (`App.tsx`) dengan capture mode untuk otomatis melakukan `.blur()` pada setiap elemen `<select>`, combobox kustom, dan `<input type="number">` saat kursor berada di atasnya, sehingga nilai tidak pernah berubah secara tidak sengaja akibat scrolling mouse.
  - 2. GLOBAL DATA FETCHING LOADING BAR (OVERLAY BOTTOM):
    * Menambahkan bar tipis melintang fixed di bagian paling bawah layar (`fixed bottom-0 left-0 right-0 z-50`) berwarna hijau cerah (`bg-[#22C55E]`) dengan teks hitam tebal (`text-black font-bold`) dan spinner putaran cepat (`animate-[spin_0.45s_linear_infinite]`).
    * Sifat overlay murni: tidak menggeser komponen lain dan tidak memakan ruang layout aplikasi, muncul otomatis saat data sedang dimuat/disinkronkan dan hilang secara mulus setelah sinkronisasi selesai.
- **[2026-08-26]**: Perbaikan Fungsional Input Hafalan & Anti-Scroll Wheel Blur (Versi v1.1.0.26b):
  - 1. MATIKAN EFEK MOUSE SCROLL PADA INPUT NUMBER:
    * Cegah nilai numerik berubah secara tidak sengaja saat mouse wheel scroll di atas input field dengan menambahkan event handler `onWheel={(e) => e.currentTarget.blur()}` pada seluruh input numerik (Total Hafalan Al-Quran Juz, Filter Range Hafalan & Poin, Setoran Ayat & Halaman).
  - 2. KEPATUHAN PRINSIP DESAIN POP-UP & INPUT:
    * Input numerik tetap bersih, responsif diketik manual via keyboard, dan konsisten dengan prinsip Anti-Gravity UI.
- **[2026-08-26]**: Standarisasi Global Desain Pop-Up / Modal (Clean Flat Header, Zero Icon Policy, No Close X Button) (Versi v1.1.0.25b):
  - 1. STANDARISASI GLOBAL POP-UP / MODAL:
    * Header Bersih Tanpa Ikon & Tanpa Tombol Tutup (X): Header modal di seluruh aplikasi hanya memuat judul utama dan sub-judul deskripsi tipografi murni, tanpa ikon dekoratif dan tanpa tombol close "X" di pojok kanan atas (penutupan modal cukup melalui tombol Batal, Tutup Detail, atau shortcut Escape / klik backdrop).
    * Struktur Layout Form & Konten: Menggunakan garis pembatas tipis (`border-b` / `border-t border-[#E2E8F0]`) yang elegan, input field bersih (*clean flat style*), serta tata letak elemen longgar dan bernapas (*breathable*).
    * Anti-Text Wrapping: Tidak ada konten teks yang ter-wrap secara kaku di tampilan mobile maupun desktop.
  - 2. KEPATUHAN MUTLAK PRINSIP ANTI-GRAVITY UI:
    * Zero Icon Policy pada seluruh header dan elemen modal (`Modal.tsx`, `NewViolationModal.tsx`, `DormitoryView.tsx` room modal, `ClassesView.tsx` class modal, `StudentsView.tsx` add/edit/delete modals, `StudentDetailModal.tsx` beserta sub-modals, `LoginModal.tsx`, `SessionRecordsModal.tsx`).
    * No Container Box Berlebih: Bebas dari kontainer card bertumpuk dan bebas dari badge/kapsul dekoratif tidak esensial.
- **[2026-08-26]**: Standarisasi Global Metric Cards (Style Vertical Divider 1-Row) (Versi v1.1.0.24b):
  - 1. STANDARISASI GLOBAL METRIC CARDS (STYLE DIVIDER):
    * Gunakan satu baris metrik terpadu yang dipisahkan menggunakan garis pembatas vertikal tipis (`divide-x divide-[#E2E8F0] py-3.5 border-y border-[#E2E8F0]`) di seluruh halaman aplikasi (Dashboard, Santri, Kamar, Kelas, Bendahara Kas, Pelanggaran, Program Kerja, Instruksi Mudir).
    * Hierarki tipografi konsisten: label kategori kecil uppercase di bagian atas (`text-[10px] sm:text-xs font-semibold text-[#64748B] uppercase tracking-[0.5px]`) dan angka metrik tebal besar di bagian bawah (`text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-headline`).
  - 2. KEPATUHAN PRINSIP DESAIN (ANTI-GRAVITY UI):
    * Seluruh barisan metrik lapang, bernapas (*breathable*), tanpa kotak card pembungkus terpisah-pisah, serta bebas dari seluruh ikon dekoratif.
- **[2026-08-26]**: Sinkronisasi Data Bobot Poin & Kasus Pelanggaran Tabel Rekapitulasi (Versi v1.1.0.23b):
  - 1. SINKRONISASI PEMETAAN DATA POIN & KASUS:
    * Perbaiki fungsi `deriveViolationsFromSantri` & `subscribeToPelanggaran` di `firestoreService.ts` agar poin dan jenis kasus dipetakan secara akurat dari rekam jejak database santri.
    * Sinkronisasi kalkulasi tingkat keparahan (*severity*) secara dinamis menggunakan `getSeverityInfo(v.points)` di kolom kasus pelanggaran dan filter tab.
    * Perbaiki mapping `recordCollectiveMahkamahSession` agar tidak menimpa severity secara hardcode.
  - 2. KEPATUHAN PRINSIP TAMPILAN BERSIH:
    * Pertahankan format tabel clean flat dengan divider tipis, anti-text wrapping dengan `RunningText` marquee pada mobile & desktop, tanpa icon dekoratif, dan tipografi mono pada kolom poin (+{pts} Pts).
- **[2026-08-26]**: Sinkronisasi Logika Severity & Interactive Slider Bobot Poin (Versi v1.1.0.22b):
  - 1. CENTRALIZED SEVERITY UTILS (`src/lib/severityUtils.ts`):
    * Fungsi `getSeverityInfo()` terpusat: 1-12 Ringan, 13-25 Sedang, 26-38 Berat, 39-50 Sangat Berat.
    * Fungsi `sliderFillPercent()` untuk konsistensi gradient slider di seluruh form.
    * Eliminasi duplikasi `getSeverityInfo` dari `NewViolationModal.tsx`, `ViolationsView.tsx`.
  - 2. INTERACTIVE SLIDER di `CollectiveMahkamahView.tsx`:
    * Ganti input angka biasa menjadi range slider (1-50) dengan RollingNumber + severity label real-time.
    * Threshold milestones teks di bawah slider berubah bold/warna sesuai posisi.
  - 3. ANTI-GRAVITY UI: Slider tanpa kontainer card box berlebih, tanpa ikon dekoratif.
- **[2026-08-26]**: Pembersihan Unused State & Perbaikan Runtime Error Sidang Mahkamah Kolektif (Versi v1.1.0.21b):
  - 1. BERSIHKAN VARIABEL STATE MODAL:
    * Hapus total seluruh referensi lama `isCollectiveModalOpen`.
    * Gunakan standard sub-view routing `currentView === 'collective-trial'` untuk transisi halaman penuh.
  - 2. ELIMINASI UNUSED MODAL COMPONENT:
    * Hapus file modal lama `CollectiveMahkamahModal.tsx` dan pastikan zero unused state / broken handlers.
- **[2026-08-26]**: Rekonstruksi Sidang Mahkamah Kolektif Menjadi Full View Page (Bukan Modal Popup) (Versi v1.1.0.20b):
  - 1. UBAH JADI HALAMAN PENUH:
    * Hapus total kontainer modal dialog/backdrop popup overlay (`fixed inset-0`).
    * Render sebagai full page view menyatu di bawah layout header dashboard.
  - 2. TOMBOL KEMBALI & AKSI:
    * Ganti tombol tutup modal dengan tombol navigasi "← Kembali ke Rekapitulasi" dan aksi simpan yang otomatis kembali ke halaman sebelumnya.
  - 3. KEPATUHAN ANTI-GRAVITY UI:
    * Zero Icon Policy (tanpa ikon dekoratif di header/kategori), judul besar tebal tanpa numbering, flat horizontal divider, dan layout lapang tanpa box berlebihan.
- **[2026-08-26]**: Standarisasi Styling Tabel Bersih Seluruh Modul (Divider-Based, Anti-Wrapping Running Ticker, Kolom TANGGAL Dua Baris, Anti-Gravity UI) (Versi v1.1.0.19b):
  - 1. STANDARISASI GLOBAL TABEL:
    * Seluruh tabel di semua modul menggunakan flat divider layout tanpa border kotak kaku.
    * Anti-text wrapping di mobile & desktop dengan max-width kolom tegas dan running text marquee looping (`RunningText`).
    * Kolom tanggal dinamai tegas "TANGGAL" dengan konten 2 baris (Baris 1 Nama Hari, Baris 2 Tanggal Lengkap).
  - 2. KEPATUHAN ANTI-GRAVITY UI:
    * Zero Icon Policy (tanpa ikon di sel status/baris tabel) dan No Badges/Capsules (plain text color-coded).
- **[2026-08-26]**: Penyempurnaan Modal Form Transaksi Kas Baru (Toggle Button, Custom UI Date, Thousand Separator Prefix, No Header Close Button) (Versi v1.1.0.18b):
  - 1. TOGGLE BUTTON JENIS TRANSAKSI:
    * Ganti dropdown dengan toggle button clean-flat murni teks tanpa ikon: MASUK dan KELUAR.
  - 2. INPUT TANGGAL TRANSAKSI:
    * Gunakan input tipe date yang selaras dan bersih, otomatis mengonversi ke format penanggalan ID.
  - 3. FORMAT NOMINAL KAS (PREFIX RP & THOUSAND SEPARATOR):
    * Prefix "Rp" tersemat permanen di dalam input dan otomatis memformat ribuan titik secara realtime (misal: Rp 15.000.000).
  - 4. HAPUS TOMBOL TUTUP HEADER:
    * Hapus tombol Tutup di header modal sesuai Anti-Gravity UI, ditutup via Batal atau Escape key.
- **[2026-08-26]**: Format Kolom Tanggal Dua Baris & Running Ticker Anti-Wrapping Tabel Kas (Versi v1.1.0.17b):
  - 1. ATURAN LEBAR KOLOM & ANTI-WRAPPING:
    * Dilarang keras terjadi multi-line wrapping pada sel tabel ledger kas.
    * Terapkan batas max-width tegas dan running text marquee animation jika teks melebihi lebar sel (`RunningText`).
  - 2. FORMAT KOLOM TANGGAL DUA BARIS:
    * Header kolom dinamai "TANGGAL".
    * Data dibagi 2 baris: Baris 1 Nama Hari (Rabu, Kamis, dll.), Baris 2 Tanggal Lengkap (26 Agustus 2026).
  - 3. KEPATUHAN ANTI-GRAVITY UI:
    * Clean flat divider layout tanpa kotak kaku, tanpa ikon, dan tanpa badge warna-warni.
- **[2026-08-26]**: Pengembangan Modul Bendahara (BPH & Kas Organisasi) (Versi v1.1.0.16b):
  - 1. HEADER & METRIK FINANSIAL:
    * Judul "BPH & Kas Organisasi" berfont besar dan tebal tanpa ikon.
    * 4 metrik unboxed finansial murni tipografi: Saldo Kas Saat Ini, Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini, Kas Belum Tertagih / Piutang.
  - 2. FITUR PENCATATAN & TRANSAKSI KAS:
    * Tombol aksi di kanan atas untuk form transaksi baru (Tanggal, Jenis Masuk/Keluar, Nominal, Keterangan, Divisi).
  - 3. TABEL RIWAYAT ARUS KAS (LEDGER):
    * Tabel riwayat transaksi dengan garis tipis (*divider*), filter rentang waktu (Bulan Ini, 3 Bulan Terakhir, Semua Waktu), dan kolom pencarian.
  - 4. KEPATUHAN MUTLAK ANTI-GRAVITY UI:
    * Zero Icon Policy (tanpa ikon dekoratif).
    * No Container Box (unboxed & whitespace luas).
    * No Badges/Capsules/Tags (plain text tanpa warna badge mencolok).
- **[2026-08-26]**: Perbaikan Bug toLocaleString pada Budget Program Kerja Dashboard (Versi v1.1.0.15b):
  - 1. FIX BUDGET FORMATTING:
    * Gunakan fungsi helper `formatBudgetRatio(p.budget, p.progress)` yang aman dan konsisten pada tabel program kerja di `DashboardView.tsx` untuk mencegah error runtime undefined `p.budgetSpent.toLocaleString`.
- **[2026-08-26]**: Perombakan Total Dashboard Utama (Tanpa Ikon, Header Bold Besar, Top List Analitik Real Database, Anti-Gravity UI) (Versi v1.1.0.14b):
  - 1. PENGHAPUSAN IKON & TIPOGRAFI HEADER BESAR BOLD:
    * Hapus seluruh ikon dekoratif pada setiap judul kategori/section informasi di dashboard.
    * Perbesar ukuran font judul section menjadi lebih besar dan tebal (`text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight font-headline`).
  - 2. STRUKTUR TOP LIST & STATISTIK REAL DATABASE:
    * Baris 1: Top 5 Santri Teladan & Top 5 Kamar Terbaik (2 kolom berdampingan).
    * Baris 2: Para Huffazh (Santri 30 Juz) & Top 5 Hafalan Terbanyak (2 kolom berdampingan).
    * Baris 3: Top 5 Setoran Terbanyak Bulan Ini & Top 5 Murojaah Terbanyak Bulan Ini (2 kolom berdampingan).
  - 3. KEPATUHAN MUTLAK PRINSIP ANTI-GRAVITY UI:
    * Dilarang menggunakan box/card container, badge, kapsul warna-warni, atau shadow tebal.
    * Gunakan garis pembatas tipis (`divider`), whitespace luas (*breathable*), dan tipografi teks polos terstruktur.
- **[2026-08-26]**: Header Teks OSDIGI Google Sans Flex Black & Sidebar Logo SVG Only (Versi v1.1.0.13b):
  - 1. HEADER UTAMA:
    * Hapus logo SVG di Header. Tampilkan teks nama aplikasi "OSDIGI" menggunakan tipografi murni dengan font Google Sans Flex Black (`font-['Google_Sans_Flex','Google_Sans','Plus_Jakarta_Sans',sans-serif] font-black`).
  - 2. SIDEBAR UTAMA:
    * Hapus teks "OSDIGI" di bagian atas Sidebar. Tampilkan hanya file `logo.svg` secara eksklusif sebagai identitas visual utama dengan ukuran yang proporsional dan rapi.
- **[2026-08-26]**: Penghapusan Footer Password Default di Halaman Login (Versi v1.1.0.12b):
  - 1. HAPUS FOOTER HELPER PASSWORD:
    * Hapus seluruh teks "Password Default Semua Akun: ostifak1234" di bagian bawah form login `LoginPage.tsx` agar form bersih dan rapi.
- **[2026-08-26]**: Hapus Teks OSDIGI & Logo Putih 100% Lebih Besar Tanpa Glow/Kontainer (Versi v1.1.0.11b):
  - 1. HAPUS TEKS OSDIGI:
    * Hapus sepenuhnya teks judul "OSDIGI" di bawah logo.
  - 2. LOGO PUTIH TANPA GLOW & TANPA KONTAINER:
    * Logo `logo.svg` berwarna putih bersih (`brightness-0 invert opacity-90`), tanpa kontainer box/border pembungkus, dan tanpa efek glow/drop-shadow berpendar.
  - 3. UKURAN 100% LEBIH BESAR:
    * Ukuran logo diperbesar 2x lipat (100% lebih besar) menjadi `w-32 h-32 sm:w-40 sm:h-40` pada tata letak floating centered terpadu.
- **[2026-08-26]**: Revert Tampilan Halaman Login ke Semula (Versi v1.1.0.10b):
  - 1. RESTORE ORIGINAL LAYOUT:
    * Kembalikan tata letak `LoginPage.tsx` ke tampilan awal yang centered floating terpadu (logo, judul OSDIGI, tagline, form input, dan tombol aksi dalam satu kesatuan layout terpusat).
- **[2026-08-26]**: Penyesuaian Penurunan Posisi Logo Halaman Login (Versi v1.1.0.9b):
  - 1. TURUNKAN POSISI LOGO DARI ATAS:
    * Turunkan posisi `logo.svg` agar tidak terlalu mepet ke tepi atas layar (tambahkan padding top yang seimbang `pt-12 sm:pt-18` sehingga berada di posisi atas-tengah yang proporsional dan harmonis).
- **[2026-08-26]**: Pemisahan Tata Letak Top-Centered Logo & Middle-Bottom Form pada Halaman Login (Versi v1.1.0.8b):
  - 1. AREA LOGO (TOP-CENTERED):
    * Posisikan elemen `logo.svg` bersama subjudulnya di area bagian atas layar secara terpusat (`pt-8 sm:pt-12 flex flex-col items-center text-center`).
  - 2. AREA FORM LOGIN (CENTERED / MIDDLE-BOTTOM):
    * Posisikan keseluruhan blok form (field email, password, tombol MASUK & PILIH AKUN) di area tengah-bawah layar secara terpusat (`w-full max-w-sm sm:max-w-md mx-auto pb-8 sm:pb-12`).
  - 3. STRUKTUR FLEXBOX UTAMA:
    * Gunakan `flex flex-col items-center justify-between min-h-[100dvh]` dengan pembagian spasi yang responsif agar konsisten di desktop dan mobile.
- **[2026-08-26]**: Tata Letak Centered Mobile, Logo Lebih Tinggi & Hapus Efek Glow (Versi v1.1.0.7b):
  - 1. POSISI FORM & TOMBOL CENTERED DI MOBILE:
    * Pada tampilan layar mobile, atur agar keseluruhan blok form (field email, password, tombol MASUK & PILIH AKUN) berada persis di tengah vertikal dan horizontal (`flex flex-col items-center justify-center min-h-[100dvh]`).
  - 2. NAIKKAN POSISI LOGO LEBIH TINGGI:
    * Posisikan elemen `logo.svg` jauh lebih tinggi di atas form input agar tercipta ruang napas (*whitespace*) yang proporsional dan tidak berhimpitan dengan teks subjudul.
  - 3. HAPUS EFEK GLOW SECARA GLOBAL:
    * Hapus seluruh properti CSS glow, pendaran cahaya, drop-shadow berpendar, atau box-shadow terang di seluruh komponen halaman login (clean-flat minimalist murni).
- **[2026-08-26]**: Penghapusan Info Password Default di Halaman Login (Versi v1.1.0.6b):
  - 1. HAPUS FOOTER HELPER PASSWORD:
    * Hapus teks "Password Default Semua Akun: ostifak1234" pada `LoginPage.tsx` agar form login lebih bersih dan aman.
- **[2026-08-26]**: Unboxed Clean Logo & Posisi Naik pada Halaman Login (Versi v1.1.0.5b):
  - 1. HAPUS KOTAK KONTAINER LOGO:
    * Hapus total kontainer box/border/background pembungkus logo di `LoginPage.tsx`. Logo SVG tampil *clean* langsung menyatu di atas background tanpa kotak gelap.
  - 2. PERBESAR DIMENSI & NAIKKAN POSISI:
    * Perbesar ukuran `logo.svg` secara signifikan (`w-32 h-32 sm:w-40 sm:h-40`).
    * Naikkan posisi logo lebih tinggi dengan margin bawah yang lapang (`mb-10 sm:mb-12`) agar memberikan ruang napas (*whitespace*) yang lega terhadap kolom input di bawahnya.
- **[2026-08-26]**: Rekonstruksi Halaman Login (Hapus Teks OSDIGI, Styling Logo SVG & Animasi Masuk, Versi v1.1.0.4b):
  - 1. HAPUS TEKS OSDIGI:
    * Hapus sepenuhnya teks judul "OSDIGI" di bawah logo untuk mencegah redundansi visual.
  - 2. STYLING LOGO SVG (`logo.svg`):
    * Perbesar ukuran logo agar lebih proporsional dan menonjol (`w-24 h-24 sm:w-28 sm:h-28`).
    * Ubah warna menjadi putih bersih dengan sedikit transparansi (`brightness-0 invert opacity-80` / `drop-shadow`).
    * Tambahkan efek latar belakang blur tipis (*backdrop-blur*) halus di sekitar area logo.
  - 3. ANIMASI MASUK (*ENTRANCE ANIMATION*):
    * Terapkan animasi masuk halus (*fade-in* + *slide-up*) saat pertama kali dimuat pada seluruh kontainer form login.
- **[2026-08-26]**: Info Metadata Aplikasi & Developer di Pojok Kanan Atas Halaman Login (Versi v1.1.0.3b):
  - 1. POSISI & KONTEN METADATA:
    * Pada layar login (`LoginPage.tsx`), letakkan teks info di sudut kanan atas (`absolute top-4 right-4 sm:top-6 sm:right-6`).
    * Memuat versi aktif (`v1.1.0.3b`) dan nama pembuat (`Fatih Farhat Asshidiq`).
  - 2. GAYA VISUAL MINIMALIS:
    * Tipografi teks polos bersih, transparan (`text-white/40 text-xs tracking-wider`), tanpa kontainer kotak card border atau background kapsul.
- **[2026-08-26]**: Halaman "SIAPA AKU" & Aturan Global Auto-Versioning (BETA Format):
  - 1. MENU SIDEBAR "SIAPA AKU":
    * Tautan menu bertuliskan "SIAPA AKU" diletakkan tepat di paling bawah sidebar navigasi utama.
    * Sesuai Global Anti-Gravity Rules: Tampil bersih tanpa kontainer box/card dan tanpa ikon dekoratif (plain text tipografi yang rapi).
    * Ketika diklik, membuka halaman full-content view yang bersih, minimalis, unboxed, dan breathable.
  - 2. KONTEN HALAMAN "SIAPA AKU":
    * Developer Profil: Fatih Farhat Asshidiq (Alumni Pondok Pesantren Tahfizh Fajrul Karim, Angkatan ke-7 / INGENIOUS GENERATION).
    * Deskripsi App: OSDIGI — Portal Manajemen Santri & Organisasi Santri Pondok Pesantren Fajrul Karim.
    * Framework & Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Firebase Firestore & Realtime Sync, Framer Motion, Lenis Smooth Scroll, Goey Toast, OGL Canvas/WebGL.
    * Bar Distribusi Bahasa: Horizontal multi-segment bar visual yang menampilkan persentase distribusi bahasa pemrograman proyek.
    * Versi Aplikasi: Menampilkan versi aplikasi saat ini secara transparan.
  - 3. ATURAN GLOBAL AUTO-VERSIONING (BETA FORMAT):
    * Setiap kali ada perubahan major, minor, fitur baru, refactoring, atau bug fixing, nomor versi aplikasi **WAJIB terperbarui secara otomatis** di sistem/metadata aplikasi (`src/config/version.ts` dan `package.json`).
    * Format versi **WAJIB selalu menggunakan pola 4-digit BETA diakhiri huruf 'b'** (contoh: `v1.1.0.2b`, berurutan `v1.0.0.1b`, `v1.0.0.2b`, `v1.1.0.0b`, `v1.1.0.1b`, `v1.1.0.2b`, dst.).
- **[2026-08-26]**: Konfigurasi Aset Logo Berdasarkan Kebutuhan Platform:
  - 1. FAVICON & IN-APP LOGO (GUNAKAN `logo.svg`):
    * HTML Favicon: `<link rel="icon" href="/logo.svg" type="image/svg+xml">` di `index.html`.
    * In-App Visuals: Seluruh elemen logo visual di dalam antarmuka (halaman login `LoginPage.tsx` dan sidebar `Sidebar.tsx`) menggunakan `/logo.svg`.
  - 2. PWA INSTALLED APP ICON (PERTAHANKAN `logo.png`):
    * Web Manifest / PWA: Ikon untuk manifest aplikasi seluler (`manifest.json` / `site.webmanifest`) tetap merujuk pada `logo.png` demi kompatibilitas penuh sistem operasi Android dan iOS.
- **[2026-08-26]**: Ringkasan Metrik Halaman Per-asramaan (1 Row & Unboxed):
  - 1 ROW METRIK RINGKASAN: Metrik ringkasan (Asrama Terdaftar, Total Kamar, Total Kapasitas) pada halaman Sistem & Manajemen Per-asramaan ditata sejajar dalam 1 baris (`grid grid-cols-3`).
  - UNBOXED DENGAN DIVIDER: Menghilangkan kartu/kontainer pembungkus card, hanya dipisahkan dengan garis pembatas/divider vertikal (`divide-x`) dan horizontal (`border-y`).
- **[2026-08-26]**: ATURAN GLOBAL MUTLAK — MINIMALISASI EKSTREM ELEMEN DEKORATIF & STANDAR MODAL POPUP:
  - 1. HEADER MODAL BERSIH TANPA IKON:
    * Setiap kali membuat modal/popup dialog baru, bagian header judul modal wajib bersih tanpa ikon pendamping sama sekali (hanya judul teks dan tombol close `X`).
  - 2. KATEGORI TANPA NUMBERING & LABEL TEGAS:
    * Label kategori/bagian pada form dilarang menggunakan penomoran ("1.", "2.", "3.").
    * Gunakan label teks yang lebih besar, tebal, jelas (`text-sm font-bold text-[#0F172A]`), dan dipisahkan dengan garis pembatas tipis yang tegas (`border-t border-slate-200`).
  - 3. DAFTAR SCROLLABLE DENGAN EDGE SHADOW & NO-SCROLLBAR:
    * Area daftar pilihan (seperti picker santri/kamar/kelas) wajib memiliki batasan tinggi (`max-h-*`), dapat di-scroll secara halus tanpa scrollbar visual (`no-scrollbar`), dan dilengkapi efek bayangan tepi atas & bawah (*edge shadow / fade effect*).
  - 4. MODAL NEAR-FULLSCREEN:
    * Dialog modal kompleks wajib memiliki tinggi maksimal / nyaris fullscreen (`h-[92vh] max-h-[94vh] max-w-5xl`) agar konten di dalamnya lega dan tidak memicu double scrolling pada halaman.
  - 5. ATURAN PERMANEN ANTI-DEKORATIF & CLEAN-FLAT:
    * Minimalisir ekstrem penggunaan ikon di seluruh antarmuka aplikasi.
    * Hapus total penggunaan kontainer card/box pembungkus bertumpuk. Gunakan desain clean-flat / underline-based.
    * Larangan keras menggunakan tag, kapsul, atau badge warna-warni berlebih. Gunakan tipografi bersih, teks polos (*plain text*), atau garis pemisah tipis.
- **[2026-08-26]**: ATURAN GLOBAL MUTLAK — DEFAULT PRIORITAS: IKON BUTTON ONLY (TANPA LABEL TEKS):
  - 1. DEFAULT ICON BUTTON ONLY:
    * Setiap kali membuat komponen tombol (button) baru di seluruh bagian aplikasi (header, toolbar, action bar, sub-modul, row table, kartu, filter bar, dll.), standar utamanya **wajib menggunakan Icon Button Only** (hanya ikon tunggal yang bersih tanpa teks label pendamping).
  - 2. PENGECUALIAN AKSI PRIMER KRUSIAL:
    * Kecuali untuk tombol aksi primer yang sangat krusial dan membutuhkan kejelasan teks mutlak (seperti tombol "MASUK", "Simpan Perubahan", "Simpan Sesi", atau "Terbitkan Arahan"), seluruh tombol lainnya wajib berwujud ikon minimalis murni dengan `title`/tooltip atau hover state yang elegan.
  - 3. CLEAN-FLAT & ANTI-CONTAINER OVERLOAD:
    * Dilarang keras membuat tombol dengan label teks panjang yang dibungkus kontainer kotak tebal atau kapsul mencolok. Pertahankan gaya clean-flat tanpa border kontainer yang berlebihan.
- **[2026-08-26]**: Fitur Keyboard Shortcut Global:
  - SHORTCUT `Ctrl + S` / `Cmd + S` (Override Browser Save & Fokus Search Bar):
    * Tangkap event `Ctrl + S` / `Cmd + S` di level window/document, jalankan `e.preventDefault()` agar browser tidak membuka dialog "Save Page As".
    * Arahkan fokus kursor secara otomatis (`focus()`) ke search bar utama aplikasi di header/view aktif agar pengguna bisa langsung mencari data secara instan.
  - SHORTCUT `Esc` (Tutup Modul / Modal Aktif):
    * Tangkap event `Escape` (`Esc`).
    * Jika ada modal aktif, pop-up form, sub-modul (seperti form instruksi, detail santri, sidang mahkamah, dialog konfirmasi, rekam sesi, dll.), tutup modal seketika dan kembalikan tampilan ke layar utama.
- **[2026-08-26]**: Modal Popup untuk Form Penerbitan Instruksi Mudir:
  - OVERLAY DIALOG MODAL:
    * Form penerbitan instruksi Mudir harus berupa popup modal mengapung (`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`), bukan form inline yang disisipkan di dalam dokumen halaman utama.
  - TRIGGER BUKA / TUTUP:
    * Modal hanya muncul saat tombol "Terbitkan Arahan Mudir" diklik (`isModalOpen === true`).
    * Tombol silang `X` di pojok kanan atas modal dan tombol "Batal" menutup modal sepenuhnya.
  - GAYA VISUAL KONSISTEN:
    * Form di dalam modal mempertahankan gaya input bersih, shadow halus, dan tata letak elegan.
- **[2026-08-26]**: Fitur Sidang Mahkamah Kolektif & Integrasi Rekam Jejak Mahkamah Profil Santri:
  - WORKFLOW MAHKAMAH KOLEKTIF:
    * Form input sidang kolektif mendukung multi-select banyak santri (5-10+ santri via searchable tags picker), multi-select divisi terkait (2-3 divisi), input jenis pelanggaran, hukuman, dan tanggal mahkamah (format tanggal saja tanpa jam).
  - SINKRONISASI BATCH / ZERO-LOSS GUARANTEE:
    * Saat sesi mahkamah disimpan, sistem melakukan update batch ke setiap santri terpilih (`mahkamahHistory` dan rekam pelanggaran), tersinkronisasi ke Firestore dan `BroadcastChannel` real-time lintas perangkat.
  - REKAM MAHKAMAH PADA PROFIL SANTRI:
    * Sub-tab "Rekam Mahkamah" pada modal detail santri menampilkan baris tipografi bersih (Divisi, Pelanggaran, Hukuman, Tanggal).
    * Indikator frekuensi rekapitulasi per divisi + filter waktu interaktif (1 Bulan Terakhir, 3 Bulan, Semua Waktu).
  - STANDAR UI/UX CLEAN-SAAS:
    * Whitespace luas, tanpa kontainer card berlebih/badge mencolok, anti-wrapping & anti-overlapping.
- **[2026-08-26]**: Rekonstruksi Halaman & Kartu "Instruksi Mudir":
  - TATA LETAK GRID 2 KOLOM:
    * Gunakan grid dua kolom (`grid grid-cols-1 md:grid-cols-2 gap-6`) sehingga dalam satu baris terdapat 2 kartu instruksi sejajar.
  - DESAIN KARTU MINIMALIS & UNBOXED (SERAGAM ASRAMA/KELAS/SANTRI):
    * Tampil bersih langsung di atas latar belakang tanpa kontainer/kotak border kaku yang berlebihan.
  - STRUKTUR KONTEN KARTU:
    * **Baris Atas (Judul & Tanggal):** Judul di posisi teratas. Jika panjang/berpotensi terpotong, gunakan animasi teks bergerak (*running text / marquee looping*). Tanggal diletakkan sejajar di sebelah kanan judul.
    * **Deskripsi Instruksi:** Ditampilkan bersih di bawah judul tanpa dibungkus kotak box.
    * **Prioritas & Divisi:** Teks prioritas **tebal (bold) tanpa dot/ikon titik**, diikuti informasi divisi dipisah dengan tanda titik tunggal (`·`).
    * **Penerbit & Status:** Nama penerbit di kiri bawah, dan status instruksi di kanan bawah berupa **plain text biasa** tanpa background badge/kontainer.
- **[2026-08-26]**: Kosongkan Data Biografi Halusinasi pada Santri Baru & Push Commit:
  - TANPA DATA DUMMY / HALUSINASI:
    * Saat form tambah santri baru diinisialisasi atau disubmit, field data biografi opsional (nomor telepon wali, alamat lengkap, nama wali, domisili, tanggal lahir, dll.) TIDAK boleh diisi data dummy, rekaan, atau halusinasi default.
    * Seluruh field opsional tersebut dibiarkan kosong (*empty string `""` / `undefined`*) jika tidak diisi pengguna secara riil.
  - COMMIT & PUSH KE GITHUB:
    * Lakukan staging, commit dengan pesan `fix: remove placeholder hallucinations for new student bio and update module states`, lalu push ke branch `main` repositori remote.
- **[2026-08-26]**: Halaman Maintenance untuk Seluruh Menu Divisi OSTIFAK:
  - TAMPILAN MINIMALIS & CENTERED:
    * Seluruh route/halaman pada bagian menu "Divisi Ostifak" menampilkan halaman placeholder maintenance bersih di tengah layar (*centered flex*).
    * Elemen utama hanya 2 tanpa card box berlebih:
      1. Ikon Roda Gigi (*Gear* / `Settings`) berukuran sedang/besar dengan animasi putar halus (*spin animation*).
      2. Teks keterangan elegan yang menyatakan bahwa modul/divisi tersebut sedang dalam pengembangan (contoh: "Modul Divisi Sedang Dalam Pengembangan").
  - SERAGAM UNTUK SEMUA 9 DIVISI:
    * Berlaku seragam untuk seluruh menu divisi (Keamanan, Ibadah, Tahfidz, Bahasa, Kebersihan, Kesehatan, BPH & Kas, Saran Digital, dsb.).
- **[2026-08-26]**: Real-time Multi-device Sync untuk Seluruh Modul (Firestore Cloud & Real-time Listeners):
  - SINKRONISASI REAL-TIME CLOUD:
    * Hubungkan seluruh modul data (Santri, Pelanggaran, Proposal Program Kerja, Asrama/Kamar, Kelas, dan Rekam Sesi Login) ke Cloud Firestore real-time listeners (`onSnapshot`) dan `BroadcastChannel` instan.
    * Setiap mutasi data (CREATE, UPDATE, DELETE) disinkronkan langsung ke cloud backend dan disiarkan real-time ke semua perangkat yang sedang terhubung.
  - AUTO-UPDATE & REVALIDATION TANPA REFRESH:
    * Seluruh view dan modul UI memperbarui tampilan secara otomatis seketika saat ada perubahan dari perangkat mana pun.
    * Menggunakan mekanisme *optimistic updates* dan *last-write-wins* untuk memastikan data selalu konsisten.
- **[2026-08-26]**: Perbaikan Blank Screen pada Vercel Deployment & Service Worker:
  - PERBAIKAN PWA SERVICE WORKER: Handler fetch pada `sw.js` diperbaiki agar selalu mengembalikan objek `Response` valid (tidak menghasilkan unhandled undefined response error pada asset bundle).
  - SAFE WEBGL & UNIFORMS: Ditambahkan guard dan error catch pada rendering WebGL background (`GradientWaves.tsx`) untuk memastikan kompatibilitas di seluruh browser mobile/desktop.
  - ROBUST ROOT MOUNTING: Mounting `main.tsx` dipastikan aman dengan error boundary global dan graceful service worker registration.
- **[2026-08-26]**: Konfigurasi Vercel-Ready & Push Repository:
  - VERCEL SPA & PWA ROUTING: Ditambahkan file konfigurasi `vercel.json` dengan dukungan rewrite routing SPA (`index.html`), caching header optimal untuk assets, PWA updates immediate header untuk `sw.js` & `manifest.json`, serta header keamanan browser standar.
- **[2026-08-26]**: Isolasi Swipe Gestures Sidebar dari Scroll Horizontal & Geser Tutup Right Panel:
  - ISOLASI SCROLL ELEMEN HORIZONTAL: Saat pengguna melakukan scrolling pada elemen horizontal (tabel, deretan tab segmented button, daftar kartu/overflow-x), gesture swipe TIDAK akan memicu pembukaan sidebar kiri maupun panel kanan.
  - PEMBUKAAN SIDEBAR MURNI: Sidebar kiri / panel kanan hanya terbuka dengan gesture swipe horizontal saat interaksi terjadi di luar elemen yang terscroll.
  - TUTUP PANEL INFO ODP DENGAN SWIPE KE KANAN: Panel Info ODP (right panel) yang sedang terbuka dapat ditutup dengan menggesernya kembali ke arah kanan (`deltaX > 40`).
- **[2026-08-26]**: Scaling Gooey Toast Normal pada Mobile:
  - STANDAR UKURAN 1.0 PADA MOBILE: Ukuran scaling `gooey-toast` pada tampilan mobile dikembalikan ke ukuran normal (`transform: scale(1)`), mempertahankan posisi top-center yang presisi tanpa perbesaran berlebih.
- **[2026-08-26]**: Segmen Poin & Status Disiplin Pelanggaran:
  - UNBOXED POIN PTS: Bagian ringkasan Poin Pelanggaran ditampilkan secara terbuka/unboxed tanpa pembungkus card kontainer.
  - STATUS PLAIN TEXT TANPA KAPSUL: Status disiplin (Bersih / Taat, Peringatan Ringan, Pembinaan Khusus) disajikan murni sebagai plain text dengan pewarnaan tipografi tanpa kapsul atau latar belakang badge.
- **[2026-08-26]**: Layout Item Rekaman Riwayat Setoran & Mutaba'ah Tahfizh:
  - BARIS 1 (NAMA SURAH): Nama surah disajikan mandiri dalam 1 baris atas.
  - BARIS 2 (KAPSUL JENIS, HALAMAN, & KELANCARAN): Kapsul jenis setoran (Hafalan Baru / Murojaah), kapsul rentang halaman (Hal. X-Y), dan kapsul tingkat kelancaran/predikat ditata berdampingan dalam 1 baris.
  - BARIS 3 (JUZ & MUSYRIF): Menampilkan nomor juz dan nama musyrif/ustadz pembimbing secara ringkas (`Juz N | Nama Ustadz`).
  - SISI KANAN (TANGGAL DD MMMM YY): Tanggal pencatatan diformat dengan pola `DD MMMM YY` (contoh: `26 Agustus 26`) di sisi kanan kartu.
- **[2026-08-26]**: Tombol Catat Setoran Baru Icon-Only:
  - ICON BUTTON TANPA LABEL: Tombol pemicu modal "Catat Setoran Baru" pada tab riwayat hafalan diubah menjadi tombol icon-only (`<Plus />`) berukuran kompak tanpa label teks.
- **[2026-08-26]**: Hapus Icon pada Kartu Metrik Tab Hafalan:
  - TANPA ICON APAPUN: Seluruh kartu ringkasan metrik statistik hafalan (Ziyadah Pekan Ini, Ziyadah Bulan Ini, Murojaah Pekan Ini, Murojaah Bulan Ini) ditampilkan murni teks tanpa ikon atau badge visual tambahan.
- **[2026-08-26]**: Ringkasan Tab Hafalan Santri (1 Row & Tanpa Target Semester):
  - HAPUS KARTU TARGET SEMESTER: Kartu "Target Semester" dihapus dari ringkasan atas tab Hafalan.
  - 1 ROW KARTU RINGKASAN: Kartu "Capaian Hafalan" dan "Status Uji Tahsin" ditata sejajar dalam 1 baris (`grid grid-cols-2`).
  - STATUS LULUS TANPA CEKLIS: Teks "✓ Lulus Tahsin" diganti menjadi "Lulus" secara ringkas tanpa tanda ceklis.
- **[2026-08-26]**: Format Info Santri di Bawah Nama (Header Modal):
  - PEMBATAS PIPELINE (|): Karakter pembatas antar-informasi santri (NIS, Kamar, Kelas) di bawah nama pada header modal menggunakan tanda pipa `|` (bukan bullet `•`).
  - WARNA SERAGAM PUTIH OPACITY 70%: Warna teks informasi diseragamkan seluruhnya menggunakan putih dengan opacity 70% (`text-white/70`), tanpa aksen warna berbeda pada item kamar.
- **[2026-08-26]**: Rekonstruksi Modul Student Detail View:
  - HEADER TANPA ICON: Header modal dibuat bersih tanpa ikon pembuka, menampilkan nama santri dan info NIS/kamar/kelas secara lugas dan elegan.
  - TOMBOL TUTUP BOX MERAH: Tombol silang (`X`) diberi box kontainer warna merah (`bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white`).
  - SEGMENTED BUTTON 1 ROW: Seluruh segmented tab (Bio, Hafalan, Pelanggaran, Prestasi, Riwayat Izin) berada dalam 1 horizontal row tanpa wrap (`flex flex-nowrap`).
  - SCROLLABLE DENGAN SHADOW EDGE: Kontainer tab yang berlebih dapat di-scroll secara horizontal dan dilengkapi efek shadow edge (gradasi fade) di ujung kiri dan kanan sesuai posisi scroll.
  - AUTO-SCROLL FOKUS: Tab yang sedang aktif/dibuka otomatis bergeser (scroll smoothly into view) ke tengah fokus layar.
  - SEGMENTED BUTTON TANPA ICON: Tombol tab dibuat bersih tanpa icon (hanya teks label dan badge poin jika ada).
- **[2026-08-26]**: Hapus Tab Pelanggaran pada Form Tambah Santri Baru:
  - HAPUS TAB PELANGGARAN: Menghapus tab "Disiplin & Pelanggaran" dan bilah tab bar atas pada modal pendaftaran santri baru sehingga fokus murni sebagai formulir Data Pokok & Akademik.
  - FORM TUNGGAL LANGSUNG: Form pendaftaran langsung menyajikan field pokok santri secara bersih, ringkas, dan optimal.
- **[2026-08-26]**: Penyesuaian Tinggi Modal Dinamis saat Keyboard Mobile Muncul:
  - RESPONSIVE TERHADAP VIRTUAL KEYBOARD: Ketinggian kontainer modal menyesuaikan secara real-time saat keyboard virtual mobile muncul/hilang melalui CSS dynamic viewport & VisualViewport API (`--modal-viewport-height` / `h-[calc(var(--modal-viewport-height,100dvh)-8px)]`).
  - GAP/PADDING MINIMAL: Padding luar backdrop dibuat setipis mungkin (`p-1` / 4px gap ke batas atas dan 4px gap ke atas keyboard), memaksimalkan ruang scrollable formulir di layar ponsel saat mengetik.
- **[2026-08-26]**: Rekonstruksi Modal Tambah Profil Santri Baru:
  - HEADER BERSIH: Header modal tanpa icon dan tanpa tagline (hanya judul "Tambah Profil Santri Baru").
  - TOMBOL TUTUP BOX MERAH: Tombol icon silang (`X`) diberi kotak berlatar belakang merah mencolok (`bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white`).
  - FORM FIELD SATU ROW (2 KOLOM):
    * Tanggal Lahir & Domisili dibuat 1 row (`grid grid-cols-2`).
    * Asrama & Kelas dibuat 1 row (`grid grid-cols-2`).
    * Total Hafalan & Status Kelayakan Tahsin dibuat 1 row (`grid grid-cols-2`).
  - SEGMENTED BUTTON (TAB) MERATA & TANPA ICON: Tab navigasi atas ("Data Pokok & Akademik" dan "Disiplin & Pelanggaran") dibuat tanpa ikon dan lebarnya terdistribusi merata 50:50 sesuai lebar kontainer pembungkus (`grid grid-cols-2 w-full`).
- **[2026-08-26]**: Accordion Single-Expand pada Kartu Rekam Sesi Login:
  - HANYA SATU KARTU TERBUKA: Dalam satu waktu, hanya ada maksimal 1 kartu sesi login yang dapat berstatus terbuka/ter-expand (`expandedSessionId`).
  - AUTO-COLLAPSE KARTU LAIN: Membuka rincian satu kartu sesi secara otomatis menutup rincian kartu sesi lainnya yang sebelumnya sedang terbuka.
- **[2026-08-26]**: Batasan Max-Height & Vertical Scrollable Tabel Aksi (Rekam Sesi Login):
  - KONTROL MAX-HEIGHT: Kontainer tabel daftar aksi dibatasi dengan ketinggian maksimal (`max-h-64 sm:max-h-80 md:max-h-96`) dan dibuat scrollable vertikal (`overflow-y-auto`).
  - STICKY TABLE HEADER: Header tabel (`<thead>`) diposisikan `sticky top-0 z-10` dengan background solid sehingga judul kolom tetap terlihat jelas saat baris tabel di-scroll ke bawah.
- **[2026-08-26]**: Penamaan Ringkas Section "METADATA" (Rekam Sesi Login):
  - Ganti judul section metadata teknis menjadi **"METADATA"** secara ringkas, tegas, dan unboxed.
- **[2026-08-26]**: Unboxed Detail Metadata Jaringan & Perangkat Lengkap (Rekam Sesi Login):
  - HAPUS KOTAK KONTAINER: Hilangkan card/box pembungkus ber-border dan ber-background (`bg-white rounded-lg p-4 border border-slate-200 shadow-xs`) pada section "DETAIL METADATA JARINGAN & PERANGKAT LENGKAP".
  - TAMPILAN UNBOXED: Tampilkan grid metadata secara bersih langsung di atas panel rincian sesi tanpa border/kontainer kaku.
- **[2026-08-26]**: Tabel Aksi & Aktivitas Rekam Sesi (Mobile Auto-Width & Running Text Marquee):
  - AUTO-WIDTH DENGAN MAX-WIDTH KONTROL: Lebar tabel menyesuaikan panjang konten (`w-auto min-w-full`) dengan batas kolom maksimal (`max-w-[...]`) yang presisi di mobile.
  - TANPA TEXT WRAPPING: Seluruh teks sel tabel dipaksa dalam satu baris (`whitespace-nowrap`).
  - ANIMASI RUNNING TEXT (TICKER MARQUEE): Teks yang melebihi batas kolom (`isOverflowing`) otomatis bergerak horizontal secara halus dan looping bolak-balik (*running text ticker loop* `@keyframes running-ticker`), memudahkan pembacaan teks panjang di layar ponsel tanpa membuat baris tabel memanjang ke bawah.
- **[2026-08-26]**: Penyempurnaan Tampilan Modul Rekam Sesi Login (Header Minimalis, No Footer, & Icon Toggle):
  - HEADER MINIMALIS: Hanya menampilkan title ("Rekam Sesi Login & Log Aktivitas") tanpa tagline/subtitle.
  - TOMBOL TUTUP ICON ONLY: Menggunakan tombol icon-only tanda silang (`X` / `w-5 h-5`) di pojok kanan atas.
  - HAPUS FOOTER: Menghilangkan total elemen footer bawah (termasuk tombol tutup bawah).
  - TOMBOL RINCIAN SESI ICON ONLY: Mengubah tombol buka/tutup rincian menjadi icon-only dengan panah arrow yang lebih besar (`ChevronDown` / `ChevronUp` `w-6 h-6`).
- **[2026-08-26]**: Modul Rekam Sesi Login Menjadi Full Screen (Bukan Popup Modal):
  - TAMPILAN FULLSCREEN PENUH: Modul rekam sesi login diubah dari modal popup menjadi tampilan layar penuh edge-to-edge (`fixed inset-0 z-50 w-full h-full min-h-[100dvh] bg-white flex flex-col overflow-hidden`).
  - HAPUS BADGE & TEKS TOTAL SESI:
    * Hapus total tag/badge `"AUDIT KEAMANAN & SESI RILL"`.
    * Hapus total teks counter `"Total N Sesi Rill Tercatat"`.
  - HEADER & LAYOUT BERSIH: Header Dark Emerald, toolbar pencarian & filter status, scrollable body rincian log sesi, dan footer terstruktur rapi dengan container `max-w-7xl mx-auto w-full`.
- **[2026-08-26]**: Konfigurasi Progressive Web App (PWA) Penuh:
  - WEB APP MANIFEST (`public/manifest.json`): Disediakan manifest standar PWA dengan `display: standalone`, tema pondok (`theme_color: #142A18`, `background_color: #F8FAFC`), orientasi `portrait-primary`, daftar shortcut navigasi cepat, dan icons multi-resolusi (192x192, 512x512, maskable, apple-touch-icon).
  - SERVICE WORKER (`public/sw.js`): Diimplementasikan Service Worker dengan cache-first/stale-while-revalidate untuk static assets & web fonts, network-first untuk navigasi HTML, dan auto-claim clients tanpa mengganggu realtime sync Firestore.
  - META TAGS PWA (`index.html`): Ditambahkan `<link rel="manifest">`, apple-mobile-web-app tags, theme-color, dan icons di `<head>`.
- **[2026-08-26]**: Nonaktifkan Behaviour Swipe Down to Refresh pada Tampilan Mobile:
  - Terapkan `overscroll-behavior-y: none;` dan `overscroll-behavior: none;` secara global pada `html`, `body`, dan `#root` di `src/index.css`.
  - Mencegah browser mobile (Chrome Android, Safari iOS, dsb.) melakukan reload/pull-to-refresh yang tidak disengaja saat scrolling ke atas tanpa mengganggu scrolling normal konten di dalamnya.
- **[2026-08-26]**: Penggunaan `logo.png` sebagai Icon Utama Aplikasi dan Favicon:
  - Jadikan `logo.png` di root folder sebagai favicon di `index.html` (`<link rel="icon" type="image/png" href="/logo.png" />`).
  - Tampilkan `logo.png` sebagai ikon/logo utama aplikasi pada seluruh antarmuka utama (Sidebar Brand, Mobile Topbar Header, dan Halaman Login).
- **[2026-08-26]**: Posisi Toast (`goey-toast`) di Center-Top & Scaling Lebih Besar:
  - POSISI CENTER-TOP: Seluruh komponen `<GooeyToaster />` diatur dengan `position="top-center"` sehingga popup notifikasi muncul mengambang di bagian tengah atas layar (*center-top*).
  - SCALING LEBIH BESAR: Terapkan scaling lebih besar (`transform: scale(1.18)`, `transform-origin: top center`) dan penyesuaian ukuran font judul serta deskripsi toast agar tampil lebih jelas, proporsional, dan mudah dibaca di atas viewport.
- **[2026-08-26]**: Styling Header Sidebar Brand "OSDIGI" (Center Aligned, No Tagline, Google Sans Black & Ukuran Lebih Besar):
  - POSISI & ALIGNMENT: Teks nama aplikasi "OSDIGI" diatur menjadi rata tengah (*center aligned* `flex items-center justify-center text-center w-full`) di dalam header sidebar.
  - HAPUS TAGLINE: Hapus seluruh teks subtitle/tagline ("Portal Manajemen Santri").
  - TYPOGRAPHY GOOGLE SANS BLACK & LEBIH BESAR: Menggunakan font Google Sans / Plus Jakarta Sans dengan weight Black 900 (`font-['Google_Sans','Product_Sans','Plus_Jakarta_Sans',sans-serif] font-black`) serta ukuran yang lebih besar dan dominan (`text-3xl` / 30px, `leading-none`).
  - MOBILE CLOSE BUTTON: Tombol tutup mobile (`X`) diposisikan `absolute right-4 top-1/2 -translate-y-1/2` agar tidak menggeser posisi teks judul dari tengah.
- **[2026-08-26]**: Pembesaran Ukuran Teks pada Header Utama:
  - Teks judul pada Header Topbar dibuat sedikit lebih besar:
    * Pada tampilan desktop (`hidden lg:block`), teks breadcrumb judul halaman/divisi diperbesar dari `text-base` menjadi `text-lg lg:text-xl font-bold`.
    * Pada tampilan mobile (`lg:hidden`), teks nama aplikasi "OSDIGI" diperbesar dari `text-lg` menjadi `text-xl font-black`.
- **[2026-08-26]**: Git Commit & Push Otomatis:
  - Staging seluruh file perubahan kode (`git add .`).
  - Buat commit dengan pesan: `Update otomatis via Antigravity CLI`.
  - Push ke repositori target `git@github.com:imanecdoche/OstifakODP-Verdana.git` pada branch `main` menggunakan SSH Port 443 yang terkonfigurasi.
- **[2026-08-26]**: Disable Touch Swipe Gestures Ketika Ada Modal / Overlay Aktif:
  - PENGECEKAN MODAL / OVERLAY AKTIF:
    * Deteksi apakah ada modal/dialog/drawer/overlay aktif (baik via React modal state maupun deteksi DOM seperti `[role="dialog"]`, `[data-modal="true"]`, overlay backdrop, dsb.).
  - NONAKTIFKAN SEMENTARA GESTURE SWIPE:
    * Pada event listener gesture swipe di `App.tsx`, jika ada modal yang aktif, batalkan / return early seluruh aksi swipe gesture sehingga tidak membuka/menutup sidebar secara tidak sengaja saat interaksi modal.
    * Setelah modal ditutup, gesture swipe otomatis kembali aktif secara normal.
- **[2026-08-26]**: Hapus Lokasi & Koordinat Fiktif pada Modul Rekam Sesi (Gunakan Data Rill atau Tanda Strip `-`):
  - HAPUS HARDCODED LOKASI / KOORDINAT:
    * Hapus total koordinat fiktif, nama lokasi palsu, dan alamat MAC tiruan dari sistem rekam sesi.
  - ATURAN FALLBACK TANDA STRIP (`-`):
    * Coba ambil koordinat rill via `navigator.geolocation` secara asinkron jika diizinkan.
    * Jika izin lokasi tidak aktif, ditolak, tidak didukung, atau tidak ada data geolokasi rill, wajib mengisi kolom Koordinat GPS, Lokasi Fisik, dan Alamat MAC dengan tanda strip (**`-`**). Dilarang keras membuat data tebakan/halusinasi.
- **[2026-08-26]**: Real Data Logging pada Modul Rekam Sesi Login (Hapus Total Mock/Dummy Data):
  - BERSIHKAN DATA DUMMY / MOCK: Hapus seluruh data dummy / hardcoded palsu dari modul rekam sesi.
  - SISTEM LOGGING REAL-TIME & PERSISTENT (`localStorage`):
    * Catat sesi login rill dari akun yang sedang login ke penyimpanan lokal (`localStorage`).
    * Waktu masuk presisi hingga detik (`HH:mm:ss WIB`).
    * Deteksi rill informasi perangkat (`navigator.userAgent`, OS, browser, resolusi).
    * Hitung durasi sesi aktif secara real-time dan deteksi lokasi/IP jaringan aktif.
    * Catat setiap aksi pengguna (navigasi modul, input pelanggaran, pembuatan program kerja, dll.) secara otomatis ke dalam log aksi sesi aktif.
- **[2026-08-26]**: Fitur Rekam Sesi Login (Settings Dropdown & Near-Fullscreen Modal Tanpa Ikon):
  - OPSI MENU SETTINGS DI HEADER:
    * Pada tombol Settings di Topbar Header, sediakan menu dropdown dengan opsi **"Rekam Sesi Login"**.
  - MODUL REKAM SESI LOGIN (NEAR-FULLSCREEN & BEBAS IKON):
    * Tampilkan modul berukuran hampir satu layar penuh (*near-fullscreen* `w-[96vw] max-w-7xl max-h-[94dvh]`).
    * Seluruh antarmuka modul (judul, tabel, header, status badge, list rincian) harus tampil murni bersih **TANPA IKON**.
  - LOG LENGKAP & EXPANDABLE RIWAYAT AKSI:
    * Mencakup: Tanggal & Hari, Jam Masuk (detik `HH:mm:ss`), Nama PC/Perangkat, Browser & OS, Alamat IP, Alamat MAC, Koordinat & Nama Lokasi, Durasi Sesi, dan Akun Ostifak.
    * Setiap baris log dapat di-expand (*accordion*) untuk menampilkan rincian daftar aksi/aktivitas yang dilakukan selama sesi tersebut.
- **[2026-08-26]**: Input Email dengan Suffix Domain "@ostifak.edu" Otomatis:
  - Pada input field email halaman login, terapkan layout horizontal flex row dengan underline (`border-b border-white/30 focus-within:border-white`).
  - Di sebelah kanan input tampilkan teks suffix permanen **`@ostifak.edu`** berwarna putih redup (`text-white/50`).
  - Input hanya menampung username/prefix (misal: `mulhatalinuh`), dan saat disubmit/login otomatis digabung menjadi `[username]@ostifak.edu`.
- **[2026-08-26]**: Interaksi Fullscreen "Pilih Akun" & Tombol Solid Putih Bersih di Halaman Login:
  - TOMBOL UTAMA LOGIN (MASUK & PILIH AKUN):
    * Seragamkan styling tombol "MASUK" dan "PILIH AKUN" di halaman login utama menjadi kotak solid warna **putih bersih** dengan teks warna **hitam** (`bg-white text-black font-medium rounded-lg h-11 px-4 hover:bg-slate-100 transition-all flex-1 text-center shadow-md active:scale-98`).
  - INTERAKSI FULLSCREEN "PILIH AKUN" (TANPA KOTAK KONTAINER MODAL):
    * Ketika tombol "PILIH AKUN" diklik, sembunyikan seluruh komponen utama halaman login (form login, teks OSDIGI, tagline).
    * Tampilkan daftar pilihan akun memenuhi area layar secara bersih langsung di atas animasi background waves (*clean fullscreen grid list*).
    * Di pojok kiri atas sediakan **Tombol Tutup (Ikon Silang / "X")** untuk kembali ke tampilan login utama.
    * Di pojok kanan atas sediakan tombol **"MASUK"** (kotak solid putih bersih, teks hitam `bg-white text-black font-medium`) untuk langsung masuk setelah memilih akun.
- **[2026-08-26]**: Styling Container Backdrop `<GradientWaves />` Full Viewport Tanpa Batas Ukuran:
  - POSISI & UKURAN ABSOLUTE MENYELURUH:
    * Elemen pembungkus utama komponen `GradientWaves` menggunakan `absolute inset-0 w-full h-full -z-10` (atau `fixed inset-0 w-full h-full -z-10`) tanpa pembatas ukuran lebar (`w-[...]`) atau tinggi kaku yang memotong layar.
  - RESIZE & CANVAS ADAPTIF:
    * Elemen canvas WebGL dan wrapper container dipastikan 100% mengisi seluruh layar (`width: 100%; height: 100%; display: block; position: absolute; inset: 0;`).
- **[2026-08-26]**: Underline Minimalist Login Form Styling (Bottom Stroke Only & Unboxed Action Buttons):
  - INPUT FIELD DENGAN BOTTOM STROKE SAJA:
    * Hilangkan seluruh background kontainer kotak input dan border keliling (outline box).
    * Gunakan gaya underline field murni: hanya garis bawah tipis (`bg-transparent border-0 border-b border-white/30 focus:border-white focus:ring-0 rounded-none px-0 py-3 text-white placeholder-white/40`).
    * Hilangkan semua ikon di dalam input (kecuali toggle visible password pada field kata sandi).
  - TOMBOL AKSI DALAM SATU BARIS TANPA KONTAINER KOTAK:
    * Kedua tombol (**"MASUK"** dan **"PILIH AKUN"**) diposisikan berdampingan dalam satu baris secara langsung di atas background canvas utama.
    * Tombol "MASUK" menggunakan aksen solid minimalis/emerald tipis (`bg-[#142A18] hover:bg-[#204427] text-white border border-emerald-500/40 rounded-xl h-12`).
    * Tombol "PILIH AKUN" menggunakan gaya outline/ghost transparan elegan (`bg-transparent hover:bg-white/10 text-white border border-white/30 rounded-xl h-12`).
- **[2026-08-26]**: Full Width & Height Mobile Login Backdrop (Edge-to-Edge Canvas):
  - Pada halaman login, tetapkan container latar belakang dan canvas `<GradientWaves />` agar `fixed inset-0 w-screen h-screen min-h-[100dvh] w-full` menutupi seluruh lebar dan tinggi layar ponsel secara penuh tanpa celah/margin.
  - Pastikan form login tetap `w-full max-w-sm sm:max-w-md mx-auto my-auto` mengapung secara presisi di tengah layar ponsel.
- **[2026-08-26]**: Redesign Total Halaman Login (Unboxed, Floating Minimalist, Full Viewport):
  - HAPUS CONTAINER PEMBUNGKUS: Hilangkan seluruh card/kotak pembungkus putih form login di tengah layar.
  - FULL VIEWPORT BACKDROP: Latar belakang `<GradientWaves />` diposisikan `absolute inset-0 w-full h-full` menutupi seluruh viewport secara penuh.
  - BRAND HEADER: Tampilkan nama aplikasi **OSDIGI** dengan font ekstra bold warna putih bersih (`text-white`) dan teks tagline di bawahnya (`text-white/70`).
  - INPUT FIELD BERSIH (TANPA IKON): Kolom Email & Password dibuat bersih tanpa ikon, bergaya semi-transparan (`bg-white/10 border-white/20 text-white placeholder-white/50`).
  - TOGGLE VISIBLE PASSWORD: Di ujung kanan input password sediakan icon button Toggle Visible Password (Eye / EyeOff).
  - TOMBOL AKSI DALAM SATU BARIS: Dua tombol aksi diletakkan berdampingan sebaris (`flex flex-row gap-3`): Tombol "MASUK" (solid) dan Tombol "PILIH AKUN" (outline transparan).
- **[2026-08-26]**: Judul Header Khusus Mobile — Tampilkan Nama App "OSDIGI":
  - Pada tampilan mobile (`lg:hidden`), teks di header utama menampilkan nama aplikasi **OSDIGI** (bukan judul halaman yang sedang dibuka).
  - Pada tampilan desktop (`hidden lg:block`), teks di header tetap menampilkan judul breadcrumbs halaman/divisi yang aktif.
- **[2026-08-26]**: Mobile Touch Gestures — Swipe Right untuk Buka Left Sidebar & Swipe Left untuk Buka Rightbar (Panel Kanan):
  - Pada tampilan mobile:
    * **Swipe Kanan (Swipe Right)**: Membuka Mobile Left Sidebar (`setIsMobileSidebarOpen(true)`). Jika Rightbar sedang terbuka, gesture ini menutup Rightbar.
    * **Swipe Kiri (Swipe Left)**: Membuka Right Contextual Panel / Rightbar (`setIsRightPanelOpen(true)`). Jika Left Sidebar sedang terbuka, gesture ini menutup Left Sidebar.
    * Pastikan gesture handler mendeteksi arah horizontal secara presisi (`|deltaX| > |deltaY|` dengan threshold yang nyaman ~50-60px) tanpa mengganggu scrolling vertikal atau input teks.
- **[2026-08-26]**: Mobile Virtual Keyboard Avoidance pada Modal / Overlay / Popup:
  - Seluruh komponen modal, popup, dan overlay form di mobile tidak boleh tertutup keyboard virtual sistem.
  - Set meta viewport `interactive-widget=resizes-content` pada `index.html`.
  - Gunakan `dvh` (Dynamic Viewport Height) seperti `max-h-[90dvh]` / `max-h-[85dvh]` dan `overflow-y-auto` pada kontainer modal dengan bottom padding (`pb-12 md:pb-6` / `env(safe-area-inset-bottom)`) agar form input yang difokuskan tetap nyaman di-scroll dan terlihat penuh di atas keyboard virtual.
- **[2026-08-26]**: Pengecilan Skala UI Global (UI Scaling 20% Lebih Kecil / 80% Scale):
  - Terapkan skala UI global 20% lebih kecil (`zoom: 0.8` atau skala 80% pada root `index.css` / `html` / `body`) sehingga seluruh halaman, sidebar, kartu, modal, tabel, font, dan elemen visual tampil lebih kompak, proporsional, dan ringkas.
- **[2026-08-26]**: Hapus Tombol Input Data pada Header Utama:
  - Hapus tombol action "+ Input Data" / "Catat Pelanggaran" dari komponen Header utama (Topbar) di `Header.tsx` dan `App.tsx` agar antarmuka header tetap bersih, ringkas, dan fokus.
- **[2026-08-26]**: Aktifkan Localhost Network (Host 0.0.0.0 / Network Access):
  - Konfigurasikan dan jalankan Vite dev server agar mendengarkan pada seluruh interface jaringan (`--host 0.0.0.0` atau `server: { host: true }` pada `vite.config.ts`), sehingga aplikasi dapat diakses tidak hanya via `localhost` tetapi juga via IP Network lokal (WiFi / LAN).
- **[2026-08-26]**: Persistensi Navigasi Halaman & Sub-Tab Aktif (`App`, `localStorage`):
  - SIMPAN ACTIVE ROUTE / TAB KE STORAGE:
    * Setiap kali pengguna berpindah halaman utama (Dashboard, Santri, Asrama, Kelas, Pelanggaran, Program Kerja, Arahan Mudir, Detail Divisi), simpan identifier halaman aktif (`activeView`) dan divisi terpilih (`selectedDivision`) ke `localStorage` (key: `ostifak_active_view`, `ostifak_selected_division`).
    * Setiap kali pengguna berpindah sub-tab di dalam halaman/modal (seperti filter tab Asrama, tab modal santri, dll.), pertahankan state aktif agar konsisten.
  - RESTORE SAAT INITIAL MOUNT / REFRESH BROWSER:
    * Saat aplikasi pertama kali dimuat atau di-refresh, baca riwayat navigasi dari `localStorage` sebagai initial state.
    * Aplikasi tidak boleh selalu mental kembali ke Dashboard saat direfresh, melainkan langsung menampilkan halaman dan tab yang terakhir dibuka.
- **[2026-08-26]**: Dropdown Dinamis Kamar Asrama & Kelas dari Master Data Rill / Global State (`StudentDetailModal`):
  - HAPUS DATA STATIS / HARDCODED: Buang seluruh array atau daftar nama kamar dan kelas yang dibuat secara manual/hardcoded di dalam komponen modal detail santri.
  - AMBIL DARI MASTER DATA RILL (SINGLE SOURCE OF TRUTH):
    * Hubungkan opsi `<option>` dropdown Kamar Asrama langsung ke realtime master data / subscription Asrama (`subscribeToDormitories` / `ALL_OFFICIAL_ROOMS` / snapshot Firestore Asrama) sehingga seluruh kamar aktif yang terdaftar di sistem muncul lengkap dan dinamis.
    * Hubungkan opsi `<option>` dropdown Kelas / Tingkat langsung ke realtime master data / subscription Kelas (`subscribeToClasses` / `OFFICIAL_CLASSES` / snapshot Firestore Kelas).
  - AUTO-SELECTION: Pastikan kamar dan kelas yang saat ini dimiliki santri terpilih (*selected*) secara otomatis dengan benar saat mode edit biodata dibuka.
- **[2026-08-26]**: Standarisasi Modal Detail Santri, Pre-filled Form Values, & Dropdown Kamar/Kelas (`StudentDetailModal`):
  - STANDARISASI KONTEN & KODE: Pastikan seluruh halaman/fitur yang membuka detail santri (Asrama, Santri, Hafalan, Pelanggaran, Presensi, dsb.) menggunakan satu komponen modal tunggal yang konsisten (`StudentDetailModal.tsx`) dengan header, tab, dan footer actions terpadu.
  - PRE-FILLED VALUE PADA MODE EDIT: Saat tombol "Edit Biodata" diklik, seluruh input field wajib terisi data aktif santri (tidak boleh ada yang kosong/blank, gunakan data santri yang sedang dibuka beserta fallback nama wali, domisili, alamat, NIS, dsb.).
  - DROPDOWN KAMAR & KELAS:
    * Ganti input teks manual Kamar dan Kelas menjadi komponen `<select>` dropdown.
    * Opsi Kamar: Daftar nama asrama & kamar rill (misal: Qatar 1, Qatar 2, Qatar 3, Abu Bakar 1, Abu Bakar 2, Umar 1, Umar 2, Utsman 1, Ali 1, Kuwait 1, Cordoba 1, Madinah 1, Makkah 1, dsb.).
    * Opsi Kelas: Daftar kelas rill pondok (misal: 7A, 7B, 8A, 8B, 9A, 9B, 10A, 10B, 10 IPA 1, 10 IPA 2, 10 IPS 1, 11 IPA 1, 11 IPA 2, 11 IPS 1, 12 IPA 1, 12 IPA 2, 12 IPS 1).
- **[2026-08-26]**: Posisi Tombol Edit Terpadu di Bagian Atas Tab "Bio" (`StudentDetailModal`):
  - POSISI TOMBOL EDIT DI BAGIAN ATAS:
    * Tempatkan satu tombol / icon button **Edit** (ikon pensil ✏️ `Pencil`) di **bagian atas** dari seluruh area informasi biodata (misal di baris header atas tab Bio atau pojok kanan atas sebelum grid).
    * Ketika tombol Edit di atas diklik, seluruh field informasi di kedua kolom (Informasi Pribadi dan Wali & Domisili) berubah menjadi mode input field secara serentak (diedit sekaligus), dengan tombol "Simpan Perubahan" dan "Batal" di header atas.
  - DUA KOLOM UNBOXED: Dua kolom informasi bersih tanpa kotak/container card pembungkus kaku ber-border/background putih, dengan jarak spasi kelipatan 8pt (`gap-8` / `gap-6`).
  - VALIDASI TELEPON +62: Awalan `+62` paten/permanen tidak bisa dihapus, auto-trim `0` di awal, dan auto-format tanda hubung `-` per 4 digit (`+62 821-1150-0190`).
- **[2026-08-26]**: Harmonisasi Kartu Ringkasan Program Kerja 9 Divisi (`DashboardView`):
  - HIERARKI KARTU PROGRAM: Nama Program di atas (`font-bold`, ukuran lebih besar), Nama Divisi persis di bawahnya dengan teks gelap (`text-slate-900` plain text tanpa prefix dan tanpa badge).
  - STATUS IKON POJOK KANAN ATAS: Menggunakan ikon tunggal murni di pojok kanan atas:
    * Ditolak: Ikon Silang (✕ / `X`) merah (`text-red-600`).
    * Proses: Ikon Jam SVG animasi jarum berputar (`AnimatedProcessClockIcon`) oranye (`text-amber-500`).
    * Selesai: Ikon Ceklis (✓ / `CheckCircle2`) hijau (`text-emerald-600`).
  - PROGRESS BAR & ANGGARAN: Progress bar unboxed tanpa kontainer pembungkus, format anggaran di bawahnya `[progress berjalan] / [total]` tanpa kata "Anggaran:" dan tanpa ikon.
  - TARGET & COUNTDOWN H-N: Tanggal target di bawah anggaran tanpa garis pembatas (divider), dilengkapi countdown `H-N` bersih di sampingnya.
- **[2026-08-26]**: Tampilan Tab "Bio" Modal Detail Santri (`StudentDetailModal`):
  - UNBOXED DUA KOLOM: Hapus container box (kartu ber-border/background putih pembungkus section "Informasi Pribadi & Santri" dan "Wali Santri & Alamat Asal"). Pertahankan struktur dua kolom sejajar dengan grid/flex 8pt (`gap-6` / `gap-8`) agar terasa lapang dan bersih.
  - EDIT INLINE DENGAN IKON PENSIL:
    * Sediakan tombol Edit (ikon pensil ✏️ / `Pencil`) di pojok kanan atas masing-masing section.
    * Saat mode Edit aktif, baris-baris informasi berubah dinamis menjadi input field interaktif dengan tombol "Simpan" dan "Batal", yang menyimpan perubahan secara persisten ke database santri (LocalStorage & Firestore).
  - VALIDASI & FORMAT NOMOR TELEPON:
    * Awalan `+62` paten/permanen di awal input telepon dan tidak dapat dihapus pengguna.
    * Auto-Trim 0: Jika pengguna mengetik angka `0` di awal (contoh `0821...`), otomatis di-trim menjadi `821...`.
    * Auto-Formatting `-` (Per 4 Digit): Format akhir otomatis tersimpan dan tertampil rapi dengan pola strip tiap 4 digit, contoh: `+62 821-1150-0190`.
- **[2026-08-25]**: Animasi Jarum Berputar pada Ikon Jam Status "Proses" (`WorkProgramsView`):
  - CUSTOM SVG CLOCK: Menggunakan elemen SVG dengan lingkaran luar (radius 10 pada viewBox 0 0 24 24, center 12, 12), titik poros tengah (`circle r="1"`), jarum menit panjang, dan jarum jam pendek.
  - CSS KEYFRAMES JARUM BERPUTAR:
    * Jarum menit (panjang): `animation: spin 3s linear infinite` dengan `transform-origin: 12px 12px` (center).
    * Jarum jam (pendek): `animation: spin 12s linear infinite` dengan `transform-origin: 12px 12px` (center).
  - Tampilan visual kompak (`w-5 h-5`) dengan warna oranye/amber (`text-amber-500` / `stroke-amber-500`).
- **[2026-08-25]**: Tata Letak & Hierarki Kartu Program Kerja (`WorkProgramsView`):
  - HIERARKI JUDUL & DIVISI:
    * Nama Program di bagian paling atas kartu dengan font tebal (`font-bold`, ukuran lebih besar).
    * Nama Divisi persis di bawah nama program dengan teks gelap (`text-slate-900`), **tanpa** prefix "Divisi:...", **tanpa** bullet point (`•`), dan **tanpa** badge background (tampil sebagai plain text bersih).
  - IKON STATUS TUNGGAL (POJOK KANAN ATAS):
    * Hapus teks status lama dan ganti dengan ikon tunggal murni di pojok kanan atas:
      - **Ditolak** (`'ditolak'`): Ikon Silang (✕ / `X` / `XCircle`) warna merah (`text-rose-600`).
      - **Proses** (`'direncanakan'` / `'dalam_proses'` / `'diajukan'`): Ikon Jam / Stopwatch (`Clock` / `Timer`) warna oranye (`text-amber-500` / `text-orange-500`).
      - **Selesai** (`'selesai'` / `'disetujui'`): Ikon Ceklis (✓ / `CheckCircle2` / `Check`) warna hijau emerald (`text-emerald-600`).
  - PROGRESS BAR UNBOXED & FORMAT ANGGARAN:
    * Progress bar tampil langsung di body kartu tanpa kontainer pembungkus / card background terpisah.
    * Format anggaran di bawah progress bar: `[progress berjalan] / [total]` (contoh: `50.000 / 1.000.000`), **tanpa** teks label "Anggaran:" dan **tanpa** icon.
  - TARGET TANGGAL & COUNTDOWN H-N:
    * Tampilkan tanggal target di bawah progress bar/anggaran **tanpa divider / garis pembatas**.
    * Di samping tanggal, tampilkan langsung countdown format `H-N` (misal `H-3` atau `H-12`) berdasarkan tanggal sekarang tanpa label/tooltip/helper tambahan.
- **[2026-08-25]**: Persistensi Penuh & Sinkronisasi Permanen Penghapusan Pelanggaran (`ViolationsView`, `App`, `firestoreService`):
  - PERSISTENSI KE SUMBER UTAMA (SINGLE SOURCE OF TRUTH): Penghapusan data pelanggaran wajib disimpan secara permanen di LocalStorage cache (`ostifak_deleted_violations`), koleksi Firestore `pelanggaran`, DAN histori pelanggaran santri (`santri.violationsHistory`).
  - ANTI-REBOUND UPON REFRESH / PAGE NAVIGATION: Saat halaman direfresh, berpindah menu (re-mount), atau termuat ulang dari data mock, daftar pelanggaran yang telah dihapus tidak boleh muncul kembali karena difilter secara global menggunakan blacklist ID unik yang persisten.
  - SINKRONISASI STATE UTAMA: Komponen induk `App` dan view turunan menyaring `mergedViolations` terhadap daftar ID yang terhapus secara permanen sehingga data yang dihapus benar-benar hilang tuntas.
- **[2026-08-25]**: Implementasi Presisi Komponen `<GradientWaves />` (React Bits Official Source & Dark Emerald Viewport Fit):
  - Menggunakan implementasi source code WebGL 2 raymarching `<GradientWaves />` dengan file CSS `GradientWaves.css`.
  - Kalibrasi prop warna Dark Emerald (#142A18 / `#0A1C10`, `#1A4325`, `#38D387`) dengan kontras dan kecerahan yang pas (`brightness={1.0}`, `opacity={1.0}`, `fogDepth={16}`) sehingga gelombang 3D terlihat jelas, hidup, dan selaras memenuhi viewport latar belakang halaman login.
- **[2026-08-25]**: Pembersihan Elemen Card Login & Integrasi Background `<GradientWaves />` (`LoginPage`):
  - BERSIHKAN ELEMEN & FOOTER LOGIN:
    * Hapus barisan footer tombol "Inisialisasi Data Akun" di bagian bawah card login.
    * Hapus ikon di samping nama aplikasi "OSDIGI" di panel kiri card.
    * Hapus ikon kecil pada label heading "PILIH AKUN CEPAT".
    * Hapus seluruh foto/avatar pada setiap kartu akun di grid "Pilih Akun Cepat", sehingga hanya menampilkan teks nama dan email secara bersih.
  - INTEGRASIKAN KOMPONEN BACKGROUND `<GradientWaves />` (React Bits / `ogl`):
    * Pasang komponen animasi latar belakang `GradientWaves` di backdrop layer (`absolute inset-0 -z-10 w-full h-full`) dengan palet Dark Emerald pondok (#142A18 / #0B1E12, #1E4D2B, #3EE08F), `mouseInteraction={true}`, `opacity={0.6}`, `grain={true}`, dan `grainIntensity={0.04}`.
- **[2026-08-25]**: Menu Popover Kontekstual Bersih Tanpa Header/Judul (`ViolationsView`):
  - BERSIHKAN HEADER POPOVER: Hapus seluruh elemen header teks ("Menu Klik Kanan" / "Opsi Kasus" dan nama santri) pada popover menu.
  - LANGSUNG LIST OPSI AKSI: Biarkan menu langsung merender daftar tombol aksi (*Tandai Selesai / Tandai Belum Selesai*, *Edit Kasus*, *Hapus Kasus*) secara bersih dan ringkas dari atas ke bawah.
- **[2026-08-25]**: Dinamika Teks Status, Auto-Width No-Wrap, & Perbaikan Hapus Kasus Pelanggaran (`ViolationsView`):
  - DINAMIKA STATUS TOGGLE:
    * Jika kasus berstatus `'selesai'`: Opsi pertama menu bertuliskan **"Tandai Belum Selesai"** dengan ikon jam (`Clock`) dan aksen kuning/oranye hangat (`text-amber-600` / `hover:bg-amber-50`).
    * Jika kasus berstatus pending (`'belum_dihukum'` / `'dalam_proses'`): Opsi pertama menu bertuliskan **"Tandai Selesai"** dengan ikon ceklis (`CheckCircle2`) dan aksen hijau emerald (`text-emerald-600` / `hover:bg-emerald-50`).
  - AUTO-WIDTH & WHITESPACE-NOWRAP: Gunakan `whitespace-nowrap` pada semua item opsi menu konteks dan biarkan lebar container menyesuaikan konten secara dinamis (`min-w-max` / auto-width) dengan padding horizontal `px-4 py-2.5` agar tidak ada teks yang ter-wrap atau terpotong ke bawah.
  - AUDIT & ROBUST RECORD DELETION: Pastikan proses hapus pelanggaran menghapus record di koleksi Firestore `pelanggaran` DAN di histori santri `violationsHistory`, memperbarui state lokal secara instan (optimistic UI), menutup menu kontekstual otomatis, dan menampilkan toast notifikasi sukses.
- **[2026-08-25]**: Ikon Minimalis Murni pada Kolom "STATUS" Tabel Pelanggaran (`ViolationsView`):
  - HAPUS LABEL TEKS & TITIK (NO TEXT / NO DOT): Hapus seluruh label teks (seperti "belum dihukum", "selesai", "dalam proses") serta hilangkan titik/dot badge pendamping.
  - IKON TUNGGAL STATUS MURNI:
    * **PENDING** (`'belum_dihukum'` / `'dalam_proses'`): Tampilkan Ikon Jam/Stopwatch (`Clock` / `Timer`) berwarna kuning/oranye hangat atau abu-abu (`text-amber-500` / `text-slate-400`).
    * **SELESAI** (`'selesai'`): Tampilkan Ikon Ceklis (`CheckCircle2` / `CheckCircle`) berwarna hijau emerald (`text-[#059669]` / `text-emerald-600`).
  - ALIGNMENT CENTER: Letakkan header kolom dan isi ikon status tepat di tengah kolom (`text-center`, `flex justify-center items-center`) agar rapi, simetris, dan bersih.
- **[2026-08-25]**: Anti-Clipping Context Menu & Fixed Floating Portal Positioning pada Tabel Pelanggaran (`ViolationsView`):
  - HILANGKAN OVERFLOW CLIP TABEL: Hindari `overflow-hidden` atau batasan clipping pada kontainer tabel yang memotong menu popover anak.
  - FIXED FLOATING POSITIONING (ANTI-CLIPPING): Baik menu titik tiga maupun menu klik kanan wajib menggunakan positioning `fixed` melayang secara independen di atas seluruh lapisan halaman (`z-50`).
  - PERHITUNGAN KOORDINAT PRESISI: Hitung posisi `top` dan `left` menggunakan `getBoundingClientRect()` tombol titik tiga atau posisi kursor mouse (`e.clientX`, `e.clientY`) dengan *viewport boundary guard* agar tidak terpotong di tepi layar dan tidak memunculkan scrollbar yang tidak diinginkan.
  - FULLSCREEN TRANSPARENT BACKDROP: Sediakan elemen backdrop transparan fullscreen (`fixed inset-0 z-40 bg-transparent`) untuk menangani click-away secara mulus dan bersih.
- **[2026-08-25]**: Kolom Aksi, Dropdown Popover Titik Tiga & Dukungan Klik Kanan (Context Menu) pada Tabel Pelanggaran (`ViolationsView`):
  - GANTI HEADER "PELAPOR" MENJADI "AKSI": Hapus kolom teks pelapor dan sediakan Icon Button Titik Tiga (More Options `...` / `MoreHorizontal` / `MoreVertical`) di setiap baris data pelanggaran.
  - MENU KONTEKSTUAL (DROPDOWN POPOVER): Mengklik tombol titik tiga menampilkan floating popover menu (`z-50`, `shadow-xl`, `rounded-xl`, `bg-white`, border rapi) dengan 3 opsi aksi:
    1. **Tandai Selesai** (Ikon Ceklis ✓) — Mengubah status eksekusi hukuman menjadi 'selesai'.
    2. **Edit** (Ikon Pensil ✏️) — Membuka modal form edit kasus pelanggaran.
    3. **Hapus** (Ikon Tempat Sampah 🗑️, warna merah) — Menghapus record kasus pelanggaran dengan dialog konfirmasi aman.
  - DUKUNGAN KLIK KANAN (CONTEXT MENU): Sediakan handler `onContextMenu` pada setiap baris item (`<tr>`). Saat klik kanan: `e.preventDefault()`, buka floating context menu pada posisi kursor mouse (`clientX`, `clientY`) atau dekat baris terkait, dan sediakan backdrop/click-away listener untuk menutup menu saat klik di luar.
- **[2026-08-25]**: Range Slider Bobot Poin & Efek Rolling Number Jackpot pada Modal "Catat Pelanggaran Santri" (`NewViolationModal`):
  - GANTI PILIHAN KARTU DENGAN RANGE SLIDER (1 - 50): Hapus tombol kartu/badge keparahan statis (Ringan, Sedang, Berat). Ganti dengan komponen HTML `<input type="range" min="1" max="50" />` yang mulus dan interaktif. Sediakan indikator angka poin dinamis secara real-time.
  - EFEK ANIMASI COUNTING "JACKPOT ROLLING": Saat slider digeser (`onChange`/`onInput`), berikan animasi rolling counter (*jackpot slot machine effect*) pada teks nominal angka poin agar perubahan angka terasa hidup, dinamis, dan tidak kaku.
  - PEMETAAN KATEGORI & TEKS TELANJANG (PLAIN TEXT): Tentukan kategori secara otomatis berdasarkan nilai poin (1 - 12: Ringan, 13 - 25: Sedang, 26 - 38: Berat, 39 - 50: Sangat Berat). DILARANG membungkus teks kategori dalam badge/pill/kotak latar warna-warni; tampilkan sebagai **Teks Telanjang (Plain Text)** yang menyatu elegan (misal: `35 Poin — Sangat Berat`).
- **[2026-08-25]**: Interaksi Shortcut Hover pada Kartu Santri & Sub-Modal Detail Santri (`StudentsView`, `DormitoryView`, `ClassesView`):
  - EFEK HOVER OVERLAY SHUTTER: Setiap kartu santri wajib berposisi `relative`, `overflow-hidden`, dan `group`. Sediakan overlay absolut (`absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto flex items-center justify-center`).
  - TOMBOL SHORTCUT "BUKA DETAIL SANTRI": Di tengah overlay, tampilkan tombol pill interaktif berbunyi **"Buka Detail Santri ↗"** (atau ikon `Eye`/`ExternalLink`) dengan styling putih bersih/emerald tebal, `shadow-lg hover:scale-105 transition-transform`.
  - AKSI KLIK & SUB-MODAL BEHAVIOR: Mengklik kartu atau tombol shortcut tersebut membuka Sub-Modal Detail Santri. Sembunyikan modal di belakangnya (misal modal detail kamar/kelas), dan kembalikan modal sebelumnya secara mulus saat detail santri ditutup.
- **[2026-08-25]**: Perbaikan Interpolasi Kurva Line Chart (Monotone Spline & Baseline Zero-Clamp Guard):
  - CEGAH UNDERSHOOT NILAI NEGATIF: Terapkan algoritma *Fritsch-Carlson Monotone Cubic Spline* untuk memastikan kurva tidak pernah melengkung turun menembus garis 0 (tidak overshoot/undershoot ke nilai negatif).
  - GARIS DATAR SEMPURNA SAAT NILAI 0: Jika titik-titik data bernilai 0 berturut-turut (misal: Rabu s.d. Ahad bernilai 0), garis kurva wajib berupa garis lurus mendatar (*flat line*) tepat di atas garis dasar `y = 0` (`baseY`), tanpa gelombang naik-turun.
  - BOUNDARY CLAMP: Kontrol titik Bézier (`cp1y` & `cp2y`) dibatasi secara ketat pada `Math.min(baseY, ...)` agar tidak pernah berada di bawah sumbu horizontal.
- **[2026-08-25]**: Desain Modern & Elegan Line Chart Hafalan (Smooth Spline, Gradient Area Fill & Interaktif Tooltip):
  - HALUSKAN KURVA (SMOOTH SPLINE / CUBIC BÉZIER): Ubah garis bersudut kaku/tajam menjadi kurva melengkung yang mulus (*smooth natural spline*) menggunakan perhitungan Bézier cubic `C` pada SVG path.
  - AREA GRADIENT FILL: Berikan efek gradasi warna transparan di bawah kurva (*area fill*) menggunakan warna tema hijau emerald (`#059669` / `#142A18`) dan biru indigo (`#2563EB`) dengan transisi opasitas lembut (25% ke 0%).
  - TITIK DATA & INTERAKTIF TOOLTIP (DOTS & HOVER EFFECT): Desain titik data dengan ring melingkar lembut, glow/shadow, serta tooltip melayang (*floating tooltip badge*) interaktif dan garis panduan vertikal (*crosshair guideline*) saat kursor diarahkan ke grafik.
- **[2026-08-25]**: Reaktivitas Data Rill & Real-Time State pada Line Chart Hafalan (`StudentsView`):
  - HAPUS DATA DUMMY STATIS: Hapus seluruh array data hardcoded/acak pada komponen grafik garis.
  - KONEKSIKAN DENGAN REAL-TIME STATE: Tarik data murni dari `selectedDetailStudent.hafalanHistory` santri yang bersangkutan sebagai *single source of truth*. Agregasi data (Ziyadah & Murojaah) secara dinamis sesuai rentang waktu yang dipilih (Pekan Ini, Bulan Ini, Tahun Ini).
  - EMPTY STATE ELEGAN: Jika belum ada data setoran pada periode yang dipilih, tampilkan chart empty state dengan nilai 0 yang bersih dan tidak mengarang data palsu.
  - REAKTIVITAS INSTAN: Setiap penambahan setoran baru melalui modal "Catat Setoran", grafik garis dan kartu statistik ringkas langsung ter-update secara otomatis dan reaktif tanpa refresh halaman.
- **[2026-08-25]**: Aturan Anti-Duplikasi Tombol/Submit, Kartu Statistik Ringkas & Sub-Modal Grafik Line Chart Hafalan (`StudentsView`):
  - ATURAN ANTI-DUPLIKASI (CRITICAL FIX): Jangan pernah merender tombol aksi ganda dalam satu section. Pastikan tombol aksi ("+ Catat Setoran Baru") hanya ada 1 buah. Saat tombol Simpan pada sub-modal diklik, langsung berikan state disabled/loading, SEGERA tutup sub-modal dan trigger Toast notification instan tanpa delay untuk mencegah submit ganda, lalu restore Modal Utama secara mulus.
  - KARTU STATISTIK RINGKAS (COMPACT STATS CARDS): Di bagian atas tab Hafalan, sediakan grid 4 kartu compact (p-3, border tipis, bersih) yang memuat: Total Ziyadah Pekan Ini, Total Ziyadah Bulan Ini, Total Murojaah Pekan Ini, dan Total Murojaah Bulan Ini.
  - INTERAKSI GRAFIK / STATISTIK (LINE CHART SUB-MODAL): Kartu statistik dapat diklik (clickable card). Saat diklik, buka Sub-Modal baru "Statistik & Tren Perkembangan Hafalan" yang menampilkan visual Line Chart (Grafik Garis tren hafalan Ziyadah & Murojaah) dengan filter rentang waktu (Pekan Ini, Bulan Ini, Tahun Ini). Mengikuti aturan sub-modal: modal utama tersembunyi saat chart terbuka, dan kembali tampil saat ditutup.
- **[2026-08-25]**: Upgrade Form "Catat Setoran Santri" (114 Surah Combobox, Range Ayat Dinamis & Auto-Fill Halaman Standar Kemenag):
  - FIELD "NAMA SURAH" (SEARCHABLE COMBOBOX): Sediakan database lengkap 114 Surah Al-Qur'an (nomor surah, nama surah, dan jumlah ayat total). Input nama surah menggunakan searchable combobox dengan floating dropdown overlay yang bersih dan responsif.
  - RANGE AYAT DINAMIS: Input "Dari Ayat" dan "Sampai Ayat" dengan batasan maksimal dinamis (Max Value Guard) sesuai jumlah ayat total surah terpilih (misal: Al-Baqarah max 286 ayat, An-Nas max 6 ayat). Nilai tidak dapat melebihi total ayat surah.
  - AUTO-FILL RENTANG HALAMAN (STANDAR QUR'AN KEMENAG / MUSHAF INDONESIA): Sistem secara otomatis menghitung dan mengisikan field "Dari Halaman" dan "Sampai Halaman" berdasarkan Surah & rentang Ayat yang dipilih. Field halaman tetap dapat diedit/di-override secara manual oleh ustadz jika diperlukan. Badge "Total: N Halaman" terhitung secara dinamis.
  - KONSISTENSI UX & SUB-MODAL: Simpan setoran -> Toast notifikasi sukses -> Restore kembali Modal Utama Detail Santri secara realtime.
- **[2026-08-25]**: Fitur Aksi "Catat Setoran", Aturan Nested Modal & Toast Notification Seluruh Sub-Modal (`StudentsView`):
  - TOMBOL "CATAT SETORAN" DI TAB HAFALAN: Tambahkan tombol "Catat Setoran Baru" dengan ikon Plus pada tab Hafalan. Saat diklik, sembunyikan sementara Modal Utama Detail Santri dan buka Modal Form "Catat Setoran Santri".
  - SPESIFIKASI FORM MODAL "CATAT SETORAN":
    * Styling Modal: Gaya Class View (Header Dark Emerald `#142A18`, teks putih, `max-w-2xl`, `max-h-[90vh]` scrollable body).
    * Kategori Setoran: Pilihan segmented/radio "Hafalan Baru" dan "Murojaah". Jika hafalan santri sudah mencapai "30 Juz", pilihan "Hafalan Baru" otomatis disabled disertai helper text ("Santri sudah 30 Juz, hanya dapat mencatat Murojaah").
    * Input Halaman (Dari Halaman - Sampai Halaman): Dua input angka dengan perhitungan otomatis real-time jumlah halaman (Tag/Badge pill tanpa kontainer kaku: "Total: N Halaman").
    * Slider Kelancaran (Range Slider): 4 titik step interaktif: [Perlu diulang] — [Lumayan] — [Lancar] — [Sangat Lancar] dengan label teks dinamis.
    * Catatan Opsional: Textarea catatan ustadz pembimbing.
  - PERILAKU SETELAH SIMPAN & TOAST NOTIFICATION:
    * Saat "Simpan Setoran" diklik: validasi form, tutup modal setoran, munculkan Toast Notification di pojok layar (bg hijau emerald `#142A18` / `#059669`, teks putih, animasi fade-in/out: "Berhasil! Setoran hafalan baru [Nama Santri] berhasil dicatat"), dan otomatis restore Modal Utama Detail Santri dengan update riwayat setoran secara live.
  - KONSISTENSI DI SEMUA SUB-MODAL: Berlaku sama untuk "Rekam Izin", "Pindah Kamar", "Pindah Kelas", dll. (Sub-modal buka -> Modal utama hide; Sub-modal simpan -> Toast sukses muncul & Modal utama restore utuh).
- **[2026-08-25]**: Perombakan Arsitektur UI/UX Modal "Catat Pelanggaran Santri" (`NewViolationModal`):
  - UKURAN MODAL LEBIH BESAR & LUAS: Perbesar modal menjadi `max-w-2xl` (atau `max-w-3xl`) dengan padding lapang mengikuti 8-point grid system (`p-6` / `p-8`).
  - HAPUS FIELD NIS SANTRI: Hapus total field input "NIS Santri" dari tampilan grid form untuk layout yang lebih bersih dan simetris.
  - FIELD KAMAR & KELAS OTOMATIS & DISABLED: Input "Kamar Asrama" dan "Kelas Santri" menjadi field otomatis (read-only / disabled) dengan visual disabled jelas (`bg-slate-100 text-slate-500 cursor-not-allowed`) yang langsung terisi saat santri dipilih.
  - CUSTOM DROPDOWN OVERLAY UNTUK PENCARIAN SANTRI (SEARCHABLE COMBOBOX): Menggunakan absolute positioning overlay (`absolute top-full left-0 z-50 w-full min-w-[320px] bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60`) tanpa mendorong elemen layout di bawahnya. Setiap opsi menampilkan Nama Santri dan sub-teks ("Kamar Qatar 2 • Kelas 6 IPS"). Saat opsi dipilih, dropdown tertutup dan field Kamar serta Kelas otomatis terisi secara instan.
- **[2026-08-25]**: Fitur Interaktif & Modal Detail Multi-Tab Profil Santri (`StudentsView`):
  - IKON BUTTON "OPEN DETAIL" PADA KARTU SANTRI: Tambahkan icon button (ikon panah keluar `ArrowUpRight` / `Eye`) di pojok kanan atas masing-masing kartu santri untuk membuka Modal Detail Santri besar (`max-w-4xl`, `h-[85vh]`, `flex flex-col`).
  - MODAL UTAMA DETAIL SANTRI (MULTI-TAB VIEW):
    * Header modal: Dark Emerald `#142A18`, nama santri, NIS, kamar/kelas, teks putih & tombol tutup.
    * Segmented Button Tanpa Kontainer Pembungkus: Navigasi horizontal 5 tab ("Bio", "Hafalan", "Pelanggaran", "Prestasi", "Riwayat Izin"). Tab aktif pill dark emerald, tab inaktif slate text hover.
    * Body Content: Konten tab dinamis dibungkus custom `ScrollArea` overlay.
  - FOOTER MODAL & TEXT-ONLY BUTTONS: Footer bawah (`bg-slate-50 border-t p-4 flex justify-between items-center`) dengan tombol teks tanpa background kotak: "Pindah Kamar", "Pindah Kelas", dan "Rekam Izin".
  - NESTED MODAL "REKAM IZIN": Ketika tombol "Rekam Izin" diklik, sembunyikan sementara modal utama dan munculkan modal form Rekam Izin (Jenis Izin: Pulang/Lomba/Keperluan Lain, Alasan Izin, Tanggal Dari & Sampai). Setelah "Batal" atau "Simpan Izin", tutup modal izin dan otomatis buka kembali Modal Utama Detail Santri.
- **[2026-08-25]**: Standarisasi & Branding Modal "Detail Kamar/Asrama" (`DormitoryView`):
  - HEADER BERWARNA UTAMA (DARK EMERALD BRANDING): Background header modal diubah menjadi hijau tua utama `bg-[#142A18]` dengan teks judul dan sub-judul `text-white` / `text-slate-300`, ikon kamar (`BedDouble`), dan tombol close (✕) di pojok kanan atas `text-slate-300 hover:text-white hover:bg-white/10`.
  - PENATAAN KONTEN & SECTION: Judul section menggunakan huruf kapital tegas tanpa nomor ("MATRIKS PENILAIAN KAMAR", "DAFTAR SANTRI PENGHUNI", "REKAM PRESTASI", "REKAM PELANGGARAN"). Dimensi modal diperluas ke `w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col` dengan body scrollable (`ScrollArea`).
  - DAFTAR PENGHUNI SCROLLABLE: List santri unboxed dengan container `max-h-60` scrollable, kartu santri berdesain `border border-slate-200/80 rounded-xl p-3 hover:bg-slate-50/80 bg-white`.
  - FOOTER MODAL: Tombol aksi "Tutup Detail" diletakkan di dalam fixed footer bawah (`bg-[#F8FAFC] border-t border-slate-200/80 px-6 py-3.5`) di sebelah kanan dengan style khas OSTIFAK (`bg-[#142A18] text-white rounded-full text-xs font-semibold hover:bg-[#2E5B37]`).
- **[2026-08-25]**: Hapus Badge Tag Jurusan ("Jurusan IPA" / "Jurusan IPS") pada Kartu Kelas (`ClassesView`):
  - Hapus elemen JSX/markup badge tag jurusan di sebelah judul kelas pada seluruh kartu kelas di halaman Daftar Kelas.
  - Memastikan tata letak judul nama kelas tetap bersih, rapi, dan sejajar dengan counter badge jumlah santri ("N Santri") di sisi kanan atas kartu.
- **[2026-08-25]**: Perbaikan Layout Halaman Manajemen Asrama (`DormitoryView`):
  - CHECKBOX FILTER "SEMBUYIKAN KAMAR PENUH": Tambahkan filter checkbox `[ ] Sembunyikan Kamar Penuh` sejajar di sebelah kanan Segmented Button/PillTabs dengan styling `flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm hover:bg-slate-50 cursor-pointer`. State `hideFullRooms` menyaring daftar kamar agar hanya menampilkan kamar dengan okupansi belum penuh (`occupiedCount < capacity`).
  - HAPUS DOUBLE DIVIDER: Hapus garis pembatas ganda/berlebihan di bawah baris filter tab sehingga batas pemisah antar section rapi dan bersih tanpa ruang kosong berulang.
- **[2026-08-25]**: Penyesuaian Layout & Styling Modal "Detail Kelas" (`ClassesView`):
  - PERBESAR UKURAN MODAL (WIDTH & HEIGHT): Modal diperluas menggunakan `w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col` dengan body scrollable rapi `overflow-y-auto pr-1` (atau `ScrollArea`).
  - HAPUS NUMBERING PADA JUDUL SECTION: Hapus semua penomoran angka ("1.", "2.", "3.", "4.") pada judul section ("MATRIKS PENILAIAN KELAS", "DAFTAR SANTRI KELAS", "REKAM PRESTASI", "REKAM PELANGGARAN").
  - UBAH DAFTAR KARTU SANTRI (NO OUTER CONTAINER & SCROLLABLE): Hapus border/kotak kontainer luar yang membungkus list santri (unboxed list). Render kartu santri dalam container scrollable `max-h-60` (atau `max-h-72`), `gap-2.5`, dengan desain kartu rapi `border border-slate-200/80 rounded-xl p-3 hover:bg-slate-50/80`.
  - PENYESUAIAN GRID REKAM PRESTASI & PELANGGARAN: Pertahankan layout 2 kolom (`grid grid-cols-1 md:grid-cols-2 gap-4`) di bagian bawah dengan padding & spacing konsisten mengikuti 8-point grid system.
- **[2026-08-25]**: Kustomisasi Scrollbar Vertikal Container Utama, Modal, & List Scrollable:
  - JANGAN GESER KONTEN UTAMA (OVERLAY SCROLLBAR): Scrollbar tidak memakan ruang layout (tidak mengubah width/lebar konten di dalamnya) menggunakan teknik pembungkus relative (`relative overflow-hidden` wrapper) dengan elemen scrollable tanpa native scrollbar (`no-scrollbar`) dan track scrollbar diletakkan melayang (overlay) di atas tepi kanan konten.
  - BATASI TINGGI SCROLLBAR (JANGAN LEWATI HEADER): Track scrollbar tidak menempel sampai ke atas/menabrak header/topbar dan footer, diberi margin/inset atas dan bawah (`top-4 bottom-4` / `inset-y-4`) agar berhenti rapi di bawah header dan di atas footer.
  - STYLING MINIMALIS & MODERN (THIN & FADING): Lebar scrollbar sangat tipis (`w-1.5` atau `w-2`), border-radius penuh (`rounded-full`), warna thumb netral lembut (`bg-slate-300 hover:bg-slate-400 transition-colors` / dark mode `dark:bg-slate-700 dark:hover:bg-slate-600`), track background transparan (`bg-transparent`), dan efek fading halus saat idle/hover/scrolling.
- **[2026-08-25]**: Sinkronisasi Data Okupasi Asrama/Kamar & Kelas dengan Profil Santri secara Realtime:
  - Mengintegrasikan relasi realtime antara data santri (`SantriRecord.kamar` & `SantriRecord.kelas`) dengan modul Asrama (`DormitoryView`) dan modul Kelas (`ClassesView`).
  - Okupasi kamar (`r.occupancy`) dan jumlah santri kelas (`cls.studentCount`) otomatis dihitung secara dinamis dari daftar santri yang terdaftar, serta menampilkan daftar nama santri asli di modal detail kamar/kelas.
- **[2026-08-25]**: Posisi munculnya `goey-toast` disetel ke `bottom-right`:
  - Mengatur properti `position="bottom-right"` pada seluruh komponen `<GooeyToaster />` di aplikasi.
- **[2026-08-25]**: Integrasi `goey-toast` untuk Semua Notifikasi, Perubahan, Informasi, Alert, & Warning:
  - Mengintegrasikan `<GooeyToaster />` di root aplikasi (`App.tsx` & `main.tsx`).
  - Menggunakan `gooeyToast` (success, info, warning, error) pada setiap aksi perubahan data (tambah/edit/hapus santri, tambah pelanggaran, program kerja, instruksi mudir, login/logout, dan update asrama/kelas).
- **[2026-08-25]**: Field Total Hafalan pada Modul Tambah & Edit Profil Santri dibuat Numeric Only dengan Akhiran "Juz" Otomatis:
  - Input field hafalan hanya menerima angka (numeric only, min 0, max 30) dengan visual suffix badge "Juz" otomatis di sebelah kanan input.
  - Data yang disimpan ke database otomatis diformat menjadi "{angka} Juz".
- **[2026-08-25]**: Hapus variabel dan referensi kelas "10 SMA Tahfizh" / "12 SMA Tahfizh":
  - Menghapus nilai default dan placeholder `10 SMA Tahfizh` di seluruh file dan memastikan semua acuan kelas menggunakan 9 Kelas Resmi (Kelas 1 - 3, Kelas 4 - 6 IPA/IPS) dengan default `Kelas 1`.
- **[2026-08-24]**: Modul Tambah Profil Santri dibuat berbentuk Popup Modal (seperti modul pengeditan):
  - Mengubah tampilan tambah santri dari kartu/inline menjadi modal popup dengan dimensi FIXED (`w-[800px] h-[620px]`), 2 tab (Data Pokok & Akademik serta Disiplin & Pelanggaran), label bersih tanpa prefix ROW/TAB, dan kontrol footer fixed.
- **[2026-08-24]**: Implementasi Local-First Persistent Synchronization untuk Santri:
  - Mengatasi kendala remote Firebase permission (`Missing or insufficient permissions`) dan ServiceWorker interceptor dengan storage persistent layer (`localStorage` + `ostifak-santri-changed` event bus).
  - Penghapusan santri (deleteSantriRecord) langsung mencatat ID ke persistent blacklist, memfilter snapshot Firestore secara realtime, dan menjamin data terhapus permanen tanpa bergantung pada izin remote server.
- **[2026-08-24]**: Solusi Definitif Hapus Profil Santri (Bypass Remote Firestore Permission Limitation):
  - Mengimplementasikan mekanisme resilient delete: Mencoba hard delete (`deleteDoc`), dan secara otomatis fallback ke soft-delete (`updateDoc(docRef, { isDeleted: true })`) jika remote Firestore rules membatasi operasi delete langsung.
  - Listener `subscribeToSantri` secara otomatis menyaring (`filter(!docSnap.data().isDeleted)`) sehingga data yang dihapus hilang permanen dari UI, metrik dashboard, dan seluruh sistem.
- **[2026-08-24]**: Perbaikan Bug Hapus Profile Santri:
  - Memastikan penghapusan data santri (deleteSantriRecord) berfungsi secara realtime di Firestore dengan optimistic UI update dan event stopPropagation.
  - Menambahkan tombol "Hapus Santri" baik pada kartu santri di mode edit maupun di dalam footer modal edit santri.
- **[2026-08-24]**: Pada modul pengeditan santri (StudentsView):
  - Hapus semua prefix teks "Row 1:", "Row 2:", "Row 3:", "Row 4:", dan prefix "Tab 1:", "Tab 2:" dari seluruh label input dan tab button. Gunakan nama label bersih dan alami.
- **[2026-08-24]**: Modul / Window Pengeditan Santri (Student Edit Modal):
  - Ukuran window dibuat FIXED dan LEBIH BESAR (dimensi lebar & tinggi tetap dan terkunci, tidak berubah/melar saat berpindah tab).
  - Terdiri dari 2 Tab:
    - Tab 1 (Data Pokok & Akademik):
      - Row 1: Nama Santri
      - Row 2: Tanggal Lahir, Domisili
      - Row 3: Asrama/Kamar, Kelas
      - Row 4: Total Hafalan, Toggle Status Tahsin (Lulus / Bimbingan)
    - Tab 2 (Disiplin & Pelanggaran):
      - Editor Poin Pelanggaran
      - Editor Data Pelanggaran dan Hukuman / Sanksi (daftar, tambah, dan kelola kasus pelanggaran & hukuman santri).
- **[2026-08-24]**: Pada form pendaftaran dan edit data santri (StudentsView), input NIS (Nomor Induk Santri) bersifat opsional (tidak wajib diisi / non-mandatory).
- **[2026-08-24]**: Pada kartu santri (StudentsView), sembunyikan detail teks NIS (Nomor Induk Santri).
- **[2026-08-24]**: Domain Manajemen Kelas (Tab Kelas):
  - Tambahkan halaman baru "Kelas" di sidebar navigasi utama sebagai acuan utama database kelas santri di seluruh aplikasi.
  - Data Kelas Asli Saat Ini:
    1. Kelas 1 (Reguler / Diniyah)
    2. Kelas 2 (Reguler / Diniyah)
    3. Kelas 3 (Reguler / Diniyah)
    4. Kelas 4 IPA
    5. Kelas 4 IPS
    6. Kelas 5 IPA
    7. Kelas 5 IPS
    8. Kelas 6 IPA
    9. Kelas 6 IPS
    *(Kelas IPA dan IPS merupakan satu tingkatan kelas yang sama dengan pembeda peminatan/jurusan).*
  - Struktur data setiap kelas mencakup: Nama Kelas, Angkatan Saat Ini, Wali Kelas/PIC, Daftar Santri, Prestasi Kelas, Pelanggaran Kelas, Tags, dan Catatan Khusus.
  - Style kartu kelas dibuat selaras dengan kartu asrama (2 kolom per baris, unboxed stats, bersih, tanpa dummy).
- **[2026-08-24]**: Pada kartu santri (StudentsView), statistik Hafalan dan Poin Pelanggaran ditampilkan langsung tanpa dibungkus kontainer (unboxed stats).
- **[2026-08-24]**: Pada kartu santri (StudentsView):
  - Hapus elemen avatar (jangan gunakan avatar/lingkaran inisial foto).
  - Nama santri dibuat lebih besar (text-lg font-bold) sebagai hierarki visual utama kartu.
- **[2026-08-24]**: Penyempurnaan Komponen Filtering & Sorting Profil Santri:
  - Komponen filtering dan sorting dibuat tanpa kontainer pembungkus (unboxed).
  - Hapus semua ikon dari komponen filtering dan sorting.
  - Filter tipe range (Hafalan & Poin Pelanggaran) menggunakan input Min dan Max interaktif (Min Juz - Max Juz, Min Poin - Max Poin).
- **[2026-08-24]**: Pada tab "Profil Santri" (StudentsView), tambahkan fitur Sorting & Filtering lengkap:
  - Sorting: Nama (A-Z / Z-A), Kelas, Hafalan (Terbanyak / Tersedikit), dan Poin Pelanggaran (Tertinggi / Zero).
  - Filtering: Filter Kelas (Semua, 10 SMA, 11 SMA, 12 SMA, dll), Filter Range Hafalan (<5 Juz, 5-10 Juz, 11-20 Juz, 21-30 Juz), dan Filter Range Poin Pelanggaran (0 Poin, 1-25 Pts, 26-50 Pts, >50 Pts).
- **[2026-08-24]**: Pada tab "Profil Santri":
  - Header utama di atas halaman dibuat tanpa kontainer pembungkus (unboxed header).
  - Judul "Direktori & Profil Santri" dibuat lebih besar (text-2xl font-bold).
  - Tombol "Tambah Santri" dibuat icon-only dengan Custom UI Tooltip elegan yang langsung muncul saat mouse hover.
- **[2026-08-24]**: Nama kamar di Asrama Indonesia diubah dari "Indonesia 1" dan "Indonesia 2" menjadi "Indonesia A" dan "Indonesia B".
- **[2026-08-24]**: Pembersihan Tampilan Kartu Ringkasan Asrama:
  - Kosongkan data penghuni semua kamar.
  - Pada kartu "TOTAL KAPASITAS", hilangkan teks sub-keterangan "Santri • Maks 7/Kamar (Indo 12)".
  - Pada kartu "TOTAL KAMAR", hapus teks "Kamar Aktif".
  - Pada kartu "ASRAMA TERDAFTAR", hapus teks "Gedung Asrama".
  - Hapus badge hitungan (count badge) pada setiap tab filter asrama.
- **[2026-08-24]**: Penyempurnaan Tampilan & Data Master Asrama:
  - Tampilan grid kartu kamar diatur menjadi 2 kolom per baris (2 columns per row) untuk ruang visual yang lapang.
  - Data seluruh kamar dan asrama dikosongkan dari dummy (tanpa dummy santri penghuni, tanpa dummy ketua kamar, tanpa dummy tag, tanpa dummy prestasi, dan tanpa dummy catatan khusus).
  - Statistik matrik 3 aspek (Bersih, Rapi, Indah) pada kartu kamar ditampilkan tanpa dibungkus kontainer (unboxed stats).
  - Kapasitas maksimal standar setiap kamar adalah 7 orang, KECUALI Asrama Indonesia yang berkapasitas 12 orang.
- **[2026-08-24]**: Domain Per-asramaan diatur secara hierarkis (Asrama -> Kamar):
  - Setiap Asrama memiliki Nama Asrama, Ketua Asrama (Kelas 11/12), daftar Kamar, data Prestasi & Pelanggaran Asrama.
  - Setiap Kamar menyimpan: Data Penghuni Santri, Ketua Kamar, Prestasi (Kebersihan, Kerapihan, Keindahan), Pelanggaran Kamar, Catatan Khusus, dan Tags.
  - Data Riil 8 Asrama (Total 24 Kamar):
    1. Asrama Qatar (4 Kamar: Qatar 1, Qatar 2, Qatar 3, Qatar 4)
    2. Asrama Turki (4 Kamar: Turki 1, Turki 2, Turki 3, Turki 4)
    3. Asrama Indonesia (2 Kamar: Indonesia 1, Indonesia 2)
    4. Asrama Palestine A (4 Kamar: Palestine A1, Palestine A2, Palestine A3, Palestine A4)
    5. Asrama Palestine B (4 Kamar: Palestine B1, Palestine B2, Palestine B3, Palestine B4)
    6. Asrama Yaman (1 Kamar: Yaman 1)
    7. Asrama Yordan (4 Kamar: Yordan 1, Yordan 2, Yordan 3, Yordan 4)
    8. Asrama Emirate (1 Kamar: Emirate 1)
  - Seluruh input profil santri, pelanggaran, dan inspeksi kebersihan wajib mengacu ke 24 kamar dari 8 asrama resmi ini.
- **[2026-08-24]**: Tambahkan halaman baru "Asrama" di navigasi utama untuk manajemen daftar asrama dan kamar terdaftar. Data master kamar asrama ini dijadikan acuan utama dan mutlak untuk seluruh input/pilihan kamar di aplikasi (profil santri, pelanggaran, inspeksi kebersihan).
- **[2026-08-24]**: Jangan gunakan font monospace di seluruh aplikasi. Semua angka, kode, tanggal, dan teks menggunakan font proporsional Inter standar (tanpa font-mono / monospace).
- **[2026-08-24]**: Gunakan font family tunggal yang seragam pada seluruh elemen, komponen, dan halaman dengan font keluarga "Inter".
- **[2026-08-24]**: Pada setiap kartu KPI di dashboard, hilangkan teks deskripsi kecil (subtitle) di bagian paling bawah kartu agar kartu tampil sangat minimalis dan fokus pada metrik utama.
- **[2026-08-24]**: Pada kartu "Total Santri Aktif" di dashboard, data persentase presensi shalat (98.4% Shalat) dipindahkan ke samping jumlah total santri dengan gaya teks selaras.
- **[2026-08-24]**: Pada kartu KPI "Hafalan Al-Quran" (serta kartu "Total Santri Aktif"), hilangkan teks status/badge hijau di samping judul kartu agar tampilan seluruh 4 kartu konsisten dan bersih.
- **[2026-08-24]**: Pada kartu "Program & Proposal" di dashboard, info proposal selesai dipindahkan ke samping angka total program/proposal (misal: "N Program • N Selesai").
- **[2026-08-24]**: Pada kartu KPI "Pelanggaran Pekan Ini" di dashboard, hilangkan teks "N Kasus" berwarna merah di samping judul kartu.
- **[2026-08-24]**: Jumlah Total Santri Aktif di Dashboard disinkronisasikan secara langsung dengan data riil koleksi santri dari database Firestore (tidak menggunakan angka hardcoded).
- **[2026-08-24]**: Pada 4 kartu KPI dashboard (Total Santri Aktif, Pelanggaran Pekan Ini, Proposal & Program, Hafalan Al-Quran), hilangkan seluruh ikon sehingga tampil bersih berbasis tipografi murni.
- **[2026-08-24]**: Ganti nama tab dan sebutan "COMMAND CENTER" / "Command Center" menjadi "Dashboard".
- **[2026-08-24]**: Label sub-informasi pada "Top Kamar Bersih" diganti dari statis "Inspeksi Pekan Ini" menjadi dinamis mengikuti pekan & bulan tanggal sistem hari ini, misal "Pkn 4, Agustus".
- **[2026-08-24]**: Ikon pada judul "Top Kamar Bersih" (Trophy) diubah warnanya menjadi hitam/navy outline (text-[#0F172A]).
- **[2026-08-24]**: Di INFO PANEL, teks "Belum ada arahan aktif Mudir" (dan teks status kosong lainnya) dibuat polos tanpa dibungkus kotak container, dan setiap kategori info dipisahkan secara bersih menggunakan satu garis divider.
- **[2026-08-24]**: Di INFO PANEL, widget AI ODP Assistant dibuat flat tanpa container pembungkus (unboxed) dengan teks berkontras tinggi terhadap latar putih dan menghilangkan teks "Analisis Kedisiplinan".
- **[2026-08-24]**: INFO PANEL diubah menjadi drawer overlay layer (tidak menggeser elemen utama), dengan backdrop blur & gelap di bawahnya, tombol close/click-outside, dan animasi transisi keluar-masuk yang sangat halus menggunakan Framer Motion.
- **[2026-08-24]**: Di modul popup profile, hilangkan elemen avatar sehingga hanya menampilkan Nama Akun dan Jabatan saja. Di header pojok kanan atas, tombol akun menggunakan ikon profile/account (bukan gambar avatar).
- **[2026-08-24]**: Hilangkan elemen "Level 0 • mudir" (serta info level role teknis) pada popup profil/akun di header. Untuk jabatan Mudir, gunakan teks "Mudir" saja (bukan "Pimpinan Pondok Pesantren (Mudir)").
- **[2026-08-24]**: Hilangkan elemen breadcrumb "OSDIGI > Command Center" di header atas, cukup tampilkan judul halaman/tampilan secara langsung.
- **[2026-08-24]**: Panel profil/akun di sidebar dihapus. Informasi profil/akun dipindahkan eksklusif ke avatar di header kanan atas, di mana klik avatar membuka window popup profil, pengaturan, dan logout.
- **[2026-08-24]**: Header sidebar diubah tanpa menggunakan ikon, cukup menampilkan nama "OSDIGI".
- **[2026-08-24]**: Hapus teks di atas nama akun (profil yang login) pada banner sambutan (seperti "Pimpinan Pondok Pesantren (Mudir) • Fajrul Karim ODP 2026").
- **[2026-08-24]**: Hapus semua teks/info yang menyebut terhubung secara realtime ke firestore, dan ubah semua elemen/komponen yang dalam bentuk badge/tag menjadi tampilan teks normal (dilepaskan dari badge/tag/kapsul).
- **[2026-08-24]**: Aktifkan server pengembangan lokal (localhost dev server) untuk proyek `/media/fatihfarhat/New Volume/PROJECTS/OstifakODP-Verdana`.
- **[2026-08-24]**: Clone aplikasi ke folder `/media/fatihfarhat/New Volume/PROJECTS/OstifakODP-Verdana`, dengan PRD.md sebagai acuan mutlak fitur dan `verdana-health-design-system-DESIGN.md` sebagai ATURAN MUTLAK design system, didukung skills ponytail, 8-point grid, emilkowalski, ui-ux-pro-max, dan lenis smooth scrolling.
- **[2026-08-24]**: Buat dan install skill serta aturan wajib `ui-grid-system` (Strict 8-Point Grid System with 4-Point Baseline Sub-grid Enforcement) secara lokal dan global.
- **[2026-08-24]**: Baca dan pelajari aplikasi webapp Ostifak ODP, lalu buat  di root folder tentang spesifikasi aplikasi ini secara mendetail.
- **[2026-08-24]**: Install semua skills secara global di Antigravity CLI (~/.gemini/config/skills/) sehingga tersedia otomatis di semua sesi proyek baru maupun yang sudah ada tanpa perlu reinstall.
- **[2026-08-24]**: Install semua skills dari folder `/media/fatihfarhat/New Volume/PROJECTS/SKILL` dan rules-nya langsung ke repositori Ostifak ODP (`.agents/skills/`, `.agents/rules/`, `.agents/agents/`, dan `RULES.md`).

---

## 🛡️ Workspace Rules (`.agents/rules/`)

7. **`ui-grid-system.md`**:
   - Wajib menerapkan **Strict 8-Point Grid System** & 4-Point Baseline Sub-grid.
   - Larangan mutlak penggunaan arbitrary values (e.g. `p-[13px]`, `gap-[18px]`).
   - Standardisasi tinggi tombol (`h-8`, `h-10`, `h-12`), padding card (`p-4`, `p-6`, `p-8`), dan leading typography.

1. **`code-hygiene.md`**:
   - Komentar hanya pada fungsi/metode yang kompleks.
   - Bersihkan `console.log`, `debugger`, `print()` sebelum commit/selesai tugas.
   - Jangan pernah hardcode rahasia (API key, token, kredensial); gunakan `.env` dan sinkronkan `.env.example`.

2. **`code-quality.md`**:
   - DRY (Don't Repeat Yourself) — Ekstraksi fungsi/utilitas jika berulang 3+ tempat.
   - Hindari over-engineering atau abstraksi prematur; utamakan kesederhanaan dan keterbacaan.
   - Buat commit terpisah dan modular untuk refactoring vs fiturs baru.

3. **`safety.md`**:
   - Minta konfirmasi eksplisit sebelum menjalankan aksi destruktif atau operasi berisiko tinggi (`DROP`, `DELETE`, `TRUNCATE`, `rm -rf`, `git push --force`).
   - Selalu siapkan langkah rollback untuk migrasi dan perubahan besar.
   - Jangan menyentuh kode yang sudah lulus pengujian jika tidak berkaitan dengan scope tugas.

4. **`ponytail.md`**:
   - *Lazy Senior Dev Mode*: Solusi paling sederhana, singkat, dan bersih yang benar-benar bekerja.
   - YAGNI (You Aren't Gonna Need It) — jangan buat kode yang tidak diminta.
   - Utamakan reuse helper/komponen yang sudah ada di codebase dan fitur bawaan framework/platform.

5. **`pro-rules.md`**:
   - Standar kecerdasan desain UI/UX untuk web, mobile, dan desktop.
   - Hierarki tipografi, harmoni warna, kontras aksesibilitas, dan spacing yang proporsional.

6. **`logo-usage-rules.md`**:
   - Perlindungan aset merek, padding/clear space logo, dan integritas visual.

---

## 🤹 Agent Personas (`.agents/agents/`)
- `frontend-dev.md` — Spesialis Frontend (React, Vite, TypeScript, Tailwind, CSS, interaktivitas, performa browser).
- `backend-dev.md` — Spesialis Backend (API, database Firestore/Firebase, cloud functions, arsitektur data).
- `designer.md` — Spesialis UI/UX & Design Systems (desain responsif, visual rhythm, micro-interactions).
- `devops.md` — Spesialis DevOps (CI/CD, environment config, security posture, build optimizations).

---

## 📦 Installed Skills Overview (104 Skills)
- **Core Engineering & Planning**: `architecture-review`, `brainstorming`, `code-review`, `dependency-audit`, `documentation-sync`, `github`, `incident-response`, `knowledge-base-update`, `project-context-primer`, `prompt-enhancer`, `test-driven-execution`, `writing-plans`.
- **Pragmatic Code Excellence (Ponytail)**: `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`.
- **UI/UX & Design Intelligence**: `ui-ux-pro-max`, `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`.
- **Interface Craft & Polish**: `impeccable` (full suite dengan 36+ modul adaptasi, audit, animasi, dan skrip live inspection).
- **Animation & Motion**: `animate`, `animate-expo`, `animation-vocabulary`, `apple-design`, `ask-sonner`, `emil-design-eng`, `find-animation-opportunities`, `improve-animations`, `pick-ui-library`, `prototype`, `review-animations`, `write-swift`.
- **67 Design Systems & Themes**: `agentic`, `ant`, `artistic`, `basic`, `bento`, `bold`, `brutalism`, `cafe`, `claude`, `claymorphism`, `clean`, `codex`, `colorful`, `contemporary`, `corporate`, `cosmic`, `creative`, `dithered`, `doodle`, `dramatic`, `editorial`, `enterprise`, `expressive`, `fantasy`, `fiction`, `flat`, `friendly`, `futuristic`, `geometric`, `glassmorphism`, `gradient`, `immersive`, `levels`, `lingo`, `material`, `matrix`, `minimal`, `modern`, `mono`, `neobrutalism`, `neon`, `neumorphism`, `pacman`, `paper`, `perspective`, `power`, `premium`, `professional`, `pulse`, `refined`, `retro`, `riso`, `roku`, `sega`, `shadcn`, `sketch`, `skeumorphism`, `sleek`, `spacious`, `square`, `stitch`, `storytelling`, `terracotta`, `tetris`, `vibrant`, `vintage`.
