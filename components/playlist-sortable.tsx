import { useRef } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";

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
  const reorderableListRef = useRef<FlatList<VideoMetaForPlaylist> | null>(null);

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
    [playlistId]
  );

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const snapToIndex = Math.round(contentOffsetY / ESTIMATED_PLAYLIST_ITEM_HEIGHT);
    const newY = snapToIndex * ESTIMATED_PLAYLIST_ITEM_HEIGHT;

    reorderableListRef.current?.scrollToOffset({ offset: newY, animated: true });
  };

  const renderItem = ({ item }: ListRenderItemInfo<VideoMetaForPlaylist>) => (
    <PlaylistItem item={item} />
  );

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
      onScrollEndDrag={handleScrollEndDrag}
    />
  );
}
