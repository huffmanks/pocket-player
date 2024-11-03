import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="watch/[id]"
        options={{ presentation: "modal", title: "Watch" }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{ presentation: "modal", title: "Edit" }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", title: "Settings" }}
      />
      <Stack.Screen
        name="lock"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}
