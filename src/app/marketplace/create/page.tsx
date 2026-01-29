import CreateItemWizard from "@/components/marketplace/CreateItemWizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateListingPage() {
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
            <Link href="/marketplace" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bazaar
            </Link>

            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 mb-2">
                    Summon a Cursed Object
                </h1>
                <p className="text-zinc-400">
                    Offer your artifact to the void, and await a worthy trade.
                </p>
            </div>

            <CreateItemWizard />
        </div>
    );
}
