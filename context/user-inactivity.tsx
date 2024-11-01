import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { MMKV } from "react-native-mmkv";

import { LOCK_TIME } from "@/lib/constants";

const storage = new MMKV({
  id: "UserInactivity",
});

export function UserInactivityProvider({ children }: { children: ReactNode }) {
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    const isFirstLaunch = storage.getBoolean("isFirstLaunch") ?? true;

    if (isFirstLaunch) {
      router.push("/(modals)/lock");
      storage.set("isFirstLaunch", false);
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
      storage.set("isFirstLaunch", true);
    };
  }, []);

  async function handleAppStateChange(nextAppState: AppStateStatus) {
    if (nextAppState === "background") {
      router.push("/privacy");

      recordStartTime();
    } else if (nextAppState === "active" && appState.current === "background") {
      const elapsed = Date.now() - (storage.getNumber("startTime") || 0);

      if (elapsed >= LOCK_TIME) {
        router.push("/(modals)/lock");
      }
    }

    appState.current = nextAppState;
  }

  async function recordStartTime() {
    storage.set("startTime", Date.now());
  }

  return children;
}
