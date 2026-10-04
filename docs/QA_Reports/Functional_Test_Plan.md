# Rencana Pengujian Fungsional (Functional Test Plan) - Sistem HYDE

Dokumen ini merangkum skenario pengujian fungsional untuk sistem HYDE (Hybrid Document) berdasarkan spesifikasi *Student Grant 2026*. Pengujian dibagi menjadi dua pendekatan: **White-box Testing** (Unit/Integration Test) dan **Black-box Testing** (End-to-End Test).

---

## 1. Pengujian White-box (Pengujian Logika Internal)
**Tools yang digunakan:** Jest
**Tujuan:** Memastikan fungsi, *utility*, dan *state-machine* di dalam kode berjalan sesuai logika tanpa harus merender tampilan antarmuka (UI).

| ID Test | Modul / File | Skenario Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **WB-01** | `status-transitions` | Transisi status dokumen `DIGITAL` yang valid. | Status berubah sesuai urutan: `DRAFT` → `REVIEWING` → `REVISION` → `VALIDATED`. |
| **WB-02** | `status-transitions` | Transisi status dokumen `HYBRID` yang valid. | Status tertahan di `AWAITING_SCAN` sebelum bisa menjadi `VALIDATED`. |
| **WB-03** | `status-transitions` | Memaksa transisi ilegal (Bypass status). | Sistem melempar *Error* menolak perubahan status. |
| **WB-04** | `ownership` | Validasi kepemilikan dokumen oleh Mahasiswa. | Mahasiswa hanya bisa memanipulasi dokumen miliknya sendiri. |
| **WB-05** | `qr-parser` | Generate dan Parsing QR Code. | Data URL QR dihasilkan dengan benar dan dapat di-decode kembali ke ID Transaksi. |
| **WB-06** | `auth` | Verifikasi Hashing Password dan Sesi. | Token sesi valid dan kecocokan hash password sesuai (bcrypt). |

---

## 2. Pengujian Black-box (Pengujian Skenario Pengguna)
**Tools yang digunakan:** Playwright
**Tujuan:** Mensimulasikan interaksi pengguna nyata di browser (Klik, Ketik, Navigasi) untuk memastikan alur aplikasi dari ujung ke ujung (End-to-End) berjalan normal.

| ID Test | Modul / File | Skenario Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **BB-01** | `auth` | Login dengan kredensial Mahasiswa (`NIM`). | Berhasil masuk dan diarahkan ke halaman `/riwayat` (Dashboard Mahasiswa). |
| **BB-02** | `hybrid` | Admin memproses dokumen `HYBRID` dari Mahasiswa. | Saat Admin memproses, status dokumen di sistem berubah menjadi `AWAITING_SCAN`. |
| **BB-03** | `hybrid` | Simulasi API Scan QR pada dokumen `AWAITING_SCAN`. | Status dokumen berubah menjadi `VALIDATED` dan kolom `scannedAt` terisi. |
| **BB-04** | `hybrid` | Verifikasi halaman publik (`/v/[id]`) untuk dokumen valid. | Halaman publik menampilkan pesan `TERVERIFIKASI_FISIK` dan waktu scan. |
| **BB-05** | `security` | Mahasiswa mencoba mengakses URL `/admin/scan`. | *Middleware* memblokir akses dan mengalihkan mahasiswa menjauh dari halaman admin. |
| **BB-06** | `transaction` | Upload dan proses dokumen mode `DIGITAL` penuh. | Dokumen berhasil disubmit, direview, dan divalidasi secara digital tanpa alur QR. |

---
*Catatan untuk Presentasi: Semua test case di atas sudah diimplementasikan di dalam folder `tests/whitebox/` dan `tests/blackbox/` dan melaporkan 71/71 Passing (Lulus).*
