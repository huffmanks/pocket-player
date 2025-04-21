import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { playlistVideos, playlists } from "@/db/schema";
import { TvIcon } from "@/lib/icons";
import { useDatabaseStore } from "@/lib/store";

import PlaylistSortable from "@/components/playlist-sortable";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export default function ViewPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const db = useDatabaseStore.getState().db;

  const playlistQuery = useLiveQuery(
    db.select().from(playlists).where(eq(playlists.id, id)).orderBy(playlists.title)
  );

  const videosQuery = useLiveQuery(
    db.query.playlistVideos.findMany({
      where: eq(playlistVideos.playlistId, id),
      columns: { playlistId: true, order: true },
      with: {
        video: true,
      },
    })
  );

  const videosData = videosQuery.data.sort((a, b) => a.order - b.order).map(({ video }) => video);

  if (playlistQuery.error || videosQuery.error) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  if (!playlistQuery.data[0]) return;

  return (
    <View
      style={{ paddingTop: 16, paddingBottom: insets.bottom + 84 }}
      className="relative min-h-full px-5">
      <View className="mb-10">
        <Link
          href={`/(modals)/playlists/watch/${id}`}
          asChild>
          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-4">
            <TvIcon
              className="text-background"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              Watch playlist
            </Text>
          </Button>
        </Link>
      </View>
      <View className="mb-10">
        <H2 className="mb-4">{playlistQuery.data[0].title}</H2>
        <Text className="text-muted-foreground">
          {playlistQuery.data[0]?.description
            ? playlistQuery.data[0]?.description
            : "No description."}
        </Text>
      </View>
      <PlaylistSortable
        playlistId={id}
        videosData={videosData}
      />
    </View>
  );
}
