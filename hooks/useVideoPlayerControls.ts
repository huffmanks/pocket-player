import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";

import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store";
import { secondsToMMSS, throttle } from "@/lib/utils";

export function useVideoPlayerControls(videoSources: string[], isThumbView?: boolean) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState<string | null>("00:00");
  const [progress, setProgress] = useState(0);
  const [isButtonTouched, setIsButtonTouched] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isOldPlaying, setIsOldPlaying] = useState(false);

  const videoRef = useRef<VideoView | null>(null);
  const controlsVisible = useSharedValue(1);
  const isPlaylist = videoSources.length > 1;

  const { autoPlay, mute, loop } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      mute: state.mute,
      loop: state.loop,
    }))
  );

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    if (isThumbView) {
      player.loop = false;
      player.muted = true;
      player.pause();
      return;
    }

    player.loop = !isPlaylist && (loop ?? false);
    player.muted = mute || false;

    if (autoPlay || isPlaylist) {
      player.play();
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });
  const { muted } = useEvent(player, "mutedChange", { muted: player.muted });

  useEffect(() => {
    if (!player) return;

    function handlePlayToEnd() {
      const atLastVideo = currentIndex >= videoSources.length - 1;

      if (!atLastVideo) {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          player.replace(videoSources[next]);
          return next;
        });
        return;
      }

      if (!isThumbView) {
        loop ? (setHasEnded(false), player.replay()) : setHasEnded(true);
      }
    }

    const subscription = player.addListener("playToEnd", handlePlayToEnd);

    const updateProgress = throttle(() => {
      const currentTime = player?.currentTime ?? 0;
      const duration = player?.duration ?? 0;

      if (duration > 0) {
        setProgress(currentTime / duration);
        setTime(secondsToMMSS(currentTime));
      }
    }, 150);

    const interval = setInterval(updateProgress, 150);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [player, currentIndex, videoSources]);

  useEffect(() => {
    if (!isPlaying || isButtonTouched) return;

    const timeout = setTimeout(() => {
      controlsVisible.value = 0;
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isPlaying, isButtonTouched, controlsVisible]);

  function onSliderChange(value: number) {
    const duration = player.duration;
    const currentTime = value * duration;

    setTime(secondsToMMSS(currentTime));
  }

  function onSlidingStart() {
    setIsButtonTouched(true);

    setIsOldPlaying(isPlaying);
    player.pause();
  }

  function onSlidingComplete(value: number) {
    setIsButtonTouched(false);

    const duration = player.duration;
    const newTime = value * duration;

    safeSeekBy(newTime - player.currentTime);

    if (isOldPlaying) {
      player.play();
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
      player.play();

      controlsVisible.value = 0;
    } else if (isPlaying) {
      player.pause();

      controlsVisible.value = 1;
    } else {
      player.play();

      controlsVisible.value = 0;
    }
  }

  function safeSeekBy(offset: number) {
    const target = Math.min(Math.max(player.currentTime + offset, 0), player.duration);
    player.seekBy(target - player.currentTime);
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
    setProgress,
    muted,
    isPlaylist,
    controlsVisible,
    hasEnded,
    onSliderChange,
    onSlidingStart,
    onSlidingComplete,
    toggleMute,
    togglePlay,
    safeSeekBy,
    changeVideoSource,
    handleButtonPressIn,
    handleButtonPressOut,
    animatedStyle,
    tapGesture,
  };
}
