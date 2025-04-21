import { useEffect, useState } from "react";
import { ListRenderItemInfo, View } from "react-native";

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from "react-native-reorderable-list";

import { VideoMeta } from "@/db/schema";
import { ESTIMATED_PLAYLIST_ITEM_HEIGHT } from "@/lib/constants";
import { usePlaylistStore } from "@/lib/store";

import PlaylistItem from "@/components/playlist-item";

type PlaylistSortableProps = {
  playlistId: string;
  videosData: VideoMeta[];
};

export default function PlaylistSortable({ playlistId, videosData }: PlaylistSortableProps) {
  const [data, setData] = useState(videosData);
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

  if (!data.length) return;

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
