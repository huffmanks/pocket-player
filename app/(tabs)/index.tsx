import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Fuse from "fuse.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta, videos } from "@/db/schema";
import { ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { CloudUploadIcon } from "@/lib/icons";
import { useAppStore, useDatabaseStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { throttle } from "@/lib/utils";

import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const flashListRef = useRef<FlashList<VideoMeta> | null>(null);
  const canSaveScroll = useRef(false);
  const hasRestoredScroll = useRef(false);
  const insets = useSafeAreaInsets();

  const isAppReady = useAppStore((state) => state.isAppReady);
  const isLocked = useSecurityStore((state) => state.isLocked);
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

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!canSaveScroll.current) return;
    saveScrollY(e.nativeEvent.contentOffset.y);
  }

  function handleContentSizeChange() {
    if (!flashListRef.current || scrollPosition <= 0 || hasRestoredScroll.current) return;

    InteractionManager.runAfterInteractions(() => {
      flashListRef.current?.scrollToOffset({
        offset: scrollPosition,
        animated: false,
      });
      hasRestoredScroll.current = true;
    });
  }

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
    }, 250)
  ).current;

  const renderItem = useCallback(({ item }: { item: VideoMeta }) => {
    return (
      <View className="px-2">
        <VideoItem item={item} />
      </View>
    );
  }, []);

  useEffect(() => {
    if (isAppReady && !isLocked) {
      canSaveScroll.current = true;
    } else {
      canSaveScroll.current = false;
    }
  }, [isAppReady, isLocked]);

  if (error) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  const videosExist = Array.isArray(data) && data.length > 0;

  return (
    <View className="relative min-h-full pt-4">
      {videosExist && (
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
        scrollEventThrottle={250}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        ListEmptyComponent={<ListEmptyComponent videosExist={videosExist} />}
      />
    </View>
  );
}

function ListEmptyComponent({ videosExist }: { videosExist: boolean }) {
  return (
    <View className="p-5">
      <H2 className="mb-4 text-teal-500">{videosExist ? "No results" : "No videos yet!"}</H2>
      {!videosExist && (
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
                size={24}
                strokeWidth={1.5}
              />
              <Text className="native:text-base font-semibold uppercase tracking-wider">
                Upload videos
              </Text>
            </Button>
          </Link>
        </>
      )}
    </View>
  );
}
