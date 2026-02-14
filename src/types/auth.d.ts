import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            fullName: string;
            role: string;
            karmaRank: string;
            karmaScore: number;
            isBanished: boolean;
            banReason?: string | null;
            phoneNumber?: string | null;
            linkedinUrl?: string | null;
            instagramUrl?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        fullName: string;
        avatarUrl?: string;
        role: string;
        karmaRank: string;
        karmaScore: number;
        isBanished: boolean;
        banReason?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        id?: string;
        role?: string;
        karmaRank?: string;
        karmaScore?: number;
        isBanished?: boolean;
        banReason?: string | null;
        phoneNumber?: string | null;
        linkedinUrl?: string | null;
        instagramUrl?: string | null;
    }
}