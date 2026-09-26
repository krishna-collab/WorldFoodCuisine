import type { ReactNode } from "react";
import { LocationDialog } from "@/components/ordering/location-dialog";
import { StatusLine } from "@/components/ordering/status-line";
import { CartDrawer } from "./cart-drawer";
import { SearchDialog } from "./search-dialog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[60] rounded-full bg-primary px-5 py-3 font-semibold text-primary-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SkipLink />
      <StatusLine />
      <SiteHeader />
      {/* At least a screen tall, so the footer never starts on screen and then
          jumps when content that waits for this browser's data appears (CLS). */}
      <main id="main" className="min-h-dvh flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <LocationDialog />
      <SearchDialog />
    </div>
  );
}
