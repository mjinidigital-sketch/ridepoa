import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UsersDataTable } from "./users-data-table";
import { getUsers } from "@/app/actions";

export const instant = false;

export default async function UsersPage() {
    const user = await currentUser();
    const role =
        (user?.publicMetadata as Record<string, any>)?.role ||
        (user?.unsafeMetadata as Record<string, any>)?.role;

    if (!user || role !== "admin") {
        redirect("/");
    }

    // Fetch users directly from Clerk with their roles and metadata
    const users = await getUsers();

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                            <p className="text-muted-foreground">
                                Manage Clerk user accounts, permissions, and roles in real-time.
                            </p>
                        </div>
                        <UsersDataTable data={users} />
                    </div>
                </div>
            </div>
        </div>
    );
}
