import { usePathname } from "expo-router";
import { useEffect } from "react";

import { useShallow } from "zustand/react/shallow";

import { EXCLUDED_PATHS } from "@/lib/constants";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";

export function RouteTracker() {
  const pathname = usePathname();

  const isAppReady = useAppStore((state) => state.isAppReady);
  const isLocked = useSecurityStore((state) => state.isLocked);

  const { currentPath, setCurrentPath, setPreviousPath } = useSettingsStore(
    useShallow((state) => ({
      currentPath: state.currentPath,
      setCurrentPath: state.setCurrentPath,
      setPreviousPath: state.setPreviousPath,
    }))
  );

  useEffect(() => {
    if (!isAppReady || isLocked) return;

    if (!EXCLUDED_PATHS.includes(pathname)) {
      setPreviousPath(currentPath);
      setCurrentPath(pathname);
    }
  }, [isAppReady, isLocked, pathname]);

  return null;
}
