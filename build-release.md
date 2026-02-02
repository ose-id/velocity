# Build & Release Guide

Panduan langkah demi langkah untuk melakukan build aplikasi dan merilis update baru menggunakan GitHub Releases.

## 1. Persiapan Versi

Sebelum melakukan build, pastikan Anda menaikkan versi aplikasi.

1.  Buka file `package.json`.
2.  Cari bagian `"version"`.
3.  Naikkan angkanya (contoh: dari `"1.0.0"` menjadi `"1.0.1"`).

```json
{
  "name": "clone-tools",
  "version": "1.0.1",
  ...
}
```

## 2. Build Aplikasi

Jalankan perintah build untuk membuat file installer (`.exe`) dan manifest update (`latest.yml`).

1.  Buka terminal di root project.
2.  Jalankan perintah:

    ```bash
    bun run build:win
    ```

3.  Tunggu hingga proses selesai.

## 3. Lokasi File Release

Setelah build selesai, file hasil build akan berada di folder `release`.

File yang **WAJIB** Anda ambil:

1.  `Clone Tools Setup X.X.X.exe` (Installer aplikasi)
2.  `latest.yml` (Manifest untuk auto-update)

> **PENTING:** Jangan rename file-file ini. Upload apa adanya.

## 4. Buat Release di GitHub

Sekarang upload file tersebut ke GitHub agar user bisa download update.

1.  Buka repository GitHub Anda: `https://github.com/adydetra/clone-tools`
2.  Klik menu **Releases** di sidebar kanan.
3.  Klik tombol **Draft a new release**.
4.  Isi form release:
    - **Choose a tag**: Ketik versi baru, diawali dengan `v`. Contoh: `v1.0.1`. Klik "Create new tag".
    - **Release title**: Isi sama dengan tag, misal `v1.0.1`.
    - **Description**: Tulis catatan perubahan (changelog) jika perlu.
5.  **Upload Assets**:
    - Drag & drop file `.exe` dan `latest.yml` dari folder `release` ke area upload.
    - Tunggu sampai upload selesai (bar hijau hilang).
6.  Klik **Publish release**.

## 5. Verifikasi Update

Untuk memastikan auto-update berjalan:

1.  Jalankan aplikasi versi lama (misal v1.0.1) yang sudah terinstall.
2.  Buka menu **Configuration**.
3.  Klik tombol **Check for Update**.
4.  Aplikasi harusnya mendeteksi versi `v1.0.1`, mendownloadnya, dan tombol berubah menjadi **Restart & Install Update**.
