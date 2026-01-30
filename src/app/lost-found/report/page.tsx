import { ReportRelicForm } from "@/components/lost-found/ReportRelicForm";
import { BackToMapButton } from "@/components/lost-found/BackToMapButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function ReportPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/sign-in");
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <BackToMapButton fallbackRoute="/dashboard/lost-found" />
            </div>

            <ReportRelicForm />
        </div>
    );
}
