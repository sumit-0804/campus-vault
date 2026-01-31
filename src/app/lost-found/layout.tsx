"use client"

import { LostFoundNavbar } from "@/components/lost-found/LostFoundNavbar"
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
        <div className="min-h-screen flex flex-col bg-black text-white">
            <LostFoundNavbar session={session || null} />
            <main className="flex-1 px-4">
                {children}
            </main>
        </div>
    )
}
