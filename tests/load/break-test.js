import http from 'k6/http';
import { check } from 'k6';

// Konfigurasi BREAKING POINT TEST
export const options = {
  stages: [
    { duration: '5s', target: 500 },    // Naik langsung ke 500
    { duration: '15s', target: 2000 },  // Hajar sampai 2000 Virtual Users! (Ini dijamin bikin RAM/Event Loop jebol)
    { duration: '10s', target: 2000 },  // Tahan di 2000
    { duration: '5s', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Tanpa sleep sama sekali! Serangan membabi buta (DDoS style)
  const resApi = http.get(`${BASE_URL}/api/destinations`);
  check(resApi, {
    'api destinations loaded': (r) => r.status === 200 || r.status === 401,
  });
}
