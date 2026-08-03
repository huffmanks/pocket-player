import { type Href, router } from "expo-router";

interface HandleRedirectProps {
  lastVisitedPath: string;
  previousVisitedPath: string;
}
const DEFAULT_FALLBACK: Href = "/(tabs)/videos";

export default async function handleRedirect({
  lastVisitedPath,
  previousVisitedPath,
}: HandleRedirectProps) {
  const targetPath = (lastVisitedPath || previousVisitedPath || DEFAULT_FALLBACK) as Href;

  if (typeof targetPath === "string" && targetPath.includes("/modal")) {
    const fallbackPath = (previousVisitedPath || DEFAULT_FALLBACK) as Href;
    router.replace(fallbackPath);
    return;
  }

  router.replace(targetPath);
}
