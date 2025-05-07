import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { type VideoMetaWithPlaylists } from "@/app/(tabs)/videos";
import { formatDateString } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import VideoDropdown from "@/components/video-dropdown";

interface VideoItemProps {
  item: VideoMetaWithPlaylists;
  allPlaylists?: {
    value: string;
    label: string;
  }[];
}

function VideoItem({ item, allPlaylists }: VideoItemProps) {
  const createdAt = formatDateString(item.createdAt);

  return (
    <Animated.View
      className="mb-8 flex-row items-start gap-4"
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}>
      <Pressable onPress={() => router.push(`/(screens)/videos/${item.id}/watch`)}>
        <Image
          className="rounded-md bg-card"
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
          <Text className="mb-1 text-sm text-muted-foreground">{createdAt}</Text>

          <View className="mb-4 flex-row items-center gap-2">
            <Text className="text-xs">{item.durationLabel}</Text>
            <Text className="text-xs">·</Text>
            <Text className="text-xs">{item.fileSizeLabel}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-brand">
              <Text className="text-xs font-extrabold uppercase tracking-wider">
                {item.resolution}
              </Text>
            </Badge>
            {item?.videoCodec && (
              <Badge>
                <Text className="text-xs font-extrabold uppercase tracking-wider">
                  {item.videoCodec}
                </Text>
              </Badge>
            )}
            {item?.audioCodec && (
              <Badge variant="secondary">
                <Text className="text-xs font-extrabold uppercase tracking-wider">
                  {item.audioCodec}
                </Text>
              </Badge>
            )}
          </View>
        </View>
        <VideoDropdown
          item={item}
          allPlaylists={allPlaylists}
        />
      </View>
    </Animated.View>
  );
}

export default VideoItem;
