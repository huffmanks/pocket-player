import { Stack } from "expo-router";

export default function EditLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ presentation: "modal", title: "Edit" }}
      />
    </Stack>
  );
}
