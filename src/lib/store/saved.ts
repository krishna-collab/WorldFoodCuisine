import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dishById } from "@/lib/food/data";

/**
 * Saved dishes. Kept in this browser; saving also asks the service worker to
 * keep the dish page, its image and its recipe for offline use.
 */
type SavedState = {
  ids: string[];
  toggle: (dishId: string) => boolean;
  remove: (dishId: string) => void;
};

export const useSaved = create<SavedState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (dishId) => {
        const has = get().ids.includes(dishId);
        set({ ids: has ? get().ids.filter((id) => id !== dishId) : [dishId, ...get().ids] });
        void syncOffline(dishId, !has);
        return !has;
      },
      remove: (dishId) => {
        set({ ids: get().ids.filter((id) => id !== dishId) });
        void syncOffline(dishId, false);
      },
    }),
    { name: "wfc-saved" },
  ),
);

/** URLs that make a dish usable offline: its page, cook mode and image. */
export function offlineUrlsFor(dishId: string): string[] {
  const dish = dishById[dishId];
  if (!dish) return [];
  const urls = [`/dish/${dishId}`];
  if (dish.hasRecipe) urls.push(`/dish/${dishId}/cook`);
  if (dish.image.kind !== "placeholder") urls.push(dish.image.src);
  return urls;
}

async function syncOffline(dishId: string, keep: boolean) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    registration?.active?.postMessage({
      type: keep ? "SAVE_URLS" : "UNSAVE_URLS",
      urls: offlineUrlsFor(dishId),
    });
  } catch {
    // Offline copies are a bonus; saving still works without them.
  }
}
