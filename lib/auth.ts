import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * Reusable helper to require authentication (and optionally a specific role) 
 * inside Next.js API route handlers. Re-verifies role from DB for security.
 */
export async function requireAuth(role?: "STUDENT" | "ADMIN") {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // Re-verify role from DB on sensitive operations
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (role && user.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
