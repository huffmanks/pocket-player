import { VideoThumbnail, VideoView, useVideoPlayer } from "expo-video";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
import { LockIcon, LockOpenIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { VideoMeta } from "@/db/schema";
import { SLIDER_THEME } from "@/lib/theme";
import { getClampedDelta } from "@/lib/utils";

import TimerInput from "@/components/timer-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export interface VideoThumbPickerHandle {
  getThumbTimestamp: () => number;
  generateThumbnail: () => Promise<VideoThumbnail>;
}

interface VideoThumbPickerProps {
  videoInfo: VideoMeta;
}

const VideoThumbPicker = forwardRef<VideoThumbPickerHandle, VideoThumbPickerProps>(
  ({ videoInfo }, ref) => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    const initialTimeResult = getClampedDelta(
      videoInfo.thumbTimestamp / 1000,
      videoInfo.duration,
      0
    );
    const initialTime = initialTimeResult?.clamped ?? videoInfo.thumbTimestamp / 1000;

    const [time, setTime] = useState(initialTime);
    const [progress, setProgress] = useState(initialTime / videoInfo.duration);

    const videoRef = useRef<VideoView | null>(null);
    const inputRef = useRef<TextInput>(null);

    const { colorScheme } = useColorScheme();
    const isDarkColorScheme = colorScheme === "dark";

    const opacityFast = useSharedValue(0);
    const opacityDelay = useSharedValue(0);

    const animatedStyleFast = useAnimatedStyle(() => ({
      opacity: opacityFast.value,
    }));
    const animatedStyleDelay = useAnimatedStyle(() => ({
      opacity: opacityDelay.value,
    }));

    const player = useVideoPlayer(decodeURIComponent(videoInfo.videoUri), (p) => {
      p.muted = true;
      p.pause();
      p.currentTime = initialTime;
      setIsPlayerReady(true);
    });

    useImperativeHandle(ref, () => ({
      getThumbTimestamp: () => Math.round(player.currentTime * 1000),
      generateThumbnail: async () => {
        const [thumbnail] = await player.generateThumbnailsAsync([player.currentTime]);
        return thumbnail;
      },
    }));

    useEffect(() => {
      if (isPlayerReady) {
        queueMicrotask(() => {
          opacityFast.value = withTiming(1, { duration: 200, easing: Easing.inOut(Easing.quad) });
          opacityDelay.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) });
        });
      }
    }, [isPlayerReady, initialTime, opacityDelay, opacityFast, player]);

    function seekTo(absTime: number) {
      const clampedTime = Math.max(0, Math.min(absTime, videoInfo.duration));

      queueMicrotask(() => {
        player.currentTime = clampedTime;
      });

      setTime(clampedTime);
      setProgress(clampedTime / videoInfo.duration);
    }

    function onSliderChange(val: number | number[]) {
      if (isDisabled) return;

      const newProgress = Array.isArray(val) ? val[0] : val;
      const currentTime = newProgress * videoInfo.duration;

      seekTo(currentTime);
    }

    return (
      <View>
        <View className="mb-3 h-[215px] w-full rounded-md bg-card">
          <Animated.View
            className="relative h-[215px] w-full"
            style={animatedStyleFast}>
            <View className="absolute -right-3 -top-4 z-10">
              <Button
                size="circle"
                variant="brand"
                className="flex flex-row items-center justify-center"
                onPress={() => setIsDisabled((prev) => !prev)}>
                {isDisabled ? (
                  <Icon
                    as={LockIcon}
                    className="text-white"
                    size={24}
                    strokeWidth={1.5}
                  />
                ) : (
                  <Icon
                    as={LockOpenIcon}
                    className="text-white"
                    size={24}
                    strokeWidth={1.5}
                  />
                )}
              </Button>
            </View>
            <VideoView
              ref={videoRef}
              style={{ width: "100%", height: 215 }}
              player={player}
              contentFit="contain"
              nativeControls={false}
            />
          </Animated.View>
        </View>

        <View className="mb-2 gap-2">
          <Animated.View style={animatedStyleFast}>
            <TimerInput
              ref={inputRef}
              value={time}
              max={videoInfo.duration}
              onChange={seekTo}
              disabled={isDisabled}
            />
          </Animated.View>

          <Animated.View style={animatedStyleDelay}>
            <Slider
              disabled={isDisabled}
              value={progress}
              minimumValue={0}
              maximumValue={1}
              step={0.001}
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
              onValueChange={onSliderChange}
              onSlidingStart={() => {
                inputRef.current?.blur();
              }}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
);

VideoThumbPicker.displayName = "VideoThumbPicker";

export default VideoThumbPicker;
