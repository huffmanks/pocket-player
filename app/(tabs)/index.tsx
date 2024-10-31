import { useCallback, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { MasonryFlashList, MasonryFlashListRef } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMigrationHelper } from "@/db/drizzle";
import { useDatabase } from "@/db/provider";
import { VideoMeta, videos } from "@/db/schema";

import ErrorMessage from "@/components/error-message";
import { Text } from "@/components/ui/text";
import VideoItem from "@/components/video-item";

const ITEM_HEIGHT = 157;

export default function HomeScreen() {
  const { success, error } = useMigrationHelper();

  if (error) {
    return (
      <ErrorMessage
        message="Migration error:"
        errorMessage={error.message}
      />
    );
  }

  if (!success) {
    return <ErrorMessage message="Migration is in progress..." />;
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
    const snapToIndex = Math.round(contentOffsetY / ITEM_HEIGHT);
    const newY = snapToIndex * ITEM_HEIGHT;

    flashListRef.current?.scrollToOffset({ offset: newY, animated: true });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: VideoMeta; index: number }) => (
      <View className="px-1">
        <VideoItem
          key={`${item.id}-${index}`}
          item={item}
        />
      </View>
    ),
    []
  );

  if (error) {
    return <ErrorMessage message="Error loading data." />;
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
          estimatedItemSize={ITEM_HEIGHT}
          onScrollEndDrag={handleScrollEndDrag}
          ListEmptyComponent={<Text className="p-5">No videos uploaded.</Text>}
        />
      </View>
    </>
  );
}
