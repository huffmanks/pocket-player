import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { InteractionManager } from "react-native";

import { useShallow } from "zustand/react/shallow";

import handleRedirect from "@/lib/handle-redirect";
import { useAppStore, useSettingsStore } from "@/lib/store";

export function useNavigationInterceptor() {
  const navigation = useNavigation();

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
      if (hasRedirected) return;
      e.preventDefault();
      unsubscribe();

      setHasRedirected(true);
      InteractionManager.runAfterInteractions(() => {
        handleRedirect({ lastVisitedPath, previousVisitedPath });
      });
    });

    return () => {
      setHasRedirected(false);
      unsubscribe();
    };
  }, []);
}
