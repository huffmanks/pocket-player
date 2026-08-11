import { Tabs } from "expo-router";

import {
  CloudUploadIcon,
  ListMusicIcon,
  SettingsIcon,
  StarIcon,
  VideoIcon,
} from "lucide-react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NAV_THEME } from "@/lib/theme";

import HeaderItems from "@/components/header-items";
import HeaderLogo from "@/components/header-logo";
import { Icon } from "@/components/ui/icon";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: NAV_THEME[colorScheme].background,
        },
        headerTitle: () => <HeaderLogo />,
        headerRight: () => <HeaderItems />,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: NAV_THEME[colorScheme].brandForeground,
        tabBarInactiveTintColor: NAV_THEME[colorScheme].text,
        tabBarStyle: {
          backgroundColor: NAV_THEME[colorScheme].background,
          paddingTop: 10,
          height: 90,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: ({ color }) => (
            <Icon
              as={VideoIcon}
              color={color}
              size={28}
              strokeWidth={1.25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <Icon
              as={CloudUploadIcon}
              color={color}
              size={28}
              strokeWidth={1.25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => (
            <Icon
              as={StarIcon}
              color={color}
              size={28}
              strokeWidth={1.25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: "Playlists",
          tabBarIcon: ({ color }) => (
            <Icon
              as={ListMusicIcon}
              color={color}
              size={28}
              strokeWidth={1.25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Icon
              as={SettingsIcon}
              color={color}
              size={28}
              strokeWidth={1.25}
            />
          ),
        }}
      />
    </Tabs>
  );
}
