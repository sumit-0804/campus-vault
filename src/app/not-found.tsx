"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { Jumpscare } from "@/components/ui/Jumpscare";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden flex items-center justify-center px-6">

      {/* Ambient failure glow */}
      <div className="absolute inset-0">
        <div className="absolute bottom-[-250px] left-[-200px] w-[600px] h-[600px] bg-red-900/20 blur-[200px]" />
        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-zinc-800/20 blur-[180px]" />
      </div>

      {/* Vertical axis */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-linear-to-b from-transparent via-white/5 to-transparent" />

      {/* Core */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-xl text-center"
      >
        {/* Sigil */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-10 flex items-center justify-center w-20 h-20 rounded-full border border-red-900/50 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(140,0,0,0.4)]"
        >
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </motion.div>

        {/* Code */}
        <h1 className="text-7xl font-black tracking-[0.4em] text-red-600 mb-6">
          404
        </h1>

        {/* Title */}
        <p className="text-xl uppercase tracking-[0.25em] text-white mb-4">
          Lost Sector
        </p>

        {/* Copy */}
        <p className="text-[12px] leading-relaxed tracking-wide text-zinc-400 max-w-md mx-auto mb-10">
          The path you attempted to access does not exist within this vault.
          Either it has been sealed, relocated, or you lack the required clearance.
        </p>

        {/* Action */}
        <Link
          href="/"
          className="
            group inline-flex items-center gap-4
            px-10 py-4
            bg-white text-black
            hover:bg-red-600 hover:text-white
            transition-all duration-700
            rounded-none
            shadow-[0_0_40px_rgba(255,255,255,0.08)]
          "
        >
          <span className="text-[11px] font-black tracking-[0.3em] uppercase">
            Return to Console
          </span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Ominous system footer */}
        <motion.p
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="mt-12 text-[10px] tracking-[0.4em] uppercase text-red-500/95"
        >
          Unauthorized Coordinates Detected
        </motion.p>
      </motion.div>
    </div>
  );
}
