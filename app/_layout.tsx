import { setBehaviorAsync, setVisibilityAsync } from "expo-navigation-bar";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { DARK_THEME, LIGHT_THEME, NAV_THEME } from "@/lib/constants";
import { migrateDatabase } from "@/lib/migrate-database";
import { useAppStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { LockScreenProvider } from "@/providers/lock-screen-provider";

import { RouteTracker } from "@/components/route-tracker";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  const { appLoadedOnce, isAppReady, setAppLoadedOnce, setIsAppReady } = useAppStore(
    useShallow((state) => ({
      appLoadedOnce: state.appLoadedOnce,
      isAppReady: state.isAppReady,
      setAppLoadedOnce: state.setAppLoadedOnce,
      setIsAppReady: state.setIsAppReady,
    }))
  );
  const { previousPath, theme, setTheme } = useSettingsStore(
    useShallow((state) => ({
      previousPath: state.previousPath,
      theme: state.theme,
      setTheme: state.setTheme,
    }))
  );
  const { isLockable, setEnablePasscode, setIsLocked } = useSecurityStore(
    useShallow((state) => ({
      isLockable: state.isLockable,
      setEnablePasscode: state.setEnablePasscode,
      setIsLocked: state.setIsLocked,
    }))
  );

  useEffect(() => {
    async function initializeApp() {
      try {
        if (!appLoadedOnce) {
          await migrateDatabase();
          setAppLoadedOnce(true);
        }

        if (!isAppReady) {
          if (isLockable) {
            setIsLocked(true);
          } else {
            setEnablePasscode(false);
            setIsLocked(false);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (Platform.OS === "android") {
          await setBehaviorAsync("overlay-swipe");
          await setVisibilityAsync("hidden");
        }

        setIsAppReady(true);
      }
    }
    initializeApp();
  }, []);

  useEffect(() => {
    const navColorScheme = theme || colorScheme;

    setAndroidNavigationBar(navColorScheme);
    setTheme(navColorScheme);

    if (theme !== colorScheme) setColorScheme(navColorScheme);
  }, [colorScheme, theme]);

  useEffect(() => {
    if (!isAppReady || isLocked) return;

    async function restorePreviousRoute() {
      try {
        if (!previousPath) return;

        if (previousPath !== "(tabs)") {
          router.push(previousPath);
        }
      } catch (error) {
        console.error(error);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    restorePreviousRoute();
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RouteTracker />
      <ThemeProvider value={!isDarkColorScheme ? LIGHT_THEME : DARK_THEME}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <LockScreenProvider>
              <Stack
                screenOptions={{
                  statusBarStyle: isDarkColorScheme ? "light" : "dark",
                  statusBarAnimation: "fade",
                  statusBarBackgroundColor: NAV_THEME[colorScheme].background,
                  statusBarHidden: false,
                }}>
                <Stack.Screen
                  name="(modals)"
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
