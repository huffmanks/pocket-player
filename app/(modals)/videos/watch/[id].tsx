import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

import VideoPlayer from "@/components/video-player";

export default function WatchModal() {
  const [screenTitle, setScreenTitle] = useState<string | null>(null);
  const [videoSources, setVideoSources] = useState<string[] | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useDatabaseStore();

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      if (video && video?.videoUri) {
        setVideoSources([video.videoUri]);
        setScreenTitle(video.title);
      }
    };

    fetchVideo().catch((error) => {
      console.error("Failed to find video source: ", error);
      toast.error("Failed to find video source.");
    });
  }, []);

  if (!videoSources || !screenTitle) return null;

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />
      <VideoPlayer videoSources={videoSources} />
    </>
  );
}
