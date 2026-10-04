# LAMPIRAN: DAFTAR LENGKAP 71 TEST CASES

Berikut adalah penjabaran detail dari 71 test case (assertions) yang dieksekusi di belakang layar pada pengujian fungsional sistem HYDE. 

## A. BLACK-BOX TESTING (PLAYWRIGHT)

**Modul: `auth.spec.ts` (Login & Routing)**
1. Valid student login navigates away from `/login`, not to `/admin`
2. Valid admin login redirects to `/admin` area
3. Wrong password shows generic error, no standalone "password salah"
4. Wrong NIM same generic error format as wrong password
5. Empty form blocked by HTML required, does not call API
6. Unauthenticated visit to `/admin` redirected to `/login`
7. Unauthenticated visit to `/student` redirected to `/login`
8. Student visiting `/admin` after login redirected away from `/admin`
9. Admin visiting `/student` after login middleware does not redirect from `/student` root
10. After login, refreshing the page still logged in (session persists)

**Modul: `hybrid.spec.ts` (Alur QR & Fisik)**
11. Admin advances HYBRID transaction (`REVIEWING` → `AWAITING_SCAN`)
12. Admin generates disposisi on `VALIDATED` HYBRID status moves to `AWAITING_SCAN`
13. `/admin/scan` page loads with camera UI for admin
14. `/admin/scan` as student redirected away
15. Mock scan via API status becomes `VALIDATED` with `scannedAt` set
16. `COMPLETED` HYBRID on `/v/[id]` shows physical verification heading

**Modul: `security.spec.ts` (Privasi & Limitasi)**
17. `/v/[id]` public page does NOT contain student NIM in HTML
18. `/v/[id]` does NOT expose fileUrl or message contents
19. Direct blob URL access without auth blocked
20. Student A cannot access Student B's files via `/api/blob/proxy`
21. Rate limiting: 6 rapid login attempts 6th returns `429` (Too Many Requests)
22. GET `/api/transactions` without auth protected (`401` or redirect to `/login`)
23. Student calling `/api/transactions/[id]/scan` `403` (role guard)
24. Admin from different transaction calling scan `403` (ownership guard)

**Modul: `transaction.spec.ts` (Alur Digital Penuh)**
25. Student creates DIGITAL transaction status is `DRAFT`
26. Student creates HYBRID transaction status is `DRAFT`
27. Student A cannot see Student B's transaction `403`
28. Admin can see their assigned transaction
29. Admin claims transaction (`DRAFT` → `REVIEWING`)
30. Admin sends to `REVISION` student sees `REVISION` status
31. Student resubmits from `REVISION` status moves back to `REVIEWING`
32. Admin approves DIGITAL transaction (`REVIEWING` → `VALIDATED`)
33. DIGITAL `VALIDATED` transaction shows complete for student

---

## B. WHITE-BOX TESTING (JEST)

**Modul: `auth.test.ts` (Logic Session & Role)**
34. Returns session when valid session and DB user exist (no role required)
35. Throws `UNAUTHORIZED` when no session exists
36. Throws `FORBIDDEN` when DB role does not match required role
37. Throws `UNAUTHORIZED` when user no longer exists in DB (deleted user)
38. Uses DB role for verification - not the JWT role

**Modul: `blob-proxy.test.ts` (File Access Logic)**
39. Missing url param `400`
40. File record not found in DB `404`
41. Stranger (not student or admin) requests file `403`
42. Transaction student (owner) can access their file `200` proxied response
43. Assigned admin can access the file `200` proxied response

**Modul: `ownership.test.ts` (Akses Data Internal)**
44. Student reads their own transaction `200`
45. Student reads another student's transaction `403`
46. Assigned admin reads their transaction `200`
47. Unassigned admin reads a transaction `403`
48. Student calls scan endpoint `403`
49. Non-assigned admin calls scan `403` (ownership guard)

**Modul: `qr-parser.test.ts` (Generate/Decode URL)**
50. Valid URL with correct domain and `/v/[id]` path returns id
51. Wrong domain URL returns null
52. URL missing `/v/` path segment returns null
53. Completely invalid string (not a URL) returns null
54. Empty string returns null

**Modul: `scan.test.ts` (Logic Pemindaian QR)**
55. Returns `400` if transaction mode is DIGITAL (not HYBRID)
56. Returns `400` if transaction status is not AWAITING_SCAN
57. Returns `403` if adminId does not match session user id
58. Returns `404` if transaction does not exist
59. On success: status = `VALIDATED`, `scannedAt` and `completedAt` are set
60. On success: StatusLog entry written with `AWAITING_SCAN` → `VALIDATED`
61. On success: response includes student name and destinationName

**Modul: `status-transitions.test.ts` (State-Machine)**
62. DIGITAL: `REVIEWING` → `VALIDATED` is allowed
63. DIGITAL: `REVIEWING` → `AWAITING_SCAN` is NOT allowed
64. DIGITAL: `AWAITING_SCAN` → `VALIDATED` is NOT allowed (no such DIGITAL state)
65. HYBRID: `REVIEWING` → `AWAITING_SCAN` is allowed
66. HYBRID: `AWAITING_SCAN` → `VALIDATED` is allowed
67. HYBRID: `REVIEWING` → `VALIDATED` returns false (must go via `AWAITING_SCAN`)
68. Any mode: `VALIDATED` → anything returns false (terminal state)
69. Student attempting `REVIEWING` → `VALIDATED` for own DIGITAL tx `403` (STUDENT can only move REVISION REVIEWING)
70. Admin: DIGITAL `REVIEWING` → `VALIDATED` succeeds and sets `completedAt`
71. Admin: DIGITAL `VALIDATED` → anything `400` (terminal state)
72. Admin: HYBRID `REVIEWING` → `AWAITING_SCAN` succeeds
73. Admin: HYBRID `REVIEWING` → `VALIDATED` `400` (must go via `AWAITING_SCAN`)
74. HYBRID `AWAITING_SCAN` → `VALIDATED` sets `completedAt` (and `scannedAt`)
