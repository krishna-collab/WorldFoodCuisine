import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { NotFound } from "@/components/layout/not-found";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker";
import { AuthProvider } from "@/lib/auth/provider";
import { SHARE_IMAGE_ALT, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  // Pages add their own title, description, canonical URL and share tags;
  // the deepest route's meta wins, so these are only defaults.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: SITE_NAME },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: SITE_NAME },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: absoluteUrl("/og.jpg") },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SHARE_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#09090b" },
      { name: "color-scheme", content: "dark" },
      // Home-screen label on iPhone; matches the manifest short_name so it isn't cut off.
      { name: "apple-mobile-web-app-title", content: "WorldFood" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "preload",
        href: "/fonts/manrope-latin-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/syne-latin-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        // Only facts that are true today: the site's name and address.
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
        }),
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <AppShell>
            <Outlet />
          </AppShell>
          <Toaster theme="dark" position="bottom-center" />
          <ServiceWorkerRegistration />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
