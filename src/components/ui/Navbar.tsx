"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Lock, ChevronRight } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      {/* THE CONSOLE */}
      <div className="flex items-center justify-between w-full max-w-5xl px-3 sm:px-6 md:px-10 py-3 md:py-4 rounded-xl bg-black/20 backdrop-blur-xl border border-white/5 pointer-events-auto">

        {/* BRAND: Batman Authority */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 md:gap-4 group">
          <div className="relative p-1.5 sm:p-2 border border-red-900/50 group-hover:border-red-600 transition-colors duration-500">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 group-hover:animate-pulse" />
            {/* Subtle underglow */}
            <div className="absolute inset-0 bg-red-600/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm sm:text-base md:text-xl font-black tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] uppercase text-white leading-none">
              Campus-Vault
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-0.5 sm:mt-1 hidden xs:block">
              DAU Terminal
            </span>
          </div>
        </Link>

        {/* THE ONLY ACTION: The Ritual Redirect */}
        <Link
          href="/sign-in"
          className="group relative flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white hover:bg-red-600 transition-all duration-700 rounded-none shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        >
          {/* Batman-style expansion effect */}
          <div className="absolute inset-0 border border-white group-hover:scale-125 group-hover:opacity-0 transition-all duration-700" />

          <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black group-hover:text-white transition-colors" />

          <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] text-black group-hover:text-white transition-colors uppercase">
            <span className="hidden sm:inline">Initialize Access</span>
            <span className="sm:hidden">Access</span>
          </span>

          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </motion.nav>
  );
}