import { Link } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ListMusicIcon } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { playlistVideos, playlists, videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

import PlaylistCollage from "@/components/playlist-collage";
import PlaylistDropdown from "@/components/playlist-dropdown";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const db = useDatabaseStore.getState().db;

  const playlistsQuery = useLiveQuery(db.select().from(playlists).orderBy(playlists.title));

  const playlistVideosQuery = useLiveQuery(db.select().from(playlistVideos));
  const videosQuery = useLiveQuery(db.select().from(videos));

  const playlistsWithThumbUris = useMemo(() => {
    if (!playlistsQuery.data?.length) return [];

    const videoMap = new Map(videosQuery.data?.map((video) => [video.id, video]) ?? []);

    return playlistsQuery.data.map((playlist) => {
      const relatedPlaylistVideos = (playlistVideosQuery.data ?? []).filter(
        (item) => item.playlistId === playlist.id
      );

      const relatedVideos = relatedPlaylistVideos
        .map((pv) => videoMap.get(pv.videoId))
        .filter((v): v is NonNullable<typeof v> => v !== undefined);

      const playlistDuration = relatedVideos.reduce((total, video) => total + video.duration, 0);

      return {
        ...playlist,
        playlistCount: relatedVideos.length,
        playlistDuration: formatDuration(playlistDuration),
        thumbUris: relatedVideos
          .map((video) => ({
            id: video.id,
            thumbUri: video.thumbUri ? `${video.thumbUri}?v=${video.thumbTimestamp}` : undefined,
          }))
          .slice(0, 6),
      };
    });
  }, [playlistsQuery.data, playlistVideosQuery.data, videosQuery.data]);

  const playlistsExist = !!playlistsWithThumbUris.length;
  const videosExist = !!videosQuery.data?.length;

  if (playlistsQuery.error) {
    toast.error("Error loading data.");
  }

  return (
    <ScrollView
      contentInset={insets}
      contentContainerClassName="pb-20"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {playlistsExist ? (
          <>
            <ListHeaderComponent />
            <View className="flex-row flex-wrap items-center justify-between gap-8">
              {playlistsWithThumbUris.map((playlist) => (
                <View
                  key={playlist.id}
                  className="gap-2">
                  <Link href={`/(screens)/playlists/${playlist.id}/view`}>
                    <PlaylistCollage images={playlist.thumbUris} />
                  </Link>

                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1 pl-2">
                      <Text
                        numberOfLines={1}
                        className="text-lg font-semibold">
                        {playlist.title}
                      </Text>

                      {!!playlist?.playlistCount && !!playlist?.playlistDuration && (
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm text-muted-foreground">
                            {`${playlist.playlistCount} video${playlist.playlistCount > 1 ? "s" : ""}`}
                          </Text>
                          <Text className="text-sm text-muted-foreground">·</Text>
                          <Text className="text-sm text-muted-foreground">
                            {playlist.playlistDuration}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View>
                      <PlaylistDropdown
                        item={playlist}
                        playlistVideosExist={!!playlist.thumbUris?.length}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <ListEmptyComponent videosExist={videosExist} />
        )}
      </View>
    </ScrollView>
  );
}

function ListHeaderComponent() {
  return (
    <View className="mb-10">
      <Link
        href="/(screens)/playlists/create"
        asChild>
        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-4">
          <Icon
            as={ListMusicIcon}
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

function ListEmptyComponent({ videosExist }: { videosExist: boolean }) {
  return (
    <View className="py-2">
      <Text
        variant="h1"
        className="mb-6">
        Playlists
      </Text>
      <Text
        variant="h2"
        className="mb-4 text-brand-foreground">
        No playlists yet!
      </Text>
      <Text className="mb-12">Your playlists will be displayed here.</Text>
      {videosExist && (
        <Link
          href="/(screens)/playlists/create"
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
      )}
    </View>
  );
}
