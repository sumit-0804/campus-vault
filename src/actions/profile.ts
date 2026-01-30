"use server";

import { authOptions } from "@/auth";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string().optional(),
    linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    instagramUrl: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        fullName: formData.get("fullName"),
        phoneNumber: formData.get("phoneNumber"),
        linkedinUrl: formData.get("linkedinUrl"),
        instagramUrl: formData.get("instagramUrl"),
    };

    const validatedFields = profileSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const error = validatedFields.error.issues[0].message;
        return { error };
    }

    const { fullName, phoneNumber, linkedinUrl, instagramUrl } = validatedFields.data;

    try {
        await db.wizard.update({
            where: { email: session.user.email },
            data: {
                fullName,
                phoneNumber: phoneNumber || null,
                linkedinUrl: linkedinUrl || null,
                instagramUrl: instagramUrl || null,
            },
        });

        revalidatePath("/dashboard/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { error: "Failed to update profile" };
    }
}
