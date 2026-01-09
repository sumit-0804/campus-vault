import { DefaultSession } from "next-auth";
declare module "next-auth"{
    interface Session {
        user: {
          id: string;
          fullName: string;
          role: string;
          karmaRank: string;
          karmaScore: number;
        } & DefaultSession["user"];
    }
    
    interface User {
        id?: string;
        fullName?: string;
        avatarUrl?: string;
        role?: string;
        karmaRank?: string;
        karmaScore?: number;
    }
      
}

declare module "next-auth/jwt"{
    interface JWT{
        accessToken?:string;
    }
}