import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Fuse from "fuse.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta, playlists } from "@/db/schema";
import { BOTTOM_TABS_OFFSET, ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { useDatabaseStore, useSettingsStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

import SearchBar from "@/components/search-bar";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export default function FavoritesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const insets = useSafeAreaInsets();

  const db = useDatabaseStore.getState().db;

  const videosQuery = useLiveQuery(
    db.query.videos.findMany({
      where: (videos, { eq }) => eq(videos.isFavorite, true),
      orderBy: (videos, { asc }) => [asc(videos.createdAt)],
    })
  );

  const playlistVideosQuery = useLiveQuery(db.query.playlistVideos.findMany());

  const videosWithPlaylists = useMemo(() => {
    if (!videosQuery || !playlistVideosQuery) return [];

    const videoToPlaylistsMap: Record<string, string[]> = {};

    for (const { videoId, playlistId } of playlistVideosQuery.data) {
      if (!videoToPlaylistsMap[videoId]) {
        videoToPlaylistsMap[videoId] = [];
      }
      videoToPlaylistsMap[videoId].push(playlistId);
    }

    return videosQuery.data.map((video) => ({
      ...video,
      playlists: videoToPlaylistsMap[video.id] || [],
    }));
  }, [videosQuery.data, playlistVideosQuery.data]);

  const playlistsQuery = useLiveQuery(
    db.select({ value: playlists.id, label: playlists.title }).from(playlists)
  );

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
    if (!videosWithPlaylists) return [];
    if (!searchQuery) return videosWithPlaylists;

    const fuse = new Fuse(videosWithPlaylists, { keys: ["title"], threshold: 0.5 });
    return fuse.search(searchQuery).map((result) => result.item);
  }, [videosQuery, searchQuery]);

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

  const renderItem = useCallback(
    ({ item }: { item: VideoMeta }) => {
      return (
        <View className="px-2">
          <VideoItem
            item={item}
            allPlaylists={playlistsQuery?.data}
          />
        </View>
      );
    },
    [videosQuery, playlistsQuery]
  );

  if (videosQuery.error) {
    toast.error("Error loading data.");
  }

  const favoritesExist = Array.isArray(videosQuery.data) && videosQuery.data.length > 0;

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
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_TABS_OFFSET }}
        estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
        ListHeaderComponent={
          <ListHeaderComponent
            favoritesExist={favoritesExist}
            sortedData={sortedData}
          />
        }
        ListEmptyComponent={<ListEmptyComponent favoritesExist={favoritesExist} />}
      />
    </View>
  );
}

function ListEmptyComponent({ favoritesExist }: { favoritesExist: boolean }) {
  return (
    <View className="p-5">
      <H2 className="mb-4 text-brand-foreground">
        {favoritesExist ? "No results" : "No favorite videos yet!"}
      </H2>
      {!favoritesExist && (
        <Text className="mb-12">Your favorite videos will be displayed here.</Text>
      )}
    </View>
  );
}

function ListHeaderComponent({
  favoritesExist,
  sortedData,
}: {
  favoritesExist: boolean;
  sortedData: VideoMeta[];
}) {
  if (!favoritesExist) return null;

  const videosDuration = formatDuration(
    sortedData?.reduce((total, item) => total + item.duration, 0)
  );
  const videosCount = sortedData.length;

  return (
    <View className="mb-6 flex-row items-center justify-end gap-2 px-3">
      <Text className="text-sm text-muted-foreground">{`${videosCount} video${videosCount > 1 ? "s" : ""}`}</Text>
      <Text className="text-sm text-muted-foreground">·</Text>
      <Text className="text-sm text-muted-foreground">{videosDuration}</Text>
    </View>
  );
}
