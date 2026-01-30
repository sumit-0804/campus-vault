"use client"

import Navbar from "@/components/ui/Navbar"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LostFoundLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return
        if (session?.user && !session.user.phoneNumber) {
            if (pathname !== "/dashboard/profile") {
                router.push("/dashboard/profile")
            }
        }
    }, [session, status, pathname, router])

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main className="relative z-10 pt-20 pb-20 md:pb-0 px-4">
                {children}
            </main>
        </div>
    )
}
