import { useEvent, useEventListener } from "expo";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";

import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta } from "@/db/schema";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { secondsToAdaptiveTime } from "@/lib/utils";

function setPlayerCurrentTime(targetPlayer: ReturnType<typeof useVideoPlayer>, time: number) {
  targetPlayer.currentTime = time;
}

function togglePlayerMute(targetPlayer: ReturnType<typeof useVideoPlayer>) {
  targetPlayer.muted = !targetPlayer.muted;
}

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

  const player = useVideoPlayer(videoSources[currentIndex].videoUri, (p) => {
    p.timeUpdateEventInterval = 0.5;
    p.loop = !isPlaylist && (loop ?? false);
    p.muted = !!isThumbView || mute;

    if ((autoPlay || isPlaylist) && !isThumbView) {
      controlsVisible.value = 0;
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

  const updateControlsVisible = useCallback(
    (newValue: number) => {
      controlsVisible.set(newValue);
    },
    [controlsVisible]
  );

  const handlePlayToEnd = useCallback(() => {
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
        player.replaceAsync(videoSources[next].videoUri);
        return next;
      });
    }
  }, [
    currentIndex,
    isThumbView,
    loop,
    oldStatus,
    player,
    status,
    updateControlsVisible,
    videoSources,
  ]);

  useEventListener(player, "playToEnd", handlePlayToEnd);
  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    const duration = player.duration;

    if (duration > 0) {
      setProgress(currentTime / duration);
      setTime(secondsToAdaptiveTime(currentTime));
    }
  });

  const currentOrientation = videoSources[currentIndex]?.orientation;

  useFocusEffect(
    useCallback(() => {
      if (isThumbView) return;

      let isMounted = true;

      const enableOrientation = async () => {
        if (!overrideOrientation) {
          await ScreenOrientation.unlockAsync();
          return;
        }

        const targetOrientation =
          currentOrientation === "Landscape"
            ? ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
            : ScreenOrientation.OrientationLock.PORTRAIT_UP;

        if (isMounted) {
          await ScreenOrientation.lockAsync(targetOrientation);
        }
      };

      enableOrientation();

      if (isNativeControls) {
        setIsLockDisabled(true);
      }

      return () => {
        isMounted = false;
        ScreenOrientation.unlockAsync();
        setIsLockDisabled(false);
      };
    }, [currentOrientation, isNativeControls, isThumbView, overrideOrientation, setIsLockDisabled])
  );

  useEffect(() => {
    if (!isPlaying || isButtonTouched) return;

    const timeout = setTimeout(() => updateControlsVisible(0), 5000);

    return () => clearTimeout(timeout);
  }, [isPlaying, isButtonTouched, updateControlsVisible]);

  function onSliderChange(value: number) {
    const duration = player.duration;
    const targetTime = value * duration;

    setPlayerCurrentTime(player, targetTime);
    setProgress(value);
    setTime(secondsToAdaptiveTime(targetTime));
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
    togglePlayerMute(player);
  }

  function togglePlay() {
    if (hasEnded && !isPlaying) {
      setHasEnded(false);

      setCurrentIndex(0);
      player.replaceAsync(videoSources[0].videoUri);
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
    player.replaceAsync(videoSources[newIndex].videoUri);
  }

  function handleButtonPressIn() {
    setIsButtonTouched(true);
  }

  function handleButtonPressOut() {
    setIsButtonTouched(false);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(controlsVisible.get(), { duration: 300 }),
  }));

  function toggleControls() {
    updateControlsVisible(controlsVisible.get() === 1 ? 0 : 1);
  }

  const tapGesture = Gesture.Tap().onEnd((_, success) => {
    if (success && !isButtonTouched) {
      scheduleOnRN(toggleControls);
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
