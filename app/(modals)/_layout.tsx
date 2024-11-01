import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="watch"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="edit"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", title: "Settings" }}
      />
      <Stack.Screen
        name="lock"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}
