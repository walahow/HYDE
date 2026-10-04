import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const resLogin = http.get(`${BASE_URL}/login`);
  check(resLogin, { 'login page loaded': (r) => r.status === 200 });
  sleep(Math.random() * 2 + 1);

  const resApi = http.get(`${BASE_URL}/api/destinations`);
  check(resApi, { 'api destinations loaded': (r) => r.status === 200 || r.status === 401 });
  sleep(1);
}
