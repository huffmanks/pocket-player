import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const videos = sqliteTable("videos", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
  title: text("title").default("Untitled").notNull(),
  description: text("description").default("").notNull(),
  videoUri: text("videoUri").notNull(),
  thumbUri: text("thumbUri").notNull(),
  isFavorite: integer({ mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default(new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").default(new Date().toISOString()).notNull(),
});

export const VideoSchema = createSelectSchema(videos);
export type VideoMeta = z.infer<typeof VideoSchema>;

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

export const PlaylistSchema = createSelectSchema(playlists);
export type PlaylistMeta = z.infer<typeof PlaylistSchema>;

export const tags = sqliteTable("tags", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").unique().notNull(),
  createdAt: text("created_at").default(new Date().toISOString()).notNull(),
});

export const TagSchema = createSelectSchema(tags);
export type TagMeta = z.infer<typeof TagSchema>;

export const playlistVideos = sqliteTable("playlist_videos", {
  playlistId: text("playlist_id")
    .notNull()
    .references(() => playlists.id, { onDelete: "cascade" }),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
});

export const videoTags = sqliteTable("video_tags", {
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
  videoId: text("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
});
