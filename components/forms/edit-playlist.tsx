import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";

import { EditPlaylistInfo } from "@/app/(screens)/playlists/[id]/edit";
import { SaveIcon, TrashIcon } from "@/lib/icons";
import { usePlaylistStore } from "@/lib/store";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
        value: z.string(),
        label: z.string(),
      })
    )
    .nonempty({ message: "Must select at least one video." }),
});

export type EditPlaylistFormData = z.infer<typeof formSchema>;

interface EditPlaylistFormProps {
  editPlaylistInfo: EditPlaylistInfo;
}

export default function EditPlaylistForm({ editPlaylistInfo }: EditPlaylistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePlaylist, deletePlaylist } = usePlaylistStore(
    useShallow((state) => ({
      updatePlaylist: state.updatePlaylist,
      deletePlaylist: state.deletePlaylist,
    }))
  );

  const form = useForm<EditPlaylistFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: editPlaylistInfo.id,
      title: editPlaylistInfo.title,
      description: editPlaylistInfo.description,
      videos: editPlaylistInfo.selectedVideos,
    },
  });

  async function handleDelete() {
    try {
      const { message, status } = await deletePlaylist(editPlaylistInfo.id);

      if (status === "success") {
        toast.error(message);
        router.push("/(tabs)/playlists");
      }
    } catch (error) {
      toast.error("Failed to delete playlist.");
    }
  }

  async function onSubmit(values: EditPlaylistFormData) {
    try {
      setIsSubmitting(true);
      const parsedValues = formSchema.parse(values);
      await updatePlaylist({ id: editPlaylistInfo.id, values: parsedValues });
      toast.success(`${values.title} playlist updated successfully.`);

      router.dismissTo(`/(screens)/playlists/${editPlaylistInfo.id}/view`);
    } catch (error) {
      toast.error("Error updating playlist!");
    } finally {
      setIsSubmitting(false);
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
                items={editPlaylistInfo.allVideos}
                {...field}
              />
            )}
          />
        </View>
      </View>

      <View className="flex-row items-center gap-4">
        <View className="flex-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isSubmitting}
                variant="destructive"
                size="lg"
                className="flex w-full flex-row items-center justify-center gap-4">
                <TrashIcon
                  className="text-destructive-foreground"
                  size={24}
                  strokeWidth={1.5}
                />
                <Text className="native:text-base font-semibold uppercase tracking-wider text-destructive-foreground">
                  Delete
                </Text>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  <Text>This will delete the </Text>
                  <Text className="font-semibold">“{editPlaylistInfo.title}”</Text>
                  <Text> playlist permanently.</Text>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction onPress={handleDelete}>
                  <Text>Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>

        <View className="flex-1">
          <Button
            disabled={isSubmitting}
            size="lg"
            className="flex w-full flex-row items-center justify-center gap-4 bg-brand"
            onPress={form.handleSubmit(onSubmit)}>
            <SaveIcon
              className="text-white"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider text-white">
              Save
            </Text>
          </Button>
        </View>
      </View>
    </Form>
  );
}
