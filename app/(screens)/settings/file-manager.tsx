import { File } from "expo-file-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { ImageIcon, RefreshCwIcon, TrashIcon, VideoIcon } from "lucide-react-native";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { FileItem, FileType, getAllAppFiles } from "@/lib/app-files";
import { errorHandler } from "@/lib/error-handler";
import { useVideoStore } from "@/lib/store";
import { formatFileSize } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function FileManagerScreen() {
  const [videoFiles, setVideoFiles] = useState<FileItem[]>([]);
  const [imageFiles, setImageFiles] = useState<FileItem[]>([]);
  const [videoTotalSize, setVideoTotalSize] = useState("");
  const [imageTotalSize, setImageTotalSize] = useState("");
  const [totalSize, setTotalSize] = useState("");

  const sortedVideoData = useMemo(() => {
    const sorted = [...videoFiles];
    sorted.sort((a, b) => {
      const nameA = a.fullName.toLowerCase();
      const nameB = b.fullName.toLowerCase();
      return nameB.localeCompare(nameA);
    });
    return sorted;
  }, [videoFiles]);

  const sortedImageData = useMemo(() => {
    const sorted = [...imageFiles];
    sorted.sort((a, b) => {
      const nameA = a.fullName.toLowerCase();
      const nameB = b.fullName.toLowerCase();
      return nameB.localeCompare(nameA);
    });
    return sorted;
  }, [imageFiles]);

  const renderItem = useCallback(({ item }: { item: FileItem }) => {
    return (
      <View className="px-2">
        <FileListItem item={item} />
      </View>
    );
  }, []);

  async function refreshFiles() {
    const result = await getAllAppFiles();
    setVideoFiles(result.videoFiles);
    setImageFiles(result.imageFiles);
    setVideoTotalSize(result.videoTotalSize);
    setImageTotalSize(result.imageTotalSize);
    setTotalSize(result.totalSize);
  }

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const result = await getAllAppFiles();
      if (isMounted) {
        setVideoFiles(result.videoFiles);
        setImageFiles(result.imageFiles);
        setVideoTotalSize(result.videoTotalSize);
        setImageTotalSize(result.imageTotalSize);
        setTotalSize(result.totalSize);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="mx-auto mb-8 w-full max-w-md flex-1 px-4 py-8">
      <View className="mb-6 gap-4">
        <View className="flex-row items-center gap-2">
          <Text variant="h3">Total Usage:</Text>
          <Text
            variant="h3"
            className="text-brand-foreground">
            {totalSize}
          </Text>
        </View>

        <Button
          size="lg"
          className="flex flex-row items-center justify-center gap-3"
          onPress={refreshFiles}>
          <Icon
            as={RefreshCwIcon}
            className="text-background"
            size={20}
            strokeWidth={1.5}
          />
          <Text className="native:text-base font-semibold uppercase tracking-wider">
            Refresh Files
          </Text>
        </Button>
      </View>

      <Accordion
        type="single"
        collapsible
        className="w-full max-w-lg"
        defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <AccordionTriggerHeader
              fileCount={videoFiles.length}
              totalFileSize={videoTotalSize}
              fileType="video"
            />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col">
            <View style={{ height: sortedVideoData?.length ? 250 : 70, width: "100%" }}>
              <FlashList
                data={sortedVideoData}
                keyExtractor={(item) => item.uri}
                renderItem={renderItem}
                getItemType={() => "video-item"}
                contentContainerStyle={{
                  paddingTop: 20,
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<ListEmptyComponent fileType="video" />}
              />
            </View>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <AccordionTriggerHeader
              fileCount={imageFiles.length}
              totalFileSize={imageTotalSize}
              fileType="image"
            />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col">
            <View style={{ height: sortedImageData?.length ? 250 : 70, width: "100%" }}>
              <FlashList
                data={sortedImageData}
                keyExtractor={(item) => item.uri}
                renderItem={renderItem}
                getItemType={() => "image-item"}
                contentContainerStyle={{
                  paddingTop: 20,
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<ListEmptyComponent fileType="image" />}
              />
            </View>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}

function ListEmptyComponent({ fileType }: { fileType: FileType }) {
  return (
    <View className="p-1">
      <Text
        variant="h3"
        className="text-brand-foreground">
        No {fileType === "image" ? "image" : "video"} files found.
      </Text>
    </View>
  );
}

function AccordionTriggerHeader({
  fileCount,
  totalFileSize,
  fileType,
}: {
  fileCount: number;
  totalFileSize: string;
  fileType: FileType;
}) {
  return (
    <View className="flex-row items-center gap-5">
      <View className="flex-row items-center gap-2">
        <Icon
          as={fileType === "image" ? ImageIcon : VideoIcon}
          className="text-foreground"
          size={28}
          strokeWidth={1.5}
        />
        <Text className="text-xl font-semibold tracking-tight">
          {fileType === "image" ? "Image" : "Video"}s
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-sm text-muted-foreground">{`${fileCount} ${fileType === "image" ? "image" : "video"}${fileCount === 1 ? "" : "s"}`}</Text>
        <Text className="text-sm text-muted-foreground">·</Text>
        <Text className="text-sm text-muted-foreground">{totalFileSize}</Text>
      </View>
    </View>
  );
}

function FileListItem({ item }: { item: FileItem }) {
  const { findByUri, deleteVideo, updateVideo } = useVideoStore(
    useShallow((state) => ({
      findByUri: state.findByUri,
      deleteVideo: state.deleteVideo,
      updateVideo: state.updateVideo,
    }))
  );

  async function handleDelete() {
    try {
      const result = await findByUri({ fileUri: item.uri, fileType: item.type });
      if (!result) throw new Error("Failed to find associated file.");

      if (item.type === "video") {
        const { message, status } = await deleteVideo(result.id);

        if (status === "success") {
          toast.error(message);
        }
        return;
      } else if (item.type === "image") {
        const thumbFile = new File(item.uri);
        if (thumbFile.exists) {
          thumbFile.delete();
        }

        const { status } = await updateVideo({
          id: result.id,
          values: { thumbUri: null },
        });

        if (status === "success") {
          toast.error("Image successfully deleted.");
        }
        return;
      }

      throw new Error("Unsupported file type.");
    } catch (error) {
      toast.error(errorHandler(error));
    }
  }

  return (
    <View className="my-2 rounded-2xl bg-card p-3">
      <View className="flex flex-row items-center justify-between gap-4">
        <View className="flex flex-row items-center gap-2">
          <Icon
            as={item.type === "image" ? ImageIcon : VideoIcon}
            className="text-muted-foreground"
            size={16}
            strokeWidth={1.5}
          />
          <Text>{formatFileSize(item.size)}</Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost">
                <Icon
                  as={TrashIcon}
                  className="text-destructive"
                  size={16}
                  strokeWidth={1.5}
                />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  <Text>This will delete the </Text>
                  <Text
                    className="font-semibold text-destructive"
                    numberOfLines={1}>
                    “{item.fullName}”
                  </Text>
                  <Text> video permanently.</Text>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onPress={handleDelete}>
                  <Text className="text-destructive-foreground">Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </View>
      <Text className="text-brand-foreground">{item.fullName}</Text>
      <Text className="text-muted-foreground">{item.directoryPath}</Text>
    </View>
  );
}
