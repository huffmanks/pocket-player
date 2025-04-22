import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { PlaylistMeta } from "@/db/schema";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";

interface PlaylistDropdownProps {
  item: PlaylistMeta;
}

export default function PlaylistDropdown({ item }: PlaylistDropdownProps) {
  const insets = useSafeAreaInsets();
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
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
            strokeWidth={1.25}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent insets={contentInsets}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/playlists/watch/${item.id}`)}>
            <TvIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
            <Text className="text-lg text-foreground">Watch</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/playlists/edit/${item.id}`)}>
            <PencilIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
            <Text className="text-lg text-foreground">Edit</Text>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-4"
            onPress={() => router.push(`/(modals)/playlists/view/${item.id}`)}>
            <ViewIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
            <Text className="text-lg text-foreground">View</Text>
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
                This action cannot be undone. This will permanently delete the playlist.
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
