"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Handshake } from "lucide-react"

type OfferModalProps = {
    onSubmit: (amount: number) => Promise<void>
    isSubmitting: boolean
}

export default function OfferModal({ onSubmit, isSubmitting }: OfferModalProps) {
    const [amount, setAmount] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return

        await onSubmit(numAmount)
        setIsOpen(false)
        setAmount("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                    <Handshake className="w-4 h-4 mr-2" />
                    Make an Offer
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Make a Blood Pact</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Offer Amount (₹)</Label>
                        <Input
                            id="amount"
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
                    <Button
                        type="submit"
                        disabled={!amount || isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                        {isSubmitting ? "Sealing Pact..." : "Send Offer"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
