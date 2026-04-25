import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma/enums";

// Edge-safe Auth config: no Prisma, no Node-only deps.
// The full config in src/lib/auth.ts extends this with the Credentials provider.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
