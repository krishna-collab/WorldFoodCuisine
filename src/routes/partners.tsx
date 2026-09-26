import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * This page claimed Uber Eats, DoorDash and Grubhub listings that couldn't be
 * verified. Old links now go to Order near me.
 */
export const Route = createFileRoute("/partners")({
  beforeLoad: () => {
    throw redirect({ to: "/delivery", statusCode: 301 });
  },
});
