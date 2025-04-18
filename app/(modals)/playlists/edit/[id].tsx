import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { toast } from "sonner-native";

import { usePlaylistStore } from "@/lib/store";

import EditPlaylistForm from "@/components/forms/edit-playlist";

export interface EditPlaylistInfo {
  id: string;
  title: string;
  description: string;
  allVideos: {
    value: string;
    label: string;
  }[];
  selectedVideos: {
    value: string;
    label: string;
  }[];
}

export default function EditPlaylistScreen() {
  const [editPlaylistInfo, setEditPlaylistInfo] = useState<EditPlaylistInfo | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const getPlaylistWithAllVideos = usePlaylistStore((state) => state.getPlaylistWithAllVideos);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const data = await getPlaylistWithAllVideos(id);
      setEditPlaylistInfo(data);
    };

    fetchPlaylist().catch((error) => {
      console.error("Failed to find playlist: ", error);
      toast.error("Failed to find playlist.");
    });
  }, []);

  if (!editPlaylistInfo) return null;

  return (
    <View className="mx-auto mb-8 w-full max-w-md flex-1 px-4 py-8">
      <EditPlaylistForm editPlaylistInfo={editPlaylistInfo} />
    </View>
  );
}
