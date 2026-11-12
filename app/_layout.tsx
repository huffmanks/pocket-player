import { NavigationBar } from "expo-navigation-bar";
import { SplashScreen, Stack, ThemeProvider } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster, toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { errorHandler } from "@/lib/error-handler";
import { migrateDatabase } from "@/lib/migrate-database";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { DARK_THEME, LIGHT_THEME } from "@/lib/theme";
import { delay } from "@/lib/utils";
import { LockScreenProvider } from "@/providers/lock-screen-provider";

import { RouteTracker } from "@/components/route-tracker";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme, setColorScheme } = useColorScheme();

  const { isAppReady, isRestored } = useAppStore(
    useShallow((state) => ({
      isAppReady: state.isAppReady,
      isRestored: state.isRestored,
    }))
  );
  const { isSettingsHydrated, theme } = useSettingsStore(
    useShallow((state) => ({
      isSettingsHydrated: state._hasHydrated,
      theme: state.theme,
    }))
  );
  const { isSecurityHydrated, isLocked } = useSecurityStore(
    useShallow((state) => ({
      isSecurityHydrated: state._hasHydrated,
      isLocked: state.isLocked,
    }))
  );
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!isSettingsHydrated || !isSecurityHydrated) return;

    async function initializeApp() {
      try {
        const { setIsAppStartUp } = useAppStore.getState();
        const { setEnablePasscode, setIsLocked } = useSecurityStore.getState();

        if (!useAppStore.getState().isAppStartUp) {
          const result = await migrateDatabase();

          if (result.isError) {
            toast.error(result.message);
          } else {
            setIsAppStartUp(true);
          }
        }

        if (!useAppStore.getState().isAppReady) {
          if (useSecurityStore.getState().isLockable) {
            setIsLocked(true);
          } else {
            setEnablePasscode(false);
            setIsLocked(false);
          }
        }
      } catch (error) {
        toast.error(errorHandler(error));
      } finally {
        useAppStore.getState().setIsAppReady(true);
      }
    }
    initializeApp();
  }, [isSettingsHydrated, isSecurityHydrated]);

  useEffect(() => {
    const navColorScheme = theme || colorScheme;

    if (theme !== navColorScheme) {
      useSettingsStore.getState().setTheme(navColorScheme);
    }

    if (colorScheme !== navColorScheme) {
      setColorScheme(navColorScheme);
    }
  }, [colorScheme, theme, setColorScheme]);

  useEffect(() => {
    if (!isSettingsHydrated || !isSecurityHydrated || !isAppReady || hasHiddenSplash.current)
      return;

    if (!isLocked && !isRestored) return;

    hasHiddenSplash.current = true;

    async function hideSplashScreen() {
      await delay(1000);
      await SplashScreen.hideAsync();
    }

    hideSplashScreen();
  }, [isSettingsHydrated, isSecurityHydrated, isAppReady, isRestored, isLocked]);

  if (!isSettingsHydrated || !isSecurityHydrated || !isAppReady) {
    return null;
  }

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
                <Stack.Protected
                  guard={!isLocked}
                  redirectTo="/lock">
                  <Stack.Screen
                    name="(app)"
                    options={{ headerShown: false }}
                  />
                </Stack.Protected>

                <Stack.Protected guard={isLocked}>
                  <Stack.Screen
                    name="lock"
                    options={{ headerShown: false }}
                  />
                </Stack.Protected>
              </Stack>
            </LockScreenProvider>
          </BottomSheetModalProvider>
          <Toaster
            theme={colorScheme}
            richColors
            position="bottom-center"
            offset={70}
          />
          {!isLocked && <PortalHost />}
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
