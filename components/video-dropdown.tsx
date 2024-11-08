import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";

import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { addToPlaylist, removeFromPlaylist } from "@/actions/playlist";
import { deleteVideo, favoriteVideo, videoIsInPlaylist } from "@/actions/video";
import { PlaylistMeta, VideoMeta } from "@/db/schema";
import {
  EllipsisVerticalIcon,
  ListMusicIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
  TvIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

import { VideoMetaWithOrder } from "@/components/playlist-sortable";
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

interface VideoDropdownProps {
  item: VideoMeta | VideoMetaWithOrder;
  playlists: PlaylistMeta[] | null;
}

export default function VideoDropdown({ item, playlists }: VideoDropdownProps) {
  const [hasPlaylist, setHasPlaylist] = useState(false);

  useEffect(() => {
    videoIsInPlaylist(item.id).then((result) => {
      setHasPlaylist(result.value ?? false);
    });
  }, [item.id]);

  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  async function handleFavorite() {
    const { message, type, added } = await favoriteVideo(item.id);

    if (type === "success") {
      if (added) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } else {
      toast.error(message);
    }
  }

  async function handleAddToPlaylist(playlistId: string) {
    const { message, type } = await addToPlaylist({ playlistId, videoId: item.id });

    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  async function handleRemoveFromPlaylist() {
    const { message, type } = await removeFromPlaylist({ videoId: item.id });

    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  async function handleDelete() {
    const { message, type } = await deleteVideo(item.id);

    if (type === "success") {
      toast.error(message);
    } else {
      toast.error(message);
    }
  }

  const playlistsExist = playlists && playlists.length > 0;

  console.log("playlistsExist ___", playlistsExist);
  console.log("hasPlaylist ___", hasPlaylist);

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
        <DropdownMenuLabel>Video | {item.title}</DropdownMenuLabel>
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

        {playlistsExist && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {hasPlaylist ? (
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
              ) : (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Text className="text-foreground">Add to playlist</Text>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <Animated.View entering={FadeIn.duration(200)}>
                      {playlists.map((playlist) => (
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
              )}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <AlertDialog>
          <DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full flex-1 flex-row justify-start gap-4 rounded-sm p-2"
                size="unset"
                variant="ghost">
                <TrashIcon
                  className="text-destructive"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text className="native:text-lg font-normal text-foreground">Delete</Text>
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
