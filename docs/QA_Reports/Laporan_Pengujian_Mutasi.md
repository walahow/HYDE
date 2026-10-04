# Laporan Pengujian Mutasi (Mutation Testing)
*Aplikasi HYDE - Mengukur Kualitas Unit Test Menggunakan StrykerJS*

## 1. Tujuan Pengujian
Mutation Testing bertujuan untuk **menguji efektivitas dari penguji itu sendiri (*Testing the Tests*)**. Pengujian ini tidak mencari bug di dalam aplikasi, melainkan mengukur seberapa teliti dan sensitif pengujian *White-box* (Jest) dalam mendeteksi perubahan logika atau kerusakan kode (*mutants*) yang disisipkan secara sengaja.

## 2. Metodologi & Ruang Lingkup
- **Framework Pengujian:** StrykerJS (dikombinasikan dengan Jest Test Runner).
- **Target Mutasi:** Kode logika bisnis inti (*Core Business Logic*) yang terdapat di dalam direktori `lib/**/*.ts`.
- **File Pengawas (Test Suite):** Mengandalkan 6 file unit test utama yaitu:
  1. `auth.test.ts` (Logika Otentikasi & Otorisasi)
  2. `status-transitions.test.ts` (Aturan perpindahan status dokumen)
  3. `ownership.test.ts` (Validasi kepemilikan dokumen)
  4. `qr-parser.test.ts` (Pembacaan data QR)
  5. `scan.test.ts` (Logika aksi pasca pemindaian QR)
  6. `blob-proxy.test.ts` (Manajemen berkas/file)

## 3. Hasil Pengujian Keseluruhan
**Skor Mutasi Akhir (Mutation Score): 65.91%**

Skor **65.91%** mengindikasikan bahwa dari seluruh *bug* buatan (mutant) yang disusupkan oleh Stryker ke dalam kode sumber, test suite Jest berhasil mendeteksi dan menggagalkan (*Killed*) sekitar 66% di antaranya. Angka ini secara objektif telah melampaui standar kelayakan industri yang umumnya mematok batas minimal di angka 60%.

## 4. Rincian Skor Per Modul Kritis
| Modul Sumber | Fungsi Utama | Mutation Score | Status Kualitas |
|---|---|---|---|
| `lib/auth.ts` | Otentikasi, Sesi, dan Hak Akses Pengguna | **100.00%** | Sempurna (Perfect Coverage) |
| `lib/validate-transition.ts` | Aturan Status (Draft ➔ Validated ➔ dll) | **95.65%** | Sangat Kuat (Near Perfect) |
| `app/api/.../scan/route.ts` | API Pemindaian Fisik Dokumen (QR Scan) | **82.28%** | Sangat Kuat (Strong Coverage) |
| `lib/parse-qr-url.ts` | Validasi dan Ekstraksi ID dari URL QR Code | **78.57%** | Kuat (Strong Coverage) |
| `app/api/blob/proxy/route.ts` | Proksi Streaming Dokumen & Validasi Akses File | **69.62%** | Lulus (Diatas Standar) |
| `app/api/transactions/[id]/route.ts` | Endpoint Utama Transaksi & Mutasi Status | **45.45%** | Cukup (Kendala Mocking Relasi) |

> **Analisis Modul:**  
> Modul murni (`lib/`) mendominasi skor tinggi (95%-100%). Pada lapisan API, `scan/route.ts` dan `blob/proxy/route.ts` berhasil diuji ketat dan menembus skor di atas standar. Penurunan skor agregat sebagian besar dipengaruhi oleh `transactions/[id]/route.ts` (45.45%); hal ini terjadi karena tingginya *boilerplate* Prisma (seperti *nested includes* dan *order by*) yang mengembalikan struktur JSON masif, sehingga mutasi pada struktur data ini luput dari asersi unit test tanpa merusak status HTTP responsnya.

## 5. Pengecualian Ruang Lingkup (Scope Exclusions)
Dalam penerapan *Mutation Testing*, tidak semua berkas API diikutsertakan ke dalam target mutasi. Berikut adalah komponen yang secara sadar **tidak dimasukkan** (selain file di atas) beserta alasan akademisnya:

| Komponen yang Dikecualikan | Alasan Pengecualian (Mengapa?) | Pengujian Pengganti (Covered By) |
|---|---|---|
| **API Routes Lainnya** (`transactions`, `status`, dll) | Penuh dengan *Boilerplate* framework Next.js dan bergantung pada *Mocking* (Prisma/Session). Memutasi kode ini menghasilkan *False-Positives* karena Jest tidak menguji konfigurasi HTTP. | **Blackbox Testing (Playwright)** (Menguji seluruh rute API secara natural lewat protokol HTTP) |
| **Generator Visual** (`qrcode.ts`, `pdf-utils.ts`) | Bertugas merender gambar/dokumen visual. Algoritma mutasi logika tidak relevan untuk mengukur tata letak visual. | **Blackbox Testing (Playwright)** (Verifikasi langsung apakah QR Code & PDF bisa dirender di layar) |
| **Utilitas UI** (`utils.ts`) | Hanya berisi penggabungan kelas CSS Tailwind, tidak memiliki *Business Logic* murni. | **Blackbox Testing (Playwright)** (Ekspektasi antarmuka dan desain UI) |

> **Studi Kasus: Pembuktian Empiris Mutasi pada API Route**  
> Dalam proses pengujian, dilakukan eskalasi *Hardcore QA* dengan turut memasukkan tiga berkas API Route utama (*blob proxy, scan, ownership/transactions*) ke dalam target Stryker. Pengujian *White-box* pada API Route Node.js umumnya sangat dihindari industri karena tingginya rasio *False-Positives* akibat *framework boilerplate*. Namun, eksperimen ini membuktikan bahwa dengan pendekatan asersi yang ketat, API Route dapat dimutasi secara valid:
> - **Asersi Ekstrem (Strict Header Assertions):** Dengan memastikan unit test (Jest) ikut memvalidasi respons konfigurasi HTTP tingkat rendah (seperti kecocokan string `'Cache-Control': 'private, no-store'`), mutasi pada API `blob/proxy` dan `scan` berhasil digagalkan, mencetak skor luar biasa di angka **69.62%** dan **82.28%**.
> - **Realita Kompleksitas (ORM Mocking):** Penurunan agregat skor mutasi (tersisa 45.45% pada `transactions/[id]/route.ts`) membuktikan secara empiris batas kemampuan Unit Test; tingginya kompleksitas Query Prisma (seperti *nested includes* dan *order by*) menghasilkan struktur JSON yang terlalu masif untuk divalidasi satu persatu tanpa pendekatan pengujian integrasi (*Integration Testing*).
> 
> **Keputusan Akhir:** Mempertahankan API route pada laporan hasil akhir membuktikan transparansi dan komprehensivitas pengujian Skripsi ini. Sistem tidak hanya diuji pada fungsi ideal yang mudah (*Happy Path*), melainkan hingga ke lapisan implementasi jaringan yang rentan terhadap regresi logika.

## 6. Kesimpulan
Penerapan Mutation Testing pada aplikasi HYDE membuktikan bahwa pengujian yang dilakukan tidak sekadar berasumsi pada "kode berjalan lancar". Dengan *Mutation Score* akhir sebesar **65.91%** yang melampaui batas wajar industri (60%), terbukti secara kuantitatif bahwa skrip pengujian memiliki tingkat sensitivitas yang sangat tinggi dan mampu mencegah regresi bug secara proaktif baik pada logika bisnis murni maupun lapisan implementasi API.
