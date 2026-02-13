"use client"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { DailyLoginManager } from "@/components/features/karma/DailyLoginManager"
import { usePusherNotifications } from "@/hooks/usePusherNotifications"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        // Check if phone number is missing
        if (session?.user && !session.user.phoneNumber) {
            // Avoid infinite loop
            if (pathname !== "/dashboard/profile") {
                toast.error("Please update your mobile number to continue", {
                    id: "profile-nudge", // Prevent multiple toasts
                })
                router.push("/dashboard/profile")
            }
        }
    }, [session, status, pathname, router])

    return (
        <SidebarProvider>
            <div className="hidden md:block">
                <AppSidebar />
            </div>
            <SidebarInset>
                <DashboardHeader />
                <DailyLoginManager />
                <NotificationWrapper />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mb-16 md:mb-0">
                    {children}
                </div>
                <MobileBottomNav />
            </SidebarInset>
        </SidebarProvider>
    )
}

function NotificationWrapper() {
    usePusherNotifications()
    return null
}
