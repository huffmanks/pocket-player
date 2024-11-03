import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { LOCK_SCREEN_TIMEOUT } from "@/lib/constants";
import { lockScreenStorage, settingsStorage } from "@/lib/storage";

export function LockScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    const isLocked = lockScreenStorage.getBoolean("isLocked");

    if (isLocked !== false) {
      lockScreenStorage.set("isLocked", true);
      router.push("/(modals)/lock");
    }

    function handleAppStateChange(nextAppState: AppStateStatus) {
      if (settingsStorage.getBoolean("enablePasscode")) return;

      if (nextAppState === "background") {
        lockScreenStorage.set("backgroundTime", Date.now());
      } else if (nextAppState === "active") {
        const backgroundTime = lockScreenStorage.getNumber("backgroundTime") || 0;
        const elapsedTime = Date.now() - backgroundTime;

        if (elapsedTime > LOCK_SCREEN_TIMEOUT) {
          lockScreenStorage.set("isLocked", true);
          router.push("/(modals)/lock");
        }
      }

      appState.current = nextAppState;
    }

    return () => {
      lockScreenStorage.set("isLocked", settingsStorage.getBoolean("enablePasscode") || false);
      subscription.remove();
    };
  }, []);

  return children;
}
