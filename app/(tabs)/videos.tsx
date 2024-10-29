import { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";

import { useScrollToTop } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { useMigrationHelper } from "@/db/drizzle";
import { useDatabase } from "@/db/provider";
import { VideoMeta, videos } from "@/db/schema";

import ErrorMessage from "@/components/error-message";
import { Text } from "@/components/ui/text";
import VideoItem from "@/components/video-item";

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

  console.log(data);

  const ref = useRef(null);
  useScrollToTop(ref);

  const renderItem = useCallback(
    ({ item, index }: { item: VideoMeta; index: number }) => (
      <VideoItem
        key={`${item.id}-${index}`}
        item={item}
      />
    ),
    []
  );

  if (error) {
    return <ErrorMessage message="Error loading data." />;
  }

  return (
    <>
      <View className="relative h-full">
        <ScrollView
          contentContainerClassName="mx-auto w-full max-w-lg p-6"
          showsVerticalScrollIndicator={true}
          className="bg-background"
          automaticallyAdjustContentInsets={false}
          contentInset={{ top: 12 }}>
          <View className="min-h-1">
            <FlashList
              ref={ref}
              className="native:overflow-hidden rounded-t-lg"
              estimatedItemSize={10}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={(props) => (
                <View>
                  <Text>No videos</Text>
                </View>
              )}
              data={data}
              renderItem={renderItem}
              keyExtractor={(video) => `video-${video.id}`}
              ItemSeparatorComponent={() => <View className="py-4" />}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}
