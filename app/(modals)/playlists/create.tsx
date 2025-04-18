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
  value: string;
  label: string;
}

export default function CreatePlaylistScreen() {
  const [videoData, setVideoData] = useState<VideoData[] | null>(null);

  const db = useDatabaseStore.getState().db;

  useEffect(() => {
    const fetchVideos = async () => {
      const data = await db.select({ value: videos.id, label: videos.title }).from(videos);

      setVideoData(data);
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
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              Upload videos
            </Text>
          </Button>
        </Link>
      </View>
    );

  return (
    <View className="mx-auto mb-8 w-full max-w-md flex-1 px-4 py-8">
      <CreatePlaylistForm videoData={videoData} />
    </View>
  );
}
