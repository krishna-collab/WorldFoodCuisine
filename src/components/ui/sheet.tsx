import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A modal panel: a bottom sheet on phones, a side panel from `md`. Radix
 * handles focus trapping and Escape. These sheets are opened by ordinary
 * buttons rather than a Radix trigger, so the sheet remembers what had focus
 * and puts focus back there when it closes.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
}) {
  const returnTo = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            // Still the button that opened the sheet: focus hasn't moved in yet.
            returnTo.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            const target = returnTo.current;
            if (target?.isConnected) {
              event.preventDefault();
              target.focus();
            }
          }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-2xl bg-surface text-fg shadow-[var(--shadow-sheet)] outline-none",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "md:inset-y-0 md:bottom-auto md:h-dvh md:max-h-none md:w-[26rem] md:rounded-none",
            side === "right"
              ? "md:right-0 md:left-auto md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
              : "md:right-auto md:left-0 md:data-[state=closed]:slide-out-to-left md:data-[state=open]:slide-in-from-left",
          )}
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border-strong md:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="font-display text-display-s">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-muted">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sunken hover:text-fg"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
          {footer ? <div className="border-t border-border px-5 py-4 pb-safe">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
