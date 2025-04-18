import { router } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { EditPlaylistInfo } from "@/app/(modals)/playlists/edit/[id]";
import { SaveIcon } from "@/lib/icons";
import { usePlaylistStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Form, FormCombobox, FormField, FormInput, FormTextarea } from "@/components/ui/form";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  id: z.string(),
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
        value: z.string().min(1),
        label: z.string().min(1),
      })
    )
    .nonempty({ message: "Must select at least one video." })
    .refine((videos) => videos.some((video) => video.value && video.label), {
      message: "Must select at least one video.",
    }),
});

export type EditPlaylistFormData = z.infer<typeof formSchema>;

interface EditPlaylistFormProps {
  editPlaylistInfo: EditPlaylistInfo;
}

export default function EditPlaylistForm({ editPlaylistInfo }: EditPlaylistFormProps) {
  const updatePlaylist = usePlaylistStore((state) => state.updatePlaylist);
  const ref = useRef(null);
  useScrollToTop(ref);

  const form = useForm<EditPlaylistFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: editPlaylistInfo.id,
      title: editPlaylistInfo.title,
      description: editPlaylistInfo.description,
      videos: editPlaylistInfo.selectedVideos,
    },
  });

  async function onSubmit(values: EditPlaylistFormData) {
    try {
      const parsedValues = formSchema.parse(values);
      await updatePlaylist({ id: editPlaylistInfo.id, values: parsedValues });
      toast.success(`${values.title} playlist updated successfully.`);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.push("/(tabs)/playlists");
    } catch (error) {
      console.error(error);
      toast.error("Error updating playlist!");
    }
  }

  function handleErrors(errors: FieldErrors<EditPlaylistFormData>) {
    const errorMessage = errors?.videos?.root?.message ? errors.videos.root.message : undefined;

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  return (
    <Form {...form}>
      <View className="flex-1 gap-7">
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
                items={editPlaylistInfo.allVideos}
                {...field}
              />
            )}
          />
        </View>
      </View>

      <View className="flex-1">
        <Button
          className="bg-teal-600"
          size="lg"
          onPress={form.handleSubmit(onSubmit, handleErrors)}>
          <View className="flex-row items-center gap-4">
            <SaveIcon
              className="text-white"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider text-white">
              Save playlist
            </Text>
          </View>
        </Button>
      </View>
    </Form>
  );
}
