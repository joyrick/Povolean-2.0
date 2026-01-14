import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUser } from "./users";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials === undefined ||
          credentials.email === undefined ||
          credentials.password === undefined
        ) {
          return null;
        }
        const user = validateUser(credentials.email, credentials.password);
        if (user === null) {
          return null;
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user !== undefined) {
        token.role = (user as { role?: string }).role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user !== undefined) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};
