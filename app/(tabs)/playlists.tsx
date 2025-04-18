import { Link } from "expo-router";
import { useCallback, useMemo } from "react";
import { Image, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { PlaylistMeta, playlistVideos, playlists, videos } from "@/db/schema";
import { ESTIMATED_PLAYLIST_HEIGHT } from "@/lib/constants";
import { ListMusicIcon } from "@/lib/icons";
import { useDatabaseStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import PlaylistDropdown from "@/components/playlist-dropdown";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

interface PlaylistMetaWithThumbUris extends PlaylistMeta {
  thumbUris: string[];
}

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();

  const db = useDatabaseStore.getState().db;

  const playlistsQuery = useLiveQuery(db.select().from(playlists).orderBy(playlists.title));
  const { data: playlistsData, error: playlistsError } = playlistsQuery;

  const thumbUrisQuery = useLiveQuery(
    db
      .select({ thumbUri: videos.thumbUri, playlistId: playlistVideos.playlistId })
      .from(videos)
      .innerJoin(playlistVideos, eq(videos.id, playlistVideos.videoId))
  );
  const { data: thumbUrisData, error: thumbUrisError } = thumbUrisQuery;

  const playlistsWithThumbUris = useMemo(() => {
    if (!playlistsData || !thumbUrisData) return [];

    return playlistsData.map((playlist) => {
      const thumbUris =
        thumbUrisData
          .filter((video) => video.playlistId === playlist.id)
          .map((video) => video.thumbUri)
          .slice(0, 3) || [];

      return {
        ...playlist,
        thumbUris,
      };
    });
  }, [playlistsData, thumbUrisData]);

  const renderItem = useCallback(
    ({ item }: { item: PlaylistMetaWithThumbUris }) => (
      <View className="mb-4 flex-row items-center justify-between gap-4 rounded-md bg-secondary py-2 pl-3 pr-2">
        <Link
          href={`/(modals)/playlists/view/${item.id}`}
          className="flex flex-1 flex-row items-center gap-4">
          <View className="flex-row items-center">
            {item.thumbUris.map((thumbUri, index) => (
              <Image
                key={index}
                className={cn("rounded-full", index === 0 ? "" : "-ml-6")}
                style={{ width: 45, height: 45 }}
                source={{ uri: thumbUri }}
              />
            ))}
          </View>
          <View className="pl-4 pt-3">
            <Text
              className="max-w-[225px] flex-1 text-lg font-medium text-foreground"
              numberOfLines={1}>
              {item.title}
            </Text>
          </View>
        </Link>
        <PlaylistDropdown item={item} />
      </View>
    ),
    []
  );

  if (playlistsError || thumbUrisError) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  return (
    <>
      <View
        style={{ paddingTop: 16, paddingBottom: insets.bottom + 84 }}
        className="relative min-h-full px-5">
        <FlashList
          data={playlistsWithThumbUris}
          keyExtractor={(item, index) => {
            return item.id + index;
          }}
          renderItem={renderItem}
          estimatedItemSize={ESTIMATED_PLAYLIST_HEIGHT}
          ListHeaderComponent={
            <ListHeaderComponent hasData={playlistsData && playlistsData.length > 0} />
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
            size={24}
            strokeWidth={1.5}
          />
          <Text className="native:text-base font-semibold uppercase tracking-wider">
            Create playlist
          </Text>
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
