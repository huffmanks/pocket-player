import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRef } from "react";
import { ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { useDatabase } from "@/db/provider";
import { videos } from "@/db/schema";
import { VIDEOS_DIR } from "@/lib/constants";
import { FileVideoIcon, PlusIcon, TrashIcon } from "@/lib/icons";
import { ensureDirectory, requestPermissions } from "@/lib/upload";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  videos: z
    .array(
      z.object({
        title: z.string().min(3, { message: "Title must be at least 3 characters." }),
        videoUri: z.string().min(1, { message: "Must have at file uploaded." }),
        thumbUri: z.string().min(1, { message: "Must have at file uploaded." }),
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

  async function selectVideoFile(
    setFileUris: (uris: { videoUri: string; thumbUri: string }) => void
  ) {
    await ensureDirectory(VIDEOS_DIR);
    if (!(await requestPermissions())) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      multiple: false,
    });

    if (result.assets && result.assets.length) {
      const { uri, name } = result.assets[0];
      const videoUri = `${VIDEOS_DIR}${name}`;
      await FileSystem.copyAsync({ from: uri, to: videoUri });

      const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000 });

      const thumbFileUri = `${VIDEOS_DIR}${name.replace(/\.[^/.]+$/, ".jpg")}`;
      await FileSystem.moveAsync({ from: thumbUri, to: thumbFileUri });

      setFileUris({ videoUri, thumbUri });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;

    await db.transaction(async (tx) => {
      for (const video of values.videos) {
        await tx.insert(videos).values({
          title: video.title,
          videoUri: video.videoUri,
          thumbUri: video.thumbUri,
        });
      }
    });

    form.reset();
  }

  const { fields, append, remove } = useFieldArray({ name: "videos", control: form.control });

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
              {fields.map((field, index) => (
                <View
                  key={`video-form-${index}`}
                  className="mb-6">
                  <Text className="mb-2 text-lg font-semibold">Video {index + 1}</Text>

                  <View
                    key={field.id}
                    className="mb-6 flex w-full flex-row items-end gap-4">
                    <View className="flex-1">
                      <FormField
                        control={form.control}
                        name={`videos.${index}.title`}
                        render={({ field }) => (
                          <View>
                            <FormInput
                              label="Title"
                              autoFocus={false}
                              selectTextOnFocus={true}
                              placeholder="Add video title"
                              autoCapitalize="none"
                              {...field}
                            />
                            <Text className="pt-1 text-sm"></Text>
                          </View>
                        )}
                      />
                    </View>
                    <View className="flex-1">
                      <FormField
                        control={form.control}
                        name={`videos.${index}.videoUri`}
                        render={({ field }) => (
                          <View>
                            <Button
                              variant="secondary"
                              onPress={() =>
                                selectVideoFile(({ videoUri, thumbUri }) => {
                                  field.onChange(videoUri);
                                  form.setValue(`videos.${index}.thumbUri`, thumbUri);
                                })
                              }>
                              <View className="flex flex-row items-center gap-2">
                                <FileVideoIcon
                                  className="text-teal-500"
                                  size={20}
                                  strokeWidth={1.25}
                                />
                                <Text>{field.value ? "Replace" : "Upload"}</Text>
                              </View>
                            </Button>
                            <Text
                              numberOfLines={1}
                              className="pt-1 text-sm text-muted-foreground">
                              {field.value}
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                    <View>
                      <Button
                        className={cn(
                          "native:p-2 group p-2 web:hover:bg-destructive",
                          fields.length === 1 && "invisible"
                        )}
                        variant="ghost"
                        disabled={fields.length === 1}
                        onPress={() => remove(index)}>
                        <TrashIcon
                          className="text-destructive group-hover:text-foreground"
                          size={20}
                          strokeWidth={1.25}
                        />
                      </Button>
                      <Text className="pt-1 text-sm"></Text>
                    </View>
                  </View>

                  <Separator />
                </View>
              ))}

              <Button
                variant="secondary"
                size="circle"
                onPress={() => append({ title: "", videoUri: "", thumbUri: "" })}>
                <PlusIcon
                  className="text-teal-500"
                  size={28}
                  strokeWidth={2}
                />
              </Button>
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
