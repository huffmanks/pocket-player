import { Link } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { PlaylistMeta, playlists } from "@/db/schema";
import { ESTIMATED_PLAYLIST_HEIGHT } from "@/lib/constants";
import { ListMusicIcon } from "@/lib/icons";
import { useDatabaseStore } from "@/lib/store";

import PlaylistDropdown from "@/components/playlist-dropdown";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export default function PlaylistsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setKeyIndex((prev) => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const db = useDatabaseStore.getState().db;

  const playlistQuery = useLiveQuery(db.select().from(playlists));

  const flashListRef = useRef<FlashList<PlaylistMeta> | null>(null);
  const insets = useSafeAreaInsets();

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const snapToIndex = Math.round(contentOffsetY / ESTIMATED_PLAYLIST_HEIGHT);
    const newY = snapToIndex * ESTIMATED_PLAYLIST_HEIGHT;

    flashListRef.current?.scrollToOffset({ offset: newY, animated: true });
  };

  const renderItem = useCallback(
    ({ item }: { item: PlaylistMeta }) => (
      <View className="mb-5 flex-row items-center justify-between gap-4 rounded-md bg-secondary p-4">
        <Link
          className="flex-1"
          href={`/(modals)/playlists/view/${item.id}`}>
          <View className="flex-1">
            <Text
              className="text-lg font-medium text-foreground"
              numberOfLines={1}>
              {item.title}
            </Text>
            {item.description && (
              <Text
                className="text-muted-foreground"
                numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
        </Link>
        <PlaylistDropdown item={item} />
      </View>
    ),
    []
  );

  if (playlistQuery.error) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  return (
    <>
      <View
        style={{ paddingTop: 16, paddingBottom: insets.bottom + 84 }}
        className="relative min-h-full px-5">
        <FlashList
          data={playlistQuery.data}
          key={`playlists_${keyIndex}`}
          keyExtractor={(item, index) => {
            return item.id + index;
          }}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          estimatedItemSize={ESTIMATED_PLAYLIST_HEIGHT}
          onScrollEndDrag={handleScrollEndDrag}
          ListHeaderComponent={
            <ListHeaderComponent hasData={playlistQuery.data && playlistQuery.data.length > 0} />
          }
          ListEmptyComponent={<ListEmptyComponent />}
        />
      </View>
    </>
  );
}

function ListHeaderComponent({ hasData }: { hasData: boolean }) {
  if (!hasData) return null;

  return (
    <View className="mb-10">
      <Link
        href="/(modals)/playlists/create"
        asChild>
        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-4">
          <ListMusicIcon
            className="text-background"
            size={20}
            strokeWidth={1.25}
          />
          <Text>Create playlist</Text>
        </Button>
      </Link>
    </View>
  );
}

function ListEmptyComponent() {
  return (
    <>
      <View className="pt-5">
        <H2 className="mb-4 text-teal-500">No playlists yet!</H2>
        <Text className="mb-12">Your playlists will be displayed here.</Text>
      </View>
      <ListHeaderComponent hasData />
    </>
  );
}
