# Matriks Keseluruhan Pengujian Sistem (QA Architecture)
*Aplikasi HYDE - Rangkuman Strategi Quality Assurance (Fungsional, Mutasi, dan Kinerja)*

Pengujian pada aplikasi HYDE dirancang menggunakan pendekatan arsitektur QA berlapis (*Multi-layered QA Architecture*). Matriks di bawah ini memetakan bagaimana ketiga jenis pengujian saling melengkapi satu sama lain untuk memastikan kualitas sistem dari segi logika internal, perilaku pengguna, ketahanan kode terhadap bug, hingga skalabilitas infrastruktur.

| Jenis Pengujian | Ruang Lingkup & Fokus (Scope) | Tools & Metodologi | Penjelasan & Tujuan (Objective) | Hasil Akhir (Metrik Utama) |
|---|---|---|---|---|
| **1. Pengujian Fungsional**<br>*(White-box & Black-box)* | - **Whitebox:** `tests/whitebox/` (Otentikasi, Transisi Status)<br>- **Blackbox:** `tests/blackbox/` (Alur UI/E2E Pengguna, Browser sungguhan) | - **Jest** (Unit)<br>- **Playwright** (E2E) | Menguji apakah fitur aplikasi berjalan sesuai spesifikasi. Jest memastikan hitungan logika internal akurat, Playwright memastikan antarmuka (UI) dapat dioperasikan pengguna. | - Seluruh Test Cases berstatus **PASS (100%)**.<br>- Fungsi utama berjalan tanpa kegagalan. |
| **2. Pengujian Mutasi**<br>*(Mutation Testing)* | **Fokus Eksklusif:** *Core Business Logic* (`lib/*.ts`) dan API kritis (`blob/proxy`, `transactions/[id]`, `scan`). | - **StrykerJS**<br>- Mode: *Targeted Full Suite* | **Menguji si Penguji (*Testing the Tests*).** Menyusupkan *bug* buatan ke dalam kode untuk mengukur seberapa teliti dan sensitif pengujian *White-box* menyadarinya. | - **Mutation Score: 65.91%** (Lulus standar industri >60%).<br>- Utilitas 95-100%, API rata-rata ~65-82%. |
| **3. Pengujian Kinerja**<br>*(Load & Stress)* | **Infrastruktur & API:** Rute `GET /api/destinations` di **Local Prod** dan **Cloud Prod** (Vercel & MongoDB Atlas). | - **Grafana k6**<br>- Matriks: 10, 50, 100, 150 VU.<br>- Puncak: 2000 VU. | Menguji skalabilitas peladen saat menerima lonjakan trafik masif. Memastikan koneksi database aman melalui mekanisme *Connection Pooling*. | - **150 VU:** 0% Error, Latensi P95 **~591ms**.<br>- **2000 VU:** Aplikasi tidak mati (*Graceful Degradation*), antrean tertahan di *Event Loop* (latensi ~19s). |

---
**Kesimpulan Pendekatan QA:**
Ketiga pilar pengujian ini membuktikan bahwa HYDE tidak hanya berjalan secara normal di kondisi ideal (Fungsional), namun juga memiliki skrip pertahanan yang sensitif terhadap kebocoran *bug* tak disengaja (Mutasi), serta memiliki ketahanan arsitektur tingkat tinggi dalam menghadapi beban ekstrem (Kinerja).
