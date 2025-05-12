import { useEvent, useEventListener } from "expo";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";

import { Gesture } from "react-native-gesture-handler";
import { runOnUI, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta } from "@/db/schema";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { secondsToAdaptiveTime } from "@/lib/utils";

export function useVideoPlayerControls(videoSources: VideoMeta[], isThumbView?: boolean) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState<string | null>("00:00");
  const [progress, setProgress] = useState(0);
  const [isButtonTouched, setIsButtonTouched] = useState(false);
  const [showPlaybackControls, setShowPlaybackControls] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [isOldPlaying, setIsOldPlaying] = useState(false);

  const videoRef = useRef<VideoView | null>(null);
  const controlsVisible = useSharedValue(1);
  const isPlaylist = videoSources.length > 1;

  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);
  const { autoPlay, mute, loop, isNativeControls, overrideOrientation } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      mute: state.mute,
      loop: state.loop,
      isNativeControls: state.isNativeControls,
      overrideOrientation: state.overrideOrientation,
    }))
  );

  function updateControlsVisible(newValue: number) {
    runOnUI(() => {
      controlsVisible.value = newValue;
    })();
  }

  const player = useVideoPlayer(videoSources[currentIndex].videoUri, (p) => {
    p.timeUpdateEventInterval = 0.5;
    p.loop = !isPlaylist && (loop ?? false);
    p.muted = !!isThumbView || mute;

    if ((autoPlay || isPlaylist) && !isThumbView) {
      updateControlsVisible(0);
      p.play();
    } else {
      p.pause();
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });
  const { status, oldStatus } = useEvent(player, "statusChange", {
    status: player.status,
    oldStatus: player.status,
  });

  useEventListener(player, "playToEnd", handlePlayToEnd);
  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    const duration = player.duration;

    if (duration > 0) {
      setProgress(currentTime / duration);
      setTime(secondsToAdaptiveTime(currentTime));
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (isThumbView) return;

      const enableOrientation = async () => {
        if (!overrideOrientation) {
          await ScreenOrientation.unlockAsync();
          return;
        }

        const orientation =
          videoSources[currentIndex].orientation === "Landscape"
            ? ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
            : ScreenOrientation.OrientationLock.PORTRAIT_UP;

        await ScreenOrientation.lockAsync(orientation);
      };

      const disableOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };

      enableOrientation();

      if (isNativeControls) {
        setIsLockDisabled(true);
      }

      return () => {
        disableOrientation();
        setIsLockDisabled(false);
      };
    }, [currentIndex])
  );

  useEffect(() => {
    if (!isPlaying || isButtonTouched) return;

    const timeout = setTimeout(() => updateControlsVisible(0), 5000);

    return () => clearTimeout(timeout);
  }, [isPlaying, isButtonTouched, controlsVisible]);

  function handlePlayToEnd() {
    if (isThumbView) return;

    if (status === "readyToPlay" && oldStatus === "loading") {
      const atLastVideo = currentIndex >= videoSources.length - 1;

      if (atLastVideo) {
        setHasEnded(!loop);

        if (loop) {
          player.replay();
        } else {
          updateControlsVisible(1);
        }

        return;
      }

      setCurrentIndex((prev) => {
        const next = prev + 1;
        player.replace(videoSources[next].videoUri);
        return next;
      });
    }
  }

  function onSliderChange(value: number) {
    const duration = player.duration;
    const currentTime = value * duration;

    player.currentTime = currentTime;
    setProgress(currentTime / duration);
    setTime(secondsToAdaptiveTime(currentTime));
  }

  function onSlidingStart() {
    setIsButtonTouched(true);
    setShowPlaybackControls(false);
    setHasEnded(false);
    setIsOldPlaying(isPlaying);
    player.pause();
  }

  function onSlidingComplete() {
    setIsButtonTouched(false);

    if (isOldPlaying) {
      player.play();
      updateControlsVisible(0);
    }

    setShowPlaybackControls(true);
  }

  function toggleMute() {
    player.muted = !player.muted;
  }

  function togglePlay() {
    if (hasEnded && !isPlaying) {
      setHasEnded(false);

      setCurrentIndex(0);
      player.replace(videoSources[0].videoUri);
      player.play();

      updateControlsVisible(0);
    } else if (isPlaying) {
      player.pause();

      updateControlsVisible(1);
    } else {
      player.play();

      updateControlsVisible(0);
    }
  }

  function safeSeekBy(offset: number) {
    const target = Math.min(Math.max(player.currentTime + offset, 0), player.duration);
    player.seekBy(target - player.currentTime);
  }

  function changeVideoSource(inverse: number) {
    const newIndex = (currentIndex + inverse + videoSources.length) % videoSources.length;
    setCurrentIndex(newIndex);
    player.replace(videoSources[newIndex].videoUri);
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
      controlsVisible.value = controlsVisible.value === 1 ? 0 : 1;
    }
  });

  return {
    videoRef,
    player,
    isPlaying,
    currentIndex,
    time,
    progress,
    setProgress,
    isPlaylist,
    controlsVisible,
    showPlaybackControls,
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
