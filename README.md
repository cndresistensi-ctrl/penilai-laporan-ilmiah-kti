# Ruang Nilai — Penilaian Laporan Ilmiah & KTI

Aplikasi gratis untuk menilai laporan ilmiah dan Karya Tulis Ilmiah dengan rubrik berbobot, dokumentasi masukan, dan rekap penilaian lokal.

## Fitur
- Form identitas karya, penulis, penilai, institusi, dan tanggal.
- Rubrik 5 aspek dengan bobot total 100% dan skor 1–4.
- Perhitungan nilai, predikat, serta rekomendasi tindak lanjut otomatis.
- Draft formulir tersimpan otomatis di browser.
- Riwayat dan ringkasan penilaian tersimpan menggunakan `localStorage`.
- Ekspor penilaian dan rekap riwayat ke CSV.
- Cetak laporan atau simpan sebagai PDF melalui dialog cetak browser.
- Desain responsif untuk desktop dan ponsel.

## Menjalankan
Buka `index.html` di browser. Tidak ada instalasi atau build yang diperlukan.

## Deploy ke Netlify
Repository ini adalah situs statis. Hubungkan repo GitHub ini ke Netlify dan gunakan:
- Build command: kosong
- Publish directory: `.`

Konfigurasi sudah tersedia di `netlify.toml`.

## Catatan privasi dan batasan
- Semua data penilaian disimpan di penyimpanan lokal browser/perangkat yang digunakan. Data tidak dikirim ke server, tidak tersedia lintas perangkat, dan dapat hilang jika data browser dihapus.
- Gunakan tombol ekspor CSV untuk mencadangkan atau memindahkan rekap.
- Aplikasi ini belum menyediakan akun, sinkronisasi cloud, kolaborasi penilai, atau basis data terpusat.
- Bobot, batas predikat, dan rekomendasi adalah contoh awal. Lembaga sebaiknya menyesuaikannya dengan pedoman resmi dan menguji konsistensi rubrik sebelum digunakan untuk keputusan formal.
- Penilaian ini mendukung evaluasi manusia; skor dan rekomendasi bukan pengganti telaah akademik.
