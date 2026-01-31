"use client";

import { useEffect } from "react";
import { grantDailyLoginBonus } from "@/actions/karma";
import { useSession } from "next-auth/react";

export function DailyLoginManager() {
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            // Attempt to grant daily login bonus
            // The server action handles the "once per day" logic
            grantDailyLoginBonus().catch(err => {
                console.error("Failed to check daily login bonus:", err);
            });
        }
    }, [status]);

    return null; // This component handles logic only, no UI
}
