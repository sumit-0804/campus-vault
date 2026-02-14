"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function BanGuard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status !== "authenticated" || !pathname) return;

        const isBanished = session?.user?.isBanished;

        if (isBanished && !pathname.startsWith("/banished")) {
            router.replace("/banished");
        } else if (!isBanished && pathname.startsWith("/banished")) {
            router.replace("/dashboard");
        }
    }, [session, status, pathname, router]);

    return null;
}
