import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { InteractionManager, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { FlashList, ViewToken } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Fuse from "fuse.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta, playlists } from "@/db/schema";
import { BOTTOM_TABS_OFFSET, ESTIMATED_VIDEO_ITEM_HEIGHT } from "@/lib/constants";
import { CloudUploadIcon } from "@/lib/icons";
import { useDatabaseStore, useSecurityStore, useSettingsStore } from "@/lib/store";
import { formatDuration, throttle } from "@/lib/utils";

import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2 } from "@/components/ui/typography";
import VideoItem from "@/components/video-item";

export type VideoMetaWithPlaylists = VideoMeta & { playlists?: string[] };

export default function VideosScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const flashListRef = useRef<FlashList<VideoMeta> | null>(null);
  const hasRenderedOnce = useRef(false);
  const hasUserScrolled = useRef(false);
  const canSaveScroll = useRef(false);
  const hasRestoredScroll = useRef(false);
  const insets = useSafeAreaInsets();

  const isLocked = useSecurityStore((state) => state.isLocked);
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
  const db = useDatabaseStore.getState().db;

  const videosQuery = useLiveQuery(
    db.query.videos.findMany({
      orderBy: (videos, { asc }) => [asc(videos.createdAt)],
    })
  );
  const playlistVideosQuery = useLiveQuery(db.query.playlistVideos.findMany());
  const playlistsQuery = useLiveQuery(
    db.select({ value: playlists.id, label: playlists.title }).from(playlists)
  );

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
  }, [videosQuery, playlistVideosQuery]);

  const videosExist = !!videosWithPlaylists.length;

  const filteredData = useMemo(() => {
    if (!videosWithPlaylists) return [];
    if (!searchQuery) return videosWithPlaylists;

    const fuse = new Fuse(videosWithPlaylists, { keys: ["title"], threshold: 0.5 });
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, videosWithPlaylists]);

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
    hasUserScrolled.current = true;
    if (!canSaveScroll.current || isLocked) return;
    saveScrollY(e.nativeEvent.contentOffset.y);
  }

  const saveScrollY = useRef(
    throttle((y: number) => {
      setScrollPosition(y);
    }, 150)
  ).current;

  function handleSortDate() {
    setSortKey("date");
    toggleSortDateOrder();
  }

  function handleSortTitle() {
    setSortKey("title");
    toggleSortTitleOrder();
  }

  const renderItem = useCallback(
    ({ item }: { item: VideoMetaWithPlaylists }) => {
      return (
        <View className="px-2">
          <VideoItem
            item={item}
            allPlaylists={playlistsQuery?.data}
          />
        </View>
      );
    },
    [playlistsQuery?.data]
  );

  function restoreScroll() {
    if (
      hasRestoredScroll.current ||
      hasUserScrolled.current ||
      !flashListRef.current ||
      scrollPosition < 0
    )
      return;

    flashListRef.current.scrollToOffset({
      offset: scrollPosition,
      animated: false,
    });
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!hasRenderedOnce.current && viewableItems.length > 0) {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          restoreScroll();
          hasRenderedOnce.current = true;
          hasRestoredScroll.current = true;
          canSaveScroll.current = true;
        });
      });
    }
  }).current;

  useFocusEffect(
    useCallback(() => {
      hasRestoredScroll.current = false;

      return () => {
        hasRenderedOnce.current = false;
        hasUserScrolled.current = false;
        hasRestoredScroll.current = false;
        canSaveScroll.current = false;
      };
    }, [])
  );

  if (videosQuery.error) {
    toast.error("Error loading data.");
  }

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
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_TABS_OFFSET }}
        estimatedItemSize={ESTIMATED_VIDEO_ITEM_HEIGHT}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={150}
        onScroll={handleScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        ListHeaderComponent={
          <ListHeaderComponent
            videosExist={videosExist}
            sortedData={sortedData}
          />
        }
        ListEmptyComponent={<ListEmptyComponent videosExist={videosExist} />}
      />
    </View>
  );
}

function ListEmptyComponent({ videosExist }: { videosExist: boolean }) {
  return (
    <View className="px-4 py-2">
      {!videosExist && <H1 className="mb-6">Videos</H1>}
      <H2 className="mb-4 text-brand-foreground">
        {videosExist ? "No results" : "No videos yet!"}
      </H2>
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

function ListHeaderComponent({
  videosExist,
  sortedData,
}: {
  videosExist: boolean;
  sortedData: VideoMeta[];
}) {
  if (!videosExist) return null;

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
