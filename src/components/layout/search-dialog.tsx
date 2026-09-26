import * as Dialog from "@radix-ui/react-dialog";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useMemo, useRef } from "react";
import { DishImage } from "@/components/food/dish-image";
import { cuisineById, cuisines, hasDistinctLocalName, localNameLang, searchDishes } from "@/lib/food/data";
import { useUi } from "@/lib/store/ui";

const SUGGESTIONS = ["momo", "paneer", "curry", "tacos", "noodles", "timur"];

/**
 * Site search: instant results by dish name, local name (accents optional),
 * cuisine or anything a dish is made of. Arrow keys move through results;
 * Enter on the field opens the full menu with the query.
 */
export function SearchDialog() {
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearchOpen);
  const query = useUi((s) => s.searchQuery);
  const setQuery = useUi((s) => s.setSearchQuery);
  const openSearch = useUi((s) => s.openSearch);
  const navigate = useNavigate();
  const inputId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const results = useMemo(() => (query.trim() ? searchDishes(query).slice(0, 7) : []), [query]);

  // "/" or Cmd/Ctrl+K opens search from anywhere except text fields.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const close = () => setOpen(false);

  const moveFocus = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const links = [...(listRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    if (links.length === 0) return;
    e.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") (links[index + 1] ?? links[0])?.focus();
    else if (index <= 0) inputRef.current?.focus();
    else links[index - 1]?.focus();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-x-0 top-0 z-50 mx-auto flex max-h-dvh w-full max-w-2xl flex-col bg-surface shadow-[var(--shadow-raised)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 sm:top-[10vh] sm:max-h-[80vh] sm:rounded-2xl"
          onKeyDown={moveFocus}
          onOpenAutoFocus={(e) => {
            returnTo.current = document.activeElement as HTMLElement | null;
            e.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            // Opened by a button or the / shortcut, not a Radix trigger: go back there.
            if (returnTo.current?.isConnected) {
              e.preventDefault();
              returnTo.current.focus();
            }
          }}
        >
          <Dialog.Title className="sr-only">Search dishes</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search by dish, cuisine or ingredient. Use the arrow keys to move through results.
          </Dialog.Description>
          <form
            role="search"
            className="flex items-center gap-2 border-b border-border px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              close();
              void navigate({ to: "/menu", search: { q: query.trim() || undefined } });
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              Search dishes and ingredients
            </label>
            <Search className="size-5 shrink-0 text-subtle" aria-hidden="true" />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dish, cuisine or ingredient"
              enterKeyHint="search"
              autoComplete="off"
              className="h-12 min-w-0 flex-1 bg-transparent text-lg text-fg placeholder:text-subtle focus-visible:outline-none"
            />
            <Dialog.Close
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sunken hover:text-fg"
              aria-label="Close search"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </form>

          <div className="overflow-y-auto px-2 py-3">
            <p className="sr-only" aria-live="polite">
              {query.trim()
                ? `${results.length} ${results.length === 1 ? "dish" : "dishes"} found`
                : ""}
            </p>
            {query.trim() === "" ? (
              <div className="px-3 pb-2">
                <p className="eyebrow text-subtle">Try</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setQuery(s);
                        inputRef.current?.focus();
                      }}
                      className="h-10 rounded-full px-4 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-sunken"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="eyebrow mt-6 text-subtle">Cuisines</p>
                <ul className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {cuisines.map((c) => (
                    <li key={c.id}>
                      <Link
                        to="/menu/$cuisine"
                        params={{ cuisine: c.id }}
                        onClick={close}
                        className="flex h-11 items-center rounded-lg px-3 font-semibold hover:bg-sunken"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="font-display text-display-s">Nothing matches “{query.trim()}”</p>
                <p className="mt-2 text-sm text-muted">
                  Try an ingredient, like “paneer”, or a cuisine, like “Thailand”.
                </p>
              </div>
            ) : (
              <ul ref={listRef} className="flex flex-col gap-1">
                {results.map(({ dish, ingredientMatch }) => (
                  <li key={dish.id}>
                    <Link
                      to="/dish/$id"
                      params={{ id: dish.id }}
                      onClick={close}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-sunken focus-visible:bg-sunken"
                    >
                      <DishImage
                        dish={dish}
                        sizes="64px"
                        label="none"
                        className="size-16 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{dish.name}</span>
                        <span className="block truncate text-sm text-muted">
                          {cuisineById[dish.cuisine].name}
                          {hasDistinctLocalName(dish) ? (
                            <>
                              {" · "}
                              <span lang={localNameLang(dish)}>{dish.localName}</span>
                            </>
                          ) : null}
                          {ingredientMatch ? ` · has ${ingredientMatch.toLowerCase()}` : ""}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-subtle" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/menu"
                    search={{ q: query.trim() }}
                    onClick={close}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold hover:bg-sunken"
                  >
                    See all results on the menu
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
