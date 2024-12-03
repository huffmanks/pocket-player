import { useCallback, useState } from "react";
import { ListRenderItemInfo, View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { playlistVideos, videos } from "@/db/schema";
import { ESTIMATED_PLAYLIST_ITEM_HEIGHT } from "@/lib/constants";
import { useDatabaseStore, usePlaylistStore } from "@/lib/store";

import PlaylistItem from "@/components/playlist-item";

export type VideoMetaForPlaylist = {
  id: string;
  title: string;
  videoUri: string;
  thumbUri: string;
  isFavorite: boolean;
  duration: string;
  fileSize: string;
  orientation: string;
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
        videoUri: videos.videoUri,
        thumbUri: videos.thumbUri,
        isFavorite: videos.isFavorite,
        duration: videos.duration,
        fileSize: videos.fileSize,
        orientation: videos.orientation,
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

  const renderItem = useCallback(({ item }: ListRenderItemInfo<VideoMetaForPlaylist>) => {
    return (
      <PlaylistItem
        item={item}
        onRefresh={onRefresh}
      />
    );
  }, []);

  const handleReorder = async ({ from, to }: ReorderableListReorderEvent) => {
    const newData = reorderItems(videoForPlaylistQuery.data, from, to);
    await updatePlaylistOrder({ playlistId, videosOrder: newData });
  };

  return (
    <ReorderableList
      key={`playlist-reorderable_${playlistId}`}
      data={videoForPlaylistQuery.data}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      onReorder={handleReorder}
      ListFooterComponent={<View style={{ paddingTop: ESTIMATED_PLAYLIST_ITEM_HEIGHT + 16 }} />}
    />
  );
}
