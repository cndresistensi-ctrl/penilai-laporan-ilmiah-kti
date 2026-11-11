# Ruang Nilai — versi full-stack untuk Vercel

Aplikasi full-stack Next.js untuk penilaian laporan ilmiah dan KTI. Autentikasi dan penyimpanan data memakai Supabase; Vercel menjalankan aplikasi Next.js.

## Yang tersedia
- Daftar dan masuk dengan email/kata sandi melalui Supabase Auth.
- CRUD penilaian persisten lintas perangkat.
- Row Level Security (RLS): setiap akun hanya dapat membaca dan mengubah penilaiannya sendiri.
- Rubrik 5 aspek berbobot 100%, skor, catatan, predikat, serta rekomendasi.
- Dashboard ringkas, ekspor CSV, dan cetak/simpan PDF.

## 1. Siapkan database Supabase
1. Buat project di https://supabase.com.
2. Buka **SQL Editor**, lalu jalankan isi `supabase/schema.sql`.
3. Dari **Project Settings → API**, salin Project URL dan `anon` / publishable key.
4. Authentication → Providers → Email: aktifkan provider email. Untuk produksi, atur konfirmasi email dan SMTP sesuai kebutuhan.

## 2. Hubungkan ke Vercel
1. Import repository GitHub ini ke Vercel sebagai project Next.js.
2. Tambahkan Environment Variables untuk Production (serta Preview jika perlu):
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/publishable key Supabase
3. Redeploy project. Build command standar `npm run build`; output biarkan otomatis ditangani Vercel.
4. Buka domain Vercel dan buat akun penilai.

**Jangan pernah menaruh `service_role` key di kode browser atau variabel `NEXT_PUBLIC_*`.** Aplikasi hanya memakai anon/publishable key dan kebijakan RLS.

## Pengembangan lokal
```bash
npm install
cp .env.example .env.local
npm run dev
```
Isi `.env.local` dengan URL dan anon key Supabase project Anda.

## Data dan rubrik
Data disimpan dalam tabel `public.assessments` di project Supabase Anda. Perubahan bobot, batas predikat, serta rekomendasi pada contoh ini perlu disahkan dan disesuaikan dengan pedoman lembaga sebelum digunakan untuk keputusan resmi. Aplikasi belum mempunyai organisasi/tenant, undangan penilai, atau peran admin.
