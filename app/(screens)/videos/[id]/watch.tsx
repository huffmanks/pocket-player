import { useLocalSearchParams } from "expo-router";

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

  if (!videoQuery?.data?.length) return null;

  return <VideoPlayer videoSources={videoQuery.data} />;
}
