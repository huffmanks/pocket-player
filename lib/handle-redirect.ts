import { type Route, router } from "expo-router";
import { InteractionManager } from "react-native";

interface HandleRedirectProps {
  currentPath: string;
  previousPath: string;
}

export default function handleRedirect({ currentPath, previousPath }: HandleRedirectProps) {
  if (currentPath.startsWith("/playlists/")) {
    router.dismissTo("/(tabs)/playlists");
    InteractionManager.runAfterInteractions(() => {
      router.push(currentPath as Route);
    });
  } else if (currentPath.startsWith("/videos/")) {
    router.replace(previousPath as Route);
    router.push(currentPath as Route);
  }
}
