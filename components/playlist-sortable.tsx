import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ListRenderItemInfo, View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { VideoMeta, playlistVideos } from "@/db/schema";
import { ListVideoIcon } from "@/lib/icons";
import { useDatabaseStore, usePlaylistStore } from "@/lib/store";

import PlaylistItem from "@/components/playlist-item";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

interface PlaylistSortableProps {
  playlistId: string;
}

export default function PlaylistSortable({ playlistId }: PlaylistSortableProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  const db = useDatabaseStore.getState().db;
  const updatePlaylistOrder = usePlaylistStore((state) => state.updatePlaylistOrder);

  const playlistVideosQuery = useLiveQuery(
    db.query.playlistVideos.findMany({
      where: eq(playlistVideos.playlistId, playlistId),
      columns: { playlistId: true, order: true },
      with: {
        video: true,
      },
    })
  );

  const videosData = useMemo(() => {
    return playlistVideosQuery.data.sort((a, b) => a.order - b.order).map(({ video }) => video);
  }, [playlistVideosQuery]);

  const renderItem = ({ item }: ListRenderItemInfo<VideoMeta>) => (
    <PlaylistItem
      item={item}
      playlistId={playlistId}
    />
  );

  const handleReorder = async ({ from, to }: ReorderableListReorderEvent) => {
    if (!videosData) return;
    const newData = reorderItems(videosData, from, to);
    await updatePlaylistOrder({ playlistId, videosOrder: newData });
  };

  useEffect(() => {
    if (!hasLoaded && (!!playlistVideosQuery.data || playlistVideosQuery.error)) {
      setHasLoaded(true);
    }
  }, [playlistVideosQuery]);

  if (hasLoaded && !videosData?.length) {
    return <ListEmptyComponent playlistId={playlistId} />;
  }

  return (
    <ReorderableList
      data={videosData}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onReorder={handleReorder}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<View style={{ paddingTop: 40 }} />}
      ListFooterComponent={<View style={{ paddingBottom: 40 }} />}
    />
  );
}

function ListEmptyComponent({ playlistId }: { playlistId: string }) {
  return (
    <View className="mt-10 px-2">
      <H2 className="mb-4 text-brand-foreground">Playlist empty</H2>
      <Text className="mb-8 text-muted-foreground">Add some videos to this playlist.</Text>
      <Link
        href={`/(screens)/playlists/${playlistId}/edit`}
        asChild>
        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-4 bg-brand">
          <ListVideoIcon
            className="text-white"
            size={24}
            strokeWidth={1.5}
          />
          <Text className="native:text-base font-semibold uppercase tracking-wider text-white">
            Add videos
          </Text>
        </Button>
      </Link>
    </View>
  );
}
