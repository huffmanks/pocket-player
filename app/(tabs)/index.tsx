import { SplashScreen, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { getRedirectPath } from "@/lib/get-redirect-path";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { delay } from "@/lib/utils";

export default function IndexScreen() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  const isAppReady = useAppStore((state) => state.isAppReady);
  const isLocked = useSecurityStore((state) => state.isLocked);
  const _hasHydrated = useSettingsStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!isAppReady || !_hasHydrated || hasRedirected.current) return;
    hasRedirected.current = true;

    async function hideSplashScreen() {
      try {
        if (isLocked) {
          router.replace("/(screens)/lock");
          return;
        }

        const { lastVisitedPath, previousVisitedPath } = useSettingsStore.getState();
        const targetPath = getRedirectPath({ lastVisitedPath, previousVisitedPath });
        router.replace(targetPath);
      } finally {
        await delay(1000);
        await SplashScreen.hideAsync();
      }
    }

    hideSplashScreen();
  }, [isAppReady, isLocked, _hasHydrated, router]);

  return null;
}
