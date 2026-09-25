import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The old supplier-and-lot-code page was replaced by "What's in our food",
 * which lists what every dish is made of. Old links go there.
 */
export const Route = createFileRoute("/trace")({
  beforeLoad: () => {
    throw redirect({ to: "/ingredients", statusCode: 301 });
  },
});
