import { MapPin } from "lucide-react";
import { isOpenAt } from "@/lib/ordering/zones";
import { useAreaStatus, useDeliveryArea } from "@/lib/store/delivery-area";
import { cn } from "@/lib/utils";

/**
 * One line saying which kitchen the menu is for: its name, the ZIP it
 * delivers to and whether it's open, or a prompt to set a ZIP code.
 */
export function KitchenLine({ className }: { className?: string }) {
  const area = useAreaStatus();
  const openDialog = useDeliveryArea((s) => s.openDialog);
  const change = (
    <button type="button" onClick={openDialog} className="text-link font-semibold">
      {area.kind === "unset" ? "Find your kitchen" : "Change"}
      {area.kind === "unset" ? null : <span className="sr-only"> ZIP code</span>}
    </button>
  );
  return (
    <p className={cn("text-sm leading-relaxed text-muted", className)}>
      <MapPin className="mr-1.5 inline size-4 align-[-3px] text-accent" aria-hidden="true" />
      {area.kind === "served" ? (
        <>
          <span className="font-semibold text-fg">{area.zone.label}</span> delivers to{" "}
          {area.postalCode} · {isOpenAt(area.zone) ? "open now" : "closed now"}
        </>
      ) : area.kind === "unserved" ? (
        <>No kitchen delivers to {area.postalCode} yet</>
      ) : (
        <>Prices and today’s menu depend on the kitchen that delivers to you.</>
      )}{" "}
      · {change}
    </p>
  );
}
