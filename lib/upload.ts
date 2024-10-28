import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export async function ensureDirectory(directory: string) {
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(directory);
}

export async function requestPermissions() {
  const mediaPermissions = await MediaLibrary.requestPermissionsAsync();
  return mediaPermissions.granted;
}
