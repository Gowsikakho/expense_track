import { SignedIn, SignedOut, RedirectToSignIn, useUser, UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h1>Welcome, {user?.firstName} 👋</h1>
          <p>Email: {user?.emailAddresses[0].emailAddress}</p>
          <UserButton fallbackRedirectUrl="/sign-in" />
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
