import { useRouter } from "expo-router";
import { View } from "react-native";

import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { VideoMetaWithPlaylists } from "@/app/(tabs)";
import { BOTTOM_TABS_OFFSET } from "@/lib/constants";
import {
  CheckIcon,
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
  item: VideoMetaWithPlaylists;
  allPlaylists?: {
    value: string;
    label: string;
  }[];
}

export default function VideoDropdown({ item, allPlaylists }: VideoDropdownProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const contentInsets = {
    top: insets.top + BOTTOM_TABS_OFFSET,
    bottom: insets.bottom + BOTTOM_TABS_OFFSET,
    left: 12,
    right: 12,
  };

  const { toggleFavorite, deleteVideo } = useVideoStore(
    useShallow((state) => ({
      toggleFavorite: state.toggleFavorite,
      deleteVideo: state.deleteVideo,
    }))
  );
  const { toggleVideoInPlaylist } = usePlaylistStore(
    useShallow((state) => ({
      toggleVideoInPlaylist: state.toggleVideoInPlaylist,
    }))
  );

  async function handleFavorite() {
    try {
      const { message, isFavorite, status } = await toggleFavorite(item.id);

      if (status === "success" && isFavorite) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to add to favorites.");
    }
  }

  async function handleVideoPlaylist(playlistId: string) {
    try {
      const { message, isAdded, status } = await toggleVideoInPlaylist({
        playlistId,
        videoId: item.id,
      });

      if (status === "success" && isAdded) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to add to playlist.");
    }
  }

  async function handleDelete() {
    try {
      const { message, status } = await deleteVideo(item.id);

      if (status === "success") {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to delete video.");
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
            strokeWidth={1.5}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        insets={contentInsets}
        className="native:w-80 w-64">
        <DropdownMenuLabel
          className="native:text-lg"
          numberOfLines={1}>
          {item.title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/videos/watch/${item.id}`)}>
            <TvIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg text-foreground">Watch</Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/videos/edit/${item.id}`)}>
            <PencilIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg text-foreground">Edit</Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-4"
            onPress={handleFavorite}>
            <StarIcon
              className={cn("text-foreground", item.isFavorite && "fill-foreground")}
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg text-foreground">Favorite</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {allPlaylists && allPlaylists?.length ? (
          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Text className="native:text-lg text-foreground">Add to playlist</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.ScrollView
                  className="max-h-40 overflow-y-auto"
                  showsVerticalScrollIndicator={false}
                  entering={FadeIn.duration(200)}>
                  {allPlaylists.map((playlist) => (
                    <DropdownMenuItem
                      key={`add-to-playlist_${playlist.value}`}
                      className={cn(
                        "flex-row items-center justify-between gap-3",
                        item?.playlists?.includes(playlist.value) && "bg-secondary"
                      )}
                      onPress={() => handleVideoPlaylist(playlist.value)}>
                      <View className="flex-1 flex-row items-center gap-4">
                        <ListMusicIcon
                          className="text-foreground"
                          size={20}
                          strokeWidth={1.5}
                        />
                        <Text
                          className="mr-4 flex-1 text-foreground"
                          numberOfLines={1}>
                          {playlist.label}
                        </Text>
                      </View>
                      <View>
                        {item?.playlists?.includes(playlist.value) && (
                          <CheckIcon
                            size={20}
                            strokeWidth={1.5}
                            className={"text-foreground"}
                          />
                        )}
                      </View>
                    </DropdownMenuItem>
                  ))}
                </Animated.ScrollView>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        ) : null}

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
                  strokeWidth={1.5}
                />
                <Text className="native:text-lg font-normal text-destructive">Delete</Text>
              </Button>
            </AlertDialogTrigger>
          </DropdownMenuItem>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                <Text>This will delete the </Text>
                <Text className="font-semibold">“{item.title}”</Text>
                <Text> video permanently.</Text>
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
