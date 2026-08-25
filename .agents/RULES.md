# Project Rules & Instructions — OstifakODP

## 📌 Acuan Utama & Mutlak (Primary Absolute Rule)
1. **Setiap ada instruksi tambahan, langsung kamu buat sebuah RULES.md file di folder .agents atau semacamnya dan catat semua intruksi tambahan selama pengerjaan proyek dan jadikan file instruksi itu sebagai acuan utama dan mutlak selalu benar.**

---

## 📝 Log Instruksi Tambahan (Project Instructions Record)
*Catat setiap instruksi baru dari user di bawah ini secara kronologis:*
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
