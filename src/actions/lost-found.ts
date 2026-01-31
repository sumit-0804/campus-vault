"use server";

import { z } from "zod";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

// --- Schemas ---

const createRelicSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    location: z.string().optional(),
    type: z.enum(["LOST", "FOUND"]),
    // Riddle fields are optional initially, but required if type is FOUND
    secretRiddle: z.string().optional(),
    hiddenTruth: z.string().optional(),
}).refine((data) => {
    if (data.type === "FOUND") {
        return !!data.secretRiddle && !!data.hiddenTruth;
    }
    return true;
}, {
    message: "Secret Riddle and Answer are required for Found items",
    path: ["secretRiddle"], // Focus error on riddle
});

const verifyClaimSchema = z.object({
    relicId: z.string(),
    answer: z.string().min(1, "Answer cannot be empty"),
});

// --- Actions ---

export async function createLostRelic(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: "You must be logged in to report an item." };
    }

    // Parse generic fields
    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location") || undefined,
        type: formData.get("type"),
        secretRiddle: formData.get("secretRiddle") || undefined,
        hiddenTruth: formData.get("hiddenTruth") || undefined,
        // Images are handled via the UploadWidget on the client, which returns URLs.
        // For this action, we expect a comma-separated string or hidden inputs.
        // Assuming the form will pass 'images' as a JSON string or comma-separated list
        images: formData.get("images") ? (formData.get("images") as string).split(",") : [],
    };

    const validatedFields = createRelicSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { type, title, description, location, images, secretRiddle, hiddenTruth } = validatedFields.data;

    try {
        await db.lostRelic.create({
            data: {
                reporterId: session.user.id,
                title,
                description,
                location: location || null,
                type: type as "LOST" | "FOUND",
                images,
                secretRiddle: type === "FOUND" ? secretRiddle : null,
                hiddenTruth: type === "FOUND" ? hiddenTruth : null,
                status: "OPEN",
            },
        });

        revalidatePath("/dashboard/lost-found");
        return { success: true };
    } catch (error) {
        console.error("Error creating relic:", error);
        return { error: "Failed to report item. Please try again." };
    }
}

export async function getLostRelics(filter?: "LOST" | "FOUND" | null) {
    try {
        const relics = await db.lostRelic.findMany({
            where: {
                ...(filter ? { type: filter } : {}),
                status: "OPEN",
            },
            include: {
                reporter: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                        karmaRank: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return { success: true, data: relics };
    } catch (error) {
        console.error("Error fetching relics:", error);
        return { success: false, error: "Failed to fetch items" };
    }
}

export async function getUserLostRelics() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const relics = await db.lostRelic.findMany({
            where: {
                reporterId: session.user.id,
            },
            include: {
                reporter: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                        karmaRank: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return { success: true, data: relics };
    } catch (error) {
        console.error("Error fetching user relics:", error);
        return { success: false, error: "Failed to fetch your items" };
    }
}

export async function getUserClaims() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const claims = await db.lostRelic.findMany({
            where: {
                claimerId: session.user.id,
            },
            include: {
                reporter: {
                    select: {
                        fullName: true,
                        avatarUrl: true,
                        karmaRank: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return { success: true, data: claims };
    } catch (error) {
        console.error("Error fetching user claims:", error);
        return { success: false, error: "Failed to fetch your claims" };
    }
}

export async function getRelicById(id: string) {
    try {
        const relic = await db.lostRelic.findUnique({
            where: { id },
            include: {
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        karmaRank: true,
                        karmaScore: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });

        if (!relic) {
            return { success: false, error: "Item not found" };
        }

        return { success: true, data: relic };
    } catch (error) {
        console.error("Error fetching relic:", error);
        return { success: false, error: "Failed to fetch item" };
    }
}

export async function verifyRelicClaim(relicId: string, answer: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    const validated = verifyClaimSchema.safeParse({ relicId, answer });
    if (!validated.success) return { error: "Invalid input" };

    try {
        const relic = await db.lostRelic.findUnique({
            where: { id: relicId },
            include: {
                reporter: {
                    select: {
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            }
        });

        if (!relic) return { error: "Item not found" };
        if (relic.status !== "OPEN") return { error: "Item is no longer available" };
        if (!relic.hiddenTruth) return { error: "No verification set for this item" };

        // Case-insensitive comparison
        const isMatch = relic.hiddenTruth.trim().toLowerCase() === answer.trim().toLowerCase();

        if (isMatch) {
            // Update relic with claimer info and status
            await db.lostRelic.update({
                where: { id: relicId },
                data: {
                    claimerId: session.user.id,
                    claimerVerifiedAt: new Date(),
                    status: "VERIFIED",
                },
            });

            await pusherServer.trigger(`relic-${relicId}`, 'status-updated', { status: 'VERIFIED' });

            revalidatePath("/dashboard/lost-found");
            revalidatePath(`/dashboard/lost-found/${relicId}`);
            revalidatePath(`/lost-found/${relicId}`);

            return {
                success: true,
                finderContact: {
                    name: relic.reporter.fullName,
                    email: relic.reporter.email,
                    phone: relic.reporter.phoneNumber || "Not provided",
                },
                message: "Match Confirmed! The item is yours."
            };
        } else {
            return { success: false, error: "Incorrect answer. The query fails." };
        }

    } catch (error) {
        console.error("Verification error:", error);
        return { error: "Verification failed due to a server error." };
    }
}


export async function reportFoundItem(relicId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const relic = await db.lostRelic.findUnique({
            where: { id: relicId },
        });

        if (!relic) return { error: "Item not found" };
        if (relic.type !== "LOST") return { error: "This action is only for LOST items" };
        if (relic.reporterId === session.user.id) {
            return { error: "You cannot report finding your own lost item this way. Use 'I Found It' instead." };
        }
        if (relic.status !== "OPEN") {
            return { error: "Item is no longer open" };
        }

        await db.lostRelic.update({
            where: { id: relicId },
            data: {
                status: "VERIFIED",
                claimerId: session.user.id, // In LOST context, claimerId is the Finder
                claimerVerifiedAt: new Date(),
            },
        });

        await pusherServer.trigger(`relic-${relicId}`, 'status-updated', { status: 'VERIFIED' });

        revalidatePath("/dashboard/lost-found");
        revalidatePath(`/dashboard/lost-found/${relicId}`);
        revalidatePath(`/lost-found/${relicId}`);

        return { success: true, message: "Thank you! The owner has been notified that you found their item." };
    } catch (error) {
        console.error("Error reporting found item:", error);
        return { error: "Failed to update status" };
    }
}

export async function markAsDroppedOff(relicId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const relic = await db.lostRelic.findUnique({
            where: { id: relicId },
        });

        if (!relic) return { error: "Item not found" };

        // Logic for FOUND items (Reporter = Finder, Claimer = Owner)
        if (relic.type === "FOUND") {
            if (relic.reporterId !== session.user.id) {
                return { error: "Only the finder (reporter) can mark as dropped off" };
            }
        }
        // Logic for LOST items (Reporter = Owner, Claimer = Finder)
        else {
            if (relic.claimerId !== session.user.id) {
                return { error: "Only the finder can mark this item as returned/dropped off" };
            }
        }

        if (relic.status !== "VERIFIED") {
            return { error: "Item must be verified (found) before drop-off" };
        }

        await db.lostRelic.update({
            where: { id: relicId },
            data: {
                status: "DROPPED_OFF",
                droppedOffAt: new Date(),
            },
        });

        await pusherServer.trigger(`relic-${relicId}`, 'status-updated', { status: 'DROPPED_OFF' });

        revalidatePath("/dashboard/lost-found");
        revalidatePath(`/dashboard/lost-found/${relicId}`);
        revalidatePath(`/lost-found/${relicId}`);

        return { success: true, message: "Item marked as dropped off/returned" };
    } catch (error) {
        console.error("Error marking as dropped off:", error);
        return { error: "Failed to update status" };
    }
}

export async function markAsDelivered(relicId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const relic = await db.lostRelic.findUnique({
            where: { id: relicId },
        });

        if (!relic) return { error: "Item not found" };

        // Logic for FOUND items (Reporter = Finder, Claimer = Owner)
        if (relic.type === "FOUND") {
            if (relic.claimerId !== session.user.id) {
                return { error: "Only the claimer (owner) can confirm delivery" };
            }
        }
        // Logic for LOST items (Reporter = Owner, Claimer = Finder)
        else {
            if (relic.reporterId !== session.user.id) {
                return { error: "Only the reporter (owner) can confirm receipt" };
            }
        }

        if (relic.status !== "DROPPED_OFF") {
            return { error: "Item must be dropped off/returned before confirming delivery" };
        }

        await db.lostRelic.update({
            where: { id: relicId },
            data: {
                status: "SOLVED",
                deliveredAt: new Date(),
            },
        });

        await pusherServer.trigger(`relic-${relicId}`, 'status-updated', { status: 'SOLVED' });

        revalidatePath("/dashboard/lost-found");
        revalidatePath(`/dashboard/lost-found/${relicId}`);
        revalidatePath(`/lost-found/${relicId}`);

        return { success: true, message: "Delivery confirmed! Item marked as solved" };
    } catch (error) {
        console.error("Error confirming delivery:", error);
        return { error: "Failed to update status" };
    }
}

export async function markAsFound(relicId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const relic = await db.lostRelic.findUnique({
            where: { id: relicId },
        });

        if (!relic) return { error: "Item not found" };
        if (relic.reporterId !== session.user.id) {
            return { error: "Only the reporter can mark this item as found" };
        }
        if (relic.type !== "LOST") {
            return { error: "This action is only for LOST items" };
        }

        await db.lostRelic.update({
            where: { id: relicId },
            data: {
                status: "SOLVED",
                deliveredAt: new Date(), // Mark as delivered effectively since owner has it
            },
        });

        await pusherServer.trigger(`relic-${relicId}`, 'status-updated', { status: 'SOLVED' });

        revalidatePath("/dashboard/lost-found");
        revalidatePath(`/dashboard/lost-found/${relicId}`);
        revalidatePath(`/lost-found/${relicId}`);

        return { success: true, message: "Item marked as found and case closed!" };
    } catch (error) {
        console.error("Error marking as found:", error);
        return { error: "Failed to update status" };
    }
}
