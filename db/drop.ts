import * as FileSystem from "expo-file-system";

import { playlists, videos } from "@/db/schema";
import { useDatabaseStore } from "@/lib/store";

export async function resetTables() {
  try {
    const db = useDatabaseStore.getState().db;

    await db.delete(videos).returning();
    await db.delete(playlists).returning();

    return { message: "Videos deleted from the database successfully.", type: "success" };
  } catch (error) {
    return { message: "Failed to delete videos from the database.", type: "error" };
  }
}

export async function clearDirectory(directoryUri: string) {
  try {
    if (!directoryUri) throw new Error("Invalid directoryUri");

    const normalizedUri = directoryUri.replace(/\/$/, "");
    await FileSystem.deleteAsync(normalizedUri, { idempotent: true });

    return { message: "Directory cleared successfully.", type: "success" };
  } catch {
    return { message: "Failed to clear directory.", type: "error" };
  }
}
