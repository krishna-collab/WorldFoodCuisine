import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ClipboardCopy, ListChecks, Share2, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dishById } from "@/lib/food/data";
import { pageHead } from "@/lib/site";
import { AISLE_ORDER, aisleLabels, type ListItem, useShoppingList } from "@/lib/store/shopping-list";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/list")({
  head: () =>
    pageHead({
      title: "Shopping list",
      description: "Your shopping list for guided recipes, kept on this device.",
      path: "/list",
      noindex: true,
    }),
  component: ShoppingListPage,
});

function asText(items: ListItem[]): string {
  return AISLE_ORDER.flatMap((aisle) => {
    const lines = items.filter((i) => i.aisle === aisle && !i.checked);
    if (!lines.length) return [];
    return [
      `${aisleLabels[aisle]}:`,
      ...lines.map((i) => `- ${i.amount ? `${i.amount} ` : ""}${i.name}${i.swappedFrom ? ` (instead of ${i.swappedFrom})` : ""}`),
      "",
    ];
  })
    .join("\n")
    .trim();
}

function ShoppingListPage() {
  const hydrated = useHydrated();
  const raw = useShoppingList((s) => s.items);
  const toggle = useShoppingList((s) => s.toggle);
  const clearChecked = useShoppingList((s) => s.clearChecked);
  const clearAll = useShoppingList((s) => s.clearAll);
  const items = useMemo(() => (hydrated ? raw : []), [hydrated, raw]);
  const dishesOnList = useMemo(() => [...new Set(items.map((i) => i.dishId))], [items]);
  const left = items.filter((i) => !i.checked).length;

  const share = async () => {
    const text = asText(items);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Shopping list", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Copied. Paste it into a message or your notes.");
    } catch {
      // Share sheet dismissed; nothing to do.
    }
  };

  return (
    <div className="gutter mx-auto max-w-3xl pt-8 lg:pt-12">
      <p className="eyebrow text-herb">Cook it</p>
      <h1 className="mt-3 text-display-l">Shopping list</h1>
      {!hydrated ? (
        <div className="mt-8 space-y-3" aria-busy="true">
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border-strong px-6 py-12 text-center">
          <ListChecks className="mx-auto size-10 text-subtle" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 text-display-s">Nothing on your list</p>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            Open a guided recipe and tap “Shopping list”. Amounts follow the servings you choose.
          </p>
          <Button asChild variant="herb" className="mt-6">
            <Link to="/cook">Guided recipes</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-muted">
            For{" "}
            {dishesOnList.map((id, i) => (
              <span key={id}>
                {i > 0 ? ", " : ""}
                <Link to="/dish/$id" params={{ id }} className="text-link">
                  {dishById[id]?.name ?? id}
                </Link>
              </span>
            ))}
            . Kept on this device, so it works in the shop without a connection.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="primary" onClick={share}>
              {typeof navigator !== "undefined" && "share" in navigator ? (
                <Share2 className="size-4" aria-hidden="true" />
              ) : (
                <ClipboardCopy className="size-4" aria-hidden="true" />
              )}
              Share or copy
            </Button>
            <Button variant="secondary" onClick={clearChecked} disabled={left === items.length}>
              <Check className="size-4" aria-hidden="true" />
              Clear ticked
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const snapshot = useShoppingList.getState().items;
                clearAll();
                toast("List cleared", {
                  action: { label: "Undo", onClick: () => useShoppingList.setState({ items: snapshot }) },
                });
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Clear all
            </Button>
          </div>
          <p className="nums mt-6 text-sm font-semibold text-muted" aria-live="polite">
            {left} of {items.length} left to buy
          </p>
          {AISLE_ORDER.map((aisle) => {
            const lines = items.filter((i) => i.aisle === aisle);
            if (!lines.length) return null;
            return (
              <section key={aisle} aria-labelledby={`aisle-${aisle}`} className="mt-6">
                <h2 id={`aisle-${aisle}`} className="border-b-2 border-fg pb-1.5 font-sans text-sm font-bold tracking-wide uppercase">
                  {aisleLabels[aisle]}
                </h2>
                <ul>
                  {lines.map((item) => (
                    <li key={item.id} className="border-b border-border">
                      <label className="flex min-h-14 cursor-pointer items-center gap-3 py-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggle(item.id)}
                          className="peer size-6 shrink-0 accent-[var(--color-herb)]"
                        />
                        <span className={cn("text-[1.0625rem] leading-snug", item.checked && "text-subtle line-through")}>
                          {item.amount ? <span className="nums font-bold">{item.amount} </span> : null}
                          {item.name}
                          {item.swappedFrom ? (
                            <span className="block text-sm text-herb">instead of {item.swappedFrom}</span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
