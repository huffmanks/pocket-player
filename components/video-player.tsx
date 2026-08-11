import { useKeepAwake } from "expo-keep-awake";
import { useRouter } from "expo-router";
import { VideoView } from "expo-video";
import { useMemo } from "react";
import { View } from "react-native";

import { Slider } from "@miblanchard/react-native-slider";
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
} from "lucide-react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";

import { VideoMeta } from "@/db/schema";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useVideoPlayerControls } from "@/hooks/useVideoPlayerControls";
import { useSettingsStore } from "@/lib/store";
import { SLIDER_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function VideoPlayer({ videoSources }: { videoSources: VideoMeta[] }) {
  useKeepAwake();

  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const sourcesKey = videoSources.map((v) => v.id).join(",");
  const memoizedVideoSources = useMemo(
    () => videoSources,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourcesKey]
  );

  const { lastVisitedPath, isNativeControls } = useSettingsStore(
    useShallow((state) => ({
      lastVisitedPath: state.lastVisitedPath,
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
  } = useVideoPlayerControls(memoizedVideoSources);

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else if (lastVisitedPath.startsWith("/playlists")) {
      router.dismissTo("/(tabs)/playlists");
    } else if (lastVisitedPath.startsWith("/favorites")) {
      router.dismissTo("/(tabs)/favorites");
    } else {
      router.dismissTo("/(tabs)/videos");
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
            nativeControls
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
              fullscreenOptions={{ enable: false }}
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
                  <View className="flex-row items-center justify-between gap-4 portrait:pt-12 landscape:px-14 landscape:pt-2">
                    <View>
                      <Button
                        className="rounded-full p-1 active:bg-transparent"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={handleGoBack}>
                        <Icon
                          as={ChevronLeftIcon}
                          className="text-white group-active:opacity-70"
                          size={32}
                          strokeWidth={1.25}
                        />
                      </Button>
                    </View>
                    <View className="mr-8 flex-1">
                      <Text
                        className="text-lg font-semibold text-white"
                        numberOfLines={1}>
                        {videoSources[currentIndex].title}
                      </Text>
                    </View>
                  </View>
                  {showPlaybackControls && (
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
                          <Icon
                            as={SkipBackIcon}
                            className="group-active:opacity-70"
                            fill="white"
                            stroke="white"
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
                        <Icon
                          as={RewindIcon}
                          className="group-active:opacity-70"
                          fill="white"
                          stroke="white"
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
                          <Icon
                            as={RotateCcwIcon}
                            className="group-active:opacity-70"
                            stroke="white"
                            size={32}
                            strokeWidth={2.25}
                          />
                        ) : isPlaying ? (
                          <Icon
                            as={PauseIcon}
                            className="group-active:opacity-70"
                            fill="white"
                            stroke="white"
                            size={32}
                            strokeWidth={1.25}
                          />
                        ) : (
                          <Icon
                            as={PlayIcon}
                            className="group-active:opacity-70"
                            fill="white"
                            stroke="white"
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
                        <Icon
                          as={FastForwardIcon}
                          className="group-active:opacity-70"
                          fill="white"
                          stroke="white"
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
                          <Icon
                            as={SkipForwardIcon}
                            className="group-active:opacity-70"
                            fill="white"
                            stroke="white"
                            size={32}
                            strokeWidth={1.25}
                          />
                        </Button>
                      )}
                    </View>
                  )}

                  <View className="portrait:mb-20 portrait:px-3 landscape:mb-16 landscape:px-16">
                    <View className="flex-row items-center justify-between gap-4 landscape:pl-4">
                      <Text className="text-base text-white/90">{time}</Text>
                      <Button
                        className="rounded-full p-1 active:bg-transparent"
                        variant="ghost"
                        size="unset"
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        onPress={toggleMute}>
                        {player.muted ? (
                          <Icon
                            as={VolumeXIcon}
                            stroke="white"
                            opacity={0.8}
                            size={24}
                            strokeWidth={1.25}
                          />
                        ) : (
                          <Icon
                            as={Volume2Icon}
                            stroke="white"
                            size={24}
                            strokeWidth={1.25}
                          />
                        )}
                      </Button>
                    </View>

                    <View className="flex-1 landscape:pl-4">
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
