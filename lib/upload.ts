import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export async function ensureDirectory(directory: string, isCreateDir?: boolean) {
  try {
    const dirInfo = await FileSystem.getInfoAsync(directory);

    if (!dirInfo.exists && isCreateDir) {
      await createDirectory(directory);
    }
    return {
      message: null,
      dirExists: dirInfo.exists,
      isError: false,
    };
  } catch (error) {
    return { message: "Failed to check the directory.", dirExists: null, isError: true };
  }
}

async function createDirectory(directory: string) {
  try {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

    return {
      message: "Successfully created directory.",
      isError: false,
    };
  } catch (error) {
    return { message: "Failed to create the directory.", isError: true };
  }
}

export async function requestPermissions() {
  try {
    const mediaPermissions = await MediaLibrary.requestPermissionsAsync();
    return mediaPermissions.granted;
  } catch (error) {
    return { message: "Failed to request permissions.", isError: true };
  }
}
