import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurasi STRESS TEST
export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Cepat naik ke 50 VUs
    { duration: '20s', target: 200 },  // Hajar sampai 200 VUs
    { duration: '15s', target: 500 },  // Ekstrim ke 500 VUs (Atlas Free Tier limit adalah 500 koneksi)
    { duration: '10s', target: 0 },    // Terjun bebas ke 0
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const resLogin = http.get(`${BASE_URL}/login`);
  check(resLogin, {
    'login page loaded': (r) => r.status === 200,
  });

  // Jeda sangat tipis biar nyerangnya brutal
  sleep(Math.random() * 0.5);

  const resApi = http.get(`${BASE_URL}/api/destinations`);
  check(resApi, {
    'api destinations loaded': (r) => r.status === 200 || r.status === 401,
  });
}
