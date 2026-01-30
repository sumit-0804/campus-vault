import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/")

    return (
        <div className="fixed inset-0 top-16 bg-zinc-950 md:left-[var(--sidebar-width)] md:top-0">
            {children}
        </div>
    )
}
