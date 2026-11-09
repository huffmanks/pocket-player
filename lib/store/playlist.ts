import { and, eq, inArray, notInArray } from "drizzle-orm";
import { create } from "zustand";

import { EditPlaylistInfo } from "@/app/(app)/(screens)/playlists/[id]/edit";
import { VideoMeta, playlistVideos, playlists, videos } from "@/db/schema";
import { errorHandler } from "@/lib/error-handler";
import { useDatabaseStore } from "@/lib/store/database";

import { CreatePlaylistFormData } from "@/components/forms/create-playlist";
import { EditPlaylistFormData } from "@/components/forms/edit-playlist";

type PlaylistStoreState = {
  addPlaylist: (
    values: CreatePlaylistFormData
  ) => Promise<{ status: "success" | "error"; message: string }>;
  updatePlaylist: ({
    id,
    values,
  }: {
    id: string;
    values: EditPlaylistFormData;
  }) => Promise<{ status: "success" | "error"; message: string }>;
  deletePlaylist: (id: string) => Promise<{ status: "success" | "error"; message: string }>;
  getPlaylistWithAllVideos: (playlistId: string) => Promise<EditPlaylistInfo>;
  toggleVideoInPlaylist: ({
    playlistId,
    videoId,
  }: {
    playlistId: string;
    videoId: string;
  }) => Promise<{ status: "success" | "error"; isAdded?: boolean; message: string }>;
  removeVideoFromPlaylist: ({
    playlistId,
    videoId,
  }: {
    playlistId?: string;
    videoId: string;
  }) => Promise<{ status: "success" | "error"; message: string }>;
  updatePlaylistOrder: ({
    playlistId,
    videosOrder,
  }: {
    playlistId: string;
    videosOrder: VideoMeta[];
  }) => Promise<{ status: "success" | "error"; message: string }>;
  syncVideoPlaylists: (videoId: string, playlists: { id: string }[]) => void;
};

export const usePlaylistStore = create<PlaylistStoreState>(() => ({
  addPlaylist: async (values) => {
    try {
      const db = useDatabaseStore.getState().db;

      const createdPlaylist = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(playlists)
          .values({
            title: values.title,
            description: values.description,
            updatedAt: new Date().toISOString(),
          })
          .returning();

        if (!created) throw new Error();

        const videoInserts = values.videos.map((video, index) =>
          tx.insert(playlistVideos).values({
            playlistId: created.id,
            videoId: video.value,
            order: index,
          })
        );

        await Promise.all(videoInserts);

        return created;
      });

      return {
        status: "success",
        message: `Playlist ${createdPlaylist.title} created successfully.`,
      };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  updatePlaylist: async ({ id, values }) => {
    try {
      const db = useDatabaseStore.getState().db;
      const updatedPlaylist = await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(playlists)
          .set({
            title: values.title,
            description: values.description,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(playlists.id, id))
          .returning();

        const selectedVideoIds = values.videos.map((video) => video.value);

        await tx
          .delete(playlistVideos)
          .where(
            and(
              eq(playlistVideos.playlistId, id),
              notInArray(playlistVideos.videoId, selectedVideoIds)
            )
          );

        const videoInserts = values.videos.map((video, index) =>
          tx
            .insert(playlistVideos)
            .values({
              playlistId: updated.id,
              videoId: video.value,
              order: index,
            })
            .onConflictDoNothing()
        );

        await Promise.all(videoInserts);

        return updated;
      });

      return {
        status: "success",
        message: `Playlist ${updatedPlaylist.title} updated successfully.`,
      };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  deletePlaylist: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [deletedPlaylist] = await db.delete(playlists).where(eq(playlists.id, id)).returning();

      return {
        status: "success",
        message: `Playlist ${deletedPlaylist.title} deleted successfully.`,
      };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  getPlaylistWithAllVideos: async (playlistId) => {
    try {
      const db = useDatabaseStore.getState().db;

      const [playlist] = await db.select().from(playlists).where(eq(playlists.id, playlistId));

      const allVideos = await db.select({ value: videos.id, label: videos.title }).from(videos);

      const matchingPlaylistVideos = await db
        .select({
          videoId: playlistVideos.videoId,
        })
        .from(playlistVideos)
        .where(eq(playlistVideos.playlistId, playlistId));

      const selectedVideoIds = new Set(matchingPlaylistVideos.map((pv) => pv.videoId));

      const selectedVideos = allVideos.filter((video) => selectedVideoIds.has(video.value));

      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        allVideos,
        selectedVideos,
      };
    } catch (_error) {
      return {
        status: "error",
        message: "Playlist not found",
        id: "",
        title: "",
        description: "",
        allVideos: [],
        selectedVideos: [],
      };
    }
  },
  toggleVideoInPlaylist: async ({ playlistId, videoId }) => {
    try {
      const db = useDatabaseStore.getState().db;

      const [relatedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(and(eq(playlistVideos.videoId, videoId), eq(playlistVideos.playlistId, playlistId)))
        .returning();

      if (!relatedPlaylistVideo) {
        await db.insert(playlistVideos).values({ playlistId, videoId });
        return { status: "success", isAdded: true, message: "Video added to playlist." };
      }

      return { status: "success", isAdded: false, message: "Video removed from playlist." };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  removeVideoFromPlaylist: async ({ playlistId, videoId }) => {
    try {
      const db = useDatabaseStore.getState().db;
      await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.videoId, videoId),
            ...(playlistId ? [eq(playlistVideos.playlistId, playlistId)] : [])
          )
        );

      return { status: "success", message: "Video removed from playlist successfully." };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  updatePlaylistOrder: async ({ playlistId, videosOrder }) => {
    try {
      const db = useDatabaseStore.getState().db;
      await db.transaction(async (tx) => {
        await Promise.all(
          videosOrder.map(async (video, index) => {
            await tx
              .update(playlistVideos)
              .set({ order: index })
              .where(
                and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, video.id))
              );
          })
        );
      });
      return { status: "success", message: "Playlist order updated successfully." };
    } catch (error) {
      return { status: "error", message: errorHandler(error) };
    }
  },
  syncVideoPlaylists: async (videoId: string, playlists: { id: string }[]) => {
    const db = useDatabaseStore.getState().db;

    const current = await db.query.playlistVideos.findMany({
      where: eq(playlistVideos.videoId, videoId),
      columns: { playlistId: true },
    });

    const currentIds = new Set(current.map((pv) => pv.playlistId));
    const targetIds = new Set(playlists.map((p) => p.id));

    const toAdd = [...targetIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !targetIds.has(id));

    if (toAdd.length > 0) {
      await db
        .insert(playlistVideos)
        .values(
          toAdd.map((id) => ({
            playlistId: id,
            videoId,
          }))
        )
        .onConflictDoNothing();
    }

    if (toRemove.length > 0) {
      await db
        .delete(playlistVideos)
        .where(
          and(eq(playlistVideos.videoId, videoId), inArray(playlistVideos.playlistId, toRemove))
        );
    }
  },
}));
