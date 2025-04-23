import * as FileSystem from "expo-file-system";

import { VIDEOS_DIR } from "@/lib/constants";

export async function listAllFiles() {
  const videoFiles = await listFilesRecursive(VIDEOS_DIR);
  const cacheFiles = await listFilesRecursive(FileSystem?.cacheDirectory || "");
  return [...videoFiles, ...cacheFiles];
}

const listFilesRecursive = async (dir: string): Promise<string[]> => {
  try {
    const files: string[] = [];
    const entries = await FileSystem.readDirectoryAsync(dir);
    for (const entry of entries) {
      const fullPath = dir + entry;
      const info = await FileSystem.getInfoAsync(fullPath);
      if (info.isDirectory) {
        files.push(...(await listFilesRecursive(fullPath + "/")));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  } catch {
    return [];
  }
};
