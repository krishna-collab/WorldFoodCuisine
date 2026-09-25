import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * This page listed delivery kitchens and cities that don't exist yet.
 * Old links now go to Order near me, which says honestly where we deliver.
 */
export const Route = createFileRoute("/kitchens")({
  beforeLoad: () => {
    throw redirect({ to: "/delivery", statusCode: 301 });
  },
});
