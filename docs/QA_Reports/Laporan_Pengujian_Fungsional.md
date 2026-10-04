# LAPORAN PENGUJIAN FUNGSIONAL SISTEM HYDE
**Kategori:** White-box Testing & Black-box Testing
**Proyek:** HYDE (Hybrid Document) - Student Grant 2026

---

## 1. PENDAHULUAN
Pengujian fungsional pada sistem HYDE bertujuan untuk memverifikasi bahwa seluruh fitur dan logika bisnis aplikasi berjalan sesuai dengan spesifikasi kebutuhan yang telah ditetapkan. Pengujian ini difokuskan pada dua aspek utama:
1. **White-box Testing:** Pengujian terhadap struktur internal, logika kode, dan *state-machine* sistem.
2. **Black-box Testing:** Pengujian fungsionalitas dari sudut pandang pengguna akhir (End-to-End) tanpa melihat struktur kode internal.

## 2. METODOLOGI PENGUJIAN
*   **Lingkungan Pengujian:** Local Environment
*   **Perangkat Lunak (Tools):**
    *   **Jest:** Digunakan untuk eksekusi skenario White-box testing.
    *   **Playwright:** Digunakan untuk otomatisasi browser pada skenario Black-box testing.

---

## 3. SKENARIO WHITE-BOX TESTING
Pengujian ini berfokus pada fungsi utilitas internal, validasi *middleware*, dan transisi status dokumen (`DocumentStatus`).

| ID | Modul Teruji | Deskripsi Skenario Pengujian | Hasil yang Diharapkan (Ekspektasi) |
| :--- | :--- | :--- | :--- |
| **WB-01** | `status-transitions` | Menguji alur transisi dokumen tipe `DIGITAL`. | Status berhasil diubah secara berurutan: `DRAFT` → `REVIEWING` → `REVISION` → `VALIDATED`. |
| **WB-02** | `status-transitions` | Menguji alur transisi dokumen tipe `HYBRID`. | Status tidak dapat langsung menjadi `VALIDATED`, melainkan tertahan di `AWAITING_SCAN`. |
| **WB-03** | `status-transitions` | Simulasi pelanggaran transisi status (Bypass). | Sistem menolak perubahan dan melemparkan *Error* validasi. |
| **WB-04** | `ownership` | Validasi kepemilikan akses dokumen. | *Authorization logic* memastikan mahasiswa hanya dapat mengakses dan mengubah dokumen miliknya sendiri. |
| **WB-05** | `qr-parser` | Generate & Decode QR Code. | Fungsi mengembalikan *Data URL* yang valid dan dapat diekstrak kembali menjadi ID Transaksi. |
| **WB-06** | `auth` | Verifikasi algoritma *hashing* kredensial. | Fungsi `bcrypt` berhasil memvalidasi kecocokan *plaintext password* dengan *hash* di basis data. |
| **WB-07** | `blob-proxy` | Validasi akses file streaming & kegagalan *upstream*. | Middleware memblokir akses *stranger* (403), memastikan *headers* HTTP tepat (200), dan menangani hilangnya Blob Token (500). |
| **WB-08** | `scan` (Catch Blocks) | Simulasi kegagalan sistem internal pada saat pemindaian QR. | Sistem sukses menangkap *Error* spesifik (Unauthorized/Forbidden/DB Down) dan mengembalikan respons JSON secara *graceful* tanpa merusak peladen. |
| **WB-09** | `transactions` | Menguji alur *Update* (PATCH) status transaksi dokumen. | Validasi ketat mencegah mahasiswa memintas status (hanya boleh kembali ke DRAFT), sementara Admin memegang kontrol penuh hingga VALIDATED. |

---

## 4. SKENARIO BLACK-BOX TESTING
Pengujian ini mensimulasikan interaksi nyata (E2E) pengguna melalui antarmuka web (Browser), memastikan komponen *Frontend* dan *Backend* terintegrasi dengan baik.

| ID | Alur Pengguna (User Flow) | Deskripsi Skenario Pengujian | Hasil yang Diharapkan (Ekspektasi) |
| :--- | :--- | :--- | :--- |
| **BB-01** | **Autentikasi Mahasiswa** | Pengguna mengisi form *Login* menggunakan Nomor Induk Mahasiswa (NIM). | Login berhasil, *session* tercipta, dan pengguna dialihkan ke halaman Dasbor (`/riwayat`). |
| **BB-02** | **Proses HYBRID (Admin)** | Admin melakukan klik proses pada dokumen `HYBRID` yang diajukan mahasiswa. | UI menampilkan perubahan status menjadi `AWAITING_SCAN` secara *real-time*. |
| **BB-03** | **Validasi QR Fisik** | Simulasi pemindaian QR Code (akses *endpoint* scan) pada dokumen `AWAITING_SCAN`. | Sistem memvalidasi dokumen menjadi `VALIDATED` dan mencatat *timestamp* (`scannedAt`). |
| **BB-04** | **Verifikasi Publik** | Pengguna anonim membuka URL publik verifikasi dokumen (`/v/[id]`). | Halaman memuat header `TERVERIFIKASI_FISIK` beserta informasi waktu pemindaian. |
| **BB-05** | **Keamanan Rute (RBAC)** | Mahasiswa mencoba mengakses URL restricted `/admin/scan` melalui *address bar*. | *Middleware* memblokir akses dan mengalihkan pengguna (*redirect*) ke halaman awal. |
| **BB-06** | **Alur Penuh DIGITAL** | Mahasiswa mengunggah dokumen tipe `DIGITAL` hingga disetujui Admin. | Alur selesai murni secara digital tanpa memerlukan intervensi pemindaian QR. |

---

## 5. HASIL PENGUJIAN (EKSEKUSI)
Berdasarkan eksekusi skrip pengujian pada *test-runner*:
*   **Total Test Cases:** 85 skenario teruji (Kombinasi White-box & Black-box hasil eskalasi *Hardcore QA*).
*   **Status Keseluruhan:** **LULUS (100% PASSING)**.
*   **Keterangan:** Tidak ditemukan anomali atau *bug* fungsional pada alur utama MVP HYDE. 

## 6. KESIMPULAN
Sistem HYDE telah memenuhi seluruh spesifikasi fungsional yang disyaratkan dalam MVP *Student Grant 2026*. Seluruh batasan status (terutama pada alur `HYBRID`) dan keamanan hak akses (*Role-Based Access Control*) telah divalidasi dan berjalan dengan baik sesuai skenario pengujian.
