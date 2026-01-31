"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BackButtonProps extends React.ComponentProps<typeof Button> {
    fallbackRoute?: string;
    children?: React.ReactNode;
}

export function BackButton({
    fallbackRoute = "/dashboard",
    children,
    className,
    variant = "ghost",
    onClick,
    ...props
}: BackButtonProps) {
    const router = useRouter();
    const [hasHistory, setHasHistory] = useState(false);

    useEffect(() => {
        // Check if there is a referrer from the same origin to determine if we can go back safely
        if (typeof window !== 'undefined' && document.referrer.includes(window.location.origin)) {
            setHasHistory(true);
        }
    }, []);

    const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
            return;
        }

        if (hasHistory) {
            router.back();
        } else {
            router.push(fallbackRoute);
        }
    };

    return (
        <Button
            variant={variant}
            className={cn("text-zinc-400 hover:text-white pl-0 hover:bg-transparent transition-colors", className)}
            onClick={handleBack}
            {...props}
        >
            {children || (
                <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </>
            )}
        </Button>
    );
}
