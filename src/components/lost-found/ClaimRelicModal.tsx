"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyRelicClaim } from "@/actions/lost-found";
import { Loader2, Lock, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClaimRelicModalProps {
    isOpen: boolean;
    onClose: () => void;
    relicId: string;
    riddle: string;
}

export function ClaimRelicModal({ isOpen, onClose, relicId, riddle }: ClaimRelicModalProps) {
    const [answer, setAnswer] = useState("");
    const [status, setStatus] = useState<"IDLE" | "VERIFYING" | "SUCCESS" | "ERROR">("IDLE");
    const [finderContact, setFinderContact] = useState<{ name: string; email: string; phone: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleVerify = async () => {
        if (!answer.trim()) return;
        setStatus("VERIFYING");
        setErrorMessage("");

        const result = await verifyRelicClaim(relicId, answer);

        if (result.success && result.finderContact) {
            setStatus("SUCCESS");
            setFinderContact(result.finderContact);
        } else {
            setStatus("ERROR");
            setErrorMessage(result.error || "Incorrect answer.");
        }
    };

    const handleClose = () => {
        if (status === "SUCCESS") {
            // Maybe refresh page or just close?
        }
        setAnswer("");
        setStatus("IDLE");
        setFinderContact(null);
        setErrorMessage("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 text-stone-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-500">
                        <Lock className="w-5 h-5" />
                        The Gatekeeper's Riddle
                    </DialogTitle>
                    <DialogDescription className="text-stone-400">
                        To claim this item, you must answer the security question set by the finder.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-stone-950 p-4 rounded-lg border border-amber-900/30">
                        <p className="text-sm font-medium text-amber-500 mb-1">Riddle:</p>
                        <p className="text-lg italic text-stone-300">"{riddle}"</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === "SUCCESS" ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-950/30 border border-green-900 p-4 rounded-lg space-y-2"
                            >
                                <div className="flex items-center gap-2 text-green-400 font-bold">
                                    <CheckCircle className="w-5 h-5" />
                                    Match Confirmed!
                                </div>
                                <p className="text-sm text-stone-300">The finder has been verified. You can contact them here:</p>
                                <div className="text-sm space-y-1 text-stone-200 mt-2">
                                    <p><span className="text-stone-500">Name:</span> {finderContact?.name}</p>
                                    <p><span className="text-stone-500">Email:</span> {finderContact?.email}</p>
                                    <p><span className="text-stone-500">Phone:</span> {finderContact?.phone}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="answer" className="text-stone-300">Your Answer</Label>
                                <Input
                                    id="answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type the hidden truth..."
                                    className="bg-stone-950 border-stone-800 focus:border-amber-600 focus:ring-amber-600/20"
                                    disabled={status === "VERIFYING"}
                                />
                                {status === "ERROR" && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> {errorMessage}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={handleClose} className="hover:bg-stone-800 text-stone-400">
                        Close
                    </Button>
                    {status !== "SUCCESS" && (
                        <Button
                            onClick={handleVerify}
                            disabled={!answer || status === "VERIFYING"}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {status === "VERIFYING" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                                </>
                            ) : (
                                "Unlock Vault"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
