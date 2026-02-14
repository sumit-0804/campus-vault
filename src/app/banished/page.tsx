"use client";

import { useState } from "react";
import { submitUnbanRequest } from "@/actions/ban";
import { toast } from "sonner";
import { Skull, Flame } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BanishedPage() {
    const session = useSession();
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("You must provide a reason for your plea.");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitUnbanRequest(reason);
            toast.success("Your plea has been heard by the Hell Lord. Wait for judgment.");
            setReason("");
        } catch (error: any) {
            toast.error(error.message || "The Hell Lord ignores your plea.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-red-600 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm95bmZ6bnF6MHNoYmpsbnF6MHNoYmpsbnF6MHNoYmpsbnF6MHNoeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L2IV3D3rDRgmRnm98u/giphy.gif')] opacity-10 bg-cover bg-center pointer-events-none" />

            <div className="z-10 max-w-2xl w-full text-center space-y-8">
                <div className="flex justify-center mb-6">
                    <Skull className="w-24 h-24 text-red-600 animate-pulse" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase glitch-text">
                    BANISHED
                </h1>

                <p className="text-xl md:text-2xl text-red-400">
                    You have been exiled from the realm. Your actions have consequences.
                </p>

                {/* Ban Reason Display */}
                {session.status === "authenticated" && session.data?.user?.banReason && (
                    <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg backdrop-blur-sm max-w-lg mx-auto mt-8">
                        <p className="text-red-500 text-xs uppercase tracking-widest font-bold mb-2">Decree of Exile</p>
                        <p className="text-zinc-300 italic">"{session.data.user.banReason}"</p>
                    </div>
                )}

                <div className="bg-zinc-900/80 border border-red-900/50 p-8 rounded-lg shadow-2xl backdrop-blur-sm mt-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                        <Flame className="w-6 h-6" />
                        Plead Your Case
                        <Flame className="w-6 h-6" />
                    </h2>
                    <div>
                        <p className="text-zinc-400 mb-6 text-sm">
                            If you believe this is a mistake, you may talk to the Hell Lord.
                        </p>
                        <p className="text-red-600">Make it count.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why should we let you back in?"
                            className="w-full h-32 bg-black border border-red-900/30 rounded-md p-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10 group-hover:text-red-400 transition-colors">
                                {isSubmitting ? "Sending Plea..." : "Talk to the DEVIL"}
                            </span>
                        </button>
                    </form>
                </div>

                <div className="text-zinc-700 text-xs mt-12">
                    Campus Vault &copy; {new Date().getFullYear()} // HELL EDITION
                </div>
            </div>

            <style jsx global>{`
                @keyframes glitch {
                    0% { transform: translate(0) }
                    20% { transform: translate(-2px, 2px) }
                    40% { transform: translate(-2px, -2px) }
                    60% { transform: translate(2px, 2px) }
                    80% { transform: translate(2px, -2px) }
                    100% { transform: translate(0) }
                }
                .glitch-text {
                    text-shadow: 2px 2px 0px rgba(255, 0, 0, 0.3);
                    animation: glitch 2s infinite linear alternate-reverse;
                }
            `}</style>
        </div>
    );
}
