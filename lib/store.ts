import { and, count, eq, inArray, notInArray } from "drizzle-orm";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { EditPlaylistInfo } from "@/app/(screens)/playlists/[id]/edit";
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
  isAppStartUp: boolean;
  isAppReady: boolean;
  setIsAppStartUp: (bool: boolean) => void;
  setIsAppReady: (bool: boolean) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isAppStartUp: false,
  isAppReady: false,
  setIsAppStartUp: (bool) => set({ isAppStartUp: bool }),
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
  toggleFavorite: (
    id: string
  ) => Promise<{ status: "success" | "error"; isFavorite?: boolean; message: string }>;
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

      const [allVideos] = await db.select({ count: count() }).from(videos);

      if (allVideos.count === 0) {
        await db.delete(playlists);
      }

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

      return {
        status: "success",
        isFavorite: updatedFavoriteStatus,
        message: `Video ${video.title} has been ${updatedFavoriteStatus === true ? "favorited" : "unfavorited"}.`,
      };
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
      const message =
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed: playlists.title")
          ? "Playlist title already exists."
          : "Failed to create playlist.";

      return { status: "error", message };
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
      return { status: "error", message: "Failed to update playlist." };
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
  lastVisitedPath: string;
  previousVisitedPath: string;
  videoProgress: Record<string, number>;
};

type SettingsStoreActions = {
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
  setLastVisitedPath: (path: string) => void;
  setVideoProgress: (videoId: string, time: number) => void;
  reset: () => void;
};

const initialSettingsStoreState: SettingsStoreState = {
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
  lastVisitedPath: "/",
  previousVisitedPath: "/",
  videoProgress: {},
};

export const useSettingsStore = create<SettingsStoreState & SettingsStoreActions>()(
  persist(
    (set) => ({
      ...initialSettingsStoreState,
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
      setLastVisitedPath: (path) =>
        set((state) => {
          if (state.lastVisitedPath === path) return {};
          return {
            previousVisitedPath: state.lastVisitedPath,
            lastVisitedPath: path,
          };
        }),
      setVideoProgress: (videoId, time) =>
        set((state) => ({
          videoProgress: { ...state.videoProgress, [videoId]: time },
        })),
      reset: () => set(initialSettingsStoreState),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => settingsZustandStorage),
    }
  )
);

type SecurityStoreState = {
  isLocked: boolean;
  enablePasscode: boolean;
  passcode: string | null;
  isLockable: boolean;
  lockInterval: number;
  isLockDisabled: boolean;
};

type SecurityStoreActions = {
  setPasscode: (code: string | null) => void;
  setIsLocked: (lock: boolean) => void;
  setEnablePasscode: (enable: boolean) => void;
  setLockInterval: (milliseconds: number) => void;
  setIsLockDisabled: (bool: boolean) => void;
  reset: () => void;
};

const initialSecurityStoreState: SecurityStoreState = {
  isLocked: false,
  enablePasscode: false,
  passcode: null,
  isLockable: false,
  lockInterval: LOCK_INTERVAL_DEFAULT,
  isLockDisabled: false,
};

export const useSecurityStore = create<SecurityStoreState & SecurityStoreActions>()(
  persist(
    (set) => ({
      ...initialSecurityStoreState,
      setPasscode: (code) =>
        set(() => {
          return { passcode: code, isLockable: true, enablePasscode: true };
        }),
      setIsLocked: (lock) => set({ isLocked: lock }),
      setEnablePasscode: (enable) =>
        set((state) => {
          if (!enable) {
            return {
              enablePasscode: false,
              isLockable: false,
              passcode: null,
            };
          }

          return {
            enablePasscode: true,
            isLockable: state.passcode !== null,
          };
        }),
      setLockInterval: (milliseconds) => set({ lockInterval: milliseconds }),
      setIsLockDisabled: (bool) => set({ isLockDisabled: bool }),
      reset: () => set(initialSecurityStoreState),
    }),
    {
      name: "security-store",
      storage: createJSONStorage(() => securityZustandStorage),
    }
  )
);

export function resetPersistedStorage() {
  useSettingsStore.persist.clearStorage();
  useSecurityStore.persist.clearStorage();

  useSettingsStore.getState().reset();
  useSecurityStore.getState().reset();

  settingsStorage.clearAll();
  securityStorage.clearAll();
}
