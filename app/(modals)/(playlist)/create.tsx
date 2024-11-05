import { useEffect, useState } from "react";
import { View } from "react-native";

import { toast } from "sonner-native";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

import CreatePlaylistForm from "@/components/forms/create-playlist";
import { Text } from "@/components/ui/text";

export interface VideoData {
  videoId: string;
  title: string;
  isSelected?: boolean;
}

export default function CreatePlaylistScreen() {
  const [videoData, setVideoData] = useState<VideoData[] | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const data = await db.select({ id: videos.id, title: videos.title }).from(videos);

      const updatedData = data.map((video) => ({
        videoId: video.id,
        title: video.title,
        isSelected: false,
      }));

      setVideoData(updatedData);
    };

    fetchVideo().catch((error) => {
      console.error("Failed to find video: ", error);
      toast.error("Failed to find video.");
    });
  }, []);

  if (!videoData) return null;

  return (
    <View className="p-4">
      <CreatePlaylistForm videoData={videoData} />
    </View>
  );
}
