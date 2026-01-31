import { getParamsForOwnerOfferList } from "@/actions/marketplace";
import { OwnerOfferList } from "./OwnerOfferList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function OwnerOfferListWrapper({ itemId }: { itemId: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const result = await getParamsForOwnerOfferList(itemId);

    if (!result.success || !result.chatRooms || !result.offers) {
        return <div className="text-red-500 text-sm">Failed to load offers.</div>;
    }

    return (
        <OwnerOfferList
            itemId={itemId}
            currentUserId={session.user.id}
            chatRooms={result.chatRooms}
            offers={result.offers}
        />
    );
}
