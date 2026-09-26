import { Link } from "@tanstack/react-router";
import { dishes } from "@/lib/food/data";
import { ORDERING_LIVE } from "@/lib/ordering/zones";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";

/** One honest line at the top of every page about whether ordering is real. */
export function OrderingBanner() {
  const area = useAreaStatus();
  const setDemo = useDeliveryArea((s) => s.setDemo);

  if (area.demo) {
    return (
      <aside aria-label="Ordering status" className="bg-warn-bg text-warn-fg">
        <p
          role="status"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-safe py-2 text-sm 2xl:max-w-[1536px]"
        >
          <strong className="font-semibold">Demo mode.</strong>
          <span>Prices, fees and delivery times are examples. Nothing is sent or charged.</span>
          <button
            type="button"
            className="inline-flex min-h-6 items-center font-medium underline underline-offset-4"
            onClick={() => setDemo(false)}
          >
            Turn off demo
          </button>
        </p>
      </aside>
    );
  }

  if (ORDERING_LIVE) return null;

  return (
    <aside aria-label="Ordering status" className="border-b border-border bg-surface">
      <p className="mx-auto max-w-7xl px-safe py-2 text-sm text-muted 2xl:max-w-[1536px]">
        <strong className="font-semibold text-fg">Preview:</strong> we’re not delivering yet.{" "}
        <span className="hidden sm:inline">
          Browse all {dishes.length} dishes and see exactly what’s in them.{" "}
        </span>
        <Link to="/delivery" className="font-medium text-fg underline underline-offset-4">
          Check your ZIP
        </Link>
      </p>
    </aside>
  );
}
