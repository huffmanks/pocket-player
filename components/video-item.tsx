import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { PlaylistMeta, VideoMeta, playlists } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

import { Text } from "@/components/ui/text";
import VideoDropdown from "@/components/video-dropdown";

interface VideoItemProps {
  item: VideoMeta;
  isInPlaylist: boolean;
  onRefresh: () => void;
}

function VideoItem({ item, isInPlaylist, onRefresh }: VideoItemProps) {
  const { db } = useDatabaseStore();
  const { data, error }: { data: PlaylistMeta[]; error: Error | undefined } = useLiveQuery(
    db.select().from(playlists)
  );

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
        <VideoDropdown
          item={item}
          isInPlaylist={isInPlaylist}
          playlists={data}
          onRefresh={onRefresh}
        />
      </View>
    </Animated.View>
  );
}

export default VideoItem;
