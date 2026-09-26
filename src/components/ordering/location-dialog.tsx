import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, X } from "lucide-react";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  areaStatus,
  hoursLabel,
  isOpenAt,
  normalizePostalCode,
  ORDERING_LIVE,
} from "@/lib/ordering/zones";
import { useDeliveryArea } from "@/lib/store/delivery-area";
import { formatPrice } from "@/lib/utils";

/**
 * The ZIP check. Opened from "Check delivery", the header location chip and
 * the Order near me page. Uses a native <dialog> for focus trapping and Esc.
 */
export function LocationDialog() {
  const open = useDeliveryArea((s) => s.dialogOpen);
  const closeDialog = useDeliveryArea((s) => s.closeDialog);
  const postalCode = useDeliveryArea((s) => s.postalCode);
  const demo = useDeliveryArea((s) => s.demo);
  const setPostalCode = useDeliveryArea((s) => s.setPostalCode);
  const ref = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  // Opened from a dish page: after the check, go back to ordering that dish.
  const onDish = useRouterState({ select: (s) => s.location.pathname.startsWith("/dish/") });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setValue(postalCode ?? "");
      setError("");
      setChecked(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, postalCode]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const code = normalizePostalCode(value);
    if (!code) {
      setError("Enter a 5-digit US ZIP code, like 95112.");
      return;
    }
    setError("");
    setPostalCode(code);
    setChecked(code);
  }

  const result = checked ? areaStatus(checked, demo) : null;

  return (
    <dialog
      ref={ref}
      onClose={closeDialog}
      aria-labelledby={`${inputId}-title`}
      className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl bg-surface p-0 text-fg shadow-[var(--shadow-raised)] backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={`${inputId}-title`} className="text-display-s">
            Get it cooked near you
          </h2>
          <button
            type="button"
            onClick={closeDialog}
            className="-m-2 flex size-11 items-center justify-center rounded-full text-muted hover:bg-sunken hover:text-fg"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {ORDERING_LIVE
            ? "Enter your ZIP code to see what we can deliver, with prices, fees and delivery times for your area."
            : "We’re not delivering anywhere yet. Enter your ZIP code and we’ll tell you honestly whether we reach you."}
        </p>

        <form onSubmit={onSubmit} className="mt-5" noValidate>
          <Label htmlFor={inputId}>ZIP code</Label>
          <div className="flex gap-2">
            <Input
              id={inputId}
              name="postal-code"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              placeholder="95112"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              autoFocus
            />
            <Button type="submit" size="lg" variant="clay" className="shrink-0">
              Check
            </Button>
          </div>
          <p id={errorId} role="alert" className="mt-2 min-h-5 text-sm font-medium text-danger">
            {error}
          </p>
        </form>

        <div aria-live="polite">
          {result?.kind === "served" ? (
            <div className="mt-2 rounded-xl bg-sunken p-4 text-sm leading-relaxed">
              <p className="flex items-center gap-2 font-medium text-fg">
                <MapPin className="size-4 text-accent" aria-hidden="true" />
                {result.zone.demo ? "Demo delivery to " : "We deliver to "}
                {result.postalCode}
              </p>
              <ul className="mt-2 space-y-1 text-muted">
                <li>
                  {result.zone.label} · about {result.zone.etaMinutes[0]}–
                  {result.zone.etaMinutes[1]} min
                </li>
                <li>
                  Delivery {formatPrice(result.zone.deliveryFee)}
                  {result.zone.freeDeliveryOver
                    ? `, free over ${formatPrice(result.zone.freeDeliveryOver)}`
                    : ""}
                </li>
                <li>
                  {hoursLabel(result.zone)} ·{" "}
                  {isOpenAt(result.zone) ? "open now" : "closed now, you can schedule"}
                </li>
              </ul>
              {result.zone.demo ? (
                <p className="mt-2 font-medium text-warn-fg">
                  Demo mode: these are example numbers. Nothing is sent or charged.
                </p>
              ) : null}
              {onDish ? (
                <Button className="mt-4 w-full" onClick={closeDialog}>
                  Continue
                </Button>
              ) : (
                <Button asChild className="mt-4 w-full">
                  <Link to="/menu" onClick={closeDialog}>
                    Browse dishes
                  </Link>
                </Button>
              )}
            </div>
          ) : null}

          {result?.kind === "unserved" ? (
            <div className="mt-2 rounded-xl bg-sunken p-4 text-sm leading-relaxed">
              <p className="font-medium text-fg">
                We’re not delivering to {result.postalCode} yet.
              </p>
              <p className="mt-1 text-muted">
                {ORDERING_LIVE
                  ? "Your area isn’t covered yet."
                  : "No kitchen is open yet, so we can’t deliver anywhere yet."}{" "}
                You can still browse every dish and see exactly what’s in it.
              </p>
              <Button asChild variant="secondary" className="mt-4 w-full">
                <Link to="/menu" onClick={closeDialog}>
                  Browse dishes
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        {postalCode ? (
          <button
            type="button"
            className="mt-4 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            onClick={() => {
              setPostalCode(null);
              setChecked(null);
              setValue("");
            }}
          >
            Forget my ZIP code
          </button>
        ) : null}
      </div>
    </dialog>
  );
}
