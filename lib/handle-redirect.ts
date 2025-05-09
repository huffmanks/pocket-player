import { type Route, router } from "expo-router";
import { InteractionManager } from "react-native";

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
    InteractionManager.runAfterInteractions(() => {
      router.push(lastVisitedPath as Route);
    });
  } else if (lastVisitedPath.startsWith("/videos/")) {
    router.replace(previousVisitedPath as Route);
    InteractionManager.runAfterInteractions(() => {
      router.push(lastVisitedPath as Route);
    });
  } else {
    router.push(lastVisitedPath as Route);
  }
}
