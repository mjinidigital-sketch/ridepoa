import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CarsDataTable } from "./cars-data-table";

export const instant = false;

export default async function CarsPage() {
    const user = await currentUser();
    const role =
        (user?.publicMetadata as Record<string, any>)?.role ||
        (user?.unsafeMetadata as Record<string, any>)?.role;

    if (!user || role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight">Vehicle Inventory</h1>

                        </div>
                        <CarsDataTable />
                    </div>
                </div>
            </div>
        </div>
    );
}
