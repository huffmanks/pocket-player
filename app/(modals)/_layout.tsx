import { Stack } from "expo-router";
import { View } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NAV_THEME } from "@/lib/constants";

import HeaderItems from "@/components/header-items";

export default function ModalLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: NAV_THEME[colorScheme].background,
        },
      }}>
      <Stack.Screen
        name="playlists/watch/[id]"
        options={{
          headerShown: false,
          statusBarHidden: true,
          navigationBarHidden: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="playlists/view/[id]"
        options={{
          title: "Playlist",
          presentation: "card",
          headerBackVisible: true,
          headerRight: () => <ModalHeaderItems />,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="playlists/edit/[id]"
        options={{
          title: "Edit playlist",
          presentation: "card",
          headerBackVisible: true,
          headerRight: () => <ModalHeaderItems />,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="playlists/create"
        options={{
          title: "Create playlist",
          presentation: "card",
          headerBackVisible: true,
          headerRight: () => <ModalHeaderItems />,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="videos/watch/[id]"
        options={{
          headerShown: false,
          statusBarHidden: true,
          navigationBarHidden: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="videos/edit/[id]"
        options={{
          title: "Edit video",
          presentation: "card",
          headerBackVisible: true,
          headerRight: () => <ModalHeaderItems />,
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

function ModalHeaderItems() {
  return (
    <View className="z-50">
      <HeaderItems />
    </View>
  );
}
