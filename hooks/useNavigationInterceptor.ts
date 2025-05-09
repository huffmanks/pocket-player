import { useNavigation } from "expo-router";
import { useEffect } from "react";

import { useShallow } from "zustand/react/shallow";

import handleRedirect from "@/lib/handle-redirect";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";

export function useNavigationInterceptor() {
  const navigation = useNavigation();

  const isLockable = useSecurityStore((state) => state.isLockable);
  const { hasRedirected, setHasRedirected } = useAppStore(
    useShallow((state) => ({
      hasRedirected: state.hasRedirected,
      setHasRedirected: state.setHasRedirected,
    }))
  );
  const { lastVisitedPath, previousVisitedPath } = useSettingsStore(
    useShallow((state) => ({
      lastVisitedPath: state.lastVisitedPath,
      previousVisitedPath: state.previousVisitedPath,
    }))
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (hasRedirected || isLockable) return;
      e.preventDefault();
      unsubscribe();

      setHasRedirected(true);

      setTimeout(() => {
        handleRedirect({ lastVisitedPath, previousVisitedPath });
      }, 0);
    });

    return unsubscribe;
  }, []);
}
