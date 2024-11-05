import { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { VideoMeta, videos } from "@/db/schema";
import { ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { useDatabase } from "@/providers/database-provider";

import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export default function FavoritesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setKeyIndex((prev) => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const { db } = useDatabase();
  const { data, error } = useLiveQuery(
    // @ts-expect-error
    db?.select().from(videos).where(eq(videos.isFavorite, true))
  );

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
        style={{ paddingTop: 16, paddingBottom: insets.bottom + 84 }}
        className="relative min-h-full">
        <FlashList
          data={data}
          key={`favorites_${keyIndex}`}
          keyExtractor={(item, index) => {
            return item.id + index;
          }}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
          onScrollEndDrag={handleScrollEndDrag}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      </View>
    </>
  );
}

function ListEmptyComponent() {
  return (
    <View className="mt-2 p-5">
      <H2 className="mb-4 text-teal-500">No favorites yet!</H2>
      <Text className="mb-12">Your favorite videos will be displayed here.</Text>
    </View>
  );
}
