import { PrismaClient, KarmaRank, ItemStatus } from "../src/app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding Solo Leveling Ranks...");

    // Clean up existing data
    await prisma.cursedObject.deleteMany();
    await prisma.wizard.deleteMany();

    const users = [
        { fullName: "Sung Jin-Woo", email: "sung@leveling.com", karmaScore: 15000, karmaRank: "SHADOW_MONARCH" as KarmaRank },
        { fullName: "Thomas Andre", email: "thomas@scavenger.com", karmaScore: 6000, karmaRank: "NATIONAL_LEVEL" as KarmaRank },
        { fullName: "Cha Hae-In", email: "cha@hunter.com", karmaScore: 2500, karmaRank: "S_RANK" as KarmaRank },
        { fullName: "Choi Jong-In", email: "choi@guild.com", karmaScore: 1200, karmaRank: "A_RANK" as KarmaRank },
        { fullName: "Woo Jin-Chul", email: "woo@association.com", karmaScore: 800, karmaRank: "B_RANK" as KarmaRank },
        { fullName: "Song Chi-Yul", email: "song@academy.com", karmaScore: 400, karmaRank: "C_RANK" as KarmaRank },
        { fullName: "Ju-Hee", email: "juhee@healer.com", karmaScore: 150, karmaRank: "D_RANK" as KarmaRank },
        { fullName: "Generic Hunter", email: "generic@hunter.com", karmaScore: 10, karmaRank: "E_RANK" as KarmaRank },
    ];

    for (const userData of users) {
        const user = await prisma.wizard.create({
            data: {
                id: `user_${userData.karmaRank.toLowerCase()}`,
                ...userData,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`,
                updatedAt: new Date(),
            },
        });

        // Create an item for each user to see their badge in marketplace detail view
        await prisma.cursedObject.create({
            data: {
                title: `${userData.fullName}'s Sacred Artifact`,
                description: `An artifact belonging to a ${userData.karmaRank} rank hunter.`,
                price: 999,
                category: "ARTIFACT",
                condition: "Mint",
                status: "ACTIVE" as ItemStatus,
                images: ["https://images.unsplash.com/photo-1519681393784-d120267933ba"],
                sellerId: user.id,
                updatedAt: new Date(),
            },
        });
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
