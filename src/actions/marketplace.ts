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

        // --- AI AUTO-TAGGING & PII DETECTION (fire-and-forget) ---
        if (images.length > 0) {
            // We need the item ID, so let's use the return value
            const item = await prisma.cursedObject.findFirst({
                where: { sellerId: session.user.id },
                orderBy: { createdAt: "desc" },
                select: { id: true },
            });

            if (item) {
                (async () => {
                    try {
                        const { autoTagImage, detectPII } = await import("@/actions/ai");
                        const [tags, piiResult] = await Promise.all([
                            autoTagImage(images[0]),
                            detectPII(images[0]),
                        ]);

                        if (tags.length > 0 || piiResult.hasPII) {
                            await prisma.cursedObject.update({
                                where: { id: item.id },
                                data: {
                                    ...(tags.length > 0 ? { tags } : {}),
                                    ...(piiResult.hasPII ? { piiDetected: true } : {}),
                                },
                            });
                        }
                    } catch (err) {
                        console.error("AI processing error (non-blocking):", err);
                    }
                })();
            }
        }
        // ---------------------------------------------------------

        revalidatePath("/marketplace");
        return { success: true };
    } catch (error) {
        console.error("Failed to summon item:", error);
        return { success: false, error: "The ritual failed. Please try again." };
    }
}
