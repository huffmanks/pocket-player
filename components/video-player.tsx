import { useKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useSecurityStore, useSettingsStore } from "@/lib/store";

export default function VideoPlayer({ videoSources }: { videoSources: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<VideoView | null>(null);
  const { autoPlay, fullscreen, mute, loop } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      fullscreen: state.fullscreen,
      mute: state.mute,
      loop: state.loop,
    }))
  );

  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);

  useKeepAwake();

  const isPlaylist = videoSources.length > 1;

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    player.loop = !isPlaylist && (loop ?? false);
    player.muted = mute || false;

    if (autoPlay || isPlaylist) {
      player.play();
    }
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
    }

    return () => {
      disableOrientation();
      setIsLockDisabled(false);
    };
  }, []);

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (currentIndex < videoSources.length - 1) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          player.replace(videoSources[nextIndex]);
          return nextIndex;
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, currentIndex, videoSources]);

  return (
    <View className="flex-1">
      <VideoView
        ref={videoRef}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        style={{ flex: 1 }}
      />
    </View>
  );
}
