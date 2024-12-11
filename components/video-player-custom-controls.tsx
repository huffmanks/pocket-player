import { useKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Pressable, TouchableWithoutFeedback, View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import {
  FastForwardIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RewindIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from "@/lib/icons";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { cn, secondsToMMSS } from "@/lib/utils";

import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";

export default function VideoPlayer({ videoSources }: { videoSources: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<VideoView | null>(null);
  const { autoPlay, fullscreen, loop, mute, setLoop, setMute } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      fullscreen: state.fullscreen,
      loop: state.loop,
      mute: state.mute,
      setLoop: state.setLoop,
      setMute: state.setMute,
    }))
  );

  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);

  useKeepAwake();

  const isPlaylist = videoSources.length > 1;

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    player.loop = !isPlaylist && (loop ?? false);
    player.muted = mute || false;

    // if (autoPlay || isPlaylist) {
    //   player.play();
    //   setIsPlaying(true);
    //   hideControls(0);
    // }
  });

  useEffect(() => {
    const enableOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    const disableOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    enableOrientation();
    setIsLockDisabled(true);

    if (fullscreen && videoRef.current) {
      videoRef.current.enterFullscreen();
      setIsFullscreen(true);
    }

    return () => {
      disableOrientation();
      setIsLockDisabled(false);
    };
  }, []);

  const getCurrentTime = player.addListener("timeUpdate", ({ currentTime }) => {
    setCurrentTime(secondsToMMSS(currentTime));

    if (player.duration <= 0) setProgress(0);
    const currentProgress = (currentTime / player.duration) * 100;
    setProgress(currentProgress);
  });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (currentIndex < videoSources.length - 1) {
        replaceVideo(1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, currentIndex, videoSources]);

  function replaceVideo(index: number) {
    setCurrentIndex((prev) => {
      const nextIndex = prev + index;
      player.replace(videoSources[nextIndex]);
      return nextIndex;
    });
  }

  function showControls() {
    setControlsVisible(true);
    if (isPlaying) {
      hideControls(2000);
    }
  }

  function hideControls(timeout: number) {
    setTimeout(() => {
      setControlsVisible(false);
    }, timeout);
  }

  function togglePlayPause() {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying((prev) => !prev);
  }

  function toggleMute() {
    setMute(!mute);
    player.muted = !mute;
  }

  function toggleLoop() {
    setLoop(!loop);
    player.loop = !loop;
  }

  function handleSkip(seconds: number) {
    const currentTime = player.currentTime;
    const duration = player.duration;
    const seekTo =
      currentTime + seconds >= duration
        ? duration
        : currentTime + seconds <= 0
          ? 0
          : currentTime + seconds;

    player.seekBy(seekTo);
  }

  function handleNext() {
    if (currentIndex < videoSources.length - 1) {
      replaceVideo(1);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      replaceVideo(-1);
    }
  }

  function toggleFullscreen() {
    if (videoRef.current) {
      if (isFullscreen) {
        videoRef.current.exitFullscreen();
      } else {
        videoRef.current.enterFullscreen();
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={showControls}>
      <View className="flex-1">
        <VideoView
          ref={videoRef}
          player={player}
          nativeControls={false}
          style={{ flex: 1 }}
        />

        {controlsVisible && (
          <View className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex-row items-center justify-center gap-8">
            {isPlaylist && (
              <Pressable
                onPress={handlePrevious}
                disabled={currentIndex === 0}>
                <SkipBackIcon
                  size={32}
                  className={cn(currentIndex === 0 ? "text-muted-foreground" : "text-foreground")}
                />
              </Pressable>
            )}

            <Pressable onPress={() => handleSkip(-15)}>
              <RewindIcon
                size={32}
                className="text-foreground"
              />
            </Pressable>
            <Pressable onPress={togglePlayPause}>
              {isPlaying ? (
                <PauseIcon
                  size={32}
                  className="text-foreground"
                />
              ) : (
                <PlayIcon
                  size={32}
                  className="text-foreground"
                />
              )}
            </Pressable>

            <Pressable onPress={() => handleSkip(15)}>
              <FastForwardIcon
                size={32}
                className="text-foreground"
              />
            </Pressable>

            {isPlaylist && (
              <Pressable
                onPress={handleNext}
                disabled={currentIndex === videoSources.length - 1}>
                <SkipForwardIcon
                  size={32}
                  className={cn(
                    currentIndex === videoSources.length - 1
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                />
              </Pressable>
            )}
          </View>
        )}

        <View className="fixed bottom-10 left-0 right-0 flex-row items-center justify-around">
          <View className="mb-8 flex-1">
            <Progress
              value={progress}
              className="w-full"
              style={{ width: "100%" }}
            />
          </View>
          <View className="flex-row items-center justify-between px-4">
            <View className="flex-1 flex-row items-center gap-2">
              <Text>{currentTime}</Text>
              <Text className="text-muted-foreground">&middot;</Text>
              <Text className="text-muted-foreground">{secondsToMMSS(player.duration)}</Text>
            </View>

            <View className="flex-row items-center gap-8">
              <Pressable onPress={toggleMute}>
                {mute ? (
                  <Volume2Icon
                    size={24}
                    className="text-foreground"
                  />
                ) : (
                  <VolumeXIcon
                    size={24}
                    className="text-foreground"
                  />
                )}
              </Pressable>
              <Pressable onPress={toggleLoop}>
                <RepeatIcon
                  size={24}
                  className={cn(loop ? "text-foreground" : "text-muted-foreground")}
                />
              </Pressable>
              <Pressable onPress={toggleFullscreen}>
                {isFullscreen ? (
                  <MinimizeIcon
                    size={24}
                    className="text-foreground"
                  />
                ) : (
                  <MaximizeIcon
                    size={24}
                    className="text-foreground"
                  />
                )}
              </Pressable>
              V
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
