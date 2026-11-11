import { useEventListener } from "expo";
import { useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useTapGesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useShallow } from "zustand/react/shallow";

import { type VideoMeta } from "@/db/schema";
import { useSecurityStore, useSettingsStore, useVideoStore } from "@/lib/store";
import { secondsToAdaptiveTime } from "@/lib/utils";

type VideoPlayer = ReturnType<typeof useVideoPlayer>;

const CONTROLS_HIDDEN = 0;
const CONTROLS_VISIBLE = 1;
const CONTROLS_AUTO_HIDE_DELAY_MS = 5000;
const CONTROLS_FADE_DURATION_MS = 300;
const TIME_UPDATE_INTERVAL_SECONDS = 0.1;
const SEEK_SETTLE_TOLERANCE_SECONDS = 0.5;
const VIDEO_PROGRESS_END_THRESHOLD = 5;
const VIDEO_PROGRESS_SAVE_INTERVAL = 10;

function setPlayerCurrentTime(targetPlayer: VideoPlayer, time: number) {
  targetPlayer.currentTime = time;
}

function togglePlayerMute(targetPlayer: VideoPlayer) {
  targetPlayer.muted = !targetPlayer.muted;
}

export function useVideoPlayerControls(videoSources: VideoMeta[], isThumbView?: boolean) {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const initialPosition =
    videoSources[0].resumePosition > 0 &&
    videoSources[0].duration - videoSources[0].resumePosition > VIDEO_PROGRESS_END_THRESHOLD
      ? videoSources[0].resumePosition
      : 0;

  const [time, setTime] = useState<string | null>(secondsToAdaptiveTime(initialPosition));
  const [progress, setProgress] = useState(initialPosition / videoSources[0].duration);
  const [isButtonTouched, setIsButtonTouched] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const videoRef = useRef<VideoView | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrubbing = useRef(false);
  const pendingSeekTime = useRef<number | null>(null);
  const currentTimeRef = useRef(0);
  const lastSavedTimeRef = useRef(0);
  const saveInFlightRef = useRef(false);
  const savePendingRef = useRef(false);
  const forceSavePendingRef = useRef(false);
  const sourceLoadRequestRef = useRef(0);

  const isPlaylist = videoSources.length > 1;
  const currentOrientation = videoSources[currentIndex]?.orientation;
  const controlsVisible = useSharedValue(CONTROLS_VISIBLE);

  const player = useVideoPlayer(videoSources[currentIndex].videoUri, (p) => {
    p.timeUpdateEventInterval = TIME_UPDATE_INTERVAL_SECONDS;
    p.loop = !isPlaylist && loop;
    p.muted = !!isThumbView || mute;
    p.pause();
    p.currentTime = initialPosition;
  });
  const [isPlaying, setIsPlaying] = useState(player.playing);

  const updateControlsVisible = useCallback(
    (newValue: number) => {
      controlsVisible.set(newValue);
    },
    [controlsVisible]
  );

  const saveProgress = useCallback(
    async function saveProgress(force = false) {
      if (isThumbView) return;

      if (saveInFlightRef.current) {
        savePendingRef.current = true;
        forceSavePendingRef.current ||= force;
        return;
      }

      saveInFlightRef.current = true;

      try {
        let shouldForce = force;

        do {
          savePendingRef.current = false;
          forceSavePendingRef.current = false;

          const video = videoSources[currentIndex];
          const currentTime = currentTimeRef.current;
          const duration = player.duration;

          if (!Number.isFinite(currentTime) || duration <= 0) break;

          if (duration - currentTime <= VIDEO_PROGRESS_END_THRESHOLD) {
            await useVideoStore.getState().clearPlaybackProgress(video.id);
            lastSavedTimeRef.current = 0;
          } else if (
            shouldForce ||
            Math.abs(currentTime - lastSavedTimeRef.current) >= VIDEO_PROGRESS_SAVE_INTERVAL
          ) {
            await useVideoStore.getState().savePlaybackProgress(video.id, currentTime);
            lastSavedTimeRef.current = currentTime;
          }

          shouldForce = forceSavePendingRef.current;
        } while (savePendingRef.current);
      } catch (_error) {
        return;
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [currentIndex, isThumbView, player, videoSources]
  );

  const replaceVideoSource = useCallback(
    async (index: number) => {
      sourceLoadRequestRef.current += 1;
      setCurrentIndex(index);

      await player.replaceAsync(videoSources[index].videoUri);
    },
    [player, videoSources]
  );

  const handlePlayToEnd = useCallback(async () => {
    if (isThumbView) return;

    await saveProgress(true);

    const atLastVideo = currentIndex >= videoSources.length - 1;

    if (!atLastVideo) {
      await replaceVideoSource(currentIndex + 1);
      return;
    }

    setHasEnded(!loop);

    if (loop) {
      player.replay();
    } else {
      updateControlsVisible(CONTROLS_VISIBLE);
    }
  }, [
    currentIndex,
    isThumbView,
    loop,
    player,
    replaceVideoSource,
    saveProgress,
    updateControlsVisible,
    videoSources.length,
  ]);

  const clearControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current === null) return;

    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = null;
  }, []);

  const restartControlsTimeout = useCallback(() => {
    clearControlsTimeout();

    if (!player.playing || isButtonTouched) return;

    controlsTimeoutRef.current = setTimeout(() => {
      controlsVisible.set(CONTROLS_HIDDEN);
      controlsTimeoutRef.current = null;
    }, CONTROLS_AUTO_HIDE_DELAY_MS);
  }, [clearControlsTimeout, player, controlsVisible, isButtonTouched]);

  useEventListener(player, "playingChange", ({ isPlaying: nextIsPlaying }) => {
    if (!nextIsPlaying && pendingSeekTime.current !== null) return;

    setIsPlaying(nextIsPlaying);
  });
  useEventListener(player, "sourceLoad", ({ duration, videoSource }) => {
    const uri = typeof videoSource === "object" ? videoSource?.uri : videoSource;
    const video = videoSources.find((source) => source.videoUri === uri);

    if (!video) return;

    const requestId = ++sourceLoadRequestRef.current;

    void (async () => {
      const savedTime = video.resumePosition;

      if (requestId !== sourceLoadRequestRef.current) return;

      const targetTime =
        savedTime > 0 && duration - savedTime > VIDEO_PROGRESS_END_THRESHOLD ? savedTime : 0;

      currentTimeRef.current = targetTime;
      lastSavedTimeRef.current = targetTime;

      setPlayerCurrentTime(player, targetTime);
      updateProgressDisplay(targetTime, duration);

      if (targetTime === 0 && savedTime > 0) {
        void useVideoStore.getState().clearPlaybackProgress(video.id);
      }

      if (autoPlay || isPlaylist) {
        player.play();
      }
    })();
  });
  useEventListener(player, "playToEnd", handlePlayToEnd);
  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    if (isScrubbing.current) return;

    if (pendingSeekTime.current !== null) {
      if (Math.abs(currentTime - pendingSeekTime.current) > SEEK_SETTLE_TOLERANCE_SECONDS) return;

      pendingSeekTime.current = null;
    }

    currentTimeRef.current = currentTime;

    const duration = player.duration;

    if (duration > 0) {
      setProgress(currentTime / duration);
      setTime(secondsToAdaptiveTime(currentTime));
    }

    if (Math.abs(currentTime - lastSavedTimeRef.current) >= VIDEO_PROGRESS_SAVE_INTERVAL) {
      void saveProgress();
    }
  });

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

      void enableOrientation();

      if (isNativeControls) {
        setIsLockDisabled(true);
      }

      return () => {
        void saveProgress(true);
        isMounted = false;
        void ScreenOrientation.unlockAsync();
        setIsLockDisabled(false);
      };
    }, [
      currentOrientation,
      isNativeControls,
      isThumbView,
      overrideOrientation,
      saveProgress,
      setIsLockDisabled,
    ])
  );

  useEffect(() => {
    if (!isPlaying || isButtonTouched) {
      clearControlsTimeout();
      return;
    }

    restartControlsTimeout();

    return clearControlsTimeout;
  }, [isPlaying, isButtonTouched, restartControlsTimeout, clearControlsTimeout]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        void saveProgress();
        return;
      }

      if (isThumbView || !(autoPlay || isPlaylist)) return;

      if (player.status === "readyToPlay") {
        player.play();
      }
    });

    return () => subscription.remove();
  }, [autoPlay, isPlaylist, isThumbView, player, saveProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(controlsVisible.get(), { duration: CONTROLS_FADE_DURATION_MS }),
  }));

  function toggleControls() {
    const shouldShow = controlsVisible.get() === CONTROLS_HIDDEN;

    updateControlsVisible(shouldShow ? CONTROLS_VISIBLE : CONTROLS_HIDDEN);
  }

  const tapGesture = useTapGesture({
    onDeactivate: (event) => {
      if (!event.canceled && !isButtonTouched) {
        scheduleOnRN(toggleControls);
      }
    },
  });

  function updateProgressDisplay(targetTime: number, duration: number) {
    setProgress(duration > 0 ? targetTime / duration : 0);
    setTime(secondsToAdaptiveTime(targetTime));
  }

  function onSliderChange(value: number) {
    const nextProgress = Math.max(0, Math.min(value, 1));
    const targetTime = nextProgress * player.duration;

    pendingSeekTime.current = targetTime;

    setProgress(nextProgress);
    setTime(secondsToAdaptiveTime(targetTime));
  }

  function onSlidingStart() {
    isScrubbing.current = true;
    setIsButtonTouched(true);
    setHasEnded(false);
    updateControlsVisible(CONTROLS_VISIBLE);
  }

  function onSlidingComplete() {
    const targetTime = pendingSeekTime.current;

    if (targetTime !== null) {
      currentTimeRef.current = targetTime;
      setPlayerCurrentTime(player, targetTime);
      void saveProgress(true);
    }

    isScrubbing.current = false;
    setIsButtonTouched(false);

    updateControlsVisible(CONTROLS_VISIBLE);
    restartControlsTimeout();
  }

  function toggleMute() {
    togglePlayerMute(player);
  }

  function togglePlay() {
    if (hasEnded && !isPlaying) {
      setHasEnded(false);
      void replaceVideoSource(0);
      updateControlsVisible(CONTROLS_VISIBLE);
      return;
    }

    if (isPlaying) {
      pendingSeekTime.current = null;
      currentTimeRef.current = player.currentTime;
      player.pause();
      void saveProgress(true);
      updateControlsVisible(CONTROLS_VISIBLE);
      return;
    }

    player.play();
    updateControlsVisible(CONTROLS_HIDDEN);
  }

  function safeSeekBy(offset: number) {
    const target = Math.min(Math.max(currentTimeRef.current + offset, 0), player.duration);

    pendingSeekTime.current = target;
    currentTimeRef.current = target;

    setPlayerCurrentTime(player, target);
    updateProgressDisplay(target, player.duration);

    updateControlsVisible(CONTROLS_VISIBLE);
    restartControlsTimeout();
  }

  async function changeVideoSource(direction: number) {
    currentTimeRef.current = player.currentTime;
    await saveProgress(true);

    const newIndex = (currentIndex + direction + videoSources.length) % videoSources.length;

    await replaceVideoSource(newIndex);
  }

  function handleButtonPressIn() {
    setIsButtonTouched(true);
  }

  function handleButtonPressOut() {
    setIsButtonTouched(false);
  }

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
