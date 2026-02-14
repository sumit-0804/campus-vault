"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, ShieldAlert } from "lucide-react";

export default function Error({
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
        <div className="relative min-h-screen bg-[#050505] overflow-hidden flex items-center justify-center px-6">
            {/* Ambient failure glow */}
            <div className="absolute inset-0">
                <div className="absolute top-[-300px] left-[-100px] w-[800px] h-[800px] bg-red-900/10 blur-[150px]" />
                <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-orange-900/10 blur-[120px]" />
            </div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Core */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 max-w-xl text-center"
            >
                {/* Sigil */}
                <motion.div
                    animate={{
                        boxShadow: ["0 0 20px rgba(220, 38, 38, 0.2)", "0 0 60px rgba(220, 38, 38, 0.4)", "0 0 20px rgba(220, 38, 38, 0.2)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto mb-10 flex items-center justify-center w-24 h-24 rounded-full border border-red-900/50 bg-black/80 backdrop-blur-xl"
                >
                    <ShieldAlert className="w-10 h-10 text-red-600" />
                </motion.div>

                {/* Code */}
                <h1 className="text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-2">
                    500
                </h1>

                {/* Title */}
                <p className="text-lg uppercase tracking-[0.3em] text-red-400/80 mb-6 font-mono">
                    System Critical Failure
                </p>

                {/* Copy */}
                <p className="text-sm leading-relaxed tracking-wide text-zinc-500 max-w-md mx-auto mb-10 font-mono">
                    The vault's containment field has been breached.
                    Our spectral engineers utilize dark magic to contain the anomaly.
                    <br />
                    <span className="block mt-4 text-xs opacity-50">Error Digest: {error.digest || "UNKNOWN_ENTITY"}</span>
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={reset}
                        className="
              group flex items-center gap-3
              px-8 py-3
              bg-red-900/20 text-red-200
              border border-red-900/50
              hover:bg-red-900/40 hover:border-red-500
              transition-all duration-300
              rounded-sm uppercase tracking-widest text-xs font-bold
            "
                    >
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        Re-Cast Spell
                    </button>

                    <Link
                        href="/"
                        className="
              px-8 py-3
              text-zinc-500
              hover:text-white
              transition-colors duration-300
              uppercase tracking-widest text-xs font-bold
            "
                    >
                        Return to Safety
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
