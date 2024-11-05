import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(playlist)/edit/[id]"
        options={{ presentation: "modal", title: "Edit playlist" }}
      />
      <Stack.Screen
        name="(playlist)/create"
        options={{ presentation: "modal", title: "Create playlist" }}
      />
      <Stack.Screen
        name="(video)/watch/[id]"
        options={{ presentation: "modal", title: "Watch video" }}
      />
      <Stack.Screen
        name="(video)/edit/[id]"
        options={{ presentation: "modal", title: "Edit video" }}
      />
      <Stack.Screen
        name="lock"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", title: "Settings" }}
      />
    </Stack>
  );
}
