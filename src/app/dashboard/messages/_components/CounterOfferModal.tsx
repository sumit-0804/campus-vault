"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCounterOffer } from "@/actions/offers"

import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

type CounterOfferModalProps = {
    offerId: string
    currentAmount: number
    chatId: string
}

export default function CounterOfferModal({ offerId, currentAmount, chatId }: CounterOfferModalProps) {
    const [amount, setAmount] = useState("")
    const [hours, setHours] = useState(24)
    const [minutes, setMinutes] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const queryClient = useQueryClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return

        const totalMinutes = (hours * 60) + minutes
        if (totalMinutes <= 0 || totalMinutes > 1440) {
            alert("Expiry must be between 1 minute and 24 hours")
            return
        }

        setIsSubmitting(true)
        try {
            await createCounterOffer(offerId, numAmount, totalMinutes)
            setIsOpen(false)
            setAmount("")
            setHours(24)
            setMinutes(0)
            queryClient.invalidateQueries({ queryKey: queryKeys.offers.byChat(chatId) })
        } catch (error) {
            console.error("Failed to create counter offer", error)
            alert("Failed to create counter offer. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="secondary"
                    className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                >
                    Counter Offer
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Make a Counter Offer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                        <p className="text-xs text-zinc-500 mb-1">Current Offer</p>
                        <p className="text-xl font-bold text-purple-400">₹{currentAmount}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="counter-amount">Your Counter (₹)</Label>
                            <Input
                                id="counter-amount"
                                type="number"
                                min="1"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                                placeholder="Enter amount..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Offer Expiry (Max 24h)</Label>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="counter-hours" className="text-xs text-zinc-500">Hours</Label>
                                    <Input
                                        id="counter-hours"
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={hours}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value) || 0
                                            if (val > 24) val = 24
                                            setHours(val)
                                            if (val === 24) setMinutes(0)
                                        }}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="counter-minutes" className="text-xs text-zinc-500">Minutes</Label>
                                    <Input
                                        id="counter-minutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={minutes}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value) || 0
                                            if (val > 59) val = 59
                                            if (hours === 24) val = 0
                                            setMinutes(val)
                                        }}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                        disabled={hours === 24}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500">
                                Total: {hours * 60 + minutes} minutes
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={!amount || isSubmitting || (hours === 0 && minutes === 0)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            {isSubmitting ? "Sending..." : "Send Counter Offer"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
