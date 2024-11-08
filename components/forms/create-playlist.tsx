import { router } from "expo-router";
import { useRef } from "react";
import { ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { VideoData } from "@/app/(modals)/playlists/create";
import { playlistVideos, playlists } from "@/db/schema";
import { SendIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useDatabase } from "@/providers/database-provider";

import { Button } from "@/components/ui/button";
import { Form, FormCheckbox, FormField, FormInput, FormTextarea } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters." })
    .transform((val) => val.trim()),
  description: z
    .string()
    .or(z.literal(""))
    .transform((val) => val.trim()),
  videos: z
    .array(
      z.object({
        title: z.string().min(1),
        isSelected: z.boolean(),
        videoId: z.string().min(1),
      })
    )
    .nonempty({ message: "Must select at least one video." })
    .refine((videos) => videos.some((video) => video.title && video.isSelected && video.videoId), {
      message: "Must select at least one video.",
    }),
});

type FormData = z.infer<typeof formSchema>;

interface CreatePlaylistFormProps {
  videoData: VideoData[];
}

export default function CreatePlaylistForm({ videoData }: CreatePlaylistFormProps) {
  const { db } = useDatabase();
  const ref = useRef(null);
  useScrollToTop(ref);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      videos: videoData,
    },
  });

  async function onSubmit(values: FormData) {
    if (!db) return;

    try {
      const parsedValues = formSchema.parse(values);

      await db.transaction(async (tx) => {
        const [createdPlaylist] = await tx
          .insert(playlists)
          .values({
            title: parsedValues.title,
            description: parsedValues.description,
            updatedAt: new Date().toISOString(),
          })
          .returning();

        const videoInserts = values.videos
          .filter((video) => video.isSelected)
          .map((video, index) =>
            tx.insert(playlistVideos).values({
              playlistId: createdPlaylist.id,
              videoId: video.videoId,
              order: index,
            })
          );

        await Promise.all(videoInserts);
      });

      toast.success(`${values.title} playlist created successfully.`);

      router.dismiss();
    } catch (error) {
      console.error(error);
      toast.error("Error creating playlist!");
    }
  }

  function handleErrors(errors: FieldErrors<FormData>) {
    const errorMessage = errors?.videos?.root?.message ? errors.videos.root.message : undefined;

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  const { fields, remove } = useFieldArray({ name: "videos", control: form.control });

  return (
    <View className="relative h-full">
      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-lg p-6"
        showsVerticalScrollIndicator={true}
        className="bg-background"
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 12 }}>
        <View className="mx-auto mb-8 min-h-1 w-full max-w-md">
          <Form {...form}>
            <View className="mb-12">
              <View className="flex-1 gap-7">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormInput
                      label="Playlist title"
                      autoFocus={false}
                      selectTextOnFocus={true}
                      placeholder="Add a playlist title..."
                      autoCapitalize="none"
                      {...field}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormTextarea
                      label="Description"
                      autoFocus={false}
                      selectTextOnFocus={true}
                      placeholder="Add a video description..."
                      autoCapitalize="none"
                      {...field}
                    />
                  )}
                />

                <View>
                  <Text className="font-medium">Videos</Text>
                  <Text className="mb-3 text-muted-foreground">
                    Select the videos to be included in the playlist.
                  </Text>
                  {fields.map((fieldItem, index) => (
                    <View
                      key={`create-playlist_${fieldItem.id}`}
                      className="gap-2">
                      <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-1 flex-row items-center gap-4">
                          <FormField
                            control={form.control}
                            name={`videos.${index}.isSelected`}
                            render={({ field }) => (
                              <FormCheckbox
                                className="flex items-center justify-center gap-8"
                                label={fieldItem.title}
                                {...field}
                              />
                            )}
                          />
                        </View>
                        <View className="items-center justify-center">
                          <Button
                            className={cn(
                              "native:p-2 group p-2 web:hover:bg-destructive",
                              fields.length === 1 && "invisible"
                            )}
                            variant="ghost"
                            disabled={fields.length === 1}
                            onPress={() => remove(index)}>
                            <XIcon
                              className="text-destructive group-hover:text-foreground"
                              size={20}
                              strokeWidth={1.25}
                            />
                          </Button>
                        </View>
                      </View>
                      <Separator className="mb-2" />
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View>
              <Button
                className="bg-teal-600"
                size="lg"
                onPress={form.handleSubmit(onSubmit, handleErrors)}>
                <View className="flex-row items-center gap-4">
                  <SendIcon
                    className="text-white"
                    size={28}
                    strokeWidth={1.25}
                  />
                  <Text className="native:text-base text-white">Submit</Text>
                </View>
              </Button>
            </View>
          </Form>
        </View>
      </ScrollView>
    </View>
  );
}
