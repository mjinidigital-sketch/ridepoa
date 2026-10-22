"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export type UserRole = "admin" | "staff" | "user" | "customer"

async function verifyAdmin() {
    const user = await currentUser()
    if (!user) {
        throw new Error("Unauthorized: Please sign in")
    }
    const role =
        (user.publicMetadata as Record<string, any>)?.role ||
        (user.unsafeMetadata as Record<string, any>)?.role

    if (role !== "admin") {
        throw new Error("Forbidden: Admin privileges required")
    }
    return user
}

export async function getUsers() {
    await verifyAdmin()
    const client = await clerkClient()
    const response = await client.users.getUserList({
        limit: 100,
        orderBy: "-created_at",
    })

    return response.data.map((u) => {
        const primaryEmail =
            u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ||
            u.emailAddresses[0]?.emailAddress ||
            ""

        const primaryPhone =
            u.phoneNumbers?.find((p) => p.id === u.primaryPhoneNumberId)?.phoneNumber ||
            u.phoneNumbers?.[0]?.phoneNumber ||
            ((u.publicMetadata as Record<string, any>)?.phone as string) ||
            ""

        const name =
            [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
            u.username ||
            "User"

        const role = ((u.publicMetadata as Record<string, any>)?.role as UserRole) || "user"

        return {
            _id: u.id,
            clerkId: u.id,
            name,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: primaryEmail,
            phone: primaryPhone,
            role,
            image: u.imageUrl,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            lastLoginAt: u.lastSignInAt || undefined,
            isActive: !u.banned,
        }
    })
}

export async function createUser(data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password?: string
    role: string
}) {
    await verifyAdmin()
    const client = await clerkClient()

    const newUser = await client.users.createUser({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        emailAddress: [data.email.trim()],
        password: data.password?.trim() || undefined,
        publicMetadata: {
            role: data.role || "user",
            phone: data.phone?.trim() || undefined,
        },
    })

    revalidatePath("/admin/users")
    return { success: true, userId: newUser.id }
}

export async function updateUser(
    userId: string,
    data: {
        firstName?: string
        lastName?: string
        phone?: string
        role?: string
    }
) {
    await verifyAdmin()
    const client = await clerkClient()

    const updatePayload: Record<string, any> = {}
    if (data.firstName !== undefined) updatePayload.firstName = data.firstName.trim()
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName.trim()

    if (Object.keys(updatePayload).length > 0) {
        await client.users.updateUser(userId, updatePayload)
    }

    const metadataUpdates: Record<string, any> = {}
    if (data.role !== undefined) metadataUpdates.role = data.role
    if (data.phone !== undefined) metadataUpdates.phone = data.phone.trim()

    if (Object.keys(metadataUpdates).length > 0) {
        await client.users.updateUserMetadata(userId, {
            publicMetadata: metadataUpdates,
        })
    }

    revalidatePath("/admin/users")
    return { success: true }
}

export async function updateUserRole(userId: string, role: string) {
    await verifyAdmin()
    const client = await clerkClient()

    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            role,
        },
    })

    revalidatePath("/admin/users")
    return { success: true }
}

export async function deleteUser(userId: string) {
    await verifyAdmin()
    const client = await clerkClient()

    await client.users.deleteUser(userId)

    revalidatePath("/admin/users")
    return { success: true }
}

