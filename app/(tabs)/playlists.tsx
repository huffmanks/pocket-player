import { Link } from "expo-router";
import { Image, View } from "react-native";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { playlists } from "@/db/schema";
import { ListMusicIcon, TrashIcon, TvIcon, ViewIcon } from "@/lib/icons";
import { useDatabaseStore, usePlaylistStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H2 } from "@/components/ui/typography";

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);
  const db = useDatabaseStore.getState().db;

  const playlistsQuery = useLiveQuery(db.select().from(playlists).orderBy(playlists.title));
  const { data: playlistsData, error: playlistsError } = playlistsQuery;

  const thumbUrisQuery = useLiveQuery(
    db.query.playlistVideos.findMany({
      columns: { playlistId: true },
      with: {
        video: {
          columns: { thumbUri: true },
        },
      },
    })
  );

  const { data: thumbUrisData, error: thumbUrisError } = thumbUrisQuery;

  const playlistsWithThumbUris = playlistsData.map((playlist) => {
    const thumbUris = thumbUrisData
      .filter((video) => video.playlistId === playlist.id)
      .map((video) => video.video.thumbUri)
      .slice(0, 5);

    return {
      ...playlist,
      thumbUris,
    };
  });

  async function handleDelete(id: string) {
    try {
      const { message } = await deletePlaylist(id);
      toast.error(message);
    } catch (error) {
      console.error("Deleting playlist failed: ", error);
      toast.error("Deleting playlist failed.");
    }
  }

  if (playlistsError || thumbUrisError) {
    console.error("Error loading data.");
    toast.error("Error loading data.");
  }
  const playlistsExist = Array.isArray(playlistsData) && playlistsData.length > 0;

  return (
    <ScrollView
      contentInset={insets}
      contentContainerClassName="pb-20"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-4">
        {playlistsExist ? (
          <>
            <ListHeaderComponent />
            {playlistsWithThumbUris.map((playlist) => (
              <Accordion
                key={playlist.id}
                type="single"
                collapsible
                className="native:max-w-md w-full max-w-sm">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <Text>{playlist.title}</Text>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Text className="mb-8 text-muted-foreground">
                      {playlist?.description ? playlist.description : "No description."}
                    </Text>

                    <View className="mb-10 flex-row items-center">
                      {playlist.thumbUris.map((thumbUri, index) => (
                        <Image
                          key={thumbUri + index}
                          className={cn("rounded-full", index === 0 ? "" : "-ml-9")}
                          style={{ width: 100, height: 100 }}
                          source={{ uri: thumbUri }}
                        />
                      ))}
                    </View>
                    <View className="mb-4 flex-row items-center justify-between gap-2">
                      <Link
                        href={`/(modals)/playlists/watch/${playlist.id}`}
                        asChild>
                        <Button className="flex flex-1 flex-row items-center justify-center gap-2">
                          <TvIcon
                            className="text-background"
                            size={20}
                            strokeWidth={1.25}
                          />
                          <Text>Watch</Text>
                        </Button>
                      </Link>
                      <Link
                        href={`/(modals)/playlists/view/${playlist.id}`}
                        asChild>
                        <Button
                          variant="secondary"
                          className="flex flex-1 flex-row items-center justify-center gap-2">
                          <ViewIcon
                            className="text-foreground"
                            size={20}
                            strokeWidth={1.25}
                          />
                          <Text>View</Text>
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="flex flex-1 flex-row items-center justify-center gap-2"
                        onPress={() => handleDelete(playlist.id)}>
                        <TrashIcon
                          className="text-white"
                          size={20}
                          strokeWidth={1.25}
                        />
                        <Text className="text-white">Delete</Text>
                      </Button>
                    </View>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </>
        ) : (
          <ListEmptyComponent />
        )}
      </View>
    </ScrollView>
  );
}

function ListHeaderComponent() {
  return (
    <View className="mb-10">
      <Link
        href="/(modals)/playlists/create"
        asChild>
        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-4">
          <ListMusicIcon
            className="text-background"
            size={24}
            strokeWidth={1.5}
          />
          <Text className="native:text-base font-semibold uppercase tracking-wider">
            Create playlist
          </Text>
        </Button>
      </Link>
    </View>
  );
}

function ListEmptyComponent() {
  return (
    <View className="pt-5">
      <H2 className="mb-4 text-teal-500">No playlists yet!</H2>
      <Text className="mb-12">Your playlists will be displayed here.</Text>
      <Link
        href="/(modals)/playlists/create"
        asChild>
        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-4">
          <ListMusicIcon
            className="text-background"
            size={24}
            strokeWidth={1.5}
          />
          <Text className="native:text-base font-semibold uppercase tracking-wider">
            Create playlist
          </Text>
        </Button>
      </Link>
    </View>
  );
}
