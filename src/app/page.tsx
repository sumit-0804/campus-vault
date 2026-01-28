"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Search, ShieldCheck, Sparkles } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/ui/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-indigo-950/40 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_60%)]" />

        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-40 md:pt-24 pb-24 sm:pb-24 md:pb-24 px-4 sm:px-6 text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Badge className="mb-8 px-4 sm:px-6 py-2 text-xs tracking-[0.3em] uppercase bg-purple-900/30 border border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-2 inline" />
              University Exclusive Marketplace
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight"
          >
            Buy, Sell & Discover<br />
            <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Magic on Campus
            </span>
          </motion.h1>

          <p className="mt-6 sm:mt-8 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-zinc-400">
            A secret marketplace where students trade essentials, recover lost relics,
            and build reputation — governed by Gotham discipline, Hawkins mystery,
            and wizard-grade trust.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-red-600 text-black hover:bg-red-700 tracking-[0.3em] uppercase font-black"
            >
              <Link href="/sign-in">Get Started</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto tracking-[0.3em] uppercase font-black border-white/30"
            >
              <Link href="/browse">Browse Listings</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative pb-24 sm:pb-32 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Student Marketplace"
              description="Trade items inside your campus bubble. No outsiders. No shipping. Just trusted peers — like a hidden common room."
              accent="red"
            />

            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Lost & Found"
              description="Lost an ID? Found a charger? Our smart matching alerts the right people instantly — like real-world magic."
              accent="purple"
            />

            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Trust & Karma"
              description="Every user is verified. Earn Karma for honest trades and returned items. Reputation is your true power."
              accent="blue"
            />
          </div>
        </section>
      </main>
    </>
  );
}
