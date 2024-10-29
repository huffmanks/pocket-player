import { View } from "react-native";

import VideoForm from "@/components/video-form";

export default function Home() {
  return (
    <>
      <View className="flex-1 p-6">
        <VideoForm />
      </View>
    </>
  );
}
