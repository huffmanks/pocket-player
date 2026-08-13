import { Directory, File, Paths } from "expo-file-system";

import { VIDEOS_DIR } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";

const VIDEO_EXTENSIONS = new Set(["mp4", "m4v", "mov", "avi", "mkdir", "webm", "mkv"]);

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "heic", "svg"]);

export type FileType = "video" | "image" | "other";

export type FileItem = {
  uri: string;
  directoryPath: string;
  fullName: string;
  nameWithoutExtension: string;
  extension: string;
  size: number;
  type: FileType;
};

function getFileType(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  return "other";
}

function parseFilePath(uri: string) {
  if (!uri) {
    return { directoryPath: "", fullName: "", nameWithoutExtension: "", extension: "" };
  }

  const cleanUri = uri.endsWith("/") ? uri.slice(0, -1) : uri;

  const lastSlashIndex = cleanUri.lastIndexOf("/");

  if (lastSlashIndex === -1) {
    const extIndex = cleanUri.lastIndexOf(".");
    const hasExt = extIndex > 0;
    return {
      directoryPath: "",
      fullName: cleanUri,
      nameWithoutExtension: hasExt ? cleanUri.slice(0, extIndex) : cleanUri,
      extension: hasExt ? cleanUri.slice(extIndex + 1).toLowerCase() : "",
    };
  }

  const directoryPath = cleanUri.slice(0, lastSlashIndex);
  const fullName = cleanUri.slice(lastSlashIndex + 1);

  const dotIndex = fullName.lastIndexOf(".");
  const hasExtension = dotIndex > 0;

  const nameWithoutExtension = hasExtension ? fullName.slice(0, dotIndex) : fullName;

  const extension = hasExtension ? fullName.slice(dotIndex + 1).toLowerCase() : "";

  return {
    directoryPath,
    fullName,
    nameWithoutExtension,
    extension,
  };
}

async function scanDirectoryForMedia(dir: Directory): Promise<FileItem[]> {
  const items: FileItem[] = [];

  try {
    const entries = dir.list();

    for (const entry of entries) {
      const isDirectory =
        entry instanceof Directory ||
        entry.constructor?.name === "Directory" ||
        ("uri" in entry && entry.uri.endsWith("/"));

      if (isDirectory) {
        const subDir = new Directory(entry.uri);
        const subItems = await scanDirectoryForMedia(subDir);
        items.push(...subItems);
      } else {
        const { directoryPath, extension, fullName, nameWithoutExtension } = parseFilePath(
          entry.uri
        );
        items.push({
          uri: entry.uri,
          directoryPath,
          fullName,
          nameWithoutExtension,
          extension,
          size: entry.size ?? 0,
          type: getFileType(entry.name),
        });
      }
    }
  } catch (_error) {}

  return items;
}

export function cleanupCacheFile(uri: string) {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (_error) {}
}

export async function getAllAppFiles(): Promise<{
  videoFiles: FileItem[];
  imageFiles: FileItem[];
  videoTotalSize: string;
  imageTotalSize: string;
  totalSize: string;
}> {
  if (!VIDEOS_DIR.exists) {
    return {
      videoFiles: [],
      imageFiles: [],
      videoTotalSize: "",
      imageTotalSize: "",
      totalSize: "",
    };
  }
  const documentDir = new Directory(Paths.document);
  const mediaFiles = await scanDirectoryForMedia(documentDir);

  const videoFiles = mediaFiles.filter((item) => item.type === "video");
  const imageFiles = mediaFiles.filter((item) => item.type === "image");

  const videoTotalBytes = videoFiles.reduce((acc, f) => acc + f.size, 0);
  const imageTotalBytes = imageFiles.reduce((acc, f) => acc + f.size, 0);

  return {
    videoFiles,
    imageFiles,
    videoTotalSize: formatFileSize(videoTotalBytes),
    imageTotalSize: formatFileSize(imageTotalBytes),
    totalSize: formatFileSize(videoTotalBytes + imageTotalBytes),
  };
}
