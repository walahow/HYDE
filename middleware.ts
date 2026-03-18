import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only instantiate once at module level (not inside the handler)
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis:   Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 attempts per IP per minute
  });
} else {
  console.warn("[RATELIMIT] Upstash env vars not set — rate limiting is DISABLED.");
}

export default withAuth(
  async function middleware(req) {
    // ── Rate‑limit the credentials login endpoint ──────────────────────────
    if (req.nextUrl.pathname === "/api/auth/callback/credentials") {
      if (ratelimit) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
        const { success, remaining } = await ratelimit.limit(ip);

        if (!success) {
          console.warn(`[RATELIMIT] Blocked login attempt from IP: ${ip}`);
          return NextResponse.json(
            { error: "Too many login attempts. Please wait a moment and try again." },
            { status: 429 }
          );
        }

        console.log(`[RATELIMIT] Login attempt allowed (${remaining} remaining) for IP: ${ip}`);
      }
    }

    // ── Role‑based redirects ───────────────────────────────────────────────
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isStudentPage = req.nextUrl.pathname.startsWith("/dashboard/student");
    const isAdminPage   = req.nextUrl.pathname.startsWith("/dashboard/admin");

    if (isAuth) {
      // Redirect ADMIN away from student pages
      if (token.role === "ADMIN" && (isStudentPage || req.nextUrl.pathname === "/")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      // Redirect STUDENT away from admin pages
      if (token.role === "STUDENT" && (isAdminPage || req.nextUrl.pathname.startsWith("/admin"))) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", req.nextUrl.pathname);
        url.searchParams.set("error", "AccessDenied");
        return NextResponse.redirect(url);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
      error:  "/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/student/:path*",
    "/riwayat/:path*",
    "/dashboard/:path*",
    "/api/transactions/:path*",
    "/api/auth/callback/credentials",
  ],
};

