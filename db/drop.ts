import * as FileSystem from "expo-file-system";

import { db } from "./drizzle";
import { videos } from "./schema";

export async function resetTable() {
  try {
    await db.delete(videos);

    console.log("Tables dropped successfully.");
  } catch (error) {
    console.error("Failed to drop tables:", error);
  }
}

export async function clearDirectory(directoryUri: string) {
  try {
    const files = await FileSystem.readDirectoryAsync(directoryUri);
    for (const file of files) {
      const fileUri = `${directoryUri}/${file}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
    console.log("Directory cleared successfully.");
  } catch (error) {
    console.error(`Failed to clear directory ${directoryUri}:`, error);
  }
}
