import * as FileSystem from "expo-file-system";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

export async function favoriteVideo(videoId: string) {
  try {
    await db.update(videos).set({ isFavorite: true }).where(eq(videos.id, videoId));

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

    if (!video || !video.videoUri) {
      console.log("Video not found in the database");
      return;
    }

    const videoInfo = await FileSystem.getInfoAsync(video.videoUri);
    if (videoInfo.exists) {
      await FileSystem.deleteAsync(video.videoUri);
      console.log("Video deleted successfully:", video.videoUri);
    } else {
      console.log("Video not found:", video.videoUri);
    }

    const thumbInfo = await FileSystem.getInfoAsync(video.thumbUri);
    if (thumbInfo.exists) {
      await FileSystem.deleteAsync(video.thumbUri);
      console.log("Thumb deleted successfully:", video.thumbUri);
    } else {
      console.log("Thumb not found:", video.thumbUri);
    }

    await db.delete(videos).where(eq(videos.id, videoId));
    console.log("Database entry deleted successfully:", videoId);
  } catch (error) {
    console.log("Error deleting video:", error);
  }
}
