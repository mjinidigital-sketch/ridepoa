import { action, internalMutation, mutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

// Called directly from the frontend (ConvexClientProvider) on every sign-in.
// Upserts the user by clerkId so it is idempotent.
export const storeUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        phone: v.string(),
        role: v.string(),
    },
    async handler(ctx, args) {
        // Try to find existing user by clerkId
        const existing = await ctx.db
            .query("users")
            .withIndex("byExternalId", (q) => q.eq("externalId", args.clerkId))
            .unique();

        if (existing !== null) {
            // Update existing user
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
                phone: args.phone,
                role: args.role,
                clerkId: args.clerkId,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        // Insert new user
        const id = await ctx.db.insert("users", {
            name: args.name,
            externalId: args.clerkId,   // used by byExternalId index
            clerkId: args.clerkId,
            email: args.email,
            imageUrl: args.imageUrl,
            phone: args.phone,
            role: args.role,
            status: "Active",
            ridesCount: 0,
            verified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        return id;
    },
});

export const current = query({
    args: {},
    handler: async (ctx) => {
        return await getCurrentUser(ctx);
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const upsertFromClerk = internalMutation({
    args: { data: v.any() as Validator<UserJSON> }, // trust Clerk payload
    async handler(ctx, { data }) {
        const primaryEmail =
            data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id)?.email_address ||
            data.email_addresses?.[0]?.email_address ||
            "";

        const primaryPhone =
            data.phone_numbers?.find((p: any) => p.id === data.primary_phone_number_id)?.phone_number ||
            data.phone_numbers?.[0]?.phone_number ||
            "";

        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || "User";
        const role = (data.public_metadata as any)?.role || "user";

        const userAttributes = {
            name: fullName,
            externalId: data.id,
            clerkId: data.id,
            email: primaryEmail,
            phone: primaryPhone,
            imageUrl: data.image_url || "",
            role: role,
            updatedAt: Date.now(),
        };

        const user = await userByExternalId(ctx, data.id);
        if (user === null) {
            await ctx.db.insert("users", {
                ...userAttributes,
                status: "Active",
                ridesCount: 0,
                verified: true,
                createdAt: data.created_at || Date.now(),
            });
        } else {
            await ctx.db.patch(user._id, userAttributes);
        }
    },
});

export const deleteFromClerk = internalMutation({
    args: { clerkUserId: v.string() },
    async handler(ctx, { clerkUserId }) {
        const user = await userByExternalId(ctx, clerkUserId);

        if (user !== null) {
            await ctx.db.delete(user._id);
        } else {
            console.warn(
                `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
            );
        }
    },
});

// Public mutation — called from the frontend when a user deletes their own account
export const deleteCurrentUser = mutation({
    args: {},
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const user = await userByExternalId(ctx, identity.subject);
        if (!user) throw new Error("User not found in Convex");
        await ctx.db.delete(user._id);
    },
});

// Convex Action: Update Clerk user profile (name and/or role in Clerk Backend API)
export const updateClerkUser = action({
    args: {
        clerkUserId: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        role: v.optional(v.string()),
    },
    handler: async (ctx, { clerkUserId, firstName, lastName, role }) => {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured in Convex environment");

        const body: Record<string, any> = {};
        if (firstName !== undefined) body.first_name = firstName;
        if (lastName !== undefined) body.last_name = lastName;
        if (role !== undefined) body.public_metadata = { role };

        const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error?.errors?.[0]?.message || "Failed to update user in Clerk");
        }

        return await response.json();
    },
});

// Convex Action: Update Clerk user's role specifically in public_metadata
export const updateClerkUserRole = action({
    args: {
        clerkUserId: v.string(),
        role: v.string(),
    },
    handler: async (ctx, { clerkUserId, role }) => {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured in Convex environment");

        const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}/metadata`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                public_metadata: { role },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error?.errors?.[0]?.message || "Failed to update role in Clerk");
        }

        return await response.json();
    },
});

// Convex Action: Create a user in Clerk
export const createClerkUser = action({
    args: {
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        password: v.optional(v.string()),
        role: v.string(),
    },
    handler: async (ctx, { firstName, lastName, email, password, role }) => {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured in Convex environment");

        const payload: Record<string, any> = {
            first_name: firstName,
            last_name: lastName,
            email_address: [email],
            public_metadata: { role },
        };
        if (password) payload.password = password;

        const response = await fetch("https://api.clerk.com/v1/users", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error?.errors?.[0]?.message || "Failed to create user in Clerk");
        }

        return await response.json();
    },
});

// Convex Action: Delete a user from Clerk
export const deleteClerkUser = action({
    args: {
        clerkUserId: v.string(),
    },
    handler: async (ctx, { clerkUserId }) => {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (!secretKey) throw new Error("CLERK_SECRET_KEY is not configured in Convex environment");

        const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error?.errors?.[0]?.message || "Failed to delete user in Clerk");
        }

        return await response.json();
    },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
    const userRecord = await getCurrentUser(ctx);
    if (!userRecord) throw new Error("Can't get current user");
    return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        return null;
    }
    return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
    return await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
        .unique();
}