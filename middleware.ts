// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1️⃣ Define the routes you want to protect
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
]);

// 2️⃣ Middleware function
export default clerkMiddleware((auth) => {
  const req = auth.request;

  // If route is protected and user is NOT signed in, redirect to /sign-in
  if (isProtectedRoute(req) && !auth.isSignedIn) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/sign-in" },
    });
  }

  // If route is not protected or user is signed in, continue
  return new Response(null);
});

// 3️⃣ Configure which paths the middleware applies to
export const config = {
  matcher: [
    "/((?!_next/|.*\\..*).*)", // Apply to all pages except _next and static files
    "/api/:path*",             // Optionally protect API routes
  ],
};
