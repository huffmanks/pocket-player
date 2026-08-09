import { Asset } from "expo-asset";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { useFocusEffect } from "expo-router";
import { getVideoInfoAsync } from "expo-video-metadata";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { CircleXIcon, CloudUploadIcon, ImportIcon } from "lucide-react-native";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";

import { VIDEOS_DIR } from "@/lib/constants";
import { useSecurityStore, useVideoStore } from "@/lib/store";
import {
  delay,
  formatDuration,
  formatFileSize,
  getOrientation,
  getResolutionLabel,
  parseFilenameDateAndTitle,
  splitFilename,
} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  videos: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        videoUri: z.string().min(1),
        thumbUri: z.string().min(1),
        fileName: z.string().min(1),
        fileExtension: z.string().min(1),
        fileSize: z.number().nonnegative(),
        fileSizeLabel: z.string().min(1),
        duration: z.number().nonnegative(),
        durationLabel: z.string().min(1),
        orientation: z.string().min(1),
        width: z.number().nonnegative(),
        height: z.number().nonnegative(),
        resolution: z.string().min(1),
        fps: z.number().nonnegative(),
        hasAudio: z.boolean(),
        videoCodec: z.string().nullable(),
        audioCodec: z.string().nullable(),
        createdAt: z.string().optional(),
      })
    )
    .min(1, { message: "Must select at least one video." }),
});

export type UploadVideosFormData = z.infer<typeof formSchema>;

export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

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

  function cleanupCacheFile(uri: string) {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch (_error) {}
  }

  async function selectVideoFiles(
    setVideoFields: (
      videos: {
        id: string;
        title: string;
        videoUri: string;
        thumbUri: string;
        fileName: string;
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
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length) {
        const videos = await Promise.all(
          result.assets.map(async ({ uri, name }) => {
            const filename = splitFilename(name);
            const rawTitle = filename[0];
            const fileExtension = filename[1];

            const fileId = createId();
            const { title, createdAt } = parseFilenameDateAndTitle(rawTitle);

            const thumbFile = new File(VIDEOS_DIR, `ppid_${fileId}.jpg`);

            const videoMeta = await getVideoInfoAsync(uri);

            const durationLabel = formatDuration(videoMeta.duration);
            const fileSize = videoMeta.fileSize;
            const fileSizeLabel = formatFileSize(fileSize);
            const width = videoMeta.width;
            const height = videoMeta.height;
            const orientation = getOrientation({ width, height });
            const resolution = getResolutionLabel({ width, height });

            return {
              id: fileId,
              fileName: `ppid_${fileId}.${fileExtension}`,
              title,
              videoUri: uri,
              thumbUri: thumbFile.uri,
              fileExtension,
              fileSize: videoMeta.fileSize ?? 0,
              fileSizeLabel,
              duration: videoMeta.duration ?? 0,
              durationLabel,
              orientation,
              width: videoMeta.width ?? 0,
              height: videoMeta.height ?? 0,
              resolution,
              fps: videoMeta.fps && videoMeta.fps > 0 ? videoMeta.fps : 30,
              hasAudio: !!videoMeta.hasAudio,
              videoCodec: videoMeta.codec ?? null,
              audioCodec: videoMeta.audioCodec ?? null,
              createdAt,
            };
          })
        );

        setVideoFields(videos);
      }
    } catch (_error: any) {
      toast.error("Error trying to upload!");
    } finally {
      await delay(100);
      setIsLockDisabled(false);
      setIsLocked(false);
    }
  }

  async function handleAddVideos() {
    if (isSubmittingRef.current) return;

    const prevVideos = form.getValues("videos");
    prevVideos.forEach((v) => cleanupCacheFile(v.videoUri));

    await selectVideoFiles((videos) => {
      // @ts-ignore
      form.setValue("videos", videos, { shouldDirty: true, shouldTouch: true });
    });
  }

  const handleReset = useCallback(() => {
    if (isSubmittingRef.current) return;

    const prevVideos = form.getValues("videos");
    prevVideos.forEach((v) => cleanupCacheFile(v.videoUri));

    form.reset();
  }, [form]);

  const onSubmit = useCallback(
    async (values: UploadVideosFormData) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      const videosDir = new Directory(Paths.document, "videos");
      if (!videosDir.exists) {
        videosDir.create();
      }

      const promise = (async () => {
        const placeholderAsset = Asset.fromModule(require("@/assets/images/video-placeholder.jpg"));
        await placeholderAsset.downloadAsync();

        const sharedPlaceholderFile = new File(VIDEOS_DIR, "_placeholder.jpg");
        if (!sharedPlaceholderFile.exists) {
          const assetUri = placeholderAsset.localUri || placeholderAsset.uri;
          if (assetUri && assetUri.startsWith("file://")) {
            const srcPlaceholder = new File(assetUri);
            await srcPlaceholder.copy(sharedPlaceholderFile);
          }
        }

        const processedVideos = [];

        for (const video of values.videos) {
          const sourceVideoFile = new File(video.videoUri);
          const targetVideoFile = new File(VIDEOS_DIR, video.fileName);

          if (targetVideoFile.exists) {
            targetVideoFile.delete();
          }

          await sourceVideoFile.copy(targetVideoFile);

          cleanupCacheFile(video.videoUri);

          const durationMs = video.duration > 1000 ? video.duration : video.duration * 1000;
          const safeTime =
            durationMs > 0 ? Math.min(3000, Math.max(0, Math.floor(durationMs / 2))) : 0;

          let finalThumbUri: string;

          try {
            const thumbResult = await VideoThumbnails.getThumbnailAsync(targetVideoFile.uri, {
              time: safeTime,
            });

            const targetThumbFile = new File(video.thumbUri);
            if (targetThumbFile.exists) {
              targetThumbFile.delete();
            }

            const tempThumbFile = new File(thumbResult.uri);
            await tempThumbFile.move(targetThumbFile);

            finalThumbUri = targetThumbFile.uri;
          } catch (_error) {
            finalThumbUri = sharedPlaceholderFile.uri;
          }

          processedVideos.push({
            ...video,
            videoUri: targetVideoFile.uri,
            thumbUri: finalThumbUri,
            ...(video.createdAt ? { createdAt: video.createdAt } : {}),
          });
        }

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

      promise.finally(() => {
        handleReset();
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      });
    },
    [handleReset, uploadVideos]
  );

  const handleErrors = useCallback((errors: FieldErrors<UploadVideosFormData>) => {
    const err = Object.values(errors.videos?.[0] || {})[0];
    const firstError =
      typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
        ? err.message
        : undefined;
    toast.error(firstError || "Form validation failed");
  }, []);

  const handleSubmitPress = useCallback(() => {
    form.handleSubmit(onSubmit, handleErrors)();
  }, [form, onSubmit, handleErrors]);

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
                  disabled={isSubmitting}
                  className="p-12"
                  variant="ghost"
                  size="unset"
                  onPress={handleAddVideos}>
                  <View className="items-center justify-center gap-2">
                    <Icon
                      as={CloudUploadIcon}
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
            disabled={!isValid || isSubmitting}
            className="flex flex-1 flex-row items-center justify-center"
            variant="outline"
            size="lg"
            onPress={handleReset}>
            <View className="flex-row items-center gap-2">
              <Icon
                as={CircleXIcon}
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
            disabled={!isValid || isSubmitting}
            variant="brand"
            size="lg"
            className="flex flex-1 flex-row items-center justify-center"
            onPress={handleSubmitPress}>
            <View className="flex-row items-center gap-2">
              <Icon
                as={ImportIcon}
                className="text-white"
                size={24}
                strokeWidth={1.5}
              />

              <Text className="native:text-base font-semibold uppercase tracking-wider">
                Import
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </Form>
  );
}
