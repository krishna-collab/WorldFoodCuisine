import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cityById, dishById } from "@/lib/food/data";
import { orderStages, orderStatus, useOrders } from "@/lib/store/orders";
import { cn, formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

function OrderPage() {
  const { id } = Route.useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 5000);
    return () => window.clearInterval(t);
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Ticket not found</h1>
        <p className="mt-3 text-muted">Orders in this preview live in your browser.</p>
        <Button asChild className="mt-8">
          <Link to="/menu">Back to the menu</Link>
        </Button>
      </div>
    );
  }

  const city = cityById(order.cityId);
  const current = orderStatus(order);
  const stages = orderStages();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Ticket {order.id}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{current.label}</h1>
      <p className="mt-2 text-muted">{current.detail}</p>
      <p className="mt-2 text-sm text-subtle">
        Delivery only · {city.hub} · {order.address}
        {order.unit ? `, ${order.unit}` : ""} · {city.name}
      </p>

      <ol className="mt-10 space-y-0">
        {stages.map((stage, i) => {
          const active = stages.findIndex((s) => s.status === current.status);
          const done = i <= active;
          return (
            <li key={stage.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-1 size-3 rounded-full",
                    done ? "bg-primary" : "bg-elevated shadow-[var(--shadow-border)]",
                  )}
                />
                {i < stages.length - 1 ? (
                  <span className={cn("w-px flex-1", done && i < active ? "bg-primary" : "bg-border")} />
                ) : null}
              </div>
              <div className={cn("pb-8", i === stages.length - 1 && "pb-0")}>
                <p className={cn("font-medium", done ? "text-fg" : "text-muted")}>{stage.label}</p>
                <p className="text-sm text-subtle">{stage.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Plates</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => {
            const dish = dishById[item.dishId];
            return (
              <li key={item.dishId} className="flex justify-between">
                <span className="text-muted">
                  {item.qty} × {dish?.name ?? item.dishId}
                </span>
                <span className="tabular-nums">{dish ? formatPrice(dish.price * item.qty) : ""}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Button asChild variant="secondary" className="mt-8">
        <Link to="/menu">Order again</Link>
      </Button>
    </div>
  );
}
