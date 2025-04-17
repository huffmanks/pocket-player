import * as FileSystem from "expo-file-system";
import { VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
import { createId } from "@paralleldrive/cuid2";
import { GestureDetector } from "react-native-gesture-handler";
import { toast } from "sonner-native";

import { VideoMeta } from "@/db/schema";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { VIDEOS_DIR } from "@/lib/constants";
import { ImageDownIcon, LockIcon, LockOpenIcon } from "@/lib/icons";
import { useVideoStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface VideoThumbPickerProps {
  videoInfo: VideoMeta;
}

export default function VideoThumbPicker({ videoInfo }: VideoThumbPickerProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateVideo = useVideoStore((state) => state.updateVideo);

  const {
    videoRef,
    player,
    time,
    progress,
    setProgress,
    onSliderChange,
    onSlidingStart,
    onSlidingComplete,
    tapGesture,
  } = useVideoPlayerControls([videoInfo.videoUri], true);

  async function handleSaveThumb() {
    if (isSaving || isLocked) return;
    setIsSaving(true);

    try {
      const newThumbTimestamp = player.currentTime * 1000;
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoInfo.videoUri, {
        time: newThumbTimestamp,
      });

      const fileId = createId();
      const newUri = `${VIDEOS_DIR}${videoInfo.title}-${fileId}.jpg`;

      await FileSystem.moveAsync({ from: uri, to: newUri });
      await FileSystem.deleteAsync(videoInfo.thumbUri, { idempotent: true });

      await updateVideo({
        id: videoInfo.id,
        values: { thumbUri: newUri, thumbTimestamp: newThumbTimestamp },
      });
      toast.success("Thumbnail updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update thumbnail.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    setProgress(videoInfo.thumbTimestamp);
    player.currentTime = videoInfo.thumbTimestamp / 1000;
  }, []);

  return (
    <GestureDetector gesture={tapGesture}>
      <View className="flex-1">
        <View className="mb-1 w-full overflow-hidden rounded-lg px-4">
          <VideoView
            ref={videoRef}
            style={{ width: "100%", height: 200, borderRadius: "0.5rem", overflow: "hidden" }}
            player={player}
            contentFit="contain"
            nativeControls={false}
          />
        </View>

        <View className="flex-1 justify-between">
          <View className="gap-2">
            <View className="px-4">
              <Text className="text-sm text-white/70">{time}</Text>
            </View>
            <View className="flex-1 px-4 pb-5">
              <Slider
                disabled={isLocked}
                value={progress}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                thumbStyle={{ backgroundColor: isLocked ? "#343434" : "#14b8a6" }}
                minimumTrackTintColor="#f8fafc"
                maximumTrackTintColor="#1f242b"
                onValueChange={(val) => onSliderChange(Number(val))}
                onSlidingStart={onSlidingStart}
                onSlidingComplete={(val) => onSlidingComplete(Number(val))}
              />
            </View>
          </View>

          <View className="mb-1 px-4">
            <View className="flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                className="flex flex-1 flex-row items-center justify-center gap-4"
                onPress={() => setIsLocked((prev) => !prev)}>
                {isLocked ? (
                  <LockIcon
                    className="text-foreground"
                    size={20}
                    strokeWidth={1.5}
                  />
                ) : (
                  <LockOpenIcon
                    className="text-foreground"
                    size={20}
                    strokeWidth={1.5}
                  />
                )}
                <Text>{isLocked ? "Unlock" : "Lock"}</Text>
              </Button>
              <Button
                className="flex flex-1 flex-row items-center justify-center gap-4"
                disabled={isSaving || isLocked}
                onPress={handleSaveThumb}>
                <ImageDownIcon
                  className="text-background"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text>Update</Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}
