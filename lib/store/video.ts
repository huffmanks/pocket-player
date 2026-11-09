import { File } from "expo-file-system";

import { count, eq } from "drizzle-orm";
import { create } from "zustand";

import { VideoMeta, playlists, videos } from "@/db/schema";
import { FileType } from "@/lib/app-files";
import { errorHandler } from "@/lib/error-handler";
import { useDatabaseStore } from "@/lib/store/database";

import { UploadVideosFormData } from "@/components/forms/upload-video";

type VideoStoreState = {
  findByUri: ({
    fileUri,
    fileType,
  }: {
    fileUri: string;
    fileType: FileType;
  }) => Promise<typeof videos.$inferSelect | null>;
  uploadVideos: (
    uploadedVideos: UploadVideosFormData["videos"]
  ) => Promise<{ status: "success" | "error"; message: string }>;
  updateVideo: ({
    id,
    values,
  }: {
    id: string;
    values: Partial<VideoMeta>;
  }) => Promise<{ status: "success" | "error"; message: string }>;
  deleteVideo: (id: string) => Promise<{ status: "success" | "error"; message: string }>;
  toggleFavorite: (
    id: string
  ) => Promise<{ status: "success" | "error"; isFavorite?: boolean; message: string }>;
};

export const useVideoStore = create<VideoStoreState>(() => ({
  findByUri: async ({ fileUri, fileType }) => {
    try {
      const db = useDatabaseStore.getState().db;
      const targetColumn = fileType === "video" ? videos.videoUri : videos.thumbUri;

      const [foundVideo] = await db.select().from(videos).where(eq(targetColumn, fileUri)).limit(1);

      return foundVideo ?? null;
    } catch (_error) {
      return null;
    }
  },
  uploadVideos: async (uploadedVideos) => {
    try {
      const db = useDatabaseStore.getState().db;

      await db.transaction(async (tx) => {
        for (const video of uploadedVideos) {
          await tx.insert(videos).values(video);
        }
      });

      await db.select().from(videos);

      return { status: "success", message: "Videos successfully uploaded." };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  updateVideo: async ({ id, values }) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [updatedVideo] = await db
        .update(videos)
        .set(values)
        .where(eq(videos.id, id))
        .returning();

      return { status: "success", message: `Video ${updatedVideo.title} successfully updated.` };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  deleteVideo: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [deletedVideo] = await db.delete(videos).where(eq(videos.id, id)).returning();

      if (!deletedVideo) {
        return { status: "error", message: "Video not found." };
      }

      for (const uri of [deletedVideo.videoUri, deletedVideo?.thumbUri]) {
        if (uri) {
          try {
            const file = new File(uri);
            if (file.exists) {
              file.delete();
            }
          } catch (_error) {}
        }
      }

      const [{ count: totalVideos }] = await db.select({ count: count() }).from(videos);

      if (totalVideos === 0) {
        await db.delete(playlists);
      }

      return { status: "success", message: `Video ${deletedVideo.title} successfully deleted.` };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  toggleFavorite: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      const updatedFavoriteStatus = !video.isFavorite;
      await db.update(videos).set({ isFavorite: updatedFavoriteStatus }).where(eq(videos.id, id));

      return {
        status: "success",
        isFavorite: updatedFavoriteStatus,
        message: `Video ${video.title} has been ${updatedFavoriteStatus === true ? "favorited" : "unfavorited"}.`,
      };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
}));
