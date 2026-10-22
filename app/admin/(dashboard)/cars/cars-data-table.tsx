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
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

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
  RefreshCwIcon,
  StarIcon,
  CarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react"

import { AddCarForm, VEHICLE_CATEGORIES } from "@/components/add-car-form"
import { EditCarForm } from "@/components/edit-car-form"

export interface VehicleRecord {
  _id: Id<"vehicles">
  _creationTime: number
  userId: Id<"users">
  sellerClerkId?: string
  title: string
  slug?: string
  category: string
  make: string
  model: string
  year: number
  trim?: string
  bodyType?: string
  vinOrChassisNumber?: string
  registrationNumber?: string
  price: number
  currency: string
  negotiable: boolean
  listingType: "sell" | "rent" | "lease" | "auction"
  status: "draft" | "pending_approval" | "active" | "reserved" | "sold" | "archived"
  featured?: boolean
  urgent?: boolean
  condition: "brand_new" | "foreign_used" | "locally_used"
  mileage: number
  mileageUnit: "km" | "miles"
  locallyDriven: boolean
  femaleOwned: boolean
  accidentFree: boolean
  repainted: boolean
  originalPaint?: boolean
  numberOfPreviousOwners?: number
  serviceHistory?: "full" | "partial" | "none"
  dutyPaid?: boolean
  logbookAvailable?: boolean
  warrantyRemainingMonths?: number
  fuelType: string
  transmission: string
  drivetrain?: string
  engineSizeCc?: number
  horsepower?: number
  fuelConsumption?: string
  batteryCapacityKwh?: number
  electricRangeKm?: number
  chargingTimeHours?: number
  seatingCapacity?: number
  payloadCapacityKg?: number
  towingCapacityKg?: number
  operatingHours?: number
  exteriorColor: string
  interiorColor?: string
  interiorMaterial?: string
  doorsCount?: number
  features: string[]
  city: string
  stateOrCounty?: string
  country: string
  address?: string
  latitude?: number
  longitude?: number
  images: string[]
  imageUrls?: string[]
  thumbnailUrl?: string
  videoUrl?: string
  inspectionReportUrl?: string
  description: string
  sellerContactPhone?: string
  sellerContactWhatsApp?: string
  seller?: {
    _id: string
    name: string
    email?: string
    phone?: string
    role?: string
    imageUrl?: string
  } | null
  viewsCount?: number
  savesCount?: number
  createdAt: number
  updatedAt: number
}

const DEAD_MANUFACTURER_DOMAINS = [
  "toyota.com",
  "bmw.com",
  "mercedes-benz.com",
  "audi.com",
  "honda.com",
  "ford.com",
  "vw.com",
  "nissanusa.com",
  "hyundai.com",
  "kia.com",
  "mazda.com",
  "subaru.com",
]

function isDeadUrl(url?: string): boolean {
  if (!url) return true
  return DEAD_MANUFACTURER_DOMAINS.some((d) => url.toLowerCase().includes(d))
}

function getVehicleFallbackImage(make?: string, category?: string): string {
  const m = (make || "").toLowerCase()
  const c = (category || "").toLowerCase()

  if (m.includes("toyota") || c === "suv") {
    return "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("mercedes")) {
    return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("bmw")) {
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("audi")) {
    return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("nissan")) {
    return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("mazda")) {
    return "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("subaru")) {
    return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("tesla") || c === "ev") {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80"
  }
  if (m.includes("isuzu") || c === "pickup" || m.includes("ford")) {
    return "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80"
  }
  if (c === "sedan") {
    return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80"
  }
  return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80"
}

function VehicleThumbnailCell({ vehicle }: { vehicle: VehicleRecord }) {
  const fallback = getVehicleFallbackImage(vehicle.make, vehicle.category)
  const candidate =
    (!isDeadUrl(vehicle.thumbnailUrl) ? vehicle.thumbnailUrl : null) ||
    (!isDeadUrl(vehicle.imageUrls?.[0]) ? vehicle.imageUrls?.[0] : null) ||
    (!isDeadUrl(vehicle.images?.[0]) ? vehicle.images?.[0] : null) ||
    fallback

  const [src, setSrc] = React.useState<string>(candidate)

  return (
    <div className="relative h-12 w-16 shrink-0 rounded-md overflow-hidden border border-border/80 bg-muted/60 shadow-2xs group">
      <img
        src={src}
        alt={vehicle.title}
        onError={() => {
          if (src !== fallback) {
            setSrc(fallback)
          }
        }}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {vehicle.featured && (
        <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
          <StarIcon className="size-2.5 fill-amber-100 text-amber-100" />
        </span>
      )}
    </div>
  )
}

interface CarsDataTableProps {
  initialData?: VehicleRecord[]
}

export function CarsDataTable({ initialData }: CarsDataTableProps) {
  // Real-time Convex query
  const liveVehicles = useQuery(api.vehicles.list, {})
  const updateStatus = useMutation(api.vehicles.updateStatus)
  const toggleFeatured = useMutation(api.vehicles.toggleFeatured)
  const removeVehicle = useMutation(api.vehicles.remove)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    location: false,
    engine: false,
  })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Use live data if loaded, fallback to initialData, or empty array
  const vehicles = (liveVehicles ?? initialData ?? []) as VehicleRecord[]

  // Client-side filtering
  const filteredData = React.useMemo(() => {
    let result = vehicles

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.registrationNumber && v.registrationNumber.toLowerCase().includes(q)) ||
          (v.city && v.city.toLowerCase().includes(q)) ||
          (v.seller?.name && v.seller.name.toLowerCase().includes(q))
      )
    }

    if (categoryFilter !== "all") {
      result = result.filter((v) => v.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((v) => v.status === statusFilter)
    }

    return result
  }, [vehicles, searchQuery, categoryFilter, statusFilter])

  const columns: ColumnDef<VehicleRecord>[] = React.useMemo(
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
        accessorKey: "title",
        header: "Vehicle",
        cell: ({ row }) => {
          const vehicle = row.original

          return (
            <div className="flex items-center gap-3 min-w-[240px]">
              <VehicleThumbnailCell vehicle={vehicle} />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-sm line-clamp-1">
                  {vehicle.title}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="capitalize font-medium text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </span>
                  {vehicle.registrationNumber && (
                    <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border">
                      {vehicle.registrationNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original.category
          const found = VEHICLE_CATEGORIES.find((c) => c.value === category)
          return (
            <Badge variant="outline" className="capitalize text-xs font-normal">
              {found?.label || category}
            </Badge>
          )
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const v = row.original
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">
                {v.currency} {v.price?.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                {v.negotiable && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Negotiable
                  </span>
                )}
                {v.urgent && (
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                    • Urgent
                  </span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "condition",
        header: "Condition & Badges",
        cell: ({ row }) => {
          const v = row.original
          const conditionLabel =
            v.condition === "locally_used"
              ? "Locally Used"
              : v.condition === "foreign_used"
                ? "Foreign Used"
                : "Brand New"

          return (
            <div className="flex flex-col gap-1 min-w-[150px]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground">{conditionLabel}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {v.mileage?.toLocaleString()} {v.mileageUnit}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {v.accidentFree && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Accident Free
                  </Badge>
                )}
                {v.femaleOwned && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                    Lady Owned
                  </Badge>
                )}
                {v.locallyDriven && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    Locally Driven
                  </Badge>
                )}
                {v.repainted && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    Repainted
                  </Badge>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: "engine",
        header: "Engine & Specs",
        cell: ({ row }) => {
          const v = row.original
          return (
            <div className="flex flex-col text-xs text-muted-foreground">
              <span className="capitalize text-foreground font-medium">
                {v.fuelType} • {v.transmission}
              </span>
              <span>
                {v.engineSizeCc ? `${v.engineSizeCc} CC` : ""} {v.drivetrain ? `• ${v.drivetrain.toUpperCase()}` : ""}
              </span>
            </div>
          )
        },
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => {
          const v = row.original
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{v.city}{v.stateOrCounty ? `, ${v.stateOrCounty}` : ""}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "seller",
        header: "Seller",
        cell: ({ row }) => {
          const seller = row.original.seller
          if (!seller) return <span className="text-xs text-muted-foreground font-mono">Assigned</span>
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{seller.name}</span>
              <span className="text-muted-foreground text-[11px]">{seller.phone || seller.email || "No contact"}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status
          const statusConfig: Record<string, { label: string; className: string }> = {
            active: { label: "Active", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
            sold: { label: "Sold", className: "bg-muted text-muted-foreground" },
            reserved: { label: "Reserved", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
            draft: { label: "Draft", className: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20" },
            pending_approval: { label: "Pending", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
            archived: { label: "Archived", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
          }
          const config = statusConfig[status] || { label: status, className: "" }
          return (
            <Badge variant="outline" className={`capitalize px-2 py-0.5 text-xs font-medium ${config.className}`}>
              {config.label}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const vehicle = row.original

          return (
            <div className="flex items-center gap-1 justify-end">
              <EditCarForm vehicle={vehicle} />

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
                <DropdownMenuContent align="end" className="w-48">
                  {/* Status updates */}
                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(
                        updateStatus({ id: vehicle._id, status: "active" }),
                        {
                          loading: "Setting status to Active...",
                          success: "Listing is now Active",
                          error: "Failed to update status",
                        }
                      )
                    }}
                  >
                    <CheckCircle2Icon className="mr-2 h-4 w-4 text-emerald-500" />
                    Mark as Active
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(
                        updateStatus({ id: vehicle._id, status: "reserved" }),
                        {
                          loading: "Setting status to Reserved...",
                          success: "Listing is now Reserved",
                          error: "Failed to update status",
                        }
                      )
                    }}
                  >
                    <ClockIcon className="mr-2 h-4 w-4 text-amber-500" />
                    Mark as Reserved
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(
                        updateStatus({ id: vehicle._id, status: "sold" }),
                        {
                          loading: "Setting status to Sold...",
                          success: "Listing marked as Sold",
                          error: "Failed to update status",
                        }
                      )
                    }}
                  >
                    <CheckCircle2Icon className="mr-2 h-4 w-4 text-blue-500" />
                    Mark as Sold
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      const nextState = !vehicle.featured
                      toast.promise(
                        toggleFeatured({ id: vehicle._id, featured: nextState }),
                        {
                          loading: "Updating featured status...",
                          success: nextState ? "Marked as Featured" : "Unmarked Featured",
                          error: "Failed to toggle featured",
                        }
                      )
                    }}
                  >
                    <StarIcon className={`mr-2 h-4 w-4 ${vehicle.featured ? "text-amber-500 fill-amber-500" : ""}`} />
                    {vehicle.featured ? "Remove Featured" : "Make Featured"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      if (!confirm(`Are you sure you want to delete ${vehicle.title}? This will also remove all its stored images and inquiries.`)) {
                        return
                      }
                      toast.promise(
                        removeVehicle({ id: vehicle._id }),
                        {
                          loading: "Deleting vehicle and cleaning up images...",
                          success: "Vehicle listing deleted successfully",
                          error: (err: any) => err?.message || "Failed to delete vehicle",
                        }
                      )
                    }}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete Vehicle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [updateStatus, toggleFeatured, removeVehicle]
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
      {/* Top Filter and Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by title, make, model, plate, city..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-72"
          />

          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val ?? "all")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                {VEHICLE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
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

          <AddCarForm />
        </div>
      </div>

      {/* Main Table */}
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
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CarIcon className="size-8 text-muted-foreground/50" />
                    <p className="font-medium">No vehicle listings found</p>
                    <p className="text-xs text-muted-foreground">
                      Click &ldquo;Add Vehicle&rdquo; to create your first listing with images, specs, and badges.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xs">Rows per page</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-xs font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
