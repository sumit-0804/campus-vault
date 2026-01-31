"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getOrCreateChatRoom } from "@/actions/chat";
import { MessageCircle, Eye, Package, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClaimRelicModal } from "./ClaimRelicModal";
import { markAsDroppedOff, markAsDelivered } from "@/actions/lost-found";

interface RelicDetailActionsProps {
    relic: {
        id: string;
        type: string;
        status: string;
        secretRiddle: string | null;
        reporterId: string;
        claimerId?: string | null;
    };
    isReporter: boolean;
    isClaimer: boolean;
}

export function RelicDetailActions({ relic, isReporter, isClaimer }: RelicDetailActionsProps) {
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDropOff = async () => {
        setIsLoading(true);
        const result = await markAsDroppedOff(relic.id);
        setIsLoading(false);

        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelivery = async () => {
        setIsLoading(true);
        const result = await markAsDelivered(relic.id);
        setIsLoading(false);

        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleContact = async () => {
        setIsLoading(true);
        try {
            // Determine who to contact:
            // If I am the reporter, contact the claimer (if exists)
            // If I am the visitor/claimer, contact the reporter
            const otherUserId = isReporter ? relic.claimerId : relic.reporterId;

            if (!otherUserId) {
                toast.error("No one to contact yet");
                return;
            }

            const chat = await getOrCreateChatRoom(otherUserId, relic.id);
            router.push(`/dashboard/messages/${chat.id}`);
        } catch (error: any) {
            console.error(error);
            if (error.message === "Unauthorized" || error.message.includes("Unauthorized")) {
                router.push("/sign-in");
            } else {
                toast.error("Failed to start conversation");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // For FOUND items
    if (relic.type === "FOUND") {
        // If item is OPEN, show claim button
        if (relic.status === "OPEN") {
            return (
                <>
                    <Button
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        onClick={() => setIsClaimModalOpen(true)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        This is Mine
                    </Button>

                    {relic.secretRiddle && (
                        <ClaimRelicModal
                            isOpen={isClaimModalOpen}
                            onClose={() => setIsClaimModalOpen(false)}
                            relicId={relic.id}
                            riddle={relic.secretRiddle}
                        />
                    )}
                </>
            );
        }

        // If item is VERIFIED and user is the reporter, show drop-off button
        if (relic.status === "VERIFIED" && isReporter) {
            return (
                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={handleDropOff}
                    disabled={isLoading}
                >
                    <Package className="w-4 h-4 mr-2" />
                    {isLoading ? "Processing..." : "Mark as Dropped Off"}
                </Button>
            );
        }

        // If item is DROPPED_OFF and user is the claimer, show delivery confirmation button
        if (relic.status === "DROPPED_OFF" && isClaimer) {
            return (
                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    onClick={handleDelivery}
                    disabled={isLoading}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isLoading ? "Processing..." : "Confirm Delivery"}
                </Button>
            );
        }

        // If item is DROPPED_OFF and user is the reporter, show waiting message
        if (relic.status === "DROPPED_OFF" && isReporter) {
            return (
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                    <p className="text-zinc-400 text-sm">
                        Waiting for owner to confirm delivery...
                    </p>
                </div>
            );
        }

        // If item is SOLVED
        if (relic.status === "SOLVED" || relic.status === "DELIVERED") {
            return (
                <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-800 text-center">
                    <p className="text-emerald-400 font-medium">
                        ✓ Item successfully returned!
                    </p>
                </div>
            );
        }
    }

    // For LOST items
    if (relic.type === "LOST") {
        if (isReporter) {
            // REPORTER IS THE OWNER

            // If item has been recovered (SOLVED)
            if (relic.status === "SOLVED" || relic.status === "DELIVERED") {
                return (
                    <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-800 text-center">
                        <p className="text-emerald-400 font-medium">
                            ✓ Item marked as found!
                        </p>
                    </div>
                );
            }

            // If Finder has marked as returned/dropped off -> Show Confirm Receipt
            if (relic.status === "DROPPED_OFF") {
                return (
                    <div className="space-y-4">
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            onClick={handleDelivery}
                            disabled={isLoading}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isLoading ? "Processing..." : "Confirm Receipt"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            onClick={handleContact}
                            disabled={isLoading}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {isLoading ? "Starting Chat..." : "Contact Finder"}
                        </Button>
                    </div>
                );
            }

            // If marked as found by someone else (VERIFIED) but not returned yet
            if (relic.status === "VERIFIED") {
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                            <p className="text-zinc-400 text-sm">
                                Someone has found your item! Waiting for them to return it.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            onClick={handleContact}
                            disabled={isLoading}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {isLoading ? "Starting Chat..." : "Contact Finder"}
                        </Button>
                    </div>
                );
            }

            // Default: "I Found It" button (for self-recovery)
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                        <p className="text-zinc-400 text-sm">
                            This is your lost item report.
                        </p>
                    </div>
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={async () => {
                            setIsLoading(true);
                            const { markAsFound } = await import("@/actions/lost-found");
                            const result = await markAsFound(relic.id);
                            setIsLoading(false);
                            if (result.success) {
                                toast.success(result.message);
                                router.refresh();
                            } else {
                                toast.error(result.error);
                            }
                        }}
                        disabled={isLoading}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isLoading ? "Processing..." : "I Found It Myself"}
                    </Button>
                </div>
            )
        } else {
            // VISITOR / POTENTIAL FINDER

            // If already solved
            if (relic.status === "SOLVED" || relic.status === "DELIVERED") {
                return (
                    <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-800 text-center">
                        <p className="text-emerald-400 font-medium">
                            ✓ Item has been found and returned.
                        </p>
                    </div>
                );
            }

            // If user has claimed to find it (isClaimer)
            if (isClaimer) { // In LOST context, isClaimer = Finder
                if (relic.status === "VERIFIED") {
                    return (
                        <div className="space-y-4">
                            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                                <p className="text-zinc-400 text-sm">
                                    You reported finding this! Please return it to the owner.
                                </p>
                            </div>
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                onClick={handleDropOff}
                                disabled={isLoading}
                            >
                                <Package className="w-4 h-4 mr-2" />
                                {isLoading ? "Processing..." : "Mark as Returned"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                onClick={handleContact}
                                disabled={isLoading}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {isLoading ? "Starting Chat..." : "Contact Owner"}
                            </Button>
                        </div>
                    );
                }
                if (relic.status === "DROPPED_OFF") {
                    return (
                        <div className="space-y-4">
                            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                                <p className="text-zinc-400 text-sm">
                                    Thanks for returning it! Waiting for owner confirmation.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                onClick={handleContact}
                                disabled={isLoading}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {isLoading ? "Starting Chat..." : "Contact Owner"}
                            </Button>
                        </div>
                    )
                }
            }

            // If someone else found it
            if (relic.status === "VERIFIED" || relic.status === "DROPPED_OFF") {
                return (
                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                        <p className="text-zinc-400 text-sm">
                            This item has been reported found.
                        </p>
                    </div>
                );
            }

            // Default: Show "I Found This" and Contact buttons
            return (
                <div className="space-y-3">
                    <Button
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        onClick={async () => {
                            setIsLoading(true);
                            const { reportFoundItem } = await import("@/actions/lost-found");
                            const result = await reportFoundItem(relic.id);
                            setIsLoading(false);
                            if (result.success) {
                                toast.success(result.message);
                                router.refresh();
                            } else {
                                toast.error(result.error);
                                if (result.error === "Unauthorized" || result.error?.includes("Unauthorized")) {
                                    router.push("/sign-in");
                                }
                            }
                        }}
                        disabled={isLoading}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {isLoading ? "Processing..." : "I Found This"}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        onClick={handleContact}
                        disabled={isLoading}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isLoading ? "Starting Chat..." : "Contact Reporter"}
                    </Button>
                </div>
            );
        }
    }

    return null;
}
