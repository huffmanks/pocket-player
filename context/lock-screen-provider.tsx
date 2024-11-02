import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { LOCK_SCREEN_TIMEOUT } from "@/lib/constants";

export function LockScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    async function checkLockStatus() {
      const isLocked = await AsyncStorage.getItem("isLocked");

      if (isLocked !== "false") {
        await AsyncStorage.setItem("isLocked", "true");
        router.push("/(modals)/lock");
      }
    }

    async function handleAppStateChange(nextAppState: AppStateStatus) {
      if (nextAppState === "background") {
        await AsyncStorage.setItem("backgroundTime", Date.now().toString());
      } else if (nextAppState === "active") {
        const backgroundTime = await AsyncStorage.getItem("backgroundTime");
        const elapsedTime = Date.now() - Number(backgroundTime);

        if (elapsedTime > LOCK_SCREEN_TIMEOUT) {
          await AsyncStorage.setItem("isLocked", "true");
          checkLockStatus();
        }
      }

      appState.current = nextAppState;
    }

    (async () => {
      await checkLockStatus();
    })();

    async function setLocked() {
      await AsyncStorage.setItem("isLocked", "true");
    }

    return () => {
      (async () => {
        await setLocked();
        subscription.remove();
      })();
    };
  }, []);

  return children;
}
