"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  TrashIcon,
  ShieldIcon,
  RefreshCwIcon,
} from "lucide-react"
import { updateUserRole, deleteUser } from "@/app/actions"
import { EditUserForm } from "@/components/edit-user-form"
import { AddUserForm } from "@/components/add-user-form"

export interface User {
  _id: string
  clerkId?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: string
  image?: string
  createdAt?: number
  updatedAt?: number
  lastLoginAt?: number
  isActive?: boolean
}

export function UsersDataTable({
  data: initialData,
}: {
  data: User[]
}) {
  const [data, setData] = React.useState<User[]>(() => initialData)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Keep data in sync with initialData if server updates it
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const { getUsers } = await import("@/app/actions")
      const users = await getUsers()
      setData(users)
      toast.success("Users list refreshed")
    } catch (error: any) {
      toast.error(error?.message || "Failed to refresh users")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter data based on search query, role, and status
  const filteredData = React.useMemo(() => {
    let result = data

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          (user.name?.toLowerCase() || "").includes(query) ||
          (user.email?.toLowerCase() || "").includes(query)
      )
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      result = result.filter((user) => (user.isActive ?? true) === isActive)
    }

    return result
  }, [data, searchQuery, roleFilter, statusFilter])

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={
                table.getIsSomePageRowsSelected() &&
                !table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-9 w-9 rounded-full object-cover border"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border font-semibold text-xs">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{user.name || "Unknown"}</span>
                {user.clerkId && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {user.clerkId}
                  </span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: "Email & Phone",
        cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <span className="text-foreground font-normal">{row.original.email || "N/A"}</span>
            {row.original.phone && (
              <span className="text-xs text-muted-foreground font-mono">{row.original.phone}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role (Clerk Metadata)",
        cell: ({ row }) => {
          const role = (row.original.role || "user").toLowerCase()
          const roleStyles: Record<string, string> = {
            admin: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
            staff: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
            user: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
            customer: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          }
          return (
            <Badge
              variant="outline"
              className={`capitalize px-2 py-0.5 text-xs font-medium ${roleStyles[role] || "bg-muted text-foreground"}`}
            >
              <ShieldIcon className="mr-1 h-3 w-3" />
              {role}
            </Badge>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
          const createdAt = row.original.createdAt
          if (!createdAt) return <span className="text-muted-foreground">N/A</span>
          const date = new Date(createdAt)
          return <span className="text-muted-foreground text-sm">{date.toLocaleDateString()}</span>
        },
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last Sign In",
        cell: ({ row }) => {
          const lastLoginAt = row.original.lastLoginAt
          if (!lastLoginAt) return <span className="text-muted-foreground text-sm">Never</span>
          const date = new Date(lastLoginAt)
          return <span className="text-muted-foreground text-sm">{date.toLocaleDateString()}</span>
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.isActive ?? true
          return (
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              {isActive ? "Active" : "Banned"}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original
          const targetUserId = user.clerkId || user._id

          return (
            <div className="flex items-center gap-1 justify-end">
              <EditUserForm user={user} onSuccess={refreshData} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      size="icon"
                    />
                  }
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={async () => {
                      toast.promise(
                        updateUserRole(targetUserId, "admin").then(() => refreshData()),
                        {
                          loading: "Setting role to admin in Clerk...",
                          success: "Role updated to admin",
                          error: (err: any) => err?.message || "Failed to update role",
                        }
                      )
                    }}
                  >
                    <ShieldIcon className="mr-2 h-4 w-4 text-red-500" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      toast.promise(
                        updateUserRole(targetUserId, "staff").then(() => refreshData()),
                        {
                          loading: "Setting role to staff in Clerk...",
                          success: "Role updated to staff",
                          error: (err: any) => err?.message || "Failed to update role",
                        }
                      )
                    }}
                  >
                    <ShieldIcon className="mr-2 h-4 w-4 text-blue-500" />
                    Make Staff
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      toast.promise(
                        updateUserRole(targetUserId, "user").then(() => refreshData()),
                        {
                          loading: "Setting role to user in Clerk...",
                          success: "Role updated to user",
                          error: (err: any) => err?.message || "Failed to update role",
                        }
                      )
                    }}
                  >
                    <ShieldIcon className="mr-2 h-4 w-4 text-green-500" />
                    Make User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      toast.promise(
                        updateUserRole(targetUserId, "customer").then(() => refreshData()),
                        {
                          loading: "Setting role to customer in Clerk...",
                          success: "Role updated to customer",
                          error: (err: any) => err?.message || "Failed to update role",
                        }
                      )
                    }}
                  >
                    <ShieldIcon className="mr-2 h-4 w-4 text-amber-500" />
                    Make Customer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to delete user ${user.name || user.email} from Clerk?`)) {
                        return
                      }
                      toast.promise(
                        deleteUser(targetUserId).then(() => refreshData()),
                        {
                          loading: "Deleting user from Clerk...",
                          success: "User deleted from Clerk",
                          error: (err: any) => err?.message || "Failed to delete user",
                        }
                      )
                    }}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-64"
          />
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value ?? "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Banned</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Columns3Icon className="mr-2 h-4 w-4" />
              Columns
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <AddUserForm onSuccess={refreshData} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  No users found matching current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-xs font-medium text-muted-foreground">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-18 h-8" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">First page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
