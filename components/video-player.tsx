import { VideoView, useVideoPlayer } from "expo-video";
import { useRef } from "react";
import { View } from "react-native";

import { settingsStorage } from "@/lib/storage";

export default function VideoPlayer({ videoSource }: { videoSource: string }) {
  const videoRef = useRef(null);
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = settingsStorage.getBoolean("loop") || false;
    player.muted = settingsStorage.getBoolean("mute") || false;

    if (settingsStorage.getBoolean("autoplay")) {
      player.play();
    }
  });

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
