import { Link } from "@tanstack/react-router";
import { ORDERING_LIVE } from "@/lib/ordering/zones";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";

/**
 * One honest line at the top of every page about whether ordering is real.
 * A single line (32px) so food, not a banner, fills the first screen.
 */
export function StatusLine() {
  const area = useAreaStatus();
  const setDemo = useDeliveryArea((s) => s.setDemo);

  if (area.demo) {
    return (
      <aside
        aria-label="Ordering status"
        className="border-b border-warn-border bg-warn-bg text-warn-fg"
      >
        <p className="gutter mx-auto flex min-h-8 max-w-[90rem] items-center justify-center gap-x-2 py-1 text-center text-[0.8125rem] leading-snug">
          <span>
            <strong className="font-bold">Demo mode:</strong> nothing is sent or charged.
          </span>
          <button
            type="button"
            className="inline-flex min-h-6 items-center font-semibold underline underline-offset-2"
            onClick={() => setDemo(false)}
          >
            Turn off
          </button>
        </p>
      </aside>
    );
  }

  if (ORDERING_LIVE) return null;

  return (
    <aside aria-label="Ordering status" className="border-b border-border bg-sunken">
      <p className="gutter mx-auto flex min-h-8 max-w-[90rem] items-center justify-center py-1 text-center text-[0.8125rem] leading-snug text-muted">
        <span>
          <strong className="font-bold text-fg">Not delivering yet.</strong>{" "}
          <span className="hidden sm:inline">Browse every dish and cook at home, or </span>
          <Link to="/delivery" className="font-semibold text-fg underline underline-offset-2">
            <span className="sm:hidden">Try the ordering demo</span>
            <span className="hidden sm:inline">try the ordering demo</span>
          </Link>
        </span>
      </p>
    </aside>
  );
}
