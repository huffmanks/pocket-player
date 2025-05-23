import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { VideoData } from "@/app/(screens)/playlists/create";
import { ListMusicIcon } from "@/lib/icons";
import { usePlaylistStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Form, FormCombobox, FormField, FormInput, FormTextarea } from "@/components/ui/form";
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
        value: z.string(),
        label: z.string(),
      })
    )
    .nonempty({ message: "Must select at least one video." }),
});

export type CreatePlaylistFormData = z.infer<typeof formSchema>;

interface CreatePlaylistFormProps {
  videoData: VideoData[];
}

const defaultValues = {
  title: "",
  description: "",
  videos: [],
};

export default function CreatePlaylistForm({ videoData }: CreatePlaylistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addPlaylist = usePlaylistStore((state) => state.addPlaylist);

  const form = useForm<CreatePlaylistFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: CreatePlaylistFormData) {
    try {
      setIsSubmitting(true);
      const parsedValues = formSchema.parse(values);

      const { message, status } = await addPlaylist(parsedValues);

      if (status === "success") {
        toast.success(`${values.title} playlist created successfully.`);
        router.push("/(tabs)/playlists");
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Error creating playlist!");
    } finally {
      setIsSubmitting(false);
      form.reset(defaultValues);
    }
  }

  return (
    <Form {...form}>
      <View className="mb-12 gap-7">
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
          <FormField
            control={form.control}
            name="videos"
            render={({ field }) => (
              <FormCombobox
                label="Videos"
                description="Select videos to be included in the playlist."
                placeholder="Select videos"
                emptyText="No videos found."
                items={videoData}
                {...field}
              />
            )}
          />
        </View>
      </View>

      <View>
        <Button
          disabled={isSubmitting}
          className="bg-brand"
          size="lg"
          onPress={form.handleSubmit(onSubmit)}>
          <View className="flex-row items-center gap-4">
            <ListMusicIcon
              className="text-white"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider text-white">
              Create playlist
            </Text>
          </View>
        </Button>
      </View>
    </Form>
  );
}
