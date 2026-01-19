// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1️⃣ Define the routes you want to protect
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
]);

// 2️⃣ Middleware function
export default clerkMiddleware((auth, req) => {
  // If route is protected and user is NOT signed in, redirect to /sign-in
  if (isProtectedRoute(req) && !auth().userId) {
    return auth().redirectToSignIn();
  }
});

// 3️⃣ Configure which paths the middleware applies to
export const config = {
  matcher: [
    "/((?!_next/|.*\\..*).*)", // Apply to all pages except _next and static files
    "/api/:path*",             // Optionally protect API routes
  ],
};
