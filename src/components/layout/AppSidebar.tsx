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
    Shield
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

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
        { title: "Inbox", url: "/dashboard/inbox", icon: MessageSquare },
        { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
        { title: "Profile", url: "/dashboard/profile", icon: User },
        { title: "Karma", url: "/dashboard/karma", icon: Sparkles },
    ]
}

export function AppSidebar() {
    const pathname = usePathname();

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
                            {items.marketplace.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={pathname === item.url}
                                        className="text-zinc-400 hover:text-white hover:bg-white/10 data-[active=true]:text-white data-[active=true]:bg-white/15 transition-all duration-200"
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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
                            {items.lostFound.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={pathname === item.url}
                                        className="text-zinc-400 hover:text-white hover:bg-white/10 data-[active=true]:text-white data-[active=true]:bg-white/15 transition-all duration-200"
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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
                            {items.account.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={pathname === item.url}
                                        className="text-zinc-400 hover:text-white hover:bg-white/10 data-[active=true]:text-white data-[active=true]:bg-white/15 transition-all duration-200"
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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
