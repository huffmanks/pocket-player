import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  const [refreshing, setRefreshing] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);

  const reorderableListRef = useRef<FlatList<VideoMetaForPlaylist> | null>(null);

  const { updatePlaylistOrder } = usePlaylistStore();
  const { db } = useDatabaseStore();
  const { data }: { data: VideoMetaForPlaylist[] } = useLiveQuery(
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
      .orderBy(playlistVideos.order)
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setKeyIndex((prev) => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 200);
  }, []);

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const snapToIndex = Math.round(contentOffsetY / ESTIMATED_PLAYLIST_ITEM_HEIGHT);
    const newY = snapToIndex * ESTIMATED_PLAYLIST_ITEM_HEIGHT;

    reorderableListRef.current?.scrollToOffset({ offset: newY, animated: true });
  };

  const renderItem = ({ item }: ListRenderItemInfo<VideoMetaForPlaylist>) => (
    <PlaylistItem
      item={item}
      onRefresh={onRefresh}
    />
  );

  const handleReorder = async ({ from, to }: ReorderableListReorderEvent) => {
    const newData = reorderItems(data!, from, to);
    await updatePlaylistOrder({ playlistId, videosOrder: newData });
  };

  return (
    <ReorderableList
      key={`playlist-reorderable_${keyIndex}`}
      data={data!}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      onReorder={handleReorder}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onScrollEndDrag={handleScrollEndDrag}
    />
  );
}
