import { useEffect, useState } from "react";
import { View } from "react-native";

import { toast } from "sonner-native";

import { videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

import CreatePlaylistForm from "@/components/forms/create-playlist";

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

    fetchVideos().catch((_err) => {
      toast.error("Failed to find videos.");
    });
  }, []);

  if (!videoData?.length) return null;

  return (
    <View className="mx-auto mb-8 w-full max-w-md px-4 py-8">
      <CreatePlaylistForm videoData={videoData} />
    </View>
  );
}
