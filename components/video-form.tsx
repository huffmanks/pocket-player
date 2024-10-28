import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useFieldArray, useForm } from "react-hook-form";
import { View } from "react-native";
import * as z from "zod";

import { useDatabase } from "@/db/provider";
import { videos } from "@/db/schema";
import { FileVideoIcon, PlusIcon, TrashIcon } from "@/lib/icons";
import { ensureDirectory, requestPermissions } from "@/lib/upload";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

const VIDEOS_DIR = `${FileSystem.documentDirectory}videos/`;

const formSchema = z.object({
  videos: z
    .array(
      z.object({
        title: z.string().min(3, { message: "Title must be at least 3 characters." }),
        fileUri: z.string().min(1, { message: "Must have at file uploaded." }),
      })
    )
    .min(1, { message: "Must have at least one video." }),
});

export default function VideoForm() {
  const { db } = useDatabase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videos: [
        {
          title: "",
          fileUri: "",
        },
      ],
    },
  });

  async function selectVideoFile(setFileUri: (uri: string) => void) {
    await ensureDirectory(VIDEOS_DIR);
    if (!(await requestPermissions())) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      multiple: false,
    });

    if (result.assets && result.assets.length) {
      const { uri, name } = result.assets[0];
      const fileUri = `${VIDEOS_DIR}${name}`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      setFileUri(fileUri);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;

    await db.transaction(async (tx) => {
      for (const video of values.videos) {
        await tx.insert(videos).values({ title: video.title, fileUri: video.fileUri });
      }
    });

    form.reset();
  }

  const { fields, append, remove } = useFieldArray({ name: "videos", control: form.control });

  return (
    <Form {...form}>
      <View className="mb-8">
        {fields.map((field, index) => (
          <View
            key={`video-form-${index}`}
            className="mb-4">
            <Text className="mb-2 text-lg font-semibold">Video {index + 1}</Text>

            <View
              key={field.id}
              className="flex w-full flex-row items-end gap-4">
              <View className="flex-1">
                <FormField
                  control={form.control}
                  name={`videos.${index}.title`}
                  render={({ field }) => (
                    <View>
                      <FormInput
                        label="Title"
                        placeholder="Add video title"
                        autoCapitalize="none"
                        {...field}
                      />
                      <Text className="pt-1 text-sm"></Text>
                    </View>
                  )}
                />
              </View>
              <View className="flex">
                <FormField
                  control={form.control}
                  name={`videos.${index}.fileUri`}
                  render={({ field }) => (
                    <View>
                      <Button
                        variant="secondary"
                        onPress={() => selectVideoFile(field.onChange)}>
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
                  className={cn(fields.length === 1 && "invisible")}
                  variant="destructive"
                  disabled={fields.length === 1}
                  onPress={() => remove(index)}>
                  <TrashIcon
                    className="text-foreground"
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
          className="flex items-center justify-center gap-2"
          onPress={() => append({ title: "", fileUri: "" })}>
          <View className="flex flex-row items-center gap-2">
            <PlusIcon
              className="text-teal-500"
              size={28}
              strokeWidth={1.25}
            />
            <Text>Add more</Text>
          </View>
        </Button>
      </View>
      <Button
        onPress={form.handleSubmit(onSubmit)}
        className="bg-teal-500">
        <Text>Submit</Text>
      </Button>
    </Form>
  );
}
