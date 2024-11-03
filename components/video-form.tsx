import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRef } from "react";
import { ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { videos } from "@/db/schema";
import { VIDEOS_DIR } from "@/lib/constants";
import { FileVideoIcon } from "@/lib/icons";
import { ensureDirectory, requestPermissions } from "@/lib/upload";
import { useDatabase } from "@/providers/database-provider";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  videos: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Each video must have a title." }),
        videoUri: z.string().min(1, { message: "Each video must have a video file URI." }),
        thumbUri: z.string().min(1, { message: "Each video must have a thumb file URI." }),
      })
    )
    .min(1, { message: "Must have at least one video." }),
});

export default function VideoForm() {
  const { db } = useDatabase();

  const ref = useRef(null);
  useScrollToTop(ref);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videos: [
        {
          title: "",
          videoUri: "",
          thumbUri: "",
        },
      ],
    },
  });

  async function selectVideoFiles(
    setVideoFields: (videos: { title: string; videoUri: string; thumbUri: string }[]) => void
  ) {
    await ensureDirectory(VIDEOS_DIR);
    if (!(await requestPermissions())) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      multiple: true,
    });

    if (result.assets && result.assets.length) {
      const videos = await Promise.all(
        result.assets.map(async ({ uri, name }) => {
          const videoUri = `${VIDEOS_DIR}${name}`;
          await FileSystem.copyAsync({ from: uri, to: videoUri });

          const { uri: thumbFileUri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
            time: 1000,
          });

          const thumbUri = `${VIDEOS_DIR}${name.replace(/\.[^/.]+$/, ".jpg")}`;
          await FileSystem.moveAsync({ from: thumbFileUri, to: thumbUri });

          return { title: name, videoUri, thumbUri };
        })
      );

      setVideoFields(videos);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;

    try {
      await db.transaction(async (tx) => {
        for (const video of values.videos) {
          await tx.insert(videos).values({
            title: video.title,
            videoUri: video.videoUri,
            thumbUri: video.thumbUri,
          });
        }
      });

      toast.success("Videos added successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error submitting form.");
    }

    form.reset();
  }

  console.log(form.getValues("videos"));

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
            <View className="mb-8">
              <View className="flex-1">
                <FormField
                  control={form.control}
                  name="videos"
                  render={({ field }) => (
                    <View>
                      <Button
                        variant="secondary"
                        onPress={async () =>
                          await selectVideoFiles((videos) => {
                            videos.forEach((video, index) => {
                              form.setValue(`videos.${index}.videoUri`, video.videoUri);
                              form.setValue(`videos.${index}.thumbUri`, video.thumbUri);
                              form.setValue(`videos.${index}.title`, video.title);
                            });
                          })
                        }>
                        <View className="flex flex-row items-center gap-2">
                          <FileVideoIcon
                            className="text-teal-500"
                            size={20}
                            strokeWidth={1.25}
                          />
                          <Text>{field.value.length > 0 ? "Replace" : "Upload"}</Text>
                        </View>
                      </Button>
                      {/* <Text
                              numberOfLines={1}
                              className="pt-1 text-sm text-muted-foreground">
                              {field.value}
                            </Text> */}
                    </View>
                  )}
                />
              </View>
            </View>
            <View className="ml-auto">
              <Button
                onPress={form.handleSubmit(onSubmit)}
                className="bg-teal-500">
                <Text>Submit</Text>
              </Button>
            </View>
          </Form>
        </View>
      </ScrollView>
    </View>
  );
}
