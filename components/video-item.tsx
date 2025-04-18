import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { VideoMeta } from "@/db/schema";
import { formatDateString } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import VideoDropdown from "@/components/video-dropdown";

interface VideoItemProps {
  item: VideoMeta;
}

function VideoItem({ item }: VideoItemProps) {
  const createdAt = formatDateString(item.createdAt);

  return (
    <Animated.View
      className="mb-8 flex-row items-start gap-4"
      entering={FadeIn}
      exiting={FadeOut}>
      <Pressable onPress={() => router.push(`/(modals)/videos/watch/${item.id}`)}>
        <Image
          className="rounded-md bg-muted"
          style={{ width: 225, height: 125 }}
          source={{ uri: item.thumbUri }}
          resizeMode={item.orientation === "Portrait" ? "contain" : "cover"}
        />
      </Pressable>
      <View className="flex-1 flex-row justify-between gap-4">
        <View className="w-4/5">
          <Text
            className="mb-2 text-lg font-medium"
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="mb-4 text-sm text-muted-foreground">{createdAt}</Text>
          <View className="flex-row items-center gap-4">
            <Badge variant="secondary">
              <Text>{item.duration}</Text>
            </Badge>
            <Badge variant="secondary">
              <Text>{item.fileSize}</Text>
            </Badge>
          </View>
        </View>
        <VideoDropdown item={item} />
      </View>
    </Animated.View>
  );
}

export default VideoItem;
