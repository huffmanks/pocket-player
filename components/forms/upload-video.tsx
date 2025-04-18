import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router, useFocusEffect } from "expo-router";
import { getVideoInfoAsync } from "expo-video-metadata";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";

import { VIDEOS_DIR } from "@/lib/constants";
import { CircleXIcon, CloudUploadIcon, ImportIcon } from "@/lib/icons";
import { useSecurityStore, useVideoStore } from "@/lib/store";
import { ensureDirectory, requestPermissions } from "@/lib/upload";
import { formatDuration, formatFileSize, getOrientation } from "@/lib/utils";

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
        duration: z.string().min(1),
        fileSize: z.string().min(1),
        orientation: z.string().min(1),
      })
    )
    .nonempty({ message: "Must upload at least one video." })
    .refine(
      (videos) =>
        videos.some(
          (video) =>
            video.title &&
            video.videoUri &&
            video.thumbUri &&
            video.duration &&
            video.fileSize &&
            video.orientation
        ),
      {
        message: "Must upload at least one video.",
      }
    ),
});

export type UploadVideosFormData = z.infer<typeof formSchema>;

export default function UploadForm() {
  const uploadVideos = useVideoStore((state) => state.uploadVideos);

  const { setIsLocked, setIsLockDisabled } = useSecurityStore(
    useShallow((state) => ({
      setIsLocked: state.setIsLocked,
      setIsLockDisabled: state.setIsLockDisabled,
    }))
  );

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
          duration: "",
          fileSize: "",
          orientation: "",
        },
      ],
    },
  });

  async function selectVideoFiles(
    setVideoFields: (
      videos: {
        title: string;
        videoUri: string;
        thumbUri: string;
        duration: string;
        fileSize: string;
        orientation: string;
      }[]
    ) => void
  ) {
    try {
      setIsLocked(false);
      setIsLockDisabled(true);

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

            const title = name.replace(/\.[^/.]+$/, "");

            const thumbUri = `${VIDEOS_DIR}${title}.jpg`;
            await FileSystem.moveAsync({ from: thumbFileUri, to: thumbUri });

            const result = await getVideoInfoAsync(videoUri);

            const duration = formatDuration(result.duration);
            const fileSize = formatFileSize(result.fileSize);
            const orientation = getOrientation(result.width, result.height);

            return {
              title,
              videoUri,
              thumbUri,
              duration,
              fileSize,
              orientation,
            };
          })
        );

        setVideoFields(videos);
      }
    } catch (error) {
      toast.error("Error trying to upload!");
    } finally {
      setTimeout(() => {
        setIsLockDisabled(false);
        setIsLocked(false);
      }, 100);
    }
  }

  async function onSubmit(values: UploadVideosFormData) {
    try {
      await uploadVideos(values);
      const message = `Video${values.videos.length > 1 ? "s" : ""} added successfully.`;
      toast.success(message);

      form.reset();
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Error submitting form.");
    }
  }

  function handleErrors(errors: FieldErrors<UploadVideosFormData>) {
    const errorMessage = errors.videos?.message;

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  useFocusEffect(
    useCallback(() => {
      form.reset();
    }, [])
  );

  const uploadedVideos = form.watch("videos");

  return (
    <View className="relative h-full">
      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-lg px-3 py-4"
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
                    <View className="justify-center rounded-lg border-[16px] border-primary-foreground bg-secondary">
                      <View className="justify-center rounded-lg border border-dashed border-muted-foreground">
                        <Button
                          className="p-12"
                          variant="ghost"
                          size="unset"
                          onPress={async () =>
                            await selectVideoFiles((videos) => {
                              // @ts-ignore
                              form.setValue("videos", videos);
                            })
                          }>
                          <View className="items-center justify-center gap-2">
                            <CloudUploadIcon
                              className="text-foreground"
                              size={48}
                              strokeWidth={1.5}
                            />
                            <Text className="native:text-xl">Add videos</Text>
                            <Text className="native:text-base text-muted-foreground">
                              {uploadedVideos[0].thumbUri
                                ? `${uploadedVideos.length} video${uploadedVideos.length > 1 ? "s" : ""} imported`
                                : "Browse your video files"}
                            </Text>
                          </View>
                        </Button>
                      </View>
                    </View>
                  )}
                />
              </View>
            </View>
            <View className="flex-row items-center justify-center gap-4">
              <Button
                className="flex flex-1 flex-row items-center justify-center gap-4"
                variant="outline"
                size="lg"
                onPress={() => form.reset()}>
                <View className="flex-row items-center gap-4">
                  <CircleXIcon
                    className="text-foreground"
                    size={24}
                    strokeWidth={1.25}
                  />
                  <Text className="native:text-lg text-foreground">Clear</Text>
                </View>
              </Button>
              <Button
                className="flex flex-1 flex-row items-center justify-center gap-4 bg-teal-600"
                size="lg"
                onPress={form.handleSubmit(onSubmit, handleErrors)}>
                <View className="flex-row items-center gap-4">
                  <ImportIcon
                    className="text-white"
                    size={24}
                    strokeWidth={1.25}
                  />
                  <Text className="native:text-lg text-white">Import</Text>
                </View>
              </Button>
            </View>
          </Form>
        </View>
      </ScrollView>
    </View>
  );
}
