import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { getVideoInfoAsync } from "expo-video-metadata";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback } from "react";
import { View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";

import { VIDEOS_DIR } from "@/lib/constants";
import { CircleXIcon, CloudUploadIcon, ImportIcon } from "@/lib/icons";
import { useSecurityStore, useVideoStore } from "@/lib/store";
import { ensureDirectory, requestPermissions } from "@/lib/upload";
import { formatDuration, formatFileSize, getOrientation, splitFilename } from "@/lib/utils";

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
        fileExtension: z.string().min(1),
        duration: z.string().min(1),
        fileSize: z.string().min(1),
        orientation: z.string().min(1),
        orientationFull: z.string().min(1),
        width: z.number().min(1),
        height: z.number().min(1),
        fps: z.number().min(1),
        hasAudio: z.boolean(),
        videoCodec: z.string().min(1),
        audioCodec: z.string().min(1),
      })
    )
    .min(1),
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

  const form = useForm<UploadVideosFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videos: [
        {
          title: "",
          videoUri: "",
          thumbUri: "",
          fileExtension: "",
          duration: "",
          fileSize: "",
          orientation: "",
          orientationFull: "",
          width: undefined,
          height: undefined,
          fps: undefined,
          hasAudio: undefined,
          videoCodec: "",
          audioCodec: "",
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
        fileExtension: string;
        duration: string;
        fileSize: string;
        orientation: string;
        orientationFull: string;
        width: number;
        height: number;
        fps: number;
        hasAudio: boolean;
        videoCodec: string;
        audioCodec: string;
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
            const filename = splitFilename(name);
            const title = filename[0];
            const fileExtension = filename[1];
            const thumbUri = `${VIDEOS_DIR}${title}.jpg`;

            const videoMeta = await getVideoInfoAsync(uri);
            const duration = formatDuration(videoMeta.duration);
            const fileSize = formatFileSize(videoMeta.fileSize);
            const orientation = getOrientation(videoMeta.orientation);

            return {
              title,
              videoUri: uri,
              thumbUri,
              fileExtension,
              duration,
              fileSize,
              orientation,
              orientationFull: videoMeta.orientation ?? "unknown",
              width: videoMeta.width,
              height: videoMeta.height,
              fps: videoMeta.fps,
              hasAudio: !!videoMeta.hasAudio,
              videoCodec: videoMeta.codec ?? "unknown",
              audioCodec: videoMeta.audioCodec ?? "unknown",
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
      const processedVideos = await Promise.all(
        values.videos.map(async (video) => {
          const newVideoUri = `${VIDEOS_DIR}${video.title}.${video.fileExtension}`;
          await FileSystem.copyAsync({ from: video.videoUri, to: newVideoUri });

          const { uri: tempThumbUri } = await VideoThumbnails.getThumbnailAsync(newVideoUri, {
            time: 3000,
          });
          await FileSystem.moveAsync({ from: tempThumbUri, to: video.thumbUri });

          return {
            ...video,
            videoUri: newVideoUri,
          };
        })
      );

      await uploadVideos(processedVideos);

      const message = `Video${values.videos.length > 1 ? "s" : ""} added successfully.`;
      toast.success(message);

      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Error submitting form.");

      handleReset();
    }
  }

  async function handleReset() {
    const prevVideos = form.getValues("videos");

    await Promise.all(
      prevVideos.map(async ({ videoUri, thumbUri }) => {
        try {
          if (videoUri && (await FileSystem.getInfoAsync(videoUri)).exists) {
            await FileSystem.deleteAsync(videoUri, { idempotent: true });
          }
          if (thumbUri && (await FileSystem.getInfoAsync(thumbUri)).exists) {
            await FileSystem.deleteAsync(thumbUri, { idempotent: true });
          }
        } catch (error) {
          console.error(error);
        } finally {
          form.reset();
        }
      })
    );
  }

  function handleErrors(errors: FieldErrors<UploadVideosFormData>) {
    const errorMessage = errors.videos?.message;

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  useFocusEffect(
    useCallback(() => {
      return () => handleReset();
    }, [])
  );

  const uploadedVideos = form.watch("videos");

  return (
    <Form {...form}>
      <View className="gap-8">
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

        <View className="flex-row items-center justify-center gap-4">
          <Button
            className="flex flex-1 flex-row items-center justify-center gap-4"
            variant="outline"
            size="lg"
            onPress={handleReset}>
            <View className="flex-row items-center gap-4">
              <CircleXIcon
                className="text-foreground"
                size={24}
                strokeWidth={1.5}
              />
              <Text className="native:text-base font-semibold uppercase tracking-wider text-foreground">
                Clear
              </Text>
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
                strokeWidth={1.5}
              />

              <Text className="native:text-base font-semibold uppercase tracking-wider text-white">
                Import
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </Form>
  );
}
