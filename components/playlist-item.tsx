import { memo } from "react";
import { Image, Pressable, View } from "react-native";

import { GripVerticalIcon } from "lucide-react-native";
import { useReorderableDrag } from "react-native-reorderable-list";
import { toast } from "sonner-native";

import { VideoMeta } from "@/db/schema";
import { XIcon } from "@/lib/icons";
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
import { Text } from "@/components/ui/text";

interface PlaylistItemProps {
  item: VideoMeta;
  playlistId: string;
}

function PlaylistItem({ item, playlistId }: PlaylistItemProps) {
  const drag = useReorderableDrag();
  const removeVideoFromPlaylist = usePlaylistStore((state) => state.removeVideoFromPlaylist);

  async function handleRemoveFromPlaylist() {
    try {
      const { message, status } = await removeVideoFromPlaylist({
        playlistId,
        videoId: item.id,
      });

      if (status === "success") {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to remove from playlist.");
    }
  }

  return (
    <View className="mb-6 flex-row items-center justify-between gap-3">
      <Pressable
        className="flex-1"
        onLongPress={drag}>
        <View className="flex-row items-center">
          <GripVerticalIcon
            className="text-muted-foreground"
            size={24}
            strokeWidth={1.5}
          />
          <Image
            className="ml-2 mr-3 rounded-md"
            style={{ width: 45, height: 45 }}
            source={{ uri: item.thumbUri }}
          />
          <View>
            <Text
              className="flex-1 text-foreground"
              numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-sm text-muted-foreground">{item.durationFormatted}</Text>
          </View>
        </View>
      </Pressable>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost">
            <XIcon
              className="text-muted-foreground"
              size={20}
              strokeWidth={1.5}
            />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              <Text>This will remove the </Text>
              <Text className="font-semibold">“{item.title}”</Text>
              <Text> video from this playlist.</Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text className="text-foreground">Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onPress={handleRemoveFromPlaylist}>
              <Text className="text-white">Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

export default memo(PlaylistItem);
