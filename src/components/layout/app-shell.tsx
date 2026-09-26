import { useRouterState } from "@tanstack/react-router";
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

/** Cook mode is a focused, full-screen page with its own controls. */
const FOCUSED = /^\/dish\/[^/]+\/cook\/?$/;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (FOCUSED.test(pathname)) {
    return (
      <div className="min-h-dvh bg-bg text-fg">
        <SkipLink />
        <main id="main">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SkipLink />
      <StatusLine />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <LocationDialog />
      <SearchDialog />
    </div>
  );
}
