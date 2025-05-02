import { useRouter } from "expo-router";
import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useColorScheme } from "@/hooks/useColorScheme";
import { LockIcon, MoonStarIcon, SunIcon } from "@/lib/icons";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

export default function HeaderItems() {
  return (
    <View className="flex-row items-center gap-2 pr-2">
      <LockScreen />
      <ThemeToggle />
    </View>
  );
}

function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const setTheme = useSettingsStore((state) => state.setTheme);

  function handlePress() {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
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

function LockScreen() {
  const router = useRouter();

  const { isLockable, setIsLocked } = useSecurityStore(
    useShallow((state) => ({
      isLockable: state.isLockable,
      setIsLocked: state.setIsLocked,
    }))
  );

  function handlePress() {
    setIsLocked(true);
    router.push("/(screens)/lock");
  }

  return (
    <Button
      disabled={!isLockable}
      variant="ghost"
      size="icon"
      onPress={handlePress}>
      <LockIcon
        className={cn(isLockable ? "text-brand-foreground" : "text-muted-foreground")}
        size={26}
        strokeWidth={1.25}
      />
    </Button>
  );
}
