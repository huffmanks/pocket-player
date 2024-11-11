import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store";

export default function VideoPlayer({ videoSources }: { videoSources: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const { autoPlay, mute, loop } = useSettingsStore(
    useShallow((state) => ({ autoPlay: state.autoPlay, mute: state.mute, loop: state.loop }))
  );

  const isPlaylist = videoSources.length > 1;

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    player.loop = !isPlaylist && (loop ?? false);
    player.muted = mute || false;

    if (autoPlay || isPlaylist) {
      player.play();
    }
  });

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
