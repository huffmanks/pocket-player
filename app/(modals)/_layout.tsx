import { Stack } from "expo-router";

import HeaderItems from "@/components/header-items";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <HeaderItems />,
      }}>
      <Stack.Screen
        name="playlists/watch/[id]"
        options={{ headerShown: false, animation: "slide_from_right", title: "Watch playlist" }}
      />
      <Stack.Screen
        name="playlists/view/[id]"
        options={{ animation: "slide_from_right", title: "Playlist" }}
      />
      <Stack.Screen
        name="playlists/edit/[id]"
        options={{
          animation: "slide_from_bottom",
          headerBackVisible: true,
          title: "Edit playlist",
        }}
      />
      <Stack.Screen
        name="playlists/create"
        options={{
          animation: "slide_from_bottom",
          headerBackVisible: true,
          title: "Create playlist",
        }}
      />
      <Stack.Screen
        name="videos/watch/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="videos/edit/[id]"
        options={{ animation: "slide_from_bottom", headerBackVisible: true, title: "Edit video" }}
      />
      <Stack.Screen
        name="lock"
        options={{ headerShown: false, headerBackVisible: false, animation: "fade" }}
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
