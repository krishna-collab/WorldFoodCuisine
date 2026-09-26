import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Registers /sw.js in production builds. When a new version has installed,
 * offers a reload instead of switching pages out from under the visitor.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker;
    const hadController = Boolean(sw.controller);
    let reloading = false;

    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    };
    sw.addEventListener("controllerchange", onControllerChange);

    const offerUpdate = (worker: ServiceWorker) => {
      toast("A new version of WorldFoodCuisine is ready", {
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
        },
      });
    };

    sw.register("/sw.js")
      .then((registration) => {
        if (registration.waiting && sw.controller) offerUpdate(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && sw.controller) offerUpdate(worker);
          });
        });
      })
      .catch(() => {
        // Offline support is a bonus; the site works without it.
      });

    // Hand the worker what this page already loaded, so the page works
    // offline next time even though the worker wasn't running on first load.
    void sw.ready.then((registration) => {
      const urls = [
        window.location.pathname + window.location.search,
        ...performance.getEntriesByType("resource").map((entry) => entry.name),
      ];
      registration.active?.postMessage({ type: "CACHE_URLS", urls });
    });

    return () => sw.removeEventListener("controllerchange", onControllerChange);
  }, []);

  return null;
}
