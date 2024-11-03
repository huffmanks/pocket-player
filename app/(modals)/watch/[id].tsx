import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";
import { settingsStorage } from "@/lib/storage";

import VideoPlayer from "@/components/video-player";

export default function WatchModal() {
  const [videoSource, setVideoSource] = useState("");

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      setVideoSource(video?.videoUri || "");

      const orientation =
        settingsStorage.getString("orientation") === "landscape"
          ? ScreenOrientation.OrientationLock.LANDSCAPE
          : ScreenOrientation.OrientationLock.DEFAULT;
      await ScreenOrientation.lockAsync(orientation);
    };

    fetchVideo().catch((error) => console.error("Failed to fetch video:", error));

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT).catch((error) =>
        console.error("Failed to lock orientation:", error)
      );
    };
  }, [id]);

  if (!videoSource) return null;

  return <VideoPlayer videoSource={videoSource} />;
}
