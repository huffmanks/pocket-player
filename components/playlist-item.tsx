import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { GripVerticalIcon, XIcon } from "lucide-react-native";
import { useReorderableDrag } from "react-native-reorderable-list";
import { toast } from "sonner-native";

import { VideoMeta } from "@/db/schema";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VIDEO_PLACEHOLDER } from "@/lib/constants";
import { errorHandler } from "@/lib/error-handler";
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
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

interface PlaylistItemProps {
  item: VideoMeta;
  playlistId: string;
}

function PlaylistItem({ item, playlistId }: PlaylistItemProps) {
  const { colorScheme } = useColorScheme();
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
      toast.error(errorHandler(error));
    }
  }

  const thumbUri = item?.thumbUri ? `${item.thumbUri}?v=${item.thumbTimestamp}` : undefined;
  const thumbSource = thumbUri ? { uri: thumbUri } : VIDEO_PLACEHOLDER[colorScheme];

  return (
    <View className="mb-6 flex-row items-center justify-between gap-3">
      <Pressable
        className="flex-1"
        onLongPress={drag}>
        <View className="flex-row items-center">
          <Icon
            as={GripVerticalIcon}
            className="text-muted-foreground"
            size={24}
            strokeWidth={1.5}
          />
          <View className="ml-2 mr-3 h-[45] w-[45] overflow-hidden rounded-md bg-card">
            <Image
              style={{ width: "100%", height: "100%" }}
              recyclingKey={thumbUri ?? "playlist-item_placeholder"}
              source={thumbSource}
            />
          </View>
          <View className="mr-2 flex-1">
            <Text
              className="text-foreground"
              numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-sm text-muted-foreground">{item.durationLabel}</Text>
          </View>
        </View>
      </Pressable>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost">
            <Icon
              as={XIcon}
              className="text-muted-foreground"
              size={20}
              strokeWidth={1.5}
            />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <Text>This will remove the </Text>
              <Text
                className="font-semibold text-destructive"
                numberOfLines={1}>
                “{item.title}”
              </Text>
              <Text> video from this playlist.</Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onPress={handleRemoveFromPlaylist}>
              <Text className="text-destructive-foreground">Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

export default memo(PlaylistItem);
