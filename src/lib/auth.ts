import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isAllowedEmail } from "@/lib/domain";

async function findActiveUser(email: string | null | undefined) {
  if (!isAllowedEmail(email)) return null;
  const user = await db.user.findUnique({ where: { email: email!.trim().toLowerCase() } });
  return user?.active ? user : null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : null;
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const user = await findActiveUser(email);
        if (!user || !password) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        return ok ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return (await findActiveUser(user.email)) !== null;
    },
    async jwt({ token, user }) {
      // Always resolve role and id from the DB user (by email), so Google and Credentials behave the same.
      const email = user?.email ?? token.email;
      if (email) {
        const dbUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
