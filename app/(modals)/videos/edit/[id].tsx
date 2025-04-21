import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { eq } from "drizzle-orm";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { VideoMeta, videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

import EditVideoForm from "@/components/forms/edit-video";

export default function EditModal() {
  const [videoInfo, setVideoInfo] = useState<VideoMeta | null>(null);

  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabaseStore.getState().db;

  useEffect(() => {
    const fetchVideo = async () => {
      const [video] = await db.select().from(videos).where(eq(videos.id, id));

      setVideoInfo(video);
    };

    fetchVideo().catch((error) => {
      console.error("Failed to find video: ", error);
      toast.error("Failed to find video.");
    });
  }, []);

  if (!videoInfo) return null;

  return (
    <ScrollView
      contentInset={insets}
      contentContainerClassName="pb-20"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto mb-8 w-full max-w-md flex-1 px-4 py-8">
        <EditVideoForm videoInfo={videoInfo} />
      </View>
    </ScrollView>
  );
}
