"use client";

import { useState, useTransition } from "react";
import { getTransactions } from "@/actions/transactions";
import { TransactionCard } from "./TransactionCard";
import { ShoppingBag, Inbox } from "lucide-react";

type TransactionType = 'all' | 'purchases' | 'sales';

interface Transaction {
    id: string;
    buyerId: string;
    sellerId: string;
    finalPrice: number;
    completedAt: Date;
    buyer: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    };
    seller: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    };
    relic: {
        id: string;
        title: string;
        images: string[];
    };
    rating: {
        id: string;
        stars: number;
        comment: string | null;
    } | null;
}

interface TransactionTabsProps {
    initialTransactions: Transaction[];
}

const tabs: { id: TransactionType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'purchases', label: 'Purchases' },
    { id: 'sales', label: 'Sales' },
];

export function TransactionTabs({ initialTransactions }: TransactionTabsProps) {
    const [activeTab, setActiveTab] = useState<TransactionType>('all');
    const [transactions, setTransactions] = useState(initialTransactions);
    const [isPending, startTransition] = useTransition();

    const handleTabChange = (tab: TransactionType) => {
        setActiveTab(tab);

        startTransition(async () => {
            const result = await getTransactions(tab);
            setTransactions(result.transactions);
        });
    };

    return (
        <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl border border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        disabled={isPending}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            {isPending ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <div className="p-6 rounded-full bg-zinc-800/50 border border-white/5 mb-4">
                        {activeTab === 'purchases' ? (
                            <ShoppingBag className="w-12 h-12 opacity-50" />
                        ) : (
                            <Inbox className="w-12 h-12 opacity-50" />
                        )}
                    </div>
                    <h3 className="text-lg font-medium mb-1">
                        No {activeTab === 'all' ? 'transactions' : activeTab} yet
                    </h3>
                    <p className="text-sm text-zinc-600">
                        {activeTab === 'purchases'
                            ? "Items you buy will appear here"
                            : activeTab === 'sales'
                                ? "Items you sell will appear here"
                                : "Your transaction history will appear here"
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {transactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
