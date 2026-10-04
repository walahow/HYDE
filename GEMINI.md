# HYDE — agent handoff

HYDE ("hybrid document") digitizes campus paperwork. Students log in with their NIM, choose a
destination office, and upload documents. The admin at that office reviews them, sends revisions,
and signs digitally. `DIGITAL` requests finish online. `HYBRID` requests finish when the admin
**scans the QR code on the physical signed copy**. It was built as the MVP of a Student Grant 2026
research project (paperwork in `D:\Studigring 20206`, see its `GEMINI.md`). Status: **MVP done**.
Jest (whitebox) + Playwright (blackbox) suites reported 71/71 passing.

State as of 2026-09-26, carried over from Claude Code sessions.

## Stack
Next.js 16.1.6 (App Router) · React 19.2 · Prisma + MongoDB Atlas · NextAuth v4 (credentials, NIM login)
· Vercel Blob (files) · Upstash Redis (rate limiting) · `html5-qrcode` / `qrcode` · `pdf-lib`, `jszip`
· radix/shadcn, framer-motion, lenis, tsparticles. Hosted on Vercel free tier with Atlas free tier.

## Domain model (`prisma/schema.prisma`)
- `User` (Role `STUDENT` | `ADMIN`), `Transaction` (mode `DIGITAL` | `HYBRID`), `File`, `Message`, `StatusLog`.
- `DocumentStatus`: `DRAFT → REVIEWING → REVISION → AWAITING_SCAN → VALIDATED`.
- Admin offices in the seed: LPPM, TU Komputer, Dekanat MIPA.
- Routes: `/login`, `/riwayat`, `/student/document-view`, `/admin`, `/admin/document-view`,
  `/admin/riwayat`, `/admin/scan` (QR), `/v/[id]` (public verification page).
- The intended flows are described in plain Indonesian in `D:\Studigring 20206\listable.txt`.

## Gotchas
- `.env` holds **real** MongoDB, Blob and Upstash credentials. Never print or commit them. This folder is
  not a git repo.
- Dev seed accounts (NIM + password) are in `prisma/seed.ts`. **Do not run `prisma/seed.ts` against
  the real database: it deletes every user and transaction before re-seeding.**
- `node_modules` was installed on Linux. On Windows run `npx prisma generate`, and install the Windows
  native binaries for `lightningcss`, `@tailwindcss/oxide` and `sharp`, or just reinstall. If
  Turbopack fails with an `EPERM` symlink error, run `next dev --webpack`. Start the dev server
  from inside this folder.
- Root-level `check_admin_pass.ts`, `check_users.ts`, `test_auth.ts` are debugging scripts.

## Related
- The portfolio entry for HYDE is in `D:\proj\portofolio\data\projects.ts` (it needs real screenshots).
- Research deliverables still to do (grant): copyright registration (hak cipta) and a national journal ≥ Sinta 4.
