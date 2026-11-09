import { type ReactNode, useEffect, useRef } from "react";
import { AppState } from "react-native";

import { useBottomSheetModal } from "@gorhom/bottom-sheet";

import { useAppStore, useSecurityStore } from "@/lib/store";

type LockScreenProviderProps = {
  children: ReactNode;
};

export function LockScreenProvider({ children }: LockScreenProviderProps) {
  const backgroundTimestamp = useRef<number | null>(null);

  const { dismissAll } = useBottomSheetModal();
  const triggerDismissAll = useAppStore((state) => state.triggerDismissAll);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        backgroundTimestamp.current ??= Date.now();
        return;
      }

      if (nextAppState !== "active") return;

      dismissAll();
      triggerDismissAll();

      const backgroundAt = backgroundTimestamp.current;
      backgroundTimestamp.current = null;

      if (backgroundAt === null) return;

      const security = useSecurityStore.getState();

      if (
        !security.enablePasscode ||
        !security.passcode ||
        !security.isLockable ||
        security.isLockDisabled
      ) {
        return;
      }

      const elapsedTime = Date.now() - backgroundAt;

      if (elapsedTime >= security.lockInterval) {
        security.setIsLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dismissAll, triggerDismissAll]);

  return children;
}
