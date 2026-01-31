
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import ChatWindow from "../_components/ChatWindow"
import { ArrowLeft } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"
import { checkAndExpireOffers } from "@/actions/offers"

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/")

    const { chatId } = await params

    // Check for expired offers before loading chat
    await checkAndExpireOffers(chatId)

    const chat = await prisma.chatRoom.findUnique({
        where: { id: chatId },
        include: {
            participants: true,
            relic: true,
            messages: {
                take: 50,
                orderBy: { createdAt: "desc" }
            }
        }
    })

    if (!chat) {
        redirect("/dashboard/messages")
    }

    // Reverse messages to show oldest first
    const messages = chat.messages.reverse()

    // Verify user is a participant
    const isParticipant = chat.participants.some(p => p.id === session.user.id)
    if (!isParticipant) {
        redirect("/dashboard/messages")
    }

    // Fetch active offer and all offers for this item
    let activeOffer = null
    let allOffers: any[] = []
    let isItemAvailable = false

    // Identify the other user in this chat (buyer for seller, seller for buyer)
    const otherUser = chat.participants.find(p => p.id !== session.user.id)!

    if (chat.relicId) {
        const isSeller = chat.relic?.sellerId === session.user.id

        // IMPORTANT: In each chat, only fetch offers from the specific buyer in this conversation.
        // This prevents the seller from seeing Buyer 1's offer when in Buyer 2's chat.
        const buyerIdInThisChat = isSeller ? otherUser.id : session.user.id

        allOffers = await prisma.bloodPact.findMany({
            where: {
                itemId: chat.relicId,
                buyerId: buyerIdInThisChat // Always filter by the buyer in this specific chat
            },
            include: {
                buyer: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        // Find the active offer from THIS buyer
        activeOffer = allOffers.find(offer =>
            ['PENDING', 'COUNTER_OFFER_PENDING', 'AWAITING_COMPLETION', 'DELIVERED', 'COMPLETED'].includes(offer.status)
        ) || null

        // Check availability by looking at ALL offers for this item (not just this buyer's)
        // Item is unavailable if ANY buyer has an accepted/delivered/completed offer
        const anyAcceptedOffer = await prisma.bloodPact.findFirst({
            where: {
                itemId: chat.relicId,
                status: { in: ['AWAITING_COMPLETION', 'DELIVERED', 'COMPLETED'] }
            }
        })
        isItemAvailable = chat.relic?.status === 'ACTIVE' && !anyAcceptedOffer
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            {/* Back Button */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <BackButton
                    fallbackRoute="/dashboard/messages"
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Inbox
                </BackButton>
            </div>

            {/* Chat Window */}
            <div className="flex-1 min-h-0">
                <ChatWindow
                    chatId={chatId}
                    currentUserId={session.user.id!}
                    otherUser={otherUser}
                    relicId={chat.relicId}
                    isSeller={chat.relic?.sellerId === session.user.id}
                    initialMessages={messages}
                    initialActiveOffer={activeOffer}
                    isItemAvailable={isItemAvailable}
                />
            </div>
        </div>
    )
}
