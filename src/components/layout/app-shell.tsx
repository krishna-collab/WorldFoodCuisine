import type { ReactNode } from "react";
import { LocationDialog } from "@/components/ordering/location-dialog";
import { OrderingBanner } from "@/components/ordering/ordering-banner";
import { CartDrawer } from "./cart-drawer";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 font-medium text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <OrderingBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <LocationDialog />
    </div>
  );
}
