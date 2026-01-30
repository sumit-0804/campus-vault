"use client"

import { useEffect, useRef, useState } from "react"
import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"
import { Message, Wizard, BloodPact } from "@/app/generated/prisma/client"
import { sendMessage as sendMessageAction, createOffer, respondToOffer, cancelOffer } from "@/actions/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Skull } from "lucide-react"
import { useRouter } from "next/navigation"
import OfferModal from "./OfferModal"
import OfferCard from "./OfferCard"

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

    const handleCreateOffer = async (amount: number) => {
        setIsSubmittingOffer(true)
        try {
            const result = await createOffer(chatId, amount)
            // Logic handled by server action and pusher
        } catch (error) {
            console.error("Failed to create offer", error)
        } finally {
            setIsSubmittingOffer(false)
        }
    }

    const handleRespondToOffer = async (offerId: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            await respondToOffer(offerId, status)
            router.refresh()
        } catch (error) {
            console.error("Failed to respond to offer", error)
        }
    }

    const handleCancelOffer = async (offerId: string) => {
        try {
            await cancelOffer(offerId)
            router.refresh()
        } catch (error) {
            console.error("Failed to cancel offer", error)
        }
    }

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

                    {relicId && !isSeller && (
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
                            const offer = offers.find(o => o.id === offerId)

                            if (offer) {
                                return (
                                    <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                        <OfferCard
                                            amount={offer.offerAmount}
                                            status={offer.status}
                                            isSender={isMe}
                                            isSeller={isSeller}
                                            createdAt={new Date(offer.createdAt)}
                                            onAccept={() => handleRespondToOffer(offer.id, 'ACCEPTED')}
                                            onReject={() => handleRespondToOffer(offer.id, 'REJECTED')}
                                            onCancel={() => handleCancelOffer(offer.id)}
                                        />
                                    </div>
                                )
                            }

                            // If offer data is not yet loaded, show loading state
                            return (
                                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "rounded-lg p-4 w-64 border bg-zinc-800/20 border-zinc-700/50 animate-pulse flex flex-col gap-3"
                                    )}>
                                        <div className="h-4 w-12 bg-zinc-700/50 rounded" />
                                        <div className="h-8 w-32 bg-zinc-700/50 rounded" />
                                        <div className="h-3 w-20 bg-zinc-700/50 rounded" />
                                    </div>
                                </div>
                            )
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

            {/* Input Area */}
            <div className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-4">
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
        </div>
    )
}
