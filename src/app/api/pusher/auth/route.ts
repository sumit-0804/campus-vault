import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { pusherServer } from "@/lib/pusher"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.text()
        const params = new URLSearchParams(body)
        const socketId = params.get("socket_id")
        const channelName = params.get("channel_name")

        if (!socketId || !channelName) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
        }

        // Authorize the user for this private channel
        const authResponse = pusherServer.authorizeChannel(socketId, channelName)

        return NextResponse.json(authResponse)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
