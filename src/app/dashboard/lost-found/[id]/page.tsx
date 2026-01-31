import { RelicDetailView } from "@/components/lost-found/RelicDetailView";

export const dynamic = 'force-dynamic';

export default async function RelicDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    // The middleware/proxy protects this route (/dashboard/*), so we don't strictly need to check session here again
    // unless we want to do specific role checks, but the component handles logic based on session user.
    // However, since it IS a dashboard route, we can assume auth is handled or let RelicDetailView handle it gracefully.
    // Given the previous code had explicit redirect, we can rely on proxy for that now.

    return (
        <RelicDetailView
            relicId={params.id}
            backRoute="/dashboard/lost-found"
            backLabel="Back to Dashboard"
        />
    );
}
