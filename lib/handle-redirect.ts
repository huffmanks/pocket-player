import { type Href, router } from "expo-router";

import { EXCLUDED_PATHS } from "@/lib/constants";

interface HandleRedirectProps {
  lastVisitedPath: string;
  previousVisitedPath: string;
}
const DEFAULT_FALLBACK: Href = "/(tabs)/videos";

export default async function handleRedirect({
  lastVisitedPath,
  previousVisitedPath,
}: HandleRedirectProps) {
  const targetPath = (
    EXCLUDED_PATHS.includes(lastVisitedPath)
      ? previousVisitedPath || DEFAULT_FALLBACK
      : lastVisitedPath || DEFAULT_FALLBACK
  ) as Href;

  router.replace(targetPath);
}
