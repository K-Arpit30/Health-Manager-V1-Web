import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAccount } from "../../../../utils/db";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password credentials");
        }
        
        const account = getAccount(credentials.email);
        if (!account) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, account.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: account.email,
          email: account.email,
          name: account.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login"
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email || token.sub || "";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "project18_super_secret_key_12345",
});

export { handler as GET, handler as POST };
