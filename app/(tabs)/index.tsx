import { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
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
    console.info("Migration is in progress...");
    return <Text>Migration is in progress...</Text>;
  }

  if (error) {
    console.error("Migration error.");
    return <Text>Migration error.</Text>;
  }

  return <ScreenContent />;
}

function ScreenContent() {
  const [refreshing, setRefreshing] = useState(false);
  const [key, setKey] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setKey((prev) => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const { db } = useDatabase();
  // @ts-expect-error
  const { data, error } = useLiveQuery(db?.select().from(videos));

  const flashListRef = useRef<FlashList<VideoMeta> | null>(null);
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
        <VideoItem item={item} />
      </View>
    ),
    []
  );

  if (error) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  return (
    <>
      <View
        style={{ paddingBottom: insets.bottom + 84 }}
        className="relative min-h-full">
        <FlashList
          data={data}
          key={key}
          keyExtractor={(item, index) => {
            return item.id + index;
          }}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
          onScrollEndDrag={handleScrollEndDrag}
          ListEmptyComponent={<Text className="p-5">No videos uploaded.</Text>}
        />
      </View>
    </>
  );
}
