import { Link } from "expo-router";
import { View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { toast } from "sonner-native";

import { PlaylistMeta, playlists } from "@/db/schema";
import { useDatabase } from "@/providers/database-provider";

import { Text } from "@/components/ui/text";

export default function PlaylistsScreen() {
  const { db } = useDatabase();
  const { data, error }: { data: PlaylistMeta[]; error: Error | undefined } = useLiveQuery(
    // @ts-expect-error
    db?.select().from(playlists)
  );

  if (error) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }

  return (
    <View className="p-5">
      <Link
        href="/(modals)/(playlist)/create"
        className="mb-6 text-teal-500 underline">
        Create a playlist
      </Link>

      <Text className="text-medium text-lg text-foreground">List of all your playlists.</Text>
      {data.map((item) => (
        <Link
          key={item.id}
          href={`/(modals)/(playlist)/edit/${item.id}`}
          className="mb-6 text-teal-500 underline">
          {item.title}
        </Link>
      ))}
    </View>
  );
}
