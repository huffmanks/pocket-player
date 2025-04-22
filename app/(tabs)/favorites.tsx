import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Fuse from "fuse.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta, videos } from "@/db/schema";
import { ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { useDatabaseStore, useSettingsStore } from "@/lib/store";

import SearchBar from "@/components/search-bar";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export default function FavoritesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const insets = useSafeAreaInsets();

  const db = useDatabaseStore.getState().db;

  const videoQuery = useLiveQuery(
    db.select().from(videos).where(eq(videos.isFavorite, true)).orderBy(videos.updatedAt)
  );
  const { data, error } = videoQuery;

  const {
    sortKey,
    sortDateOrder,
    sortTitleOrder,
    setSortKey,
    toggleSortDateOrder,
    toggleSortTitleOrder,
  } = useSettingsStore(
    useShallow((state) => ({
      sortKey: state.sortKey,
      sortDateOrder: state.sortDateOrder,
      sortTitleOrder: state.sortTitleOrder,
      setSortKey: state.setSortKey,
      toggleSortDateOrder: state.toggleSortDateOrder,
      toggleSortTitleOrder: state.toggleSortTitleOrder,
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

  function handleSortDate() {
    setSortKey("date");
    toggleSortDateOrder();
  }

  function handleSortTitle() {
    setSortKey("title");
    toggleSortTitleOrder();
  }

  const renderItem = useCallback(({ item }: { item: VideoMeta }) => {
    return (
      <View className="px-2">
        <VideoItem item={item} />
      </View>
    );
  }, []);

  if (error) {
    toast.error("Error loading data.");
  }

  const favoritesExist = Array.isArray(data) && data.length > 0;

  return (
    <View className="relative min-h-full pt-4">
      {favoritesExist && (
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSortDate={handleSortDate}
          handleSortTitle={handleSortTitle}
        />
      )}
      <FlashList
        data={sortedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
        ListEmptyComponent={<ListEmptyComponent favoritesExist={favoritesExist} />}
      />
    </View>
  );
}

function ListEmptyComponent({ favoritesExist }: { favoritesExist: boolean }) {
  return (
    <View className="p-5">
      <H2 className="mb-4 text-teal-500">
        {favoritesExist ? "No results" : "No favorite videos yet!"}
      </H2>
      {!favoritesExist && (
        <Text className="mb-12">Your favorite videos will be displayed here.</Text>
      )}
    </View>
  );
}
