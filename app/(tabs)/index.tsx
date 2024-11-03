import { useCallback, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { MasonryFlashList, MasonryFlashListRef } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { useMigrationHelper } from "@/db/drizzle";
import { VideoMeta, videos } from "@/db/schema";
import { ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { useDatabase } from "@/providers/database-provider";

import { Text } from "@/components/ui/text";
import VideoItem from "@/components/video-item";

export default function HomeScreen() {
  const { success, error } = useMigrationHelper();

  if (!success) {
    // toast.info("Migration is in progress...");
    console.info("Migration is in progress...");
  }

  if (error) {
    // toast.error("Migration error: " + error.message);
    console.error("Migration error.");
  }

  return <ScreenContent />;
}

function ScreenContent() {
  const { db } = useDatabase();
  // @ts-expect-error
  const { data, error } = useLiveQuery(db?.select().from(videos));

  const flashListRef = useRef<MasonryFlashListRef<VideoMeta> | null>(null);
  const insets = useSafeAreaInsets();

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const snapToIndex = Math.round(contentOffsetY / ESTIMATED_VIDEO_ITEM_HEIGHT);
    const newY = snapToIndex * ESTIMATED_VIDEO_ITEM_HEIGHT;

    flashListRef.current?.scrollToOffset({ offset: newY, animated: true });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: VideoMeta; index: number }) => (
      <View className="px-2">
        <VideoItem
          key={`${item.id}-${index}`}
          item={item}
        />
      </View>
    ),
    []
  );

  if (error) {
    console.log("Error loading data.");
    // toast.error("Error loading data.");
  }

  const duplicatedData = data.concat(data, data, data);

  return (
    <>
      <View
        style={{ paddingBottom: insets.bottom + 84 }}
        className="relative min-h-full">
        <MasonryFlashList
          data={duplicatedData}
          renderItem={renderItem}
          estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
          onScrollEndDrag={handleScrollEndDrag}
          ListEmptyComponent={<Text className="p-5">No videos uploaded.</Text>}
        />
      </View>
    </>
  );
}
