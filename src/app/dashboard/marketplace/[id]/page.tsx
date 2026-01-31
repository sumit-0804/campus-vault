import { MarketplaceItemDetailView } from "@/components/marketplace/MarketplaceItemDetailView";

export const dynamic = 'force-dynamic';

export default async function DashboardItemPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    return (
        <MarketplaceItemDetailView
            itemId={params.id}
            backRoute="/dashboard/marketplace"
            backLabel="Back to Dashboard"
        />
    );
}
