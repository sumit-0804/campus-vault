"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Admin Guard ---
async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    if (session.user.role !== "ADMIN") throw new Error("Forbidden: Admin only");
    return session.user;
}

// --- Dashboard Stats ---
export async function getAdminStats() {
    await requireAdmin();

    const [totalUsers, activeListings, totalKarma, pendingReports, totalTransactions] =
        await Promise.all([
            prisma.wizard.count(),
            prisma.cursedObject.count({ where: { status: "ACTIVE" } }),
            prisma.wizard.aggregate({ _sum: { karmaScore: true } }),
            prisma.report.count({ where: { status: "PENDING" } }),
            prisma.transaction.count(),
        ]);

    return {
        totalUsers,
        activeListings,
        totalKarma: totalKarma._sum.karmaScore ?? 0,
        pendingReports,
        totalTransactions,
    };
}

// --- User Management ---
export async function getAllUsers(page = 1, search = "", limit = 20) {
    await requireAdmin();

    const where = search
        ? {
            OR: [
                { fullName: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.wizard.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                karmaScore: true,
                karmaRank: true,
                role: true,
                isBanished: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.wizard.count({ where }),
    ]);

    return { users, total, totalPages: Math.ceil(total / limit) };
}

export async function toggleBanUser(userId: string) {
    const admin = await requireAdmin();
    if (admin.id === userId) throw new Error("Cannot ban yourself");

    const user = await prisma.wizard.findUnique({
        where: { id: userId },
        select: { isBanished: true },
    });
    if (!user) throw new Error("User not found");

    await prisma.wizard.update({
        where: { id: userId },
        data: { isBanished: !user.isBanished },
    });

    revalidatePath("/admin/users");
    return { success: true, isBanished: !user.isBanished };
}

// --- Reports ---
export async function getReports(status?: string) {
    await requireAdmin();

    const where = status ? { status: status as any } : {};

    const reports = await prisma.report.findMany({
        where,
        include: {
            reporter: {
                select: { id: true, fullName: true, email: true, avatarUrl: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return reports;
}

export async function actionReport(
    reportId: string,
    status: "ACTIONED" | "REJECTED",
    adminNote?: string
) {
    await requireAdmin();

    await prisma.report.update({
        where: { id: reportId },
        data: { status, adminNote },
    });

    revalidatePath("/admin/reports");
    return { success: true };
}

// User-facing: submit a report (no admin required)
export async function createReport(
    targetType: string,
    targetId: string,
    reason: string
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.report.create({
        data: {
            reporterId: session.user.id,
            targetType,
            targetId,
            reason,
        },
    });

    return { success: true };
}

// --- Karma Management ---
export async function adjustKarma(
    userId: string,
    amount: number,
    reason: string
) {
    await requireAdmin();

    const user = await prisma.wizard.findUnique({
        where: { id: userId },
        select: { karmaScore: true },
    });
    if (!user) throw new Error("User not found");

    const { harvestSouls } = await import("@/actions/karma");

    // Use harvestSouls for positive amounts, manual update for negative
    if (amount > 0) {
        await harvestSouls(userId, amount, "ADMIN_ADJUSTMENT" as any);
    } else {
        // Manual negative adjustment
        const newScore = Math.max(0, user.karmaScore + amount);
        await prisma.wizard.update({
            where: { id: userId },
            data: { karmaScore: newScore },
        });
        await prisma.karmaLog.create({
            data: { userId, amount, reason: `ADMIN: ${reason}` },
        });
    }

    revalidatePath("/admin/karma");
    return { success: true };
}

export async function getKarmaLogs(userId?: string, limit = 50) {
    await requireAdmin();

    const where = userId ? { userId } : {};

    const logs = await prisma.karmaLog.findMany({
        where,
        include: {
            user: {
                select: { id: true, fullName: true, email: true, avatarUrl: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return logs;
}

export async function forceArchiveItem(itemId: string) {
    await requireAdmin();

    await prisma.cursedObject.update({
        where: { id: itemId },
        data: { status: "SOLD" },
    });

    revalidatePath("/admin");
    revalidatePath("/marketplace");
    return { success: true };
}
