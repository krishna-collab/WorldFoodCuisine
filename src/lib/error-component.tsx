import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const message = offline
    ? "This page hasn’t been saved on this device yet. Reconnect and try again; pages you’ve opened before still work offline."
    : error instanceof Error && error.message
      ? error.message
      : "An unexpected error occurred.";
  return (
    <div
      role="alert"
      className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg"
    >
      <p className="eyebrow text-accent">
        {offline ? "No connection" : "Something went wrong"}
      </p>
      <h1 className="text-display-l">
        {offline ? "You’re offline" : "This page didn’t load"}
      </h1>
      <p className="max-w-md text-sm break-words text-muted">{message}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg"
        >
          Try again
        </button>
        <a href="/" className="flex h-11 items-center rounded-full px-5 text-sm font-semibold text-fg shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
          Home
        </a>
      </div>
    </div>
  );
}
