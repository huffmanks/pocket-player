import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { LOCK_INTERVAL_DEFAULT } from "@/lib/constants";
import { hashPasscode } from "@/lib/passcode";

export const securityStorage = createMMKV({
  id: "security",
  encryptionKey: process.env?.SECURITY_STORAGE_KEY ?? "your-encryption-key",
});

const securityZustandStorage: StateStorage = {
  setItem: (key, value) => securityStorage.set(key, value),
  getItem: (key) => securityStorage.getString(key) ?? null,
  removeItem: (key) => securityStorage.remove(key),
};

type SecurityStoreState = {
  _hasHydrated: boolean;
  isLocked: boolean;
  enablePasscode: boolean;
  passcode: string | null;
  isLockable: boolean;
  lockInterval: number;
  isLockDisabled: boolean;
};

type SecurityStoreActions = {
  setPasscode: (code: string) => Promise<void>;
  setIsLocked: (lock: boolean) => void;
  setEnablePasscode: (enable: boolean) => void;
  setLockInterval: (milliseconds: number) => void;
  setIsLockDisabled: (bool: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
};

const initialSecurityStoreState: SecurityStoreState = {
  _hasHydrated: false,
  isLocked: false,
  enablePasscode: false,
  passcode: null,
  isLockable: false,
  lockInterval: LOCK_INTERVAL_DEFAULT,
  isLockDisabled: false,
};

export const useSecurityStore = create<SecurityStoreState & SecurityStoreActions>()(
  persist(
    (set) => ({
      ...initialSecurityStoreState,
      setPasscode: async (code) => {
        const hashedPasscode = code ? await hashPasscode(code) : null;

        set({
          passcode: hashedPasscode,
          isLockable: true,
          enablePasscode: true,
        });
      },
      setIsLocked: (lock) => set({ isLocked: lock }),
      setEnablePasscode: (enable) =>
        set((state) => {
          if (!enable) {
            return {
              enablePasscode: false,
              isLockable: false,
              passcode: null,
            };
          }

          return {
            enablePasscode: true,
            isLockable: state.passcode !== null,
          };
        }),
      setLockInterval: (milliseconds) => set({ lockInterval: Math.max(0, milliseconds) }),
      setIsLockDisabled: (bool) => set({ isLockDisabled: bool }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      reset: () => set({ ...initialSecurityStoreState, _hasHydrated: true }),
    }),
    {
      name: "security-store",
      storage: createJSONStorage(() => securityZustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
