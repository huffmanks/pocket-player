import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

export default function WatchModal() {
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [videoUri, setVideoUri] = useState("");

  const { id } = useLocalSearchParams<{ id: string }>();
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      setVideoUri(video?.videoUri || "");
    };

    fetchVideo().catch((error) => {
      console.error("Failed to fetch video:", error);
    });
  }, [id]);

  console.log(status);

  return (
    <View className="w-full flex-1">
      <Video
        ref={videoRef}
        style={{ width: "100%", height: 300, alignSelf: "center" }}
        source={{
          uri: videoUri,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(prev) => setStatus(prev)}
      />
    </View>
  );
}
