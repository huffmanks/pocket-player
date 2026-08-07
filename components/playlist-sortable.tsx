import { Link } from "expo-router";
import { useMemo } from "react";
import { ListRenderItemInfo, View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ListVideoIcon } from "lucide-react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import ReorderableList, {
  ReorderableListCellAnimations,
  ReorderableListDragEndEvent,
  ReorderableListDragStartEvent,
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { VideoMeta, playlistVideos } from "@/db/schema";
import { useDatabaseStore, usePlaylistStore } from "@/lib/store";

import PlaylistItem from "@/components/playlist-item";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

interface PlaylistSortableProps {
  playlistId: string;
}

export default function PlaylistSortable({ playlistId }: PlaylistSortableProps) {
  const db = useDatabaseStore.getState().db;
  const updatePlaylistOrder = usePlaylistStore((state) => state.updatePlaylistOrder);

  const opacity = useSharedValue(1);

  const handleDragStart = (_: ReorderableListDragStartEvent) => {
    "worklet";
    opacity.value = withTiming(0.5);
  };

  const handleDragEnd = (_: ReorderableListDragEndEvent) => {
    "worklet";
    opacity.value = withTiming(1);
  };

  const playlistVideosQuery = useLiveQuery(
    db.query.playlistVideos.findMany({
      where: eq(playlistVideos.playlistId, playlistId),
      columns: { playlistId: true, order: true },
      with: {
        video: true,
      },
    })
  );

  const isLoaded = Boolean(playlistVideosQuery.data || playlistVideosQuery.error);

  const videosData = useMemo(() => {
    if (!playlistVideosQuery.data) return [];
    return playlistVideosQuery.data
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(({ video }) => video);
  }, [playlistVideosQuery.data]);

  const renderItem = ({ item }: ListRenderItemInfo<VideoMeta>) => (
    <PlaylistItem
      item={item}
      playlistId={playlistId}
    />
  );

  const cellAnimations: ReorderableListCellAnimations = useMemo(
    () => ({
      opacity,
    }),
    [opacity]
  );

  const handleReorder = async ({ from, to }: ReorderableListReorderEvent) => {
    if (!videosData) return;
    const newData = reorderItems(videosData, from, to);
    await updatePlaylistOrder({ playlistId, videosOrder: newData });
  };

  if (isLoaded && !videosData.length) {
    return <ListEmptyComponent playlistId={playlistId} />;
  }

  return (
    <ReorderableList
      data={videosData}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onReorder={handleReorder}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      cellAnimations={cellAnimations}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<View style={{ paddingTop: 40 }} />}
      ListFooterComponent={<View style={{ paddingBottom: 40 }} />}
    />
  );
}

function ListEmptyComponent({ playlistId }: { playlistId: string }) {
  return (
    <View className="mt-10 px-2">
      <Text
        variant="h2"
        className="mb-4 text-brand-foreground">
        Playlist empty
      </Text>
      <Text className="mb-8 text-muted-foreground">Add some videos to this playlist.</Text>
      <Link
        href={`/(screens)/playlists/${playlistId}/edit`}
        asChild>
        <Button
          size="lg"
          variant="brand"
          className="flex flex-row items-center justify-center gap-4">
          <Icon
            as={ListVideoIcon}
            className="text-white"
            size={24}
            strokeWidth={1.5}
          />
          <Text className="native:text-base font-semibold uppercase tracking-wider">
            Add videos
          </Text>
        </Button>
      </Link>
    </View>
  );
}
