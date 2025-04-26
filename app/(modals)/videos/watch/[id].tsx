import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback } from "react";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { useDatabaseStore, useSecurityStore, useSettingsStore } from "@/lib/store";

import VideoPlayer from "@/components/video-player";

export default function WatchModal() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const db = useDatabaseStore.getState().db;
  const setIsLockDisabled = useSecurityStore((state) => state.setIsLockDisabled);
  const overrideOrientation = useSettingsStore((state) => state.overrideOrientation);

  const videoQuery = useLiveQuery(db.select().from(videos).where(eq(videos.id, id)));

  useFocusEffect(
    useCallback(() => {
      const enableOrientation = async () => {
        if (!videoQuery?.data?.[0]) return;
        if (!overrideOrientation) {
          await ScreenOrientation.unlockAsync();
          return;
        }

        const orientation =
          videoQuery.data[0].orientation === "Landscape"
            ? ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
            : ScreenOrientation.OrientationLock.PORTRAIT_UP;

        await ScreenOrientation.lockAsync(orientation);
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
    }, [videoQuery.data])
  );

  if (videoQuery.error) {
    toast.error("Failed to get playlist videos.");
  }

  if (!videoQuery?.data?.length) return null;

  return <VideoPlayer videoSources={videoQuery.data} />;
}
