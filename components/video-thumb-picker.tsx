import * as FileSystem from "expo-file-system";
import { VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useEffect, useState } from "react";
import { InteractionManager, View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
import { createId } from "@paralleldrive/cuid2";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { toast } from "sonner-native";

import { VideoMeta } from "@/db/schema";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { SLIDER_THEME, VIDEOS_DIR } from "@/lib/constants";
import { ImageDownIcon, LockIcon, LockOpenIcon } from "@/lib/icons";
import { useVideoStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface VideoThumbPickerProps {
  videoInfo: VideoMeta;
}

export default function VideoThumbPicker({ videoInfo }: VideoThumbPickerProps) {
  const [isReady, setIsReady] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { isDarkColorScheme } = useColorScheme();
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
  } = useVideoPlayerControls([videoInfo], true);

  const opacityFast = useSharedValue(0);
  const opacityDelay = useSharedValue(0);

  async function handleSaveThumb() {
    if (isSaving || isDisabled) return;
    setIsSaving(true);

    try {
      const thumbTimestamp = Math.trunc(player.currentTime * 100000) / 100;

      const { uri } = await VideoThumbnails.getThumbnailAsync(videoInfo.videoUri, {
        time: thumbTimestamp,
      });

      const fileId = createId();
      const newUri = `${VIDEOS_DIR}${videoInfo.title}-${fileId}.jpg`;

      await FileSystem.moveAsync({ from: uri, to: newUri });
      await FileSystem.deleteAsync(videoInfo.thumbUri, { idempotent: true });

      await updateVideo({
        id: videoInfo.id,
        values: { thumbUri: newUri, thumbTimestamp },
      });
      toast.success("Thumbnail updated.");
    } catch (err) {
      toast.error("Failed to update thumbnail.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (player.duration > 0) {
      player.currentTime = videoInfo.thumbTimestamp / 1000;
      setProgress(videoInfo.thumbTimestamp / player.duration);

      InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
      });
    }

    return () => {
      setIsReady(false);
    };
  }, [player.duration]);

  useEffect(() => {
    if (isReady) {
      opacityFast.value = withTiming(1, { duration: 200, easing: Easing.inOut(Easing.quad) });
      opacityDelay.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) });
    }
  }, [isReady]);

  const animatedStyleFast = useAnimatedStyle(() => ({
    opacity: opacityFast.value,
  }));

  const animatedStyleDelay = useAnimatedStyle(() => ({
    opacity: opacityDelay.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <View>
        <View className="mb-3 h-[215px] w-full overflow-hidden rounded-md bg-card">
          <Animated.View
            className="h-[215px] w-full"
            style={animatedStyleFast}>
            <VideoView
              ref={videoRef}
              style={{ width: "100%", height: 215 }}
              player={player}
              contentFit="contain"
              nativeControls={false}
            />
          </Animated.View>
        </View>

        <View className="mb-5 gap-2">
          <Animated.View style={animatedStyleFast}>
            <Text className="text-sm text-foreground">{time}</Text>
          </Animated.View>

          <Animated.View style={animatedStyleDelay}>
            <Slider
              disabled={isDisabled}
              value={progress}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              thumbTintColor={
                isDisabled ? SLIDER_THEME.thumbDisabledTintColor : SLIDER_THEME.thumbTintColor
              }
              minimumTrackTintColor={
                !isDarkColorScheme
                  ? SLIDER_THEME.maximumTrackTintColor
                  : SLIDER_THEME.minimumTrackTintColor
              }
              maximumTrackTintColor={
                !isDarkColorScheme
                  ? SLIDER_THEME.minimumTrackTintColor
                  : SLIDER_THEME.maximumTrackTintColor
              }
              onValueChange={(val) => onSliderChange(Number(val))}
              onSlidingStart={onSlidingStart}
              onSlidingComplete={onSlidingComplete}
            />
          </Animated.View>
        </View>

        <View className="flex-row items-center justify-center gap-4">
          <Button
            variant="secondary"
            className="flex flex-1 flex-row items-center justify-center gap-4"
            onPress={() => setIsDisabled((prev) => !prev)}>
            {isDisabled ? (
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
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              {isDisabled ? "Unlock" : "Lock"}
            </Text>
          </Button>
          <Button
            className="flex flex-1 flex-row items-center justify-center gap-4"
            disabled={isSaving || isDisabled}
            onPress={handleSaveThumb}>
            <ImageDownIcon
              className="text-background"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">Update</Text>
          </Button>
        </View>
      </View>
    </GestureDetector>
  );
}
