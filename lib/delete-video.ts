import * as FileSystem from "expo-file-system";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

export async function favoriteVideo(videoId: string) {
  try {
    const [video] = await db
      .select({ id: videos.id, isFavorite: videos.isFavorite })
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video) return;
    await db.update(videos).set({ isFavorite: !video.isFavorite }).where(eq(videos.id, video.id));

    console.log("Favoriting video successful!", videoId);
  } catch (error) {
    console.log("Error favoriting video:", error);
  }
}

export async function deleteVideo(videoId: string) {
  try {
    const [video] = await db
      .select({ videoUri: videos.videoUri, thumbUri: videos.thumbUri })
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video || !video.videoUri) return;

    // Delete video file
    const videoInfo = await FileSystem.getInfoAsync(video.videoUri);
    if (videoInfo.exists) await FileSystem.deleteAsync(video.videoUri);

    // Delete thumbnail file
    const thumbInfo = await FileSystem.getInfoAsync(video.thumbUri);
    if (thumbInfo.exists) await FileSystem.deleteAsync(video.thumbUri);

    // Delete database entry
    await db.delete(videos).where(eq(videos.id, videoId));
  } catch (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
}
