import { create } from "zustand";

/** Transient UI state shared across the shell: search and the phone menu. */
type UiState = {
  searchOpen: boolean;
  searchQuery: string;
  navOpen: boolean;
  openSearch: (query?: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setNavOpen: (open: boolean) => void;
};

export const useUi = create<UiState>()((set) => ({
  searchOpen: false,
  searchQuery: "",
  navOpen: false,
  openSearch: (query) => set({ searchOpen: true, navOpen: false, searchQuery: query ?? "" }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setNavOpen: (navOpen) => set({ navOpen }),
}));
