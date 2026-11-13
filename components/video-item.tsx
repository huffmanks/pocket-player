import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

import { type VideoMetaWithPlaylists } from "@/app/(app)/(tabs)/videos";
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
  const thumbSource = useMemo(
    () => (thumbUri ? { uri: thumbUri } : VIDEO_PLACEHOLDER[colorScheme]),
    [thumbUri, colorScheme]
  );

  return (
    <View className="mb-8 min-h-[125px] flex-row items-start gap-4">
      <Pressable onPress={() => router.navigate(`/(app)/(screens)/videos/${item.id}/watch`)}>
        <View
          className="overflow-hidden rounded-md bg-card"
          style={{ width: 225, height: 125 }}>
          <Image
            style={{ width: "100%", height: "100%" }}
            recyclingKey={thumbUri ?? "video-item_placeholder"}
            source={thumbSource}
            contentFit={thumbUri && item.orientation === "Portrait" ? "contain" : "cover"}
          />
          {item.resumePosition > 0 && item.duration > 0 && (
            <View className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <View
                className="h-full bg-brand"
                style={{
                  width: `${Math.min((item.resumePosition / item.duration) * 100, 100)}%`,
                }}
              />
            </View>
          )}
        </View>
      </Pressable>
      <View className="flex-1 flex-row justify-between gap-4">
        <View className="flex-1">
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
    </View>
  );
}

export default VideoItem;
