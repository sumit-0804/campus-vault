"use client";
import { motion } from "framer-motion";

export default function AuthPortal({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center p-6 overflow-hidden">

      <div className="absolute inset-0 z-0">
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      <div className="absolute inset-y-0 left-1/2 w-px bg-linear-to-b from-transparent via-white/10 to-transparent z-0" />

      <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-white/5 to-transparent z-0" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-20 w-full max-w-[420px] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_20px_100px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-red-600 to-transparent" />

        <div className="p-6 sm:p-10 md:p-12 lg:p-16">
          {children}
        </div>

        <div className="h-1 w-full flex justify-center space-x-2 pb-2">
          <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-red-900" />
          <div className="w-1 h-1 rounded-full bg-red-950" />
        </div>
      </motion.div>
    </div>
  );
}