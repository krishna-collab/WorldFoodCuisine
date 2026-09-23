import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DishCard } from "@/components/food/dish-card";
import { Input } from "@/components/ui/input";
import { cuisines, dietLabels, dishes } from "@/lib/food/data";
import type { CuisineId, DietTag } from "@/lib/food/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({ component: MenuPage });

const FILTERS: DietTag[] = ["hub-lunch", "vegetarian", "vegan", "gluten-free", "spicy", "chef-pick"];

function MenuPage() {
  const [cuisine, setCuisine] = useState<CuisineId | "all">("all");
  const [diet, setDiet] = useState<DietTag | "all">("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return dishes.filter((d) => {
      if (cuisine !== "all" && d.cuisine !== cuisine) return false;
      if (diet !== "all" && !d.tags.includes(diet)) return false;
      if (!query) return true;
      return (
        d.name.toLowerCase().includes(query) ||
        d.localName.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query)
      );
    });
  }, [cuisine, diet, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">Menu</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Fifty plates</h1>
      <p className="mt-3 max-w-xl text-muted">
        Ten signatures from each kitchen, packed for the rider. Filter by country, diet, or the
        hub-lunch window. Delivery only — there is no dining room.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search butter chicken, momo, carbonara…"
          aria-label="Search menu"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={cuisine === "all"} onClick={() => setCuisine("all")}>
            All kitchens
          </FilterChip>
          {cuisines.map((c) => (
            <FilterChip key={c.id} active={cuisine === c.id} onClick={() => setCuisine(c.id)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={diet === "all"} onClick={() => setDiet("all")}>
            Any plate
          </FilterChip>
          {FILTERS.map((tag) => (
            <FilterChip key={tag} active={diet === tag} onClick={() => setDiet(tag)}>
              {dietLabels[tag]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted">
        <p>
          {list.length} {list.length === 1 ? "plate" : "plates"}
        </p>
        <div className="hidden gap-3 sm:flex">
          {cuisines.map((c) => (
            <Link
              key={c.id}
              to="/menu/$cuisine"
              params={{ cuisine: c.id }}
              className="hover:text-fg"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-muted">Nothing on the line matches that.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors duration-150",
        active ? "bg-primary text-primary-fg" : "bg-elevated text-muted shadow-[var(--shadow-border)] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
