import React, { useEffect, useState } from "react";
import { ListRenderItemInfo } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { playlistVideos, videos } from "@/db/schema";
import { useDatabase } from "@/providers/database-provider";

import PlaylistItem from "@/components/playlist-item";

export type VideoMetaWithOrder = {
  key: string;
  order: number;
  id: string;
  title: string;
  description: string;
  videoUri: string;
  thumbUri: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function PlaylistSortable({ playlistId }: { playlistId: string }) {
  const [data, setData] = useState<VideoMetaWithOrder[] | null>(null);

  const { db } = useDatabase();
  const { data: liveData, error } = useLiveQuery(
    // @ts-expect-error
    db?.select({
        order: playlistVideos.order,
        createdAt: videos.createdAt,
        description: videos.description,
        id: videos.id,
        isFavorite: videos.isFavorite,
        thumbUri: videos.thumbUri,
        title: videos.title,
        updatedAt: videos.updatedAt,
        videoUri: videos.videoUri,
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

  const renderItem = ({ item }: ListRenderItemInfo<VideoMetaWithOrder>) => (
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
      keyExtractor={(item) => {
        item.key = item.id;
        return item.key;
      }}
    />
  );
}
