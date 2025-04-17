import { Stack } from "expo-router";

import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";

import HeaderItems from "@/components/header-items";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => <HeaderItems />,
      }}>
      <Stack.Screen
        name="playlists/watch/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="playlists/view/[id]"
        options={{
          title: "Playlist",
          headerShown: true,
          headerBackVisible: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="playlists/edit/[id]"
        options={{
          title: "Edit playlist",
          headerShown: true,
          headerBackVisible: true,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="playlists/create"
        options={{
          title: "Create playlist",
          headerShown: true,
          headerBackVisible: true,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="videos/watch/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="videos/edit/[id]"
        options={{
          title: "Edit video",
          headerShown: true,
          headerBackVisible: true,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="lock"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="passcode"
        options={{ title: "Passcode", presentation: "modal", animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Settings", presentation: "modal", animation: "slide_from_right" }}
      />
    </Stack>
  );
}
