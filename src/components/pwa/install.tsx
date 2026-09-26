import * as Dialog from "@radix-ui/react-dialog";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useInstall } from "@/lib/pwa/install";

export function InstallButton({
  variant = "secondary",
  size = "sm",
  label = "Install the app",
  className,
}: {
  variant?: "secondary" | "ghost" | "primary";
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const { available, ios, prompt } = useInstall();
  const [open, setOpen] = useState(false);
  if (!available) return null;
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => (ios ? setOpen(true) : void prompt())}
      >
        <Download className="size-4" aria-hidden="true" />
        {ios ? "Add to Home Screen" : label}
      </Button>
      {ios ? <IosInstructions open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}

function IosInstructions({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const returnTo = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Content
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl bg-surface p-6 shadow-[var(--shadow-raised)] outline-none"
          onOpenAutoFocus={() => {
            returnTo.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(e) => {
            if (returnTo.current?.isConnected) {
              e.preventDefault();
              returnTo.current.focus();
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="font-display text-display-s">
              Add WorldFood to your Home Screen
            </Dialog.Title>
            <Dialog.Close
              className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sunken"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm text-muted">
            It opens full screen, and dishes you save work without a connection.
          </Dialog.Description>
          <ol className="mt-5 space-y-3 text-[0.9375rem]">
            <li className="flex items-center gap-3">
              <span className="nums flex size-7 shrink-0 items-center justify-center rounded-full bg-sunken text-sm font-bold">
                1
              </span>
              <span>
                Tap <Share className="inline size-4 align-[-2px]" aria-label="Share" /> Share in
                Safari’s toolbar.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="nums flex size-7 shrink-0 items-center justify-center rounded-full bg-sunken text-sm font-bold">
                2
              </span>
              <span>
                Scroll down and tap{" "}
                <SquarePlus className="inline size-4 align-[-2px]" aria-hidden="true" /> Add to
                Home Screen.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="nums flex size-7 shrink-0 items-center justify-center rounded-full bg-sunken text-sm font-bold">
                3
              </span>
              <span>Tap Add.</span>
            </li>
          </ol>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
