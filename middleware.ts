import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/cars(.*)",
  "/buy-a-car(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/tasks(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth()

    // 1. If not authenticated, protect will redirect to Clerk sign in
    if (!userId) {
      await auth.protect()
      return
    }

    // 2. Check metadata role from session claims
    const claims = sessionClaims as Record<string, any> | undefined
    let role =
      claims?.metadata?.role ||
      claims?.publicMetadata?.role ||
      claims?.public_metadata?.role ||
      claims?.role

    // 3. Fallback: if role not present in claims, fetch from Clerk API
    if (!role) {
      try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        role =
          (user.publicMetadata as Record<string, any>)?.role ||
          (user.unsafeMetadata as Record<string, any>)?.role
      } catch (err) {
        console.error("Failed to fetch user metadata in middleware", err)
      }
    }

    // 4. Deny access if role is not admin
    if (role !== "admin") {
      const homeUrl = new URL("/", request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
