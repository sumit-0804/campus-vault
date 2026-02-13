"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function FloatingCard({ children, className, delay = 0 }: FloatingCardProps) {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: delay,
            }}
            className={cn("h-full", className)}
        >
            {children}
        </motion.div>
    );
}
