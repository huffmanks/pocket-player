import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { MMKV } from "react-native-mmkv";

const storage = new MMKV({
  id: "UserInactivity",
});

const LOCK_TIME = 3000;

export function UserInactivityProvider({ children }: { children: React.ReactNode }) {
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    if (nextAppState === "inactive") {
      router.push("/(modals)/privacy");
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }

    if (nextAppState === "background") {
      recordStartTime();
    } else if (nextAppState === "active" && appState.current === "background") {
      const elapsed = Date.now() - (storage.getNumber("startTime") || 0);

      if (elapsed >= LOCK_TIME) {
        router.push("/(modals)/lock");
      }
    }

    appState.current = nextAppState;
  }

  function recordStartTime() {
    storage.set("startTime", Date.now());
  }

  return <>{children}</>;
}
