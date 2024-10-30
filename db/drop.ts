import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

import { DB_TABLES, VIDEOS_DIR } from "@/lib/constants";

import { db } from "./drizzle";

function resetTable(tables: string[]) {
  try {
    for (const table of tables) {
      db.$client.execSync(`DROP TABLE IF EXISTS ${table};`);
    }
    console.log("Tables dropped successfully.");
  } catch (error) {
    console.error("Failed to drop tables:", error);
  }
}

async function clearDirectory(directoryUri: string) {
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

export async function drop() {
  if (Platform.OS === "android") {
    resetTable(DB_TABLES);
    await clearDirectory(VIDEOS_DIR);
  }
}
