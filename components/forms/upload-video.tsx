import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRef } from "react";
import { ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { VIDEOS_DIR } from "@/lib/constants";
import { FileVideoIcon, SendIcon } from "@/lib/icons";
import { useVideoStore } from "@/lib/store";
import { ensureDirectory, requestPermissions } from "@/lib/upload";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  videos: z
    .array(
      z.object({
        title: z.string().min(1),
        videoUri: z.string().min(1),
        thumbUri: z.string().min(1),
      })
    )
    .nonempty({ message: "Must upload at least one video." })
    .refine((videos) => videos.some((video) => video.title && video.videoUri && video.thumbUri), {
      message: "Must upload at least one video.",
    }),
});

export type UploadVideosFormData = z.infer<typeof formSchema>;

export default function UploadForm() {
  const { uploadVideos } = useVideoStore();

  const ref = useRef(null);
  useScrollToTop(ref);

  const form = useForm<UploadVideosFormData>({
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

          const title = name.replace(/(\.[^/.]+)$/, "");

          return { title, videoUri, thumbUri };
        })
      );

      setVideoFields(videos);
    }
  }

  async function onSubmit(values: UploadVideosFormData) {
    try {
      await uploadVideos(values);
      toast.success("Videos added successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error submitting form.");
    }

    form.reset();

    router.push("/");
  }

  function handleErrors(errors: FieldErrors<UploadVideosFormData>) {
    const errorMessage = errors.videos?.message;

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  const uploadedVideos = form.watch("videos");

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
              <View className="flex-1">
                <FormField
                  control={form.control}
                  name="videos"
                  render={({ field }) => (
                    <View className="justify-center rounded-md bg-secondary">
                      <Button
                        className="p-8"
                        variant="ghost"
                        size="unset"
                        onPress={async () =>
                          await selectVideoFiles((videos) => {
                            videos.forEach((video, index) => {
                              form.setValue(`videos.${index}.videoUri`, video.videoUri);
                              form.setValue(`videos.${index}.thumbUri`, video.thumbUri);
                              form.setValue(`videos.${index}.title`, video.title);
                            });
                          })
                        }>
                        <View className="items-center justify-center gap-4">
                          <FileVideoIcon
                            className="text-teal-500"
                            size={40}
                            strokeWidth={1.5}
                          />
                          <Text className="native:text-xl">Upload</Text>
                        </View>
                      </Button>
                      {uploadedVideos[0].videoUri && (
                        <View className="flex-1 gap-2 px-4 pb-8">
                          {uploadedVideos.map((item) => (
                            <Text
                              key={`upload-video_${item.videoUri}`}
                              numberOfLines={1}
                              className="text-muted-foreground">
                              {item.title}: {item.videoUri}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                />
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
