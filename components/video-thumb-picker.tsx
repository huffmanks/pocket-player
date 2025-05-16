import { VideoView, useVideoPlayer } from "expo-video";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { VideoMeta } from "@/db/schema";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SLIDER_THEME } from "@/lib/constants";
import { LockIcon, LockOpenIcon } from "@/lib/icons";
import { getClampedDelta } from "@/lib/utils";

import TimerInput from "@/components/timer-input";
import { Button } from "@/components/ui/button";

interface VideoThumbPickerProps {
  videoInfo: VideoMeta;
  setPlayerCurrentTime: Dispatch<SetStateAction<number>>;
}

export default function VideoThumbPickerNext({
  videoInfo,
  setPlayerCurrentTime,
}: VideoThumbPickerProps) {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const [time, setTime] = useState(videoInfo.thumbTimestamp / 1000);
  const [progress, setProgress] = useState(videoInfo.thumbTimestamp / 1000 / videoInfo.duration);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isPlayerUpdating, setIsPlayerUpdating] = useState(false);

  const videoRef = useRef<VideoView | null>(null);
  const timeUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { isDarkColorScheme } = useColorScheme();

  const opacityFast = useSharedValue(0);
  const opacityDelay = useSharedValue(0);

  const animatedStyleFast = useAnimatedStyle(() => ({
    opacity: opacityFast.value,
  }));
  const animatedStyleDelay = useAnimatedStyle(() => ({
    opacity: opacityDelay.value,
  }));

  const player = useVideoPlayer(videoInfo.videoUri, (p) => {
    p.muted = true;
    p.pause();
    p.timeUpdateEventInterval = 0.1;
    setIsPlayerReady(true);
  });

  useEffect(() => {
    if (isPlayerReady) {
      const result = getClampedDelta(time, videoInfo.duration, 0);

      if (result) {
        player.seekBy(result.delta);
        setTime(result.clamped);
      }

      requestAnimationFrame(() => {
        opacityFast.value = withTiming(1, { duration: 200, easing: Easing.inOut(Easing.quad) });
        opacityDelay.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) });
        setIsInitialized(true);
      });
    }
  }, [isPlayerReady]);

  useEffect(() => {
    const listener = player.addListener("timeUpdate", ({ currentTime }) => {
      if (
        isScrubbing ||
        isPlayerUpdating ||
        !isPlayerReady ||
        !isInitialized ||
        !currentTime ||
        time === currentTime
      )
        return;

      if (timeUpdateRef.current) {
        clearTimeout(timeUpdateRef.current);
      }

      timeUpdateRef.current = setTimeout(() => {
        setTime(currentTime);
        setPlayerCurrentTime(currentTime);
      }, 50);
    });

    return () => {
      listener.remove();
      if (timeUpdateRef.current) {
        clearTimeout(timeUpdateRef.current);
      }
    };
  }, [isScrubbing, isPlayerUpdating, isInitialized, time]);

  function seekTo(absTime: number) {
    setIsPlayerUpdating(true);

    const result = getClampedDelta(absTime, videoInfo.duration, player.currentTime);

    if (result) {
      if (result.hasMeaningfulChange) {
        player.seekBy(result.delta);
      }

      setProgress(result.clamped / videoInfo.duration);
      setTime(result.clamped);
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsPlayerUpdating(false);
      }, 10);
    });
  }

  function onSliderChange(val: number | number[]) {
    if (isDisabled) return;

    const currentTime = (Array.isArray(val) ? val[0] : val) * videoInfo.duration;

    seekTo(currentTime);
  }

  return (
    <View>
      <View className="mb-3 h-[215px] w-full rounded-md bg-card">
        <Animated.View
          className="relative h-[215px] w-full"
          style={animatedStyleFast}>
          <View className="absolute -left-1 -top-2 z-10">
            <Button
              size="circle"
              className="flex flex-row items-center justify-center bg-brand/80"
              onPress={() => setIsDisabled((prev) => !prev)}>
              {isDisabled ? (
                <LockIcon
                  className="text-white"
                  size={24}
                  strokeWidth={1.5}
                />
              ) : (
                <LockOpenIcon
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
              setIsScrubbing(true);
            }}
            onSlidingComplete={() => setIsScrubbing(false)}
          />
        </Animated.View>
      </View>
    </View>
  );
}
