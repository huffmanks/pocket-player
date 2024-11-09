import { router } from "expo-router";
import { memo, useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { VideoMetaWithExtras } from "@/app/(tabs)";
import { PlaylistMeta, TagMeta, playlists } from "@/db/schema";
import { useDatabase } from "@/providers/database-provider";

import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import VideoDropdown from "@/components/video-dropdown";

function VideoItem({ item }: { item: VideoMetaWithExtras }) {
  const [tags, setTags] = useState<TagMeta[] | []>([]);
  const { db } = useDatabase();
  const { data, error }: { data: PlaylistMeta[]; error: Error | undefined } = useLiveQuery(
    // @ts-expect-error
    db?.select().from(playlists)
  );

  useEffect(() => {
    setTags(JSON.parse(item.tags as unknown as string));
  }, [item.tags]);

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
          {tags &&
            tags.length > 0 &&
            tags.map((tag) => (
              <Badge key={tag.id}>
                <Text>{tag.title}</Text>
              </Badge>
            ))}
        </View>
        <VideoDropdown
          item={item}
          playlists={data}
        />
      </View>
    </Animated.View>
  );
}

export default memo(VideoItem);
