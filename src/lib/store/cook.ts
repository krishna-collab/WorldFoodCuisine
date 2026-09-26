import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Measure } from "@/lib/food/quantity";

/**
 * Cooking sessions, one per dish, kept in this browser so leaving the app
 * (a phone call, a locked screen, a closed tab) never loses your place.
 * Timers store when they end, not how long is left, so they stay right
 * while the page is closed.
 */
export type CookTimer = {
  id: string;
  label: string;
  stepId: string;
  durationMs: number;
  /** Epoch ms when it rings; null while paused. */
  endsAt: number | null;
  /** Time left when paused. */
  remainingMs: number;
  /** Rang and not yet dismissed. */
  done: boolean;
};

export type CookSession = {
  dishId: string;
  /** -1 is the "get ready" overview; 0..n-1 are steps; n is the finish screen. */
  step: number;
  servings: number;
  /** Ingredient ids ticked off in the "get ready" list. */
  ready: string[];
  /** Ingredient id → name of the substitute chosen. */
  swaps: Record<string, string>;
  timers: CookTimer[];
  startedAt: number;
  updatedAt: number;
};

type CookState = {
  sessions: Record<string, CookSession>;
  measure: Measure;
  keepAwake: boolean;
  setMeasure: (measure: Measure) => void;
  setKeepAwake: (keepAwake: boolean) => void;
  start: (dishId: string, servings: number) => CookSession;
  update: (dishId: string, patch: Partial<Omit<CookSession, "dishId">>) => void;
  end: (dishId: string) => void;
  startTimer: (dishId: string, timer: Omit<CookTimer, "endsAt" | "remainingMs" | "done">) => void;
  pauseTimer: (dishId: string, timerId: string) => void;
  resumeTimer: (dishId: string, timerId: string) => void;
  resetTimer: (dishId: string, timerId: string) => void;
  finishTimer: (dishId: string, timerId: string) => void;
  dismissTimer: (dishId: string, timerId: string) => void;
};

function patchTimer(
  session: CookSession,
  timerId: string,
  fn: (t: CookTimer) => CookTimer | null,
): CookSession {
  const timers = session.timers.flatMap((t) => {
    if (t.id !== timerId) return [t];
    const next = fn(t);
    return next ? [next] : [];
  });
  return { ...session, timers, updatedAt: Date.now() };
}

export const useCook = create<CookState>()(
  persist(
    (set, get) => {
      const withSession = (dishId: string, fn: (s: CookSession) => CookSession) => {
        const session = get().sessions[dishId];
        if (!session) return;
        set({ sessions: { ...get().sessions, [dishId]: fn(session) } });
      };
      return {
        sessions: {},
        measure: "us",
        keepAwake: true,
        setMeasure: (measure) => set({ measure }),
        setKeepAwake: (keepAwake) => set({ keepAwake }),
        start: (dishId, servings) => {
          const existing = get().sessions[dishId];
          if (existing) return existing;
          const now = Date.now();
          const session: CookSession = {
            dishId,
            step: -1,
            servings,
            ready: [],
            swaps: {},
            timers: [],
            startedAt: now,
            updatedAt: now,
          };
          set({ sessions: { ...get().sessions, [dishId]: session } });
          return session;
        },
        update: (dishId, patch) =>
          withSession(dishId, (s) => ({ ...s, ...patch, updatedAt: Date.now() })),
        end: (dishId) => {
          const { [dishId]: _ended, ...rest } = get().sessions;
          set({ sessions: rest });
        },
        startTimer: (dishId, timer) =>
          withSession(dishId, (s) => ({
            ...s,
            timers: [
              ...s.timers.filter((t) => t.id !== timer.id),
              {
                ...timer,
                endsAt: Date.now() + timer.durationMs,
                remainingMs: timer.durationMs,
                done: false,
              },
            ],
            updatedAt: Date.now(),
          })),
        pauseTimer: (dishId, timerId) =>
          withSession(dishId, (s) =>
            patchTimer(s, timerId, (t) =>
              t.endsAt === null
                ? t
                : { ...t, remainingMs: Math.max(0, t.endsAt - Date.now()), endsAt: null },
            ),
          ),
        resumeTimer: (dishId, timerId) =>
          withSession(dishId, (s) =>
            patchTimer(s, timerId, (t) =>
              t.endsAt !== null ? t : { ...t, endsAt: Date.now() + t.remainingMs },
            ),
          ),
        resetTimer: (dishId, timerId) =>
          withSession(dishId, (s) => patchTimer(s, timerId, () => null)),
        finishTimer: (dishId, timerId) =>
          withSession(dishId, (s) =>
            patchTimer(s, timerId, (t) => ({ ...t, done: true, endsAt: null, remainingMs: 0 })),
          ),
        dismissTimer: (dishId, timerId) =>
          withSession(dishId, (s) => patchTimer(s, timerId, () => null)),
      };
    },
    { name: "wfc-cook", version: 1 },
  ),
);

/** Milliseconds left on a timer right now. */
export function timeLeft(timer: CookTimer, now = Date.now()): number {
  if (timer.done) return 0;
  return timer.endsAt === null ? timer.remainingMs : Math.max(0, timer.endsAt - now);
}
