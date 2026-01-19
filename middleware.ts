import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)"
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req) && !auth().userId) {
    return auth().redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
