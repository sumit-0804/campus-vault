"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BanGuard } from "@/components/guards/BanGuard";

export default function Providers({
    children,
}: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={30}>
            <BanGuard />
            <QueryProvider>
                <TooltipProvider>{children}</TooltipProvider>
            </QueryProvider>
        </SessionProvider>
    )
}