import { router } from "expo-router";
import { useRef } from "react";
import { Image, ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { eq } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { VideoInfo } from "@/app/(modals)/videos/edit/[id]";
import { videos } from "@/db/schema";
import { RefreshCcwIcon } from "@/lib/icons";
import { useDatabase } from "@/providers/database-provider";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput, FormSwitch, FormTextarea } from "@/components/ui/form";
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
  isFavorite: z.boolean(),
});

interface EditFormProps {
  videoInfo: VideoInfo;
}

export default function EditVideoForm({ videoInfo }: EditFormProps) {
  const { db } = useDatabase();

  const ref = useRef(null);
  useScrollToTop(ref);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: videoInfo.title ?? "",
      description: videoInfo.description ?? "",
      isFavorite: videoInfo.isFavorite ?? false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;

    try {
      const parsedValues = formSchema.parse(values);

      await db.transaction(async (tx) => {
        await tx
          .update(videos)
          .set({
            title: parsedValues.title,
            description: parsedValues.description,
            isFavorite: parsedValues.isFavorite,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(videos.id, videoInfo.videoId));
      });

      toast.success(`${values.title} updated successfully.`);

      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error(`Error updating ${values.title}!`);
    }
  }

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
                <Image
                  style={{ width: 375, height: 125 }}
                  source={{ uri: videoInfo.thumbUri }}
                  resizeMode="cover"
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormInput
                      label="Title"
                      autoFocus={false}
                      selectTextOnFocus={true}
                      placeholder="Add a video title..."
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

                <FormField
                  control={form.control}
                  name="isFavorite"
                  render={({ field }) => (
                    <FormSwitch
                      label="Add to favorites?"
                      {...field}
                    />
                  )}
                />
              </View>
            </View>
            <View>
              <Button
                className="bg-teal-600"
                size="lg"
                onPress={form.handleSubmit(onSubmit)}>
                <View className="flex-row items-center gap-4">
                  <RefreshCcwIcon
                    className="text-white"
                    size={28}
                    strokeWidth={1.25}
                  />
                  <Text className="native:text-base text-white">Update</Text>
                </View>
              </Button>
            </View>
          </Form>
        </View>
      </ScrollView>
    </View>
  );
}
