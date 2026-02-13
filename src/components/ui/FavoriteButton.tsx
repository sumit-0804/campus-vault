"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    className?: string;
}

export function FavoriteButton({ className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    return (
        <button
            onClick={toggleFavorite}
            className={cn(
                "w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all group/fav",
                className
            )}
        >
            <AnimatePresence mode="wait">
                {isFavorite ? (
                    <motion.div
                        key="ghost"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                        exit={{ scale: 0 }}
                    >
                        <Ghost className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="heart"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <Heart className="w-3.5 h-3.5 text-zinc-400 group-hover/fav:text-red-400" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}
