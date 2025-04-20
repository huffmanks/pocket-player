import { usePathname } from "expo-router";
import { useEffect } from "react";

import { EXCLUDED_PATHS } from "@/lib/constants";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";

export function RouteTracker() {
  const pathname = usePathname();

  const isAppReady = useAppStore((state) => state.isAppReady);
  const isLocked = useSecurityStore((state) => state.isLocked);
  const setPreviousPath = useSettingsStore((state) => state.setPreviousPath);

  useEffect(() => {
    if (!isAppReady || isLocked) return;

    if (!EXCLUDED_PATHS.includes(pathname)) {
      setPreviousPath(pathname);
    }
  }, [isAppReady, pathname]);

  return null;
}
