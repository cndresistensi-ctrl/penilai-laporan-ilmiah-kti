# Penilai Laporan Ilmiah & KTI

Aplikasi penilaian laporan ilmiah dan karya tulis ilmiah (KTI) gratis, ringan, dan siap dijalankan langsung di browser.

## Fitur
- Form identitas karya dan penilai
- Rubrik evaluasi 5 aspek
- Skor 1–4 per komponen
- Perhitungan otomatis dan predikat penilaian
- Tombol export CSV
- Tombol cetak / simpan sebagai PDF
- Tanpa backend, database, atau akun

## Cara pakai
1. Buka file `index.html` di browser.
2. Isi jenis karya, judul, penulis, dan penilai.
3. Pilih skor untuk setiap aspek.
4. Klik `Hitung Nilai`.
5. Jika diperlukan, klik `Export CSV` atau `Cetak / PDF`.

## Deploy ke Netlify
1. Masuk ke Netlify.
2. Pilih `Add new site` > `Import an existing project`.
3. Hubungkan ke GitHub dan pilih repositori ini.
4. Gunakan konfigurasi:
   - Build command: kosong / tidak perlu
   - Publish directory: `.`
5. Klik Deploy site.

## File yang tersedia
- `index.html` — aplikasi utama
- `README.md` — daftar penggunaan
- `netlify.toml` — konfigurasi deploy statis untuk Netlify

Aplikasi ini dapat berjalan langsung sebagai situs statis tanpa proses build.
