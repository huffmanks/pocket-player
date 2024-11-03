import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

import VideoPlayer from "@/components/video-player";

export default function WatchModal() {
  const [videoSource, setVideoSource] = useState("");

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      setVideoSource(video?.videoUri || "");
    };

    fetchVideo().catch((_error) => toast.error("Failed to find video source."));
  }, [id]);

  if (!videoSource) return null;

  return <VideoPlayer videoSource={videoSource} />;
}
