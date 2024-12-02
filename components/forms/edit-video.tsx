import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import * as z from "zod";

import { VideoMeta } from "@/db/schema";
import { orientationOptions } from "@/lib/constants";
import { RefreshCcwIcon } from "@/lib/icons";
import { useVideoStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput, FormSelect, FormSwitch } from "@/components/ui/form";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters." })
    .transform((val) => val.trim()),
  orientation: z.object(
    { value: z.string(), label: z.string() },
    {
      invalid_type_error: "Please select a favorite email.",
    }
  ),
  isFavorite: z.boolean(),
  createdAt: z.string().min(1),
});

interface EditFormProps {
  videoInfo: VideoMeta;
}

export default function EditVideoForm({ videoInfo }: EditFormProps) {
  const [selectTriggerWidth, setSelectTriggerWidth] = useState(0);

  const updateVideo = useVideoStore((state) => state.updateVideo);
  const insets = useSafeAreaInsets();
  const ref = useRef(null);
  useScrollToTop(ref);

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: videoInfo.title ?? "",
      orientation: {
        label: videoInfo.orientation ?? "",
        value: videoInfo.orientation ?? "",
      },
      isFavorite: videoInfo.isFavorite ?? false,
      createdAt: videoInfo.createdAt ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const parsedValues = formSchema.parse(values);

      await updateVideo({
        id: videoInfo.id,
        values: { ...parsedValues, orientation: values.orientation.value },
      });

      toast.success(`${values.title} updated successfully.`);

      if (router.canDismiss()) {
        router.dismissAll();
      }
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
                  style={{ width: 375, height: 250 }}
                  source={{ uri: videoInfo.thumbUri }}
                  resizeMode={form.watch("orientation.value") === "Portrait" ? "contain" : "cover"}
                  className="overflow-hidden rounded-md bg-secondary"
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
                  name="orientation"
                  render={({ field }) => (
                    <FormSelect
                      label="Orientation"
                      {...field}>
                      <SelectTrigger
                        onLayout={(ev) => {
                          setSelectTriggerWidth(ev.nativeEvent.layout.width);
                        }}>
                        <SelectValue
                          className={cn(
                            "native:text-lg text-sm",
                            field.value ? "text-foreground" : "text-muted-foreground"
                          )}
                          placeholder="Select an orientation"
                        />
                      </SelectTrigger>
                      <SelectContent
                        insets={contentInsets}
                        style={{ width: selectTriggerWidth }}>
                        <SelectGroup>
                          {orientationOptions.map((orientation) => (
                            <SelectItem
                              key={orientation.value}
                              label={orientation.label}
                              value={orientation.value}>
                              <Text>{orientation.label}</Text>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </FormSelect>
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

                {/* <FormField
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <FormDatePicker
                      label="Created at"
                      maxDate={new Date().toDateString()}
                      {...field}
                    />
                  )}
                /> */}
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
