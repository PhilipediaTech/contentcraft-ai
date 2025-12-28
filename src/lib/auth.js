import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier,
          creditsRemaining: user.creditsRemaining,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = user.subscriptionTier;
        token.creditsRemaining = user.creditsRemaining;
      }

      // Update token when session.update() is called
      if (trigger === "update" && session) {
        // Fetch fresh user data
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            subscriptionTier: true,
            creditsRemaining: true,
          },
        });

        if (freshUser) {
          token.subscriptionTier = freshUser.subscriptionTier;
          token.creditsRemaining = freshUser.creditsRemaining;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.subscriptionTier = token.subscriptionTier;
        session.user.creditsRemaining = token.creditsRemaining;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
