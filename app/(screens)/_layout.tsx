import { Stack } from "expo-router";

import { useColorScheme } from "nativewind";

import { NAV_THEME } from "@/lib/theme";

import GoBack from "@/components/go-back";
import HeaderItems from "@/components/header-items";

export default function ScreensLayout() {
  const { colorScheme } = useColorScheme();
  const safeColorScheme = colorScheme ?? "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: NAV_THEME[safeColorScheme].background,
        },
        headerRight: () => <HeaderItems />,
      }}>
      <Stack.Screen
        name="playlists/[id]/watch"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="playlists/[id]/view"
        options={{
          title: "Playlist",
          animation: "fade",
          headerBackVisible: false,
          presentation: "modal",
          gestureEnabled: true,
          headerLeft: () => <GoBack fallbackHref="/(tabs)/playlists" />,
        }}
      />
      <Stack.Screen
        name="playlists/[id]/edit"
        options={{
          title: "Edit playlist",
          animation: "fade_from_bottom",
          headerBackVisible: false,
          presentation: "modal",
          gestureEnabled: true,
          headerLeft: () => <GoBack fallbackHref="/(tabs)/playlists" />,
        }}
      />
      <Stack.Screen
        name="playlists/create"
        options={{
          title: "Create playlist",
          animation: "fade_from_bottom",
          headerBackVisible: false,
          presentation: "modal",
          gestureEnabled: true,
          headerLeft: () => <GoBack fallbackHref="/(tabs)/playlists" />,
        }}
      />
      <Stack.Screen
        name="videos/[id]/watch"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="videos/[id]/edit"
        options={{
          title: "Edit video",
          animation: "fade_from_bottom",
          headerBackVisible: false,
          presentation: "modal",
          gestureEnabled: true,
          headerLeft: () => <GoBack fallbackHref="/(tabs)/videos" />,
        }}
      />
      <Stack.Screen
        name="lock"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="settings/file-manager"
        options={{
          title: "File Manager",
          animation: "fade_from_bottom",
          headerBackVisible: false,
          presentation: "modal",
          gestureEnabled: true,
          headerLeft: () => <GoBack fallbackHref="/(tabs)/settings" />,
        }}
      />
      <Stack.Screen
        name="settings/passcode"
        options={{
          title: "Passcode",
          animation: "fade_from_bottom",
          headerBackVisible: false,
          presentation: "modal",
          gestureEnabled: true,
          headerLeft: () => <GoBack fallbackHref="/(tabs)/settings" />,
        }}
      />
    </Stack>
  );
}
