import { getUserLostRelics, getUserClaims } from "@/actions/lost-found";
import { MyItemsClient } from "@/components/lost-found/MyItemsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyLostFoundPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/sign-in");
    }

    const { data: reportedRelics } = await getUserLostRelics();
    const { data: claims } = await getUserClaims();

    return (
        <div className="p-6 sm:p-8 w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-amber-500 mb-2 glow-text">
                        My Lost & Found
                    </h1>
                    <p className="text-zinc-400">
                        Manage your reports and verify claims.
                    </p>
                </div>
            </div>

            <MyItemsClient
                reportedRelics={reportedRelics || []}
                claims={claims || []}
            />
        </div>
    );
}
