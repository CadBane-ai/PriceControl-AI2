import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env'; // Assuming env variables are loaded here

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user || !user.hashedPassword) {
          // User not found or has no password (should not happen with our schema)
          throw new Error("Invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(credentials.password as string, user.hashedPassword);

        if (!passwordMatch) {
          // Password does not match
          throw new Error("Invalid credentials");
        }

        // Return user object for session
        // Ensure only necessary fields are returned
        return {
          id: user.id,
          email: user.email,
          // Add any other fields you want to be available in the session
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // Persist the user ID and email to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Add user ID and email to the session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt", // Use JWT strategy for sessions
  },
  secret: env.NEXTAUTH_SECRET, // Load secret from environment variables
  pages: {
    signIn: '/login', // Redirect to login page if not authenticated
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };