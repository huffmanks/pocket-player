import { router } from "expo-router";
import { memo } from "react";
import { Image, Pressable, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { VideoMeta } from "@/db/schema";

import { Text } from "@/components/ui/text";
import VideoDropdown from "@/components/video-dropdown";

function VideoItem({ item }: { item: VideoMeta }) {
  return (
    <Animated.View
      className="mb-8 flex-row items-start gap-4"
      entering={FadeIn}
      exiting={FadeOut}>
      <Pressable onPress={() => router.push(`/(modals)/videos/watch/${item.id}`)}>
        <Image
          className="rounded-sm"
          style={{ width: 225, height: 125 }}
          source={{ uri: item.thumbUri }}
          resizeMode="cover"
        />
      </Pressable>
      <View className="flex-1 flex-row justify-between gap-4">
        <View className="w-4/5">
          <Text
            className="mb-2 text-lg font-medium"
            numberOfLines={2}>
            {item.title}
          </Text>

          <Text
            className="text-sm text-muted-foreground"
            numberOfLines={3}>
            {item.description ? item.description : "No description"}
          </Text>
        </View>
        <VideoDropdown item={item} />
      </View>
    </Animated.View>
  );
}

export default memo(VideoItem);
