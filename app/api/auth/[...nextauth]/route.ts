// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyAdminLogin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// توسيع أنواع Session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "SUPERADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "USER" | "ADMIN" | "SUPERADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN" | "SUPERADMIN";
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Admins: e-mail + password + authenticator-app code (see lib/admin-auth.ts)
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password || !credentials.code) return null;
        return verifyAdminLogin(credentials.email, credentials.password, credentials.code);
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        // the admin form already checked everything
        if (account?.provider === "admin-credentials") return true;
        if (!user.email) return false;

        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || undefined,
            image: user.image || undefined,
          },
          create: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
            image: user.image,
            role: "USER",
          },
        });

        // An admin who has set up the authenticator app can no longer come in through Google,
        // otherwise the code could be skipped.
        if (dbUser.role !== "USER" && dbUser.totpEnabled) return false;

        user.id = dbUser.id;
        user.role = dbUser.role as "USER" | "ADMIN" | "SUPERADMIN";
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN" | "SUPERADMIN";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
