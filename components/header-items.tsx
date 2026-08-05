import { useRouter } from "expo-router";
import { View } from "react-native";

import { LockIcon, MoonStarIcon, SunIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useShallow } from "zustand/react/shallow";

import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function HeaderItems() {
  return (
    <View className="flex-row items-center gap-2 pr-2">
      <LockScreen />
      <ThemeToggle />
    </View>
  );
}

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
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
          <Icon
            as={MoonStarIcon}
            className="text-foreground"
            size={23}
            strokeWidth={1.25}
          />
        ) : (
          <Icon
            as={SunIcon}
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
      <Icon
        as={LockIcon}
        className={cn(isLockable ? "text-brand-foreground" : "text-muted-foreground")}
        size={26}
        strokeWidth={1.25}
      />
    </Button>
  );
}
