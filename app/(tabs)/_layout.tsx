import { Tabs } from "expo-router";
import { View } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { CloudUploadIcon, VideoIcon } from "@/lib/icons";

import OpenSettings from "@/components/open-settings";
import ThemeToggle from "@/components/theme-toggle";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#14b8a6",
        tabBarInactiveTintColor: colorScheme === "light" ? "#09090b" : "#fff",
        headerRight: () => (
          <View className="flex-row items-center pr-2">
            <ThemeToggle />
            <OpenSettings />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Videos",
          tabBarIcon: ({ color }) => (
            <VideoIcon
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
            <CloudUploadIcon
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
