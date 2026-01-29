"use client"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import { MobileBottomNav } from "@/components/layout/MobileBottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="hidden md:block">
                <AppSidebar />
            </div>
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mb-16 md:mb-0">
                    {children}
                </div>
                <MobileBottomNav />
            </SidebarInset>
        </SidebarProvider>
    )
}
