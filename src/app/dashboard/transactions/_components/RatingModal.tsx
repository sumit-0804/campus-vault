"use client";

import { useState, useTransition } from "react";
import { submitRating } from "@/actions/ratings";
import { Button } from "@/components/ui/button";
import { Star, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RatingModalProps {
    transactionId: string;
    sellerName: string;
    itemTitle: string;
    onClose: () => void;
    onRated: () => void;
}

export function RatingModal({
    transactionId,
    sellerName,
    itemTitle,
    onClose,
    onRated,
}: RatingModalProps) {
    const router = useRouter();
    const [stars, setStars] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (stars === 0) {
            setError("Please select a rating");
            return;
        }

        startTransition(async () => {
            try {
                await submitRating(transactionId, stars, comment || undefined);
                onRated();
                onClose();
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to submit rating");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Rate Your Experience</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        How was your purchase of <span className="text-zinc-300">{itemTitle}</span> from{" "}
                        <span className="text-zinc-300">{sellerName}</span>?
                    </p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setStars(rating)}
                            onMouseEnter={() => setHoveredStar(rating)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-10 h-10 transition-colors ${rating <= (hoveredStar || stars)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-zinc-600"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Rating Label */}
                <p className="text-center text-sm text-zinc-400 mb-4">
                    {stars === 0
                        ? "Select a rating"
                        : stars === 5
                            ? "⭐ Excellent! (+10 Karma for seller)"
                            : stars >= 4
                                ? "Great experience!"
                                : stars >= 3
                                    ? "It was okay"
                                    : stars >= 2
                                        ? "Could be better"
                                        : "Poor experience"}
                </p>

                {/* Comment */}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    className="w-full h-24 px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-sm text-center mt-3">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || stars === 0}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Rating"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
