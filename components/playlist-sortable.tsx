import React, { useState } from "react";
import { ListRenderItemInfo, Pressable, Text } from "react-native";

import ReorderableList, {
  ReorderableListItem,
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from "react-native-reorderable-list";

export type PlaylistMeta = {
  id: string;
  key?: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const Card: React.FC<PlaylistMeta> = React.memo(({ id, title, description }) => {
  const drag = useReorderableDrag();

  return (
    <ReorderableListItem>
      <Pressable
        className="m-2 h-24 items-center justify-center rounded-md bg-secondary"
        onLongPress={drag}>
        <Text className="text-foreground">{title}</Text>
        <Text className="text-foreground">{description}</Text>
      </Pressable>
    </ReorderableListItem>
  );
});

export default function PlaylistSortable({ initData }: { initData: PlaylistMeta[] }) {
  const [data, setData] = useState<PlaylistMeta[]>(initData);

  const renderItem = ({ item }: ListRenderItemInfo<PlaylistMeta>) => <Card {...item} />;

  const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
    const newData = reorderItems(data, from, to);
    setData(newData);
  };

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={(item) => {
        item.key = item.id;
        return item.key;
      }}
    />
  );
}
