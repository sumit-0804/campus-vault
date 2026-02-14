"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";

export async function getUserReports() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const reports = await prisma.report.findMany({
        where: {
            reporterId: session.user.id,
            targetType: { in: ["USER", "ITEM"] }, // Exclude UNBAN_REQUEST from user-facing reports
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            reporter: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                }
            }
        }
    });

    return reports;
}
