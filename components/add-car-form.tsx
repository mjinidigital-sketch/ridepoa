"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  PlusCircleIcon,
  Loader2Icon,
  CarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  GaugeIcon,
  TagIcon,
  WrenchIcon,
  UploadCloudIcon,
  XIcon,
  ImageIcon,
  SparklesIcon,
  PhoneIcon,
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export const VEHICLE_CATEGORIES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
  { value: "lorry", label: "Lorry / Truck" },
  { value: "ev", label: "Electric Vehicle (EV)" },
  { value: "bike", label: "Motorbike" },
  { value: "farm_equipment", label: "Farm Equipment / Tractor" },
  { value: "bus", label: "Bus" },
  { value: "minibus", label: "Mini Bus (Matatu)" },
  { value: "van", label: "Van" },
  { value: "station_wagon", label: "Station Wagon" },
  { value: "hatchback", label: "Hatchback" },
  { value: "coupe", label: "Coupe" },
  { value: "convertible", label: "Convertible" },
  { value: "heavy_machinery", label: "Heavy Machinery" },
  { value: "other", label: "Other" },
] as const

interface AddCarFormProps {
  onSuccess?: () => void
}

interface UploadedMediaItem {
  storageId: string
  previewUrl: string
}

export function AddCarForm({ onSuccess }: AddCarFormProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)

  // Convex mutations and queries
  const createVehicle = useMutation(api.vehicles.create)
  const generateUploadUrl = useMutation(api.vehicles.generateUploadUrl)
  const users = useQuery(api.vehicles.getUsersForSelect)

  // Uploaded media items list (stores Convex storageId and local preview URL)
  const [mediaList, setMediaList] = React.useState<UploadedMediaItem[]>([])
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Form State
  const [formData, setFormData] = React.useState({
    userId: "" as string,
    title: "",
    category: "suv",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    trim: "",
    bodyType: "",
    registrationNumber: "",
    vinOrChassisNumber: "",

    price: "",
    currency: "KES",
    negotiable: true,
    listingType: "sell",
    status: "active",
    featured: false,
    urgent: false,

    condition: "locally_used",
    mileage: "",
    mileageUnit: "km",
    locallyDriven: true,
    femaleOwned: false,
    accidentFree: true,
    repainted: false,
    originalPaint: true,
    dutyPaid: true,
    logbookAvailable: true,
    numberOfPreviousOwners: "1",
    serviceHistory: "full",

    fuelType: "petrol",
    transmission: "automatic",
    drivetrain: "4wd",
    engineSizeCc: "",
    horsepower: "",
    fuelConsumption: "",

    batteryCapacityKwh: "",
    electricRangeKm: "",
    chargingTimeHours: "",
    seatingCapacity: "",
    payloadCapacityKg: "",
    towingCapacityKg: "",
    operatingHours: "",

    exteriorColor: "White",
    interiorColor: "Black",
    interiorMaterial: "leather",
    doorsCount: "5",
    features: "Sunroof, Reverse Camera, Bluetooth, Keyless Entry, Fog Lights, Alloy Wheels",

    city: "Nairobi",
    stateOrCounty: "Nairobi",
    country: "Kenya",
    address: "",
    latitude: "",
    longitude: "",

    description: "",
    sellerContactPhone: "",
    sellerContactWhatsApp: "",
  })

  // Set default user once loaded
  React.useEffect(() => {
    if (users && users.length > 0 && !formData.userId) {
      setFormData((prev) => ({ ...prev, userId: users[0]._id }))
    }
  }, [users, formData.userId])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle direct file upload to Convex Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newItems: UploadedMediaItem[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const postUrl = await generateUploadUrl()
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!result.ok) {
          throw new Error(`Upload failed for file: ${file.name}`)
        }

        const { storageId } = await result.json()
        const previewUrl = URL.createObjectURL(file)
        newItems.push({ storageId, previewUrl })
      }

      setMediaList((prev) => [...prev, ...newItems])
      toast.success(`${newItems.length} photo(s) uploaded successfully!`)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Error uploading images to Convex")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.userId) {
      toast.error("Please assign a seller / owner for this vehicle.")
      return
    }

    if (!formData.title || !formData.make || !formData.model || !formData.price) {
      toast.error("Please fill in Title, Make, Model, and Price.")
      return
    }

    setIsLoading(true)

    try {
      const parsedFeatures = formData.features
        ? formData.features.split(",").map((f: string) => f.trim()).filter(Boolean)
        : []

      const storageIds = mediaList.map((m) => m.storageId)

      await createVehicle({
        userId: formData.userId as Id<"users">,
        title: formData.title,
        category: formData.category as any,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year) || new Date().getFullYear(),
        trim: formData.trim || undefined,
        bodyType: formData.bodyType || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        vinOrChassisNumber: formData.vinOrChassisNumber || undefined,

        price: Number(formData.price) || 0,
        currency: formData.currency,
        negotiable: Boolean(formData.negotiable),
        listingType: formData.listingType as any,
        status: formData.status as any,
        featured: Boolean(formData.featured),
        urgent: Boolean(formData.urgent),

        condition: formData.condition as any,
        mileage: Number(formData.mileage) || 0,
        mileageUnit: formData.mileageUnit as any,
        locallyDriven: Boolean(formData.locallyDriven),
        femaleOwned: Boolean(formData.femaleOwned),
        accidentFree: Boolean(formData.accidentFree),
        repainted: Boolean(formData.repainted),
        originalPaint: Boolean(formData.originalPaint),
        dutyPaid: Boolean(formData.dutyPaid),
        logbookAvailable: Boolean(formData.logbookAvailable),
        numberOfPreviousOwners: formData.numberOfPreviousOwners ? Number(formData.numberOfPreviousOwners) : undefined,
        serviceHistory: (formData.serviceHistory as any) || undefined,

        fuelType: formData.fuelType as any,
        transmission: formData.transmission as any,
        drivetrain: (formData.drivetrain as any) || undefined,
        engineSizeCc: formData.engineSizeCc ? Number(formData.engineSizeCc) : undefined,
        horsepower: formData.horsepower ? Number(formData.horsepower) : undefined,
        fuelConsumption: formData.fuelConsumption || undefined,

        batteryCapacityKwh: formData.batteryCapacityKwh ? Number(formData.batteryCapacityKwh) : undefined,
        electricRangeKm: formData.electricRangeKm ? Number(formData.electricRangeKm) : undefined,
        chargingTimeHours: formData.chargingTimeHours ? Number(formData.chargingTimeHours) : undefined,
        seatingCapacity: formData.seatingCapacity ? Number(formData.seatingCapacity) : undefined,
        payloadCapacityKg: formData.payloadCapacityKg ? Number(formData.payloadCapacityKg) : undefined,
        towingCapacityKg: formData.towingCapacityKg ? Number(formData.towingCapacityKg) : undefined,
        operatingHours: formData.operatingHours ? Number(formData.operatingHours) : undefined,

        exteriorColor: formData.exteriorColor || "Unknown",
        interiorColor: formData.interiorColor || undefined,
        interiorMaterial: (formData.interiorMaterial as any) || undefined,
        doorsCount: formData.doorsCount ? Number(formData.doorsCount) : undefined,

        features: parsedFeatures,

        city: formData.city || "Nairobi",
        stateOrCounty: formData.stateOrCounty || undefined,
        country: formData.country || "Kenya",
        address: formData.address || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,

        // Direct Convex storage IDs
        images: storageIds,
        thumbnailUrl: storageIds.length > 0 ? storageIds[0] : undefined,

        description: formData.description || `${formData.year} ${formData.make} ${formData.model} in pristine condition.`,
        sellerContactPhone: formData.sellerContactPhone || undefined,
        sellerContactWhatsApp: formData.sellerContactWhatsApp || undefined,
        allowWhatsAppChat: true,
      })

      toast.success("Vehicle listing created successfully!")
      setOpen(false)
      setMediaList([])
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to create vehicle listing")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm" className="gap-2 shadow-xs">
            <PlusCircleIcon className="h-4 w-4" />
            Add Vehicle
          </Button>
        }
      />
      <SheetContent
        side="right"
        className="w-full sm:w-[95vw] md:w-[90vw] lg:w-[85vw] max-w-[1280px] sm:!max-w-[1280px] data-[side=right]:!max-w-[1280px] overflow-y-auto p-0 flex flex-col"
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* Header */}
          <SheetHeader className="p-6 md:p-8 border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <CarIcon className="size-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold tracking-tight">Add Vehicle Listing</SheetTitle>
                <SheetDescription className="text-sm mt-0.5">
                  Upload photos to storage, specify vehicle details, condition badges, and assign to seller.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Body with generous vertical spacing */}
          <div className="p-6 md:p-8 space-y-8 flex-1">
            {/* 1. PHOTO UPLOAD SECTION */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5 font-semibold text-base text-foreground">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <ImageIcon className="size-4" />
                  </div>
                  <span>Vehicle Photos & Media</span>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border">
                  {mediaList.length} photo(s) in storage
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="car-photo-upload"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-input hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-muted/20 hover:bg-muted/40 text-center"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2Icon className="h-8 w-8 animate-spin" />
                    <span className="text-sm font-semibold">Uploading to Convex Storage...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <UploadCloudIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Click or drag photos here to upload</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High resolution images are securely saved into Convex Storage as storageID
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails grid */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                  {mediaList.map((item, idx) => (
                    <div
                      key={item.storageId}
                      className="relative group rounded-lg overflow-hidden border aspect-video bg-muted shadow-xs"
                    >
                      <img
                        src={item.previewUrl}
                        alt={`Vehicle photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-[10px] text-white px-2 py-0.5 rounded font-medium shadow-xs">
                          Cover Photo
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                        title="Remove photo"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. IDENTITY & CLASSIFICATION */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <TagIcon className="size-4" />
                </div>
                <span>1. Vehicle Identity & Classification</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="userId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned Seller / Owner *
                  </Label>
                  <Select
                    value={formData.userId || undefined}
                    onValueChange={(val) => handleChange("userId", val ?? "")}
                  >
                    <SelectTrigger id="userId" className="w-full h-9">
                      <SelectValue placeholder="Select a registered user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <SelectItem key={u._id} value={u._id}>
                              {u.name} ({u.email || u.phone || u.role})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No users found
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Listing Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. 2021 Toyota Land Cruiser Prado TX-L"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => handleChange("category", val)}
                  >
                    <SelectTrigger id="category" className="w-full h-9">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {VEHICLE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Manufacture Year *
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Make / Brand *
                  </Label>
                  <Input
                    id="make"
                    placeholder="e.g. Toyota, Tesla, Isuzu"
                    value={formData.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Model *
                  </Label>
                  <Input
                    id="model"
                    placeholder="e.g. Prado, Model Y, D-Max"
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trim" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trim / Package
                  </Label>
                  <Input
                    id="trim"
                    placeholder="e.g. TX-L, Limited, AMG-Line"
                    value={formData.trim}
                    onChange={(e) => handleChange("trim", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Number Plate / Reg
                  </Label>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g. KDA 123X"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. PRICING & MODALITY */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <SparklesIcon className="size-4" />
                </div>
                <span>2. Pricing & Listing Status</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Asking Price *
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.currency}
                      onValueChange={(val) => handleChange("currency", val)}
                    >
                      <SelectTrigger className="w-28 h-9 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 4500000"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="h-9 font-semibold text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Listing Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleChange("status", val)}
                  >
                    <SelectTrigger id="status" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="negotiable"
                    checked={formData.negotiable}
                    onCheckedChange={(val) => handleChange("negotiable", val)}
                  />
                  <Label htmlFor="negotiable" className="cursor-pointer text-sm font-medium">
                    Price Negotiable
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(val) => handleChange("featured", val)}
                  />
                  <Label htmlFor="featured" className="cursor-pointer text-sm font-medium">
                    Featured Listing
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(val) => handleChange("urgent", val)}
                  />
                  <Label htmlFor="urgent" className="cursor-pointer text-sm font-medium text-destructive">
                    Urgent Sale Tag
                  </Label>
                </div>
              </div>
            </div>

            {/* 4. CONDITION & BUYER BADGES */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheckIcon className="size-4" />
                </div>
                <span>3. Condition & Provenance (Buyer Badges)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vehicle Condition *
                  </Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(val) => handleChange("condition", val)}
                  >
                    <SelectTrigger id="condition" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="locally_used">Locally Used</SelectItem>
                      <SelectItem value="foreign_used">Foreign Used (Import)</SelectItem>
                      <SelectItem value="brand_new">Brand New (Zero KM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mileage" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mileage *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="e.g. 54000"
                      value={formData.mileage}
                      onChange={(e) => handleChange("mileage", e.target.value)}
                      className="h-9 font-mono"
                      required
                    />
                    <Select
                      value={formData.mileageUnit}
                      onValueChange={(val) => handleChange("mileageUnit", val)}
                    >
                      <SelectTrigger className="w-24 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">KM</SelectItem>
                        <SelectItem value="miles">Miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousOwners" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Previous Owners
                  </Label>
                  <Input
                    id="previousOwners"
                    type="number"
                    min="0"
                    value={formData.numberOfPreviousOwners}
                    onChange={(e) => handleChange("numberOfPreviousOwners", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="serviceHistory" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Service History
                  </Label>
                  <Select
                    value={formData.serviceHistory}
                    onValueChange={(val) => handleChange("serviceHistory", val)}
                  >
                    <SelectTrigger id="serviceHistory" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Dealership / Service History</SelectItem>
                      <SelectItem value="partial">Partial Records</SelectItem>
                      <SelectItem value="none">No Records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Provenance Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 p-4 bg-muted/30 rounded-xl border">
                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="locallyDriven"
                    checked={formData.locallyDriven}
                    onCheckedChange={(val) => handleChange("locallyDriven", val)}
                  />
                  <Label htmlFor="locallyDriven" className="cursor-pointer text-xs font-medium">
                    Locally Driven
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="femaleOwned"
                    checked={formData.femaleOwned}
                    onCheckedChange={(val) => handleChange("femaleOwned", val)}
                  />
                  <Label htmlFor="femaleOwned" className="cursor-pointer text-xs font-medium text-purple-600 dark:text-purple-400">
                    Lady Owned / Driven
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="accidentFree"
                    checked={formData.accidentFree}
                    onCheckedChange={(val) => handleChange("accidentFree", val)}
                  />
                  <Label htmlFor="accidentFree" className="cursor-pointer text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    100% Accident Free
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="originalPaint"
                    checked={formData.originalPaint}
                    onCheckedChange={(val) => handleChange("originalPaint", val)}
                  />
                  <Label htmlFor="originalPaint" className="cursor-pointer text-xs font-medium">
                    Original Paint
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="repainted"
                    checked={formData.repainted}
                    onCheckedChange={(val) => handleChange("repainted", val)}
                  />
                  <Label htmlFor="repainted" className="cursor-pointer text-xs font-medium">
                    Repainted Panels
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="dutyPaid"
                    checked={formData.dutyPaid}
                    onCheckedChange={(val) => handleChange("dutyPaid", val)}
                  />
                  <Label htmlFor="dutyPaid" className="cursor-pointer text-xs font-medium">
                    Duty & Taxes Paid
                  </Label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Checkbox
                    id="logbookAvailable"
                    checked={formData.logbookAvailable}
                    onCheckedChange={(val) => handleChange("logbookAvailable", val)}
                  />
                  <Label htmlFor="logbookAvailable" className="cursor-pointer text-xs font-medium">
                    Logbook Ready
                  </Label>
                </div>
              </div>
            </div>

            {/* 5. ENGINE, TRANSMISSION & SPECS */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <GaugeIcon className="size-4" />
                </div>
                <span>4. Engine, Powertrain & Performance</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fuelType" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Fuel Type *
                  </Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(val) => handleChange("fuelType", val)}
                  >
                    <SelectTrigger id="fuelType" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric (EV)</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                      <SelectItem value="cng_lpg">CNG / LPG</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Transmission *
                  </Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(val) => handleChange("transmission", val)}
                  >
                    <SelectTrigger id="transmission" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="cvt">CVT</SelectItem>
                      <SelectItem value="dual_clutch">Dual Clutch</SelectItem>
                      <SelectItem value="semi_automatic">Semi-Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivetrain" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Drivetrain
                  </Label>
                  <Select
                    value={formData.drivetrain}
                    onValueChange={(val) => handleChange("drivetrain", val)}
                  >
                    <SelectTrigger id="drivetrain" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4wd">4WD (Four-Wheel Drive)</SelectItem>
                      <SelectItem value="awd">AWD (All-Wheel Drive)</SelectItem>
                      <SelectItem value="fwd">FWD (Front-Wheel Drive)</SelectItem>
                      <SelectItem value="rwd">RWD (Rear-Wheel Drive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engineSizeCc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Displacement (CC)
                  </Label>
                  <Input
                    id="engineSizeCc"
                    type="number"
                    placeholder="e.g. 2700"
                    value={formData.engineSizeCc}
                    onChange={(e) => handleChange("engineSizeCc", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horsepower" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Horsepower (HP)
                  </Label>
                  <Input
                    id="horsepower"
                    type="number"
                    placeholder="e.g. 163"
                    value={formData.horsepower}
                    onChange={(e) => handleChange("horsepower", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelConsumption" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Fuel Consumption
                  </Label>
                  <Input
                    id="fuelConsumption"
                    placeholder="e.g. 13.5 km/L"
                    value={formData.fuelConsumption}
                    onChange={(e) => handleChange("fuelConsumption", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Category-Specific Specs */}
              {(formData.category === "ev" ||
                formData.category === "lorry" ||
                formData.category === "farm_equipment" ||
                formData.category === "bus" ||
                formData.category === "minibus" ||
                formData.category === "van" ||
                formData.category === "pickup") && (
                <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category-Specific Specs
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {formData.category === "ev" && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="batteryCapacityKwh" className="text-xs font-medium">
                            Battery Capacity (kWh)
                          </Label>
                          <Input
                            id="batteryCapacityKwh"
                            type="number"
                            placeholder="e.g. 75"
                            value={formData.batteryCapacityKwh}
                            onChange={(e) => handleChange("batteryCapacityKwh", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="electricRangeKm" className="text-xs font-medium">
                            Electric Range (KM)
                          </Label>
                          <Input
                            id="electricRangeKm"
                            type="number"
                            placeholder="e.g. 450"
                            value={formData.electricRangeKm}
                            onChange={(e) => handleChange("electricRangeKm", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="chargingTimeHours" className="text-xs font-medium">
                            Charging Time (Hrs)
                          </Label>
                          <Input
                            id="chargingTimeHours"
                            type="number"
                            placeholder="e.g. 6.5"
                            value={formData.chargingTimeHours}
                            onChange={(e) => handleChange("chargingTimeHours", e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </>
                    )}

                    {(formData.category === "bus" || formData.category === "minibus" || formData.category === "van") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="seatingCapacity" className="text-xs font-medium">
                          Seating Capacity
                        </Label>
                        <Input
                          id="seatingCapacity"
                          type="number"
                          placeholder="e.g. 14 or 33 or 50"
                          value={formData.seatingCapacity}
                          onChange={(e) => handleChange("seatingCapacity", e.target.value)}
                          className="h-9"
                        />
                      </div>
                    )}

                    {(formData.category === "lorry" || formData.category === "pickup") && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="payloadCapacityKg" className="text-xs font-medium">
                            Payload Capacity (KG)
                          </Label>
                          <Input
                            id="payloadCapacityKg"
                            type="number"
                            placeholder="e.g. 3500"
                            value={formData.payloadCapacityKg}
                            onChange={(e) => handleChange("payloadCapacityKg", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="towingCapacityKg" className="text-xs font-medium">
                            Towing Capacity (KG)
                          </Label>
                          <Input
                            id="towingCapacityKg"
                            type="number"
                            placeholder="e.g. 3500"
                            value={formData.towingCapacityKg}
                            onChange={(e) => handleChange("towingCapacityKg", e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </>
                    )}

                    {formData.category === "farm_equipment" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="operatingHours" className="text-xs font-medium">
                          Operating Hours (Hrs)
                        </Label>
                        <Input
                          id="operatingHours"
                          type="number"
                          placeholder="e.g. 1200"
                          value={formData.operatingHours}
                          onChange={(e) => handleChange("operatingHours", e.target.value)}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 6. COSMETICS & FEATURES */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <WrenchIcon className="size-4" />
                </div>
                <span>5. Styling & Equipment Features</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="exteriorColor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Exterior Color *
                  </Label>
                  <Input
                    id="exteriorColor"
                    placeholder="e.g. Pearl White"
                    value={formData.exteriorColor}
                    onChange={(e) => handleChange("exteriorColor", e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interiorColor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Interior Color
                  </Label>
                  <Input
                    id="interiorColor"
                    placeholder="e.g. Beige, Black"
                    value={formData.interiorColor}
                    onChange={(e) => handleChange("interiorColor", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interiorMaterial" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Interior Material
                  </Label>
                  <Select
                    value={formData.interiorMaterial}
                    onValueChange={(val) => handleChange("interiorMaterial", val)}
                  >
                    <SelectTrigger id="interiorMaterial" className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leather">Leather</SelectItem>
                      <SelectItem value="fabric">Fabric</SelectItem>
                      <SelectItem value="synthetic">Synthetic / Vinyl</SelectItem>
                      <SelectItem value="alcantara">Alcantara</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="features" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Features (comma-separated tags)
                  </Label>
                  <Input
                    id="features"
                    placeholder="e.g. Sunroof, Reverse Camera, Leather Seats, Apple CarPlay, 4x4 Selector, Push to Start"
                    value={formData.features}
                    onChange={(e) => handleChange("features", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* 7. LOCATION & GEOCODING */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <MapPinIcon className="size-4" />
                </div>
                <span>6. Location & GPS Coordinates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    City / Town *
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Nairobi"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stateOrCounty" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    County / Region
                  </Label>
                  <Input
                    id="stateOrCounty"
                    placeholder="e.g. Nairobi County"
                    value={formData.stateOrCounty}
                    onChange={(e) => handleChange("stateOrCounty", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Country
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g. Kenya"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. -1.2921"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 36.8219"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Address / Showroom
                  </Label>
                  <Input
                    id="address"
                    placeholder="e.g. Kiambu Road, Nairobi"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* 8. CONTACT & DESCRIPTION */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-5 md:p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 font-semibold text-base text-foreground border-b pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <PhoneIcon className="size-4" />
                </div>
                <span>7. Seller Contacts & Narrative Overview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="sellerContactPhone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Direct Phone Number
                  </Label>
                  <Input
                    id="sellerContactPhone"
                    placeholder="e.g. +254 712 345 678"
                    value={formData.sellerContactPhone}
                    onChange={(e) => handleChange("sellerContactPhone", e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellerContactWhatsApp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    WhatsApp Chat Number
                  </Label>
                  <Input
                    id="sellerContactWhatsApp"
                    placeholder="e.g. +254 712 345 678"
                    value={formData.sellerContactWhatsApp}
                    onChange={(e) => handleChange("sellerContactWhatsApp", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vehicle Description & Seller Notes
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe vehicle condition, upgrades, maintenance history, reason for selling..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <SheetFooter className="p-6 md:p-8 border-t bg-muted/20 gap-3 sticky bottom-0 z-10 backdrop-blur-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading || isUploading}
              className="h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="gap-2 h-10 px-6 font-semibold"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              Publish Vehicle Listing
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
