import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { type VideoMetaWithPlaylists } from "@/app/(tabs)/videos";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VIDEO_PLACEHOLDER } from "@/lib/constants";
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
  const { colorScheme } = useColorScheme();

  const createdAt = formatDateString(item.createdAt);

  const thumbUri = item?.thumbUri ? `${item.thumbUri}?v=${item.thumbTimestamp}` : undefined;
  const thumbSource = thumbUri ? { uri: thumbUri } : VIDEO_PLACEHOLDER[colorScheme];

  return (
    <Animated.View
      className="mb-8 flex-row items-start gap-4"
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}>
      <Pressable onPress={() => router.push(`/(screens)/videos/${item.id}/watch`)}>
        <View
          className="overflow-hidden rounded-md bg-card"
          style={{ width: 225, height: 125 }}>
          <Image
            style={{ width: "100%", height: "100%" }}
            recyclingKey={thumbUri ?? "video-item_placeholder"}
            source={thumbSource}
            contentFit={thumbUri && item.orientation === "Portrait" ? "contain" : "cover"}
          />
        </View>
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
