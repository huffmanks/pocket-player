import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { VideoView } from "expo-video";
import { View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta } from "@/db/schema";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { SLIDER_THEME } from "@/lib/constants";
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
import { useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function VideoPlayer({ videoSources }: { videoSources: VideoMeta[] }) {
  useKeepAwake();

  const { isDarkColorScheme } = useColorScheme();

  const { currentPath, isNativeControls } = useSettingsStore(
    useShallow((state) => ({
      currentPath: state.currentPath,
      isNativeControls: state.isNativeControls,
    }))
  );

  const {
    videoRef,
    player,
    isPlaying,
    currentIndex,
    time,
    progress,
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
  } = useVideoPlayerControls(videoSources);

  function handleGoBack() {
    if (currentPath.startsWith("/playlists/watch/")) {
      const id = currentPath.split("/").pop();
      router.dismissTo(`/(screens)/playlists/view/${id}`);
    } else {
      router.push("/(tabs)/videos");
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
          <View className="flex-1 bg-black">
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
                "absolute bottom-0 left-0 right-0 top-0",
                isDarkColorScheme ? "bg-black/70" : "bg-black/50"
              )}
              style={animatedStyle}>
              {controlsVisible && (
                <View className="flex-1 justify-between gap-2">
                  <View className="flex-row items-center justify-between gap-4 pt-2">
                    <View>
                      <Button
                        className="rounded-full p-1 active:bg-transparent"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={handleGoBack}>
                        <ChevronLeftIcon
                          className="text-white group-active:opacity-70"
                          size={32}
                          strokeWidth={1.25}
                        />
                      </Button>
                    </View>
                    <View className="mr-8 flex-1">
                      <Text
                        className="text-lg font-semibold"
                        numberOfLines={1}>
                        {videoSources[currentIndex].title}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-center gap-5">
                    {isPlaylist && (
                      <Button
                        className="rounded-full p-1 active:bg-transparent"
                        variant="ghost"
                        size="unset"
                        disabled={hasEnded}
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => changeVideoSource(-1)}>
                        <SkipBackIcon
                          className="fill-white stroke-white group-active:opacity-70"
                          size={32}
                          strokeWidth={1.25}
                        />
                      </Button>
                    )}

                    <Button
                      className="rounded-full p-1 active:bg-transparent"
                      variant="ghost"
                      size="unset"
                      disabled={hasEnded}
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={() => safeSeekBy(-5)}>
                      <RewindIcon
                        className="fill-white stroke-white group-active:opacity-70"
                        size={32}
                        strokeWidth={1.25}
                      />
                    </Button>

                    <Button
                      className="rounded-full p-1 active:bg-transparent"
                      variant="ghost"
                      size="unset"
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={togglePlay}>
                      {hasEnded ? (
                        <RotateCcwIcon
                          className="stroke-white group-active:opacity-70"
                          size={32}
                          strokeWidth={2.25}
                        />
                      ) : isPlaying ? (
                        <PauseIcon
                          className="fill-white stroke-white group-active:opacity-70"
                          size={32}
                          strokeWidth={1.25}
                        />
                      ) : (
                        <PlayIcon
                          className="fill-white stroke-white group-active:opacity-70"
                          size={32}
                          strokeWidth={1.25}
                        />
                      )}
                    </Button>
                    <Button
                      className="rounded-full p-1 active:bg-transparent"
                      variant="ghost"
                      size="unset"
                      disabled={hasEnded}
                      onPressIn={handleButtonPressIn}
                      onPressOut={handleButtonPressOut}
                      onPress={() => safeSeekBy(5)}>
                      <FastForwardIcon
                        className="fill-white stroke-white group-active:opacity-70"
                        size={32}
                        strokeWidth={1.25}
                      />
                    </Button>

                    {isPlaylist && (
                      <Button
                        className="rounded-full p-1 active:bg-transparent"
                        variant="ghost"
                        size="unset"
                        disabled={hasEnded}
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={() => changeVideoSource(1)}>
                        <SkipForwardIcon
                          className="fill-white stroke-white group-active:opacity-70"
                          size={32}
                          strokeWidth={1.25}
                        />
                      </Button>
                    )}
                  </View>
                  <View className="portrait:pb-4 landscape:px-2 landscape:pb-8">
                    <View className="flex-row items-center justify-between gap-4 pl-4 pr-2">
                      <Text className="text-sm text-white/70">{time}</Text>
                      <Button
                        className="rounded-full p-1 active:bg-transparent"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={toggleMute}>
                        {muted ? (
                          <VolumeXIcon
                            className="stroke-white/70"
                            size={24}
                            strokeWidth={1.25}
                          />
                        ) : (
                          <Volume2Icon
                            className="stroke-white"
                            size={24}
                            strokeWidth={1.25}
                          />
                        )}
                      </Button>
                    </View>

                    <View className="flex-1 px-2 portrait:mb-8 landscape:mb-4">
                      <Slider
                        value={progress}
                        minimumValue={0}
                        maximumValue={1}
                        step={0.01}
                        thumbTintColor={SLIDER_THEME.thumbTintColor}
                        minimumTrackTintColor={SLIDER_THEME.minimumTrackTintColor}
                        maximumTrackTintColor={SLIDER_THEME.maximumTrackTintColor}
                        onValueChange={(val) => onSliderChange(Number(val))}
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
