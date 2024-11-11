import { Pressable, View } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { MoonStarIcon, SunIcon } from "@/lib/icons";
import { useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const { setTheme } = useSettingsStore();

  function handlePress() {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    setTheme(newTheme);
  }

  return (
    <Pressable
      onPress={handlePress}
      className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
      {({ pressed }) => (
        <View
          className={cn(
            "aspect-square flex-1 items-start justify-center pt-0.5 web:px-5",
            pressed && "opacity-70"
          )}>
          {isDarkColorScheme ? (
            <MoonStarIcon
              className="text-foreground"
              size={23}
              strokeWidth={1.25}
            />
          ) : (
            <SunIcon
              className="text-foreground"
              size={24}
              strokeWidth={1.25}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}
