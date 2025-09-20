import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (raw) => {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;
      const normalizedEmail = email.trim().toLowerCase();
      const rows = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (rows.length === 0) return null;
      const user = rows[0];
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, sessionVersion: user.sessionVersion };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { id?: string; email?: string | null; sessionVersion?: number };
        if (account?.provider === "google") {
          const email = (u.email ?? token.email)?.toLowerCase();
          if (email) {
            const existing = await db
              .select({ id: users.id, sessionVersion: users.sessionVersion })
              .from(users)
              .where(eq(users.email, email))
              .limit(1);

            let id = existing[0]?.id;
            let sessionVersion = existing[0]?.sessionVersion;
            if (!id) {
              const inserted = await db
                .insert(users)
                .values({ email, passwordHash: "google-oauth" })
                .returning({ id: users.id, sessionVersion: users.sessionVersion });
              id = inserted[0]?.id;
              sessionVersion = inserted[0]?.sessionVersion;
            }

            if (id) {
              token.sub = id;
              token.email = email;
              token.sessionVersion = sessionVersion ?? token.sessionVersion ?? 1;
              token.sessionInvalid = false;
            }
          }
        } else {
          token.sub = u.id ?? token.sub;
          token.email = u.email ?? token.email;
          if (typeof u.sessionVersion === "number") {
            token.sessionVersion = u.sessionVersion;
          }
          token.sessionInvalid = false;
        }
      }

      if (!user && token.sub) {
        try {
          const rows = await db
            .select({ sessionVersion: users.sessionVersion })
            .from(users)
            .where(eq(users.id, token.sub))
            .limit(1);
          const currentVersion = rows[0]?.sessionVersion;
          if (currentVersion === undefined) {
            token.sessionInvalid = true;
          } else if (typeof token.sessionVersion === "number" && token.sessionVersion < currentVersion) {
            token.sessionInvalid = true;
            token.sessionVersion = currentVersion;
          } else {
            token.sessionInvalid = false;
            token.sessionVersion = token.sessionVersion ?? currentVersion ?? 1;
          }
        } catch (error) {
          console.warn("Failed to verify session version", error);
          token.sessionInvalid = false;
        }
      }

      if (token.sessionInvalid === undefined) {
        token.sessionInvalid = false;
      }

      if (!token.sessionVersion) {
        token.sessionVersion = 1;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sessionInvalid) {
        return null;
      }
      if (session.user) {
        (session.user as unknown as { id?: string }).id = token.sub;
        session.user.email = token.email as string | undefined;
        (session.user as unknown as { sessionVersion?: number }).sessionVersion = token.sessionVersion as number | undefined;
      }
      return session;
    },
  },
};

if (!authOptions.secret) {
  console.error("AUTH_SECRET or NEXTAUTH_SECRET is not set. Authentication will not work.");
}

export const authHandler = NextAuth(authOptions);
