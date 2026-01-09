"use client";
import { motion } from "framer-motion";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white overflow-hidden">
      
      {/* Global ambient field */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-300px] left-[-200px] w-[600px] h-[600px] bg-red-900/10 blur-[200px]" />
        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-zinc-800/10 blur-[180px]" />
      </div>

      {/* Global vertical axis */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-linear-to-b from-transparent via-white/5 to-transparent" />

      {/* Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.main>
    </div>
  );
}
