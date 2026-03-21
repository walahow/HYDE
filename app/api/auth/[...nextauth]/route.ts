import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nim: { label: "NIM", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nim || !credentials?.password) {
          throw new Error("Missing NIM or Password");
        }

        const nim = credentials.nim.trim();
        console.log(`[AUTH] Attempting login for NIM: ${nim}`);

        const user = await prisma.user.findUnique({
          where: { nim },
        });

        if (!user || !user.password) {
          console.warn(`[AUTH] User not found or no password for NIM: ${nim}`);
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.warn(`[AUTH] Invalid password for NIM: ${nim}`);
          throw new Error("Invalid credentials");
        }

        console.log(`[AUTH] Login successful for: ${user.name} (${user.role})`);
        return {
          id: user.id,
          nim: user.nim,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.nim  = (user as any).nim;
        token.role = (user as any).role;
        token.name = user.name;
        console.log(`[JWT] New session for ID: ${token.id}, Role: ${token.role}`);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nim = token.nim;
        (session.user as any).role = token.role;

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true }
        });
        
        if (!dbUser) {
          console.warn(`[SESSION] User no longer exists in DB: ${token.id}`);
          return null as any;
        }
        
        (session.user as any).role = dbUser.role;
        console.log(`[SESSION] Verified role: ${(session.user as any).role} for ID: ${token.id}`);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path:     "/",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
