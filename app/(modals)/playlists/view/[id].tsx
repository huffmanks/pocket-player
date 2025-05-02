import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { playlistVideos, playlists } from "@/db/schema";
import { PencilIcon, TrashIcon, TvIcon } from "@/lib/icons";
import { useDatabaseStore, usePlaylistStore } from "@/lib/store";

import PlaylistSortable from "@/components/playlist-sortable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export default function ViewPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const db = useDatabaseStore.getState().db;
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);

  const playlistQuery = useLiveQuery(
    db.select().from(playlists).where(eq(playlists.id, id)).orderBy(playlists.title)
  );

  const playlistVideosQuery = useLiveQuery(
    db.select().from(playlistVideos).where(eq(playlistVideos.playlistId, id)).limit(1)
  );

  async function handleDelete() {
    try {
      const { message, status } = await deletePlaylist(id);

      if (status === "success") {
        toast.error(message);
        router.push("/playlists");
      }
    } catch (error) {
      toast.error("Failed to delete playlist.");
    }
  }

  if (playlistQuery.error || playlistVideosQuery.error) {
    toast.error("Error loading data.");
  }

  if (!playlistQuery.data?.length) return null;

  return (
    <View
      style={{ paddingTop: 16, paddingBottom: insets.bottom }}
      className="flex-1 px-3">
      <View className="mb-8 px-2">
        <H2 className="mb-4">{playlistQuery.data[0].title}</H2>
        <Text className="text-muted-foreground">
          {playlistQuery.data[0]?.description
            ? playlistQuery.data[0]?.description
            : "No description."}
        </Text>
      </View>
      <View className="mb-1 flex-row items-center justify-center gap-2 px-2">
        <View className="flex-1">
          <Link
            href={`/(modals)/playlists/watch/${id}`}
            asChild>
            <Button
              disabled={!playlistVideosQuery.data?.length}
              className="flex flex-row items-center justify-center gap-4">
              <TvIcon
                className="text-background"
                size={24}
                strokeWidth={1.5}
              />
              <Text className="native:text-base font-semibold uppercase tracking-wider">Watch</Text>
            </Button>
          </Link>
        </View>
        <View>
          <Link
            href={`/(modals)/playlists/edit/${id}`}
            asChild>
            <Button
              variant="secondary"
              className="flex flex-row items-center justify-center gap-4">
              <PencilIcon
                className="text-foreground"
                size={24}
                strokeWidth={1.5}
              />
            </Button>
          </Link>
        </View>
        <View>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex flex-row items-center justify-center gap-4 bg-destructive">
                <TrashIcon
                  className="text-destructive-foreground"
                  size={24}
                  strokeWidth={1.5}
                />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  <Text>This will delete the </Text>
                  <Text className="font-semibold">“{playlistQuery.data[0].title}”</Text>
                  <Text> playlist permanently.</Text>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text className="text-foreground">Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onPress={handleDelete}>
                  <Text className="text-white">Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </View>

      <PlaylistSortable playlistId={id} />
    </View>
  );
}
