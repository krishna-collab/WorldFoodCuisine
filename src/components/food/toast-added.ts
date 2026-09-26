import { toast } from "sonner";
import { useCart } from "@/lib/store/cart";

/** Confirms an add without opening the bag, with a way to open it. */
export function toastAdded(message: string) {
  toast.success(message, {
    action: { label: "View bag", onClick: () => useCart.getState().setOpen(true) },
  });
}
