"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Search, ChevronRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/ui/Navbar";

export default function BrowsePage() {
    return (
        <>
            <Navbar />
            <main className="relative min-h-screen bg-black text-white overflow-hidden flex items-center justify-center p-4">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-black to-black" />

                <div className="relative z-10 w-full max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                            Choose Your Path
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            What brings you to the vault today?
                        </p>
                    </motion.div>

                    {/* Selection Cards */}
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
                        {/* Marketplace Card */}
                        <Link href="/marketplace" className="group">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="h-full p-8 sm:p-12 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/50 to-black hover:from-purple-900/20 hover:to-black transition-all duration-500 relative overflow-hidden group-hover:border-purple-500/30"
                            >
                                <div className="absolute top-0 right-0 p-32 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all" />

                                <div className="relative z-10 flex flex-col items-center text-center h-full">
                                    <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
                                        The Marketplace
                                    </h2>
                                    <p className="text-zinc-500 mb-8 max-w-sm group-hover:text-zinc-400 transition-colors">
                                        Buy and sell goods within the campus. Secure trades, trusted peers, and fair prices.
                                    </p>
                                    <span className="mt-auto flex items-center text-sm font-bold uppercase tracking-widest text-purple-500 group-hover:translate-x-2 transition-transform">
                                        Enter Market <ChevronRight className="w-4 h-4 ml-2" />
                                    </span>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Lost & Found Card */}
                        <Link href="/lost-found" className="group">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="h-full p-8 sm:p-12 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/50 to-black hover:from-blue-900/20 hover:to-black transition-all duration-500 relative overflow-hidden group-hover:border-blue-500/30"
                            >
                                <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all" />

                                <div className="relative z-10 flex flex-col items-center text-center h-full">
                                    <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Search className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                                        Lost & Found
                                    </h2>
                                    <p className="text-zinc-500 mb-8 max-w-sm group-hover:text-zinc-400 transition-colors">
                                        Report lost items or find owners for things you've discovered. The map never lies.
                                    </p>
                                    <span className="mt-auto flex items-center text-sm font-bold uppercase tracking-widest text-blue-500 group-hover:translate-x-2 transition-transform">
                                        Begin Search <ChevronRight className="w-4 h-4 ml-2" />
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <Link href="/" className="inline-flex items-center text-zinc-600 hover:text-white transition-colors text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                        </Link>
                    </motion.div>
                </div>
            </main>
        </>
    );
}
