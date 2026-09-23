import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cities } from "@/lib/food/data";

type CityState = {
  cityId: string;
  setCity: (cityId: string) => void;
};

export const useCity = create<CityState>()(
  persist(
    (set) => ({
      cityId: cities[0]?.id ?? "sf",
      setCity: (cityId) => set({ cityId }),
    }),
    { name: "wfc-city" },
  ),
);
