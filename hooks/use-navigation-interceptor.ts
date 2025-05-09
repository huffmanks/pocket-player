import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { InteractionManager } from "react-native";

import { useNavigationState } from "@react-navigation/native";
import { useShallow } from "zustand/react/shallow";

import handleRedirect from "@/lib/handle-redirect";
import { useAppStore, useSettingsStore } from "@/lib/store";

export function useNavigationInterceptor() {
  const navigation = useNavigation();
  const navState = useNavigationState((state) => state);

  const { hasRedirected, setHasRedirected } = useAppStore(
    useShallow((state) => ({
      hasRedirected: state.hasRedirected,
      setHasRedirected: state.setHasRedirected,
    }))
  );
  const { currentPath, previousPath } = useSettingsStore(
    useShallow((state) => ({
      currentPath: state.currentPath,
      previousPath: state.previousPath,
    }))
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (hasRedirected) return;

      const isRouteStale = navState.routes[navState.index - 1].state?.stale;
      if (!isRouteStale) return;

      e.preventDefault();
      unsubscribe();

      setHasRedirected(true);
      InteractionManager.runAfterInteractions(() => {
        handleRedirect({ currentPath, previousPath });
      });
    });

    return () => {
      setHasRedirected(false);
      unsubscribe();
    };
  }, [navigation, navState]);
}
