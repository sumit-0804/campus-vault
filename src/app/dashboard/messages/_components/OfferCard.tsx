"use client"

import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { BloodPact, Wizard } from "@/app/generated/prisma/client"
import { respondToOffer, cancelOffer, confirmDelivery, markAsDelivered, rejectDelivery } from "@/actions/offers"
import { useState } from "react"
import { useRouter } from "next/navigation"
import CounterOfferModal from "./CounterOfferModal"

type OfferCardProps = {
    offer: BloodPact & { buyer?: Wizard }
    isSeller: boolean
    chatId: string
}

export default function OfferCard({ offer, isSeller, chatId }: OfferCardProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    const isPending = offer.status === "PENDING"
    const isCounterPending = offer.status === "COUNTER_OFFER_PENDING"
    const isAwaitingCompletion = offer.status === "AWAITING_COMPLETION"
    const isDelivered = offer.status === "DELIVERED"
    const isCompleted = offer.status === "COMPLETED"

    // Determine display amount
    const displayAmount = (isCounterPending && offer.counterOfferAmount)
        ? offer.counterOfferAmount
        : offer.offerAmount

    const hasCounter = !!offer.counterOfferAmount

    // Check if expired
    const isExpired = offer.expiresAt && new Date() > offer.expiresAt
    const showExpiry = (isPending || isCounterPending) && offer.expiresAt && !isExpired

    const handleAccept = async () => {
        setIsProcessing(true)
        try {
            await respondToOffer(offer.id, 'ACCEPT')
            router.refresh()
        } catch (error) {
            console.error("Failed to accept offer", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        setIsProcessing(true)
        try {
            await respondToOffer(offer.id, 'REJECT')
            router.refresh()
        } catch (error) {
            console.error("Failed to reject offer", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancel = async () => {
        setIsProcessing(true)
        try {
            await cancelOffer(offer.id)
            router.refresh()
        } catch (error) {
            console.error("Failed to cancel offer", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleMarkAsDelivered = async () => {
        setIsProcessing(true)
        try {
            await markAsDelivered(offer.id)
            router.refresh()
        } catch (error) {
            console.error("Failed to mark as delivered", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleConfirmDelivery = async () => {
        setIsProcessing(true)
        try {
            await confirmDelivery(offer.id)
            router.refresh()
        } catch (error) {
            console.error("Failed to confirm delivery", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRejectDelivery = async () => {
        setIsProcessing(true)
        try {
            await rejectDelivery(offer.id)
            router.refresh()
        } catch (error) {
            console.error("Failed to reject delivery", error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="border border-purple-500/30 rounded-xl p-4 bg-gradient-to-br from-purple-950/30 to-zinc-900/50 backdrop-blur-sm space-y-3 shadow-lg shadow-purple-900/10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-purple-400">₹{displayAmount}</span>
                    {hasCounter && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                            Counter
                        </span>
                    )}
                </div>
                {/* Show buyer name for sellers */}
                {isSeller && offer.buyer && (
                    <span className="text-xs text-zinc-400">
                        from <span className="text-purple-400 font-semibold">{offer.buyer.fullName}</span>
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        {isCounterPending ? "Counter Offer" : "Offer"}
                    </span>

                    {showExpiry && (
                        <div className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires in {formatDistanceToNow(offer.expiresAt!)}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-zinc-500">
                Sent {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
            </p>

            {/* Actions for Seller receiving buyer's offer */}
            {isSeller && isPending && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                    </div>
                    <CounterOfferModal offerId={offer.id} currentAmount={displayAmount} />
                </div>
            )}

            {/* Actions for Buyer receiving seller's counter */}
            {!isSeller && isCounterPending && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Accept Counter
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                    </div>
                    <CounterOfferModal offerId={offer.id} currentAmount={displayAmount} />
                </div>
            )}

            {/* Cancel button for sender */}
            {((isPending && !isSeller) || (isCounterPending && isSeller)) && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                    <X className="w-4 h-4 mr-1" />
                    {isCounterPending ? "Withdraw Counter Offer" : "Cancel Offer"}
                </Button>
            )}

            {/* Seller Marks as Delivered */}
            {isSeller && isAwaitingCompletion && (
                <Button
                    size="sm"
                    onClick={handleMarkAsDelivered}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Check className="w-4 h-4 mr-1" />
                    Mark as Delivered
                </Button>
            )}

            {/* Buyer Waiting for Delivery */}
            {!isSeller && isAwaitingCompletion && (
                <div className="flex items-center justify-center p-2 bg-blue-900/30 rounded text-xs text-blue-400 border border-blue-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Waiting for seller to deliver...
                </div>
            )}

            {/* Buyer Confirms/Rejects Delivery */}
            {!isSeller && isDelivered && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center p-2 bg-blue-900/30 rounded text-xs text-blue-400 border border-blue-500/30 mb-2">
                        <Check className="w-3 h-3 mr-1" />
                        Seller marked as delivered
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleConfirmDelivery}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Confirm Receipt
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleRejectDelivery}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Not Received
                        </Button>
                    </div>
                </div>
            )}

            {/* Seller Waiting for Confirmation */}
            {isSeller && isDelivered && (
                <div className="flex items-center justify-center p-2 bg-blue-900/30 rounded text-xs text-blue-400 border border-blue-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Delivered. Waiting for buyer confirmation...
                </div>
            )}

            {/* Completed */}
            {isCompleted && (
                <div className="flex items-center justify-center p-2 bg-green-900/30 rounded text-xs text-green-400 border border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Transaction Completed
                </div>
            )}
        </div>
    )
}
