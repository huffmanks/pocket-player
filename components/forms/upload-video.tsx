import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { getVideoInfoAsync } from "expo-video-metadata";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback } from "react";
import { View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";

import { VIDEOS_DIR } from "@/lib/constants";
import { CircleXIcon, CloudUploadIcon, ImportIcon } from "@/lib/icons";
import { useSecurityStore, useVideoStore } from "@/lib/store";
import {
  delay,
  formatDuration,
  formatFileSize,
  getOrientation,
  getResolutionLabel,
  splitFilename,
} from "@/lib/utils";

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
        fileSize: z.number().positive(),
        fileSizeLabel: z.string().min(1),
        duration: z.number().positive(),
        durationLabel: z.string().min(1),
        orientation: z.string().min(1),
        width: z.number().positive(),
        height: z.number().positive(),
        resolution: z.string().min(1),
        fps: z.number().positive(),
        hasAudio: z.boolean(),
        videoCodec: z.string().nullable(),
        audioCodec: z.string().nullable(),
      })
    )
    .min(1, { message: "Must select at least one video." }),
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
      videos: [],
    },
  });

  const uploadedVideos = useWatch({
    control: form.control,
    name: "videos",
    defaultValue: [],
  });

  async function selectVideoFiles(
    setVideoFields: (
      videos: {
        title: string;
        videoUri: string;
        thumbUri: string;
        fileExtension: string;
        fileSize: number;
        fileSizeLabel: string;
        duration: number;
        durationLabel: string;
        orientation: string;
        width: number;
        height: number;
        resolution: string;
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

      const videosDir = new Directory(Paths.document, "videos");
      if (!videosDir.exists) {
        videosDir.create();
      }

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

            const durationLabel = formatDuration(videoMeta.duration);
            const fileSize = videoMeta.fileSize;
            const fileSizeLabel = formatFileSize(fileSize);
            const width = videoMeta.width;
            const height = videoMeta.height;
            const orientation = getOrientation({ width, height });
            const resolution = getResolutionLabel({ width, height });

            return {
              title,
              videoUri: uri,
              thumbUri,
              fileExtension,
              fileSize,
              fileSizeLabel,
              duration: videoMeta.duration,
              durationLabel,
              orientation,
              width,
              height,
              resolution,
              fps: videoMeta.fps,
              hasAudio: !!videoMeta.hasAudio,
              videoCodec: videoMeta.codec ?? null,
              audioCodec: videoMeta.audioCodec ?? null,
            };
          })
        );

        setVideoFields(videos);
      }
    } catch (_error) {
      toast.error("Error trying to upload!");
    } finally {
      await delay(100);
      setIsLockDisabled(false);
      setIsLocked(false);
    }
  }

  const handleReset = useCallback(() => {
    const prevVideos = form.getValues("videos");

    prevVideos.forEach(({ title, fileExtension }) => {
      try {
        const cacheVideoFile = new File(Paths.cache, `${title}.${fileExtension}`);

        if (cacheVideoFile.exists) {
          cacheVideoFile.delete();
        }
      } catch (_error) {}
    });

    form.reset();
  }, [form]);

  async function onSubmit(values: UploadVideosFormData) {
    const videosDir = new Directory(Paths.document, "videos");
    if (!videosDir.exists) {
      videosDir.create();
    }

    const promise = (async () => {
      const processedVideos = await Promise.all(
        values.videos.map(async (video) => {
          const sourceVideoFile = new File(video.videoUri);
          const targetVideoFile = new File(`${VIDEOS_DIR}${video.title}.${video.fileExtension}`);

          sourceVideoFile.copy(targetVideoFile);

          const { uri: tempThumbUri } = await VideoThumbnails.getThumbnailAsync(
            targetVideoFile.uri,
            {
              time: 3000,
            }
          );

          const tempThumbFile = new File(tempThumbUri);
          const targetThumbFile = new File(video.thumbUri);

          tempThumbFile.move(targetThumbFile);

          return {
            ...video,
            videoUri: targetVideoFile.uri,
          };
        })
      );

      await uploadVideos(processedVideos);

      return {
        message: `Video${values.videos.length > 1 ? "s" : ""} added successfully.`,
      };
    })();

    toast.promise(promise, {
      loading: "Uploading videos...",
      success: ({ message }) => message,
      error: "Failed to upload videos.",
    });

    promise.finally(handleReset);
  }

  function handleErrors(_errors: FieldErrors<UploadVideosFormData>) {
    toast.error("Something went wrong!");
  }

  useFocusEffect(
    useCallback(() => {
      return () => handleReset();
    }, [handleReset])
  );

  const isValid = uploadedVideos.length > 0;

  return (
    <Form {...form}>
      <View className="gap-8">
        <FormField
          control={form.control}
          name="videos"
          render={() => (
            <View className="justify-center rounded-lg border-[16px] border-primary-foreground bg-secondary">
              <View className="justify-center rounded-lg border border-dashed border-muted-foreground">
                <Button
                  className="p-12"
                  variant="ghost"
                  size="unset"
                  onPress={async () =>
                    await selectVideoFiles((videos) => {
                      // @ts-ignore
                      form.setValue("videos", videos, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
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
                      {uploadedVideos?.[0]?.thumbUri
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
            disabled={!isValid}
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
            disabled={!isValid}
            className="flex flex-1 flex-row items-center justify-center gap-4 bg-brand"
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
