export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { TransactionContent } from "./_components/TransactionContent";
import { Scroll } from "lucide-react";

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/sign-in");

    // Get user's active listings
    const activeListings = await prisma.cursedObject.findMany({
        where: {
            sellerId: session.user.id,
            status: "ACTIVE",
        },
        orderBy: { createdAt: 'desc' },
    });

    // Get sold items (transactions where user is seller)
    const soldItems = await prisma.transaction.findMany({
        where: { sellerId: session.user.id },
        include: {
            buyer: { select: { id: true, fullName: true, avatarUrl: true } },
            relic: { select: { id: true, title: true, images: true } },
            rating: true,
        },
        orderBy: { completedAt: 'desc' },
    });

    // Get purchased items (transactions where user is buyer)
    const purchasedItems = await prisma.transaction.findMany({
        where: { buyerId: session.user.id },
        include: {
            seller: { select: { id: true, fullName: true, avatarUrl: true } },
            relic: { select: { id: true, title: true, images: true } },
            rating: true,
        },
        orderBy: { completedAt: 'desc' },
    });

    // Get user's lost & found reports
    const lostFoundReports = await prisma.lostRelic.findMany({
        where: { reporterId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="flex flex-col gap-6 p-4 pt-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        My Transactions
                    </span>
                    <Scroll className="w-7 h-7 text-purple-400" />
                </h1>
                <p className="text-zinc-500 mt-1">
                    Manage your listings, orders, and reports.
                </p>
            </div>

            {/* Content */}
            <TransactionContent
                activeListings={activeListings}
                soldItems={soldItems}
                purchasedItems={purchasedItems}
                lostFoundReports={lostFoundReports}
            />
        </div>
    );
}
