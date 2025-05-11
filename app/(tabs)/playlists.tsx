import { Link } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { playlists, videos } from "@/db/schema";
import { ListMusicIcon } from "@/lib/icons";
import { useDatabaseStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

import PlaylistCollage from "@/components/playlist-collage";
import PlaylistDropdown from "@/components/playlist-dropdown";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2 } from "@/components/ui/typography";

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const db = useDatabaseStore.getState().db;

  const playlistsQuery = useLiveQuery(db.select().from(playlists).orderBy(playlists.title));

  const thumbUrisQuery = useLiveQuery(
    db.query.playlistVideos.findMany({
      columns: { playlistId: true },
      with: {
        video: {
          columns: { id: true, thumbUri: true, duration: true },
        },
      },
    })
  );

  const videosQuery = useLiveQuery(db.select().from(videos).limit(1));

  const playlistsWithThumbUris = useMemo(() => {
    if (!thumbUrisQuery.data?.length) {
      return playlistsQuery.data.map((playlist) => ({
        ...playlist,
        playlistCount: null,
        playlistDuration: null,
        thumbUris: null,
      }));
    }

    return playlistsQuery.data.map((playlist) => {
      const relatedThumbs = thumbUrisQuery.data.filter((item) => item.playlistId === playlist.id);

      const playlistDuration = relatedThumbs.reduce(
        (total, item) => total + item.video.duration,
        0
      );

      return {
        ...playlist,
        playlistCount: relatedThumbs.length,
        playlistDuration: formatDuration(playlistDuration),
        thumbUris: relatedThumbs
          .map((item) => ({
            id: item.video.id,
            thumbUri: item.video.thumbUri,
          }))
          .slice(0, 6),
      };
    });
  }, [playlistsQuery.data, thumbUrisQuery.data]);

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

function ListEmptyComponent({ videosExist }: { videosExist: boolean }) {
  return (
    <View className="py-2">
      <H1 className="mb-6">Playlists</H1>
      <H2 className="mb-4 text-brand-foreground">No playlists yet!</H2>
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
