import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { MarketplaceNavbar } from "@/components/marketplace/MarketplaceNavbar";

export default async function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavbar session={session} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
