import { setBackgroundColorAsync, setButtonStyleAsync } from "expo-navigation-bar";
import { Platform } from "react-native";

import { NAV_THEME } from "@/lib/constants";

export async function setAndroidNavigationBar(theme: "light" | "dark") {
  if (Platform.OS !== "android") return;

  await setButtonStyleAsync(theme === "light" ? "dark" : "light");
  await setBackgroundColorAsync(NAV_THEME[theme].background);
}
