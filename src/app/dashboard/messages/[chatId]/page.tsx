
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import ChatWindow from "../_components/ChatWindow"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/BackButton"
import { checkAndExpireOffers } from "@/actions/chat"

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/")

    const { chatId } = await params

    // Check for expired offers before loading chat
    await checkAndExpireOffers(chatId);

    const chat = await prisma.chatRoom.findUnique({
        where: { id: chatId },
        include: {
            participants: true,
            relic: true, // Include relic details
            messages: {
                take: 50, // Only load last 50 messages
                orderBy: { createdAt: "desc" }
            }
        }
    })

    if (!chat) {
        redirect("/dashboard/messages")
    }

    // Reverse messages to show oldest first (since we fetched desc)
    const messages = chat.messages.reverse()

    // Verify user is a participant
    const isParticipant = chat.participants.some(p => p.id === session.user.id)
    if (!isParticipant) {
        redirect("/dashboard/messages")
    }

    // Fetch offers (BloodPacts) if there's a relic
    let offers: any[] = []
    if (chat.relicId) {
        offers = await prisma.bloodPact.findMany({
            where: { itemId: chat.relicId }
        })
    }

    const otherUser = chat.participants.find(p => p.id !== session.user.id)!

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
                    initialMessages={messages}
                    currentUserId={session.user.id!}
                    otherUser={otherUser}
                    initialOffers={offers}
                    relicId={chat.relicId}
                    isSeller={chat.relic?.sellerId === session.user.id}
                />
            </div>
        </div>
    )
}
