"use client"

import { useEffect, useRef, useState } from "react"
import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"
import { Message, Wizard, BloodPact } from "@/app/generated/prisma/client"
import { sendMessage as sendMessageAction } from "@/actions/chat"
import { getActiveOfferByChatId } from "@/actions/offers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Skull } from "lucide-react"
import { useRouter } from "next/navigation"
import OfferCard from "./OfferCard"
import OfferModal from "./OfferModal"
import CounterOfferModal from "./CounterOfferModal"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

type ChatWindowProps = {
    chatId: string
    currentUserId: string
    otherUser: Wizard
    relicId?: string | null
    isSeller: boolean
    initialMessages: Message[]
    initialActiveOffer?: (BloodPact & { buyer?: Wizard }) | null
    isItemAvailable: boolean
}

export default function ChatWindow({
    chatId,
    currentUserId,
    otherUser,
    relicId,
    isSeller,
    initialMessages,
    initialActiveOffer,
    isItemAvailable
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const isInitialMount = useRef(true)
    const router = useRouter()
    const queryClient = useQueryClient()

    // Query for Active Offer
    const { data: activeOffer } = useQuery({
        queryKey: queryKeys.offers.byChat(chatId),
        queryFn: async () => getActiveOfferByChatId(chatId),
        initialData: initialActiveOffer,
        staleTime: Infinity, // Invalidated by mutations/events
    })

    // Scroll to bottom
    const scrollToBottom = (smooth = false) => {
        if (messagesContainerRef.current) {
            const scrollHeight = messagesContainerRef.current.scrollHeight
            messagesContainerRef.current.scrollTo({
                top: scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            })
        }
    }

    // Pusher subscription for real-time messages
    useEffect(() => {
        const channel = pusherClient.subscribe(`private-chat-${chatId}`)

        const messageHandler = (message: Message) => {
            setMessages((current) => {
                if (current.some(m => m.id === message.id)) return current
                return [...current, message]
            })

            // Invalidate offer query on system messages (usually means offer status changed)
            if (message.type === 'SYSTEM') {
                queryClient.invalidateQueries({ queryKey: queryKeys.offers.byChat(chatId) })
            }
        }

        channel.bind('new-message', messageHandler)

        return () => {
            channel.unbind('new-message', messageHandler)
            pusherClient.unsubscribe(`private-chat-${chatId}`)
        }
    }, [chatId, queryClient])

    // Auto-scroll on new messages
    useEffect(() => {
        if (isInitialMount.current) {
            scrollToBottom(false)
            isInitialMount.current = false
        } else if (messages.length > 0) {
            scrollToBottom(true)
        }
    }, [messages.length])

    const { mutate: sendMessage } = useMutation({
        mutationFn: async (content: string) => {
            return sendMessageAction(chatId, content)
        },
        onMutate: async (content) => {
            setIsSending(true)
            setNewMessage("")

            // Optimistic message
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                chatRoomId: chatId,
                senderId: currentUserId,
                content: content,
                type: 'TEXT',
                isRead: false,
                createdAt: new Date(),
            }
            setMessages((prev) => [...prev, optimisticMessage])
            return { optimisticMessage }
        },
        onError: (err, content, context) => {
            setMessages((prev) => prev.filter(m => m.id !== context?.optimisticMessage.id))
            setNewMessage(content)
            setIsSending(false)
        },
        onSuccess: (result, content, context) => {
            // We could replace the optimistic message with the real one here, 
            // but Pusher usually handles the "real" message arrival.
            // Just remove the optimistic one when we get a confirmation via Pusher or here?
            // Actually, if we get the real message from Pusher, we might have duplicates if we don't dedupe.
            // The messageHandler already checks `some(m => m.id === message.id)`.
            // But optimistic ID is `temp-...`, real ID is UUID.
            // So we should remove optimistic message when the real one arrives OR when action succeeds?
            // Simple approach: Remove optimistic message here. If Pusher hasn't arrived yet, there might be a flicker.
            // Better: keep optimistic until Pusher message arrives?
            // For now, let's remove optimistic message here and assume fast Pusher or rely on Query?
            // Actually, the original code removed it in `try/finally`.
            setMessages((prev) => prev.filter(m => m.id !== context?.optimisticMessage.id))
            setIsSending(false)
        },
        onSettled: () => {
            setIsSending(false)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return
        sendMessage(newMessage)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
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
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                    Karma: {otherUser.karmaScore} • {otherUser.karmaRank}
                                </p>
                                {relicId && (
                                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                                        {isSeller ? "Buyer" : "Seller"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Show "Make Offer" button only for buyers when no active offer */}
                    {relicId && !isSeller && !activeOffer && isItemAvailable && (
                        <OfferModal chatId={chatId} />
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
                            <p className="text-zinc-700 text-sm">Start the conversation...</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg: Message) => {
                        const isMe = msg.senderId === currentUserId

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
                        offer={activeOffer}
                        isSeller={isSeller}
                        chatId={chatId}
                    />
                </div>
            )}

            {/* Input Area */}
            {activeOffer?.status === 'COMPLETED' ? (
                <div className="bg-zinc-900/80 backdrop-blur-xl p-4 border-t border-zinc-800 text-center text-zinc-500">
                    <p className="font-medium">This chat is closed as the item has been sold.</p>
                </div>
            ) : (
                <div className="bg-zinc-900/80 backdrop-blur-xl p-4 pt-4 border-t-0">
                    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none transition-all min-h-[52px] max-h-[120px]"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
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
            )}
        </div >
    )
}
