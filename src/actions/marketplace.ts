"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";



export async function getParamsForOwnerOfferList(itemId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const item = await prisma.cursedObject.findUnique({
            where: { id: itemId },
            select: { sellerId: true }
        });

        if (!item || item.sellerId !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        const chatRooms = await prisma.chatRoom.findMany({
            where: { relicId: itemId },
            include: {
                participants: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
                // Assuming bloodPacts are linked to item, but we might want them linked to chat or buyer?
                // The schema links BloodPact to Item and Buyer.
                // We want to group by buyer.
            }
        });

        // We also need to fetch offers separately or attach them.
        // Let's fetch all offers for this item.
        const offers = await prisma.bloodPact.findMany({
            where: { itemId: itemId },
            include: { buyer: true },
            orderBy: { createdAt: 'desc' }
        });

        // Lazy Expiry Check
        const now = new Date();
        const expiredOffers = offers.filter(o =>
            o.status === "PENDING" && o.expiresAt && o.expiresAt < now
        );

        if (expiredOffers.length > 0) {
            await prisma.bloodPact.updateMany({
                where: { id: { in: expiredOffers.map(o => o.id) } },
                data: { status: "EXPIRED" }
            });
            // Re-fetch offers after update (or just map them locally)
            offers.forEach(o => {
                if (o.status === "PENDING" && o.expiresAt && o.expiresAt < now) {
                    o.status = "EXPIRED";
                }
            });
        }

        return { success: true, chatRooms, offers };
    } catch (error) {
        console.error("Error fetching owner offer list:", error);
        return { success: false, error: "Failed to fetch offers" };
    }
}


export async function createCounterOffer(offerId: string, amount: number, chatId?: string, expiresInMinutes: number = 1440) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Validate expiresInMinutes
    if (expiresInMinutes < 1 || expiresInMinutes > 1440) {
        expiresInMinutes = 1440;
    }

    try {
        const originalOffer = await prisma.bloodPact.findUnique({
            where: { id: offerId },
            include: { item: true }
        });

        if (!originalOffer) return { success: false, error: "Offer not found" };

        const isSeller = originalOffer.item.sellerId === session.user.id;
        const isBuyer = originalOffer.buyerId === session.user.id;

        if (!isSeller && !isBuyer) return { success: false, error: "Not authorized" };

        let updateData: any = {};
        let actionDescription = "";

        // Calculate new expiry
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        if (isSeller) {
            // Seller countering a buyer's offer
            if (originalOffer.status !== 'PENDING') {
                return { success: false, error: "Can only counter pending offers" };
            }
            updateData = {
                counterOfferAmount: amount,
                status: "COUNTER_OFFER_PENDING",
                expiresAt: expiresAt, // Update expiry for counter offer
            };
            actionDescription = `Seller countered: $${amount}`;
        } else {
            // Buyer countering a seller's counter-offer
            if (originalOffer.status !== 'COUNTER_OFFER_PENDING') {
                return { success: false, error: "Can only counter pending counter-offers" };
            }
            updateData = {
                offerAmount: amount,
                counterOfferAmount: null, // Clear seller's counter
                status: "PENDING", // Send back to seller
                expiresAt: expiresAt, // Update expiry for buyer's counter
            };
            actionDescription = `Buyer countered: $${amount}`;
        }

        // Update BloodPact with history
        const updatedOffer = await prisma.bloodPact.update({
            where: { id: offerId },
            data: updateData
        });

        // Log history safely
        try {
            await prisma.offerHistory.create({
                data: {
                    offerId: offerId,
                    action: 'COUNTERED',
                    amount: amount,
                    actorId: session.user.id
                }
            })
        } catch (e) {
            console.error("Failed to log history (ignoring):", e)
        }

        // Find Chat and Notify
        let chat;
        if (chatId) {
            chat = await prisma.chatRoom.findUnique({
                where: { id: chatId }
            });
        } else {
            chat = await prisma.chatRoom.findFirst({
                where: {
                    relicId: originalOffer.itemId,
                    participants: { some: { id: originalOffer.buyerId } }
                }
            });
        }

        if (chat) {
            const message = await prisma.message.create({
                data: {
                    chatRoomId: chat.id,
                    senderId: session.user.id,
                    content: actionDescription,
                    type: "SYSTEM",
                }
            });
            await pusherServer.trigger(`private-chat-${chat.id}`, 'new-message', message);
            revalidatePath(`/dashboard/messages/${chat.id}`);
        }

        revalidatePath(`/dashboard/messages`);
        return { success: true };

    } catch (error) {
        console.error("Error creating counter offer:", error);
        return { success: false, error: "Failed to create counter offer" };
    }
}




const formSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    images: z.array(z.string()),
    price: z.coerce.number().min(0),
    condition: z.string().min(1),
    category: z.string().min(1),
});

export async function createCursedObject(data: z.infer<typeof formSchema>) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false, error: "You must be logged in to summon an item." };
    }

    const parse = formSchema.safeParse(data);
    if (!parse.success) {
        return { success: false, error: "Invalid spell components (data)." };
    }

    const { title, description, images, price, condition, category } = parse.data;

    try {
        // Verify the user exists in the database
        const userExists = await prisma.wizard.findUnique({
            where: { id: session.user.id },
        });

        if (!userExists) {
            console.error("User not found in database:", session.user.id);
            return {
                success: false,
                error: "Your wizard profile is missing. Please sign out and sign in again."
            };
        }

        await prisma.cursedObject.create({
            data: {
                title,
                description,
                images,
                price,
                condition,
                category,
                sellerId: session.user.id,
            },
        });

        // Award Karma (Phase 1) - +10 for selling (listing?)
        // todos.md says: "+10 for selling". 
        // Assuming "selling" means successfully completing a sale, or listing?
        // "Add triggers: +1 for login, +10 for selling"
        // Usually selling means sold. Let's stick to listing for now or maybe wait till sale.
        // I'll leave karma for now as per plan.

        revalidatePath("/marketplace");
        return { success: true };
    } catch (error) {
        console.error("Failed to summon item:", error);
        return { success: false, error: "The ritual failed. Please try again." };
    }
}
