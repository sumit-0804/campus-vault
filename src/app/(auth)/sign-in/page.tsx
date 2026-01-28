"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import AuthPortal from "../components/AuthPortal";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  return (
    <AuthPortal>
      <div className="flex flex-col items-center">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, letterSpacing: "1em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.5 }}
        >
          <h1 className="text-white text-2xl sm:text-3xl font-light uppercase">
            Campus <span className="text-red-600 font-bold">Vault</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase">
            Security Clearance Level 4
          </p>
        </motion.div>


        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-5 sm:py-6 md:py-7 bg-white text-black hover:bg-zinc-200 transition-all duration-300 rounded-none font-black tracking-wide sm:tracking-widest text-[10px] sm:text-xs flex gap-3 sm:gap-4 items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.08)] group"
        >
          <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          AUTHORIZE WITH GOOGLE
        </Button>


        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium tracking-wide leading-relaxed italic">
            "Only those bound to <span className="text-red-500 font-bold">dau.ac.in</span> <br />
            may cross this threshold."
          </p>
        </div>
      </div>
    </AuthPortal>
  );
}