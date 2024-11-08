import { Link } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { useMigrationHelper } from "@/db/drizzle";
import { VideoMeta, videos } from "@/db/schema";
import { ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { CloudUploadIcon } from "@/lib/icons";
import { useDatabase } from "@/providers/database-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export default function HomeScreen() {
  const { success, error } = useMigrationHelper();

  if (!success) {
    console.info("Migration is in progress...");
    return <Text className="p-5">Migration is in progress...</Text>;
  }

  if (error) {
    console.error("Migration error.");
    return <Text className="p-5">Migration error.</Text>;
  }

  if (success && !error) {
    return <ScreenContent />;
  }
}

function ScreenContent() {
  const [refreshing, setRefreshing] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<VideoMeta[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setKeyIndex((prev) => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const { db } = useDatabase();
  const { data, error }: { data: VideoMeta[]; error: Error | undefined } = useLiveQuery(
    // @ts-expect-error
    db?.select().from(videos)
  );

  useEffect(() => {
    if (data) {
      const filtered = data.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

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
        <Input
          className="mb-8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search videos"
        />
        <FlashList
          data={filteredData}
          // data={data}
          key={`videos_${keyIndex}`}
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
      <H2 className="mb-4 text-teal-500">No videos yet!</H2>
      <Text className="mb-12">Your videos will be displayed here.</Text>
      <Link
        href="/(tabs)/upload"
        asChild>
        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-4">
          <CloudUploadIcon
            className="text-background"
            size={20}
            strokeWidth={1.25}
          />
          <Text>Upload</Text>
        </Button>
      </Link>
    </View>
  );
}
