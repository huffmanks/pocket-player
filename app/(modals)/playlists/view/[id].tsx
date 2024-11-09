import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { PlaylistMeta, playlists } from "@/db/schema";
import { TvIcon } from "@/lib/icons";

import PlaylistSortable from "@/components/playlist-sortable";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function ViewPlaylistScreen() {
  const [playlist, setPlaylist] = useState<PlaylistMeta | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchPlaylist = async () => {
      const [playlistData] = await db.select().from(playlists).where(eq(playlists.id, id));

      setPlaylist(playlistData);
    };

    fetchPlaylist().catch((error) => {
      console.error("Failed to find playlist or video sources: ", error);
      toast.error("Failed to find playlist or video sources.");
    });
  }, []);

  if (!playlist) return null;

  return (
    <View className="p-5">
      <View className="mb-10">
        <Link
          href={`/(modals)/playlists/watch/${id}`}
          asChild>
          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-4">
            <TvIcon
              className="text-background"
              size={20}
              strokeWidth={1.25}
            />
            <Text>Watch playlist</Text>
          </Button>
        </Link>
      </View>
      <PlaylistSortable playlistId={id} />
    </View>
  );
}
