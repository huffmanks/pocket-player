import { usePathname } from "expo-router";
import { useEffect } from "react";

import { useAppStore, useSettingsStore } from "@/lib/store";
import { debouncedSet } from "@/lib/utils";

export function RouteTracker() {
  const pathname = usePathname();

  const isAppReady = useAppStore((state) => state.isAppReady);

  const setPreviousPath = useSettingsStore((state) => state.setPreviousPath);

  useEffect(() => {
    if (!isAppReady) return;

    debouncedSet(pathname, setPreviousPath);
  }, [isAppReady, pathname]);

  return null;
}
