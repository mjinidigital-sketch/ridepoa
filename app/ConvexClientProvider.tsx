'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { ConvexReactClient, useMutation } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

function UserSync() {
    const { isSignedIn, user } = useUser()
    const storeUser = useMutation(api.users.storeUser)
    const syncedRef = useRef<string | null>(null)

    useEffect(() => {
        if (!isSignedIn || !user) {
            syncedRef.current = null
            return
        }

        // Avoid repeated syncing for the same user session
        if (syncedRef.current === user.id) return

        const clerkId = user.id
        const email = user.primaryEmailAddress?.emailAddress || ""
        const name =
            user.fullName ||
            user.username ||
            (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User")
        const imageUrl = user.imageUrl || ""
        const phone = user.primaryPhoneNumber?.phoneNumber || ""
        const role = (user.publicMetadata as any)?.role || "buyer"

        storeUser({
            clerkId,
            name,
            email,
            imageUrl,
            phone,
            role,
        })
            .then(() => {
                syncedRef.current = user.id
            })
            .catch((err) => {
                console.error("Failed to sync user to Convex:", err)
            })
    }, [isSignedIn, user, storeUser])

    return null
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <UserSync />
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}