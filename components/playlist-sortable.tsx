import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ListRenderItemInfo, View } from "react-native";

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { VideoMeta } from "@/db/schema";
import { ESTIMATED_PLAYLIST_ITEM_HEIGHT } from "@/lib/constants";
import { ListVideoIcon } from "@/lib/icons";
import { usePlaylistStore } from "@/lib/store";

import PlaylistItem from "@/components/playlist-item";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H3 } from "@/components/ui/typography";

interface PlaylistSortableProps {
  playlistId: string;
  videosData: VideoMeta[];
}

export default function PlaylistSortable({ playlistId, videosData }: PlaylistSortableProps) {
  const [data, setData] = useState<VideoMeta[] | null>(null);
  const updatePlaylistOrder = usePlaylistStore((state) => state.updatePlaylistOrder);

  useEffect(() => {
    if (videosData?.length) {
      setData(videosData);
    }
  }, [videosData]);

  const renderItem = ({ item }: ListRenderItemInfo<VideoMeta>) => (
    <PlaylistItem
      item={item}
      playlistId={playlistId}
    />
  );

  const handleReorder = async ({ from, to }: ReorderableListReorderEvent) => {
    if (!data) return;
    const newData = reorderItems(data, from, to);
    await updatePlaylistOrder({ playlistId, videosOrder: newData });
    setData(newData);
  };

  if (!data?.length) {
    return <ListEmptyComponent playlistId={playlistId} />;
  }

  return (
    <ReorderableList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onReorder={handleReorder}
      ListFooterComponent={<View style={{ paddingTop: ESTIMATED_PLAYLIST_ITEM_HEIGHT + 16 }} />}
    />
  );
}

function ListEmptyComponent({ playlistId }: { playlistId: string }) {
  return (
    <View className="">
      <H3 className="mb-2">Playlist empty</H3>
      <Text className="mb-8 text-muted-foreground">Add some videos to this playlist.</Text>
      <Link
        href={`/(modals)/playlists/edit/${playlistId}`}
        asChild>
        <Button
          size="lg"
          className="bg-brand flex flex-row items-center justify-center gap-4">
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
