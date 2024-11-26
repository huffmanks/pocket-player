import { Link, router } from "expo-router";
import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useColorScheme } from "@/hooks/useColorScheme";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { LockIcon, MoonStarIcon, SettingsIcon, SunIcon } from "@/lib/icons";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

export default function HeaderItems() {
  return (
    <View className="flex-row items-center gap-2 pr-2">
      <LockScreen />
      <ThemeToggle />
      <OpenSettings />
    </View>
  );
}

function ThemeToggle() {
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

function OpenSettings() {
  return (
    <Link
      href="/(modals)/settings"
      asChild>
      <Button
        variant="ghost"
        size="icon">
        <SettingsIcon
          className="text-teal-500"
          size={28}
          strokeWidth={1.25}
        />
      </Button>
    </Link>
  );
}

function LockScreen() {
  const { isLockable, setIsLocked } = useSecurityStore(
    useShallow((state) => ({
      isLockable: state.isLockable,
      setIsLocked: state.setIsLocked,
    }))
  );

  function handlePress() {
    setIsLocked(true);
    router.push("/(modals)/lock");
  }

  return (
    <Button
      disabled={!isLockable}
      variant="ghost"
      size="icon"
      onPress={handlePress}>
      <LockIcon
        className={cn(isLockable ? "text-teal-500" : "text-muted-foreground")}
        size={26}
        strokeWidth={1.25}
      />
    </Button>
  );
}
