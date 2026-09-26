import { useEffect, useState } from "react";
import { create } from "zustand";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Install support. Chrome, Edge and Android hand us an install prompt, which
 * we keep and show only when someone taps "Install the app". iPhone and iPad
 * Safari have no prompt, so they get short Add to Home Screen instructions.
 * Nothing pops up on its own.
 */
const useInstallStore = create<{
  deferred: BeforeInstallPromptEvent | null;
  installed: boolean;
}>()(() => ({ deferred: null, installed: false }));

let listening = false;

/** Call once on start-up (the service worker registration does). */
export function listenForInstall() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    useInstallStore.setState({ deferred: event as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => {
    useInstallStore.setState({ deferred: null, installed: true });
  });
}

function detect() {
  const ua = navigator.userAgent;
  const ios =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { ios, standalone };
}

export function useInstall() {
  const deferred = useInstallStore((s) => s.deferred);
  const installed = useInstallStore((s) => s.installed);
  const [env, setEnv] = useState({ ios: false, standalone: false, ready: false });
  useEffect(() => setEnv({ ...detect(), ready: true }), []);
  const available = env.ready && !env.standalone && !installed && (Boolean(deferred) || env.ios);
  return {
    available,
    ios: env.ios && !deferred,
    prompt: async () => {
      if (!deferred) return;
      await deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      useInstallStore.setState({ deferred: null });
    },
  };
}
