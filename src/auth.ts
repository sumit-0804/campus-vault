import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import db from "./lib/db";
// const ALLOWED_DOMAIN = "dau.ac.in";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          fullName: profile.name,
          email: profile.email,
          avatarUrl: profile.image,
          role: "USER",
          karmaRank: "E_RANK",
          karmaScore: 0,
          isBanished: false,
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email;
      if (!email) return false;
      // if (!email?.endsWith(`@${ALLOWED_DOMAIN}`)) return false;

      try {
        const wizard = await db.wizard.findUnique({
          where: { email },
        });

        if (wizard) return true;

        await db.wizard.create({
          data: {
            id: profile.sub!,
            email: email,
            fullName: profile.name!,
            avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(profile.name ?? email)}`,
            updatedAt: new Date(),
          },
        });
        return true;
      } catch (error) {
        console.log("Error checking if user exists: ", error);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // When signing in, profile is available. 
      // But we should fetch fresh data from DB to ensure we have the latest role/karma
      if (token.email) {
        const dbUser = await db.wizard.findUnique({
          where: { email: token.email }
        })
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.fullName;
          token.picture = dbUser.avatarUrl;
          token.role = dbUser.role;
          token.karmaRank = dbUser.karmaRank;
          token.karmaScore = dbUser.karmaScore;
          token.isBanished = dbUser.isBanished;
          token.banReason = dbUser.banReason;
          token.phoneNumber = dbUser.phoneNumber;
          token.linkedinUrl = dbUser.linkedinUrl;
          token.instagramUrl = dbUser.instagramUrl;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.karmaRank = token.karmaRank as string;
        session.user.karmaScore = token.karmaScore as number;
        session.user.isBanished = token.isBanished as boolean;
        session.user.banReason = token.banReason as string | null;
        session.user.phoneNumber = token.phoneNumber as string | null;
        session.user.linkedinUrl = token.linkedinUrl as string | null;
        session.user.instagramUrl = token.instagramUrl as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url

      // Default to dashboard after successful login
      return `${baseUrl}/dashboard`
    },
  },
};
const handler = NextAuth(authOptions);
export const handlers = { GET: handler, POST: handler };
