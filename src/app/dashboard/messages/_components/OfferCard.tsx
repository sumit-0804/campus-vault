"use client"

import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED" | "AWAITING_COMPLETION" | "COMPLETED"

type OfferCardProps = {
    amount: number
    status: OfferStatus
    isSender: boolean
    isSeller: boolean
    createdAt: Date
    onAccept?: () => void
    onReject?: () => void
    onCancel?: () => void
    isProcessing?: boolean
}

export default function OfferCard({
    amount,
    status,
    isSender,
    isSeller,
    createdAt,
    onAccept,
    onReject,
    onCancel,
    isProcessing = false
}: OfferCardProps) {
    const isPending = status === "PENDING"
    const isCancelled = status === "CANCELLED"

    return (
        <div className={cn(
            "rounded-lg p-4 w-64 border",
            isSender ? "bg-red-900/20 border-red-500/50" : "bg-zinc-800/50 border-zinc-700",
            status === "CANCELLED" && "opacity-60 grayscale border-zinc-700 bg-zinc-900/40"
        )}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Offer</span>
                    <div className="text-2xl font-black text-white">₹{amount.toLocaleString()}</div>
                    {status !== "PENDING" && (
                        <div className="text-xs font-medium mt-1">
                            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] uppercase">
                                Status: {status}
                            </span>
                        </div>
                    )}
                </div>
                <StatusBadge status={status} />
            </div>

            <p className="text-xs text-zinc-500 mb-4">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>

            {/* Actions for Seller receiving an offer */}
            {isSeller && !isSender && isPending && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={onAccept}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onReject}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                    </Button>
                </div>
            )}

            {/* Actions for Sender (Buyer) */}
            {isSender && isPending && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Offer
                </Button>
            )}

            {isCancelled && (
                <div className="flex items-center justify-center p-2 bg-zinc-900/50 rounded text-xs text-zinc-500 border border-dashed border-zinc-800">
                    <span className="flex items-center">
                        <X className="w-3 h-3 mr-1" /> Cancelled
                    </span>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: OfferStatus }) {
    switch (status) {
        case "PENDING":
            return <div className="bg-yellow-500/20 text-yellow-500 p-1.5 rounded-full"><Clock className="w-4 h-4" /></div>
        case "ACCEPTED":
        case "AWAITING_COMPLETION":
        case "COMPLETED":
            return <div className="bg-green-500/20 text-green-500 p-1.5 rounded-full"><Check className="w-4 h-4" /></div>
        case "REJECTED":
        case "CANCELLED":
        case "EXPIRED":
            return <div className="bg-zinc-500/20 text-zinc-500 p-1.5 rounded-full"><X className="w-4 h-4" /></div>
        default:
            return null
    }
}
