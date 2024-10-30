import { Link, router } from "expo-router";
import { Image, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoMeta } from "@/db/schema";
import { deleteVideo, favoriteVideo } from "@/lib/delete-video";
import { EllipsisVerticalIcon, PencilIcon, StarIcon, TrashIcon, TvIcon } from "@/lib/icons";
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
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between gap-4">
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
              <DropdownMenuItem
                className="gap-4"
                onPress={() => router.push(`/watch/${item.id}`)}>
                <TvIcon
                  className="text-foreground"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text>Watch</Text>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-4"
                onPress={() => router.push(`/edit/${item.id}`)}>
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
      <Link
        className="flex-1"
        href={{ pathname: "/(aux)/watch/[id]", params: { id: item.id } }}>
        <Image
          className="flex-1"
          style={{ width: "100%", height: 400 }}
          source={{ uri: item.thumbUri }}
          resizeMode="contain"
        />
      </Link>
    </View>
  );
}
