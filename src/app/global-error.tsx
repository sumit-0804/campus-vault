"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, Skull } from "lucide-react";
import "./globals.css"; // Ensure styles are loaded

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center px-6 font-sans">
                    {/* Core */}
                    <div className="relative z-10 max-w-xl text-center">
                        {/* Sigil */}
                        <div className="mx-auto mb-10 flex items-center justify-center w-24 h-24 rounded-full border border-red-900/50 bg-black/80 backdrop-blur-xl">
                            <Skull className="w-10 h-10 text-red-600 animate-pulse" />
                        </div>

                        {/* Code */}
                        <h1 className="text-8xl font-black tracking-widest text-red-700 mb-2">
                            CRITICAL
                        </h1>

                        {/* Title */}
                        <p className="text-lg uppercase tracking-[0.3em] text-red-400/80 mb-6 font-mono">
                            Vault Collapse Imminent
                        </p>

                        {/* Copy */}
                        <p className="text-sm leading-relaxed tracking-wide text-zinc-500 max-w-md mx-auto mb-10 font-mono">
                            A catastrophic failure has occurred in the root layer. Evacuate immediately.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={reset}
                                className="
                  flex items-center gap-3
                  px-8 py-3
                  bg-red-900/20 text-red-200
                  border border-red-900/50
                  hover:bg-red-900/40
                  transition-all duration-300
                  rounded-sm uppercase tracking-widest text-xs font-bold
                "
                            >
                                <RotateCcw className="w-4 h-4" />
                                Re-Initialize
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
