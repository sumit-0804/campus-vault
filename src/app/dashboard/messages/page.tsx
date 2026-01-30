import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Skull } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function MessagesPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/")

    const chats = await prisma.chatRoom.findMany({
        where: {
            participants: {
                some: {
                    id: session.user.id,
                },
            },
        },
        include: {
            participants: true,
            relic: true,
            messages: {
                take: 1,
                orderBy: {
                    createdAt: "desc"
                }
            }
        },
        orderBy: {
            lastMessageAt: "desc",
        },
    })

    if (chats.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
                <div className="text-center space-y-6 p-8">
                    <div className="relative">
                        <Skull className="w-24 h-24 mx-auto text-zinc-800" />
                        <MessageSquare className="w-10 h-10 absolute bottom-0 right-1/3 text-red-500/50" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                            No Conversations Yet
                        </h2>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Browse the marketplace and make an offer to start negotiating.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-zinc-950 to-zinc-900 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <MessageSquare className="w-8 h-8 text-red-500" />
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Inbox</h1>
                        <p className="text-zinc-500 text-sm">{chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}</p>
                    </div>
                </div>

                {/* Chat List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {chats.map((chat) => {
                        const otherUser = chat.participants.find(p => p.id !== session.user.id)!
                        const lastMessage = chat.messages[0]

                        return (
                            <Link
                                key={chat.id}
                                href={`/dashboard/messages/${chat.id}`}
                                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800/50 hover:border-red-500/30 transition-all duration-200"
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-12 h-12 border-2 border-zinc-700 group-hover:border-red-500/50 transition-colors">
                                        <AvatarImage src={otherUser.avatarUrl || ""} />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold">
                                            {otherUser.fullName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">
                                            {otherUser.fullName}
                                        </h3>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                            Karma: {otherUser.karmaScore}
                                        </p>
                                        {lastMessage && (
                                            <>
                                                <p className="text-sm text-zinc-400 truncate mt-2">
                                                    {lastMessage.content}
                                                </p>
                                                <p className="text-xs text-zinc-600 mt-1">
                                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                                </p>
                                            </>
                                        )}
                                        {chat.relic && (
                                            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                About: {chat.relic.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
