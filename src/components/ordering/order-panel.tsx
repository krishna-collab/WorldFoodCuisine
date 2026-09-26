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
 * "Get it cooked" on the dish page. Asks for a ZIP code only here, when it
 * matters; shows a price, delivery time and options only where a kitchen (or
 * the demo) serves that ZIP; never implies an order is possible when it isn't.
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
            ? `Not delivering to ${area.postalCode} yet`
            : ORDERING_LIVE
              ? "Is it delivered near you?"
              : "Not on sale yet"}
        </p>
        <p className="leading-relaxed text-muted">
          {ORDERING_LIVE
            ? "Enter your ZIP code to see what the nearest kitchen is making today, the full price and delivery times."
            : "No kitchen is cooking yet, so we can’t deliver anywhere. When one opens, this is where you’ll see today’s price and delivery times for your ZIP code."}
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
          The kitchen serving {area.postalCode}
          {zone.demo ? " (demo)" : ""} isn’t making {dish.name} right now. You can still cook it at
          home, or choose another dish.
        </p>
        <Button asChild variant="secondary">
          <Link to="/menu" search={{ ways: "order" }}>
            See what’s available
          </Link>
        </Button>
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
          To {area.postalCode} in about {zone.etaMinutes[0]}–{zone.etaMinutes[1]} min ·{" "}
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
        {dish.content.allergens.status === "draft" ? " (from our draft recipe)" : ""}
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
