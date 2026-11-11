import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { useShallow } from "zustand/react/shallow";

import { getRedirectPath } from "@/lib/get-redirect-path";
import { useSettingsStore } from "@/lib/store";

export default function RootIndex() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  const { lastVisitedPath, previousVisitedPath } = useSettingsStore(
    useShallow((state) => ({
      lastVisitedPath: state.lastVisitedPath,
      previousVisitedPath: state.previousVisitedPath,
    }))
  );

  useEffect(() => {
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    const previousPath = getRedirectPath({ lastVisitedPath: previousVisitedPath });
    const targetPath = getRedirectPath({ lastVisitedPath, previousVisitedPath });

    if (previousPath !== targetPath) {
      router.replace(previousPath);
      router.push(targetPath);
      return;
    }

    router.replace(targetPath);
  }, [lastVisitedPath, previousVisitedPath, router]);

  return null;
}
