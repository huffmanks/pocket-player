import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useState } from "react";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { useDatabaseStore, useSecurityStore } from "@/lib/store";

import VideoPlayer from "@/components/video-player";

export default function WatchModal() {
  const [screenTitle, setScreenTitle] = useState<string | null>(null);
  const [videoSources, setVideoSources] = useState<string[] | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabaseStore.getState().db;
  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);

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

  useFocusEffect(
    useCallback(() => {
      const enableOrientation = async () => {
        await ScreenOrientation.unlockAsync();
      };
      const disableOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };

      enableOrientation();
      setIsLockDisabled(true);

      return () => {
        disableOrientation();
        setIsLockDisabled(false);
      };
    }, [])
  );

  if (!videoSources) return null;

  return (
    <>
      <Stack.Screen options={{ title: screenTitle ?? "Watch video" }} />
      <VideoPlayer videoSources={videoSources} />
    </>
  );
}
