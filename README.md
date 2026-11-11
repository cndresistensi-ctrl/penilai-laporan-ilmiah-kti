# Ruang Nilai — Vercel + Supabase

Aplikasi full-stack Next.js untuk penilaian laporan ilmiah dan Karya Tulis Ilmiah. Supabase menyediakan autentikasi dan database; Vercel menjalankan aplikasi. Setup awal memerlukan akun Supabase dan Vercel.

## Siapkan Supabase
1. Buat project di [Supabase](https://supabase.com/).
2. Buka **SQL Editor**, tempel seluruh isi `supabase/schema.sql`, lalu jalankan.
3. Buka **Project Settings → API** dan salin **Project URL** serta **anon/publishable key**.
4. Di **Authentication → URL Configuration**, set **Site URL** ke domain produksi Vercel. Tambahkan juga domain Preview yang digunakan sebagai Redirect URL bila diperlukan.
5. Pilih kebijakan konfirmasi email sesuai kebutuhan. Jika konfirmasi email aktif, pengguna baru perlu mengonfirmasi alamatnya sebelum dapat masuk.

Skema membuat tabel `public.assessments`, mengaktifkan Row Level Security (RLS), serta membatasi akses tiap akun ke data miliknya sendiri. Skrip dapat dijalankan ulang.

## Deploy ke Vercel
1. Di Vercel, pilih **Add New → Project**, import `cndresistensi-ctrl/penilai-laporan-ilmiah-kti`.
2. Vercel mengenali Next.js dari konfigurasi repository. Biarkan build command dan output directory pada nilai default.
3. Di **Project → Settings → Environment Variables**, tambahkan untuk Production (dan Preview jika diperlukan):
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/publishable key Supabase.
4. Simpan, lalu deploy/redeploy. Build menggunakan `npm run build`.
5. Buka domain Vercel, buat akun, lalu masuk untuk mulai menilai.

Jika repository ini sudah terhubung ke Vercel, commit baru biasanya memicu deployment otomatis. Pastikan project menggunakan framework Next.js dan Node.js 20.x.

## Pengembangan lokal
```bash
npm install
cp .env.example .env.local
# Isi .env.local dengan URL dan anon/publishable key project Supabase
npm run dev
```
Buka `http://localhost:3000`. Cek tipe dengan `npm run typecheck`, atau build produksi dengan `npm run build`.

## Fitur
- Email/password sign-up dan login.
- Simpan, baca, edit, dan hapus penilaian pada Supabase.
- Statistik, rubrik berbobot, predikat, dan rekomendasi.
- Ekspor CSV per penilaian maupun rekap; cetak atau simpan PDF.
- Isolasi data per akun menggunakan kebijakan RLS.

## Keamanan dan batasan
- Gunakan hanya Supabase anon/publishable key di `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Jangan pernah menaruh service-role/secret key pada browser, GitHub, atau variabel `NEXT_PUBLIC_*`.**
- Jangan commit file `.env.local`; file tersebut diabaikan Git.
- Atur konfirmasi email, kebijakan kata sandi, dan SMTP sesuai kebutuhan produksi.
- Rubrik, bobot, batas predikat, dan rekomendasi masih contoh. Validasi terhadap pedoman lembaga sebelum dipakai untuk keputusan formal.
- Paket gratis Vercel/Supabase memiliki batas penggunaan dan dapat berubah; tinjau kuota dan ketentuan penyedia.
- Aplikasi saat ini mendukung akun individual. Peran admin, organisasi/tim, undangan penilai, audit log, dan kolaborasi belum tersedia.
