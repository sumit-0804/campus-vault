"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost } from "lucide-react";

interface JumpscareProps {
    force?: "bat" | "ghost" | "glitch";
    probability?: number; // 0 to 1
}

export function Jumpscare({ force, probability = 0.05 }: JumpscareProps) {
    const [scare, setScare] = useState<{ type: "bat" | "ghost" | "glitch" | null }>({ type: null });

    useEffect(() => {
        // If forced, trigger immediately
        if (force) {
            setScare({ type: force });
            const timer = setTimeout(() => setScare({ type: null }), 4000);
            return () => clearTimeout(timer);
        }

        // Otherwise, check probability on mount
        if (Math.random() < probability) {
            const options = ["bat", "ghost", "glitch"];
            const type = options[Math.floor(Math.random() * options.length)] as "bat" | "ghost" | "glitch";

            // Delay slightly so it doesn't happen INSTANTLY on load
            const delay = setTimeout(() => {
                setScare({ type });
                // Reset after animation
                const duration = type === "glitch" ? 500 : 4000;
                setTimeout(() => setScare({ type: null }), duration);
            }, 1000 + Math.random() * 2000);

            return () => clearTimeout(delay);
        }
    }, [force, probability]);

    return (
        <AnimatePresence>
            {/* 🦇 BAT ANIMATION */}
            {scare.type === "bat" && (
                <motion.div
                    initial={{ x: "-20vw", y: "80vh", scale: 0.2, rotate: 15 }}
                    animate={{
                        x: "120vw",
                        y: "10vh",
                        scale: [0.2, 1.5, 0.5],
                        rotate: [15, -10, 5],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
                >
                    <div className="text-black drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] filter blur-[1px]">
                        {/* Realistic Bat Shape */}
                        <svg width="300" height="150" viewBox="0 0 550 300" fill="currentColor">
                            <path d="M275,190 c-40,0 -70,-20 -90,-40 c-30,-30 -40,-80 -40,-80 c0,0 -10,40 -40,50 c-20,6 -50,0 -80,-30 c0,0 20,60 10,90 c-5,15 -20,20 -20,20 c40,20 80,0 100,-20 c10,-10 20,-30 20,-30 c0,0 10,40 50,50 c20,5 60,10 90,-10 c30,20 70,15 90,10 c40,-10 50,-50 50,-50 c0,0 10,20 20,30 c20,20 60,40 100,20 c0,0 -15,-5 -20,-20 c-10,-30 10,-90 10,-90 c-30,30 -60,36 -80,30 c-30,-10 -40,-50 -40,-50 c0,0 -10,50 -40,80 c-20,20 -50,40 -90,40 z" />
                            <circle cx="260" cy="205" r="3" fill="red" />
                            <circle cx="290" cy="205" r="3" fill="red" />
                        </svg>
                    </div>
                </motion.div>
            )}

            {/* 👻 GHOST ANIMATION */}
            {scare.type === "ghost" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 100 }}
                    animate={{ opacity: [0, 0.4, 0], scale: 1.2, y: -100 }}
                    transition={{ duration: 3, times: [0, 0.5, 1] }}
                    className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center bg-transparent"
                >
                    <Ghost className="w-[400px] h-[400px] text-white/10 blur-md" />
                </motion.div>
            )}

            {/* 📺 SCREEN GLITCH */}
            {scare.type === "glitch" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, repeat: 2 }}
                    className="fixed inset-0 pointer-events-none z-[100] bg-red-900/20 mix-blend-difference"
                    style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 4px)' }}
                />
            )}
        </AnimatePresence>
    );
}
