import { useLocalSearchParams } from "expo-router";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { toast } from "sonner-native";

import { playlistVideos, videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

import VideoPlayer from "@/components/video-player";

export default function WatchPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const db = useDatabaseStore.getState().db;

  const playlistVideosQuery = useLiveQuery(
    db
      .select()
      .from(videos)
      .innerJoin(playlistVideos, eq(playlistVideos.videoId, videos.id))
      .where(eq(playlistVideos.playlistId, id))
      .orderBy(playlistVideos.order)
  );

  if (playlistVideosQuery.error) {
    toast.error("Failed to get playlist videos.");
  }

  if (!playlistVideosQuery?.data?.length) return null;

  const videoSources = playlistVideosQuery.data.map((item) => item.videos);

  return <VideoPlayer videoSources={videoSources} />;
}
