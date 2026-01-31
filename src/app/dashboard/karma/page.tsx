export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";
import { KarmaScoreCard } from "./_components/KarmaScoreCard";
import { KarmaHistory } from "./_components/KarmaHistory";
import { ScoringGuide } from "./_components/ScoringGuide";
import { Skull } from "lucide-react";
import { redirect } from "next/navigation";

export default async function KarmaPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/sign-in");

    const user = await prisma.wizard.findUnique({
        where: { id: session.user.id },
        select: {
            karmaScore: true,
            karmaRank: true,
        }
    });

    // Get karma history (notifications with type KARMA_EARNED)
    const karmaHistory = await prisma.notification.findMany({
        where: {
            userId: session.user.id,
            type: "KARMA_EARNED",
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    if (!user) redirect("/sign-in");

    return (
        <div className="flex flex-col gap-6 p-4 pt-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Karma Points
                </span>
                <span className="text-2xl">💀✨</span>
            </h1>

            {/* Score Card */}
            <KarmaScoreCard score={user.karmaScore} rank={user.karmaRank} />

            {/* History & Scoring Guide */}
            <div className="grid md:grid-cols-2 gap-6">
                <KarmaHistory history={karmaHistory} />
                <ScoringGuide />
            </div>
        </div>
    );
}
