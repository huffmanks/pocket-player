import { type Route, router } from "expo-router";

import { delay } from "@/lib/utils";

interface HandleRedirectProps {
  lastVisitedPath: string;
  previousVisitedPath: string;
}

export default async function handleRedirect({
  lastVisitedPath,
  previousVisitedPath,
}: HandleRedirectProps) {
  if (
    (lastVisitedPath.startsWith("/playlists/") && lastVisitedPath.endsWith("/edit")) ||
    (lastVisitedPath.startsWith("/playlists/") && lastVisitedPath.endsWith("/watch"))
  ) {
    const playlistViewPath = lastVisitedPath.replace(/[^/]+$/, "view");

    router.replace("/(tabs)/playlists");
    await delay(10);
    router.push(playlistViewPath as Route);
    await delay(10);
    router.push(lastVisitedPath as Route);
    await delay(250);
  } else if (lastVisitedPath.startsWith("/playlists/")) {
    router.replace("/(tabs)/playlists");
    await delay(10);
    router.push(lastVisitedPath as Route);
    await delay(250);
  } else if (lastVisitedPath.startsWith("/videos/")) {
    router.replace(previousVisitedPath as Route);
    await delay(10);
    router.push(lastVisitedPath as Route);
    await delay(250);
  } else {
    router.push(lastVisitedPath as Route);
    await delay(250);
  }
}
