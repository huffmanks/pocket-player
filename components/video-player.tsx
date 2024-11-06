import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { settingsStorage } from "@/lib/storage";

export default function VideoPlayer({ videoSources }: { videoSources: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  const isPlaylist = videoSources.length > 1;

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    player.loop = !isPlaylist && (settingsStorage.getBoolean("loop") ?? false);
    player.muted = settingsStorage.getBoolean("mute") || false;

    if (settingsStorage.getBoolean("autoplay") || isPlaylist) {
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
