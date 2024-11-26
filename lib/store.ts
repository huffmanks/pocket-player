import { and, eq, notInArray } from "drizzle-orm";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { EditPlaylistInfo } from "@/app/(modals)/playlists/edit/[id]";
import { db as drizzleDb } from "@/db/drizzle";
import { VideoMeta, playlistVideos, playlists, videos } from "@/db/schema";

import { CreatePlaylistFormData } from "@/components/forms/create-playlist";
import { UploadVideosFormData } from "@/components/forms/upload-video";
import { VideoMetaForPlaylist } from "@/components/playlist-sortable";

import { LOCK_INTERVAL_DEFAULT } from "./constants";

const settingsStorage = new MMKV({ id: "settings" });
const securityStorage = new MMKV({ id: "security", encryptionKey: "your-encryption-key" });

const settingsZustandStorage: StateStorage = {
  setItem: (key, value) => settingsStorage.set(key, value),
  getItem: (key) => settingsStorage.getString(key) ?? null,
  removeItem: (key) => settingsStorage.delete(key),
};

const securityZustandStorage: StateStorage = {
  setItem: (key, value) => securityStorage.set(key, value),
  getItem: (key) => securityStorage.getString(key) ?? null,
  removeItem: (key) => securityStorage.delete(key),
};

type DatabaseStore = {
  db: typeof drizzleDb;
};

export const useDatabaseStore = create<DatabaseStore>((set) => ({
  db: drizzleDb,
}));

type AppStoreState = {
  appLoadedOnce: boolean;
  setAppLoadedOnce: (bool: boolean) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  appLoadedOnce: false,
  setAppLoadedOnce: (bool) => set({ appLoadedOnce: bool }),
}));

type VideoStoreState = {
  videos: VideoMeta[];
  uploadVideos: (
    values: UploadVideosFormData
  ) => Promise<{ status: "success" | "error"; message: string }>;
  updateVideo: ({
    id,
    values,
  }: {
    id: string;
    values: Partial<VideoMeta>;
  }) => Promise<{ status: "success" | "error"; message: string }>;
  deleteVideo: (id: string) => Promise<{ status: "success" | "error"; message: string }>;
  toggleFavorite: (id: string) => Promise<{ status: "success" | "error"; message: string }>;
};

export const useVideoStore = create<VideoStoreState>((set) => ({
  videos: [],
  uploadVideos: async (values) => {
    try {
      const db = useDatabaseStore.getState().db;

      await db.transaction(async (tx) => {
        for (const video of values.videos) {
          await tx.insert(videos).values({
            title: video.title,
            videoUri: video.videoUri,
            thumbUri: video.thumbUri,
            duration: video.duration,
            fileSize: video.fileSize,
            orientation: video.orientation,
          });
        }
      });

      const newVideos = await db.select().from(videos);

      set(() => ({
        videos: newVideos,
      }));

      return { status: "success", message: "Videos successfully uploaded." };
    } catch (error) {
      console.error("Error creating video: ", error);
      return { status: "error", message: "Failed to create video." };
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
      set((state) => ({
        videos: state.videos.map((v) => (updatedVideo.id === id ? { ...v, ...updatedVideo } : v)),
      }));
      return { status: "success", message: `Video ${updatedVideo.title} successfully updated.` };
    } catch (error) {
      console.error("Error updating video: ", error);
      return { status: "error", message: "Failed to update video." };
    }
  },
  deleteVideo: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [deletedVideo] = await db.delete(videos).where(eq(videos.id, id)).returning();
      set((state) => ({ videos: state.videos.filter((v) => deletedVideo.id !== id) }));
      return { status: "success", message: `Video ${deletedVideo.title} successfully deleted.` };
    } catch (error) {
      console.error("Error deleting video: ", error);
      return { status: "error", message: "Failed to delete video." };
    }
  },
  toggleFavorite: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      const updatedFavoriteStatus = !video.isFavorite;
      await db.update(videos).set({ isFavorite: updatedFavoriteStatus }).where(eq(videos.id, id));
      set((state) => ({
        videos: state.videos.map((v) =>
          video.id === id ? { ...v, isFavorite: updatedFavoriteStatus } : v
        ),
      }));
      return { status: "success", message: `Video ${video.title}'s favorite status toggled.` };
    } catch (error) {
      console.error("Error toggling favorite: ", error);
      return { status: "error", message: "Failed to toggle favorite video." };
    }
  },
}));

type PlaylistStoreState = {
  addPlaylist: (
    values: CreatePlaylistFormData
  ) => Promise<{ status: "success" | "error"; message: string }>;
  updatePlaylist: ({
    id,
    values,
  }: {
    id: string;
    values: EditPlaylistInfo;
  }) => Promise<{ status: "success" | "error"; message: string }>;
  deletePlaylist: (id: string) => Promise<{ status: "success" | "error"; message: string }>;
  getPlaylistWithAllVideos: (id: string) => Promise<EditPlaylistInfo>;
  addVideoToPlaylist: ({
    playlistId,
    videoId,
    order,
  }: {
    playlistId: string;
    videoId: string;
    order?: number;
  }) => Promise<{ status: "success" | "error"; message: string }>;
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
    videosOrder: VideoMetaForPlaylist[];
  }) => Promise<{ status: "success" | "error"; message: string }>;
};

export const usePlaylistStore = create<PlaylistStoreState>((set) => ({
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

        const videoInserts = values.videos
          .filter((video) => video.isSelected)
          .map((video, index) =>
            tx.insert(playlistVideos).values({
              playlistId: created.id,
              videoId: video.videoId,
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
      console.error("Error creating playlist: ", error);
      return { status: "error", message: "Failed to create playlist." };
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

        const selectedVideoIds = values.videos
          .filter((video) => video.isSelected)
          .map((video) => video.videoId);

        await tx
          .delete(playlistVideos)
          .where(
            and(
              eq(playlistVideos.playlistId, id),
              notInArray(playlistVideos.videoId, selectedVideoIds)
            )
          );

        const videoInserts = values.videos
          .filter((video) => video.isSelected)
          .map((video, index) =>
            tx
              .insert(playlistVideos)
              .values({
                playlistId: updated.id,
                videoId: video.videoId,
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
      console.error("Error updating playlist: ", error);
      return { status: "error", message: "Failed to update playlist." };
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
      console.error("Error deleting playlist: ", error);
      return { status: "error", message: "Failed to delete playlist." };
    }
  },
  getPlaylistWithAllVideos: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;

      const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));

      const allVideos = await db.select().from(videos);

      const matchingPlaylistVideos = await db
        .select({
          videoId: playlistVideos.videoId,
        })
        .from(playlistVideos)
        .where(eq(playlistVideos.playlistId, id));

      const selectedVideoIds = new Set(matchingPlaylistVideos.map((pv) => pv.videoId));

      const transformedVideos = allVideos.map((video) => ({
        videoId: video.id,
        title: video.title,
        isSelected: selectedVideoIds.has(video.id),
      }));

      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        videos: transformedVideos,
      };
    } catch (error) {
      console.error("Error getting playlist and videos: ", error);
      return {
        status: "error",
        message: "Playlist not found",
        id: "",
        title: "",
        description: "",
        videos: [],
      };
    }
  },
  addVideoToPlaylist: async ({ playlistId, videoId, order = 1 }) => {
    try {
      const db = useDatabaseStore.getState().db;
      await db.insert(playlistVideos).values({ playlistId, videoId, order });

      return { status: "success", message: "Video added to playlist successfully." };
    } catch (error) {
      console.error("Error adding video to playlist: ", error);
      return { status: "error", message: "Failed to add video to playlist." };
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
      console.error("Error removing video from playlist: ", error);
      return { status: "error", message: "Failed to remove video from playlist." };
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
      console.error("Error updating playlist order: ", error);
      return { status: "error", message: "Failed to update playlist order." };
    }
  },
}));

type SettingsStoreState = {
  autoPlay: boolean;
  loop: boolean;
  mute: boolean;
  theme: "light" | "dark";
  setAutoPlay: (autoPlay: boolean) => void;
  setLoop: (loop: boolean) => void;
  setMute: (mute: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      autoPlay: false,
      loop: false,
      mute: false,
      theme: "dark",
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setLoop: (loop) => set({ loop }),
      setMute: (mute) => set({ mute }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => settingsZustandStorage),
    }
  )
);

type SecurityStoreState = {
  backgroundTime: number | null;
  isLocked: boolean;
  enablePasscode: boolean;
  passcode: string | null;
  isLockable: boolean;
  lockInterval: number;
  isLockDisabled: boolean;
  setBackgroundTime: () => void;
  setPasscode: (code: string | null) => void;
  setIsLocked: (lock: boolean) => void;
  setEnablePasscode: (enable: boolean) => void;
  setLockInterval: (milliseconds: number) => void;
  setIsLockDisabled: (bool: boolean) => void;
};

export const useSecurityStore = create<SecurityStoreState>()(
  persist(
    (set) => ({
      backgroundTime: null,
      isLocked: false,
      enablePasscode: false,
      passcode: null,
      isLockable: false,
      lockInterval: LOCK_INTERVAL_DEFAULT,
      isLockDisabled: false,
      setBackgroundTime: () => set({ backgroundTime: Date.now() }),
      setPasscode: (code) =>
        set(() => {
          return { passcode: code, isLockable: true, enablePasscode: true };
        }),
      setIsLocked: (lock) => set({ isLocked: lock }),
      setEnablePasscode: (enable) =>
        set((state) => {
          const isLockable = enable && state.passcode !== null;
          return {
            enablePasscode: enable,
            isLockable,
            passcode: isLockable ? state.passcode : null,
          };
        }),
      setLockInterval: (milliseconds) => set({ lockInterval: milliseconds }),
      setIsLockDisabled: (bool) => set({ isLockDisabled: bool }),
    }),
    {
      name: "security-store",
      storage: createJSONStorage(() => securityZustandStorage),
    }
  )
);
