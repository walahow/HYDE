import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurasi Load Test
export const options = {
  stages: [
    { duration: '10s', target: 25 },  // Naik ke 25 virtual users
    { duration: '20s', target: 50 }, // Naik ke 50 virtual users, tahan selama 20 detik
    { duration: '10s', target: 0 },  // Turun kembali ke 0 (cooling down)
  ],
  thresholds: {
    // 95% request harus selesai di bawah 1500ms (Karena Vercel free tier & network latency, target dinaikkan)
    http_req_duration: ['p(95)<1500'],
    // Tingkat error harus di bawah 1%
    http_req_failed: ['rate<0.01'], 
  },
};

const BASE_URL = 'https://hyde.attazul.com';

export default function () {
  // Skenario 1: Buka Halaman Login
  const resLogin = http.get(`${BASE_URL}/login`);
  check(resLogin, {
    'login page loaded': (r) => r.status === 200,
  });

  sleep(Math.random() * 2 + 1); // Jeda 1-3 detik

  // Skenario 2: Hit API
  const resApi = http.get(`${BASE_URL}/api/destinations`);
  check(resApi, {
    'api destinations loaded': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
