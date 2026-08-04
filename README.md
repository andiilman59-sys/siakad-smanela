# SIAKAD SMAN 1 Lawang

Sistem Informasi Akademik (SIAKAD) untuk SMAN 1 Lawang - Aplikasi web manajemen data akademik sekolah.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: Tailwind CSS + shadcn/ui
- **Form**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer

## Cara Install & Jalankan

```bash
# 1. Clone repository
git clone <url>
cd siakad-smanela

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan values dari Supabase project kamu

# 4. Jalankan development server
npm run dev
```

Buka http://localhost:3000 di browser.

## Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Ambil `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari Settings > API
3. Ambil `SUPABASE_SERVICE_ROLE_KEY` dari Settings > API (untuk server actions admin)
4. Jalankan migration SQL:
   - Buka Supabase Dashboard > SQL Editor
   - Copy-paste isi `supabase/migrations/20240101000000_initial_schema.sql` lalu Run
   - Copy-paste isi `supabase/migrations/20240101000001_rls_policies.sql` lalu Run
5. Jalankan seed data:
   - Copy-paste isi `supabase/seed.sql` lalu Run
6. Buat auth users di Supabase Dashboard > Authentication > Users

## Struktur Project

```
siakad-smanela/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (dashboard)/          # Dashboard area (dengan sidebar)
│   │   │   ├── dashboard/        # Dashboard utama
│   │   │   ├── master-data/      # CRUD Master Data
│   │   │   │   ├── siswa/
│   │   │   │   ├── guru/
│   │   │   │   ├── kelas/
│   │   │   │   ├── mapel/
│   │   │   │   └── tahun-ajaran/
│   │   │   ├── jadwal/           # Jadwal pelajaran
│   │   │   ├── presensi/         # Absensi siswa
│   │   │   ├── penilaian/        # Input nilai
│   │   │   ├── kedisiplinan/     # Poin pelanggaran
│   │   │   ├── pengumuman/       # Pengumuman sekolah
│   │   │   └── notifikasi/       # Notifikasi in-app
│   │   ├── login/                # Halaman login
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── sidebar.tsx           # Sidebar navigasi
│   │   └── navbar.tsx            # Top navbar
│   ├── hooks/
│   │   └── use-user.ts           # User hook
│   ├── lib/
│   │   ├── utils.ts              # Utility functions
│   │   └── supabase/             # Supabase clients
│   │       ├── client.ts         # Browser client
│   │       ├── server.ts         # Server client
│   │       └── admin.ts          # Admin client
│   └── types/
│       └── database.ts           # TypeScript types
├── supabase/
│   ├── migrations/               # Database migrations
│   └── seed.sql                  # Seed data
├── .env.example                  # Env var template
└── package.json
```

## User Roles

| Role | Akses |
|------|-------|
| Super Admin | Full access ke semua fitur |
| Admin/TU | Kelola data siswa, guru, kelas |
| Kepala Sekolah | Dashboard & laporan |
| Waka Kurikulum | Kelola kurikulum, jadwal, mapel |
| Guru | Input nilai & presensi |
| Wali Kelas | Rekap kelas, cetak rapor |
| Siswa | Lihat jadwal, nilai, presensi |
| Orang Tua | Pantau perkembangan anak |

## Deploy ke Vercel

1. Push repository ke GitHub
2. Hubungkan ke Vercel
3. Set environment variables di Vercel Dashboard
4. Deploy

## Catatan

- **Asumsi Default**: Bobot nilai Tugas 25%, UH 25%, UTS 25%, UAS 25%
- **Semester**: Ganjil (Juli-Desember), Genap (Januari-Juni)
- **Jumlah Pelajaran**: 5 jam pelajaran per hari
- **Saat ini**: UI berjalan dengan mock data tanpa koneksi Supabase. Untuk mengaktifkan Supabase, isi .env.local dengan kredensial yang valid.
