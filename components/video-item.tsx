import { router } from "expo-router";
import { memo } from "react";
import { Image, Pressable, View } from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { deleteVideo, favoriteVideo } from "@/actions/video";
import { VideoMeta } from "@/db/schema";
import { EllipsisVerticalIcon, PencilIcon, StarIcon, TrashIcon, TvIcon } from "@/lib/icons";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/text";

function VideoItem({ item }: { item: VideoMeta }) {
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

  async function handleDelete() {
    const { message, type } = await deleteVideo(item.id);

    if (type === "success") {
      toast.error(message);
    } else {
      toast.error(message);
    }
  }

  return (
    <Animated.View
      className="mb-8 flex-row items-start gap-4"
      entering={FadeIn}
      exiting={FadeOut}>
      <Pressable onPress={() => router.push(`/(modals)/(video)/watch/${item.id}`)}>
        <Image
          style={{ width: 225, height: 125 }}
          source={{ uri: item.thumbUri }}
          resizeMode="cover"
        />
      </Pressable>
      <View className="flex-1 flex-row justify-between gap-4">
        <View className="w-4/5">
          <Text
            className="mb-2 text-lg font-medium"
            numberOfLines={2}>
            {item.title}
          </Text>

          <Text
            className="text-sm text-muted-foreground"
            numberOfLines={3}>
            {item.description ? item.description : "No description"}
          </Text>
        </View>

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
                onPress={() => router.push(`/(modals)/(video)/watch/${item.id}`)}>
                <TvIcon
                  className="text-foreground"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text>Watch</Text>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-4"
                onPress={() => router.push(`/(modals)/(video)/edit/${item.id}`)}>
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
                    <Text className="native:text-lg font-normal">Delete</Text>
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
                    <Text>Cancel</Text>
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
      </View>
    </Animated.View>
  );
}

export default memo(VideoItem);
