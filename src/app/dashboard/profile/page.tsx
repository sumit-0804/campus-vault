import { authOptions } from "@/auth";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Mail } from "lucide-react";
import { UserBadge } from "@/components/features/karma/UserBadge";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/");
    }

    const user = await db.wizard.findUnique({
        where: {
            email: session.user.email!,
        },
    });

    if (!user) {
        redirect("/");
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-white/20 shadow-sm">
                {/* Banner Background */}
                <div className="h-32 bg-gradient-to-r from-[#9F00FF] to-[#6200EA] relative"></div>

                <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-8">
                    {/* Avatar with Camera Icon */}
                    <div className="relative group">
                        <div className="p-1 bg-white rounded-[20px] shadow-sm">
                            <Avatar className="h-28 w-28 rounded-2xl border-4 border-white dark:border-zinc-950 bg-white">
                                <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} className="object-cover rounded-2xl" />
                                <AvatarFallback className="text-3xl rounded-2xl bg-purple-100 text-purple-700">{user.fullName[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        {/* Placeholder for future avatar upload feature */}
                        <div className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-full shadow-md border-2 border-white dark:border-zinc-950 cursor-pointer hover:bg-slate-800 transition-colors">
                            <Camera className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-1 mb-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">{user.fullName || "Unknown Wizard"}</h1>
                        <div className="flex flex-wrapjustify-center md:justify-start items-center gap-3 text-sm text-gray-300">
                            <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-200 border border-purple-500/30 font-medium text-xs uppercase tracking-wider">
                                {user.role}
                            </span>
                            <UserBadge karma={user.karmaScore} />

                            <span className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {user.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Form Section */}
            <div className="bg-black rounded-xl border border-white/20 shadow-sm p-8">
                <ProfileForm initialData={user} />
            </div>
        </div>
    );
}
