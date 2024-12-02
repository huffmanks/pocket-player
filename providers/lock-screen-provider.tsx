import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useSecurityStore } from "@/lib/store";

export function LockScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  const {
    backgroundTime,
    enablePasscode,
    isLocked,
    isLockable,
    lockInterval,
    isLockDisabled,
    setBackgroundTime,
    setIsLocked,
  } = useSecurityStore(
    useShallow((state) => ({
      backgroundTime: state.backgroundTime,
      enablePasscode: state.enablePasscode,
      isLocked: state.isLocked,
      isLockable: state.isLockable,
      lockInterval: state.lockInterval,
      isLockDisabled: state.isLockDisabled,
      setBackgroundTime: state.setBackgroundTime,
      setIsLocked: state.setIsLocked,
    }))
  );

  useEffect(() => {
    if (!isLockable) return;

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    if (isLocked) {
      router.push("/(modals)/lock");
    }

    function handleAppStateChange(nextAppState: AppStateStatus) {
      if (!enablePasscode || isLockDisabled) return;

      if (nextAppState === "background") {
        setBackgroundTime();
      } else if (nextAppState === "active") {
        const newTime = backgroundTime || 0;
        const elapsedTime = Date.now() - newTime;

        if (elapsedTime > lockInterval) {
          setIsLocked(true);
          router.push("/(modals)/lock");
        }
      }

      appState.current = nextAppState;
    }

    return () => {
      setBackgroundTime();
      subscription.remove();
    };
  }, [isLockDisabled]);

  return children;
}
