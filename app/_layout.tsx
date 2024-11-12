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
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { DARK_THEME, LIGHT_THEME } from "@/lib/constants";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { LockScreenProvider } from "@/providers/lock-screen-provider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  const { theme, setTheme } = useSettingsStore(
    useShallow((state) => ({ theme: state.theme, setTheme: state.setTheme }))
  );
  const { enablePasscode, setIsLocked } = useSecurityStore(
    useShallow((state) => ({
      enablePasscode: state.enablePasscode,
      setIsLocked: state.setIsLocked,
    }))
  );

  useEffect(() => {
    async function initializeLayout() {
      if (enablePasscode) setIsLocked(true);
      if (Platform.OS === "web") document.documentElement.classList.add("bg-background");

      const navColorScheme = theme || colorScheme;
      setAndroidNavigationBar(navColorScheme);
      setTheme(navColorScheme);

      if (theme !== colorScheme) setColorScheme(navColorScheme);

      setIsColorSchemeLoaded(true);
    }

    initializeLayout().finally(SplashScreen.hideAsync);
  }, [colorScheme, theme, enablePasscode]);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider style={{ flex: 1 }}>
        <LockScreenProvider>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
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
              offset={60}
            />
          </ThemeProvider>
        </LockScreenProvider>
        <PortalHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
