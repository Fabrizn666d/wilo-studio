import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isUserRole, type UserRole } from "@/lib/auth/permissions";

export type { UserRole } from "@/lib/auth/permissions";

// Always perform one bcrypt comparison, including for unknown or disabled users,
// so the response time does not reveal whether an account exists.
const DUMMY_PASSWORD_HASH = "$2b$12$t86.GCuqpAj/Jkr5YgGZL.IeAF3PSW.fJk9xv2Eg4vyY6WxsVE8Di";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const realIp = request.headers?.["x-real-ip"]?.trim();
        const ip = realIp || request.headers?.["x-forwarded-for"]?.split(",").at(-1)?.trim() || "unknown";
        const rate = consumeRateLimit(`auth:${ip}:${parsed.data.email}`, 5, 15 * 60_000);
        if (!rate.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        const role = user && isUserRole(user.role) ? user.role : null;
        const eligible = Boolean(user?.active && role);
        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          eligible && user ? user.passwordHash : DUMMY_PASSWORD_HASH,
        );
        if (!eligible || !user || !role || !passwordMatches) return null;

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: user.id, email: user.email, name: user.name, role, sessionVersion: user.sessionVersion };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        session.user.role = token.role as UserRole;
        session.user.sessionVersion = Number(token.sessionVersion ?? -1);
      }
      return session;
    },
  },
};
