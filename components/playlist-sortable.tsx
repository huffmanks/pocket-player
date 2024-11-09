import React, { useEffect, useState } from "react";
import { ListRenderItemInfo } from "react-native";

import { eq, sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { playlistVideos, videos } from "@/db/schema";
import { useDatabase } from "@/providers/database-provider";

import PlaylistItem from "@/components/playlist-item";

export type VideoMetaForPlaylist = {
  key: string;
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  videoUri: string;
  thumbUri: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  hasPlaylist: number;
};

export default function PlaylistSortable({ playlistId }: { playlistId: string }) {
  const [data, setData] = useState<VideoMetaForPlaylist[] | null>(null);

  const { db } = useDatabase();
  const { data: liveData, error } = useLiveQuery(
    // @ts-expect-error
    db?.select({
        key: videos.id,
        id: videos.id,
        title: videos.title,
        description: videos.description,
        isFavorite: videos.isFavorite,
        thumbUri: videos.thumbUri,
        videoUri: videos.videoUri,
        createdAt: videos.createdAt,
        updatedAt: videos.updatedAt,
        order: playlistVideos.order,
        hasPlaylist: sql`1`,
      })
      .from(videos)
      .innerJoin(playlistVideos, eq(playlistVideos.videoId, videos.id))
      .where(eq(playlistVideos.playlistId, playlistId))
      .orderBy(playlistVideos.order)
  );

  useEffect(() => {
    if (liveData) {
      setData(liveData);
    }
  }, [liveData]);

  const renderItem = ({ item }: ListRenderItemInfo<VideoMetaForPlaylist>) => (
    <PlaylistItem item={item} />
  );

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const newData = reorderItems(data!, from, to);
    setData(newData);
  };

  return (
    <ReorderableList
      data={data!}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
    />
  );
}
