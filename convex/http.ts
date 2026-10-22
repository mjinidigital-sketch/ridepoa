import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
    path: "/clerk-users-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        console.log("Webhook received:", request.method, request.url);
        const event = await validateRequest(request);
        if (!event) {
            console.error("Webhook validation failed - check CLERK_WEBHOOK_SECRET in Convex dashboard");
            return new Response("Error occured", { status: 400 });
        }
        console.log("Webhook event type:", event.type);
        switch (event.type) {
            case "user.created": // intentional fallthrough
            case "user.updated":
                console.log("Upserting user from Clerk:", (event.data as any).id);
                await ctx.runMutation(internal.users.upsertFromClerk, {
                    data: event.data,
                });
                break;

            case "user.deleted": {
                const clerkUserId = event.data.id!;
                await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
                break;
            }
            default:
                console.log("Ignored Clerk webhook event", event.type);
        }

        return new Response(null, { status: 200 });
    }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
    const payloadString = await req.text();
    const svixHeaders = {
        "svix-id": req.headers.get("svix-id")!,
        "svix-timestamp": req.headers.get("svix-timestamp")!,
        "svix-signature": req.headers.get("svix-signature")!,
    };
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("CLERK_WEBHOOK_SECRET environment variable is not set.");
    }
    const wh = new Webhook(secret);
    try {
        return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
    } catch (error) {
        console.error("Error verifying webhook event", error);
        return null;
    }
}

export default http;