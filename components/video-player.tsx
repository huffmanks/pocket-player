import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { settingsStorage } from "@/lib/storage";

export default function VideoPlayer({ videoSources }: { videoSources: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  const player = useVideoPlayer(videoSources[currentIndex], (player) => {
    player.loop = settingsStorage.getBoolean("loop") || false;
    player.muted = settingsStorage.getBoolean("mute") || false;

    if (settingsStorage.getBoolean("autoplay")) {
      player.play();
    }
  });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (currentIndex < videoSources.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        player.replace(videoSources[currentIndex + 1]);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

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
