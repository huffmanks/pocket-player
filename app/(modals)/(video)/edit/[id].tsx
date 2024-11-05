import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { eq } from "drizzle-orm";
import { toast } from "sonner-native";

import { getTagsForVideo } from "@/actions/tag";
import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

import EditVideoForm from "@/components/forms/edit-video";

export interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  thumbUri: string;
  isFavorite: boolean;
  tags: string;
}

export default function EditModal() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));

      const videoTags = await getTagsForVideo(id);
      const tags = videoTags ? videoTags.map((videoTag) => videoTag.tags.title).join(",") : "";

      setVideoInfo({
        videoId: video.id,
        title: video.title,
        description: video.description,
        thumbUri: video.thumbUri,
        isFavorite: video.isFavorite,
        tags,
      });
    };

    fetchVideo().catch((error) => {
      console.error("Failed to find video: ", error);
      toast.error("Failed to find video.");
    });
  }, []);

  if (!videoInfo) return null;

  return (
    <View>
      <EditVideoForm videoInfo={videoInfo} />
    </View>
  );
}
