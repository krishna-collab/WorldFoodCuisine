import { useEffect, useRef, useState } from "react";
import { type CookTimer, timeLeft, useCook } from "@/lib/store/cook";

/** Re-render every second while any timer is running. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

/** A short three-note chime, made on the fly (no audio file to download). */
export function playChime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.28, 0.56].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = [880, 1175, 1568][i]!;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.55);
    });
    window.setTimeout(() => void ctx.close(), 1500);
  } catch {
    // No audio available; the visual and spoken alerts still happen.
  }
}

/**
 * Watches the dish's timers: when one runs out it is marked done, a chime
 * plays, the phone vibrates, screen readers hear it, and, if the visitor
 * allowed notifications and the page is in the background, a notification
 * appears. Timers that ran out while the app was closed ring on return.
 */
export function useTimerAlerts(dishId: string, timers: CookTimer[], announce: (text: string) => void) {
  const finishTimer = useCook((s) => s.finishTimer);
  const running = timers.some((t) => t.endsAt !== null && !t.done);
  const now = useNow(running);
  const rung = useRef(new Set<string>());

  useEffect(() => {
    for (const timer of timers) {
      if (timer.done || timer.endsAt === null) continue;
      if (timeLeft(timer, now) > 0 || rung.current.has(timer.id + timer.endsAt)) continue;
      rung.current.add(timer.id + timer.endsAt);
      finishTimer(dishId, timer.id);
      playChime();
      navigator.vibrate?.([300, 150, 300]);
      announce(`${timer.label} timer is done.`);
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted" &&
        document.visibilityState === "hidden"
      ) {
        try {
          new Notification(`${timer.label} is done`, {
            body: "Back to your recipe.",
            tag: `wfc-timer-${timer.id}`,
            icon: "/__grok/icon-192.png",
          });
        } catch {
          // Some browsers only allow notifications from the service worker.
        }
      }
    }
  }, [now, timers, dishId, finishTimer, announce]);

  return now;
}

/**
 * Keeps the screen on while cooking, where the browser supports it
 * (Screen Wake Lock API). Re-acquired when the page becomes visible again.
 */
export function useWakeLock(enabled: boolean): "on" | "off" | "unsupported" {
  const [state, setState] = useState<"on" | "off" | "unsupported">("off");
  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      setState("unsupported");
      return;
    }
    if (!enabled) {
      setState("off");
      return;
    }
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release();
          return;
        }
        setState("on");
        lock.addEventListener("release", () => setState("off"));
      } catch {
        setState("off");
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [enabled]);
  return state;
}

/** Speak text with the browser's voice; returns a stop function. */
export function speak(text: string): () => void {
  if (typeof speechSynthesis === "undefined") return () => {};
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
  return () => speechSynthesis.cancel();
}

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;
