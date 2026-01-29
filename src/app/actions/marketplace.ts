"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const formSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    imageUrl: z.string().url(),
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

    const { title, description, imageUrl, price, condition, category } = parse.data;

    try {
        await prisma.cursedObject.create({
            data: {
                title,
                description,
                images: [imageUrl],
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

        revalidatePath("/dashboard/market");
        return { success: true };
    } catch (error) {
        console.error("Failed to summon item:", error);
        return { success: false, error: "The ritual failed. Please try again." };
    }
}
