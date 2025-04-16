import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const videos = sqliteTable("videos", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
  title: text("title").default("Untitled").notNull(),
  videoUri: text("videoUri").notNull(),
  thumbUri: text("thumbUri").notNull(),
  thumbTimestamp: integer("thumbTimestamp", { mode: "number" }).default(1000).notNull(),
  isFavorite: integer("isFavorite", { mode: "boolean" }).default(false).notNull(),
  duration: text("duration").notNull(),
  fileSize: text("fileSize").notNull(),
  orientation: text("orientation").notNull(),
  createdAt: text("created_at").default(new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").default(new Date().toISOString()).notNull(),
});

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
