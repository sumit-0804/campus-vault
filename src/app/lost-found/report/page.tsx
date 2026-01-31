import { ReportRelicForm } from "@/components/lost-found/ReportRelicForm";
import { BackButton } from "@/components/ui/BackButton";
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
                <BackButton fallbackRoute="/dashboard/lost-found" />
            </div>

            <ReportRelicForm />
        </div>
    );
}
