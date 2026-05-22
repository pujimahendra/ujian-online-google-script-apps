# Aplikasi Ujian Online (CBT) Berbasis Google Apps Script & Spreadsheet

Sistem Ujian Online / *Computer Based Test* (CBT) modern, ringan, dan aman yang dibangun menggunakan **Google Apps Script (GAS)** sebagai *backend* dan **Google Sheets** sebagai basis datanya (*database*). 

Sisi antarmuka (*frontend*) dirancang menggunakan HTML5, **Tailwind CSS**, dan JavaScript Vanilla dengan pendekatan **Single Page Application (SPA)** untuk memberikan pengalaman ujian yang lancar, dan responsif di HP/komputer.

---

## Fitur Utama

- **Autentikasi Email Terpusat:** Siswa masuk menggunakan email yang telah terdaftar di database `data_siswa`. Mencegah pengguna tidak sah mengikuti ujian.
- **Pengacakan Soal Dinamis:** Soal akan diacak secara otomatis oleh server setiap kali siswa masuk, sehingga meminimalkan risiko kecurangan antar siswa.
- **Dukungan Gambar Dinamis:** Setiap soal dapat memuat gambar secara opsional. Jika kolom gambar di spreadsheet diisi URL, gambar otomatis muncul dengan tata letak proporsional. Jika kosong, area gambar akan disembunyikan otomatis.
- **Opsi Jawaban Lengkap (A - E):** Mendukung hingga 5 pilihan jawaban (A, B, C, D, E) standar ujian sekolah menengah/kejuruan dan UTBK.
- **Timer & Batas Waktu Otomatis:** Penghitung waktu mundur adaptif berdasarkan jumlah soal. Sistem akan melakukan *auto-submit* jawaban jika waktu habis atau jika siswa mencoba menutup tab ujian secara sengaja.
- **Navigasi Grid Interaktif:** Panel kanan menyediakan nomor soal dalam bentuk grid yang berubah warna (biru jika sudah dijawab, putih jika belum) serta penanda khusus untuk soal yang sedang aktif dibuka.
- **Proteksi Kecurangan Tambahan:** Mencegah fungsi tombol kembali (*back button browser*) dengan memunculkan peringatan sistem.
- **Penilaian Instan & Otomatis:** Nilai murni langsung dihitung di sisi server setelah submit dan hasilnya langsung tercatat ke sheet `nilai_siswa` beserta log waktu pengerjaan, detail jawaban benar, dan jawaban salah.
- **Mekanisme Soft-Reset Logout:** Fitur kembali ke awal pasca-ujian menggunakan metode SPA reset. Solusi tuntas 100% aman yang menghindari *bug blank screen* (layar putih kosong) akibat restriksi Iframe Sandbox Google.

---

## Gambar Dokumentasi

Berikut hasil tangkapan layar:

### 1. Login
<img src="Dokumentasi login.png" width="500">

### 1. Ujian
<img src="Dokumentasi soal.png" width="500">

---

## Struktur Database (Google Sheets)

Aplikasi ini membutuhkan satu buah file Google Spreadsheet dengan 3 nama sheet berikut (pastikan penamaan sheet dan kolom sama persis):

### 1. Sheet: `data_siswa`
Tempat menyimpan data siswa yang berhak mengikuti ujian.
| id | nama | kelas | email |
| :--- | :--- | :--- | :--- |
| 1 | Budi Santoso | XI TKJ 1 | budi.santoso@kirimail.id |
| 2 | Siti Aminah | XI TKJ 2 | siti.aminah@suratku.co.id |

### 2. Sheet: `soal`
Tempat menyimpan bank soal ujian.
| id | gambar | soal | pilihan_a | pilihan_b | pilihan_c | pilihan_d | pilihan_e | Kunci Jawaban |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | *[URL_Gambar]* | Manakah komponen yang merupakan volatile memory? | HDD | SSD | RAM | ROM | Flashdisk | C |
| 2 | | Proses memecah masalah kompleks menjadi kecil disebut... | Dekomposisi | Abstraksi | Pola | Algoritma | Evaluasi | A |

### 3. Sheet: `nilai_siswa`
Tempat menampung hasil ujian siswa (akan terisi otomatis oleh sistem).
| id | nama | email | nilai | tanggal_submit | waktu_pengerjaan | jawaban_benar | Jawaban_salah |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *[UUID]* | Budi Santoso | budi.santoso@... | 90,00 | Senin, 18 Mei 2026 | 1 menit 45 detik | `[["1","C"], ...]` | `[["4","B"]]` |

---

## Panduan Instalasi dan Deployment

Ikuti langkah-langkah berikut untuk memasang aplikasi ini di akun Google Anda:

1. **Siapkan Google Spreadsheet:**
   - Buat spreadsheet baru di Google Drive Anda.
   - Buat 3 sheet dengan nama `data_siswa`, `soal`, dan `nilai_siswa` sesuai struktur di atas.

2. **Buka Google Apps Script:**
   - Pada menu bar spreadsheet, klik **Ekstensi** > **Apps Script**.

3. **Masukkan Kode Backend (`Kode.gs`):**
   - Hapus semua kode bawaan di dalam file `Kode.gs`.
   - Tempel (*paste*) kode backend Apps Script yang telah dikembangkan (fungsi `ambilSoal`, `verifikasiLogin`, `prosesSubmitUjian`, dll.).

4. **Buat File Antarmuka (`Index.html`):**
   - Di panel kiri Apps Script, klik tombol **+** (Tambah file) > **HTML**.
   - Beri nama file tersebut `Index` (sehingga menjadi `Index.html`).
   - Tempel (*paste*) seluruh kode antarmuka SPA Tailwind CSS yang telah diperbaiki.

5. **Lakukan Deployment (Penerapan):**
   - Klik tombol **Terapkan** (*Deploy*) di kanan atas > **Penerapan baru** (*New deployment*).
   - Pilih jenis penerapan: **Aplikasi Web** (*Web app*).
   - Atur konfigurasi:
     - **Jalankan sebagai (*Execute as*):** Saya (*Me / Akun Google Anda*).
     - **Yang memiliki akses (*Who has access*):** Siapa saja (*Anyone*).
   - Klik **Terapkan**. Salin **URL Aplikasi Web** yang diberikan untuk dibagikan kepada siswa.

---

## Teknologi yang Digunakan

- **Backend / Engine:** Google Apps Script
- **Database:** Google Sheets
- **Frontend Framework:** Tailwind CSS (via CDN)
- **Desain Arsitektur:** SPA (Single Page Application) dengan AJAX komunikasi asynchronous (`google.script.run`)
- **Bantuan Pengembangan:** Menggunakan Gemini AI 

---

## Catatan Penting untuk Pengembang

- **Gambar Soal:** Untuk memasukkan gambar ke dalam soal, Anda bisa meletakkan link langsung gambar (*direct link URL*) berformat `.jpg`/`.png` atau menggunakan tautan *hosting* gambar publik lainnya ke dalam kolom `gambar` di sheet `soal`.
- **Keamanan Kecepatan:** Pengacakan soal dilakukan di sisi server (`Kode.gs`) sebelum dikirim ke client. Hal ini jauh lebih aman dibandingkan pengacakan di sisi JavaScript client karena mencegah siswa mengintip urutan asli melalui fitur *Inspect Element*.
- **Penanganan Sesi:** Fungsi `kembaliKeAwal()` membersihkan memori variabel client secara total guna menjamin komputer/gawai siap digunakan oleh peserta ujian berikutnya tanpa risiko kebocoran data.
