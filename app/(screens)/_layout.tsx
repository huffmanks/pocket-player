import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { InteractionManager } from "react-native";

import { useNavigationState } from "@react-navigation/native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NAV_THEME } from "@/lib/constants";
import { useSettingsStore } from "@/lib/store";

import HeaderItems from "@/components/header-items";

export default function ScreensLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  const router = useRouter();
  const navigation = useNavigation();
  const navState = useNavigationState((state) => state);
  const previousPath = useSettingsStore((state) => state.previousPath);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const isRouteStale = navState.routes[navState.index - 1].state?.stale;
      const currentRoute = navState.routes[navState.index] as {
        params: {
          screen: string | undefined;
          params: { id: string } | undefined;
        };
      };

      const currentScreen = currentRoute.params?.screen;
      const currentScreenId = currentRoute.params?.params?.id;

      if (!isRouteStale || !currentScreen) return;

      e.preventDefault();
      unsubscribe();

      if (currentScreen === "playlists/[id]/edit" || currentScreen === "playlists/[id]/watch") {
        router.dismissTo("/(tabs)/playlists");
        InteractionManager.runAfterInteractions(() => {
          router.push(`/(screens)/playlists/${currentScreenId}/view`);
        });
      } else if (currentScreen === "playlists/[id]/view" || currentScreen === "playlists/create") {
        router.replace("/(tabs)/playlists");
      } else if (currentScreen === "settings/passcode") {
        router.replace("/(tabs)/settings");
      } else if (currentScreen === "videos/[id]/edit" || currentScreen === "videos/[id]/watch") {
        if (previousPath === "/favorites") {
          router.dismissTo("/(tabs)/favorites");
        } else {
          router.dismissTo("/(tabs)/videos");
        }
      }
    });

    return unsubscribe;
  }, [navigation, navState]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: NAV_THEME[colorScheme].background,
        },
        headerRight: () => <HeaderItems />,
      }}>
      <Stack.Screen
        name="playlists/[id]/watch"
        options={{
          headerShown: false,
          statusBarHidden: true,
          navigationBarHidden: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="playlists/[id]/view"
        options={{
          title: "Playlist",
          headerBackVisible: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="playlists/[id]/edit"
        options={{
          title: "Edit playlist",
          headerBackVisible: true,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="playlists/create"
        options={{
          title: "Create playlist",
          headerBackVisible: true,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="videos/[id]/watch"
        options={{
          headerShown: false,
          statusBarHidden: true,
          navigationBarHidden: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="videos/[id]/edit"
        options={{
          title: "Edit video",
          headerBackVisible: true,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="lock"
        options={{
          headerShown: false,
          statusBarStyle: isDarkColorScheme ? "dark" : "light",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="passcode"
        options={{
          title: "Passcode",
          headerBackVisible: true,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
