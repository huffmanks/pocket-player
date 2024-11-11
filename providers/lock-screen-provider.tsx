import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { LOCK_SCREEN_TIMEOUT } from "@/lib/constants";
import { useSecurityStore } from "@/lib/store";

export function LockScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  const { backgroundTime, enablePasscode, isLocked, setBackgroundTime, setIsLocked } =
    useSecurityStore(
      useShallow((state) => ({
        backgroundTime: state.backgroundTime,
        enablePasscode: state.enablePasscode,
        isLocked: state.isLocked,
        setBackgroundTime: state.setBackgroundTime,
        setIsLocked: state.setIsLocked,
      }))
    );

  useEffect(() => {
    if (!enablePasscode) return;

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    if (isLocked) {
      router.push("/(modals)/lock");
    }

    function handleAppStateChange(nextAppState: AppStateStatus) {
      if (enablePasscode) return;

      if (nextAppState === "background") {
        setBackgroundTime();
      } else if (nextAppState === "active") {
        const newTime = backgroundTime || 0;
        const elapsedTime = Date.now() - newTime;

        if (elapsedTime > LOCK_SCREEN_TIMEOUT) {
          setIsLocked(true);
          router.push("/(modals)/lock");
        }
      }

      appState.current = nextAppState;
    }

    return () => {
      const isLockedValue = enablePasscode ?? false;
      setIsLocked(isLockedValue);
      subscription.remove();
    };
  }, []);

  return children;
}
