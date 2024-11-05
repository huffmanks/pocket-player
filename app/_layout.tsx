import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { DARK_THEME, LIGHT_THEME } from "@/lib/constants";
import { lockScreenStorage, settingsStorage, themeStorage } from "@/lib/storage";
import { DatabaseProvider } from "@/providers/database-provider";
import { LockScreenProvider } from "@/providers/lock-screen-provider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (settingsStorage.getBoolean("enablePasscode")) {
        lockScreenStorage.set("isLocked", true);
      }

      const theme = themeStorage.getString("theme");

      if (Platform.OS === "web") {
        document.documentElement.classList.add("bg-background");
      }

      if (!theme) {
        setAndroidNavigationBar(colorScheme);
        themeStorage.set("theme", colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }

      const colorTheme = theme === "dark" ? "dark" : "light";
      setAndroidNavigationBar(colorTheme);

      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }

      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <>
      <DatabaseProvider>
        <LockScreenProvider>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            <GestureHandlerRootView style={{ flex: 1 }}>
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
                position="top-center"
                offset={60}
              />
            </GestureHandlerRootView>
          </ThemeProvider>
        </LockScreenProvider>
      </DatabaseProvider>
      <PortalHost />
    </>
  );
}
