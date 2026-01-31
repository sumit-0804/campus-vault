"use client"

import { Button } from "@/components/ui/button"
import { getOrCreateChatRoom } from "@/actions/chat"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { MessageSquare } from "lucide-react"

type MakeOfferButtonProps = {
    sellerId: string
    relicId: string
    isAvailable: boolean
    isOwnItem: boolean
    hasExistingOffer?: boolean
}

export function MakeOfferButton({ sellerId, relicId, isAvailable, isOwnItem, hasExistingOffer }: MakeOfferButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleMakeOffer = async () => {
        setLoading(true)
        try {
            // Optimistic check (though getOrCreateChatRoom checks server-side too)
            // But good to catch here to redirect to sign-in
            // We can't access session easily without useSession hook or prop.
            // Let's rely on the server action failing with "Unauthorized" and catch it?
            // "Unauthorized" error usually thrown by my actions.

            const chatRoom = await getOrCreateChatRoom(sellerId, relicId)
            router.push(`/dashboard/messages/${chatRoom.id}`)
        } catch (error: any) {
            console.error("Failed to create chat:", error)
            if (error.message === "Unauthorized" || error.message.includes("Unauthorized")) {
                router.push("/sign-in")
            } else {
                alert("Failed to start chat. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    if (isOwnItem) {
        return (
            <Button
                size="lg"
                className="flex-1 bg-zinc-700 text-zinc-400 font-bold text-lg h-14 cursor-not-allowed"
                disabled
            >
                Your Own Item
            </Button>
        )
    }

    return (
        <Button
            size="lg"
            className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold text-lg h-14"
            disabled={!isAvailable || loading}
            onClick={handleMakeOffer}
        >
            <MessageSquare className="w-5 h-5 mr-2" />
            {loading ? "Opening Chat..." : (hasExistingOffer ? "View Offer" : "Make an Offer")}
        </Button>
    )
}
