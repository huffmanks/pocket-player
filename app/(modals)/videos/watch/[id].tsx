import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback } from "react";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { useDatabaseStore, useSecurityStore } from "@/lib/store";

import VideoPlayer from "@/components/video-player";

export default function WatchModal() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const db = useDatabaseStore.getState().db;
  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);

  const videoQuery = useLiveQuery(db.select().from(videos).where(eq(videos.id, id)));

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

  if (videoQuery.error) {
    toast.error("Failed to get playlist videos.");
  }

  if (!videoQuery?.data?.length) return null;

  return <VideoPlayer videoSources={videoQuery.data} />;
}
