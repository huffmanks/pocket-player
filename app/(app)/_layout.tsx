import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
