import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";

const publicPages = ["/sign-in", "/sign-up"];

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const isPublicPage = publicPages.includes(pathname);

  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
