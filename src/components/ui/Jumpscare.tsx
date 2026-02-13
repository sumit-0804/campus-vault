"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Skull } from "lucide-react";

export function Jumpscare() {
    const [scare, setScare] = useState<{ type: "bat" | "ghost" | null }>({ type: null });

    useEffect(() => {
        // 30% chance to trigger a scare on mount
        if (Math.random() < 0.3) {
            const type = Math.random() > 0.5 ? "bat" : "ghost";
            setScare({ type: type as any });

            // Reset after animation
            const timer = setTimeout(() => {
                setScare({ type: null });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <AnimatePresence>
            {scare.type === "bat" && (
                <motion.div
                    initial={{ x: "-100vw", y: "20vh", scale: 0.5, opacity: 0 }}
                    animate={{
                        x: "100vw",
                        y: ["20vh", "40vh", "10vh"],
                        scale: [0.5, 1.5, 0.5],
                        opacity: [0, 1, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                >
                    {/* SVG Bat substitute or just a dark shape */}
                    <div className="text-black drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                        <svg width="200" height="100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 12c.5-2 2-3.5 4-4 .5-2 3.5-3 5.5-3s5 1 5.5 3c2 .5 3.5 2 4 4-2 1-3.5 0-4-1 0 2.5-3 4-5.5 4S6.5 13.5 6.5 11c-.5 1-2 2-4 1z" />
                        </svg>
                    </div>
                </motion.div>
            )}

            {scare.type === "ghost" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 0.2, 0], scale: 1.2 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/20"
                >
                    <Ghost className="w-96 h-96 text-white/10 blur-sm" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
