"use client"

import * as React from "react"
import { toast } from "sonner"
import { PencilIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { updateUser } from "@/app/actions"

interface EditUserFormProps {
  user: {
    _id: string
    clerkId?: string
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    role?: string
  }
  onSuccess?: () => void
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Split name if firstName/lastName not provided directly
  const defaultFirst = user.firstName || (user.name ? user.name.split(" ")[0] : "")
  const defaultLast = user.lastName || (user.name ? user.name.split(" ").slice(1).join(" ") : "")

  const [formData, setFormData] = React.useState({
    firstName: defaultFirst,
    lastName: defaultLast,
    phone: user.phone || "",
    role: user.role || "user",
  })

  React.useEffect(() => {
    setFormData({
      firstName: user.firstName || (user.name ? user.name.split(" ")[0] : ""),
      lastName: user.lastName || (user.name ? user.name.split(" ").slice(1).join(" ") : ""),
      phone: user.phone || "",
      role: user.role || "user",
    })
  }, [user, open])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetUserId = user.clerkId || user._id
    if (!targetUserId) {
      toast.error("User ID is missing")
      return
    }

    setIsLoading(true)
    try {
      await updateUser(targetUserId, formData)
      toast.success("User updated successfully in Clerk!")
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user in Clerk")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Edit user"
          />
        }
      >
        <PencilIcon className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update user credentials and role in Clerk.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between p-6 pt-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3 text-xs">
              <span className="font-semibold text-foreground">Email: {user.email || "N/A"}</span>
              <span className="font-mono text-muted-foreground">Clerk ID: {user.clerkId || user._id}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+254 712 345 678"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-role">Role (Clerk Public Metadata)</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => handleChange("role", val ?? "user")}
              >
                <SelectTrigger id="edit-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="mt-8 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
