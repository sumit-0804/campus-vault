"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({
    children,
}: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryProvider>
                <TooltipProvider>{children}</TooltipProvider>
            </QueryProvider>
        </SessionProvider>
    )
}