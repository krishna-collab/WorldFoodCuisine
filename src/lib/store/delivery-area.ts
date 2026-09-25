import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { areaStatus, type AreaStatus } from "@/lib/ordering/zones";
import { useHydrated } from "@/lib/use-hydrated";

type DeliveryAreaState = {
  postalCode: string | null;
  /** Demo mode: any ZIP maps to a clearly labeled demo zone. */
  demo: boolean;
  dialogOpen: boolean;
  setPostalCode: (postalCode: string | null) => void;
  setDemo: (demo: boolean) => void;
  openDialog: () => void;
  closeDialog: () => void;
};

export const useDeliveryArea = create<DeliveryAreaState>()(
  persist(
    (set) => ({
      postalCode: null,
      demo: false,
      dialogOpen: false,
      setPostalCode: (postalCode) => set({ postalCode }),
      setDemo: (demo) => set({ demo }),
      openDialog: () => set({ dialogOpen: true }),
      closeDialog: () => set({ dialogOpen: false }),
    }),
    {
      name: "wfc-delivery-area",
      partialize: (s) => ({ postalCode: s.postalCode, demo: s.demo }),
    },
  ),
);

/**
 * Where the visitor is ordering to, and whether anyone delivers there.
 * Returns "unset" until hydrated so server and client render the same markup.
 */
export function useAreaStatus(): AreaStatus & { demo: boolean } {
  const hydrated = useHydrated();
  const postalCode = useDeliveryArea((s) => s.postalCode);
  const demo = useDeliveryArea((s) => s.demo);
  return useMemo(() => {
    if (!hydrated) return { kind: "unset" as const, demo: false };
    return { ...areaStatus(postalCode, demo), demo };
  }, [hydrated, postalCode, demo]);
}
