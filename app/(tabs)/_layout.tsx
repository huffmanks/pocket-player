import { Link, Tabs } from "expo-router";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { CloudUploadIcon, SettingsIcon, VideoIcon } from "@/lib/icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        headerRight: () => <ThemeToggle />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Upload",
          tabBarIcon: () => (
            <CloudUploadIcon
              className="text-teal-500"
              size={28}
              strokeWidth={1.25}
            />
          ),
          headerRight: () => (
            <Link
              href="/modal"
              asChild>
              <Button
                variant="ghost"
                size="icon">
                <SettingsIcon
                  className="text-teal-500"
                  size={28}
                  strokeWidth={1.25}
                />
              </Button>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: () => (
            <VideoIcon
              className="text-teal-500"
              size={28}
              strokeWidth={1.25}
            />
          ),
        }}
      />
    </Tabs>
  );
}
