"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface BackToMapButtonProps {
    fallbackRoute?: string;
}

export function BackToMapButton({ fallbackRoute = "/dashboard" }: BackToMapButtonProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [hasHistory, setHasHistory] = useState(false);

    useEffect(() => {
        // Check if there is a referrer from the same origin
        if (typeof window !== 'undefined' && document.referrer.includes(window.location.origin)) {
            setHasHistory(true);
        }
    }, []);

    const handleBack = () => {
        if (hasHistory) {
            router.back();
        } else {
            // Direct access fallback
            if (session) {
                router.push(fallbackRoute);
            } else {
                router.push("/");
            }
        }
    };

    return (
        <Button
            variant="ghost"
            className="text-stone-400 hover:text-stone-200 pl-0"
            onClick={handleBack}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
    );
}
