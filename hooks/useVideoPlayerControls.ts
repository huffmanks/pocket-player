import { useEvent, useEventListener } from "expo";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useTapGesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta } from "@/db/schema";
import { VIDEO_PROGRESS_END_THRESHOLD } from "@/lib/constants";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { secondsToAdaptiveTime } from "@/lib/utils";

function setPlayerCurrentTime(targetPlayer: ReturnType<typeof useVideoPlayer>, time: number) {
  targetPlayer.currentTime = time;
}

function togglePlayerMute(targetPlayer: ReturnType<typeof useVideoPlayer>) {
  targetPlayer.muted = !targetPlayer.muted;
}

export function useVideoPlayerControls(videoSources: VideoMeta[], isThumbView?: boolean) {
  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);
  const {
    autoPlay,
    mute,
    loop,
    isNativeControls,
    overrideOrientation,
    getVideoProgress,
    setVideoProgress,
    clearVideoProgress,
  } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      mute: state.mute,
      loop: state.loop,
      isNativeControls: state.isNativeControls,
      overrideOrientation: state.overrideOrientation,
      getVideoProgress: state.getVideoProgress,
      setVideoProgress: state.setVideoProgress,
      clearVideoProgress: state.clearVideoProgress,
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState<string | null>(() => {
    const savedTime = getVideoProgress(videoSources[0].id);
    return secondsToAdaptiveTime(savedTime);
  });
  const [progress, setProgress] = useState(() => {
    const savedTime = getVideoProgress(videoSources[0].id);
    const duration = videoSources[0].duration;
    return duration > 0 ? savedTime / duration : 0;
  });
  const [isButtonTouched, setIsButtonTouched] = useState(false);
  const [showPlaybackControls, setShowPlaybackControls] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);

  const isScrubbing = useRef(false);
  const pendingSeekTime = useRef<number | null>(null);
  const videoRef = useRef<VideoView | null>(null);
  const lastSavedTime = useRef(0);
  const controlsVisible = useSharedValue(1);
  const isPlaylist = videoSources.length > 1;

  const player = useVideoPlayer(videoSources[currentIndex].videoUri, (p) => {
    const savedTime = getVideoProgress(videoSources[0].id);

    p.timeUpdateEventInterval = 0.1;
    p.loop = !isPlaylist && loop;
    p.muted = !!isThumbView || mute;
    p.currentTime = savedTime;
    p.pause();

    lastSavedTime.current = savedTime;
  });
  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });

  const updateControlsVisible = useCallback(
    (newValue: number) => {
      controlsVisible.set(newValue);
    },
    [controlsVisible]
  );

  const saveVideoProgress = useCallback(() => {
    const video = videoSources[currentIndex];
    const currentTime = player.currentTime;
    const duration = player.duration;

    if (!Number.isFinite(currentTime) || duration <= 0) return;

    if (duration - currentTime <= VIDEO_PROGRESS_END_THRESHOLD) {
      clearVideoProgress(video.id);
      return;
    }

    setVideoProgress(video.id, currentTime);
    lastSavedTime.current = currentTime;
  }, [clearVideoProgress, currentIndex, player, setVideoProgress, videoSources]);

  const replaceVideoSource = useCallback(
    async (index: number) => {
      setCurrentIndex(index);

      await player.replaceAsync(videoSources[index].videoUri);
    },
    [player, videoSources]
  );

  const handlePlayToEnd = useCallback(() => {
    if (isThumbView) return;

    saveVideoProgress();

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

    void replaceVideoSource(currentIndex + 1);
  }, [
    currentIndex,
    isThumbView,
    loop,
    player,
    replaceVideoSource,
    saveVideoProgress,
    updateControlsVisible,
    videoSources.length,
  ]);

  useEventListener(player, "sourceLoad", ({ duration, videoSource }) => {
    const uri = typeof videoSource === "object" ? videoSource?.uri : videoSource;
    const video = videoSources.find((source) => source.videoUri === uri);

    if (!video) return;

    const savedTime = getVideoProgress(video.id);
    const targetTime =
      savedTime > 0 && duration - savedTime > VIDEO_PROGRESS_END_THRESHOLD ? savedTime : 0;

    setPlayerCurrentTime(player, targetTime);
    lastSavedTime.current = targetTime;

    if (targetTime === 0 && savedTime > 0) {
      clearVideoProgress(video.id);
    }

    if (autoPlay || isPlaylist) {
      player.play();
    }
  });
  useEventListener(player, "playToEnd", handlePlayToEnd);
  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    if (isScrubbing.current) return;

    const duration = player.duration;

    if (duration > 0) {
      setProgress(currentTime / duration);
      setTime(secondsToAdaptiveTime(currentTime));
    }

    if (Math.abs(currentTime - lastSavedTime.current) >= VIDEO_PROGRESS_END_THRESHOLD) {
      saveVideoProgress();
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
        saveVideoProgress();
        isMounted = false;
        ScreenOrientation.unlockAsync();
        setIsLockDisabled(false);
      };
    }, [
      currentOrientation,
      isNativeControls,
      isThumbView,
      overrideOrientation,
      setIsLockDisabled,
      saveVideoProgress,
    ])
  );

  useEffect(() => {
    if (!isPlaying || isButtonTouched) return;

    const timeout = setTimeout(() => updateControlsVisible(0), 5000);

    return () => clearTimeout(timeout);
  }, [isPlaying, isButtonTouched, updateControlsVisible]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        saveVideoProgress();
        return;
      }

      if (isThumbView || !(autoPlay || isPlaylist)) return;

      if (player.status === "readyToPlay") {
        player.play();
      }
    });

    return () => subscription.remove();
  }, [autoPlay, isPlaylist, isThumbView, player, saveVideoProgress]);

  function onSliderChange(value: number) {
    const progress = Math.max(0, Math.min(value, 1));
    const targetTime = progress * player.duration;

    pendingSeekTime.current = targetTime;
    setProgress(progress);
    setTime(secondsToAdaptiveTime(targetTime));
  }

  function onSlidingStart() {
    isScrubbing.current = true;
    setIsButtonTouched(true);
    setShowPlaybackControls(false);
    setHasEnded(false);
  }

  function onSlidingComplete() {
    const targetTime = pendingSeekTime.current;

    if (targetTime !== null) {
      setPlayerCurrentTime(player, targetTime);
    }

    pendingSeekTime.current = null;
    isScrubbing.current = false;
    setIsButtonTouched(false);
    setShowPlaybackControls(true);
  }

  function toggleMute() {
    togglePlayerMute(player);
  }

  function togglePlay() {
    if (hasEnded && !isPlaying) {
      setHasEnded(false);

      void replaceVideoSource(0);

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
    saveVideoProgress();

    const newIndex = (currentIndex + inverse + videoSources.length) % videoSources.length;

    void replaceVideoSource(newIndex);
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

  const tapGesture = useTapGesture({
    onDeactivate: (event) => {
      if (!event.canceled && !isButtonTouched) {
        scheduleOnRN(toggleControls);
      }
    },
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
