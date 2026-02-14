"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitUnbanRequest(reason: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check if user is actually banished (double check)
    if (!session.user.isBanished) {
        throw new Error("You are not banished!");
    }

    // Check if there is already a pending request
    const existingRequest = await prisma.report.findFirst({
        where: {
            reporterId: session.user.id,
            targetType: "UNBAN_REQUEST",
            status: "PENDING",
        },
    });

    if (existingRequest) {
        throw new Error("You already have a pending appeal. Please wait for the Hell Lord's decision.");
    }

    await prisma.report.create({
        data: {
            reporterId: session.user.id,
            targetType: "UNBAN_REQUEST",
            targetId: session.user.id, // Targeting themselves
            reason: reason,
        },
    });

    return { success: true };
}
