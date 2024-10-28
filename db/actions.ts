import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

import { Video, videos } from "./schema";

export const getVideos = async (db: SQLJsDatabase | ExpoSQLiteDatabase): Promise<Video[]> => {
  return db.select().from(videos).all();
};
