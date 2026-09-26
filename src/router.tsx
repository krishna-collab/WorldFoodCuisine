import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    // Load a page's code when a link is hovered or touched, so taps feel instant.
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}
