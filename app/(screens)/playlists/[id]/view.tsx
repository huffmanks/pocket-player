import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, TvIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { playlistVideos, playlists } from "@/db/schema";
import { BOTTOM_TABS_OFFSET } from "@/lib/constants";
import { errorHandler } from "@/lib/error-handler";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function ViewPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const contentInsets = {
    top: insets.top + BOTTOM_TABS_OFFSET,
    bottom: insets.bottom + BOTTOM_TABS_OFFSET,
    left: 12,
    right: 12,
  };

  const db = useDatabaseStore.getState().db;
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);

  const playlistQuery = useLiveQuery(
    db.select().from(playlists).where(eq(playlists.id, id)).orderBy(playlists.title)
  );
  const playlistVideosQuery = useLiveQuery(
    db.select().from(playlistVideos).where(eq(playlistVideos.playlistId, id)).limit(1)
  );

  const isInitialLoading = !playlistQuery.updatedAt || !playlistVideosQuery.updatedAt;

  async function handleDelete() {
    try {
      const { message, status } = await deletePlaylist(id);

      if (status === "success") {
        toast.error(message);
        router.push("/(tabs)/playlists");
      }
    } catch (error) {
      toast.error(errorHandler(error));
    }
  }

  if (playlistQuery.error || playlistVideosQuery.error) {
    toast.error("Error loading data.");
  }

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!playlistQuery.data?.length) return null;

  return (
    <View
      style={{ paddingTop: 16, paddingBottom: insets.bottom }}
      className="flex-1 px-3">
      <View className="mb-8 px-2">
        <View className="mb-4 flex-row items-start justify-between gap-2">
          <Text
            variant="h2"
            className="flex-1"
            numberOfLines={2}>
            {playlistQuery.data[0].title}
          </Text>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="-mr-1 p-1"
                variant="ghost"
                size="unset">
                <Icon
                  as={EllipsisVerticalIcon}
                  className="text-foreground"
                  size={24}
                  strokeWidth={1.5}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="native:w-72 w-64"
              insets={contentInsets}>
              <DropdownMenuLabel
                className="native:text-lg"
                numberOfLines={1}>
                {playlistQuery.data[0].title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-4"
                  onPress={() => router.push(`/(screens)/playlists/${id}/edit`)}>
                  <Icon
                    as={PencilIcon}
                    className="text-foreground"
                    size={20}
                    strokeWidth={1.5}
                  />
                  <Text className="native:text-lg text-foreground">Edit</Text>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <AlertDialog>
                <DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <Button
                      style={{ margin: -8 }}
                      className="w-full flex-1 flex-row justify-start gap-4 rounded-sm p-2"
                      size="unset"
                      variant="ghost">
                      <Icon
                        as={TrashIcon}
                        className="text-destructive"
                        size={20}
                        strokeWidth={1.5}
                      />
                      <Text className="native:text-lg font-normal text-destructive">Delete</Text>
                    </Button>
                  </AlertDialogTrigger>
                </DropdownMenuItem>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <Text>This will delete the </Text>
                      <Text
                        className="font-semibold text-destructive"
                        numberOfLines={1}>
                        “{playlistQuery.data[0].title}”
                      </Text>
                      <Text> playlist permanently.</Text>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onPress={handleDelete}>
                        <Text>Delete</Text>
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
        <Text className="text-muted-foreground">
          {playlistQuery.data[0]?.description
            ? playlistQuery.data[0]?.description
            : "No description."}
        </Text>
      </View>
      <View className="mb-1 flex-row items-center justify-center gap-2 px-2">
        <View className="flex-1">
          <Link
            href={`/(screens)/playlists/${id}/watch`}
            asChild>
            <Button
              size="lg"
              variant="brand"
              disabled={!playlistVideosQuery.data?.length}
              className="flex flex-row items-center justify-center gap-3">
              <Icon
                as={TvIcon}
                className="text-white"
                size={24}
                strokeWidth={1.5}
              />
              <Text className="native:text-base font-semibold uppercase tracking-wider">Watch</Text>
            </Button>
          </Link>
        </View>
      </View>

      <PlaylistSortable
        isInitialLoading={isInitialLoading}
        playlistId={id}
      />
    </View>
  );
}
