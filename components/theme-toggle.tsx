import { useColorScheme } from "@/hooks/useColorScheme";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { MoonStarIcon, SunIcon } from "@/lib/icons";
import { useSettingsStore } from "@/lib/store";

import { Button } from "./ui/button";

export default function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const setTheme = useSettingsStore((state) => state.setTheme);

  function handlePress() {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
    setTheme(newTheme);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={handlePress}>
      <>
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
      </>
    </Button>
  );
}
