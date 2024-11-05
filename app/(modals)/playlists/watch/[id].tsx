import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { playlistVideos, playlists, videos } from "@/db/schema";

import VideoPlayer from "@/components/video-player";

export default function WatchPlaylistScreen() {
  const [screenTitle, setScreenTitle] = useState<string | null>(null);
  const [videoSources, setVideoSources] = useState<string[] | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchPlaylist = async () => {
      const [playlistData] = await db.select().from(playlists).where(eq(playlists.id, id));

      const videosData = await db
        .select()
        .from(videos)
        .innerJoin(playlistVideos, eq(playlistVideos.videoId, videos.id))
        .where(eq(playlistVideos.playlistId, playlistData.id));

      if (videosData[0] && videosData[0]?.videos?.videoUri) {
        const tmpVideoSources = videosData.map((item) => item.videos.videoUri);
        setVideoSources(tmpVideoSources);
      }

      if (playlistData?.title) {
        setScreenTitle(playlistData.title);
      }
    };

    fetchPlaylist().catch((error) => {
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
