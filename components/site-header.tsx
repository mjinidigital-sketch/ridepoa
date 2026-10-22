import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ModeToggle"
import { NavUser } from "./nav-user"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 cursor-pointer hover:bg-muted" />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 data-vertical:self-auto"
          />
          <h1 className="text-base font-semibold tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ModeToggle />
          <Separator
            orientation="vertical"
            className="h-4 data-vertical:self-auto"
          />
          <NavUser variant="header" />
        </div>
      </div>
    </header>
  )
}
