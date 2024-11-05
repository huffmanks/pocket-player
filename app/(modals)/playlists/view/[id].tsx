import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { PlaylistMeta, VideoMeta, playlistVideos, playlists, videos } from "@/db/schema";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export default function ViewPlaylistScreen() {
  const [playlist, setPlaylist] = useState<PlaylistMeta | null>(null);
  const [videoSources, setVideoSources] = useState<VideoMeta[] | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchPlaylist = async () => {
      const [playlistData] = await db.select().from(playlists).where(eq(playlists.id, id));

      const videosData = await db
        .select({
          id: videos.id,
          title: videos.title,
          description: videos.description,
          createdAt: videos.createdAt,
          updatedAt: videos.updatedAt,
          videoUri: videos.videoUri,
          thumbUri: videos.thumbUri,
          isFavorite: videos.isFavorite,
        })
        .from(videos)
        .innerJoin(playlistVideos, eq(playlistVideos.videoId, videos.id))
        .where(eq(playlistVideos.playlistId, playlistData.id));

      if (videosData[0] && videosData[0]?.videoUri) {
        setVideoSources(videosData);
      }

      if (playlistData) {
        setPlaylist(playlistData);
      }
    };

    fetchPlaylist().catch((error) => {
      console.error("Failed to find playlist or video sources: ", error);
      toast.error("Failed to find playlist or video sources.");
    });
  }, []);

  if (!videoSources || !playlist) return null;

  return (
    <View className="p-4">
      <H2 className="mb-4 text-teal-500">{playlist.title}</H2>
      <Text className="mb-6 text-muted-foreground">
        {playlist.description ? `Description: ${playlist.description}` : "No description"}
      </Text>

      <Button
        className="mb-12"
        size="lg"
        onPress={() => router.push(`/(modals)/playlists/watch/${playlist.id}`)}>
        <Text>Watch</Text>
      </Button>

      <View className="gap-4">
        {videoSources.map((item) => (
          <View
            key={`playlist-view_${item.id}`}
            className="flex-row items-start gap-4">
            <View>
              <Image
                style={{ width: 225, height: 125 }}
                source={{ uri: item.thumbUri }}
                resizeMode="cover"
              />
            </View>
            <View className="w-4/5">
              <Text
                className="mb-2 text-lg font-medium text-foreground"
                numberOfLines={2}>
                {item.title}
              </Text>

              <Text
                className="text-sm text-muted-foreground"
                numberOfLines={3}>
                {item.description ? item.description : "No description"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
