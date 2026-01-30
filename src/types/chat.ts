import { ChatRoom, Message, Wizard, CursedObject } from "@/app/generated/prisma/client"

export type ChatWithDetails = ChatRoom & {
    participants: Wizard[];
    messages: Message[];
    relic?: CursedObject | null;
}

export type MessageWithSender = Message
