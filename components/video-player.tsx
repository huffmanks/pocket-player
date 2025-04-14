import { useKeepAwake } from "expo-keep-awake";
import * as NavigationBar from "expo-navigation-bar";
import { router, useFocusEffect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { VideoView } from "expo-video";
import { useCallback } from "react";
import { Platform, View } from "react-native";

import Slider from "@react-native-community/slider";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import {
  ChevronLeftIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from "@/lib/icons";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function VideoPlayer({ videoSources }: { videoSources: string[] }) {
  useKeepAwake();

  const { isDarkColorScheme } = useColorScheme();
  const isNativeControls = useSettingsStore((state) => state.isNativeControls);
  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);

  const {
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
  } = useVideoPlayerControls(videoSources);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        NavigationBar.setVisibilityAsync("hidden");
      }

      const enableOrientation = async () => {
        await ScreenOrientation.unlockAsync();
      };
      const disableOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };

      enableOrientation();
      setIsLockDisabled(true);

      return () => {
        NavigationBar.setVisibilityAsync("visible");
        disableOrientation();
        setIsLockDisabled(false);
      };
    }, [])
  );

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <>
      {isNativeControls ? (
        <View className="flex-1">
          <VideoView
            ref={videoRef}
            style={{ flex: 1 }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      ) : (
        <GestureDetector gesture={tapGesture}>
          <View className="relative flex-1 bg-black">
            <StatusBar hidden={true} />

            <VideoView
              ref={videoRef}
              style={{ flex: 1 }}
              player={player}
              allowsFullscreen={false}
              allowsPictureInPicture
              nativeControls={false}
            />

            <Animated.View
              className={cn(
                "absolute inset-0 mb-4 flex-1",
                isDarkColorScheme ? "bg-black/70" : "bg-black/50"
              )}
              style={animatedStyle}>
              {controlsVisible && (
                <View className="flex-1 justify-between gap-4">
                  <View className="flex-row items-center justify-between gap-4 pt-4">
                    <Button
                      className="p-3"
                      variant="ghost"
                      size="unset"
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={handleGoBack}>
                      <ChevronLeftIcon
                        className="text-white"
                        size={32}
                        strokeWidth={1.25}
                      />
                    </Button>
                  </View>
                  <View className="mt-16 flex-row items-center justify-center gap-5">
                    {isPlaylist && (
                      <Button
                        className="p-3"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => changeVideoSource(-1)}>
                        <SkipBackIcon
                          className="text-white"
                          size={32}
                          strokeWidth={1.25}
                        />
                      </Button>
                    )}

                    <Button
                      className="p-3"
                      variant="ghost"
                      size="unset"
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={() => player.seekBy(-5)}>
                      <RewindIcon
                        className="fill-white"
                        size={32}
                        strokeWidth={1.25}
                      />
                    </Button>

                    <Button
                      className="p-3"
                      variant="ghost"
                      size="unset"
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={togglePlay}>
                      {isPlaying ? (
                        <PauseIcon
                          className="fill-white"
                          size={32}
                          strokeWidth={1.25}
                        />
                      ) : hasEnded ? (
                        <RotateCcwIcon
                          className="text-white"
                          size={32}
                          strokeWidth={2.25}
                        />
                      ) : (
                        <PlayIcon
                          className="fill-white"
                          size={32}
                          strokeWidth={1.25}
                        />
                      )}
                    </Button>
                    <Button
                      className="p-3"
                      variant="ghost"
                      size="unset"
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={() => player.seekBy(5)}>
                      <FastForwardIcon
                        className="fill-white"
                        size={32}
                        strokeWidth={1.25}
                      />
                    </Button>

                    {isPlaylist && (
                      <Button
                        className="p-3"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => changeVideoSource(1)}>
                        <SkipForwardIcon
                          className="text-white"
                          size={32}
                          strokeWidth={1.25}
                        />
                      </Button>
                    )}
                  </View>
                  <View className="gap-6">
                    <View className="flex-row items-center justify-between gap-4 pl-4 pr-2">
                      <Text className="text-sm text-white/70">{time}</Text>
                      <Button
                        className="p-3"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={toggleMute}>
                        {muted ? (
                          <VolumeXIcon
                            className="text-white/70"
                            size={24}
                            strokeWidth={1.25}
                          />
                        ) : (
                          <Volume2Icon
                            className="text-white"
                            size={24}
                            strokeWidth={1.25}
                          />
                        )}
                      </Button>
                    </View>

                    <View className="pb-8">
                      <Slider
                        className="h-10 w-full bg-secondary"
                        value={progress}
                        minimumValue={0}
                        maximumValue={1}
                        step={0.01}
                        minimumTrackTintColor="#f8fafc"
                        maximumTrackTintColor="#1f242b"
                        tapToSeek
                        onTouchStart={handleButtonPressIn}
                        onTouchEnd={handleButtonPressOut}
                        onSlidingStart={onSlidingStart}
                        onSlidingComplete={onSlidingComplete}
                      />
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        </GestureDetector>
      )}
    </>
  );
}
