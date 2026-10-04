# HYDE QA & Testing Plan

This document outlines the strategy for implementing Functional, Mutation, and Load testing on the HYDE project.

## 1. Functional Testing
**Environment:** Local
**Tool:** Playwright (Blackbox) & Jest (Whitebox) - *already present in `package.json`*

*   **Strategy:** Expand on the existing 71 passing tests. We will focus on testing the core flows defined in the student grant specs (e.g., digital vs. hybrid document workflows, QR scanning simulation).
*   **Safety Check:** Since `D:\proj\HYDE\.env` contains **real** production credentials (MongoDB Atlas, Vercel Blob, Upstash), we **must** ensure functional tests use a separate `.env.test` pointing to a local MongoDB or a separate test cluster. We do not want test data polluting production or eating up free-tier storage.

## 2. Mutation Testing
**Environment:** Local
**Tool:** StrykerJS (integrates with Jest)

*   **Strategy:** Mutation testing is resource-heavy because it modifies the code (injects "mutants") and reruns the Jest test suite hundreds of times to see if the tests catch the changes. 
*   **Why Local:** Running this on CI or Vercel would be extremely slow and could exhaust cloud provider limits. Running it locally is the only practical approach.

## 3. Load Testing
**Environment:** Both (Staged approach)
**Tool:** k6 (scriptable in JavaScript)

*   **Phase 1: Local Load Testing:**
    *   Target `localhost:3000`.
    *   **Goal:** Find code-level bottlenecks (e.g., Prisma N+1 queries, slow API routes) without network latency masking the issues.
*   **Phase 2: Vercel Load Testing (Controlled):**
    *   Target the live Vercel URL.
    *   **Goal:** Measure real-world latency, cold starts, and cloud database performance.
    *   **Warning:** HYDE uses Vercel Free, Atlas Free (max 500 connections), and Upstash Free (10k commands/day). A heavy stress test could easily blow past these limits or get the accounts temporarily suspended. We will use a *controlled* simulation (e.g., 10-30 concurrent users) rather than a maximum-capacity stress test.

## Execution Steps (Proposed)
1.  **Audit & Environment:** Review existing Playwright/Jest tests. Setup `.env.test` to protect the production DB.
2.  **Mutation Setup:** Install `stryker-cli` and configure it to run against the existing Jest whitebox tests.
3.  **Load Test Scripting:** Write a `k6` script simulating a student login and document upload flow.
4.  **Execution & Reporting:** Run the tests locally, then execute a careful load test against Vercel. Document findings.
