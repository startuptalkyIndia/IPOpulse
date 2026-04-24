import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        // Try admin first (backward compat for /sup-min), then public user
        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (admin) {
          const ok = await bcrypt.compare(password, admin.passwordHash);
          if (ok) {
            return { id: admin.id, email: admin.email, name: admin.name ?? undefined, role: admin.role };
          }
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (ok) {
            return { id: user.id, email: user.email, name: user.name ?? undefined, role: "user" };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = (token.role as string) ?? "user";
        (session.user as { id?: string }).id = (token.sub as string | undefined) ?? undefined;
      }
      return session;
    },
    authorized: async ({ auth, request }) => {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/sup-min/") && pathname !== "/sup-min") {
        const role = (auth?.user as { role?: string } | undefined)?.role;
        return role === "admin" || role === "superadmin";
      }
      if (pathname.startsWith("/my/")) {
        return !!auth?.user;
      }
      return true;
    },
  },
};
