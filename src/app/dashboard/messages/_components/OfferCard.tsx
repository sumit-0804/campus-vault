"use client"

import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type OfferStatus = "PENDING" | "COUNTER_OFFER_PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED" | "AWAITING_COMPLETION" | "COMPLETED"

type OfferCardProps = {
    amount: number
    counterAmount?: number | null
    status: OfferStatus
    expiresAt?: Date
    isSender: boolean
    isSeller: boolean
    createdAt: Date
    onAccept?: () => void
    onReject?: () => void
    onCancel?: () => void
    onCounter?: () => void
    isProcessing?: boolean
}

export default function OfferCard({
    amount,
    counterAmount,
    status,
    expiresAt,
    isSender,
    isSeller,
    createdAt,
    onAccept,
    onReject,
    onCancel,
    onCounter,
    isProcessing = false
}: OfferCardProps) {
    const isPending = status === "PENDING"
    const isCounterPending = status === "COUNTER_OFFER_PENDING"
    const isCancelled = status === "CANCELLED"

    // Determine effective amount to show
    const displayAmount = (isCounterPending || status === "ACCEPTED" || status === "COMPLETED") && counterAmount ? counterAmount : amount;
    const hasCounterOffer = !!counterAmount;

    // Calculate time left if pending
    const showExpiry = (isPending || isCounterPending) && expiresAt;
    const isExpired = expiresAt && new Date() > expiresAt;

    // Fallback if status isn't updated but time has passed
    const effectiveStatus = isExpired && (isPending || isCounterPending) ? 'EXPIRED' : status;

    return (
        <div className={cn(
            "rounded-lg p-4 w-72 border", // Widened slightly
            isSender ? "bg-red-900/20 border-red-500/50" : "bg-zinc-800/50 border-zinc-700",
            effectiveStatus === "CANCELLED" && "opacity-60 grayscale border-zinc-700 bg-zinc-900/40",
            effectiveStatus === "EXPIRED" && "opacity-60 grayscale border-zinc-700 bg-zinc-900/40"
        )}>
            <div className="flex justify-between items-start mb-2 gap-4">
                <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        {isCounterPending ? "Counter Offer" : "Offer"}
                    </span>

                    {isCounterPending && counterAmount ? (
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm line-through text-zinc-500">₹{amount.toLocaleString()}</span>
                            <span className="text-2xl font-black text-white">₹{counterAmount.toLocaleString()}</span>
                        </div>
                    ) : (
                        <div className="text-2xl font-black text-white">₹{amount.toLocaleString()}</div>
                    )}

                    {effectiveStatus !== "PENDING" && effectiveStatus !== "COUNTER_OFFER_PENDING" && (
                        <div className="text-xs font-medium mt-1">
                            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] uppercase">
                                Status: {effectiveStatus.replace('_', ' ')}
                            </span>
                        </div>
                    )}

                    {showExpiry && !isExpired && (
                        <div className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires in {formatDistanceToNow(expiresAt)}
                        </div>
                    )}
                </div>
                <StatusBadge status={effectiveStatus} />
            </div>

            <p className="text-xs text-zinc-500 mb-4">
                Sent {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>

            {/* Actions for Seller receiving an initial offer */}
            {isSeller && !isSender && isPending && (
                <div className="flex flex-col gap-2">
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
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onCounter}
                        disabled={isProcessing}
                        className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                    >
                        Counter Offer
                    </Button>
                </div>
            )}

            {/* Actions for Buyer receiving a COUNTER offer */}
            {!isSeller && isCounterPending && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={onAccept}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Accept Counter
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
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onCounter}
                        disabled={isProcessing}
                        className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                    >
                        Counter Offer
                    </Button>
                </div>
            )}

            {/* Actions for Sender (Buyer or Seller with Counter) - Cancel/Withdraw */}
            {isSender && ((!isSeller && isPending) || (isSeller && isCounterPending)) && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                    <X className="w-4 h-4 mr-1" />
                    {isCounterPending ? "Withdraw Counter Offer" : "Cancel Offer"}
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
