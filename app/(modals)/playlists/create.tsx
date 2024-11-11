import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { CloudUploadIcon } from "@/lib/icons";
import { useDatabaseStore } from "@/lib/store";

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

  const { db } = useDatabaseStore();

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
      console.error("Failed to find videos: ", error);
      toast.error("Failed to find videos.");
    });
  }, []);

  if (!videoData || !videoData.length)
    return (
      <View className="px-5 pt-4">
        <H2 className="mb-4 text-teal-500">No videos yet!</H2>
        <Text className="mb-12">Upload some videos to create a playlist.</Text>
        <Link
          href="/(tabs)/upload"
          asChild>
          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-4">
            <CloudUploadIcon
              className="text-background"
              size={20}
              strokeWidth={1.25}
            />
            <Text>Upload</Text>
          </Button>
        </Link>
      </View>
    );

  return (
    <View className="px-5 pt-4">
      <CreatePlaylistForm videoData={videoData} />
    </View>
  );
}
