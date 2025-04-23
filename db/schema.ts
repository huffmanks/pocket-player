import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const videos = sqliteTable(
  "videos",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey()
      .notNull(),
    title: text("title").default("Untitled").notNull(),
    videoUri: text("video_uri").notNull(),
    thumbUri: text("thumb_uri").notNull(),
    thumbTimestamp: integer("thumb_timestamp", { mode: "number" }).default(3000).notNull(),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false).notNull(),
    fileExtension: text("file_extension").notNull(),
    fileSize: integer("file_size", { mode: "number" }).notNull(),
    fileSizeLabel: text("file_size_label").notNull(),
    duration: real("duration").notNull(),
    durationLabel: text("duration_label").notNull(),
    orientation: text("orientation").notNull(),
    width: integer("width", { mode: "number" }).notNull(),
    height: integer("height", { mode: "number" }).notNull(),
    resolution: text("resolution").notNull(),
    fps: integer("fps", { mode: "number" }).notNull(),
    hasAudio: integer("has_audio", { mode: "boolean" }).notNull(),
    videoCodec: text("video_codec"),
    audioCodec: text("audio_codec"),
    createdAt: text("created_at").default(new Date().toISOString()).notNull(),
    updatedAt: text("updated_at").default(new Date().toISOString()).notNull(),
  },
  (t) => ({
    thumbUriIdx: index("videos_thumb_uri_idx").on(t.thumbUri),
  })
);

export const playlists = sqliteTable("playlists", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
  title: text("title").unique().notNull(),
  description: text("description").default("").notNull(),
  createdAt: text("created_at").default(new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").default(new Date().toISOString()).notNull(),
});

export const playlistVideos = sqliteTable(
  "playlist_videos",
  {
    playlistId: text("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    order: integer("order").default(1).notNull(),
  },
  (t) => ({
    uniquePlaylistVideo: unique().on(t.playlistId, t.videoId),
    playlistIdIdx: index("playlist_videos_playlist_id_idx").on(t.playlistId),
    videoIdIdx: index("playlist_videos_video_id_idx").on(t.videoId),
  })
);

export const VideoSchema = createSelectSchema(videos);
export type VideoMeta = z.infer<typeof VideoSchema>;
export const PlaylistSchema = createSelectSchema(playlists);
export type PlaylistMeta = z.infer<typeof PlaylistSchema>;
export const PlaylistVideosSchema = createSelectSchema(playlistVideos);
export type PlaylistVideosMeta = z.infer<typeof PlaylistVideosSchema>;

export const videosRelations = relations(videos, ({ many }) => ({
  playlists: many(playlistVideos),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  videos: many(playlistVideos),
}));

export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));
