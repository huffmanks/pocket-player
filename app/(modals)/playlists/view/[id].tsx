import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TvIcon } from "@/lib/icons";

import PlaylistSortable from "@/components/playlist-sortable";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function ViewPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

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
