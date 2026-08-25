# Product Requirements Document (PRD) — OSTIFAK Digital Portal (ODP)

## 📌 Document Metadata
- **Project Name:** OSTIFAK Digital Portal (ODP)
- **Institution:** Pondok Pesantren Tahfizh Fajrul Karim
- **Target Audience:** Pimpinan Pesantren (Mudir), Dewan Pembina, Badan Pengurus Harian (BPH), Ketua Divisi OSTIFAK, dan Santri
- **Version:** 1.0.0 (Production Architecture & Specification)
- **Status:** Active / Ready for Development & Scaling
- **Last Updated:** 2026-08-24

---

## 1. 🎯 Executive Summary & Vision

### 1.1 Background & Context
Organisasi Santri Tahfizh Fajrul Karim (**OSTIFAK**) adalah badan otonom santri yang mengelola roda kedisiplinan, keibadahan, bahasa, kebersihan, kesehatan, dan kegiatan ekstrakurikuler di lingkungan Pondok Pesantren Tahfizh Fajrul Karim. Sebelumnya, pencatatan pelanggaran, presensi halaqah, penilaian kamar, perizinan, dan pengajuan proposal dilakukan secara manual melalui kertas dan buku jurnal yang rentan hilang, tidak transparan, dan lambat dalam pelaporan kepada Pimpinan Pesantren (Mudir).

### 1.2 Product Vision
**OSTIFAK Digital Portal (ODP)** dibangun sebagai *Single Source of Truth* dan *Integrated Management Command Center* yang menghubungkan hierarki kepemimpinan pesantren—mulai dari Mudir, Pembina, hingga seluruh Divisi Operasional—secara real-time, transparan, objektif, dan terstruktur.

### 1.3 Strategic Goals
1. **Disiplin Objektif Berbasis Poin:** Mengeliminasi subjektivitas sanksi santri melalui sistem skor poin pelanggaran (*Point-Based Discipline Tracker*) dan pencatatan sidang Mahkamah.
2. **Visibilitas Eksekutif Top-Down:** Memungkinkan Mudir menerbitkan instruksi resmi (*Directives*) yang langsung terdistribusi ke seluruh divisi dengan notifikasi prioritas tinggi.
3. **Sentralisasi Profil Santri (360° Profile):** Menghubungkan rekam jejak santri (hafalan Quran, shalat berjamaah, kamar asrama, dan poin pelanggaran) dalam satu kartu identitas terpadu.
4. **Akuntabilitas Program Kerja & Keuangan:** Pengajuan proposal kegiatan digital dari divisi ke Pembina dan BPH dengan indikator progres, estimasi anggaran kas, dan status persetujuan transparan.

---

## 2. 👥 User Personas & Role-Based Access Control (RBAC)

Sistem ODP menerapkan hierarki otorisasi 5 level (`RoleLevel 0` hingga `RoleLevel 4`):

| Level | Role Identifier | Jabatan / Persona | Akun Default | Ruang Lingkup Otorisasi |
| :--- | :--- | :--- | :--- | :--- |
| **Level 0** | `mudir` | Pimpinan Pondok Pesantren | `mulhatalinuh@ostifak.edu` | **Executive Oversight**: Monitoring seluruh divisi, menerbitkan *Mudir Directives*, melihat rekapitulasi analitik dan metriks pesantren. |
| **Level 1** | `pembina` | Super Admin / Dewan Pembina | `pembina@ostifak.edu` | **Super Administrator**: Approval proposal anggaran, manajemen data master santri, hak hapus/kelola Firestore, inisialisasi akun resmi. |
| **Level 2** | `bph` | Sekretaris & Bendahara OSTIFAK | `secretary@ostifak.edu` | **Administrative Central**: Rekapitulasi proposal lintas divisi, manajemen surat masuk/keluar, pelaporan keuangan kas BPH. |
| **Level 3** | `ketua_divisi` | Ketua Divisi Operasional (8 Divisi) | *(Lihat Akun Divisi)* | **Divisional Operator**: Pencatatan data operasional harian divisi (pelanggaran, piket, inspeksi roan, log santri sakit, usulan proposal). |
| **Level 4** | `santri` | Santri / Anggota Organisasi | Santri Pesantren | **Read-Only / Directory View**: Melihat status hafalan, skor kamar, dan presensi pribadi. |

### 2.1 Daftar 9 Divisi Resmi OSTIFAK
1. **Divisi Keamanan (`keamanan`)**: Penegakan disiplin santri, pencatatan kasus berbobot poin, sidang mahkamah, dan barang sitaan.
2. **Divisi Ibadah & Masjid (`ibadah`)**: Presensi shalat 5 waktu berjamaah, jadwal imam/muadzin, kebersihan masjid, dan piket ibadah.
3. **Divisi Tahfizh & Diniyah (`tahfizh`)**: Mutabaah halaqah Al-Quran, setoran hafalan harian, target juz, dan presensi KBM diniyah.
4. **Divisi Bahasa / Lughah (`bahasa`)**: Penegakan bahasa resmi Arab & Inggris (Biah Lughawiyyah), Jasus language tracker, mufrodat harian.
5. **Divisi Kebersihan & Asrama (`kebersihan`)**: Inspeksi roan mingguan, penilaian kebersihan kamar asrama (*cleanliness score & rank*), pemeliharaan fasilitas.
6. **Divisi Kesehatan & UKS (`kesehatan`)**: Log santri sakit, inventaris obat-obatan, penanganan pertama, dan izin rujukan klinik/RS.
7. **BPH & Kas Organisasi (`bph`)**: Pengarsipan surat resmi, pengajuan anggaran kegiatan, monitoring kas operasional OSTIFAK.
8. **Kotak Saran Digital (`saran`)**: Kanal aspirasi, kritik, dan masukan santri yang difilter dan dikelompokkan secara digital.

---

## 3. 🏗️ Tech Stack & System Architecture

### 3.1 Architecture Overview
Aplikasi dibangun menggunakan arsitektur **Single Page Application (SPA)** modern dengan integrasi database *serverless realtime* Google Firebase.

```
+--------------------------------------------------------+
|               Frontend Layer (React 19 + Vite)         |
|  - Tailwind CSS v4 Engine (Verdana/Islamic Theme)      |
|  - Lucide React Iconography & Motion Transitions       |
|  - Role Context & Persistent Auth State                |
+-------------------------+------------------------------+
                          | (Realtime WebSocket / REST SDK)
+-------------------------v------------------------------+
|             Firebase Cloud Services Infrastructure     |
|  - Firebase Authentication (Email/Password Tokens)     |
|  - Cloud Firestore (Realtime NoSQL Reactive DB)        |
|  - Firestore Security Rules (Granular Role Check)      |
+--------------------------------------------------------+
```

### 3.2 Frontend Specifications
- **Core Framework:** React 19 (`19.0.1`) + TypeScript (`~5.8.2`)
- **Build Tool:** Vite 6 (`6.2.3`)
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite: ^4.1.14`)
- **UI Components:** Modular Custom Design System (`verdana-health-design-system-DESIGN.md`)
  - Dominan Warna: *Deep Forest Green* (`#1E3D23`), *Emerald Sage* (`#059669` / `#E8F2EA`), *Navy Slate* (`#0F172A`), *Card Surface* (`#FFFFFF`), *Background Canvas* (`#F4F6F8`).
- **Icons & Animation:** `lucide-react` (`^0.546.0`), `motion` (`^12.23.24`)

### 3.3 Backend & Database Specifications
- **SDK:** `firebase` (`^12.16.0`)
- **Auth Provider:** Firebase Authentication with fallback pre-seeded account configs.
- **Database Engine:** Google Cloud Firestore NoSQL Database.
- **Configuration Hub:** `firebase-applet-config.json` + environment variables support (`VITE_FIREBASE_*`).

---

## 4. 🗄️ Firestore Data Schema & Collections

### 4.1 Collection: `users`
Menyimpan data profil pengguna, level otorisasi, dan afiliasi divisi.
```typescript
interface UserProfile {
  id: string;             // Document ID (email-sanitized or Auth UID)
  name: string;           // Nama Lengkap Pengurus/Ustadz
  email: string;          // Email resmi @ostifak.edu
  role: UserRole;         // "mudir" | "pembina" | "bph" | "ketua_divisi" | "santri"
  roleLevel: RoleLevel;   // 0 | 1 | 2 | 3 | 4
  roleTitle: string;      // Contoh: "Ketua Divisi Keamanan & Mahkamah"
  divisionId?: string;    // "keamanan" | "ibadah" | "tahfizh" | dll.
  avatar: string;         // URL foto profil
}
```

### 4.2 Collection: `santri`
Direktori master seluruh santri di Pesantren Tahfizh Fajrul Karim.
```typescript
interface SantriRecord {
  id: string;             // Auto-generated Firestore ID
  studentName: string;    // Nama Lengkap Santri
  nis: string;            // Nomor Induk Santri (e.g. "2024.12.084")
  kamar: string;          // Asrama & Nomor Kamar (e.g. "Al-Farabi 01")
  kelas: string;          // Kelas Formal/Diniyah (e.g. "10 SMA Tahfizh")
  hafalan: string;        // Capaian Hafalan (e.g. "12 Juz")
  poinPelanggaran: number;// Akumulasi Poin Disiplin
  statusIbadah: string;   // Persentase / Status Shalat Berjamaah
  createdAt?: Timestamp;  // Server Timestamp
}
```

### 4.3 Collection: `pelanggaran`
Catatan rekam jejak kedisiplinan berbobot poin oleh Divisi Keamanan.
```typescript
interface ViolationRecord {
  id: string;             // Auto-generated Firestore ID
  studentName: string;    // Nama Santri Pelanggar
  nis: string;            // NIS Santri
  kamar: string;          // Kamar Asrama
  violation: string;      // Uraian Bentuk Pelanggaran
  category: string;       // "Disiplin Ibadah" | "Disiplin Bahasa" | "Kedisiplinan Berat" | dll.
  points: number;         // Poin Pelanggaran (+5 hingga +100)
  severity: SeverityLevel;// "ringan" | "sedang" | "berat"
  status: PenaltyStatus;  // "belum_dihukum" | "dalam_proses" | "selesai"
  date: string;           // Tanggal / Waktu Kejadian
  penaltyDescription: string; // Bentuk Takzir / Konsekuensi
  reportedBy: string;     // Nama Pelapor / Divisi
  divisionId?: string;    // Divisi Terkait (default: "keamanan")
  createdAt?: Timestamp;  // Server Timestamp
}
```

### 4.4 Collection: `proposal`
Pengajuan program kerja divisi, estimasi anggaran, dan laporan pelaksanaan.
```typescript
interface WorkProgram {
  id: string;             // Auto-generated Firestore ID
  title: string;          // Nama Kegiatan / Judul Proposal
  divisionId: DivisionId; // Divisi Pengaju
  divisionName: string;   // Label Nama Divisi
  status: ProgramStatus;  // "menunggu_persetujuan" | "direncanakan" | "dalam_proses" | "selesai"
  progress: number;       // Persentase Capaian (0 - 100%)
  targetDate: string;     // Target Tanggal Pelaksanaan
  budget?: string;        // Estimasi Kebutuhan Anggaran (e.g. "Rp 1.500.000")
  pic: string;            // Penanggung Jawab Kegiatan (Person In Charge)
  createdAt?: Timestamp;  // Server Timestamp
}
```

### 4.5 Collection: `directives`
Instruksi resmi top-down dari Mudir Pesantren.
```typescript
interface MudirDirective {
  id: string;             // Auto-generated Firestore ID
  title: string;          // Perihal / Judul Instruksi
  targetDivision: string; // Target Penerima ("Semua Divisi" | "Divisi Keamanan" | dll.)
  issuedDate: string;     // Waktu Penerbitan
  priority: "tinggi" | "sedang" | "normal";
  status: "aktif" | "selesai";
  content: string;        // Isi Instruksi Lengkap
  createdAt?: Timestamp;  // Server Timestamp
}
```

---

## 5. 🖥️ User Interface & Detailed Feature Specifications

### 5.1 Authentication View (`LoginPage.tsx`)
- **Design Layout:** Split-card elevation layout dengan aksen gradient *Islamic Emerald & Slate Dark*.
- **Features:**
  - Form login email dan password resmi.
  - **Quick Account Selector (10 Akun Divisi):** Kemudahan pengujian satu klik untuk login sebagai Mudir, Pembina, Sekretaris, atau Ketua Divisi tertentu.
  - **Firestore Seeding Trigger:** Tombol utilitas untuk menginisialisasi seluruh dokumen akun resmi ke dalam database Firestore bila belum terdaftar.
  - State persistence otomatis via `localStorage` (`ostifak_auth_user`).

### 5.2 Application Shell & Layout (`App.tsx`, `Sidebar.tsx`, `Header.tsx`, `RightPanel.tsx`)
- **Fixed Sidebar Navigation (260px):**
  - Brand Logo ODP Pesantren Fajrul Karim.
  - Kartu profil user aktif + indikator role level badge.
  - Tombol **Keluar / Log Out** eksplisit dengan proteksi penggantian sesi.
  - Menu navigasi utama: Dashboard, Santri Profile, Pelanggaran, Program Kerja, dan Direktif Mudir.
  - Accordion / list akses langsung ke 9 Divisi OSTIFAK.
- **Sticky Header Bar:**
  - Breadcrumb dinamis sesuai halaman aktif atau detail divisi.
  - Global Search Bar (dengan keyboard shortcut `⌘K`).
  - Tombol Quick Action *"Input Data"*.
  - Toggle buka/tutup Contextual Right Panel.
  - Bell notifikasi dengan counter badge merah realtime.
- **Right Contextual Panel (320px):**
  - **AI ODP Live Analysis:** Ringkasan analitik cerdas mengenai status kedisiplinan dan presensi santri.
  - **Mudir Directives Quick Widget:** Highlight instruksi aktif dari Pimpinan Pesantren.
  - **Top Kamar Bersih Leaderboard:** Ranking skor kebersihan kamar (#1, #2, #3).
  - **Live Activity Feed:** Log aktivitas pelanggaran dan proposal terkini.

### 5.3 Command Center Dashboard (`DashboardView.tsx`)
- **Executive Welcome Banner:** Sambutan resmi berbasis nama dan jabatan pengguna aktif.
- **4 KPI Executive Metrics Cards:**
  - Total Santri Aktif & Rasio Ibadah
  - Kasus Pelanggaran Pekan Ini
  - Rata-rata Skor Kebersihan Asrama
  - Pencapaian Target Hafalan Quran
- **Pill Tabs Filter:** *Semua Rekap*, *Pelanggaran & Mahkamah*, *Program Kerja Divisi*.
- **Quick Preview Tables & Cards:** Tabel pelanggaran teranyar dan kartu progres program kerja dengan progress bar visual.

### 5.4 Unified Santri Directory (`StudentsView.tsx`)
- **Unified 360° Profile:** Menampilkan foto inisial, NIS, kamar asrama, kelas diniyah, target hafalan, dan akumulasi poin pelanggaran dalam format kartu modern.
- **Realtime Search & Filtering:** Pencarian instan berdasarkan Nama Lengkap, NIS, atau Kamar.
- **Form Tambah Santri:** Modal/form penambahan santri baru langsung tersinkronisasi ke Firestore.

### 5.5 Disiplin, Poin & Mahkamah Santri (`ViolationsView.tsx`)
- **Point-Based Categorization:** Klasifikasi kasus `ringan`, `sedang`, dan `berat` (Sidang Mahkamah).
- **Status Pelanggaran:** Filter kasus `belum_dihukum`, `dalam_proses`, dan `selesai`.
- **Pelaporan Objektif:** Menampilkan nama santri, poin, jenis pelanggaran, tanggal, bentuk konsekuensi/takzir, dan nama pelapor.
- **New Violation Modal (`NewViolationModal.tsx`):** Form lengkap pencatatan kasus dengan validasi poin dan kategori.

### 5.6 Program Kerja & Proposal Kegiatan (`WorkProgramsView.tsx`)
- **Proposal Lifecycle:** `menunggu_persetujuan` -> `direncanakan` -> `dalam_proses` -> `selesai`.
- **Transparansi Anggaran:** Menampilkan estimasi biaya kas yang diajukan divisi dan PIC penanggung jawab.
- **Visual Progress Bar:** Tracking persentase pengerjaan kegiatan divisi (0 - 100%).
- **New Program Modal (`NewProgramModal.tsx`):** Form pengajuan proposal kegiatan baru.

### 5.7 Direktif & Arahan Mudir (`DirectivesView.tsx`)
- **Top-Down Command Gateway:** Kanal formal instruksi Pimpinan Pesantren.
- **Prioritas & Target:** Pemilihan tingkat prioritas (`tinggi`, `sedang`, `normal`) dan penentuan divisi tujuan (`Semua Divisi` atau spesifik).
- **Interactive Form:** Mudir dapat menerbitkan arahan baru yang langsung tersimpan di collection `directives`.

### 5.8 Detail & Manajemen Divisi (`DivisionDetailView.tsx`)
- **Dedicated Hub Per Divisi:** Menampilkan deskripsi tugas, badge khusus, filter program kerja spesifik divisi, dan tombol aksi khusus (misal: *Catat Pelanggaran* khusus pada Divisi Keamanan).

---

## 6. 🔒 Security & Firestore Rules Specification

Sesuai aturan pada `firestore.rules`:
- **Otentikasi:** Operasi tulis dan pembaruan data diamankan dengan fungsi helper berbasis status auth dan level role (`isMudir()`, `isPembina()`, `isBPH()`, `isDivisionStaff(division)`).
- **Proteksi Hapus Data:** Penghapusan data master (`users`, `santri`, `pelanggaran`, `proposal`) **hanya diizinkan** untuk akun berlevel Pembina/Super Admin (`roleLevel <= 1`) guna mencegah kehilangan data krusial secara tidak sengaja.
- **Kerahasiaan Kredensial:** Seluruh konfigurasi API Key dan token sensitif diisolasi melalui environment variables dan file konfigurasi lokal.

---

## 7. 🚀 Non-Functional Requirements (NFR)

1. **Performance & Responsiveness:**
   - First Contentful Paint (FCP) < 1.0s pada koneksi standar.
   - Hot module replacement (HMR) ultra-cepat via Vite engine.
   - Transisi antarmuka fluid 60fps menggunakan Tailwind CSS transitions.
2. **Reliability & Offline Tolerance:**
   - Mekanisme fallback otomatis ke data akun resmi lokal jika koneksi ke Firebase Auth mengalami latensi/gangguan jaringan.
3. **Accessibility (a11y) & UX Standards:**
   - Kontras warna teks memenuhi standar WCAG AA (rasio kontras minimal 4.5:1 untuk teks utama).
   - Label formulir jelas dengan helper text dan visual indicators status.
4. **Clean Code & Workspace Hygiene:**
   - Mematuhi pedoman `.agents/rules/code-hygiene.md`, `.agents/rules/code-quality.md`, dan `.agents/rules/safety.md`.

---

## 8. 🗺️ Future Roadmap & Enhancements

| Phase | Milestone | Rincian Fitur |
| :--- | :--- | :--- |
| **Phase 1 (Current)** | Core Command Portal | Auth, Realtime Firestore for 9 Divisions, Directives, Violations Tracker, Santri Directory. |
| **Phase 2** | Deep Divisional Forms | Form presensi shalat harian Divisi Ibadah, form mutabaah halaqah Divisi Tahfizh, dan form Jasus Tracker Divisi Bahasa. |
| **Phase 3** | Print & PDF Export | Fitur cetak Surat Mahkamah Santri, Surat Panggilan Wali Santri, dan Lembar Proposal/LPJ resmi bertandatangan digital. |
| **Phase 4** | Gemini AI Integration | Evaluasi otomatis sentimen Kotak Saran Santri dan rekomendasi otomatis takzir edukatif berbasis riwayat pelanggaran. |
