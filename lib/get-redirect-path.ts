import type { Href } from "expo-router";

import { DEFAULT_FALLBACK, EXCLUDED_PATHS } from "@/lib/constants";

interface RedirectPaths {
  lastVisitedPath?: Href | null;
  previousVisitedPath?: Href | null;
}

export function getRedirectPath({ lastVisitedPath, previousVisitedPath }: RedirectPaths): Href {
  if (lastVisitedPath && !EXCLUDED_PATHS.includes(lastVisitedPath)) {
    return lastVisitedPath;
  }

  if (previousVisitedPath && !EXCLUDED_PATHS.includes(previousVisitedPath)) {
    return previousVisitedPath;
  }

  return DEFAULT_FALLBACK;
}
