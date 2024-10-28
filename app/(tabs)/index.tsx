import { Stack } from "expo-router";
import { View } from "react-native";

import VideoForm from "@/components/video-form";

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: "Upload videos" }} />
      <View className="flex-1 p-6">
        <VideoForm />
      </View>
    </>
  );
}
