import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import Fuse from "fuse.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import migrations from "@/db/migrations/migrations";
import { VideoMeta, videos } from "@/db/schema";
import { ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { CloudUploadIcon } from "@/lib/icons";
import { useAppStore, useDatabaseStore, useSettingsStore } from "@/lib/store";
import { throttle } from "@/lib/utils";

import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export default function HomeScreen() {
  const { appLoadedOnce, setAppLoadedOnce } = useAppStore(
    useShallow((state) => ({
      appLoadedOnce: state.appLoadedOnce,
      setAppLoadedOnce: state.setAppLoadedOnce,
    }))
  );
  const db = useDatabaseStore.getState().db;

  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (!appLoadedOnce) setAppLoadedOnce(true);
  }, [appLoadedOnce]);

  if (!appLoadedOnce || !success) {
    return <Text className="p-5">Migration is in progress...</Text>;
  }

  if (error) {
    console.error("Migration error.");
    return <Text className="p-5">Migration error.</Text>;
  }

  return <ScreenContent />;
}

function ScreenContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [canScroll, setCanScroll] = useState(false);

  const flashListRef = useRef<FlashList<VideoMeta> | null>(null);
  const insets = useSafeAreaInsets();

  const db = useDatabaseStore.getState().db;

  const videoQuery = useLiveQuery(db.select().from(videos).orderBy(videos.updatedAt));
  const { data, error } = videoQuery;

  const {
    sortKey,
    sortDateOrder,
    sortTitleOrder,
    scrollPosition,
    setSortKey,
    toggleSortDateOrder,
    toggleSortTitleOrder,
    setScrollPosition,
  } = useSettingsStore(
    useShallow((state) => ({
      sortKey: state.sortKey,
      sortDateOrder: state.sortDateOrder,
      sortTitleOrder: state.sortTitleOrder,
      scrollPosition: state.scrollPosition,
      setSortKey: state.setSortKey,
      toggleSortDateOrder: state.toggleSortDateOrder,
      toggleSortTitleOrder: state.toggleSortTitleOrder,
      setScrollPosition: state.setScrollPosition,
    }))
  );

  useEffect(() => {
    if (canScroll && scrollPosition > 0 && flashListRef.current) {
      flashListRef.current?.scrollToOffset({ offset: scrollPosition, animated: true });
    }
  }, [canScroll]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;

    const fuse = new Fuse(data, { keys: ["title"], threshold: 0.5 });
    return fuse.search(searchQuery).map((result) => result.item);
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortKey === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDateOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      sorted.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortTitleOrder === "asc"
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      });
    }
    return sorted;
  }, [filteredData, sortKey, sortDateOrder, sortTitleOrder]);

  function handleSortDate() {
    setSortKey("date");
    toggleSortDateOrder();
  }

  function handleSortTitle() {
    setSortKey("title");
    toggleSortTitleOrder();
  }

  const saveScrollY = useRef(
    throttle((y: number) => {
      setScrollPosition(y);
    }, 300)
  ).current;

  const renderItem = useCallback(({ item }: { item: VideoMeta }) => {
    return (
      <View className="px-2">
        <VideoItem item={item} />
      </View>
    );
  }, []);

  if (error) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  return (
    <>
      <View
        style={{ paddingTop: 16, paddingBottom: insets.bottom + 84 }}
        className="relative min-h-full">
        {!!data && data?.length > 0 && (
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSortDate={handleSortDate}
            handleSortTitle={handleSortTitle}
          />
        )}
        <FlashList
          data={sortedData}
          ref={flashListRef}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
          onScroll={(e) => saveScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={150}
          onLayout={() => {
            if (sortedData.length > 0) setCanScroll(true);
          }}
          ListEmptyComponent={<ListEmptyComponent hasData={!!data && data?.length > 0} />}
        />
      </View>
    </>
  );
}

function ListEmptyComponent({ hasData }: { hasData: boolean }) {
  return (
    <View className="p-5">
      <H2 className="mb-4 text-teal-500">{hasData ? "No results" : "No videos yet!"}</H2>
      {!hasData && (
        <>
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
        </>
      )}
    </View>
  );
}
