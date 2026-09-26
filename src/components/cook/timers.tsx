import * as Popover from "@radix-ui/react-popover";
import { Bell, BellOff, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatClock, spokenDuration } from "@/lib/food/quantity";
import type { RecipeStep } from "@/lib/food/types";
import { type CookTimer, timeLeft, useCook } from "@/lib/store/cook";
import { cn } from "@/lib/utils";

function useTimerActions(dishId: string) {
  const startTimer = useCook((s) => s.startTimer);
  const pauseTimer = useCook((s) => s.pauseTimer);
  const resumeTimer = useCook((s) => s.resumeTimer);
  const resetTimer = useCook((s) => s.resetTimer);
  const dismissTimer = useCook((s) => s.dismissTimer);
  return {
    start: (step: RecipeStep) =>
      step.timer &&
      startTimer(dishId, {
        id: step.id,
        label: step.timer.label,
        stepId: step.id,
        durationMs: step.timer.seconds * 1000,
      }),
    pause: (id: string) => pauseTimer(dishId, id),
    resume: (id: string) => resumeTimer(dishId, id),
    reset: (id: string) => resetTimer(dishId, id),
    dismiss: (id: string) => dismissTimer(dishId, id),
  };
}

/** Ask for notification permission only when someone chooses to be alerted. */
function NotifyToggle() {
  const [permission, setPermission] = useState(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );
  if (permission === "unsupported" || permission === "denied") return null;
  if (permission === "granted") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-subtle">
        <Bell className="size-3.5" aria-hidden="true" />
        You’ll get a notification if you leave this page.
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={async () => setPermission(await Notification.requestPermission())}
      className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-muted underline underline-offset-2 hover:text-fg"
    >
      <BellOff className="size-4" aria-hidden="true" />
      Notify me if I leave this page
    </button>
  );
}

/** The timer for the step on screen: big countdown, one clear control. */
export function StepTimer({
  dishId,
  step,
  timer,
  now,
}: {
  dishId: string;
  step: RecipeStep;
  timer: CookTimer | undefined;
  now: number;
}) {
  const actions = useTimerActions(dishId);
  if (!step.timer) return null;
  const left = timer ? timeLeft(timer, now) : step.timer.seconds * 1000;
  const running = Boolean(timer && timer.endsAt !== null && !timer.done);
  const done = Boolean(timer?.done);

  return (
    <section
      aria-label={`${step.timer.label} timer`}
      className={cn(
        "rounded-2xl p-5 sm:p-6",
        done ? "timer-done bg-accent text-accent-fg" : "bg-surface shadow-[var(--shadow-hairline)]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={cn("eyebrow", done ? "" : "text-subtle")}>
            <Timer className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
            {step.timer.label}
          </p>
          <p
            className="nums mt-1 font-display text-[3.25rem] leading-none tracking-tight sm:text-[4rem]"
            aria-hidden="true"
          >
            {done ? "Done" : formatClock(left / 1000)}
          </p>
          <p className="sr-only">
            {done
              ? `${step.timer.label} is done`
              : `${spokenDuration(left / 1000)} ${running ? "left" : timer ? "left, paused" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          {done ? (
            <Button variant="primary" size="xl" onClick={() => actions.dismiss(step.id)}>
              OK
            </Button>
          ) : !timer ? (
            <Button variant="herb" size="xl" onClick={() => actions.start(step)}>
              <Play className="size-5" aria-hidden="true" />
              Start timer
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="icon-xl"
                onClick={() => actions.reset(step.id)}
                aria-label={`Reset ${step.timer.label} timer`}
              >
                <RotateCcw className="size-5" aria-hidden="true" />
              </Button>
              <Button
                variant={running ? "secondary" : "herb"}
                size="xl"
                onClick={() => (running ? actions.pause(step.id) : actions.resume(step.id))}
              >
                {running ? (
                  <Pause className="size-5" aria-hidden="true" />
                ) : (
                  <Play className="size-5" aria-hidden="true" />
                )}
                {running ? "Pause" : "Resume"}
              </Button>
            </>
          )}
        </div>
      </div>
      {running ? (
        <div className="mt-3">
          <NotifyToggle />
        </div>
      ) : null}
    </section>
  );
}

/** Top-bar button listing every timer, so several can run at once. */
export function TimerTray({
  dishId,
  timers,
  now,
  onGoToStep,
}: {
  dishId: string;
  timers: CookTimer[];
  now: number;
  onGoToStep: (stepId: string) => void;
}) {
  const actions = useTimerActions(dishId);
  const done = timers.filter((t) => t.done).length;
  const next = [...timers]
    .filter((t) => !t.done)
    .sort((a, b) => timeLeft(a, now) - timeLeft(b, now))[0];

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          "flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold",
          done ? "timer-done bg-accent text-accent-fg" : timers.length ? "bg-herb-soft text-herb" : "text-muted hover:bg-sunken",
        )}
        aria-label={
          timers.length
            ? `Timers: ${timers.length}${done ? `, ${done} done` : ""}`
            : "Timers: none running"
        }
      >
        <Timer className="size-5" aria-hidden="true" />
        <span className="nums">
          {done ? "Done" : next ? formatClock(timeLeft(next, now) / 1000) : ""}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-surface p-3 shadow-[var(--shadow-raised),0_0_0_1px_var(--color-border)]"
        >
          <p className="eyebrow px-2 pt-1 text-subtle">Timers</p>
          {timers.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted">
              No timers running. Steps with a wait have a Start timer button.
            </p>
          ) : (
            <ul className="mt-2 space-y-1">
              {timers.map((t) => {
                const running = t.endsAt !== null && !t.done;
                return (
                  <li key={t.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-sunken">
                    <button
                      type="button"
                      onClick={() => onGoToStep(t.stepId)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{t.label}</span>
                      <span className="nums block text-lg">
                        {t.done ? "Done" : formatClock(timeLeft(t, now) / 1000)}
                        {!t.done && !running ? " · paused" : ""}
                      </span>
                    </button>
                    {t.done ? (
                      <Button size="icon-sm" variant="ghost" onClick={() => actions.dismiss(t.id)} aria-label={`Dismiss ${t.label}`}>
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    ) : (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => (running ? actions.pause(t.id) : actions.resume(t.id))}
                        aria-label={`${running ? "Pause" : "Resume"} ${t.label}`}
                      >
                        {running ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
