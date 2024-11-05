import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

import CreatePlaylistForm from "@/components/forms/create-playlist";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export interface VideoData {
  videoId: string;
  title: string;
  isSelected?: boolean;
}

export default function CreatePlaylistScreen() {
  const [videoData, setVideoData] = useState<VideoData[] | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const data = await db.select({ id: videos.id, title: videos.title }).from(videos);

      const updatedData = data.map((video) => ({
        videoId: video.id,
        title: video.title,
        isSelected: false,
      }));

      setVideoData(updatedData);
    };

    fetchVideos().catch((error) => {
      console.error("Failed to find video: ", error);
      toast.error("Failed to find video.");
    });
  }, []);

  if (!videoData || !videoData.length)
    return (
      <View className="mt-2 p-5">
        <H2 className="mb-4 text-teal-500">No videos yet!</H2>
        <Text className="mb-12">Your videos will be displayed here.</Text>
        <Link
          href="/(tabs)/upload"
          asChild>
          <Button size="lg">
            <Text>Upload videos</Text>
          </Button>
        </Link>
      </View>
    );

  return (
    <View>
      <CreatePlaylistForm videoData={videoData} />
    </View>
  );
}
