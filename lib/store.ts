import { and, eq, notInArray } from "drizzle-orm";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { EditPlaylistInfo } from "@/app/(modals)/playlists/edit/[id]";
import { db as drizzleDb } from "@/db/drizzle";
import { VideoMeta, playlistVideos, playlists, videos } from "@/db/schema";
import { LOCK_INTERVAL_DEFAULT } from "@/lib/constants";

import { CreatePlaylistFormData } from "@/components/forms/create-playlist";
import { EditPlaylistFormData } from "@/components/forms/edit-playlist";
import { UploadVideosFormData } from "@/components/forms/upload-video";

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
  isAppReady: boolean;
  setAppLoadedOnce: (bool: boolean) => void;
  setIsAppReady: (bool: boolean) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  appLoadedOnce: false,
  isAppReady: false,
  setAppLoadedOnce: (bool) => set({ appLoadedOnce: bool }),
  setIsAppReady: (bool) => set({ isAppReady: bool }),
}));

type VideoStoreState = {
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
  toggleFavorite: (id: string) => Promise<{ status: "success" | "error"; message: string }>;
};

export const useVideoStore = create<VideoStoreState>((set) => ({
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

      return { status: "success", message: `Video ${updatedVideo.title} successfully updated.` };
    } catch (error) {
      return { status: "error", message: "Failed to update video." };
    }
  },
  deleteVideo: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [deletedVideo] = await db.delete(videos).where(eq(videos.id, id)).returning();

      return { status: "success", message: `Video ${deletedVideo.title} successfully deleted.` };
    } catch (error) {
      return { status: "error", message: "Failed to delete video." };
    }
  },
  toggleFavorite: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;
      const [video] = await db.select().from(videos).where(eq(videos.id, id));
      const updatedFavoriteStatus = !video.isFavorite;
      await db.update(videos).set({ isFavorite: updatedFavoriteStatus }).where(eq(videos.id, id));

      return { status: "success", message: `Video ${video.title}'s favorite status toggled.` };
    } catch (error) {
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
    values: EditPlaylistFormData;
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
    videosOrder: VideoMeta[];
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
      return { status: "error", message: "Failed to delete playlist." };
    }
  },
  getPlaylistWithAllVideos: async (id) => {
    try {
      const db = useDatabaseStore.getState().db;

      const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));

      const allVideos = await db.select({ value: videos.id, label: videos.title }).from(videos);

      const matchingPlaylistVideos = await db
        .select({
          videoId: playlistVideos.videoId,
        })
        .from(playlistVideos)
        .where(eq(playlistVideos.playlistId, id));

      const selectedVideoIds = new Set(matchingPlaylistVideos.map((pv) => pv.videoId));

      const selectedVideos = allVideos.filter((video) => selectedVideoIds.has(video.value));

      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        allVideos,
        selectedVideos,
      };
    } catch (error) {
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
  addVideoToPlaylist: async ({ playlistId, videoId, order = 1 }) => {
    try {
      const db = useDatabaseStore.getState().db;
      await db.insert(playlistVideos).values({ playlistId, videoId, order });

      return { status: "success", message: "Video added to playlist successfully." };
    } catch (error) {
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
      return { status: "error", message: "Failed to update playlist order." };
    }
  },
}));

type SettingsStoreState = {
  autoPlay: boolean;
  loop: boolean;
  mute: boolean;
  isNativeControls: boolean;
  overrideOrientation: boolean;
  theme: "light" | "dark";
  sortKey: "date" | "title";
  sortDateOrder: "asc" | "desc";
  sortTitleOrder: "asc" | "desc";
  scrollPosition: number;
  previousPath: string | null;
  videoProgress: Record<string, number>;
  setAutoPlay: (autoPlay: boolean) => void;
  setLoop: (loop: boolean) => void;
  setMute: (mute: boolean) => void;
  setIsNativeControls: (isNativeControls: boolean) => void;
  setOverrideOrientation: (overrideOrientation: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSortKey: (key: "date" | "title") => void;
  toggleSortDateOrder: () => void;
  toggleSortTitleOrder: () => void;
  setScrollPosition: (position: number) => void;
  setPreviousPath: (path: string) => void;
  setVideoProgress: (videoId: string, time: number) => void;
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      autoPlay: false,
      loop: false,
      mute: false,
      isNativeControls: false,
      overrideOrientation: false,
      theme: "dark",
      sortKey: "date",
      sortDateOrder: "asc",
      sortTitleOrder: "asc",
      scrollPosition: 0,
      previousPath: null,
      videoProgress: {},
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setLoop: (loop) => set({ loop }),
      setMute: (mute) => set({ mute }),
      setIsNativeControls: (isNativeControls) => set({ isNativeControls }),
      setOverrideOrientation: (overrideOrientation) => set({ overrideOrientation }),
      setTheme: (theme) => set({ theme }),
      setSortKey: (key) => set({ sortKey: key }),
      toggleSortDateOrder: () =>
        set((state) => ({ sortDateOrder: state.sortDateOrder === "asc" ? "desc" : "asc" })),
      toggleSortTitleOrder: () =>
        set((state) => ({ sortTitleOrder: state.sortTitleOrder === "asc" ? "desc" : "asc" })),
      setScrollPosition: (position) => set({ scrollPosition: position }),
      setPreviousPath: (path) => set({ previousPath: path }),
      setVideoProgress: (videoId, time) =>
        set((state) => ({
          videoProgress: { ...state.videoProgress, [videoId]: time },
        })),
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

export function resetPersistedStorage() {
  settingsStorage.clearAll();
  useSettingsStore.persist.clearStorage();

  securityStorage.clearAll();
  useSecurityStore.persist.clearStorage();
}
