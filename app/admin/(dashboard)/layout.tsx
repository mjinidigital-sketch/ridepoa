import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const instant = false;

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await currentUser()
    const role =
        (user?.publicMetadata as Record<string, any>)?.role ||
        (user?.unsafeMetadata as Record<string, any>)?.role

    if (!user || role !== "admin") {
        redirect("/")
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 64)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset" />
                    <SidebarInset>
                        <SiteHeader />
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
        </ThemeProvider>
    )
}   