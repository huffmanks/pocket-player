import { router } from "expo-router";
import { Text } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { removeFromPlaylist } from "@/actions/playlist";
import { favoriteVideo } from "@/actions/video";
import { EllipsisVerticalIcon, ListMusicIcon, PencilIcon, StarIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { VideoMetaForPlaylist } from "@/components/playlist-sortable";
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

  async function handleRemoveFromPlaylist() {
    const { message, type } = await removeFromPlaylist({ videoId: item.id });

    if (type === "success") {
      toast.error(message);
      onRefresh();
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
        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
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
