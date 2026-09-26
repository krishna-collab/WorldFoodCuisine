import { Link } from "@tanstack/react-router";
import { MapPin, ShoppingBag } from "lucide-react";
import { useId, useState } from "react";
import { toastAdded } from "@/components/food/toast-added";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { allergenLabels } from "@/lib/food/data";
import type { Dish } from "@/lib/food/types";
import {
  defaultOptions,
  menuStatus,
  optionGroupsFor,
  ORDERING_LIVE,
  unitPrice,
} from "@/lib/ordering/zones";
import { useCart } from "@/lib/store/cart";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Ordering on the dish page. The ZIP code picks the kitchen: each kitchen is
 * delivery-only and has its own menu for the day, prices, hours and delivery
 * time. Price, options and delivery time show only where a kitchen (or the
 * labeled demo) serves that ZIP; nothing implies an order is possible when
 * it isn't.
 */
export function OrderPanel({ dish }: { dish: Dish }) {
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const setDemo = useDeliveryArea((s) => s.setDemo);
  const add = useCart((s) => s.add);
  const uid = useId();
  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState<Record<string, string> | null>(null);

  if (area.kind !== "served") {
    return (
      <div className="space-y-4">
        <p className="text-display-s">
          {area.kind === "unserved"
            ? `No kitchen delivers to ${area.postalCode} yet`
            : ORDERING_LIVE
              ? "Which kitchen delivers to you?"
              : "No kitchen is open yet"}
        </p>
        <p className="leading-relaxed text-muted">
          {ORDERING_LIVE
            ? "Enter your ZIP code to find the kitchen that delivers to you, with its menu for today, prices and delivery time."
            : "WorldFoodCuisine kitchens cook to order and deliver; there’s no dining room. None is open yet, so nothing can be ordered. When one opens, your ZIP code will find it here."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="clay" size="lg" onClick={openDialog}>
            <MapPin className="size-4" aria-hidden="true" />
            {area.kind === "unserved" ? "Try another ZIP" : "Check your ZIP"}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              setDemo(true);
              openDialog();
            }}
          >
            Try ordering in demo mode
          </Button>
        </div>
      </div>
    );
  }

  const { zone } = area;
  const status = menuStatus(dish, zone);
  const groups = optionGroupsFor(dish, zone);
  const chosen = options ?? defaultOptions(dish, zone);
  const price = unitPrice(dish, zone, chosen);

  if (!status.available) {
    return (
      <div className="space-y-3">
        <p className="text-display-s">{status.reason}</p>
        <p className="leading-relaxed text-muted">
          {zone.label}, which delivers to {area.postalCode}, isn’t making {dish.name} today. Other
          kitchens set their own menus, so it may be on elsewhere.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/menu" search={{ available: true }}>
              See today’s menu
            </Link>
          </Button>
          <Button variant="ghost" onClick={openDialog}>
            Change ZIP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="nums text-display-m">
          {formatPrice(price)}
          {zone.demo ? (
            <span className="ml-2 align-middle font-sans text-sm font-semibold text-warn-fg">
              demo price
            </span>
          ) : null}
        </p>
        <p className="text-sm text-muted">
          From <span className="font-semibold text-fg">{zone.label}</span> to {area.postalCode} in about{" "}
          {zone.etaMinutes[0]}–{zone.etaMinutes[1]} min ·{" "}
          <button type="button" onClick={openDialog} className="text-link font-semibold">
            Change<span className="sr-only"> ZIP code</span>
          </button>
        </p>
      </div>

      {groups.map((group) => (
        <fieldset key={group.id}>
          <legend className="mb-2 text-sm font-semibold">{group.label}</legend>
          <div className="flex flex-wrap gap-2">
            {group.choices.map((choice) => {
              const id = `${uid}-${group.id}-${choice.id}`;
              const checked = chosen[group.id] === choice.id;
              return (
                <label
                  key={choice.id}
                  htmlFor={id}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                    checked
                      ? "bg-primary text-primary-fg"
                      : "shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken",
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${uid}-${group.id}`}
                    value={choice.id}
                    checked={checked}
                    onChange={() => setOptions({ ...chosen, [group.id]: choice.id })}
                    className="sr-only"
                  />
                  {choice.label}
                  {choice.priceDelta ? ` +${formatPrice(choice.priceDelta)}` : ""}
                </label>
              );
            })}
          </div>
          {group.help ? <p className="mt-2 text-xs text-subtle">{group.help}</p> : null}
        </fieldset>
      ))}

      <p className="text-sm text-muted">
        <span className="font-semibold text-fg">Contains: </span>
        {dish.allergens.length
          ? dish.allergens.map((a) => allergenLabels[a]).join(", ")
          : "none of the nine major allergens"}
        {dish.content.allergens.status === "draft" ? " (draft: not yet confirmed by a kitchen)" : ""}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Stepper value={qty} onChange={setQty} min={1} max={20} label={`portions of ${dish.name}`} />
        <Button
          variant="clay"
          size="lg"
          className="flex-1"
          onClick={() => {
            add(dish.id, chosen, qty);
            toastAdded(`${qty} × ${dish.name} added${zone.demo ? " (demo)" : ""}`);
            setQty(1);
          }}
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          Add to bag · <span className="nums">{formatPrice(price * qty)}</span>
        </Button>
      </div>
    </div>
  );
}
