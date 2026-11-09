import { create } from "zustand";

type AppStoreState = {
  isAppStartUp: boolean;
  isAppReady: boolean;
  setIsAppStartUp: (bool: boolean) => void;
  setIsAppReady: (bool: boolean) => void;
  dismissAll: boolean;
  triggerDismissAll: () => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isAppStartUp: false,
  isAppReady: false,
  setIsAppStartUp: (bool) => set({ isAppStartUp: bool }),
  setIsAppReady: (bool) => set({ isAppReady: bool }),
  dismissAll: false,
  triggerDismissAll: () => set({ dismissAll: true }),
}));
