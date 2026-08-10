import { Directory } from "expo-file-system";

import { playlists, videos } from "@/db/schema";
import { errorHandler } from "@/lib/error-handler";
import { useDatabaseStore } from "@/lib/store";

export async function resetTables() {
  try {
    const db = useDatabaseStore.getState().db;

    await db.delete(videos).returning();
    await db.delete(playlists).returning();

    return { message: "Videos deleted from the database successfully.", type: "success" };
  } catch (error) {
    const message = errorHandler(error);
    return { message, type: "error" };
  }
}

export async function clearDirectory(directory: Directory | string) {
  try {
    const dir = typeof directory === "string" ? new Directory(directory) : directory;

    if (dir.exists) {
      dir.delete();
      dir.create();
    }

    return { message: "Directory cleared successfully.", type: "success" };
  } catch (error) {
    const message = errorHandler(error);
    return { message, type: "error" };
  }
}
