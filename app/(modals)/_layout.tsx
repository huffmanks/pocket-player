import { Stack } from "expo-router";
import { View } from "react-native";

import OpenSettings from "@/components/open-settings";
import ThemeToggle from "@/components/theme-toggle";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <View className="flex-row items-center gap-2 pr-2">
            <ThemeToggle />
            <OpenSettings />
          </View>
        ),
      }}>
      <Stack.Screen
        name="playlists/watch/[id]"
        options={{ animation: "slide_from_bottom", title: "Watch playlist" }}
      />
      <Stack.Screen
        name="playlists/view/[id]"
        options={{ animation: "slide_from_bottom", title: "Playlist" }}
      />
      <Stack.Screen
        name="playlists/edit/[id]"
        options={{ presentation: "modal", title: "Edit playlist" }}
      />
      <Stack.Screen
        name="playlists/create"
        options={{ presentation: "modal", title: "Create playlist" }}
      />
      <Stack.Screen
        name="videos/watch/[id]"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="videos/edit/[id]"
        options={{ presentation: "modal", title: "Edit video" }}
      />
      <Stack.Screen
        name="lock"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="passcode"
        options={{ presentation: "modal", title: "Passcode" }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", title: "Settings" }}
      />
    </Stack>
  );
}
