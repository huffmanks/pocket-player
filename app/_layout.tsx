import { NavigationBar } from "expo-navigation-bar";
import { SplashScreen, Stack, ThemeProvider } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { useColorScheme } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster, toast } from "sonner-native";

import "@/global.css";
import { migrateDatabase } from "@/lib/migrate-database";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { DARK_THEME, LIGHT_THEME } from "@/lib/theme";
import { LockScreenProvider } from "@/providers/lock-screen-provider";

import { RouteTracker } from "@/components/route-tracker";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";

  const isAppReady = useAppStore((state) => state.isAppReady);
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    async function initializeApp() {
      try {
        const { isAppStartUp, setIsAppStartUp, isAppReady } = useAppStore.getState();
        const { isLockable, setEnablePasscode, setIsLocked } = useSecurityStore.getState();

        if (!isAppStartUp) {
          await migrateDatabase();
          setIsAppStartUp(true);
        }

        if (!isAppReady) {
          if (isLockable) {
            setIsLocked(true);
          } else {
            setEnablePasscode(false);
            setIsLocked(false);
          }
        }
      } catch (_error) {
        toast.error("Initializing app failed.");
      } finally {
        useAppStore.getState().setIsAppReady(true);
      }
    }
    initializeApp();
  }, []);

  useEffect(() => {
    const navColorScheme = theme || colorScheme;

    const { setTheme } = useSettingsStore.getState();
    setTheme(navColorScheme);

    if (theme !== colorScheme) setColorScheme(navColorScheme);
  }, [colorScheme, theme, setColorScheme]);

  if (!isAppReady) return null;

  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      className={isDarkColorScheme ? "dark" : ""}>
      <RouteTracker />
      <StatusBar
        style={isDarkColorScheme ? "light" : "dark"}
        animated
      />
      <NavigationBar style={isDarkColorScheme ? "light" : "dark"} />
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <LockScreenProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: isDarkColorScheme
                      ? DARK_THEME.colors.background
                      : LIGHT_THEME.colors.background,
                  },
                }}>
                <Stack.Screen
                  name="(screens)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                />
              </Stack>
            </LockScreenProvider>
          </BottomSheetModalProvider>
          <Toaster
            theme={colorScheme}
            richColors
            position="bottom-center"
            offset={70}
          />
          <PortalHost />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
