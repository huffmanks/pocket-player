import { Video } from "expo-av";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoMeta } from "@/db/schema";
import { deleteVideo, favoriteVideo } from "@/lib/delete-video";
import { EllipsisVerticalIcon, PencilIcon, StarIcon, TrashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

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

export default function VideoItem({ item }: { item: VideoMeta }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const insets = useSafeAreaInsets();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  async function handleFavorite() {
    await favoriteVideo(item.id);
  }

  async function handleDelete() {
    await deleteVideo(item.id);
  }

  return (
    <View>
      <View className="flex-row items-center justify-between gap-4">
        <Text
          className="text-lg font-medium"
          numberOfLines={1}>
          {item.title}
        </Text>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="p-2"
              variant="ghost">
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
              <DropdownMenuItem className="gap-4">
                <PencilIcon
                  className="text-foreground"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text>Edit</Text>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-4"
                onPress={handleFavorite}>
                <StarIcon
                  className={cn("text-foreground", item.isFavorite && "fill-foreground")}
                  size={20}
                  strokeWidth={1.25}
                />
                <Text>Favorite</Text>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-4"
              onPress={handleDelete}>
              <TrashIcon
                className="text-destructive"
                size={20}
                strokeWidth={1.25}
              />
              <Text>Delete</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
      <TouchableOpacity onPress={() => setIsPlaying((prev) => !prev)}>
        <Video
          style={{ height: 200 }}
          className="w-full"
          source={{ uri: item.fileUri }}
          isLooping
          shouldPlay={isPlaying}
          isMuted={!isPlaying}
          useNativeControls={isPlaying}
        />
      </TouchableOpacity>
    </View>
  );
}
