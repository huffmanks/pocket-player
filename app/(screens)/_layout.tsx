import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useNavigationInterceptor } from "@/hooks/useNavigationInterceptor";
import { NAV_THEME } from "@/lib/constants";

import HeaderItems from "@/components/header-items";

export default function ScreensLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  useNavigationInterceptor();

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
