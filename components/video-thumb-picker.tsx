import * as FileSystem from "expo-file-system";
import { VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useState } from "react";
import { View } from "react-native";

import Slider from "@react-native-community/slider";
import { GestureDetector } from "react-native-gesture-handler";
import { toast } from "sonner-native";

import { VideoMeta } from "@/db/schema";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { VIDEOS_DIR } from "@/lib/constants";
import { BanIcon, ImageIcon, SaveIcon } from "@/lib/icons";
import { useVideoStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface VideoThumbPickerProps {
  videoInfo: VideoMeta;
}

export default function VideoThumbPicker({ videoInfo }: VideoThumbPickerProps) {
  const [tmpNewThumbUri, setTmpNewThumbUri] = useState("");
  const [newThumbUri, setNewThumbUri] = useState("");

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

  async function handleGenerateThumb() {
    if (!videoInfo) return;

    try {
      const { uri: tmpUri } = await VideoThumbnails.getThumbnailAsync(videoInfo.videoUri, {
        time: player.currentTime * 1000,
      });

      const newUri = `${VIDEOS_DIR}${videoInfo.title + ".jpg"}`;

      setTmpNewThumbUri(tmpUri);
      setNewThumbUri(newUri);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate thumbnail.");
    }
  }

  async function handleCancelThumb() {
    try {
      if (tmpNewThumbUri) {
        await FileSystem.deleteAsync(tmpNewThumbUri, { idempotent: true });
      }

      setTmpNewThumbUri("");
      setNewThumbUri("");
      setProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset thumbnail.");
    }
  }

  async function handleSaveThumb() {
    try {
      await FileSystem.moveAsync({ from: tmpNewThumbUri, to: newThumbUri });

      updateVideo({ id: videoInfo.id, values: { thumbUri: newThumbUri } });
      toast.success("Thumbnail updated.");

      setTmpNewThumbUri("");
      setNewThumbUri("");
      setProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update thumbnail.");
    }
  }

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
            <View className="flex-1 pb-5">
              <Slider
                className="h-10 w-full bg-secondary"
                value={progress}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                minimumTrackTintColor="#f8fafc"
                maximumTrackTintColor="#1f242b"
                tapToSeek
                onValueChange={onSliderChange}
                onSlidingStart={onSlidingStart}
                onSlidingComplete={onSlidingComplete}
              />
            </View>
          </View>

          <View className="mb-1 px-4">
            {newThumbUri ? (
              <View className="flex-row items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  className="flex flex-1 flex-row items-center justify-center gap-4"
                  onPress={handleCancelThumb}>
                  <BanIcon
                    className="text-foreground"
                    size={20}
                    strokeWidth={1.25}
                  />
                  <Text>Reset</Text>
                </Button>
                <Button
                  className="flex flex-1 flex-row items-center justify-center gap-4"
                  onPress={handleSaveThumb}>
                  <SaveIcon
                    className="text-background"
                    size={20}
                    strokeWidth={1.25}
                  />
                  <Text>Save</Text>
                </Button>
              </View>
            ) : (
              <Button
                size="lg"
                className="flex flex-row items-center justify-center gap-4"
                onPress={handleGenerateThumb}>
                <ImageIcon
                  className="text-background"
                  size={24}
                  strokeWidth={1.75}
                />
                <Text>Generate</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}
