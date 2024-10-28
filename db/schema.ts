import { createId } from "@paralleldrive/cuid2";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const videos = sqliteTable("videos", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").default("Untitled").notNull(),
  fileUri: text("fileUri").notNull(),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const VideoSchema = createSelectSchema(videos);
export type Video = z.infer<typeof VideoSchema>;
