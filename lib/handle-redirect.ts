import { type Route, router } from "expo-router";

interface HandleRedirectProps {
  currentPath: string;
  previousPath: string;
}

export default function handleRedirect({ currentPath, previousPath }: HandleRedirectProps) {
  if (currentPath.startsWith("/playlists/")) {
    router.replace("/(tabs)/playlists");
    router.push(currentPath as Route);
  } else if (currentPath.startsWith("/videos/")) {
    router.replace(previousPath as Route);
    router.push(currentPath as Route);
  } else {
    router.push(currentPath as Route);
  }
}
