"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Store,
    Search,
    Package,
    Receipt,
    MessageSquare,
    Bell,
    User,
    Sparkles,
    LogOut,
    Shield,
    Flag
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getUnreadNotificationCount } from "@/actions/notifications"
import { useSession } from "next-auth/react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Menu items.
const items = {
    marketplace: [
        { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
        { title: "Browse", url: "/marketplace", icon: Store },
        { title: "My Listings", url: "/dashboard/listings", icon: Package },
    ],
    lostFound: [
        { title: "Browse", url: "/dashboard/lost-found", icon: Search },
        { title: "My Items", url: "/dashboard/lost-found/mine", icon: Package },
    ],
    account: [
        { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
        { title: "Inbox", url: "/dashboard/messages", icon: MessageSquare },
        { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
        { title: "My Reports", url: "/dashboard/reports", icon: Flag }, // Imported Flag from lucide-react
        { title: "Profile", url: "/dashboard/profile", icon: User },
        { title: "Karma", url: "/dashboard/karma", icon: Sparkles },
    ]
}

export function AppSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isProfileIncomplete = session?.user && !session.user.phoneNumber;

    const { data: unreadCount = 0 } = useQuery({
        queryKey: queryKeys.notifications.unreadCount,
        queryFn: () => getUnreadNotificationCount(),
        refetchInterval: 30000, // Poll every 30s
    })

    return (
        <Sidebar collapsible="icon" className="border-r border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/50">
            <SidebarHeader className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                    <div className="p-2 bg-red-900/20 border border-red-500/20 rounded-md">
                        <Shield className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-black uppercase tracking-widest text-sm text-white">
                            Campus Vault
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                            DAU Terminal
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {/* Marketplace Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase tracking-widest text-xs font-bold text-zinc-600 group-data-[collapsible=icon]:hidden">
                        Marketplace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.marketplace.map((item) => {
                                const isDisabled = isProfileIncomplete;
                                const content = (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={pathname === item.url}
                                            disabled={isDisabled}
                                            className={cn(
                                                "text-zinc-400 hover:text-white hover:bg-white/10 data-[active=true]:text-white data-[active=true]:bg-white/15 transition-all duration-200",
                                                isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400"
                                            )}
                                        >
                                            {isDisabled ? (
                                                <div className="flex items-center gap-2 px-2 py-1.5 w-full">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </div>
                                            ) : (
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );

                                if (isDisabled) {
                                    return (
                                        <Tooltip key={item.title} delayDuration={0}>
                                            <TooltipTrigger asChild>{content}</TooltipTrigger>
                                            <TooltipContent side="right">
                                                Update mobile number to continue
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return content;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Lost & Found Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase tracking-widest text-xs font-bold text-zinc-600 group-data-[collapsible=icon]:hidden">
                        Lost & Found
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.lostFound.map((item) => {
                                const isDisabled = isProfileIncomplete;
                                const content = (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={pathname === item.url}
                                            disabled={isDisabled}
                                            className={cn(
                                                "text-zinc-400 hover:text-white hover:bg-white/10 data-[active=true]:text-white data-[active=true]:bg-white/15 transition-all duration-200",
                                                isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400"
                                            )}
                                        >
                                            {isDisabled ? (
                                                <div className="flex items-center gap-2 px-2 py-1.5 w-full">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </div>
                                            ) : (
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );

                                if (isDisabled) {
                                    return (
                                        <Tooltip key={item.title} delayDuration={0}>
                                            <TooltipTrigger asChild>{content}</TooltipTrigger>
                                            <TooltipContent side="right">
                                                Update mobile number to continue
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return content;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Account Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase tracking-widest text-xs font-bold text-zinc-600 group-data-[collapsible=icon]:hidden">
                        Account
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.account.map((item) => {
                                const isDisabled = isProfileIncomplete && item.title !== "Profile";

                                const content = (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={pathname === item.url}
                                            disabled={isDisabled}
                                            className={cn(
                                                "text-zinc-400 hover:text-white hover:bg-white/10 data-[active=true]:text-white data-[active=true]:bg-white/15 transition-all duration-200",
                                                isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400"
                                            )}
                                        >
                                            {isDisabled ? (
                                                <div className="flex items-center gap-2 px-2 py-1.5 w-full">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </div>
                                            ) : (
                                                <Link href={item.url} className="relative">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                    {item.title === "Notifications" && unreadCount > 0 && (
                                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 min-w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full px-1 shadow-lg shadow-red-600/30 animate-pulse">
                                                            {unreadCount > 99 ? "99+" : unreadCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );

                                if (isDisabled) {
                                    return (
                                        <Tooltip key={item.title} delayDuration={0}>
                                            <TooltipTrigger asChild>{content}</TooltipTrigger>
                                            <TooltipContent side="right">
                                                Update mobile number to continue
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }

                                return content;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-white/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 group-data-[collapsible=icon]:justify-center"
                        >
                            <LogOut />
                            <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
