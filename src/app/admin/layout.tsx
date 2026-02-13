import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Flag,
    Sparkles,
    ArrowLeft,
    Shield,
} from "lucide-react";

const adminNav = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Reports", url: "/admin/reports", icon: Flag },
    { title: "Karma Logs", url: "/admin/karma", icon: Sparkles },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 border-b border-red-500/20 bg-zinc-950/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                            <Shield className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h1 className="font-black uppercase tracking-widest text-sm">
                                Admin Panel
                            </h1>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Campus Vault Control Center
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex">
                {/* Sidebar Nav */}
                <nav className="hidden md:flex flex-col w-56 min-h-[calc(100vh-57px)] border-r border-white/5 p-4 gap-1">
                    {adminNav.map((item) => (
                        <Link
                            key={item.url}
                            href={item.url}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Nav */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl">
                    <div className="flex justify-around p-2">
                        {adminNav.map((item) => (
                            <Link
                                key={item.url}
                                href={item.url}
                                className="flex flex-col items-center gap-1 px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-[10px]">{item.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-6 mb-16 md:mb-0">{children}</main>
            </div>
        </div>
    );
}
