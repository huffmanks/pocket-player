import { Stack } from "expo-router";

export default function AuxLayout() {
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
    </Stack>
  );
}
