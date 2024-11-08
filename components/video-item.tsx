import { router } from "expo-router";
import { memo, useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { toast } from "sonner-native";

import { getPlaylists } from "@/actions/playlist";
import { getTagsForVideo } from "@/actions/tag";
import { PlaylistMeta, VideoMeta } from "@/db/schema";
import { getRandomTwoItems } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import VideoDropdown from "@/components/video-dropdown";

type TagMetaWithVideoId = {
  id: string;
  title: string;
  createdAt: string;
  videoId: string;
};

function VideoItem({ item }: { item: VideoMeta }) {
  const [tags, setTags] = useState<TagMetaWithVideoId[] | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistMeta[] | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const tagsForVideo = await getTagsForVideo(item.id);
        const twoTags = getRandomTwoItems(tagsForVideo);
        setTags(twoTags);

        const playlistData = await getPlaylists();
        if (!playlistData) return;

        setPlaylists(playlistData);
      } catch (error) {
        console.error("Failed to find tags: ", error);
        toast.error("Failed to find tags.");
      }
    };

    fetchItems();
  }, [item.id]);

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
            tags.map((tag) => (
              <Badge key={tag.id}>
                <Text>{tag.title}</Text>
              </Badge>
            ))}
        </View>
        <VideoDropdown
          item={item}
          playlists={playlists}
        />
      </View>
    </Animated.View>
  );
}

export default memo(VideoItem);
