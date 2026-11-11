import type { Href } from "expo-router";

import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

export const settingsStorage = createMMKV({ id: "settings" });

const settingsZustandStorage: StateStorage = {
  setItem: (key, value) => settingsStorage.set(key, value),
  getItem: (key) => settingsStorage.getString(key) ?? null,
  removeItem: (key) => settingsStorage.remove(key),
};

type SettingsStoreState = {
  _hasHydrated: boolean;
  autoPlay: boolean;
  loop: boolean;
  mute: boolean;
  isNativeControls: boolean;
  overrideOrientation: boolean;
  theme: "light" | "dark";
  sortKey: "date" | "title";
  sortDateOrder: "asc" | "desc";
  sortTitleOrder: "asc" | "desc";
  scrollIndex: number;
  lastVisitedPath: Href;
  previousVisitedPath: Href;
};

type SettingsStoreActions = {
  setAutoPlay: (autoPlay: boolean) => void;
  setLoop: (loop: boolean) => void;
  setMute: (mute: boolean) => void;
  setIsNativeControls: (isNativeControls: boolean) => void;
  setOverrideOrientation: (overrideOrientation: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSortKey: (key: "date" | "title") => void;
  toggleSortDateOrder: () => void;
  toggleSortTitleOrder: () => void;
  setScrollIndex: (index: number) => void;
  setLastVisitedPath: (path: Href) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
};

const initialSettingsStoreState: Omit<SettingsStoreState, "_hasHydrated"> = {
  autoPlay: false,
  loop: false,
  mute: false,
  isNativeControls: false,
  overrideOrientation: false,
  theme: "dark",
  sortKey: "date",
  sortDateOrder: "asc",
  sortTitleOrder: "asc",
  scrollIndex: 0,
  lastVisitedPath: "/",
  previousVisitedPath: "/",
};

export const useSettingsStore = create<SettingsStoreState & SettingsStoreActions>()(
  persist(
    (set) => ({
      ...initialSettingsStoreState,
      _hasHydrated: false,
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setLoop: (loop) => set({ loop }),
      setMute: (mute) => set({ mute }),
      setIsNativeControls: (isNativeControls) => set({ isNativeControls }),
      setOverrideOrientation: (overrideOrientation) => set({ overrideOrientation }),
      setTheme: (theme) => set({ theme }),
      setSortKey: (key) => set({ sortKey: key }),
      toggleSortDateOrder: () =>
        set((state) => ({ sortDateOrder: state.sortDateOrder === "asc" ? "desc" : "asc" })),
      toggleSortTitleOrder: () =>
        set((state) => ({ sortTitleOrder: state.sortTitleOrder === "asc" ? "desc" : "asc" })),
      setScrollIndex: (index) => set({ scrollIndex: index }),
      setLastVisitedPath: (path) =>
        set((state) => {
          if (state.lastVisitedPath === path) return {};
          return {
            previousVisitedPath: state.lastVisitedPath,
            lastVisitedPath: path,
          };
        }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      reset: () => set({ ...initialSettingsStoreState, _hasHydrated: true }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => settingsZustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
