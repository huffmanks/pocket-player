import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useShallow } from "zustand/react/shallow";

import { useSecurityStore } from "@/lib/store";

export function LockScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  const { dismissAll } = useBottomSheetModal();

  const {
    enablePasscode,
    passcode,
    isLocked,
    isLockable,
    lockInterval,
    isLockDisabled,
    setIsLocked,
  } = useSecurityStore(
    useShallow((state) => ({
      enablePasscode: state.enablePasscode,
      passcode: state.passcode,
      isLocked: state.isLocked,
      isLockable: state.isLockable,
      lockInterval: state.lockInterval,
      isLockDisabled: state.isLockDisabled,
      setIsLocked: state.setIsLocked,
    }))
  );

  useEffect(() => {
    if (!isLockable || isLockDisabled) return;

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    if (isLocked) {
      router.push("/(modals)/lock");
    }

    return () => {
      subscription.remove();
    };
  }, [isLockDisabled, isLockable, lockInterval]);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    if (!enablePasscode || !passcode || isLockDisabled) return;

    if (nextAppState === "background") {
      backgroundTimestamp.current = Date.now();
    } else if (nextAppState === "active") {
      dismissAll();

      if (backgroundTimestamp.current) {
        const elapsedTime = Date.now() - backgroundTimestamp.current;
        if (elapsedTime > lockInterval) {
          setIsLocked(true);
          router.push("/(modals)/lock");
        }

        backgroundTimestamp.current = null;
      }
    }

    appState.current = nextAppState;
  }

  return children;
}
