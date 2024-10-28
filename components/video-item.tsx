import { Video } from "expo-av";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { deleteVideo } from "@/lib/delete-video";
import { TrashIcon } from "@/lib/icons";

export interface VideoMeta {
  id: string;
  title: string;
  fileUri: string;
  createdAt: Date;
}

export default function VideoItem({ item }: { item: VideoMeta }) {
  async function handleDelete() {
    await deleteVideo(item.id);
  }

  return (
    <View>
      <Video
        className="h-48 w-full"
        style={{ width: "100%", height: 200 }}
        source={{ uri: item.fileUri }}
        resizeMode="contain"
        useNativeControls
      />
      <Button onPress={handleDelete}>
        <TrashIcon
          className="text-teal-500"
          size={28}
          strokeWidth={1.25}
        />
      </Button>
    </View>
  );
}
