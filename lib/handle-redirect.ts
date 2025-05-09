import { type Route, router } from "expo-router";

interface HandleRedirectProps {
  lastVisitedPath: string;
  previousVisitedPath: string;
}

export default function handleRedirect({
  lastVisitedPath,
  previousVisitedPath,
}: HandleRedirectProps) {
  if (lastVisitedPath.startsWith("/playlists/")) {
    router.replace("/(tabs)/playlists");

    setTimeout(() => {
      router.push(lastVisitedPath as Route);
    }, 0);
  } else if (lastVisitedPath.startsWith("/videos/")) {
    router.replace(previousVisitedPath as Route);

    setTimeout(() => {
      router.push(lastVisitedPath as Route);
    }, 0);
  } else {
    router.push(lastVisitedPath as Route);
  }
}
