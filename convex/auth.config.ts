export default {
    providers: [
        {
            domain: process.env.CLERK_FRONTEND_API_URL || "https://dashing-flamingo-338.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
