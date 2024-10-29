import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

import { VideoMeta, videos } from "./schema";

export const getVideos = async (db: SQLJsDatabase | ExpoSQLiteDatabase): Promise<VideoMeta[]> => {
  return db.select().from(videos).all();
};
