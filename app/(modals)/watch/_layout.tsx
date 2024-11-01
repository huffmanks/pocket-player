import { Stack } from "expo-router";

export default function WatchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ presentation: "modal", title: "Watch" }}
      />
    </Stack>
  );
}
