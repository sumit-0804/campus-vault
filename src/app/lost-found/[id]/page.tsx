import { RelicDetailView } from "@/components/lost-found/RelicDetailView";

export const dynamic = 'force-dynamic';

export default async function RelicDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return (
        <RelicDetailView
            relicId={params.id}
            backRoute="/lost-found"
            backLabel="Back to Browse"
        />
    );
}
