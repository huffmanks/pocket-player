import { router } from "expo-router";
import { Text } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { EllipsisVerticalIcon, ListMusicIcon, PencilIcon, StarIcon } from "@/lib/icons";
import { usePlaylistStore, useVideoStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import type { VideoMetaForPlaylist } from "@/components/playlist-sortable";
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

interface VideoDropdownProps {
  item: VideoMetaForPlaylist;
  onRefresh: () => void;
}

export default function PlaylistVideoDropdown({ item, onRefresh }: VideoDropdownProps) {
  const insets = useSafeAreaInsets();
  const toggleFavorite = useVideoStore((state) => state.toggleFavorite);
  const removeVideoFromPlaylist = usePlaylistStore((state) => state.removeVideoFromPlaylist);

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  async function handleFavorite() {
    const { message, status } = await toggleFavorite(item.id);

    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }

  async function handleRemoveFromPlaylist() {
    const { message, status } = await removeVideoFromPlaylist({
      playlistId: item.playlistId,
      videoId: item.id,
    });

    if (status === "success") {
      onRefresh();
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
