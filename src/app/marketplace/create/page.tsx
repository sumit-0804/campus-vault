import CreateItemWizard from "@/components/marketplace/CreateItemWizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";

export default function CreateListingPage() {
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
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
