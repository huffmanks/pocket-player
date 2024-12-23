import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";

import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store";
import { secondsToMMSS, throttle } from "@/lib/utils";

export function useVideoPlayerControls(videoSources: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState<string | null>("00:00");
  const [progress, setProgress] = useState(0);
  const [oldIsPlaying, setOldIsPlaying] = useState(false);
  const [isButtonTouched, setIsButtonTouched] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const videoRef = useRef<VideoView | null>(null);
  const controlsVisible = useSharedValue(1);
  const controlsVisibleDerived = useDerivedValue(() => controlsVisible?.value ?? 1);
  const isPlaylist = videoSources.length > 1;

  const { autoPlay, mute, loop } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      mute: state.mute,
      loop: state.loop,
    }))
  );

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    player.loop = !isPlaylist && (loop ?? false);
    player.muted = mute || false;

    if (autoPlay || isPlaylist) {
      player.play();
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });
  const { muted } = useEvent(player, "mutedChange", { muted: player.muted });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (currentIndex < videoSources.length - 1) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          player.replace(videoSources[nextIndex]);
          return nextIndex;
        });
      } else {
        setHasEnded(true);
      }
    });

    const updateProgress = throttle(() => {
      const currentTime = player?.currentTime ?? 0;
      const duration = player?.duration ?? 0;

      if (duration > 0) {
        setProgress(currentTime / duration);
        setTime(secondsToMMSS(currentTime));
      }
    }, 250);

    const interval = setInterval(updateProgress, 250);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [player, currentIndex, videoSources]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (controlsVisibleDerived?.value === 1 && isPlaying) {
        controlsVisible.value = 0;
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [controlsVisibleDerived]);

  function onSlidingStart() {
    setIsButtonTouched(true);

    if (isPlaying) {
      player.pause();
      setOldIsPlaying(true);
    }
  }

  function onSlidingComplete(value: number) {
    setIsButtonTouched(false);

    const duration = player.duration;
    const newTime = value * duration;
    player.seekBy(newTime - player.currentTime);
    setTime(secondsToMMSS(newTime));

    if (oldIsPlaying) {
      player.play();
      setOldIsPlaying(false);
    }
  }

  function toggleMute() {
    player.muted = !player.muted;
  }

  function togglePlay() {
    if (hasEnded && !isPlaying) {
      setHasEnded(false);

      setCurrentIndex(0);
      player.replace(videoSources[0]);

      controlsVisible.value = 0;
    } else if (isPlaying) {
      player.pause();

      controlsVisible.value = 1;
    } else {
      player.play();

      controlsVisible.value = 0;
    }
  }

  function changeVideoSource(inverse: number) {
    const newIndex = (currentIndex + inverse + videoSources.length) % videoSources.length;
    setCurrentIndex(newIndex);
    player.replace(videoSources[newIndex]);
  }

  function handleButtonPressIn() {
    setIsButtonTouched(true);
  }

  function handleButtonPressOut() {
    setIsButtonTouched(false);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(controlsVisible.value, { duration: 300 }),
  }));

  const tapGesture = Gesture.Tap().onEnd((_, success) => {
    if (success && !isButtonTouched) {
      const newValue = controlsVisible.value === 1 ? 0 : 1;
      controlsVisible.value = newValue;
    }
  });

  return {
    videoRef,
    player,
    isPlaying,
    time,
    progress,
    muted,
    isPlaylist,
    controlsVisible,
    hasEnded,
    onSlidingComplete,
    onSlidingStart,
    toggleMute,
    togglePlay,
    changeVideoSource,
    handleButtonPressIn,
    handleButtonPressOut,
    animatedStyle,
    tapGesture,
  };
}
