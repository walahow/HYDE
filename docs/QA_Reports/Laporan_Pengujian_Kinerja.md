# Laporan Pengujian Kinerja (Performance Testing)
*Aplikasi HYDE - Load Testing & Stress Testing menggunakan Grafana k6*

## 1. Tujuan Pengujian
Pengujian ini bertujuan untuk mengukur tingkat responsivitas (*latency*), stabilitas (*error rate*), dan resiliensi (*daya tahan*) dari aplikasi HYDE ketika menerima lonjakan lalu lintas pengguna (*traffic*) secara bersamaan. Pengujian difokuskan pada endpoint `GET /api/destinations` yang mensimulasikan penarikan data dari database MongoDB Atlas.

## 2. Lingkungan Pengujian (Test Environments)
- **Local (Development):** Menjalankan `npm run dev` untuk melihat dampak kompilasi *on-the-fly*.
- **Local (Production Build):** Menjalankan `npm run build && npm start` untuk menguji kode yang telah dioptimasi.
- **Cloud Production (Vercel):** Target URL `https://hyde.attazul.com/` dengan database MongoDB Atlas Free Tier (Limit 500 koneksi).

## 3. Hasil Load Testing (Normal Load)
Skenario Load Testing disimulasikan menggunakan **10 Virtual Users (VU)** yang beroperasi secara serentak selama 40 detik.

| Environment | Target Load | Total Request | Avg Latency | P95 Latency | Error Rate | Status |
|---|---|---|---|---|---|---|
| Local (Development) | 10 VUs | 42 Req | 4.43 detik | **16.3 detik** (Fail) | **50.00%** (Fail) | GAGAL |
| Local (Production) | 10 VUs | 160 Req | 41.16 ms | **46.82 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Local (Production) | 50 VUs | 804 Req | 23.25 ms | **43.30 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Local (Production) | 100 VUs | 1.580 Req | 21.26 ms | **42.63 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Local (Production) | 150 VUs | 2.146 Req | 22.66 ms | **43.94 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Cloud (Vercel) | 10 VUs | 130 Req | 394.1 ms | **1.41 detik** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Cloud (Vercel) | 50 VUs | 658 Req | 338.4 ms | **545.8 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Cloud (Vercel) | 100 VUs | 1.316 Req | 334.8 ms | **560.3 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |
| Cloud (Vercel) | 150 VUs | 1.776 Req | 359.2 ms | **591.8 ms** (Pass) | **0.00%** (Pass) | LULUS TINGGI |

> **Analisis Load Testing:**  
> Terdapat perbedaan metrik yang sangat ekstrem antara lingkungan *Development* dan *Production*. Pada Development, sistem mengalami kegagalan karena *bottleneck* pada *compiler Webpack/Turbopack*. Namun, pada versi *Production Build*, kode aplikasi tereksekusi dengan sangat efisien (P95 = 46ms).  
> Pada pengujian di lingkungan Cloud (Vercel), rata-rata *latency* berada di kisaran ~394ms karena jarak *network routing* ke server luar negeri. Tercatat *Max Latency* sesaat menyentuh angka 3.44 detik yang disebabkan oleh fenomena **Cold Start** (siklus bangunnya arsitektur Serverless), setelah itu kecepatan kembali stabil.

## 4. Hasil Stress Testing (Push to Limits)
Stress testing dilakukan secara lokal pada *Production Build* untuk menguji titik kritis (*Breaking Point*) dari aplikasi dan database (limit 500 koneksi). Pengujian dilakukan tanpa jeda waktu (*no sleep/think time*).

| Skenario Beban | Durasi | Total Request | P95 Latency | Error Rate | Hasil & Gejala |
|---|---|---|---|---|---|
| 500 Virtual Users (DB Limit Test) | 55 detik | 10.920 Req | 3.97 detik | **0.00%** | *Graceful Degradation* (Sistem melambat namun tidak crash) |
| 2.000 Virtual Users (Extreme Resilience) | 35 detik | 5.348 Req | 19.6 detik | **0.00%** | *Event Loop Saturated* (Sistem tidak crash, antrean melar ~20 detik) |
| 2.000 Virtual Users (RAM Dibatasi 64MB) | 35 detik | 57.157 Req | N/A (Timeout) | **99.42%** | Fatal Error (OOM Crash). Connection Refused |

> **Analisis Stress Testing & Breaking Point:**  
> Pada uji beban 500 VU, aplikasi HYDE mencatatkan pencapaian luar biasa dengan menangani nyaris 11.000 request tanpa satu pun error (0%). Meskipun database Atlas memiliki batas 500 koneksi, sistem **TIDAK** mengalami *Connection Refused*. Hal ini dikarenakan efektivitas arsitektur **Connection Pooling** dari *Prisma ORM*, yang secara cerdas menahan dan mengantrekan permintaan HTTP di dalam memori *Event Loop* Node.js dan menyalurkannya lewat jumlah koneksi database yang kecil namun efisien. Efek samping (*trade-off*) dari antrean ini adalah membengkaknya *latency* hingga ~4 detik.  
> Untuk menemukan titik hancur sistem yang sesungguhnya, dilakukan pengujian dengan membatasi memori (RAM 64MB) di bawah gempuran 2.000 VU. Hasilnya, server Node.js kehabisan memori dan menghasilkan log kematian: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`. Ini membuktikan bahwa batasan sesungguhnya dari aplikasi ini terletak pada alokasi memori server (RAM), bukan pada efisiensi kodenya.

## 5. Kesimpulan
1. Kualitas penulisan kode pada aplikasi HYDE dan efisiensi *query ORM* berada di tingkat yang **sangat baik**, dibuktikan dengan 0% *Error Rate* pada Load Test skala normal.
2. Sistem mampu melindungi dirinya dari pemutusan paksa koneksi database eksternal melalui mekanisme *Connection Pooling*.
3. Peningkatan spesifikasi perangkat keras (khususnya RAM) berbanding lurus dengan ketahanan aplikasi dalam menangani *Traffic Spikes* ekstrim (DDoS-style loads).
