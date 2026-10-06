# Rincian Lengkap 118 Skenario Pengujian Fungsional
**Sistem HYDE (Hybrid Document)**
Total Skenario: **118** (White-box: 85 | Black-box: 33)
Status Akhir: **100% PASS**

---

## 1. White-box Testing (85 Skenario Uji)
Alat: **Jest** 
*Fokus: Menguji logika internal aplikasi, fungsi middleware, pengamanan rute API, manipulasi database, dan catch-blocks.*

### Modul: auth.test.ts (7 Tes)
1. 1. Returns session when valid session and DB user exist (no role required)
2. 2. Throws UNAUTHORIZED when no session exists
3. 3. Throws FORBIDDEN when DB role does not match required role
4. 4. Throws UNAUTHORIZED when user no longer exists in DB (deleted user)
5. 5. Uses DB role for verification — not the JWT role
6. 6. Throws UNAUTHORIZED when getServerSession throws an exception
7. 7. requireAuth with no role arg succeeds for any role

### Modul: blob-proxy.test.ts (15 Tes)
1. 1. Missing url param → 400
2. 2. File record not found in DB → 404
3. 3. Stranger (not student or admin) requests file → 403
4. 4. Transaction student (owner) can access their file → 200 proxied response
5. 5. Assigned admin can access the file → 200 proxied response
6. 6. Missing BLOB_READ_WRITE_TOKEN -> 500
7. 7. Upstream fetch fails -> 500
8. 8. Content-Type fallback to octet-stream
9. 9. Console logs and exact header matches
10. 10. Catch block UNAUTHORIZED -> 401
11. 11. Catch block FORBIDDEN -> 403
12. 12. Strips query parameters or handles encoded blob URLs cleanly
13. 13. Sets Content-Disposition filename matching file ID exactly
14. 14. Throws error when fetch throws network error -> caught as 500
15. 15. Disallows access when transaction has no student and no admin match

### Modul: ownership.test.ts (14 Tes)
1. 1. Student reads their own transaction → 200
2. 2. Student reads another student
3. 3. Assigned admin reads their transaction → 200
4. 4. Unassigned admin reads a transaction → 403
5. 5. Student calls scan endpoint → 403
6. 6. Non-assigned admin calls scan → 403 (ownership guard)
7. 7. GET Catch block UNAUTHORIZED -> 401
8. 8. GET Catch block generic error -> 500
9. 9. PATCH Student updates status not to DRAFT -> 400
10. 10. PATCH Student updates status to DRAFT from REVISION -> 200
11. 11. PATCH Admin updates status to VALIDATED -> 200
12. 12. PATCH Missing status -> 400
13. 13. PATCH Transaction not found -> 404
14. 14. PATCH Generic catch block -> 500 (mutation killer)

### Modul: qr-parser.test.ts (8 Tes)
1. 1. Valid URL with correct domain and /v/[id] path → returns id
2. 2. Wrong domain URL → returns null
3. 3. URL missing /v/ path segment → returns null
4. 4. Completely invalid string (not a URL) → returns null
5. 5. Empty string → returns null
6. 6. Short ID (< 10 chars) → returns null (Stryker mutation killer)
7. 7. Trims whitespace around URL
8. 8. Non-string inputs → returns null

### Modul: scan.test.ts (12 Tes)
1. 1. Returns 400 if transaction mode is DIGITAL (not HYBRID)
2. 2. Returns 400 if transaction status is not AWAITING_SCAN
3. 3. Returns 403 if adminId does not match session user id
4. 4. Returns 404 if transaction does not exist
5. 5. On success: status = VALIDATED, scannedAt and completedAt are set
6. 6. On success: StatusLog entry written with AWAITING_SCAN → VALIDATED
7. 7. On success: response includes student name and destinationName
8. 8. Catch block UNAUTHORIZED
9. 9. Catch block FORBIDDEN
10. 10. Catch block generic 500
11. 11. Fails when transaction ID is empty string -> 404
12. 12. Preserves documentType and returns proper transaction payload structure

### Modul: status-transitions.test.ts (29 Tes)
1. DIGITAL: REVIEWING → VALIDATED is allowed
2. DIGITAL: REVIEWING → AWAITING_SCAN is NOT allowed
3. DIGITAL: AWAITING_SCAN → VALIDATED is NOT allowed (no such DIGITAL state)
4. HYBRID: REVIEWING → AWAITING_SCAN is allowed
5. HYBRID: AWAITING_SCAN → VALIDATED is allowed
6. HYBRID: REVIEWING → VALIDATED returns false (must go via AWAITING_SCAN)
7. Any mode: VALIDATED → anything returns false (terminal state)
8. DIGITAL: DRAFT -> REVIEWING is allowed
9. DIGITAL: REVIEWING -> REVISION is allowed
10. DIGITAL: REVISION -> REVIEWING is allowed
11. HYBRID: DRAFT -> REVIEWING is allowed
12. HYBRID: REVIEWING -> REVISION is allowed
13. HYBRID: REVISION -> REVIEWING is allowed
14. Any mode: Invalid mode returns false
15. Any mode: Invalid fromStatus returns false
16. Student attempting REVIEWING → VALIDATED for own DIGITAL tx → 403 (STUDENT can only move REVISION→REVIEWING)
17. Admin: DIGITAL REVIEWING → VALIDATED succeeds and sets completedAt
18. Admin: DIGITAL VALIDATED → anything → 400 (terminal state)
19. Admin: HYBRID REVIEWING → AWAITING_SCAN succeeds
20. Admin: HYBRID REVIEWING → VALIDATED → 400 (must go via AWAITING_SCAN)
21. HYBRID AWAITING_SCAN → VALIDATED sets completedAt (and scannedAt)
22. PATCH /status: returns 400 when toStatus is missing
23. PATCH /status: returns 404 when transaction is not found
24. PATCH /status: returns 403 when unassigned admin attempts status transition
25. PATCH /status: creates new file record when file payload is provided and file does not exist
26. PATCH /status: updates existing file record when revised file with same name already exists
27. PATCH /status: sets finalFileUrl on transaction update if provided
28. PATCH /status: handles UNAUTHORIZED error in catch block -> 401
29. PATCH /status: handles generic error in catch block -> 500

---

## 2. Black-box E2E Testing (33 Skenario Uji)
Alat: **Playwright** 
*Fokus: Mensimulasikan klik, navigasi, dan interaksi pengguna asli secara end-to-end melalui browser (UI).*

### Test Suite: auth.spec.ts (10 Tes)
1. 1. Valid student login → navigates away from /login, not to /admin
2. 2. Valid admin login → redirects to /admin area
3. 3. Wrong password → shows generic error, no standalone
4. 4. Wrong NIM → same generic error format as wrong password
5. 5. Empty form → blocked by HTML required, does not call API
6. 6. Unauthenticated visit to /admin → redirected to /login
7. 7. Unauthenticated visit to /student → redirected to /login
8. 8. Student visiting /admin after login → redirected away from /admin
9. 9. Admin visiting /student after login → middleware does not redirect from /student root
10. 10. After login, refreshing the page → still logged in (session persists)

### Test Suite: hybrid.spec.ts (6 Tes)
1. 1. Admin advances HYBRID transaction (REVIEWING → AWAITING_SCAN)
2. 2. Admin generates disposisi on VALIDATED HYBRID → status moves to AWAITING_SCAN
3. 3. /admin/scan page loads with camera UI for admin
4. 4. /admin/scan as student → redirected away
5. 5. Mock scan via API → status becomes VALIDATED with scannedAt set
6. 6. COMPLETED HYBRID on /v/[id] shows physical verification heading

### Test Suite: security.spec.ts (8 Tes)
1. 1. /v/[id] public page does NOT contain student NIM in HTML
2. 2. /v/[id] does NOT expose fileUrl or message contents
3. 3. Direct blob URL access without auth → blocked
4. 4. Student A cannot access Student B
5. 5. Rate limiting: 6 rapid login attempts → 6th returns 429
6. 6. GET /api/transactions without auth → protected (401 or redirect to /login)
7. 7. Student calling /api/transactions/[id]/scan → 403 (role guard)
8. 8. Admin from different transaction calling scan → 403 (ownership guard)

### Test Suite: transaction.spec.ts (9 Tes)
1. 1. Student creates DIGITAL transaction → status is DRAFT
2. 2. Student creates HYBRID transaction → status is DRAFT
3. 3. Student A cannot see Student B
4. 4. Admin can see their assigned transaction
5. 5. Admin claims transaction (DRAFT → REVIEWING)
6. 6. Admin sends to REVISION → student sees REVISION status
7. 7. Student resubmits from REVISION → status moves back to REVIEWING
8. 8. Admin approves DIGITAL transaction (REVIEWING → VALIDATED)
9. 9. DIGITAL VALIDATED transaction shows complete for student

