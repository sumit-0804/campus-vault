"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createReport } from "@/actions/admin";

interface ReportButtonProps {
    targetType: "USER" | "ITEM";
    targetId: string;
    /** Display label for what's being reported, e.g. "this listing" or "this user" */
    targetLabel?: string;
    /** Visual variant */
    variant?: "ghost" | "outline" | "link";
    /** Size */
    size?: "sm" | "default" | "icon";
    /** Optional className override */
    className?: string;
    /** Show icon only (for compact placements) */
    iconOnly?: boolean;
}

const REPORT_REASONS: Record<string, string[]> = {
    USER: [
        "Harassment or abusive behavior",
        "Scam or fraud",
        "Impersonation",
        "Inappropriate content",
        "Other",
    ],
    ITEM: [
        "Prohibited or illegal item",
        "Misleading or false listing",
        "Suspected stolen property",
        "Inappropriate images or description",
        "Other",
    ],
};

export function ReportButton({
    targetType,
    targetId,
    targetLabel,
    variant = "ghost",
    size = "sm",
    className,
    iconOnly = false,
}: ReportButtonProps) {
    const [open, setOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reasons = REPORT_REASONS[targetType] || REPORT_REASONS.ITEM;
    const label = targetLabel || (targetType === "USER" ? "this user" : "this listing");

    const handleSubmit = async () => {
        const reason = selectedReason === "Other" ? customReason.trim() : selectedReason;
        if (!reason) {
            toast.error("Please select or enter a reason");
            return;
        }

        setIsSubmitting(true);
        try {
            await createReport(targetType, targetId, reason);
            toast.success("Report submitted. Our team will review it shortly.");
            setOpen(false);
            setSelectedReason("");
            setCustomReason("");
        } catch {
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className || "text-zinc-500 hover:text-red-400 transition-colors"}
                >
                    <Flag className="w-3.5 h-3.5" />
                    {!iconOnly && <span className="ml-1.5">Report</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Report {label}</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Help us keep the community safe. Select a reason for your report.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-4">
                    {reasons.map((reason) => (
                        <label
                            key={reason}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedReason === reason
                                    ? "border-red-500/50 bg-red-500/10 text-white"
                                    : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
                                }`}
                        >
                            <input
                                type="radio"
                                name="report-reason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={() => setSelectedReason(reason)}
                                className="accent-red-500"
                            />
                            <span className="text-sm">{reason}</span>
                        </label>
                    ))}

                    {selectedReason === "Other" && (
                        <textarea
                            placeholder="Please describe the issue..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="w-full mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/30 resize-none"
                            rows={3}
                        />
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason || (selectedReason === "Other" && !customReason.trim())}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
