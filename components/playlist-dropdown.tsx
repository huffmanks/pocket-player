import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { PlaylistMeta } from "@/db/schema";
import { BOTTOM_TABS_OFFSET } from "@/lib/constants";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, TvIcon, ViewIcon } from "@/lib/icons";
import { usePlaylistStore } from "@/lib/store";

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
import { Text } from "@/components/ui/text";

interface PlaylistDropdownProps {
  item: PlaylistMeta;
  playlistVideosExist: boolean;
}

export default function PlaylistDropdown({ item, playlistVideosExist }: PlaylistDropdownProps) {
  const insets = useSafeAreaInsets();
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);

  const contentInsets = {
    top: insets.top + BOTTOM_TABS_OFFSET,
    bottom: insets.bottom + BOTTOM_TABS_OFFSET,
    left: 12,
    right: 12,
  };

  async function handleDelete() {
    try {
      const { message, status } = await deletePlaylist(item.id);

      if (status === "success") {
        toast.error(message);
        router.push("/playlists");
      }
    } catch (error) {
      toast.error("Failed to delete playlist.");
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
        className="native:w-72 w-64"
        insets={contentInsets}>
        <DropdownMenuLabel
          className="native:text-lg"
          numberOfLines={1}>
          {item.title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!playlistVideosExist}
            className="gap-4"
            onPress={() => router.push(`/(screens)/playlists/${item.id}/watch`)}>
            <TvIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg text-foreground">Watch</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(screens)/playlists/${item.id}/edit`)}>
            <PencilIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg text-foreground">Edit</Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(screens)/playlists/${item.id}/view`)}>
            <ViewIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg text-foreground">View</Text>
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
                <Text> playlist permanently.</Text>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleDelete}>
                <Text>Delete</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
