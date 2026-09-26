import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CircleDashed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dishById } from "@/lib/food/data";
import { pageHead } from "@/lib/site";
import { useDeliveryArea } from "@/lib/store/delivery-area";
import { useOrders } from "@/lib/store/orders";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) =>
    pageHead({
      title: `Demo order ${params.id}`,
      description: "A demo order. Nothing was sent or charged.",
      path: `/order/${params.id}`,
      noindex: true,
    }),
  component: OrderPage,
});

const STATUS = [
  { label: "Order placed", demo: "Recorded in this browser only" },
  { label: "Kitchen confirms", demo: "Would happen with a real kitchen" },
  { label: "Cooking", demo: "Would happen with a real kitchen" },
  { label: "Out for delivery", demo: "Would happen with a real courier" },
  { label: "Delivered", demo: "Would happen with a real courier" },
];

/**
 * Confirmation for a demo order. There is no kitchen behind it, so the status
 * timeline shows how tracking will look with only the first step real.
 */
function OrderPage() {
  const { id } = Route.useParams();
  const hydrated = useHydrated();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const setDemo = useDeliveryArea((s) => s.setDemo);

  if (!hydrated) {
    return (
      <div className="gutter mx-auto max-w-2xl py-16" aria-busy="true">
        <div className="skeleton h-10 w-2/3 rounded" />
        <div className="skeleton mt-6 h-40 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="gutter mx-auto max-w-xl py-20 text-center sm:py-24">
        <h1 className="text-display-l">Order not found</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Demo orders are only kept in the browser they were placed in, and only the last ten.
        </p>
        <Button asChild className="mt-8">
          <Link to="/menu">Back to dishes</Link>
        </Button>
      </div>
    );
  }

  const placed = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    order.createdAt,
  );
  const tip = order.tip ?? 0;

  return (
    <div className="gutter mx-auto max-w-2xl pt-10 lg:pt-14">
      <p className="eyebrow text-subtle">Demo order {order.id}</p>
      <h1 className="mt-3 text-display-l">That’s the whole flow</h1>

      <div role="status" className="mt-6 rounded-2xl border border-warn-border bg-warn-bg p-5 leading-relaxed text-warn-fg">
        <p className="font-bold">This was a demo. Nothing was sent to a kitchen.</p>
        <p className="mt-1">
          No card was charged and no food is on its way. Your name, phone and address weren’t
          saved; only the summary below is kept, in this browser.
        </p>
      </div>

      <section aria-labelledby="status" className="mt-10">
        <h2 id="status" className="text-display-s">
          How tracking will look
        </h2>
        <ol className="mt-5">
          {STATUS.map((s, i) => (
            <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
              {i < STATUS.length - 1 ? (
                <span className="absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5 bg-border" aria-hidden="true" />
              ) : null}
              <span
                className={
                  i === 0
                    ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-herb text-herb-fg"
                    : "flex size-8 shrink-0 items-center justify-center rounded-full bg-sunken text-subtle"
                }
                aria-hidden="true"
              >
                {i === 0 ? <Check className="size-4" /> : <CircleDashed className="size-4" />}
              </span>
              <span>
                <span className={i === 0 ? "block font-semibold" : "block font-semibold text-muted"}>{s.label}</span>
                <span className="block text-sm text-subtle">
                  {i === 0 ? `${placed} · ${s.demo}` : s.demo}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <dl className="mt-10 grid gap-4 border-y border-border py-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-subtle">From</dt>
          <dd className="mt-1 font-semibold">{order.zoneLabel}</dd>
        </div>
        <div>
          <dt className="text-subtle">Delivery to</dt>
          <dd className="mt-1 font-semibold">ZIP {order.postalCode}</dd>
        </div>
        <div>
          <dt className="text-subtle">Delivery time chosen</dt>
          <dd className="mt-1 font-semibold">{order.window}</dd>
        </div>
      </dl>

      <section aria-labelledby="chosen" className="mt-8">
        <h2 id="chosen" className="text-display-s">
          What you chose
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => {
            const dish = dishById[item.dishId];
            return (
              <li key={item.key ?? item.dishId} className="flex justify-between gap-4">
                <span className="text-muted">
                  {item.qty} × {dish?.name ?? item.dishId}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          {[
            ["Subtotal", formatPrice(order.subtotal)],
            ["Delivery", order.delivery === 0 ? "Free" : formatPrice(order.delivery)],
            ["Tax", formatPrice(order.tax)],
            ["Tip", tip ? formatPrice(tip) : "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-muted">
              <dt>{label}</dt>
              <dd className="nums text-fg">{value}</dd>
            </div>
          ))}
          <div className="flex justify-between pt-1 text-base font-bold">
            <dt>Demo total</dt>
            <dd className="nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/menu">Back to dishes</Link>
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDemo(false);
            toast("Demo mode is off");
          }}
        >
          Turn off demo mode
        </Button>
      </div>
    </div>
  );
}
