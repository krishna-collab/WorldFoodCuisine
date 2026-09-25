import { createFileRoute, Link } from "@tanstack/react-router";
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

/**
 * Confirmation for a demo order. There is no kitchen behind it, so there is
 * no tracking timeline: only what was chosen and a plain statement that
 * nothing happened.
 */
function OrderPage() {
  const { id } = Route.useParams();
  const hydrated = useHydrated();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const setDemo = useDeliveryArea((s) => s.setDemo);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:py-24">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Order not found</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Demo orders are only kept in the browser they were placed in, and only the last ten.
        </p>
        <Button asChild className="mt-8">
          <Link to="/menu">Back to the menu</Link>
        </Button>
      </div>
    );
  }

  const placed = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm text-subtle">Demo order {order.id}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        That’s the whole flow
      </h1>

      <div role="status" className="mt-6 rounded-2xl bg-warn-bg p-5 leading-relaxed text-warn-fg">
        <p className="font-medium">This was a demo. Nothing was sent to a kitchen.</p>
        <p className="mt-1">
          No card was charged and no food is on its way. Your name, phone and address weren’t saved;
          only the summary below is kept, in this browser.
        </p>
      </div>

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-subtle">Delivery to</dt>
          <dd className="mt-1">ZIP {order.postalCode}</dd>
        </div>
        <div>
          <dt className="text-subtle">Delivery time chosen</dt>
          <dd className="mt-1">{order.window}</dd>
        </div>
        <div>
          <dt className="text-subtle">Placed</dt>
          <dd className="mt-1">{placed}</dd>
        </div>
      </dl>

      <div className="mt-8 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">What you chose</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => {
            const dish = dishById[item.dishId];
            return (
              <li key={item.dishId} className="flex justify-between gap-4">
                <span className="text-muted">
                  {item.qty} × {dish?.name ?? item.dishId}
                </span>
                <span className="tabular-nums">
                  {dish ? formatPrice(dish.price * item.qty) : ""}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-fg">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd className="tabular-nums text-fg">
              {order.delivery === 0 ? "Free" : formatPrice(order.delivery)}
            </dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Tax</dt>
            <dd className="tabular-nums text-fg">{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base font-medium">
            <dt>Demo total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/menu">Back to the menu</Link>
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
