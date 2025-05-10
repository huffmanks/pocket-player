import { SplashScreen, useRouter } from "expo-router";
import { ReactNode, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import handleRedirect from "@/lib/handle-redirect";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { delay } from "@/lib/utils";

export function LockScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number | null>(null);

  const { dismissAll } = useBottomSheetModal();

  const isAppReady = useAppStore((state) => state.isAppReady);
  const { lastVisitedPath, previousVisitedPath } = useSettingsStore(
    useShallow((state) => ({
      lastVisitedPath: state.lastVisitedPath,
      previousVisitedPath: state.previousVisitedPath,
    }))
  );
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

    return () => {
      subscription.remove();
    };
  }, [isLockDisabled, isLockable, lockInterval]);

  useEffect(() => {
    if (!isAppReady) return;

    async function restorePreviousRoute() {
      try {
        if (isLocked) {
          router.push("/(screens)/lock");
          await delay(250);
          await SplashScreen.hideAsync();
          return;
        }

        await handleRedirect({ lastVisitedPath, previousVisitedPath });
      } catch (error) {
        toast.error("Restoring previous route failed.");
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    restorePreviousRoute();
  }, [isAppReady]);

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
          router.push("/(screens)/lock");
        }

        backgroundTimestamp.current = null;
      }
    }

    appState.current = nextAppState;
  }

  return children;
}
