import { setVisibilityAsync } from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DARK_THEME, LIGHT_THEME } from "@/lib/constants";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { LockScreenProvider } from "@/providers/lock-screen-provider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);

  const { theme, setTheme } = useSettingsStore(
    useShallow((state) => ({ theme: state.theme, setTheme: state.setTheme }))
  );
  const { isLockable, setEnablePasscode, setIsLocked } = useSecurityStore(
    useShallow((state) => ({
      isLockable: state.isLockable,
      setEnablePasscode: state.setEnablePasscode,
      setIsLocked: state.setIsLocked,
    }))
  );

  useEffect(() => {
    const navColorScheme = theme || colorScheme;

    if (Platform.OS === "web") document.documentElement.classList.add("bg-background");

    setTheme(navColorScheme);

    if (theme !== colorScheme) setColorScheme(navColorScheme);
  }, [colorScheme, theme]);

  useEffect(() => {
    async function checkLockState() {
      if (isLockable) {
        setIsLocked(true);
      } else {
        setEnablePasscode(false);
        setIsLocked(false);
      }

      if (Platform.OS === "android") {
        await setVisibilityAsync("hidden");
      }

      setIsAppReady(true);
      await SplashScreen.hideAsync();
    }

    checkLockState();
  }, []);

  if (!isAppReady) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <LockScreenProvider>
            <StatusBar
              style={isDarkColorScheme ? "light" : "dark"}
              hidden={false}
            />
            <Stack>
              <Stack.Screen
                name="(modals)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
            </Stack>
            <Toaster
              theme={colorScheme === "light" ? "light" : "dark"}
              richColors
              position="bottom-center"
              offset={70}
            />
          </LockScreenProvider>
        </ThemeProvider>
        <PortalHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
