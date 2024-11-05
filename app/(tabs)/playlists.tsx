import { Link } from "expo-router";
import { View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { toast } from "sonner-native";

import { PlaylistMeta, playlists } from "@/db/schema";
import { useDatabase } from "@/providers/database-provider";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

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

  if (!data || data.length === 0) {
    return (
      <View className="mt-2 p-5">
        <H2 className="mb-4 text-teal-500">No playlists yet!</H2>
        <Text className="mb-12">Your playlists will be displayed here.</Text>
        <Link
          href="/(modals)/playlists/create"
          asChild>
          <Button size="lg">
            <Text>Create a playlist</Text>
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <View className="p-5">
      {data &&
        data.map((item) => (
          <View
            key={`playlists_${item.id}`}
            className="mb-8 gap-4">
            <H2 className="text-teal-500">{item.title}</H2>
            <View className="flex-row gap-4">
              <Link
                href={`/(modals)/playlists/edit/${item.id}`}
                className="mb-6 text-lg text-foreground underline">
                Edit
              </Link>
              <Link
                href={`/(modals)/playlists/view/${item.id}`}
                className="mb-6 text-lg text-foreground underline">
                View
              </Link>
              <Link
                href={`/(modals)/playlists/watch/${item.id}`}
                className="mb-6 text-lg text-foreground underline">
                Watch
              </Link>
            </View>
          </View>
        ))}
    </View>
  );
}
