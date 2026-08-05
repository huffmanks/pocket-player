import { NavigationBar } from "expo-navigation-bar";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

import VideoPlayer from "@/components/video-player";

export default function WatchVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const db = useDatabaseStore.getState().db;

  const videoQuery = useLiveQuery(db.select().from(videos).where(eq(videos.id, id)));

  if (videoQuery.error) {
    toast.error("Failed to get playlist videos.");
  }

  useFocusEffect(
    useCallback(() => {
      try {
        NavigationBar.setHidden(true);
        StatusBar.setHidden(true);
      } catch (_error) {}

      return () => {
        try {
          NavigationBar.setHidden(false);
          StatusBar.setHidden(false);
        } catch (_error) {}
      };
    }, [])
  );

  if (!videoQuery?.data?.length) return null;

  return <VideoPlayer videoSources={videoQuery.data} />;
}
