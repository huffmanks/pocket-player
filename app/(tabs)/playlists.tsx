import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { playlists } from "@/db/schema";

import PlaylistSortable, { PlaylistMeta } from "@/components/playlist-sortable";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export default function PlaylistsScreen() {
  const [data, setData] = useState<PlaylistMeta[] | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const playlistData = await db.select().from(playlists);
      setData(playlistData);
    };

    fetchPlaylists().catch((error) => {
      console.error("Failed to any playlists: ", error);
      toast.error("Failed to any playlists.");
    });
  }, []);

  if (!data) {
    return (
      <View>
        <H2 className="mb-4 text-teal-500">No playlists yet!</H2>
        <Text className="mb-12">Your playlists will be displayed here.</Text>
      </View>
    );
  }

  return (
    <>
      <View className="mb-4 mt-2 p-5">
        <Link
          href="/(modals)/playlists/create"
          asChild>
          <Button size="lg">
            <Text>Create a playlist</Text>
          </Button>
        </Link>
      </View>
      <PlaylistSortable initData={data} />
    </>
  );
}
