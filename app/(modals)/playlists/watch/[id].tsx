import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

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

  return (
    <>
      <StatusBar hidden={true} />
      <VideoPlayer videoSources={playlistVideosQuery.data.map((item) => item.videos.videoUri)} />
    </>
  );
}
