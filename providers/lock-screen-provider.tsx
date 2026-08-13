import { useRouter } from "expo-router";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useShallow } from "zustand/react/shallow";

import { useAppStore, useSecurityStore } from "@/lib/store";

interface LockScreenProviderProps {
  children: ReactNode;
}

export function LockScreenProvider({ children }: LockScreenProviderProps) {
  const router = useRouter();

  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  const { dismissAll } = useBottomSheetModal();
  const triggerDismissAll = useAppStore((state) => state.triggerDismissAll);
  const { enablePasscode, passcode, isLockable, lockInterval, isLockDisabled, setIsLocked } =
    useSecurityStore(
      useShallow((state) => ({
        enablePasscode: state.enablePasscode,
        passcode: state.passcode,
        isLockable: state.isLockable,
        lockInterval: state.lockInterval,
        isLockDisabled: state.isLockDisabled,
        setIsLocked: state.setIsLocked,
      }))
    );

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        dismissAll();
        triggerDismissAll();
      }

      if (!enablePasscode || !passcode || isLockDisabled || !isLockable) return;

      if (nextAppState === "background") {
        backgroundTimestamp.current = Date.now();
      } else if (nextAppState === "active") {
        if (backgroundTimestamp.current) {
          const elapsedTime = Date.now() - backgroundTimestamp.current;
          if (elapsedTime > lockInterval) {
            setIsLocked(true);
            router.push("/(screens)/lock");
          }

          backgroundTimestamp.current = null;
        }
      }

      appState.current = nextAppState;
    },
    [
      dismissAll,
      triggerDismissAll,
      enablePasscode,
      isLockDisabled,
      isLockable,
      lockInterval,
      passcode,
      router,
      setIsLocked,
    ]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  return children;
}
