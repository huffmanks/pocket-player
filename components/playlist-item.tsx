import { Image, Pressable, Text } from "react-native";

import { ReorderableListItem, useReorderableDrag } from "react-native-reorderable-list";

import { VideoMeta } from "@/db/schema";

import VideoDropdown from "@/components/video-dropdown";

export default function PlaylistItem({ item }: { item: VideoMeta }) {
  const drag = useReorderableDrag();

  return (
    <ReorderableListItem className="mb-4 flex-row items-center justify-between gap-4 rounded-md bg-secondary pr-2">
      <Pressable
        className="flex flex-1 flex-row items-center gap-4 "
        onLongPress={drag}>
        <Image
          className="rounded-l-md"
          style={{ width: 120, height: 80 }}
          source={{ uri: item.thumbUri }}
          resizeMode="cover"
        />
        <Text
          className="text-lg font-medium text-foreground"
          numberOfLines={1}>
          {item.title}
        </Text>
      </Pressable>
      <VideoDropdown item={item} />
    </ReorderableListItem>
  );
}
