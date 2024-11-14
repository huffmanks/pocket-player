import { useCallback, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { playlistVideos, videos } from "@/db/schema";
import { ESTIMATED_PLAYLIST_ITEM_HEIGHT } from "@/lib/constants";
import { useDatabaseStore, usePlaylistStore } from "@/lib/store";

import PlaylistVideoDropdown from "./playlist-video-dropdown";
import { Text } from "./ui/text";

export type VideoMetaForPlaylist = {
  id: string;
  title: string;
  description: string;
  videoUri: string;
  thumbUri: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  key: string;
  playlistId: string;
};

export default function PlaylistSortable({ playlistId }: { playlistId: string }) {
  const [keyIndex, setKeyIndex] = useState(0);

  const updatePlaylistOrder = usePlaylistStore((state) => state.updatePlaylistOrder);
  const db = useDatabaseStore.getState().db;

  const videoForPlaylistQuery = useLiveQuery(
    db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        isFavorite: videos.isFavorite,
        thumbUri: videos.thumbUri,
        videoUri: videos.videoUri,
        createdAt: videos.createdAt,
        updatedAt: videos.updatedAt,
        key: videos.id,
        playlistId: playlistVideos.playlistId,
      })
      .from(videos)
      .innerJoin(playlistVideos, eq(playlistVideos.videoId, videos.id))
      .where(eq(playlistVideos.playlistId, playlistId))
      .orderBy(playlistVideos.order),
    [keyIndex]
  );

  const onRefresh = useCallback(() => {
    setKeyIndex((prev) => prev + 1);
  }, []);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<VideoMetaForPlaylist>) => {
      return (
        <>
          <ScaleDecorator>
            <View className="mb-4 flex-row items-center justify-between gap-4 rounded-md bg-secondary pr-2">
              <Pressable
                className="flex flex-1 flex-row items-center gap-4 "
                onLongPress={drag}
                style={{ backgroundColor: isActive ? "blue" : "red" }}>
                <Image
                  className="rounded-l-md"
                  style={{ width: 120, height: 80 }}
                  source={{ uri: item.thumbUri }}
                  resizeMode="cover"
                />
                <Text
                  className="text-lg font-medium text-foreground"
                  numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
              <PlaylistVideoDropdown
                item={item}
                onRefresh={onRefresh}
              />
            </View>
          </ScaleDecorator>
        </>
      );
    },
    []
  );

  const handleReorder = async ({ data }: { data: VideoMetaForPlaylist[] }) => {
    await updatePlaylistOrder({ playlistId, videosOrder: data });
  };

  return (
    <DraggableFlatList
      key={`playlist-reorderable_${playlistId}`}
      data={videoForPlaylistQuery.data}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      onDragEnd={handleReorder}
      ListFooterComponent={<View style={{ paddingTop: ESTIMATED_PLAYLIST_ITEM_HEIGHT + 16 }} />}
    />
  );
}
