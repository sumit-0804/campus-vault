import { MakeOfferButton } from "@/components/marketplace/MakeOfferButton";
import { OwnerOfferListWrapper } from "@/components/marketplace/OwnerOfferListWrapper";

interface MarketplaceItemActionsProps {
    itemId: string;
    sellerId: string;
    isAvailable: boolean;
    isOwnItem: boolean;
    hasExistingOffer: boolean;
}

export function MarketplaceItemActions({
    itemId,
    sellerId,
    isAvailable,
    isOwnItem,
    hasExistingOffer
}: MarketplaceItemActionsProps) {
    return (
        <div className="flex gap-4 pt-4">
            {isOwnItem ? (
                <OwnerOfferListWrapper itemId={itemId} />
            ) : (
                <MakeOfferButton
                    sellerId={sellerId}
                    relicId={itemId}
                    isAvailable={isAvailable}
                    isOwnItem={isOwnItem}
                    hasExistingOffer={hasExistingOffer}
                />
            )}
            {/* Wishlist Button (Future) */}
        </div>
    );
}
