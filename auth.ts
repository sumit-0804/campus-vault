import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_DOMAIN = "dau.ac.in";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization:{
        params:{
            hd:`${ALLOWED_DOMAIN}`,
            prompt:"select_account"
        }
      },
      profile(profile){
        return{
            id: profile.sub,
            fullName : profile.name,
            email: profile.email,
            avatarUrl: profile.picture,
            role: "USER",
            karmaRank: "MUGGLE"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({profile}){
        const email = profile?.email;
        if(!email)
            return false;
        if(!email?.endsWith(`@${ALLOWED_DOMAIN}`))
            return false;

        return true;
    },
    async jwt({ token, account }) {
      if (account) {
        (token as any).accessToken = (account as any).access_token;
      }
      return token;
    },
    async session({ session, user } ) {
      if(session.user){
        session.user.id = user.id;
        const wizard = user as any;
        session.user.role = wizard.role;
        session.user.karmaRank = wizard.karmaRank;
      }
      return session;
    },
  },
};
const handler = NextAuth(authOptions);
export const handlers = { GET: handler, POST: handler };
