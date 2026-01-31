"use client"

import { useEffect, useRef, useState } from "react"
import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"
import { Message, Wizard, BloodPact } from "@/app/generated/prisma/client"
import { sendMessage as sendMessageAction, createOffer, respondToOffer, cancelOffer } from "@/actions/chat"
import { createCounterOffer } from "@/actions/marketplace"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Skull } from "lucide-react"
import { useRouter } from "next/navigation"
import OfferModal from "./OfferModal"
import OfferCard from "./OfferCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type ChatWindowProps = {
    chatId: string
    initialMessages: Message[]
    currentUserId: string
    otherUser: Wizard
    initialOffers?: BloodPact[]
    relicId?: string | null
    isSeller?: boolean
}

export default function ChatWindow({
    chatId,
    initialMessages,
    currentUserId,
    otherUser,
    initialOffers = [],
    relicId,
    isSeller = false
}: ChatWindowProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [offers, setOffers] = useState<BloodPact[]>(initialOffers)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

    // Counter Offer State
    const [isCounterModalOpen, setIsCounterModalOpen] = useState(false)
    const [selectedOfferIdForCounter, setSelectedOfferIdForCounter] = useState<string | null>(null)
    const [counterAmount, setCounterAmount] = useState("")

    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const isInitialMount = useRef(true)
    const router = useRouter()

    // Sync offers when prop changes (e.g. after refresh)
    useEffect(() => {
        setOffers(initialOffers)
    }, [initialOffers])

    // Scroll to bottom function
    const scrollToBottom = (smooth = false) => {
        if (messagesContainerRef.current) {
            const scrollHeight = messagesContainerRef.current.scrollHeight
            messagesContainerRef.current.scrollTo({
                top: scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            })
        }
    }

    useEffect(() => {
        const channel = pusherClient.subscribe(`private-chat-${chatId}`)

        const messageHandler = (message: Message) => {
            // If it's an offer or system message, refresh to get latest data
            if (message.type === 'OFFER' || message.type === 'SYSTEM') {
                router.refresh()
            }

            setMessages((current) => {
                if (current.some(m => m.id === message.id)) return current
                return [...current, message]
            })
        }

        channel.bind('new-message', messageHandler)

        return () => {
            channel.unbind('new-message', messageHandler)
            pusherClient.unsubscribe(`private-chat-${chatId}`)
        }
    }, [chatId, router])

    useEffect(() => {
        // Scroll to bottom on initial mount (instant) or new messages (smooth)
        if (isInitialMount.current) {
            scrollToBottom(false)
            isInitialMount.current = false
        } else if (messages.length > 0) {
            scrollToBottom(true)
        }
    }, [messages.length])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        const messageContent = newMessage
        setNewMessage("") // Clear input immediately
        setIsSending(true)

        // Optimistic update - add message immediately
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            chatRoomId: chatId,
            senderId: currentUserId,
            content: messageContent,
            type: 'TEXT',
            isRead: false,
            createdAt: new Date(),
        }

        setMessages((prev) => [...prev, optimisticMessage])

        try {
            await sendMessageAction(chatId, messageContent)

            // Remove optimistic message and let Pusher add the real one
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id))
        } catch (error) {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id))
            setNewMessage(messageContent) // Restore message
        } finally {
            setIsSending(false)
        }
    }

    const handleCreateOffer = async (amount: number, expiresIn: number) => {
        setIsSubmittingOffer(true)
        try {
            const result = await createOffer(chatId, amount, expiresIn)
            // Logic handled by server action and pusher
        } catch (error) {
            console.error("Failed to create offer", error)
        } finally {
            setIsSubmittingOffer(false)
        }
    }

    const handleRespondToOffer = async (offerId: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            await respondToOffer(offerId, status, chatId)
            router.refresh()
        } catch (error) {
            console.error("Failed to respond to offer", error)
        }
    }

    const handleCancelOffer = async (offerId: string) => {
        try {
            await cancelOffer(offerId, chatId)
            router.refresh()
        } catch (error) {
            console.error("Failed to cancel offer", error)
        }
    }

    // Counter Offer State
    const [counterHours, setCounterHours] = useState(24)
    const [counterMinutes, setCounterMinutes] = useState(0)

    const handleSubmitCounterOffer = async () => {
        if (!selectedOfferIdForCounter || !counterAmount) return;

        const totalMinutes = (counterHours * 60) + counterMinutes;
        if (totalMinutes <= 0 || totalMinutes > 1440) {
            alert("Expiry must be between 1 minute and 24 hours");
            return;
        }

        setIsSubmittingOffer(true);
        try {
            const result = await createCounterOffer(selectedOfferIdForCounter, parseFloat(counterAmount), chatId, totalMinutes);
            if (result.success) {
                setIsCounterModalOpen(false);
                setCounterAmount("");
                setCounterHours(24);
                setCounterMinutes(0);
                setSelectedOfferIdForCounter(null);
                // Pusher will update the UI
            } else {
                alert("Failed to send counter offer: " + result.error);
            }
        } catch (error) {
            console.error("Failed to counter offer", error)
        } finally {
            setIsSubmittingOffer(false)
        }
    }

    const activeOffer = offers.find(o => ['PENDING', 'COUNTER_OFFER_PENDING'].includes(o.status));

    const renderedOfferIds = new Set<string>();

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-zinc-700">
                            <AvatarImage src={otherUser.avatarUrl || ""} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold">
                                {otherUser.fullName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-white text-lg">{otherUser.fullName}</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                Karma: {otherUser.karmaScore} • {otherUser.karmaRank}
                            </p>
                        </div>
                    </div>

                    {relicId && !isSeller && !activeOffer && (
                        <OfferModal
                            onSubmit={handleCreateOffer}
                            isSubmitting={isSubmittingOffer}
                        />
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-zinc-950 to-zinc-900 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <Skull className="w-16 h-16 mx-auto text-zinc-700" />
                            <p className="text-zinc-600 font-medium">No messages yet</p>
                            <p className="text-zinc-700 text-sm">Start the negotiation...</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg: Message) => {
                        const isMe = msg.senderId === currentUserId

                        // Render Offer Card
                        if (msg.type === 'OFFER') {
                            const offerId = msg.content.split('OFFER_ID:')[1]

                            // Prevent duplicate offer cards for the same offer ID
                            if (renderedOfferIds.has(offerId)) return null;
                            renderedOfferIds.add(offerId);

                            // Skip rendering active offer in history
                            if (activeOffer && offerId === activeOffer.id) return null;

                            const offer = offers.find(o => o.id === offerId)

                            if (offer) {
                                return (
                                    <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                        <OfferCard
                                            amount={offer.offerAmount}
                                            counterAmount={offer.counterOfferAmount}
                                            status={offer.status}
                                            expiresAt={offer.expiresAt ? new Date(offer.expiresAt) : undefined}
                                            isSender={isMe}
                                            isSeller={isSeller}
                                            createdAt={new Date(offer.createdAt)}
                                            onAccept={() => handleRespondToOffer(offer.id, 'ACCEPTED')}
                                            onReject={() => handleRespondToOffer(offer.id, 'REJECTED')}
                                            onCancel={() => handleCancelOffer(offer.id)}
                                            onCounter={() => {
                                                setSelectedOfferIdForCounter(offer.id);
                                                setCounterAmount("");
                                                setIsCounterModalOpen(true);
                                            }}
                                        />
                                    </div>
                                )
                            }

                            return null;
                        }

                        // Render System Message
                        if (msg.type === 'SYSTEM') {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <span className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full border border-zinc-700">
                                        {msg.content}
                                    </span>
                                </div>
                            )
                        }

                        // Render Text Message
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[75%] rounded-2xl px-5 py-3 shadow-lg",
                                        isMe
                                            ? "bg-gradient-to-br from-red-600 to-red-700 text-white border border-red-500/20"
                                            : "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50 backdrop-blur-sm"
                                    )}
                                >
                                    <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                    <span className={cn(
                                        "text-[11px] block text-right mt-2 font-medium",
                                        isMe ? "text-red-200" : "text-zinc-500"
                                    )}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Active Offer Sticky Area */}
            {activeOffer && (
                <div className="bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 p-4 pb-0">
                    <OfferCard
                        amount={activeOffer.offerAmount}
                        counterAmount={activeOffer.counterOfferAmount}
                        status={activeOffer.status}
                        expiresAt={activeOffer.expiresAt ? new Date(activeOffer.expiresAt) : undefined}
                        isSender={activeOffer.buyerId === currentUserId}
                        isSeller={isSeller}
                        createdAt={new Date(activeOffer.createdAt)}
                        onAccept={() => handleRespondToOffer(activeOffer.id, 'ACCEPTED')}
                        onReject={() => handleRespondToOffer(activeOffer.id, 'REJECTED')}
                        onCancel={() => handleCancelOffer(activeOffer.id)}
                        onCounter={() => {
                            setSelectedOfferIdForCounter(activeOffer.id);
                            setCounterAmount("");
                            setIsCounterModalOpen(true);
                        }}
                    />
                </div>
            )}

            {/* Input Area */}
            <div className="bg-zinc-900/80 backdrop-blur-xl p-4 pt-4 border-t-0">
                <form onSubmit={sendMessage} className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none transition-all min-h-[52px] max-h-[120px]"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    sendMessage(e)
                                }
                            }}
                            rows={1}
                            disabled={isSending}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-zinc-700 disabled:to-zinc-800 disabled:cursor-not-allowed text-white p-3.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 disabled:shadow-none flex items-center justify-center min-w-[52px]"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <p className="text-xs text-zinc-600 mt-2 text-center">
                    Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Shift + Enter</kbd> for new line
                </p>
            </div>
            {/* Counter Offer Modal */}
            <Dialog open={isCounterModalOpen} onOpenChange={setIsCounterModalOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Make a Counter Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Your Price ($)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={counterAmount}
                                onChange={(e) => setCounterAmount(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                                placeholder="Enter amount..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Offer Expiry (Max 24h)</Label>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="counterHours" className="text-xs text-zinc-500">Hours</Label>
                                    <Input
                                        id="counterHours"
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={counterHours}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value) || 0;
                                            if (val > 24) val = 24;
                                            setCounterHours(val);
                                            // Reset minutes if hours is 24
                                            if (val === 24) setCounterMinutes(0);
                                        }}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="counterMinutes" className="text-xs text-zinc-500">Minutes</Label>
                                    <Input
                                        id="counterMinutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        step="5"
                                        value={counterMinutes}
                                        onChange={(e) => {
                                            let val = parseInt(e.target.value) || 0;
                                            if (val > 59) val = 59;
                                            // If hours is 24, force minutes to 0
                                            if (counterHours === 24) val = 0;
                                            setCounterMinutes(val);
                                        }}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                        disabled={counterHours === 24}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500">
                                Total: {counterHours * 60 + counterMinutes} minutes
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCounterModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmitCounterOffer}
                            disabled={!counterAmount || isSubmittingOffer || (counterHours === 0 && counterMinutes === 0)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isSubmittingOffer ? "Sending..." : "Send Counter Offer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
