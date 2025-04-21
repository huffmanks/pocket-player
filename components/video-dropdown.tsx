import { router } from "expo-router";

import { count, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { db } from "@/db/drizzle";
import { VideoMeta, playlistVideos, playlists } from "@/db/schema";
import {
  EllipsisVerticalIcon,
  ListMusicIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
  TvIcon,
} from "@/lib/icons";
import { usePlaylistStore, useVideoStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";

interface VideoDropdownProps {
  item: VideoMeta;
}

export default function VideoDropdown({ item }: VideoDropdownProps) {
  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const { toggleFavorite, deleteVideo } = useVideoStore(
    useShallow((state) => ({
      toggleFavorite: state.toggleFavorite,
      deleteVideo: state.deleteVideo,
    }))
  );
  const { addVideoToPlaylist, removeVideoFromPlaylist } = usePlaylistStore(
    useShallow((state) => ({
      addVideoToPlaylist: state.addVideoToPlaylist,
      removeVideoFromPlaylist: state.removeVideoFromPlaylist,
    }))
  );

  const playlistQuery = useLiveQuery(db.select().from(playlists));
  const isInPlaylist = useLiveQuery(
    db
      .select({ count: count(), videoId: playlistVideos.videoId })
      .from(playlistVideos)
      .where(eq(playlistVideos.videoId, item.id))
  );

  async function handleFavorite() {
    const { message, status } = await toggleFavorite(item.id);
    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  async function handleAddToPlaylist(playlistId: string) {
    const { message, status } = await addVideoToPlaylist({ playlistId, videoId: item.id });

    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  async function handleRemoveFromPlaylist() {
    const { message, status } = await removeVideoFromPlaylist({ videoId: item.id });

    if (status === "success") {
      toast.error(message);
    } else {
      toast.error(message);
    }
  }

  async function handleDelete() {
    const { message, status } = await deleteVideo(item.id);

    if (status === "success") {
      toast.error(message);
    } else {
      toast.error(message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="px-0.5 py-1"
          variant="ghost"
          size="unset">
          <EllipsisVerticalIcon
            className="text-foreground"
            size={20}
            strokeWidth={1.25}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        insets={contentInsets}
        className="native:w-72 w-64">
        <DropdownMenuLabel numberOfLines={1}>{item.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/videos/watch/${item.id}`)}>
            <TvIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
            <Text className="text-foreground">Watch</Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/videos/edit/${item.id}`)}>
            <PencilIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
            <Text className="text-foreground">Edit</Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-4"
            onPress={handleFavorite}>
            <StarIcon
              className={cn("text-foreground", item.isFavorite && "fill-foreground")}
              size={20}
              strokeWidth={1.25}
            />
            <Text className="text-foreground">Favorite</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          {isInPlaylist?.data?.[0]?.count > 0 ? (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-4"
                onPress={handleRemoveFromPlaylist}>
                <ListMusicIcon
                  className="text-foreground"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text
                  className="text-foreground"
                  numberOfLines={1}>
                  Remove from playlist
                </Text>
              </DropdownMenuItem>
            </>
          ) : (
            playlistQuery.data &&
            playlistQuery.data.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Text className="text-foreground">Add to playlist</Text>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <Animated.View entering={FadeIn.duration(200)}>
                      {playlistQuery.data.map((playlist) => (
                        <DropdownMenuItem
                          key={`add-to-playlist_${playlist.id}`}
                          className="gap-4"
                          onPress={() => handleAddToPlaylist(playlist.id)}>
                          <ListMusicIcon
                            className="text-foreground"
                            size={20}
                            strokeWidth={1.25}
                          />
                          <Text
                            className="text-foreground"
                            numberOfLines={1}>
                            {playlist.title}
                          </Text>
                        </DropdownMenuItem>
                      ))}
                    </Animated.View>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )
          )}
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
                <TrashIcon
                  className="text-destructive"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text className="native:text-base font-normal text-foreground">Delete</Text>
              </Button>
            </AlertDialogTrigger>
          </DropdownMenuItem>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the video.
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
